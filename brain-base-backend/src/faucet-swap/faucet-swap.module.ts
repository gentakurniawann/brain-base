import { Module } from '@nestjs/common';
import { FaucetSwapController } from './faucet-swap.controller';
import { FaucetSwapService } from '../chain/faucet-swap.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [FaucetSwapController],
  providers: [FaucetSwapService, PrismaService],
  exports: [FaucetSwapService],
})
export class FaucetSwapModule {}
