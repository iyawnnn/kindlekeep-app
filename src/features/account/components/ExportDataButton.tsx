// src/features/account/components/ExportDataButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';

export const ExportDataButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/api/users/export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kindlekeep-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      useToastStore.getState().error('Failed to export account data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" disabled={isExporting} onClick={handleExport}>
      <Download size={14} strokeWidth={1.5} />
      {isExporting ? 'Preparing export...' : 'Export my data'}
    </Button>
  );
};
