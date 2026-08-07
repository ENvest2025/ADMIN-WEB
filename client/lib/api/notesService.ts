import { apiClient } from './client';
import {
    CreateNotePayload,
    FetchAllNotesResponse,
    GenericResponse,
    SingleNoteResponse,
    UpdateNotePayload,
} from '@shared/api';

export const notesService = {
    // Slim list of notes (id, product_name, investment_focus, short_name).
    getAllNotes: async (): Promise<FetchAllNotesResponse> => {
        return apiClient<FetchAllNotesResponse>('GET', 'inv-notes');
    },

    // Full note by numeric id.
    getSingleNote: async (note_id: number | string): Promise<SingleNoteResponse> => {
        return apiClient<SingleNoteResponse>('POST', 'inv-notes-single', { note_id });
    },

    createNote: async (payload: CreateNotePayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'inv-notes-create', payload);
    },

    updateNote: async (payload: UpdateNotePayload): Promise<GenericResponse> => {
        return apiClient<GenericResponse>('POST', 'inv-notes-update-single', payload);
    },
};
