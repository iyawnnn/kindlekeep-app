// src/components/ui/UptimeTimeline.tsx
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UptimeStatus } from '../../features/monitors/store/useMonitorStore';
import type { UptimeLogResponse } from '../../features/monitors/types/monitor.types';

interface UptimeTimelineProps {
  history: UptimeLogResponse[];
  barCount?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export const UptimeTimeline = ({ history, barCount = 144, leftLabel = '24 hours ago', rightLabel = 'Now' }: UptimeTimelineProps) => {
  const padding = Array(Math.max(0, barCount - history.length)).fill(null);
  const paddedHistory: (UptimeLogResponse | null)[] = [...padding, ...history];

  return (
    <div>
      <div className="flex gap-1 w-full h-16 items-end">
        {paddedHistory.map((log, index) => {
          let colorClass = 'bg-zinc-200';
          if (log) {
            if (log.status === UptimeStatus.Healthy) colorClass = 'bg-primary';
            else if (log.status === UptimeStatus.Degraded) colorClass = 'bg-amber-500';
            else colorClass = 'bg-red-500';
          }

          const tooltipContent = log
            ? `${new Date(log.timestamp).toLocaleString()} - ${log.latencyMs}ms`
            : 'No data';

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`flex-1 rounded-sm ${colorClass} hover:opacity-80 transition-opacity cursor-crosshair`}
                  style={{ height: log ? `${Math.max(10, Math.min(100, (log.latencyMs / 1000) * 100))}%` : '10%' }}
                />
              </TooltipTrigger>
              <TooltipContent className="font-mono">{tooltipContent}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex justify-between mt-3">
        <span className="text-sm text-zinc-500 font-mono">{leftLabel}</span>
        <span className="text-sm text-zinc-500 font-mono">{rightLabel}</span>
      </div>
    </div>
  );
};
