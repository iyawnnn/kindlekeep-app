import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';
import type { StatusPageResponse } from '../types/statusHub.types';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const CreateStatusPageModal = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setSlug('');
    setSlugTouched(false);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.post<StatusPageResponse>('/api/status-pages', { name, slug });
      useToastStore.getState().success(`${name} created.`);
      setIsOpen(false);
      reset();
      navigate(`/status-pages/${response.data.id}`);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 409 ? 'That slug is already in use.' : 'Failed to create status page.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} strokeWidth={1.5} />
          New Status Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>New status page</DialogTitle>
          <DialogDescription>
            Group monitors into a branded page you can share with your users.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status-page-name">Name</Label>
            <Input
              id="status-page-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Acme Platform Status"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status-page-slug">Slug</Label>
            <Input
              id="status-page-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="font-mono text-sm"
              placeholder="acme-platform"
            />
            <p className="text-xs text-zinc-500 font-mono">/hub/{slug || 'your-slug'}</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSaving ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
