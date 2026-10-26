import { apiClient } from './client';
import {
    GenericResponse,
    NgxActionPayload,
    NgxExecutionReportsParams,
    NgxExecutionReportsResponse,
    NgxFixLogsParams,
    NgxFixLogsResponse,
} from '@shared/api';

export const ngxService = {
    // List execution reports via GET (limit, offset, optional status); rows live in data.orders.
    list: async (params: NgxExecutionReportsParams = {}): Promise<NgxExecutionReportsResponse> => {
        const qs = new URLSearchParams();
        if (params.limit != null) qs.set('limit', String(params.limit));
        if (params.offset != null) qs.set('offset', String(params.offset));
        if (params.status) qs.set('status', params.status);
        const query = qs.toString();
        return apiClient<NgxExecutionReportsResponse>('GET', `ngxExecutionReports${query ? `?${query}` : ''}`);
    },

    // Act on an order: check (refresh status) or cancel (open orders only).
    action: async (payload: NgxActionPayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'ngxExecutionReports', payload);
    },

    // List FIX protocol exchange logs via GET (/ngxFixLogs?limit=50&offset=0)
    getFixLogs: async (params: NgxFixLogsParams = {}): Promise<NgxFixLogsResponse> => {
        const qs = new URLSearchParams();
        if (params.limit != null) qs.set('limit', String(params.limit));
        if (params.offset != null) qs.set('offset', String(params.offset));
        if (params.date) qs.set('date', params.date);
        if (params.level) qs.set('level', params.level);
        if (params.event) qs.set('event', params.event);
        if (params.search) qs.set('search', params.search);
        const query = qs.toString();
        return apiClient<NgxFixLogsResponse>('GET', `ngxFixLogs${query ? `?${query}` : ''}`);
    },
};

