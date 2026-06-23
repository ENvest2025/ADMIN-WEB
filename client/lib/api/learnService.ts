import { apiClient } from './client';
import {
    AddNewsLetterPayload,
    DeleteNewsLetterPayload,
    EditNewsLetterPayload,
    FetchAllNewsPayload,
    FetchAllNewsResponse,
    GenericResponse,
} from '@shared/api';

export const learnService = {
    fetchAllNews: async (
        payload: FetchAllNewsPayload = { id: '' }
    ): Promise<FetchAllNewsResponse> => {
        return apiClient<FetchAllNewsResponse>('POST', 'fetchAllNews', payload);
    },

    addNewsLetter: async (payload: AddNewsLetterPayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'addnewsLetter', payload);
    },

    editNewsLetter: async (payload: EditNewsLetterPayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'editnewsLetter', payload);
    },

    // NOTE: Not present in the current Postman collection — endpoint name assumed
    // from the add/edit naming convention. Confirm with backend before relying on it.
    deleteNewsLetter: async (payload: DeleteNewsLetterPayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'deletenewsLetter', payload);
    },
};
