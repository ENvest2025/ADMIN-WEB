import { apiClient } from './client';
import {
    FetchAllWithdrawalsResponse,
    GenericResponse,
    UpdateWithdrawalStatusPayload,
} from '@shared/api';

export const withdrawalsService = {
    fetchAllWithdrawalRequests: async (): Promise<FetchAllWithdrawalsResponse> => {
        return apiClient<FetchAllWithdrawalsResponse>('POST', 'fetchAllWithdrawalRequests', {});
    },

    // status: 1 = approve (sends money to bank), 2 = fail, 4 = cancel
    updateWithdrawalStatus: async (
        payload: UpdateWithdrawalStatusPayload
    ): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'updateWithdrawalStatus', payload);
    },
};
