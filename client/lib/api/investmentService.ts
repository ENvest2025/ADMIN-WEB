import { apiClient } from './client';
import { 
    PullInvestmentsRequest, 
    PullInvestmentsResponse, 
    ChangeInvestmentStatusRequest, 
    GenericResponse 
} from '@shared/api';

export const investmentService = {
    pullInvestments: async (payload: PullInvestmentsRequest): Promise<PullInvestmentsResponse> => {
        return apiClient<PullInvestmentsResponse>('POST', 'pullInvestments', payload);
    },

    changeInvestmentStatus: async (payload: ChangeInvestmentStatusRequest): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'changeInvestmentStatus', payload);
    }
};
