import { apiClient } from './client';
import { GetAllProductsResponse } from '@shared/api';

export const productsService = {
    // Returns all investment products grouped into `stocks` and `investment_notes`.
    // Served from the admin (qSdb89lP) base so it's same-origin/CORS-allowed like
    // every other admin call. (The /api/v1 host returns the same data but is
    // CORS-blocked in the browser.)
    getAllProducts: async (): Promise<GetAllProductsResponse> => {
        return apiClient<GetAllProductsResponse>('POST', 'getAllProducts', {});
    },
};
