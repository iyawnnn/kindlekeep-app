import { Dialog, Flex, Text, Box, Code, Button } from '@radix-ui/themes';
import { ShieldCheck, ShieldAlert, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useMemo } from 'react';

export interface SecurityAuditResponse {
  hasCsp: boolean;
  hasHsts: boolean;
  hasXfo: boolean;
  hasNosniff: boolean;
  sslIssuer: string | null;
  sslExpiryAt: string | null;
  rawHeaders: string | null;
  tlsVersion: string | null;
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

  // Grade is the authoritative value computed by the backend (headers + TLS + cert), passed in as a
  // prop. Here we only derive which headers are missing, to drive the remediation blueprint below.
  const missingHeaders = useMemo(() => {
    if (!audit) return [];

    const headers = [
      { key: 'Content-Security-Policy', value: "default-src 'self'", present: audit.hasCsp },
      { key: 'Strict-Transport-Security', value: "max-age=63072000; includeSubDomains; preload", present: audit.hasHsts },
      { key: 'X-Frame-Options', value: "DENY", present: audit.hasXfo },
      { key: 'X-Content-Type-Options', value: "nosniff", present: audit.hasNosniff }
    ];

    return headers.filter(h => !h.present);
  }, [audit]);

  const daysRemaining = useMemo(() => {
    if (!audit?.sslExpiryAt) return null;
    // Signed: negative means the certificate has already expired (do not use Math.abs here).
    const diffMs = new Date(audit.sslExpiryAt).getTime() - new Date().getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [audit]);

  const blueprintJson = useMemo(() => {
    if (missingHeaders.length === 0) return '';
    return JSON.stringify({
      headers: [
        {
          source: "/(.*)",
          headers: missingHeaders.map(h => ({ key: h.key, value: h.value }))
        }
      ]
    }, null, 2);
  }, [missingHeaders]);

  const copyToClipboard = async () => {
    if (blueprintJson) {
      await navigator.clipboard.writeText(blueprintJson);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="bg-white border border-zinc-200 rounded-none font-onest"
        style={{ borderRadius: 0 }}
        maxWidth="600px"
        aria-describedby={undefined}
      >
        <Dialog.Title className="font-unbounded font-bold text-zinc-900 mb-4">
          Sentinel Vault
        </Dialog.Title>
        <Dialog.Description className="sr-only">
          Detailed security audit results
        </Dialog.Description>

        {isLoading && (
          <Text className="text-zinc-500">Executing deep scan...</Text>
        )}

        {error && (
          <Text className="text-red-600">Failed to retrieve security audit.</Text>
        )}

        {!isLoading && !error && audit === null && (
          <Flex direction="column" align="center" justify="center" className="h-48 text-zinc-500">
            <Text size="3" className="font-medium tracking-wide block mb-2 font-onest">Awaiting Telemetry</Text>
            <Text size="2" className="opacity-70 font-onest">The Sentinel Engine is currently profiling this target.</Text>
          </Flex>
        )}

        {audit && (
          <Flex direction="column" gap="5">
            <Flex align="center" justify="between" className="p-6 border border-zinc-200 bg-zinc-50">
              <Box>
                <Text size="2" className="text-zinc-500 block mb-1 font-onest">Current Grade</Text>
                <Text className={`font-unbounded text-6xl font-black ${grade === 'A' ? 'text-blue-600' : 'text-black'}`}>{grade}</Text>
              </Box>
              <Box className="text-right">
                <Text size="2" className="text-zinc-500 block mb-1 font-onest">SSL Integrity</Text>
                <Text className="block text-zinc-900 font-onest">{audit.sslIssuer || 'Unknown Issuer'}</Text>
                <Text size="2" className={`font-onest block ${daysRemaining !== null && daysRemaining < 14 ? 'text-red-600' : 'text-blue-600'}`}>
                  {daysRemaining === null
                    ? 'No Expiry Data'
                    : daysRemaining < 0
                      ? `Expired ${Math.abs(daysRemaining)} Days Ago`
                      : `${daysRemaining} Days Remaining`}
                </Text>
                {audit.tlsVersion && (
                  <Text size="1" className="font-mono text-zinc-500 block mt-1">{audit.tlsVersion}</Text>
                )}
              </Box>
            </Flex>

            <Box>
              <Text size="3" className="font-bold text-zinc-900 mb-3 block font-onest">Defense Checklist</Text>
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
                  <Text size="3" className="font-bold text-zinc-900 block font-onest">Blueprint Generator (vercel.json)</Text>
                  <Button variant="ghost" className="text-zinc-500 cursor-pointer font-onest" onClick={copyToClipboard}>
                    <Copy size={16} />
                    Copy
                  </Button>
                </Flex>
                <Box className="bg-zinc-50 border border-zinc-200 p-4 relative">
                  <Code variant="ghost" className="text-zinc-700 whitespace-pre overflow-x-auto block font-mono">
                    {blueprintJson}
                  </Code>
                </Box>
              </Box>
            )}
          </Flex>
        )}

        <Flex gap="3" mt="5" justify="end">
          <Dialog.Close>
            <Button variant="soft" className="bg-zinc-100 text-zinc-900 cursor-pointer rounded-none font-onest" style={{ borderRadius: 0 }}>
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const HeaderStatusItem = ({ label, isPresent }: { label: string, isPresent: boolean }) => (
  <Flex align="center" justify="between" className="p-3 border border-zinc-200 bg-zinc-50">
    <Text className="text-zinc-700 font-onest">{label}</Text>
    {isPresent ? (
      <ShieldCheck className="text-blue-600" size={20} />
    ) : (
      <ShieldAlert className="text-red-600" size={20} />
    )}
  </Flex>
);