import { create } from 'zustand';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';

export enum UptimeStatus {
  Healthy = 0,
  Down = 1,
  Degraded = 2,
  Quarantined = 3
}


export interface MonitorResponse {
  id: string;
  url: string;
  friendlyName: string;
  currentUptimeStatus: UptimeStatus;
  currentSecurityGrade: string;
  isActive: boolean;
  latencyMs?: number;
}

interface MonitorStore {
  monitors: MonitorResponse[];
  setMonitors: (monitors: MonitorResponse[]) => void;
  updateMonitorInList: (id: string, patch: Partial<MonitorResponse>) => void;
  toggleMonitor: (id: string) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  resetCircuit: (id: string) => Promise<void>;
}

export const useMonitorStore = create<MonitorStore>((set, get) => ({
  monitors: [],
  setMonitors: (monitors) => set({ monitors }),

  updateMonitorInList: (id, patch) => set({
    monitors: get().monitors.map((m) => (m.id === id ? { ...m, ...patch } : m))
  }),


  resetCircuit: async (id: string) => {
    try {
      await api.post(`/api/monitors/${id}/reset-circuit`);
    } catch (error) {
      console.error('Failed to reset circuit', error);
      throw error;
    }
  },

  
  toggleMonitor: async (id: string) => {
    const previousMonitors = get().monitors;
    
    set({
      monitors: previousMonitors.map((m) => 
        m.id === id ? { ...m, isActive: !m.isActive } : m
      )
    });

    try {
      await api.patch(`/api/monitors/${id}/toggle`);
    } catch (error) {
      set({ monitors: previousMonitors });
      console.error('Failed to toggle monitor state', error);
      useToastStore.getState().error('Failed to update monitor state.');
    }
  },

  deleteMonitor: async (id: string) => {
    const previousMonitors = get().monitors;
    
    set({
      monitors: previousMonitors.filter((m) => m.id !== id)
    });

    try {
      await api.delete(`/api/monitors/${id}`);
    } catch (error) {
      set({ monitors: previousMonitors });
      console.error('Failed to delete monitor', error);
      useToastStore.getState().error('Failed to delete monitor.');
    }
  }
}));