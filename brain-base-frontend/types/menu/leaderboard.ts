export type LeaderboardUser = {
  id: number;
  name: string;
  email?: string | null;
  primaryWallet?: string | null;
  _count: {
    answers: number;
  };
};
