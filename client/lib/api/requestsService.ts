import { apiClient } from './client';
import {
    GenericResponse,
    TakeActionOnRequestPayload,
    ViewAllRequestsParams,
    ViewAllRequestsResponse,
} from '@shared/api';

export const requestsService = {
    viewAllRequests: async (
        params: ViewAllRequestsParams = {}
    ): Promise<ViewAllRequestsResponse> => {
        return apiClient<ViewAllRequestsResponse>('POST', 'viewAllRequests', params);
    },

    takeActionOnRequest: async (
        payload: TakeActionOnRequestPayload
    ): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'takeActionOnRequest', payload);
    },
};
