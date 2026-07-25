// src/pages/Badges.tsx
import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { MonitorDetailResponse } from '../features/monitors/types/monitor.types';
import type { MonitorResponse } from '../features/monitors/store/useMonitorStore';
import { BadgeCard } from '../features/badges/components/BadgeCard';

const fetchMonitors = async (): Promise<MonitorResponse[]> => {
  const response = await api.get('/api/monitors');
  return response.data;
};

const fetchMonitorDetail = async (id: string): Promise<MonitorDetailResponse> => {
  const response = await api.get(`/api/monitors/${id}`);
  return response.data;
};

export const Badges = () => {
  const { data: monitors, isLoading, isError } = useQuery({
    queryKey: ['monitors'],
    queryFn: fetchMonitors,
  });

  // Bulk badge status (isPublic/publicSlug) only lives on the per-monitor detail endpoint,
  // not the list endpoint - fine as an N+1 here since it's bounded by the free-tier monitor limit.
  const detailQueries = useQueries({
    queries: (monitors ?? []).map((m) => ({
      queryKey: ['monitor', m.id],
      queryFn: () => fetchMonitorDetail(m.id),
      enabled: !!monitors,
    })),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-zinc-500">
        <p>Loading badges...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-red-600 max-w-7xl mx-auto">
        <p>Failed to load monitors.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-black tracking-tight">Badges</h1>
        <p className="text-zinc-500 mt-2">
          Embeddable status badges for your READMEs and docs.
        </p>
      </header>

      {monitors && monitors.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-zinc-500 rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
          <p className="text-sm font-medium">No monitors yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitors?.map((monitor, i) => {
            const detail = detailQueries[i]?.data;
            return (
              <BadgeCard
                key={monitor.id}
                monitorId={monitor.id}
                friendlyName={monitor.friendlyName}
                url={monitor.url}
                isPublic={detail?.isPublic ?? false}
                publicSlug={detail?.publicSlug ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
