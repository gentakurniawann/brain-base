import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { PrismaService } from '../common/prisma.service';
import { IpfsModule } from '../ipfs/ipfs.module';
import { HashingModule } from '../hashing/hashing.module';
import { UsersModule } from '../users/users.module';
import { ChainModule } from '../chain/chain.module';

@Module({
  imports: [IpfsModule, HashingModule, UsersModule, ChainModule],
  controllers: [AnswersController],
  providers: [AnswersService, PrismaService],
})
export class AnswersModule {}
