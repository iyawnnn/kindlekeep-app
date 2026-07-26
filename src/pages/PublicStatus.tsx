// src/pages/PublicStatus.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UptimeTimeline } from '@/components/ui/UptimeTimeline';
import { Globe } from 'lucide-react';
import { api } from '../lib/axios';
import { UptimeStatus } from '../features/monitors/store/useMonitorStore';
import type { PublicMonitorResponse } from '../features/monitors/types/monitor.types';

export const PublicStatus = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: monitor, isLoading, error } = useQuery<PublicMonitorResponse>({
    queryKey: ['publicStatus', slug],
    queryFn: async () => {
      const response = await api.get(`/api/public/monitors/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-zinc-500">Loading status...</p>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-zinc-500">This status page is unavailable.</p>
      </div>
    );
  }

  const isHealthy = monitor.isActive && monitor.currentUptimeStatus === UptimeStatus.Healthy;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="" className="size-7 rounded-md" />
          <span className="text-xl font-semibold text-black tracking-tight lowercase">kindlekeep</span>
        </div>

        <div className="flex items-center justify-between rounded-xl p-8 border border-zinc-200 mb-6">
          <div className="flex items-center gap-3">
            <Globe strokeWidth={1.5} className={`w-6 h-6 ${isHealthy ? 'text-primary' : 'text-zinc-400'}`} />
            <p className="text-2xl font-semibold text-zinc-900">{monitor.friendlyName}</p>
          </div>
          <span className={`text-sm font-semibold ${isHealthy ? 'text-primary' : 'text-red-600'}`}>
            {monitor.isActive ? (isHealthy ? 'Operational' : 'Down') : 'Paused'}
          </span>
        </div>

        <div className="rounded-xl bg-white border border-zinc-200 p-8">
          <p className="text-lg font-semibold text-zinc-900 mb-6">Uptime History</p>
          <UptimeTimeline history={monitor.history} />
        </div>
      </div>
    </div>
  );
};
