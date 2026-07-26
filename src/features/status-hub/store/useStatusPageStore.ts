import { create } from 'zustand';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';
import type {
  StatusPageSummaryResponse,
  StatusPageServiceResponse,
  ServiceOrderEntry,
} from '../types/statusHub.types';

interface StatusPageStore {
  pages: StatusPageSummaryResponse[];
  setPages: (pages: StatusPageSummaryResponse[]) => void;
  deletePage: (id: string) => Promise<void>;
  reorderServices: (pageId: string, entries: ServiceOrderEntry[]) => Promise<StatusPageServiceResponse[]>;
}

export const useStatusPageStore = create<StatusPageStore>((set, get) => ({
  pages: [],
  setPages: (pages) => set({ pages }),

  deletePage: async (id: string) => {
    const previousPages = get().pages;

    set({ pages: previousPages.filter((p) => p.id !== id) });

    try {
      await api.delete(`/api/status-pages/${id}`);
    } catch (error) {
      set({ pages: previousPages });
      console.error('Failed to delete status page', error);
      useToastStore.getState().error('Failed to delete status page.');
    }
  },

  reorderServices: async (pageId: string, entries: ServiceOrderEntry[]) => {
    const response = await api.put(`/api/status-pages/${pageId}/services/reorder`, { services: entries });
    return response.data;
  },
}));
