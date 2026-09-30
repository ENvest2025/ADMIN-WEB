import { apiClient } from './client';
import {
    EditInAppAdPayload,
    GenericResponse,
    InAppAdsReportParams,
    InAppAdsReportResponse,
} from '@shared/api';

export const inAppAdsService = {
    // Paginated report incl. active + inactive ads.
    report: async (params: InAppAdsReportParams = {}): Promise<InAppAdsReportResponse> => {
        return apiClient<InAppAdsReportResponse>('POST', 'inAppAdsReport', params);
    },

    // Create an ad + upload media (multipart form-data).
    create: async (form: FormData): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'createInAppAd', form);
    },

    // Edit metadata only (JSON).
    edit: async (payload: EditInAppAdPayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'editInAppAd', payload);
    },

    // Edit and replace media (multipart form-data; must include `id`).
    editWithMedia: async (form: FormData): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'editInAppAd', form);
    },

    remove: async (id: number | string): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'deleteInAppAd', { id });
    },
};
