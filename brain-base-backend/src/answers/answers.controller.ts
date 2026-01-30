import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
  Req,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { HashingService } from '../hashing/hashing.service';
import { AnswerDto } from '../dto/answer.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { AnswersService } from './answers.service';

@Controller('answers')
export class AnswersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ipfs: IpfsService,
    private readonly hashing: HashingService,
    private readonly usersService: UsersService,
    private svc: AnswersService,
  ) {}

  @Post(':qId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('qId') qId: string,
    @Body() dto: AnswerDto,
    @Request() req,
  ) {
    const id = Number(qId);
    if (isNaN(id)) throw new BadRequestException('Invalid question ID');

    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('Invalid user.');

    return this.svc.create(id, userId, dto);
  }

  @Patch(':qId/:answerId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('qId') qId: string,
    @Param('answerId') answerId: string,
    @Body() dto: AnswerDto,
    @Request() req,
  ) {
    const questionId = Number(qId);
    const answerIdNum = Number(answerId);

    if (isNaN(questionId)) throw new BadRequestException('Invalid question ID');
    if (isNaN(answerIdNum)) throw new BadRequestException('Invalid answer ID');

    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('Invalid user.');

    return this.svc.update(answerIdNum, userId, dto);
  }

  @Delete(':qId/:answerId')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('qId') qId: string,
    @Param('answerId') answerId: string,
    @Request() req,
  ) {
    const questionId = Number(qId);
    const answerIdNum = Number(answerId);

    if (isNaN(questionId)) throw new BadRequestException('Invalid question ID');
    if (isNaN(answerIdNum)) throw new BadRequestException('Invalid answer ID');

    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('Invalid user.');

    return this.svc.delete(answerIdNum, userId);
  }

  @Get(':qId')
  @UseGuards(OptionalJwtAuthGuard)
  async getAnswers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Param('qId', ParseIntPipe) qId: number,
    @Req() req?: Request,
  ) {
    const userId = (req as any)?.user?.id || (req as any)?.user?.sub;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const total = await this.prisma.answer.count({
      where: { questionId: qId },
    });

    const answers = await this.prisma.answer.findMany({
      where: { questionId: qId },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limitNum,
      include: {
        author: { select: { id: true, name: true, primaryWallet: true } },
      },
    });

    return {
      questionId: qId,
      answers: answers.map((answer) => ({
        ...answer,
        isAuthor: userId === answer.authorId,
      })),
      meta: {
        total: total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
