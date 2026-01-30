import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from '../common/prisma.service';
import { BRAIN_FAUCET_SWAP_ABI, BRAIN_TOKEN_ABI } from './brain.abi';

@Injectable()
export class FaucetSwapService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private faucetSwapContract: ethers.Contract;
  private brainTokenContract: ethers.Contract;

  constructor(private prisma: PrismaService) {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.SERVER_SIGNER_PRIVATE_KEY;
    const faucetSwapAddress = process.env.BRAIN_SWAP_ADDRESS;
    const brainTokenAddress = process.env.BRAIN_TOKEN_ADDRESS;

    if (!rpcUrl) throw new Error('RPC_URL missing in .env');
    if (!privateKey)
      throw new Error('SERVER_SIGNER_PRIVATE_KEY missing in .env');
    if (!faucetSwapAddress)
      throw new Error('BRAIN_SWAP_ADDRESS missing in .env');
    if (!brainTokenAddress)
      throw new Error('BRAIN_TOKEN_ADDRESS missing in .env');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);

    this.faucetSwapContract = new ethers.Contract(
      faucetSwapAddress,
      BRAIN_FAUCET_SWAP_ABI,
      this.signer,
    );

    this.brainTokenContract = new ethers.Contract(
      brainTokenAddress,
      BRAIN_TOKEN_ABI,
      this.signer,
    );
  }

  async hasAccountClaimed(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hasClaimedFaucet: true },
    });
    return user?.hasClaimedFaucet ?? false;
  }

  async claimFaucetForAccount(userId: number, walletAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.hasClaimedFaucet) {
      throw new BadRequestException(
        'You have already claimed the faucet. Each account can only claim once.',
      );
    }

    if (!walletAddress) {
      throw new BadRequestException(
        'Wallet address is required to receive BRAIN tokens',
      );
    }

    const faucetAmount = await this.faucetSwapContract.faucetAmount();
    const backendWallet = await this.signer.getAddress();
    const backendBalance =
      await this.brainTokenContract.balanceOf(backendWallet);

    if (BigInt(backendBalance) < BigInt(faucetAmount)) {
      throw new BadRequestException(
        'Faucet is currently empty. Please try again later.',
      );
    }

    try {
      const tx = await this.brainTokenContract.transfer(
        walletAddress,
        faucetAmount,
      );
      const receipt = await tx.wait();

      // 4. Mark account as claimed in database
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hasClaimedFaucet: true,
          faucetClaimedAt: new Date(),
          faucetTxHash: receipt.hash,
          primaryWallet: user.primaryWallet || walletAddress,
        },
      });

      return {
        success: true,
        message: 'Faucet claimed successfully!',
        txHash: receipt.hash,
        amount: ethers.formatEther(faucetAmount),
        walletAddress,
      };
    } catch (error) {
      console.error('Faucet claim failed:', error);
      throw new BadRequestException(
        'Failed to transfer BRAIN tokens. Please try again.',
      );
    }
  }

  async getFaucetClaimStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasClaimedFaucet: true,
        faucetClaimedAt: true,
        faucetTxHash: true,
        primaryWallet: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const faucetAmount = await this.faucetSwapContract.faucetAmount();

    return {
      hasClaimed: user.hasClaimedFaucet,
      claimedAt: user.faucetClaimedAt,
      txHash: user.faucetTxHash,
      faucetAmount: ethers.formatEther(faucetAmount),
      canClaim: !user.hasClaimedFaucet,
    };
  }

  async hasWalletClaimed(walletAddress: string): Promise<boolean> {
    return await this.faucetSwapContract.hasClaimedFaucet(walletAddress);
  }

  async getFaucetAmount(): Promise<string> {
    const amount = await this.faucetSwapContract.faucetAmount();
    return amount.toString();
  }

  async getSwapRate(): Promise<number> {
    const rate = await this.faucetSwapContract.swapRate();
    return Number(rate);
  }

  async getSwapAmount(ethAmountWei: string): Promise<string> {
    const brainAmount = await this.faucetSwapContract.getSwapAmount(
      BigInt(ethAmountWei),
    );
    return brainAmount.toString();
  }

  async getAvailableBrain(): Promise<string> {
    const available = await this.faucetSwapContract.getBrainBalance();
    return available.toString();
  }

  async getBrainBalance(walletAddress: string): Promise<string> {
    const balance = await this.brainTokenContract.balanceOf(walletAddress);
    return balance.toString();
  }

  async getStats() {
    const backendWallet = await this.signer.getAddress();

    const [faucetAmount, ethToBrainRate, contractBrainBalance] =
      await Promise.all([
        this.faucetSwapContract.faucetAmount(),
        this.faucetSwapContract.ethToBrainRate(),
        this.faucetSwapContract.getBrainBalance(),
      ]);

    const dbClaimCount = await this.prisma.user.count({
      where: { hasClaimedFaucet: true },
    });

    return {
      faucetAmount: ethers.formatEther(faucetAmount),
      swapRate: Number(ethToBrainRate) / 1e18,
      totalAccountClaims: dbClaimCount,
      availableBrain: ethers.formatEther(contractBrainBalance),
      backendWallet,
    };
  }

  async swapEthForBrain(userId: number, txHash: string, walletAddress: string) {
    const existingSwap = await this.prisma.ledger.findFirst({
      where: { txHash, kind: 'swap' },
    });

    if (existingSwap) {
      throw new BadRequestException(
        'This transaction has already been processed',
      );
    }

    const tx = await this.provider.getTransaction(txHash);
    if (!tx) {
      throw new BadRequestException('Transaction not found on chain');
    }
    const receipt = await tx.wait(1);
    if (!receipt || receipt.status !== 1) {
      throw new BadRequestException('Transaction failed or not confirmed');
    }
    const backendWallet = await this.signer.getAddress();
    if (tx.to?.toLowerCase() !== backendWallet.toLowerCase()) {
      throw new BadRequestException(
        'Transaction must be sent to the backend wallet',
      );
    }

    if (!tx.value || tx.value === 0n) {
      throw new BadRequestException('Transaction has no ETH value');
    }

    const swapRate = await this.faucetSwapContract.swapRate();
    const ethAmount = tx.value;
    const brainAmount = ethAmount * BigInt(swapRate);
    const backendBrainBalance =
      await this.brainTokenContract.balanceOf(backendWallet);
    if (BigInt(backendBrainBalance) < brainAmount) {
      throw new BadRequestException(
        'Insufficient BRAIN liquidity. Please try again later.',
      );
    }

    try {
      const transferTx = await this.brainTokenContract.transfer(
        walletAddress,
        brainAmount,
      );
      const transferReceipt = await transferTx.wait();

      await this.prisma.ledger.create({
        data: {
          userId,
          kind: 'swap',
          amountWei: brainAmount.toString(),
          token: 'BRAIN',
          ref: `ETH:${ethAmount.toString()}`,
          txHash,
        },
      });

      return {
        success: true,
        message: 'Swap completed successfully!',
        ethAmount: ethers.formatEther(ethAmount),
        brainAmount: ethers.formatEther(brainAmount),
        swapRate: Number(swapRate),
        depositTxHash: txHash,
        transferTxHash: transferReceipt.hash,
        walletAddress,
      };
    } catch (error) {
      console.error('Swap failed:', error);
      throw new BadRequestException(
        'Failed to transfer BRAIN tokens. Please contact support.',
      );
    }
  }


  async getDepositAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  async getSwapHistory(userId: number) {
    const swaps = await this.prisma.ledger.findMany({
      where: { userId, kind: 'swap' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return swaps.map((swap) => ({
      id: swap.id,
      brainAmount: ethers.formatEther(swap.amountWei),
      ethAmount: swap.ref?.replace('ETH:', '') || '0',
      txHash: swap.txHash,
      createdAt: swap.createdAt,
    }));
  }

  async setFaucetAmount(amountBrain: string) {
    const amountWei = ethers.parseEther(amountBrain);
    const tx = await this.faucetSwapContract.setFaucetAmount(amountWei);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async setSwapRate(rate: number) {
    if (rate <= 0) throw new BadRequestException('Rate must be greater than 0');
    const tx = await this.faucetSwapContract.setSwapRate(rate);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async withdrawBrain(amountBrain: string) {
    const amountWei = ethers.parseEther(amountBrain);
    const tx = await this.faucetSwapContract.withdrawBrain(amountWei);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async withdrawEth() {
    const tx = await this.faucetSwapContract.withdrawEth();
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async fundFaucet(amountBrain: string) {
    const faucetSwapAddress = process.env.BRAIN_SWAP_ADDRESS;
    if (!faucetSwapAddress) throw new Error('BRAIN_SWAP_ADDRESS missing');

    const amountWei = ethers.parseEther(amountBrain);
    const tx = await this.brainTokenContract.transfer(
      faucetSwapAddress,
      amountWei,
    );
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }
}
