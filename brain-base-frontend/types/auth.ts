export interface IAuthStore {
  token: string;
  wsToken: string;
  user: TResponseMe | null;
  getToken: () => Promise<string | null>;
  setToken: (token: string) => void;
  getUserCredential: () => Promise<TResponseMe | null>;
  setUserCredential: (user: TResponseMe) => void;
  logout: () => void;
  integrateWallet: (address: string) => Promise<TWalletResponse>;
}
export interface IAuthPersistStore {
  checkMe: () => Promise<TResponseMe>;
}

export type TResponseLogin = {
  message: string;
};

export type TResponseMe = {
  id: number;
  email: string;
  username: string;
  primaryWallet: string;
  walletBalance: TWalletBalance;
};

export interface TWalletBalance {
  address: string;
  wei: string;
  qie: string;
}

export interface TWalletResponse {
  id: number;
  email: string;
  name: string;
  primaryWallet: string;
  createdAt: string;
}
