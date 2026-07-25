import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, ArrowLeft, Download, Server, Lock } from 'lucide-react';
import { api } from '../lib/axios';
import type { SecurityAuditResponse } from '../features/monitors/types/monitor.types';
import { remediationFilename } from '../lib/remediation';
import { GradeBadge } from '../features/monitors/components/GradeBadge';
import { HeaderChecklist } from '../features/monitors/components/HeaderChecklist';

interface VaultAuditDetail {
  id: string;
  sslIssuer: string | null;
  sslExpiryAt: string | null;
  hasCsp: boolean;
  hasHsts: boolean;
  hasXfo: boolean;
  hasNosniff: boolean;
  rawHeaders: string;
  createdAt: string;
}

interface VaultTargetResponse {
  monitorId: string;
  friendlyName: string;
  url: string;
  securityGrade: string;
  lastAudit: VaultAuditDetail | null;
}

const fetchVaultTargets = async (): Promise<VaultTargetResponse[]> => {
  const response = await api.get('/api/security/vault');
  return response.data;
};

export const Vault = () => {
  const { data: targets, isLoading, isError } = useQuery({
    queryKey: ['vaultTargets'],
    queryFn: fetchVaultTargets,
  });

  const [activeMonitorId, setActiveMonitorId] = useState<string | null>(null);

  const activeTarget = useMemo(() => {
    return targets?.find(t => t.monitorId === activeMonitorId) || null;
  }, [targets, activeMonitorId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-zinc-500">
        <p>Loading Sentinel Vault...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-red-600 max-w-7xl mx-auto">
        <p>Failed to load Sentinel Vault.</p>
      </div>
    );
  }

  if (activeTarget) {
    return <VaultDetailView target={activeTarget} onBack={() => setActiveMonitorId(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-black tracking-tight">
          Sentinel Vault
        </h1>
        <p className="text-zinc-500 mt-2">
          Continuous exposure management and protocol audits.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {targets?.map((target) => (
          <div
            key={target.monitorId}
            onClick={() => setActiveMonitorId(target.monitorId)}
            className="rounded-xl bg-white border border-zinc-200 shadow-sm hover:shadow-md p-6 cursor-pointer transition-all duration-150 hover:border-primary/40"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0">
                <p className="text-lg font-semibold text-zinc-800 truncate">
                  {target.friendlyName}
                </p>
                <p className="text-sm text-zinc-500 font-mono mt-1 truncate">
                  {target.url}
                </p>
              </div>
              <GradeBadge grade={target.securityGrade} size="md" />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <Lock size={14} strokeWidth={1.5} />
              <span>
                {target.lastAudit ? `Last Audit: ${new Date(target.lastAudit.createdAt).toLocaleDateString()}` : 'Pending Audit'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VaultDetailView = ({ target, onBack }: { target: VaultTargetResponse, onBack: () => void }) => {
  // The Vault list endpoint only returns header flags + SSL issuer/expiry (VaultAuditDetail).
  // The full audit (platform detection + real remediation snippet + TLS version) lives at the
  // per-monitor endpoint, same one SecurityDetailsModal already uses correctly.
  const { data: fullAudit } = useQuery<SecurityAuditResponse | null>({
    queryKey: ['securityAudit', target.monitorId],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/monitors/${target.monitorId}/audit`);
        return response.data;
      } catch (err) {
        if ((err as { response?: { status?: number } }).response?.status === 404) return null;
        throw err;
      }
    },
  });

  const audit = target.lastAudit;

  const handleExport = () => {
    if (!fullAudit?.remediationSnippet) return;
    const blob = new Blob([fullAudit.remediationSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = remediationFilename(fullAudit.detectedPlatform);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-black mb-8 -ml-3">
        <ArrowLeft size={16} strokeWidth={1.5} />
        Return to Vault
      </Button>

      <header className="mb-8">
        <div className="flex items-center gap-4">
          <GradeBadge grade={target.securityGrade} size="lg" />
          <div>
            <h1 className="text-3xl font-semibold text-black tracking-tight">
              {target.friendlyName}
            </h1>
            <p className="text-zinc-500 font-mono mt-1">{target.url}</p>
          </div>
        </div>
      </header>

      {!audit ? (
        <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-8 text-center text-zinc-500">
          <Server size={32} strokeWidth={1.5} className="mx-auto mb-4 opacity-50" />
          <p>Audit data has not been generated for this target.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <p className="text-xl font-semibold text-zinc-900">SSL Certificate Path</p>
              </div>
              <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                <div>
                  <p className="text-zinc-500 text-xs font-semibold mb-1">Issuer Authority</p>
                  <p className="text-zinc-800">{audit.sslIssuer || 'Unknown or Self-Signed'}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-semibold mb-1">Expiration Date</p>
                  <p className={audit.sslExpiryAt && new Date(audit.sslExpiryAt) < new Date() ? 'text-red-600' : 'text-zinc-800'}>
                    {audit.sslExpiryAt ? new Date(audit.sslExpiryAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                {fullAudit?.tlsVersion && (
                  <div>
                    <p className="text-zinc-500 text-xs font-semibold mb-1">TLS Version</p>
                    <p className="text-zinc-800">{fullAudit.tlsVersion}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <p className="text-xl font-semibold text-zinc-900">Header Analysis</p>
              </div>
              <HeaderChecklist
                items={[
                  { label: 'Strict-Transport-Security', present: audit.hasHsts },
                  { label: 'Content-Security-Policy', present: audit.hasCsp },
                  { label: 'X-Frame-Options', present: audit.hasXfo },
                  { label: 'X-Content-Type-Options', present: audit.hasNosniff },
                ]}
              />
            </div>
          </div>

          <div>
            {fullAudit?.remediationSnippet ? (
              <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xl font-semibold text-zinc-900">Suggested Fix</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      {fullAudit.detectedPlatform ? `Recommended ${fullAudit.detectedPlatform} configuration` : 'Recommended configuration'}
                    </p>
                  </div>
                  <Button onClick={handleExport} className="gap-2">
                    <Download size={16} strokeWidth={1.5} />
                    Export
                  </Button>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 overflow-x-auto">
                  <pre className="text-zinc-700 whitespace-pre font-mono text-sm">
                    {fullAudit.remediationSnippet}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 flex flex-col items-center justify-center h-full text-center">
                <ShieldCheck size={48} strokeWidth={1.5} className="text-primary mb-4" />
                <p className="text-xl font-semibold text-zinc-900">Optimal Posture</p>
                <p className="text-sm text-zinc-500 mt-2">All primary security headers are actively enforced.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
