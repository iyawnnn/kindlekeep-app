import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Flex, Text, Code, Button, Tooltip, Switch } from '@radix-ui/themes';
import { ArrowLeft, ShieldCheck, ShieldAlert, Copy, Activity, Pencil, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { api } from '../lib/axios';
import { UptimeStatus } from '../features/monitors/store/useMonitorStore';
import type { SecurityAuditResponse, UptimeLogResponse, MonitorDetailResponse, PublicStatusResponse } from '../features/monitors/types/monitor.types';
import { useSignalR } from '../features/monitors/hooks/useSignalR';
import { useToastStore } from '../components/ui/useToastStore';
import { EditMonitorModal } from '../features/monitors/components/EditMonitorModal';
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

    term.writeln('\x1b[1;34m>\x1b[0m Initializing Live Telemetry Terminal...');
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
    <Box className="max-w-7xl mx-auto py-10 px-6 font-onest">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black transition-colors mb-8">
        <ArrowLeft size={16} />
        <span>Return to Command Center</span>
      </Link>

      {monitor && (
        <Box className="bg-white border border-zinc-200 shadow-sm p-8 mb-8" style={{ borderRadius: 0 }}>
          <Flex align="center" justify="between" mb="4">
            <Box>
              <Text className="font-unbounded font-bold text-2xl text-zinc-900 block">{monitor.friendlyName}</Text>
              <Text className="font-mono text-sm text-zinc-500">{monitor.url}</Text>
            </Box>
            <Button variant="outline" color="gray" className="cursor-pointer font-mono" onClick={() => setIsEditOpen(true)}>
              <Pencil size={14} /> Edit
            </Button>
          </Flex>

          <Flex align="center" justify="between" className="p-4 border border-zinc-200 bg-zinc-50">
            <Box>
              <Text size="2" className="font-bold text-zinc-900 block">Public Status Page</Text>
              <Text size="2" className="text-zinc-500">Share a read-only uptime page, no login required.</Text>
            </Box>
            <Flex align="center" gap="3">
              {monitor.isPublic && monitor.publicSlug && (
                <>
                  <Button variant="ghost" className="cursor-pointer font-mono text-zinc-600" onClick={copyPublicLink}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : `/status/${monitor.publicSlug}`}
                  </Button>
                  <Button variant="ghost" className="cursor-pointer font-mono text-zinc-600" onClick={copyBadgeMarkdown}>
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
            </Flex>
          </Flex>
        </Box>
      )}

      <EditMonitorModal monitorId={id ?? ''} isOpen={isEditOpen} onOpenChange={setIsEditOpen} />

      <Box className="bg-white border border-zinc-200 shadow-sm p-8 mb-8" style={{ borderRadius: 0 }}>
        <Text className="font-unbounded font-bold text-2xl text-zinc-900 block mb-6">Protocol Timeline</Text>
        {historyLoading ? (
          <Text className="text-zinc-500">Compiling temporal data...</Text>
        ) : (
          <Flex gap="1" className="w-full h-16 items-end">
            {paddedHistory.map((log, index) => {
              let colorClass = 'bg-zinc-200';
              if (log) {
                if (log.status === UptimeStatus.Healthy) colorClass = 'bg-blue-500';
                else if (log.status === UptimeStatus.Degraded) colorClass = 'bg-amber-500';
                else if (log.status === UptimeStatus.Down) colorClass = 'bg-red-500';
              }

              const tooltipContent = log
                ? `${new Date(log.timestamp).toLocaleString()} - ${log.latencyMs}ms`
                : 'No data';

              return (
                <Tooltip
                  key={index}
                  content={
                    <Text className="font-mono" size="2">
                      {tooltipContent}
                    </Text>
                  }
                >
                  <Box
                    className={`flex-1 ${colorClass} hover:opacity-80 transition-opacity cursor-crosshair`}
                    style={{ height: log ? `${Math.max(10, Math.min(100, (log.latencyMs / 1000) * 100))}%` : '10%' }}
                  />
                </Tooltip>
              );
            })}
          </Flex>
        )}
        <Flex justify="between" mt="3">
          <Text size="2" className="text-zinc-500 font-mono">24 Hours Ago</Text>
          <Text size="2" className="text-zinc-500 font-mono">Current Vector</Text>
        </Flex>
      </Box>

      {dtaMetrics && (
        <Box className="bg-white border border-zinc-200 shadow-sm p-8 mb-8" style={{ borderRadius: 0 }}>
          <Flex align="center" justify="between" mb="6">
            <Text className="font-unbounded font-bold text-2xl text-zinc-900 flex items-center gap-3">
              <Activity className="text-blue-500" /> Temporal Breakdown (DTA)
            </Text>
            <Text className="text-zinc-500 font-mono text-sm">Last Ping: {dtaMetrics.total}ms</Text>
          </Flex>

          <Flex className="w-full h-8 mb-4 border border-zinc-200 overflow-hidden" style={{ borderRadius: 0 }}>
            <Box className="bg-zinc-400 hover:bg-zinc-500 transition-colors" style={{ width: `${dtaMetrics.handshakePct}%` }} title={`Handshake: ${dtaMetrics.handshake}ms`} />
            <Box className="bg-amber-500 hover:bg-amber-600 transition-colors" style={{ width: `${dtaMetrics.initLagPct}%` }} title={`INIT Lag: ${dtaMetrics.initLag}ms`} />
            <Box className="bg-blue-500 hover:bg-blue-600 transition-colors" style={{ width: `${dtaMetrics.transitPct}%` }} title={`Data Transit: ${dtaMetrics.transit}ms`} />
          </Flex>

          <Flex gap="6" className="font-mono text-sm">
            <Flex align="center" gap="2">
              <Box className="w-3 h-3 bg-zinc-400" />
              <Text className="text-zinc-700">TCP/TLS: {dtaMetrics.handshake}ms</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Box className="w-3 h-3 bg-amber-500" />
              <Text className="text-zinc-700">INIT: {dtaMetrics.initLag}ms</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Box className="w-3 h-3 bg-blue-500" />
              <Text className="text-zinc-700">Transit: {dtaMetrics.transit}ms</Text>
            </Flex>
          </Flex>
        </Box>
      )}

      <Box className="bg-white border border-zinc-200 shadow-sm p-8 mb-8" style={{ borderRadius: 0 }}>
        <Text className="font-unbounded font-bold text-2xl text-zinc-900 block mb-6">Sentinel Vault Integration</Text>

        {auditLoading ? (
          <Text className="text-zinc-500">Executing deep scan...</Text>
        ) : audit ? (
          <Flex direction="column" gap="6">
            <Flex align="center" justify="between" className="p-6 border border-zinc-200 bg-zinc-50">
              <Box>
                <Text size="2" className="text-zinc-500 block mb-1">Current Grade</Text>
                <Text className={`font-unbounded text-6xl font-black ${grade === 'A' ? 'text-blue-600' : 'text-black'}`}>{grade}</Text>
              </Box>
              <Box className="text-right">
                <Text size="2" className="text-zinc-500 block mb-1">SSL Integrity</Text>
                <Text className="block text-zinc-900 font-mono">{audit.sslIssuer || 'Unknown Issuer'}</Text>
                <Text size="2" className={`font-mono ${daysRemaining && daysRemaining < 14 ? 'text-red-600' : 'text-blue-600'}`}>
                  {daysRemaining !== null ? `${daysRemaining} Days Remaining` : 'No Expiry Data'}
                </Text>
              </Box>
            </Flex>

            <Box>
              <Text size="3" className="font-bold text-zinc-900 mb-3 block">Defense Checklist</Text>
              <Flex direction="column" gap="2">
                <HeaderStatusItem label="Content-Security-Policy" isPresent={audit.hasCsp} />
                <HeaderStatusItem label="Strict-Transport-Security" isPresent={audit.hasHsts} />
                <HeaderStatusItem label="X-Frame-Options" isPresent={audit.hasXfo} />
                <HeaderStatusItem label="X-Content-Type-Options" isPresent={audit.hasNosniff} />
              </Flex>
            </Box>

            {missingHeaders.length > 0 && (
              <Box>
                <Flex align="center" justify="between" className="mb-2">
                  <Text size="3" className="font-bold text-zinc-900 block">Blueprint Generator (vercel.json)</Text>
                  <Button variant="ghost" className="text-zinc-500 cursor-pointer" onClick={copyToClipboard}>
                    <Copy size={16} />
                    Copy
                  </Button>
                </Flex>
                <Box className="bg-zinc-50 border border-zinc-200 p-4">
                  <Code variant="ghost" className="text-zinc-700 whitespace-pre overflow-x-auto block font-mono">
                    {blueprintJson}
                  </Code>
                </Box>
              </Box>
            )}
          </Flex>
        ) : (
          <Text className="text-red-600">Security audit data unavailable.</Text>
        )}
      </Box>

      {/* Live Telemetry Terminal Section -- terminal chrome intentionally stays dark, like an IDE's integrated console */}
      <Box className="bg-zinc-900 border border-zinc-800 p-8" style={{ borderRadius: 0 }}>
        <Flex align="center" justify="between" className="mb-6">
          <Text className="text-2xl font-bold font-unbounded text-zinc-50">
            Live Telemetry
          </Text>
          <Box className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </Flex>
        <Box className="h-64 w-full overflow-hidden border border-zinc-800 bg-zinc-950" ref={terminalRef} />
      </Box>
    </Box>
  );
};

const HeaderStatusItem = ({ label, isPresent }: { label: string, isPresent: boolean }) => (
  <Flex align="center" justify="between" className="p-3 border border-zinc-200 bg-zinc-50">
    <Text className="text-zinc-700 font-mono">{label}</Text>
    {isPresent ? (
      <ShieldCheck className="text-blue-600" size={20} />
    ) : (
      <ShieldAlert className="text-red-600" size={20} />
    )}
  </Flex>
);