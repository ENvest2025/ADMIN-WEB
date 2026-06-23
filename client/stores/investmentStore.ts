import { create } from 'zustand';

export interface Investment {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'fund';
  amount: number;
  currency: string;
  purchaseDate: string;
  currentValue: number;
  percentageChange: number;
  description?: string;
  image?: string;
}

export interface Portfolio {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  percentageGain: number;
  investments: Investment[];
  ngnWalletBalance: number;
  usdWalletBalance: number;
}

export interface InvestmentState {
  portfolio: Portfolio;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addInvestment: (investment: Investment) => void;
  removeInvestment: (investmentId: string) => void;
  updateWalletBalance: (currency: string, amount: number) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  clearError: () => void;
}

const initialPortfolio: Portfolio = {
  totalValue: 0,
  totalInvested: 0,
  totalGain: 0,
  percentageGain: 0,
  investments: [],
  ngnWalletBalance: 0,
  usdWalletBalance: 0,
};

export const useInvestmentStore = create<InvestmentState>((set) => ({
  portfolio: initialPortfolio,
  isLoading: false,
  error: null,

  addInvestment: (investment: Investment) =>
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        investments: [...state.portfolio.investments, investment],
      },
    })),

  removeInvestment: (investmentId: string) =>
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        investments: state.portfolio.investments.filter(
          (inv) => inv.id !== investmentId
        ),
      },
    })),

  updateWalletBalance: (currency: string, amount: number) =>
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        ngnWalletBalance:
          currency === 'NGN'
            ? state.portfolio.ngnWalletBalance + amount
            : state.portfolio.ngnWalletBalance,
        usdWalletBalance:
          currency === 'USD'
            ? state.portfolio.usdWalletBalance + amount
            : state.portfolio.usdWalletBalance,
      },
    })),

  setPortfolio: (portfolio: Portfolio) => set({ portfolio }),

  clearError: () => set({ error: null }),
}));
