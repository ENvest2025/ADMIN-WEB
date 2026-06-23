import { create } from 'zustand';

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  accountData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    countryOfOrigin?: string;
    bankName?: string;
    accountNumber?: string;
    bvn?: string;
    nin?: string;
    idType?: string;
    idNumber?: string;
  };
  
  // Actions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  updateAccountData: (data: Partial<OnboardingState['accountData']>) => void;
  markStepComplete: (step: number) => void;
  resetOnboarding: () => void;
}

const initialAccountData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  countryOfOrigin: '',
  bankName: '',
  accountNumber: '',
  bvn: '',
  nin: '',
  idType: '',
  idNumber: '',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  completedSteps: [],
  accountData: initialAccountData,

  nextStep: () =>
    set((state) => ({
      currentStep: state.currentStep + 1,
      completedSteps: [...new Set([...state.completedSteps, state.currentStep])],
    })),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1),
    })),

  goToStep: (step: number) =>
    set({
      currentStep: step,
    }),

  updateAccountData: (data: Partial<OnboardingState['accountData']>) =>
    set((state) => ({
      accountData: {
        ...state.accountData,
        ...data,
      },
    })),

  markStepComplete: (step: number) =>
    set((state) => ({
      completedSteps: [...new Set([...state.completedSteps, step])],
    })),

  resetOnboarding: () =>
    set({
      currentStep: 1,
      completedSteps: [],
      accountData: initialAccountData,
    }),
}));
