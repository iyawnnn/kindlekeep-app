// src/pages/Badges.tsx
import { useQueries, useQuery } from '@tanstack/react-query';
import { Box, Flex, Text, Grid } from '@radix-ui/themes';
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
      <Flex justify="center" align="center" className="h-[calc(100vh-64px)] text-zinc-500 font-onest">
        <Text>Loading badges...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box className="p-8 text-red-600 font-onest max-w-7xl mx-auto">
        <Text>Failed to load monitors.</Text>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black font-unbounded text-black tracking-tight">Badges</h1>
        <Text className="text-zinc-600 mt-2 font-medium font-onest block">
          Embeddable status badges for your READMEs and docs.
        </Text>
      </header>

      {monitors && monitors.length === 0 ? (
        <Box className="py-12 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-300 bg-zinc-50">
          <Text className="uppercase tracking-widest text-sm font-onest">No Active Targets</Text>
        </Box>
      ) : (
        <Grid columns={{ initial: '1', md: '2', lg: '3' }} gap="4">
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
        </Grid>
      )}
    </Box>
  );
};
