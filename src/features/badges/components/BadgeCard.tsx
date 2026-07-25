// src/features/badges/components/BadgeCard.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CopyField } from '@/components/ui/CopyField';
import { ExternalLink } from 'lucide-react';
import { api } from '../../../lib/axios';

interface BadgeCardProps {
  monitorId: string;
  friendlyName: string;
  url: string;
  isPublic: boolean;
  publicSlug: string | null;
}

export const BadgeCard = ({ monitorId, friendlyName, url, isPublic, publicSlug }: BadgeCardProps) => {
  const badgeUrl = publicSlug ? `${api.defaults.baseURL}/api/public/monitors/${publicSlug}/badge.svg` : null;
  const statusUrl = publicSlug ? `${window.location.origin}/status/${publicSlug}` : null;
  const markdown = badgeUrl && statusUrl ? `[![kindlekeep](${badgeUrl})](${statusUrl})` : null;

  return (
    <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
      <div className="mb-4 min-w-0">
        <p className="text-lg font-semibold text-zinc-800 truncate">
          {friendlyName}
        </p>
        <p className="text-sm text-zinc-500 font-mono mt-1 truncate">{url}</p>
      </div>

      {isPublic && badgeUrl && markdown ? (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center">
            <img src={badgeUrl} alt={`${friendlyName} status badge`} />
          </div>
          <CopyField label="Markdown" value={markdown} />
          <CopyField label="Badge URL" value={badgeUrl} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center">
          <p className="text-sm text-zinc-500">Enable the public status page to get a badge.</p>
          <Button variant="outline" asChild>
            <Link to={`/dashboard/monitor/${monitorId}`}>
              <ExternalLink size={14} strokeWidth={1.5} />
              Open monitor
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
