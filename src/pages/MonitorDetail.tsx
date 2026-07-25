import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Activity, Pencil, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { api } from '../lib/axios';
import { UptimeStatus } from '../features/monitors/store/useMonitorStore';
import type { SecurityAuditResponse, UptimeLogResponse, MonitorDetailResponse, PublicStatusResponse } from '../features/monitors/types/monitor.types';
import { useSignalR } from '../features/monitors/hooks/useSignalR';
import { useToastStore } from '../components/ui/useToastStore';
import { EditMonitorModal } from '../features/monitors/components/EditMonitorModal';
import { GradeBadge } from '../features/monitors/components/GradeBadge';
import { HeaderChecklist } from '../features/monitors/components/HeaderChecklist';
import '@xterm/xterm/css/xterm.css';

export const MonitorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);

  const { data: monitor } = useQuery<MonitorDetailResponse>({
    queryKey: ['monitor', id],
    queryFn: async () => {
      const response = await api.get(`/api/monitors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: history, isLoading: historyLoading } = useQuery<UptimeLogResponse[]>({
    queryKey: ['monitorHistory', id],
    queryFn: async () => {
      const response = await api.get(`/api/monitors/${id}/history`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 60000,
  });

  const handleTogglePublic = async (enabled: boolean) => {
    if (!id) return;
    setIsTogglingPublic(true);
    try {
      await api.patch<PublicStatusResponse>(`/api/monitors/${id}/public-status`, { enabled });
      queryClient.invalidateQueries({ queryKey: ['monitor', id] });
    } catch {
      useToastStore.getState().error('Failed to update public status page.');
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const copyPublicLink = async () => {
    if (!monitor?.publicSlug) return;
    await navigator.clipboard.writeText(`${window.location.origin}/status/${monitor.publicSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBadgeMarkdown = async () => {
    if (!monitor?.publicSlug) return;
    const badgeUrl = `${api.defaults.baseURL}/api/public/monitors/${monitor.publicSlug}/badge.svg`;
    const statusUrl = `${window.location.origin}/status/${monitor.publicSlug}`;
    await navigator.clipboard.writeText(`[![kindlekeep](${badgeUrl})](${statusUrl})`);
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 2000);
  };

  const { data: audit, isLoading: auditLoading } = useQuery<SecurityAuditResponse>({
    queryKey: ['securityAudit', id],
    queryFn: async () => {
      const response = await api.get(`/api/monitors/${id}/audit`);
      return response.data;
    },
    enabled: !!id,
  });

  // Log handler passed to the SignalR hook
  const handleLog = useCallback((log: string) => {
    if (xtermInstance.current) {
      xtermInstance.current.writeln(`\x1b[90m[${new Date().toLocaleTimeString()}]\x1b[0m ${log}`);
    }
  }, []);

  const token = localStorage.getItem('jwt_token');

  // The useSignalR hook now internally manages the connection state guard
  // and ensures SubscribeToMonitor is only called after the connection is established.
  useSignalR(token, { monitorId: id, onLog: handleLog });

  useEffect(() => {
    if (!terminalRef.current) return;

    const fitAddon = new FitAddon();
    const term = new Terminal({
      theme: {
        background: '#18181b',
        foreground: '#e4e4e7',
        cursor: '#3b82f6',
        selectionBackground: '#3f3f46',
      },
      fontFamily: 'monospace',
      fontSize: 13,
      cursorBlink: true,
      disableStdin: true,
      convertEol: true,
    });

    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermInstance.current = term;

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalRef.current);

    term.writeln('\x1b[1;34m>\x1b[0m Initializing live telemetry terminal...');
    term.writeln('\x1b[1;34m>\x1b[0m Establishing secure transport layer via SignalR...');

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      xtermInstance.current = null;
    };
  }, []);

  const paddedHistory = useMemo(() => {
    if (!history) return Array(144).fill(null);
    const padding = Array(Math.max(0, 144 - history.length)).fill(null);
    return [...padding, ...history];
  }, [history]);

  const latestLog = history && history.length > 0 ? history[history.length - 1] : null;

  const dtaMetrics = useMemo(() => {
    if (!latestLog) return null;
    const total = latestLog.latencyMs;
    const handshake = Math.min(100, total * 0.3);
    const isColdStart = total > 800;
    const initLag = isColdStart ? total - handshake - (total * 0.2) : Math.min(50, total * 0.2);
    const transit = Math.max(0, total - handshake - initLag);

    return {
      total,
      handshake: Math.round(handshake),
      initLag: Math.round(initLag),
      transit: Math.round(transit),
      handshakePct: (handshake / total) * 100,
      initLagPct: (initLag / total) * 100,
      transitPct: (transit / total) * 100,
    };
  }, [latestLog]);

  const { grade, missingHeaders, blueprintJson, daysRemaining } = useMemo(() => {
    if (!audit) return { grade: 'U', missingHeaders: [], blueprintJson: '', daysRemaining: null };

    const headers = [
      { key: 'Content-Security-Policy', value: "default-src 'self'", present: audit.hasCsp },
      { key: 'Strict-Transport-Security', value: "max-age=63072000; includeSubDomains; preload", present: audit.hasHsts },
      { key: 'X-Frame-Options', value: "DENY", present: audit.hasXfo },
      { key: 'X-Content-Type-Options', value: "nosniff", present: audit.hasNosniff }
    ];

    const presentCount = headers.filter(h => h.present).length;
    const calculatedGrade = presentCount === 4 ? 'A' : presentCount === 3 ? 'B' : presentCount === 2 ? 'C' : presentCount === 1 ? 'D' : 'F';
    const missing = headers.filter(h => !h.present);

    let days = null;
    if (audit.sslExpiryAt) {
      const diffTime = Math.abs(new Date(audit.sslExpiryAt).getTime() - new Date().getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const blueprint = missing.length > 0 ? JSON.stringify({
      headers: [{ source: "/(.*)", headers: missing.map(h => ({ key: h.key, value: h.value })) }]
    }, null, 2) : '';

    return { grade: calculatedGrade, missingHeaders: missing, blueprintJson: blueprint, daysRemaining: days };
  }, [audit]);

  const copyToClipboard = async () => {
    if (blueprintJson) {
      await navigator.clipboard.writeText(blueprintJson);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black transition-colors mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span>Back to dashboard</span>
      </Link>

      {monitor && (
        <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{monitor.friendlyName}</p>
              <p className="font-mono text-sm text-zinc-500">{monitor.url}</p>
            </div>
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil size={14} strokeWidth={1.5} /> Edit
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Public Status Page</p>
              <p className="text-sm text-zinc-500">Share a read-only uptime page, no login required.</p>
            </div>
            <div className="flex items-center gap-3">
              {monitor.isPublic && monitor.publicSlug && (
                <>
                  <Button variant="ghost" size="sm" className="font-mono text-zinc-600" onClick={copyPublicLink}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : `/status/${monitor.publicSlug}`}
                  </Button>
                  <Button variant="ghost" size="sm" className="font-mono text-zinc-600" onClick={copyBadgeMarkdown}>
                    {badgeCopied ? <Check size={14} /> : <Copy size={14} />}
                    {badgeCopied ? 'Copied' : 'README badge'}
                  </Button>
                </>
              )}
              <Switch
                checked={monitor.isPublic}
                disabled={isTogglingPublic}
                onCheckedChange={handleTogglePublic}
              />
            </div>
          </div>
        </div>
      )}

      <EditMonitorModal monitorId={id ?? ''} isOpen={isEditOpen} onOpenChange={setIsEditOpen} />

      <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-8 mb-8">
        <p className="text-2xl font-semibold text-zinc-900 mb-6">Uptime Timeline</p>
        {historyLoading ? (
          <p className="text-zinc-500">Loading history...</p>
        ) : (
          <div className="flex gap-1 w-full h-16 items-end">
            {paddedHistory.map((log, index) => {
              let colorClass = 'bg-zinc-200';
              if (log) {
                if (log.status === UptimeStatus.Healthy) colorClass = 'bg-primary';
                else if (log.status === UptimeStatus.Degraded) colorClass = 'bg-amber-500';
                else if (log.status === UptimeStatus.Down) colorClass = 'bg-red-500';
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
        )}
        <div className="flex justify-between mt-3">
          <span className="text-sm text-zinc-500 font-mono">24 hours ago</span>
          <span className="text-sm text-zinc-500 font-mono">Now</span>
        </div>
      </div>

      {dtaMetrics && (
        <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-2xl font-semibold text-zinc-900 flex items-center gap-3">
              <Activity className="text-primary" strokeWidth={1.5} /> Latency Breakdown
            </p>
            <span className="text-zinc-500 font-mono text-sm">Last Ping: {dtaMetrics.total}ms</span>
          </div>

          <div className="flex w-full h-8 mb-4 rounded-lg border border-zinc-200 overflow-hidden">
            <div className="bg-zinc-400 hover:bg-zinc-500 transition-colors" style={{ width: `${dtaMetrics.handshakePct}%` }} title={`Handshake: ${dtaMetrics.handshake}ms`} />
            <div className="bg-amber-500 hover:bg-amber-600 transition-colors" style={{ width: `${dtaMetrics.initLagPct}%` }} title={`Init lag: ${dtaMetrics.initLag}ms`} />
            <div className="bg-primary hover:bg-primary/90 transition-colors" style={{ width: `${dtaMetrics.transitPct}%` }} title={`Data transit: ${dtaMetrics.transit}ms`} />
          </div>

          <div className="flex gap-6 font-mono text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-zinc-400" />
              <span className="text-zinc-700">TCP/TLS: {dtaMetrics.handshake}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              <span className="text-zinc-700">Init: {dtaMetrics.initLag}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-zinc-700">Transit: {dtaMetrics.transit}ms</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-8 mb-8">
        <p className="text-2xl font-semibold text-zinc-900 mb-6">Security Audit</p>

        {auditLoading ? (
          <p className="text-zinc-500">Running scan...</p>
        ) : audit ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-6 rounded-lg border border-zinc-200 bg-zinc-50">
              <GradeBadge grade={grade} size="xl" showLabel />
              <div className="text-right">
                <p className="text-sm text-zinc-500 mb-1">SSL Integrity</p>
                <p className="text-zinc-900 font-mono">{audit.sslIssuer || 'Unknown Issuer'}</p>
                <p className={`text-sm font-mono ${daysRemaining && daysRemaining < 14 ? 'text-red-600' : 'text-primary'}`}>
                  {daysRemaining !== null ? `${daysRemaining} Days Remaining` : 'No Expiry Data'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900 mb-3">Header Checklist</p>
              <HeaderChecklist
                items={[
                  { label: 'Content-Security-Policy', present: audit.hasCsp },
                  { label: 'Strict-Transport-Security', present: audit.hasHsts },
                  { label: 'X-Frame-Options', present: audit.hasXfo },
                  { label: 'X-Content-Type-Options', present: audit.hasNosniff },
                ]}
              />
            </div>

            {missingHeaders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-zinc-900">Suggested Fix (vercel.json)</p>
                  <Button variant="ghost" size="sm" className="text-zinc-500" onClick={copyToClipboard}>
                    <Copy size={16} />
                    Copy
                  </Button>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <pre className="text-zinc-700 whitespace-pre overflow-x-auto font-mono text-sm">
                    {blueprintJson}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-600">Security audit data unavailable.</p>
        )}
      </div>

      {/* Live telemetry terminal chrome intentionally stays dark, like an IDE's integrated console */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-2xl font-semibold text-zinc-50">
            Live Telemetry
          </p>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
        <div className="h-64 w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" ref={terminalRef} />
      </div>
    </div>
  );
};
