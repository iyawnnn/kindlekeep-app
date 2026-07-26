import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { remediationFilename } from '../../../lib/remediation';
import { useMemo, useState } from 'react';
import { GradeBadge } from './GradeBadge';
import { HeaderChecklist } from './HeaderChecklist';

export interface SecurityAuditResponse {
  hasCsp: boolean;
  hasHsts: boolean;
  hasXfo: boolean;
  hasNosniff: boolean;
  sslIssuer: string | null;
  sslExpiryAt: string | null;
  rawHeaders: string | null;
  tlsVersion: string | null;
  detectedPlatform: string | null;
  remediationSnippet: string | null;
}

interface CopilotResponse {
  explanation: string | null;
  detectedPlatform: string | null;
  remediationSnippet: string | null;
}

interface SecurityDetailsModalProps {
  monitorId: string;
  grade: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecurityDetailsModal = ({ monitorId, grade, isOpen, onOpenChange }: SecurityDetailsModalProps) => {
  const { data: audit, isLoading, error } = useQuery<SecurityAuditResponse | null>({
    queryKey: ['securityAudit', monitorId],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/monitors/${monitorId}/audit`);
        return response.data;
      } catch (err) {
        // Intercept 404 as an expected pending state rather than a query failure
        if ((err as { response?: { status?: number } }).response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: isOpen,
    retry: (failureCount, err: unknown) => {
      if ((err as { response?: { status?: number } }).response?.status === 404) return false;
      return failureCount < 3;
    }
  });

  const daysRemaining = useMemo(() => {
    if (!audit?.sslExpiryAt) return null;
    // Signed: negative means the certificate has already expired (do not use Math.abs here).
    const diffMs = new Date(audit.sslExpiryAt).getTime() - new Date().getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [audit]);

  const copyToClipboard = async () => {
    if (audit?.remediationSnippet) {
      await navigator.clipboard.writeText(audit.remediationSnippet);
    }
  };

  const [copilotError, setCopilotError] = useState(false);
  const copilotMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get<CopilotResponse>(`/api/monitors/${monitorId}/copilot`);
      return response.data;
    },
    onMutate: () => setCopilotError(false),
    onError: () => setCopilotError(true),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
        <DialogTitle>Security Audit</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed security audit results
        </DialogDescription>

        {isLoading && (
          <p className="text-zinc-500">Running scan...</p>
        )}

        {error && (
          <p className="text-red-600">Failed to retrieve security audit.</p>
        )}

        {!isLoading && !error && audit === null && (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-center">
            <p className="font-medium tracking-wide mb-2">Awaiting first scan</p>
            <p className="text-sm opacity-70">This target is currently being profiled.</p>
          </div>
        )}

        {audit && (
          <div className="flex flex-col gap-5 min-w-0">
            <div className="flex items-center justify-between p-6 rounded-lg border border-zinc-200 bg-zinc-50">
              <GradeBadge grade={grade} size="xl" showLabel />
              <div className="text-right">
                <p className="text-sm text-zinc-500 mb-1">SSL Integrity</p>
                <p className="text-zinc-900">{audit.sslIssuer || 'Unknown Issuer'}</p>
                <p className={`text-sm ${daysRemaining !== null && daysRemaining < 14 ? 'text-red-600' : 'text-primary'}`}>
                  {daysRemaining === null
                    ? 'No Expiry Data'
                    : daysRemaining < 0
                      ? `Expired ${Math.abs(daysRemaining)} Days Ago`
                      : `${daysRemaining} Days Remaining`}
                </p>
                {audit.tlsVersion && (
                  <p className="text-xs font-mono text-zinc-500 mt-1">{audit.tlsVersion}</p>
                )}
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

            {audit.remediationSnippet && grade !== 'A' && (
              <div className="min-w-0">
                {!copilotMutation.data?.explanation && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copilotMutation.mutate()}
                    disabled={copilotMutation.isPending}
                    className="mb-3"
                  >
                    <Sparkles size={16} />
                    {copilotMutation.isPending ? 'Asking Copilot...' : 'Ask Copilot'}
                  </Button>
                )}

                {copilotError && (
                  <p className="text-xs text-red-600 mb-3">Copilot is busy, try again shortly.</p>
                )}

                {copilotMutation.isSuccess && !copilotMutation.data?.explanation && (
                  <p className="text-xs text-zinc-500 mb-3">
                    Copilot couldn't generate an explanation right now — the snippet below still works.
                  </p>
                )}

                {copilotMutation.data?.explanation && (
                  <p className="text-sm text-zinc-700 leading-relaxed mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    {copilotMutation.data.explanation}
                  </p>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Suggested Fix{audit.detectedPlatform ? ` (${audit.detectedPlatform})` : ''}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">
                      {remediationFilename(audit.detectedPlatform)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-zinc-500">
                    <Copy size={16} />
                    Copy
                  </Button>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <pre className="text-zinc-700 whitespace-pre overflow-x-auto font-mono text-sm">
                    {audit.remediationSnippet}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
