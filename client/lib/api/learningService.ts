import { apiClient } from './client';
import {
    CreateLearningPayload,
    EditLearningPayload,
    FetchLearningParams,
    FetchLearningResponse,
    GenericResponse,
} from '@shared/api';

export const learningService = {
    // DataTables-style list (fields live at the top level of the response).
    fetchLearning: async (params: FetchLearningParams = {}): Promise<FetchLearningResponse> => {
        return apiClient<FetchLearningResponse>('POST', 'fetchLearning', params);
    },

    // Create a new learning entry (topic + details required; status defaults to pending).
    createLearning: async (payload: CreateLearningPayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'createLearning', payload);
    },

    // Update topic / details / status by id (at least one editable field).
    editLearning: async (payload: EditLearningPayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'editLearning', payload);
    },

    deleteLearning: async (id: number | string): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'deleteLearning', { id });
    },
};
