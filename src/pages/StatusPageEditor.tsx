// src/pages/StatusPageEditor.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CopyField } from '@/components/ui/CopyField';
import { ArrowLeft, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { api } from '../lib/axios';
import { useToastStore } from '../components/ui/useToastStore';
import { UptimeStatus } from '../features/monitors/store/useMonitorStore';
import { AttachServiceModal } from '../features/status-hub/components/AttachServiceModal';
import type { StatusPageDetailResponse, StatusPageServiceResponse } from '../features/status-hub/types/statusHub.types';

const STATUS_DOT: Record<number, string> = {
  [UptimeStatus.Healthy]: 'bg-primary',
  [UptimeStatus.Degraded]: 'bg-amber-500',
  [UptimeStatus.Down]: 'bg-red-500',
  [UptimeStatus.Quarantined]: 'bg-red-500',
};

export const StatusPageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: page, isLoading, isError } = useQuery<StatusPageDetailResponse>({
    queryKey: ['statusPage', id],
    queryFn: async () => {
      const response = await api.get(`/api/status-pages/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const [isSavingMeta, setIsSavingMeta] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['statusPage', id] });

  const handleTogglePublish = async (published: boolean) => {
    if (!page) return;
    setIsSavingMeta(true);
    try {
      await api.patch(`/api/status-pages/${id}`, { name: page.name, slug: page.slug, isPublished: published });
      await invalidate();
      useToastStore.getState().success(published ? 'Status page published.' : 'Status page unpublished.');
    } catch {
      useToastStore.getState().error('Failed to update publish state.');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleDetach = async (serviceId: string) => {
    if (!id) return;
    try {
      await api.delete(`/api/status-pages/${id}/services/${serviceId}`);
      await invalidate();
    } catch {
      useToastStore.getState().error('Failed to remove service.');
    }
  };

  const handleMove = async (services: StatusPageServiceResponse[], index: number, direction: -1 | 1) => {
    if (!id) return;
    const target = index + direction;
    if (target < 0 || target >= services.length) return;

    const reordered = [...services];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    const entries = reordered.map((s, i) => ({ serviceId: s.id, sectionName: s.sectionName, sortOrder: i }));

    try {
      await api.put(`/api/status-pages/${id}/services/reorder`, { services: entries });
      await invalidate();
    } catch {
      useToastStore.getState().error('Failed to reorder services.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-zinc-500">
        <p>Loading status page...</p>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="p-8 text-red-600 max-w-3xl mx-auto">
        <p>Failed to load this status page.</p>
      </div>
    );
  }

  const attachedMonitorIds = new Set(page.services.map((s) => s.monitorId));

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <Button variant="ghost" onClick={() => navigate('/status-pages')} className="text-zinc-500 hover:text-black mb-8 -ml-3">
        <ArrowLeft size={16} strokeWidth={1.5} />
        All Status Pages
      </Button>

      <header className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-black tracking-tight">{page.name}</h1>
          <p className="text-zinc-500 font-mono mt-1">/hub/{page.slug}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-semibold ${page.isPublished ? 'text-primary' : 'text-zinc-500'}`}>
            {page.isPublished ? 'Published' : 'Draft'}
          </span>
          <Switch checked={page.isPublished} disabled={isSavingMeta} onCheckedChange={handleTogglePublish} />
        </div>
      </header>

      {page.isPublished && (
        <div className="mb-8">
          <CopyField label="Public URL" value={`${window.location.origin}/hub/${page.slug}`} />
        </div>
      )}

      <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xl font-semibold text-zinc-900">Services</p>
          <AttachServiceModal statusPageId={id ?? ''} attachedMonitorIds={attachedMonitorIds} onAttached={invalidate} />
        </div>

        {page.services.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">No monitors attached yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {page.services.map((service, index) => (
              <div
                key={service.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3"
              >
                <span className={`size-2 rounded-full shrink-0 ${STATUS_DOT[service.currentUptimeStatus] ?? 'bg-zinc-300'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 truncate">{service.displayName}</p>
                  {service.sectionName && (
                    <p className="text-xs text-zinc-500">{service.sectionName}</p>
                  )}
                </div>
                <button
                  onClick={() => handleMove(page.services, index, -1)}
                  disabled={index === 0}
                  className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Move up"
                >
                  <ArrowUp size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleMove(page.services, index, 1)}
                  disabled={index === page.services.length - 1}
                  className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDetach(service.id)}
                  className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                  aria-label="Remove service"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <StatusPageSettings page={page} onSaved={invalidate} />
    </div>
  );
};

const StatusPageSettings = ({ page, onSaved }: { page: StatusPageDetailResponse; onSaved: () => void }) => {
  const [name, setName] = useState(page.name);
  const [slug, setSlug] = useState(page.slug);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await api.patch(`/api/status-pages/${page.id}`, { name, slug, isPublished: page.isPublished });
      useToastStore.getState().success('Saved.');
      onSaved();
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 409 ? 'That slug is already in use.' : 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
      <p className="text-xl font-semibold text-zinc-900 mb-6">Settings</p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="editor-name">Name</Label>
          <Input id="editor-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="editor-slug">Slug</Label>
          <Input id="editor-slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-sm" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
