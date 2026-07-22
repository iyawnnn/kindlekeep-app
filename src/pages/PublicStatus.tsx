// src/pages/PublicStatus.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Flex, Text, Tooltip } from '@radix-ui/themes';
import { Globe } from 'lucide-react';
import { useMemo } from 'react';
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

  const paddedHistory = useMemo(() => {
    if (!monitor?.history) return Array(144).fill(null);
    const padding = Array(Math.max(0, 144 - monitor.history.length)).fill(null);
    return [...padding, ...monitor.history];
  }, [monitor]);

  if (isLoading) {
    return (
      <Flex align="center" justify="center" className="min-h-screen bg-white">
        <Text className="text-zinc-500 font-onest">Loading status...</Text>
      </Flex>
    );
  }

  if (error || !monitor) {
    return (
      <Flex align="center" justify="center" className="min-h-screen bg-white">
        <Text className="text-zinc-500 font-onest">This status page is unavailable.</Text>
      </Flex>
    );
  }

  const isHealthy = monitor.isActive && monitor.currentUptimeStatus === UptimeStatus.Healthy;

  return (
    <Box className="min-h-screen bg-white font-onest">
      <Box className="max-w-3xl mx-auto py-16 px-6">
        <Flex align="center" gap="2" mb="8">
          <Text className="font-wordmark text-xl text-black tracking-tight lowercase">kindlekeep</Text>
        </Flex>

        <Flex align="center" justify="between" className="p-8 border border-zinc-200 mb-6" style={{ borderRadius: 0 }}>
          <Flex align="center" gap="3">
            <Globe strokeWidth={1} className={`w-6 h-6 ${isHealthy ? 'text-blue-500' : 'text-zinc-400'}`} />
            <Text className="font-unbounded font-bold text-2xl text-zinc-900">{monitor.friendlyName}</Text>
          </Flex>
          <Text className={`text-sm uppercase tracking-widest font-bold ${isHealthy ? 'text-blue-600' : 'text-red-600'}`}>
            {monitor.isActive ? (isHealthy ? 'Operational' : 'Down') : 'Paused'}
          </Text>
        </Flex>

        <Box className="bg-white border border-zinc-200 p-8" style={{ borderRadius: 0 }}>
          <Text className="font-unbounded font-bold text-lg text-zinc-900 block mb-6">Uptime History</Text>
          <Flex gap="1" className="w-full h-16 items-end">
            {paddedHistory.map((log, index) => {
              let colorClass = 'bg-zinc-200';
              if (log) {
                colorClass = log.status === UptimeStatus.Healthy ? 'bg-blue-500' : 'bg-red-500';
              }

              const tooltipContent = log
                ? `${new Date(log.timestamp).toLocaleString()} - ${log.latencyMs}ms`
                : 'No data';

              return (
                <Tooltip key={index} content={<Text className="font-mono" size="2">{tooltipContent}</Text>}>
                  <Box className={`flex-1 ${colorClass}`} style={{ height: '100%' }} />
                </Tooltip>
              );
            })}
          </Flex>
          <Flex justify="between" mt="3">
            <Text size="2" className="text-zinc-500 font-mono">24 Hours Ago</Text>
            <Text size="2" className="text-zinc-500 font-mono">Now</Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
