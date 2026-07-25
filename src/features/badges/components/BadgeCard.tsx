// src/features/badges/components/BadgeCard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { api } from '../../../lib/axios';

interface BadgeCardProps {
  monitorId: string;
  friendlyName: string;
  url: string;
  isPublic: boolean;
  publicSlug: string | null;
}

const SnippetRow = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box className="bg-zinc-50 border border-zinc-200 p-3">
      <Flex align="center" justify="between" className="mb-2">
        <Text size="1" className="uppercase tracking-wider font-bold text-zinc-500 font-onest">{label}</Text>
        <Button variant="ghost" size="1" className="cursor-pointer text-zinc-500 font-onest" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Flex>
      <Text className="font-mono text-xs text-zinc-700 break-all block">{value}</Text>
    </Box>
  );
};

export const BadgeCard = ({ monitorId, friendlyName, url, isPublic, publicSlug }: BadgeCardProps) => {
  const badgeUrl = publicSlug ? `${api.defaults.baseURL}/api/public/monitors/${publicSlug}/badge.svg` : null;
  const statusUrl = publicSlug ? `${window.location.origin}/status/${publicSlug}` : null;
  const markdown = badgeUrl && statusUrl ? `[![kindlekeep](${badgeUrl})](${statusUrl})` : null;

  return (
    <Box className="bg-white border border-zinc-200 shadow-sm p-6" style={{ borderRadius: 0 }}>
      <Box className="mb-4">
        <Text className="text-lg font-bold font-onest tracking-wide text-zinc-800 block truncate">
          {friendlyName}
        </Text>
        <Text className="text-sm text-zinc-500 font-mono mt-1 block truncate">{url}</Text>
      </Box>

      {isPublic && badgeUrl && markdown ? (
        <Flex direction="column" gap="3">
          <Box className="p-4 bg-zinc-50 border border-zinc-200 flex items-center justify-center">
            <img src={badgeUrl} alt={`${friendlyName} status badge`} />
          </Box>
          <SnippetRow label="Markdown" value={markdown} />
          <SnippetRow label="Badge URL" value={badgeUrl} />
        </Flex>
      ) : (
        <Flex direction="column" align="center" justify="center" gap="3" className="py-8 border border-dashed border-zinc-300 bg-zinc-50 text-center">
          <Text size="2" className="text-zinc-500 font-onest">Enable the public status page to get a badge.</Text>
          <Link to={`/dashboard/monitor/${monitorId}`}>
            <Button variant="outline" color="gray" className="cursor-pointer font-onest">
              <ExternalLink size={14} strokeWidth={1} />
              Open monitor
            </Button>
          </Link>
        </Flex>
      )}
    </Box>
  );
};
