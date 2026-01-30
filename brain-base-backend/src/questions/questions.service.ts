import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { HashingService } from '../hashing/hashing.service';
import { publish } from '../sse/sse.controller';
import { ChainReadService } from 'src/chain/chain-read.service';
import { SignerService } from 'src/chain/signer.service';
import { ethers } from 'ethers';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { LedgerService } from 'src/ledger/ledger.service';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private ipfs: IpfsService,
    private hashing: HashingService,
    private chainRead: ChainReadService,
    private signerService: SignerService,
    private ledgerService: LedgerService,
  ) {}

  async create(
    user: { id: number; walletAddress: string },
    dto: {
      title: string;
      bodyMd: string;
      bounty?: number;
      files?: any[];
    },
  ) {
    const contentHash = this.hashing.computeContentHash(dto.bodyMd);
    const pinned = await this.ipfs.pinJson({
      title: dto.title,
      bodyMd: dto.bodyMd,
      files: dto.files || [],
    });

    const bountyEth = dto.bounty ?? 0;

    const MINIMUM_BOUNTY = 1;
    if (bountyEth > 0 && bountyEth < MINIMUM_BOUNTY) {
      throw new BadRequestException(
        `Minimum bounty is ${MINIMUM_BOUNTY} BRAIN. You provided ${bountyEth} BRAIN.`,
      );
    }

    const bountyWei = ethers.parseEther(bountyEth.toString());

    const question = await this.prisma.question.create({
      data: {
        authorId: user.id,
        title: dto.title,
        bodyMd: dto.bodyMd,
        ipfsCid: pinned.cid,
        contentHash,
        bountyAmountWei: '0',
      },
    });

    let txHash: string | undefined = undefined;
    let chainQId: number | null = null;

    if (bountyEth > 0) {
      const tokenAddress = this.signerService.brainTokenAddress;
      const deadlineSeconds = Math.floor(Date.now() / 1000) + 86400 * 7;
      const uri = `ipfs://${pinned.cid}`;

      try {
        const { tx, chainQId: emittedQId } =
          await this.signerService.askQuestionOnBehalf(
            user.walletAddress,
            tokenAddress,
            bountyWei,
            deadlineSeconds,
            uri,
          );
        txHash = tx.hash;
        chainQId = emittedQId ?? null;

        await this.ledgerService.addEntry({
          userId: user.id,
          questionId: question.id,
          kind: 'BountyEscrowed',
          amountWei: bountyWei.toString(),
          txHash,
          token: 'BRAIN',
        });
      } catch (error) {
        console.error('Error in askQuestionOnBehalf:', error);
        throw new BadRequestException(
          'Failed to create question on-chain. Make sure you have approved the contract to spend your BRAIN tokens.',
        );
      }
    }

    const updated = await this.prisma.question.update({
      where: { id: question.id },
      data: {
        txHash,
        chainQId,
        bountyAmountWei: bountyWei.toString(),
      },
    });

    publish('question:created', { id: updated.id });

    let bountyOnChain = '0';
    if (updated.chainQId != null) {
      try {
        bountyOnChain = (
          await this.chainRead.bountyOf(updated.chainQId)
        ).toString();
      } catch (error) {
        console.warn('Failed to read bounty from chain:', error);
      }
    }

    return { ...updated, bountyWei: bountyOnChain };
  }

  async getById(id: number, tokenUserId?: number) {
    const q = await this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          select: { id: true, authorId: true, isBest: true, contentHash: true },
        },
        author: {
          select: { id: true, name: true, primaryWallet: true },
        },
      },
    });
    if (!q) return null;

    const bestAId = q.answers.find((a) => a.isBest)?.id || 0;
    let bountyWei = '0';
    if (q.chainQId != null) {
      bountyWei = (await this.chainRead.bountyOf(q.chainQId)).toString();
    }

    return {
      ...q,
      bountyWei,
      bestAId,
      isAuthor: tokenUserId === q.authorId,
    };
  }

  async list(params?: {
    userId?: number;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    tokenUserId?: number;
  }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const where: any = {};

    if (params?.userId) {
      where.authorId = params.userId;
    }
    if (
      params?.status &&
      ['Open', 'Verified', 'Cancelled'].includes(params.status)
    ) {
      where.status = params.status;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { bodyMd: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, primaryWallet: true },
          },
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    const processedData = data.map((q) => ({
      ...q,
      isAuthor: params?.tokenUserId === q.authorId,
    }));

    return {
      data: processedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filter: params?.status ?? 'All',
        userScoped: !!params?.userId,
        search: params?.search ?? null,
      },
    };
  }

  listByMail(email?: string) {
    let where = {};

    if (email) {
      where = { authorEmail: email };
    }
    return this.prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateQuestionDto, userWallet?: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Question not found.');
    if (question.status !== 'Open')
      throw new BadRequestException('Only open questions can be edited.');

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.bodyMd !== undefined) updateData.bodyMd = dto.bodyMd;

    if (dto.bounty !== undefined) {
      const newBountyEth = parseFloat(dto.bounty);

      const MINIMUM_BOUNTY = 10;
      if (newBountyEth > 0 && newBountyEth < MINIMUM_BOUNTY) {
        throw new BadRequestException(
          `Minimum bounty is ${MINIMUM_BOUNTY} BRAIN. You provided ${newBountyEth} BRAIN.`,
        );
      }

      const newBountyWei = BigInt(Math.floor(newBountyEth * 1e18));
      const oldBountyWei = BigInt(question.bountyAmountWei || '0');

      if (newBountyWei > oldBountyWei) {
        const addWei = newBountyWei - oldBountyWei;
        if (!question.chainQId)
          throw new BadRequestException('Question not yet on-chain.');
        if (!userWallet)
          throw new BadRequestException(
            'User wallet required for increasing bounty.',
          );

        await this.signerService.addBountyOnBehalf(
          userWallet,
          Number(question.chainQId),
          addWei,
        );

        updateData.bountyAmountWei = newBountyWei.toString();
      } else if (newBountyWei < oldBountyWei) {
        if (!question.chainQId)
          throw new BadRequestException('Question not yet on-chain.');

        await this.signerService.reduceBounty(
          Number(question.chainQId),
          newBountyWei,
        );

        updateData.bountyAmountWei = newBountyWei.toString();
      }
    }

    const updated = await this.prisma.question.update({
      where: { id },
      data: updateData,
    });

    if (updated.chainQId != null) {
      try {
        const bountyOnChain = await this.signerService.contract.bountyOf(
          updated.chainQId,
        );
        updated.bountyAmountWei = bountyOnChain.toString();
      } catch (error) {
        console.warn(
          `Failed to fetch bounty for chainQId ${updated.chainQId}:`,
          error.message,
        );
      }
    }

    return updated;
  }

  async addBounty(id: number, addEth: number) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Question not found.');
    if (q.status !== 'Open')
      throw new BadRequestException('Question not open.');
    if (q.chainQId == null)
      throw new BadRequestException('On-chain question not found.');
    if (addEth <= 0) throw new BadRequestException('addEth must be > 0');

    const addWei = ethers.parseEther(addEth.toString());
    const receipt = await this.signerService.fundMore(q.chainQId, addWei);

    const newTotalWei = (BigInt(q.bountyAmountWei) + addWei).toString();
    await this.prisma.question.update({
      where: { id },
      data: { bountyAmountWei: newTotalWei },
    });

    await this.ledgerService.addEntry({
      userId: q.authorId,
      questionId: q.id,
      kind: 'BountyTopUp',
      amountWei: addWei.toString(),
      txHash: receipt.transactionHash,
    });

    return {
      success: true,
      txHash: receipt.transactionHash,
      bountyAmountWei: newTotalWei,
    };
  }

  async reduceBounty(id: number, reduceEth: number) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Question not found.');
    if (q.status !== 'Open')
      throw new BadRequestException('Question not open.');
    if (q.chainQId == null)
      throw new BadRequestException('On-chain question not found.');
    if (reduceEth <= 0) throw new BadRequestException('reduceEth must be > 0');

    const reduceWei = ethers.parseEther(reduceEth.toString());
    if (reduceWei > BigInt(q.bountyAmountWei)) {
      throw new BadRequestException('Cannot reduce below zero.');
    }

    const receipt = await this.signerService.reduceBounty(
      q.chainQId,
      reduceWei,
    );
    const newTotalWei = (BigInt(q.bountyAmountWei) - reduceWei).toString();
    await this.prisma.question.update({
      where: { id },
      data: { bountyAmountWei: newTotalWei },
    });

    await this.ledgerService.addEntry({
      userId: q.authorId,
      questionId: q.id,
      kind: 'BountyReduced',
      amountWei: reduceWei.toString(),
      txHash: receipt.transactionHash,
    });

    return {
      success: true,
      txHash: receipt.transactionHash,
      bountyAmountWei: newTotalWei,
    };
  }

  async delete(id: number) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Question not found.');

    if (q.status !== 'Open') {
      throw new BadRequestException('Only open questions can be deleted.');
    }

    let txHash: string | undefined = undefined;
    let refunded = false;

    if (q.chainQId != null && BigInt(q.bountyAmountWei) > 0n) {
      try {
        const receipt = await this.signerService.cancelQuestion(q.chainQId);
        txHash = receipt.transactionHash;
        refunded = true;

        await this.ledgerService.addEntry({
          userId: q.authorId,
          questionId: q.id,
          kind: 'BountyRefund',
          amountWei: q.bountyAmountWei,
          txHash,
        });
      } catch (error) {
        console.error('Failed to cancel on-chain:', error);
      }
    }

    const closed = await this.prisma.question.update({
      where: { id },
      data: {
        status: 'Cancelled',
        updatedAt: new Date(),
      },
    });

    publish('question:closed', { id: closed.id });

    const message = refunded
      ? 'Question deleted and bounty refunded successfully.'
      : 'Question deleted successfully.';

    return {
      message,
      txHash,
      status: closed.status,
      refunded,
    };
  }

  async approveAnswer(
    questionId: number,
    answerId: number,
    approverId: number,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { author: true },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (question.authorId !== approverId)
      throw new ForbiddenException(
        'Only the question author can approve an answer',
      );
    if (question.status === 'Verified')
      throw new BadRequestException('Question already verified');

    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: { author: { select: { primaryWallet: true, id: true } } },
    });

    if (!answer) throw new NotFoundException('Answer not found');
    if (answer.questionId !== questionId)
      throw new BadRequestException('Answer does not belong to this question');
    if (!answer.author.primaryWallet)
      throw new BadRequestException('Answer author has no connected wallet.');
    if (!question.chainQId || !answer.chainAId)
      throw new BadRequestException('No on-chain IDs found');

    const txReceipt = await this.signerService.rewardUser(
      question.chainQId,
      answer.chainAId,
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.answer.update({
        where: { id: answerId },
        data: { isBest: true },
      });

      await tx.question.update({
        where: { id: questionId },
        data: { status: 'Verified' },
      });

      await tx.ledger.create({
        data: {
          userId: answer.author.id,
          questionId: question.id,
          kind: 'BountyRelease',
          amountWei: question.bountyAmountWei,
          txHash: txReceipt.hash,
          token: 'BRAIN',
        },
      });

      return {
        success: true,
        message: 'Bounty released successfully',
        txHash: txReceipt.hash,
      };
    });
  }
}
