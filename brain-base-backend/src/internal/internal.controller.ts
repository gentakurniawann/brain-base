import { Body, Controller, Param, Post } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { publish } from '../sse/sse.controller';

@Controller()
export class InternalController {
  constructor(private prisma: PrismaService) {}

  @Post('answers/:id/confirm')
  async confirmBest(
    @Param('id') aId: string,
    @Body() body: { txHash: string },
  ) {
    const answerId = Number(aId);
    const a = await this.prisma.answer.update({
      where: { id: answerId },
      data: { isBest: true },
    });
    await this.prisma.question.update({
      where: { id: a.questionId },
      data: { status: 'Verified' },
    });
    publish('answer:confirmed', { aId: answerId, qId: a.questionId });
    return { ok: true, txHash: body.txHash };
  }

  @Post('internal/ledger')
  async addLedger(
    @Body()
    body: {
      userId?: number;
      questionId?: number;
      kind: string;
      amountWei: string;
      token?: string;
      ref?: string;
      txHash?: string;
    },
  ) {
    return this.prisma.ledger.create({ data: { token: 'BRAIN', ...body } });
  }
}
