import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, CheckCircle2, Activity } from 'lucide-react';
import { api } from '../lib/axios';

interface IncidentResponse {
  id: string;
  monitorId: string;
  friendlyName: string;
  incidentHash: string;
  incidentType: string;
  isResolved: boolean;
  startTime: string;
  resolvedAt: string | null;
  occurrenceCount: number;
}

const fetchIncidents = async (): Promise<IncidentResponse[]> => {
  const response = await api.get('/api/incidents');
  return response.data;
};

export const Incidents = () => {
  const { data: incidents, isLoading, isError } = useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-zinc-500">
        <p>Loading incidents...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-red-600 max-w-7xl mx-auto">
        <p>Failed to load incidents.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-black tracking-tight">
          Incidents
        </h1>
        <p className="text-zinc-500 mt-2">
          Root cause analysis and incident history.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {incidents?.map((incident) => (
          <div
            key={incident.id}
            className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 transition-colors duration-200 hover:bg-zinc-50"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {incident.isResolved ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                )}
                <div>
                  <p className="text-lg font-semibold text-zinc-800">
                    {incident.friendlyName}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Fingerprint: <span className="font-mono text-zinc-600">{incident.incidentHash.substring(0, 8)}</span>
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${incident.isResolved ? 'text-accent-foreground bg-accent' : 'text-red-700 bg-red-50'}`}>
                {incident.incidentType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-200">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
                  <Clock className="w-3 h-3" strokeWidth={1.5} /> Start Time
                </span>
                <span className="text-xl font-medium text-zinc-900">
                  {new Date(incident.startTime).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> Resolution Status
                </span>
                <span className={`text-xl font-medium ${incident.resolvedAt ? 'text-zinc-900' : 'text-red-600'}`}>
                  {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'Ongoing'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
                  <Activity className="w-3 h-3" strokeWidth={1.5} /> Occurrences
                </span>
                <span className="text-xl font-medium text-zinc-900">
                  {incident.occurrenceCount}
                </span>
              </div>
            </div>
          </div>
        ))}

        {incidents?.length === 0 && (
          <div className="text-center p-12 rounded-xl bg-white border border-zinc-200">
            <p className="text-zinc-500">No active or historical incidents recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};
