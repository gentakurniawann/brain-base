import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { HashingService } from '../hashing/hashing.service';
import { AnswerDto } from '../dto/answer.dto';
import { publish } from '../sse/sse.controller';
import { SignerService } from '../chain/signer.service';

@Injectable()
export class AnswersService {
  constructor(
    private prisma: PrismaService,
    private ipfs: IpfsService,
    private hashing: HashingService,
    private signerService: SignerService,
  ) {}

  async create(qId: number, userId: number, dto: AnswerDto) {
    if (!qId || isNaN(qId))
      throw new BadRequestException('Invalid question ID.');
    if (!userId || isNaN(userId))
      throw new BadRequestException('Invalid user ID.');
    if (!dto?.bodyMd?.trim())
      throw new BadRequestException('Answer body cannot be empty.');

    const question = await this.prisma.question.findUnique({
      where: { id: qId },
      select: { id: true, authorId: true, status: true, chainQId: true },
    });
    if (!question) throw new NotFoundException('Question not found.');
    if (question.authorId === userId)
      throw new ForbiddenException('You cannot answer your own question.');
    if (question.status !== 'Open')
      throw new BadRequestException('You can only answer open questions.');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryWallet: true },
    });
    if (!user?.primaryWallet)
      throw new BadRequestException('User wallet address not found.');

    const contentHash = this.hashing.computeContentHash(dto.bodyMd);
    const pinned = await this.ipfs.pinJson({
      questionId: qId,
      bodyMd: dto.bodyMd,
      files: dto.files || [],
    });

    const answer = await this.prisma.answer.create({
      data: {
        questionId: qId,
        authorId: userId,
        bodyMd: dto.bodyMd,
        ipfsCid: pinned.cid,
        contentHash,
      },
    });

    if (!question.chainQId)
      throw new BadRequestException(
        'No on-chain question ID found for this question.',
      );

    try {
      const uri = `ipfs://${pinned.cid}`;
      const { tx, receipt, chainAId } =
        await this.signerService.answerQuestionOnBehalf(
          user.primaryWallet,
          question.chainQId,
          uri,
        );

      await this.prisma.answer.update({
        where: { id: answer.id },
        data: { chainAId: chainAId ?? null },
      });
      publish('answer:created', { id: answer.id, questionId: qId });

      return {
        success: true,
        message: 'Answer created successfully and synced to blockchain.',
        data: {
          id: answer.id,
          questionId: qId,
          chainAId,
          txHash: tx.hash,
          ipfsCid: pinned.cid,
        },
      };
    } catch (error) {
      console.error('❌ Failed to post answer on-chain:', error);
      throw new BadRequestException('Failed to sync answer to blockchain');
    }
  }

  async update(answerId: number, userId: number, dto: AnswerDto) {
    if (!answerId || isNaN(answerId))
      throw new BadRequestException('Invalid answer ID.');
    if (!userId || isNaN(userId))
      throw new BadRequestException('Invalid user ID.');
    if (!dto?.bodyMd?.trim())
      throw new BadRequestException('Answer body cannot be empty.');

    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          select: { id: true, status: true },
        },
      },
    });

    if (!answer) throw new NotFoundException('Answer not found.');
    if (answer.authorId !== userId)
      throw new ForbiddenException('You can only edit your own answers.');
    if (answer.question.status !== 'Open')
      throw new BadRequestException(
        'You can only edit answers for open questions.',
      );
    if (answer.isBest)
      throw new ForbiddenException(
        'You cannot edit an answer that has been marked as best.',
      );

    const contentHash = this.hashing.computeContentHash(dto.bodyMd);
    const pinned = await this.ipfs.pinJson({
      questionId: answer.questionId,
      bodyMd: dto.bodyMd,
      files: dto.files || [],
    });

    const updatedAnswer = await this.prisma.answer.update({
      where: { id: answerId },
      data: {
        bodyMd: dto.bodyMd,
        ipfsCid: pinned.cid,
        contentHash,
      },
      include: {
        author: { select: { id: true, name: true, primaryWallet: true } },
      },
    });

    publish('answer:updated', { id: answerId, questionId: answer.questionId });

    return {
      success: true,
      message: 'Answer updated successfully.',
      data: updatedAnswer,
    };
  }

  async delete(answerId: number, userId: number) {
    if (!answerId || isNaN(answerId))
      throw new BadRequestException('Invalid answer ID.');
    if (!userId || isNaN(userId))
      throw new BadRequestException('Invalid user ID.');

    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          select: { id: true, status: true },
        },
      },
    });

    if (!answer) throw new NotFoundException('Answer not found.');
    if (answer.authorId !== userId)
      throw new ForbiddenException('You can only delete your own answers.');
    if (answer.isBest)
      throw new ForbiddenException(
        'You cannot delete an answer that has been marked as best.',
      );

    await this.prisma.answer.delete({
      where: { id: answerId },
    });
    publish('answer:deleted', { id: answerId, questionId: answer.questionId });

    return {
      success: true,
      message: 'Answer deleted successfully.',
      data: {
        id: answerId,
        questionId: answer.questionId,
      },
    };
  }
}
