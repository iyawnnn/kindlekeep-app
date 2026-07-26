// src/pages/StatusPages.tsx
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Radio, Trash2, ExternalLink } from 'lucide-react';
import { api } from '../lib/axios';
import { CreateStatusPageModal } from '../features/status-hub/components/CreateStatusPageModal';
import { useStatusPageStore } from '../features/status-hub/store/useStatusPageStore';
import type { StatusPageSummaryResponse } from '../features/status-hub/types/statusHub.types';

export const StatusPages = () => {
  const { pages, setPages, deletePage } = useStatusPageStore();

  const { data, isLoading, isError, refetch } = useQuery<StatusPageSummaryResponse[]>({
    queryKey: ['statusPages'],
    queryFn: async () => {
      const response = await api.get('/api/status-pages');
      return response.data;
    },
  });

  useEffect(() => {
    if (data) setPages(data);
  }, [data, setPages]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-black tracking-tight">Status Pages</h1>
          <p className="text-zinc-500 mt-2">Branded, multi-service pages you can share publicly.</p>
        </div>
        <CreateStatusPageModal />
      </header>

      {isLoading && <p className="text-zinc-500">Loading status pages...</p>}

      {isError && (
        <div className="py-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50">
          <p className="text-sm font-medium text-red-600">Unable to load status pages</p>
          <button
            onClick={() => refetch()}
            className="mt-6 py-2 px-6 bg-zinc-900 text-white hover:bg-zinc-800 font-medium text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && pages.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-zinc-500 rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
          <Radio size={32} strokeWidth={1.5} className="opacity-50 mb-3" />
          <p className="text-sm font-medium text-zinc-700">No status pages yet</p>
          <p className="text-xs mt-2">Create one to share aggregate health with your users.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="rounded-xl bg-white border border-zinc-200 shadow-sm hover:shadow-md p-6 transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <Link to={`/status-pages/${page.id}`} className="min-w-0 group">
                <p className="text-lg font-semibold text-zinc-800 truncate group-hover:text-primary transition-colors">
                  {page.name}
                </p>
                <p className="text-sm text-zinc-500 font-mono mt-1 truncate">/hub/{page.slug}</p>
              </Link>
              <button
                onClick={() => deletePage(page.id)}
                className="text-zinc-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                aria-label="Delete status page"
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${page.isPublished ? 'text-primary' : 'text-zinc-500'}`}>
                {page.isPublished ? 'Published' : 'Draft'}
              </span>
              <span className="text-xs text-zinc-500">
                {page.serviceCount} {page.serviceCount === 1 ? 'service' : 'services'}
              </span>
            </div>

            {page.isPublished && (
              <a
                href={`/hub/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-primary transition-colors mt-4"
              >
                <ExternalLink size={12} strokeWidth={1.5} />
                View public page
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
