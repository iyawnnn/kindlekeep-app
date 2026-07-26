// src/pages/PublicStatusHub.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UptimeTimeline } from '@/components/ui/UptimeTimeline';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { api } from '../lib/axios';
import { UptimeStatus } from '../features/monitors/store/useMonitorStore';
import { AggregateStatus } from '../features/status-hub/types/statusHub.types';
import type { PublicStatusPageResponse, PublicServiceResponse } from '../features/status-hub/types/statusHub.types';

const STATUS_LABEL: Record<number, string> = {
  [UptimeStatus.Healthy]: 'Operational',
  [UptimeStatus.Degraded]: 'Degraded',
  [UptimeStatus.Down]: 'Down',
  [UptimeStatus.Quarantined]: 'Down',
};

const STATUS_COLOR: Record<number, string> = {
  [UptimeStatus.Healthy]: 'text-primary',
  [UptimeStatus.Degraded]: 'text-amber-600',
  [UptimeStatus.Down]: 'text-red-600',
  [UptimeStatus.Quarantined]: 'text-red-600',
};

const AGGREGATE_BANNER: Record<number, { label: string; icon: typeof CheckCircle2; className: string }> = {
  [AggregateStatus.Operational]: { label: 'All Systems Operational', icon: CheckCircle2, className: 'bg-primary/10 text-primary' },
  [AggregateStatus.PartialOutage]: { label: 'Partial System Outage', icon: AlertTriangle, className: 'bg-amber-50 text-amber-700' },
  [AggregateStatus.MajorOutage]: { label: 'Major System Outage', icon: XCircle, className: 'bg-red-50 text-red-700' },
};

const groupBySection = (services: PublicServiceResponse[]) => {
  const sections = new Map<string, PublicServiceResponse[]>();
  for (const service of services) {
    const key = service.sectionName ?? '';
    const list = sections.get(key) ?? [];
    list.push(service);
    sections.set(key, list);
  }
  return sections;
};

export const PublicStatusHub = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery<PublicStatusPageResponse>({
    queryKey: ['publicStatusHub', slug],
    queryFn: async () => {
      const response = await api.get(`/api/public/status-pages/${slug}`);
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

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-zinc-500">This status page is unavailable.</p>
      </div>
    );
  }

  const banner = AGGREGATE_BANNER[page.aggregateStatus] ?? AGGREGATE_BANNER[AggregateStatus.Operational];
  const BannerIcon = banner.icon;
  const sections = groupBySection(page.services);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="" className="size-7 rounded-md" />
          <span className="text-xl font-semibold text-black tracking-tight lowercase">kindlekeep</span>
        </div>

        <h1 className="text-2xl font-semibold text-zinc-900 mb-6">{page.name}</h1>

        <div className={`flex items-center gap-3 rounded-xl p-6 mb-6 ${banner.className}`}>
          <BannerIcon strokeWidth={1.5} className="w-6 h-6 shrink-0" />
          <p className="text-lg font-semibold">{banner.label}</p>
        </div>

        <div className="flex flex-col gap-8">
          {[...sections.entries()].map(([sectionName, services]) => (
            <div key={sectionName || 'ungrouped'}>
              {sectionName && (
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">{sectionName}</p>
              )}
              <div className="flex flex-col gap-6">
                {services.map((service) => (
                  <div key={service.displayName} className="rounded-xl bg-white border border-zinc-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-semibold text-zinc-900">{service.displayName}</p>
                      <span className={`text-sm font-semibold ${STATUS_COLOR[service.currentUptimeStatus] ?? 'text-zinc-500'}`}>
                        {STATUS_LABEL[service.currentUptimeStatus] ?? 'Unknown'}
                      </span>
                    </div>
                    <UptimeTimeline history={service.recent24h} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {page.recentIncidents.length > 0 && (
          <div className="mt-10 rounded-xl bg-white border border-zinc-200 p-6">
            <p className="text-lg font-semibold text-zinc-900 mb-4">Past Incidents</p>
            <div className="flex flex-col gap-3">
              {page.recentIncidents.map((incident, index) => (
                <div key={index} className="flex items-center justify-between text-sm border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-zinc-800">{incident.monitorDisplayName}</p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      {new Date(incident.createdAt).toLocaleString()} &middot; {incident.incidentType}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {incident.mttrMinutes !== null ? `MTTR ${incident.mttrMinutes}m` : 'Ongoing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
