import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FaucetSwapService } from '../chain/faucet-swap.service';

interface FaucetInfoResponse {
  faucetAmount: string;
  swapRate: number;
  totalAccountClaims: number;
  availableBrain: string;
  backendWallet: string;
}

interface BalanceResponse {
  address: string;
  balance: string;
  balanceFormatted: string;
}

interface SwapQuoteResponse {
  ethAmount: string;
  brainAmount: string;
  rate: number;
}

interface ClaimFaucetDto {
  walletAddress: string;
}

@Controller('faucet-swap')
export class FaucetSwapController {
  constructor(private readonly faucetSwapService: FaucetSwapService) {}

  @Get('info')
  async getInfo(): Promise<FaucetInfoResponse> {
    return await this.faucetSwapService.getStats();
  }

  @Get('balance')
  async getBalance(
    @Query('address') address: string,
  ): Promise<BalanceResponse> {
    if (!address) {
      throw new BadRequestException('Address is required');
    }

    const balance = await this.faucetSwapService.getBrainBalance(address);
    const balanceNum = BigInt(balance);
    const balanceFormatted = (Number(balanceNum) / 1e18).toFixed(4);

    return {
      address,
      balance,
      balanceFormatted: `${balanceFormatted} BRAIN`,
    };
  }

  @Get('claim-status')
  @UseGuards(AuthGuard('jwt'))
  async getClaimStatus(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return await this.faucetSwapService.getFaucetClaimStatus(userId);
  }

  @Post('claim')
  @UseGuards(AuthGuard('jwt'))
  async claimFaucet(@Request() req: any, @Body() body: ClaimFaucetDto) {
    const userId = req.user.sub || req.user.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    if (!body.walletAddress) {
      throw new BadRequestException('walletAddress is required');
    }

    return await this.faucetSwapService.claimFaucetForAccount(
      userId,
      body.walletAddress,
    );
  }

  @Get('quote')
  async getSwapQuote(
    @Query('ethAmount') ethAmount: string,
  ): Promise<SwapQuoteResponse> {
    if (!ethAmount) {
      throw new BadRequestException('ethAmount is required (in wei)');
    }

    const [brainAmount, rate] = await Promise.all([
      this.faucetSwapService.getSwapAmount(ethAmount),
      this.faucetSwapService.getSwapRate(),
    ]);

    return {
      ethAmount,
      brainAmount,
      rate,
    };
  }
  @Get('deposit-address')
  async getDepositAddress() {
    const address = await this.faucetSwapService.getDepositAddress();
    return { depositAddress: address };
  }

  @Post('swap')
  @UseGuards(AuthGuard('jwt'))
  async swapEthForBrain(
    @Request() req: any,
    @Body() body: { txHash: string; walletAddress: string },
  ) {
    const userId = req.user.sub || req.user.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    if (!body.txHash) {
      throw new BadRequestException(
        'txHash is required (your ETH deposit transaction)',
      );
    }

    if (!body.walletAddress) {
      throw new BadRequestException(
        'walletAddress is required (to receive BRAIN)',
      );
    }

    return await this.faucetSwapService.swapEthForBrain(
      userId,
      body.txHash,
      body.walletAddress,
    );
  }

  @Get('swap-history')
  @UseGuards(AuthGuard('jwt'))
  async getSwapHistory(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return await this.faucetSwapService.getSwapHistory(userId);
  }

  /**
   * POST /faucet-swap/admin/set-rate
   * Update swap rate (admin only)
   */
  @Post('admin/set-rate')
  async setSwapRate(@Body('rate') rate: number) {
    if (!rate || rate <= 0) {
      throw new BadRequestException('Valid rate is required');
    }
    return await this.faucetSwapService.setSwapRate(rate);
  }

  /**
   * POST /faucet-swap/admin/set-faucet-amount
   * Update faucet amount (admin only)
   */
  @Post('admin/set-faucet-amount')
  async setFaucetAmount(@Body('amount') amount: string) {
    if (!amount) {
      throw new BadRequestException(
        'Amount is required (in BRAIN, e.g. "100")',
      );
    }
    return await this.faucetSwapService.setFaucetAmount(amount);
  }

  /**
   * POST /faucet-swap/admin/fund
   * Fund the faucet with BRAIN tokens (admin only)
   */
  @Post('admin/fund')
  async fundFaucet(@Body('amount') amount: string) {
    if (!amount) {
      throw new BadRequestException(
        'Amount is required (in BRAIN, e.g. "10000000")',
      );
    }
    return await this.faucetSwapService.fundFaucet(amount);
  }

  /**
   * POST /faucet-swap/admin/withdraw-eth
   * Withdraw collected ETH from swaps (admin only)
   */
  @Post('admin/withdraw-eth')
  async withdrawEth() {
    return await this.faucetSwapService.withdrawEth();
  }
}
