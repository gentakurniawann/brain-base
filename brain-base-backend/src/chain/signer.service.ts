import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';
import { QNA_ABI } from './qna.abi';
import { BRAIN_TOKEN_ABI } from './brain.abi';

@Injectable()
export class SignerService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  contract: ethers.Contract;
  brainTokenContract: ethers.Contract;
  brainTokenAddress: string;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.SERVER_SIGNER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const brainTokenAddress = process.env.BRAIN_TOKEN_ADDRESS;

    if (!rpcUrl) throw new Error('RPC_URL missing in .env');
    if (!privateKey)
      throw new Error('SERVER_SIGNER_PRIVATE_KEY missing in .env');
    if (!contractAddress) throw new Error('CONTRACT_ADDRESS missing in .env');
    if (!brainTokenAddress)
      throw new Error('BRAIN_TOKEN_ADDRESS missing in .env');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, QNA_ABI, this.signer);
    this.brainTokenContract = new ethers.Contract(
      brainTokenAddress,
      BRAIN_TOKEN_ABI,
      this.signer,
    );
    this.brainTokenAddress = brainTokenAddress;
  }

  async getSignerAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  async approveBrainForQna(amount: bigint) {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const tx = await this.brainTokenContract.approve(contractAddress, amount);
    const receipt = await tx.wait();
    return receipt;
  }

  async getBrainAllowance(): Promise<bigint> {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const signerAddress = await this.signer.getAddress();
    const allowance = await this.brainTokenContract.allowance(
      signerAddress,
      contractAddress,
    );
    return BigInt(allowance);
  }

  async testConnection() {
    const network = await this.provider.getNetwork();
    // console.log(`[SignerService] Connected to chain: ${network.chainId}`);
    // console.log(
    //   `[SignerService] Using address: ${await this.signer.getAddress()}`,
    // );
  }

  getContract() {
    return this.contract;
  }

  async askQuestion(
    tokenAddress: string,
    bountyWei: bigint,
    deadline: number,
    uri: string,
  ) {
    try {
      const isNativeToken = tokenAddress === ethers.ZeroAddress;

      const tx = await this.contract.askQuestion(
        tokenAddress,
        bountyWei,
        deadline,
        uri,
        {
          value: isNativeToken ? bountyWei : 0n,
          gasLimit: 3_000_000,
        },
      );

      const receipt = await tx.wait(1);
      let emittedQId: number | null = null;

      if (
        receipt &&
        receipt.status === 1 &&
        receipt.logs &&
        receipt.logs.length > 0
      ) {
        for (const log of receipt.logs) {
          try {
            const parsed = this.contract.interface.parseLog(log);
            if (parsed && parsed.name === 'QuestionAsked') {
              emittedQId = Number(parsed.args[0]);
              break;
            }
          } catch {}
        }
      }

      if (emittedQId === null) {
        console.warn('⚠️ Could not extract questionId from events');
      }

      return { tx, receipt, chainQId: emittedQId };
    } catch (err) {
      console.error('❌ askQuestion failed:', err);
      throw new BadRequestException('Failed to send askQuestion transaction');
    }
  }

  async askQuestionOnBehalf(
    askerAddress: string,
    tokenAddress: string,
    bountyWei: bigint,
    deadline: number,
    uri: string,
  ) {
    try {
      const tx = await this.contract.askQuestionOnBehalf(
        askerAddress,
        tokenAddress,
        bountyWei,
        deadline,
        uri,
        { gasLimit: 3_000_000 },
      );

      const receipt = await tx.wait(1);

      let emittedQId: number | null = null;

      if (
        receipt &&
        receipt.status === 1 &&
        receipt.logs &&
        receipt.logs.length > 0
      ) {
        for (const log of receipt.logs) {
          try {
            const parsed = this.contract.interface.parseLog(log);
            if (parsed && parsed.name === 'QuestionAsked') {
              emittedQId = Number(parsed.args[0]);
              break;
            }
          } catch {}
        }
      }

      if (emittedQId === null) {
        console.warn('⚠️ Could not extract questionId from events');
      }

      return { tx, receipt, chainQId: emittedQId };
    } catch (err) {
      console.error('❌ askQuestionOnBehalf failed:', err);
      throw new BadRequestException(
        'Failed to create question on behalf of user',
      );
    }
  }

  async fundMore(chainQId: number, addWei: bigint) {
    const tx = await this.contract.addBounty(chainQId, addWei, {
      value: addWei,
    });
    return await tx.wait();
  }

  async reduceBounty(chainQId: number, newAmount: bigint) {
    const tx = await this.contract.reduceBountyAsAdmin(chainQId, newAmount);
    return await tx.wait();
  }

  async addBountyOnBehalf(
    funderAddress: string,
    chainQId: number,
    addWei: bigint,
  ) {
    try {
      const tx = await this.contract.addBountyOnBehalf(
        funderAddress,
        BigInt(chainQId),
        addWei,
        { gasLimit: 500_000 },
      );

      const receipt = await tx.wait(1);
      return { tx, receipt };
    } catch (err) {
      console.error('❌ addBountyOnBehalf failed:', err);
      throw new BadRequestException(
        'Failed to add bounty. Make sure you have approved the contract to spend your BRAIN tokens.',
      );
    }
  }

  async cancelQuestion(chainQId: number) {
    const tx = await this.contract.cancelQuestionAsAdmin(chainQId);
    return await tx.wait();
  }

  async answerQuestionOnBehalf(
    answererAddress: string,
    chainQId: number,
    uri: string,
  ) {
    try {
      const tx = await this.contract.answerQuestionOnBehalf(
        answererAddress,
        BigInt(chainQId),
        uri,
        { gasLimit: 1_000_000 },
      );

      const receipt = await tx.wait(1);

      let emittedAId: number | null = null;

      if (
        receipt &&
        receipt.status === 1 &&
        receipt.logs &&
        receipt.logs.length > 0
      ) {
        for (const log of receipt.logs) {
          try {
            const parsed = this.contract.interface.parseLog(log);
            if (parsed && parsed.name === 'AnswerPosted') {
              emittedAId = Number(parsed.args[1]);
              break;
            }
          } catch {
          }
        }
      }

      return { tx, receipt, chainAId: emittedAId };
    } catch (err) {
      console.error('❌ answerQuestionOnBehalf failed:', err);
      throw new BadRequestException('Failed to post answer on-chain.');
    }
  }

  async rewardUser(questionId: number, answerId: number) {
    if (!answerId) {
      throw new BadRequestException('Missing answer ID');
    }

    try {
      const tx = await this.contract.acceptAnswerAsAdmin(
        BigInt(questionId),
        BigInt(answerId),
      );

      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error('❌ Error in rewardUser:', error);

      if (error.message?.includes('Not asker')) {
        throw new BadRequestException(
          'You are calling acceptAnswer instead of acceptAnswerAsAdmin. ' +
            'Make sure the contract is deployed with the new function.',
        );
      }

      if (error.message?.includes('Ownable: caller is not the owner')) {
        throw new BadRequestException(
          'Backend wallet is not the contract owner. ' +
            'Redeploy the contract with your backend wallet as owner.',
        );
      }

      if (error.message?.includes('acceptAnswerAsAdmin')) {
        throw new BadRequestException(
          'Contract does not have acceptAnswerAsAdmin function. ' +
            'Please redeploy the updated contract.',
        );
      }

      if (error.message?.includes('Not open')) {
        throw new BadRequestException(
          'Question is not open (already resolved, cancelled, or expired)',
        );
      }

      if (error.message?.includes('Invalid answer')) {
        throw new BadRequestException('Invalid answer ID');
      }

      if (error.message?.includes('Already accepted')) {
        throw new BadRequestException(
          'This question already has an accepted answer',
        );
      }

      throw error;
    }
  }

  async fundBounty(questionId: number, amountWei: bigint) {
    const tx = await this.contract.fundBounty(BigInt(questionId), {
      value: amountWei,
    });
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async answerQuestion(questionId: number, contentHash: string) {
    if (!contentHash) throw new BadRequestException('Missing content hash');
    const tx = await this.contract.answerQuestion(
      BigInt(questionId),
      contentHash,
    );
    return tx;
  }
}
