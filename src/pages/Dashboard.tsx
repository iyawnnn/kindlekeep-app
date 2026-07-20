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
    <div className="min-h-screen bg-white p-8 text-zinc-900 font-sans">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">Command Center</h1>
          {monitors.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <p className="font-mono text-sm text-zinc-500">
                <span className="text-blue-600 font-bold">{healthyCount}</span> of {monitors.length} monitors healthy
              </p>
            </div>
          )}
        </div>
        <AddMonitorModal />
      </header>

      {loadError && monitors.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-red-300 bg-red-50">
          <p className="font-sans uppercase tracking-widest text-sm text-red-600">Telemetry Unavailable</p>
          <p className="text-xs font-mono mt-2 text-red-700/70">Could not reach the command server.</p>
          <button
            onClick={fetchMonitors}
            className="mt-6 py-2 px-6 bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-wide text-xs transition-colors rounded-none font-onest"
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
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-300 bg-zinc-50">
              <p className="font-sans uppercase tracking-widest text-sm">No Active Targets</p>
              <p className="text-xs font-mono mt-2">Deploy a monitor to commence telemetry.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};