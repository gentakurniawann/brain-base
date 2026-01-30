import { Injectable, OnModuleInit } from '@nestjs/common';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import { ethers } from 'ethers';
import { QNA_ABI } from './qna.abi';

@Injectable()
export class ChainReadService implements OnModuleInit {
  private client;
  private provider: ethers.JsonRpcProvider;
  private contract: { address: Address; abi: typeof QNA_ABI };

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) throw new Error('RPC_URL is missing in .env');

    this.client = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    });

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error('CONTRACT_ADDRESS missing in .env');

    this.contract = {
      address: contractAddress as Address,
      abi: QNA_ABI,
    } as const;
  }

  async onModuleInit() {
    const network = await this.provider.getNetwork();
    // console.log(
    //   `[ChainReadService] Connected to network: ${network.name} (chainId=${network.chainId})`,
    // );
  }

  async getEthBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error(`[ChainReadService] Failed to fetch ETH balance:`, error);
      return '0';
    }
  }

  async bountyOf(qId: number): Promise<bigint> {
    try {
      const bounty = await this.client.readContract({
        ...this.contract,
        functionName: 'bountyOf',
        args: [BigInt(qId)],
      });
      return bounty as bigint;
    } catch (error) {
      console.error(
        `[ChainReadService] Failed to read bountyOf(${qId}):`,
        error,
      );
      return 0n;
    }
  }

  async getQuestionCount(): Promise<number> {
    try {
      const count = await this.client.readContract({
        ...this.contract,
        functionName: 'questionCount',
      });
      return Number(count);
    } catch (error) {
      console.error(`[ChainReadService] Failed to read questionCount:`, error);
      return 0;
    }
  }

  async getContractBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.contract.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error(
        `[ChainReadService] Failed to fetch contract balance:`,
        error,
      );
      return '0';
    }
  }

  async getQuestion(qId: number) {
    try {
      const q = await this.client.readContract({
        ...this.contract,
        functionName: 'getQuestion',
        args: [BigInt(qId)],
      });

      return {
        id: qId,
        asker: q[0],
        token: q[1],
        bounty: ethers.formatEther(q[2]),
        deadline: Number(q[3]),
        uri: q[4],
        answered: q[5],
      };
    } catch (error) {
      console.error(
        `[ChainReadService] Failed to read getQuestion(${qId}):`,
        error,
      );
      return null;
    }
  }
  
  async listAllQuestions(): Promise<
    {
      id: number;
      asker: string;
      token: string;
      bounty: string;
      deadline: number;
      uri: string;
      answered: boolean;
    }[]
  > {
    const total = await this.getQuestionCount();

    const result: {
      id: number;
      asker: string;
      token: string;
      bounty: string;
      deadline: number;
      uri: string;
      answered: boolean;
    }[] = [];

    for (let i = 1; i <= total; i++) {
      const q = await this.getQuestion(i);
      if (q) result.push(q);
    }
    return result;
  }
}
