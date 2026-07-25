// src/pages/Dashboard.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/axios';
import { motion } from 'framer-motion';
import { useMonitorStore, UptimeStatus } from '../features/monitors/store/useMonitorStore';
import { useToastStore } from '../components/ui/useToastStore';
import { useSignalR } from '../features/monitors/hooks/useSignalR';
import { MonitorCard } from '../features/monitors/components/MonitorCard';
import { AddMonitorModal } from '../features/monitors/components/AddMonitorModal';

export const Dashboard = () => {
  const token = localStorage.getItem('jwt_token');

  // The useSignalR hook handles the global telemetry subscription (ReceivePulse)
  // and now includes a lifecycle guard to prevent race conditions.
  useSignalR(token);

  const { monitors, setMonitors } = useMonitorStore();
  const [loadError, setLoadError] = useState(false);

  const healthyCount = useMemo(
    () => monitors.filter((m) => m.isActive && m.currentUptimeStatus === UptimeStatus.Healthy).length,
    [monitors]
  );

  const fetchMonitors = useCallback(async () => {
    try {
      const response = await api.get('/api/monitors');
      setMonitors(response.data);
      setLoadError(false);
    } catch (error) {
      console.error('Initial payload telemetry fetch failed:', error);
      setLoadError(true);
      useToastStore.getState().error('Failed to load monitors.');
    }
  }, [setMonitors]);

  useEffect(() => {
    // Fetch-on-mount seeds the SignalR-patched store; setState here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMonitors();
  }, [fetchMonitors]);


  return (
    <div className="min-h-screen bg-white p-8 text-zinc-900">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          {monitors.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <p className="text-sm text-zinc-500">
                <span className="text-primary font-semibold">{healthyCount}</span> of {monitors.length} monitors healthy
              </p>
            </div>
          )}
        </div>
        <AddMonitorModal />
      </header>

      {loadError && monitors.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50">
          <p className="text-sm font-medium text-red-600">Unable to load monitors</p>
          <p className="text-xs mt-2 text-red-700/70">Could not reach the API server.</p>
          <button
            onClick={fetchMonitors}
            className="mt-6 py-2 px-6 bg-zinc-900 text-white hover:bg-zinc-800 font-medium text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {monitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
          {monitors.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-500 rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
              <p className="text-sm font-medium text-zinc-700">No monitors yet</p>
              <p className="text-xs mt-2">Add a monitor to start tracking uptime and security.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};