import axios from '@/lib/axios';
import { TResponseMe, TWalletResponse } from '@/types';

export async function getMe(): Promise<TResponseMe> {
  try {
    const response = await axios.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error from getMe: ', error);
    throw error;
  }
}

export async function integrateWallet(address: string): Promise<TWalletResponse> {
  try {
    const response = await axios.patch('/auth/me/wallet', { address });
    return response.data;
  } catch (error) {
    console.error('Error from integrateWallet: ', error);
    throw error;
  }
}
