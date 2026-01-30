import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getTopUsers(limit = 10) {
    const users = await this.prisma.user.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            answers: {
              where: { isBest: true },
            },
          },
        },
      },
    });

    const sorted = users.sort(
      (a, b) => b._count.answers - a._count.answers,
    );

    return sorted;
  }
}
