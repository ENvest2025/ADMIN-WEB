import { apiClient } from './client';
import {
    FetchAllWithdrawalsResponse,
    GenericResponse,
    TransfersOutReportParams,
    TransfersOutReportResponse,
    UpdateWithdrawalStatusPayload,
} from '@shared/api';

// The transfersOutReport endpoint currently leaks a PHP warning before the JSON
// body, which breaks normal parsing. Recover the JSON defensively: if the value
// arrived as a raw string, slice from the first `[`/`{`; then unwrap array-wrapped
// responses. (Backend fix pending — see transfersClass.php:1116.)
const recoverJson = <T>(res: unknown): T => {
    let value: any = res;
    if (typeof value === 'string') {
        const i = value.search(/[[{]/);
        value = JSON.parse(i >= 0 ? value.slice(i) : value);
    }
    if (Array.isArray(value)) value = value[0];
    return value as T;
};

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

    // Paystack transfers-out (payouts) report — DataTables-style params.
    transfersOutReport: async (
        params: TransfersOutReportParams
    ): Promise<TransfersOutReportResponse> => {
        const res = await apiClient<unknown>('POST', 'transfersOutReport', params);
        return recoverJson<TransfersOutReportResponse>(res);
    },
};
