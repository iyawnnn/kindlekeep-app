import { useQuery } from '@tanstack/react-query';
import { Flex, Text, Box, Grid } from '@radix-ui/themes';
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
      <Flex justify="center" align="center" className="h-[calc(100vh-64px)] text-zinc-500 font-onest">
        <Text>Loading telemetry data...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box className="p-8 text-red-600 font-onest max-w-7xl mx-auto">
        <Text>Failed to synchronize incident state.</Text>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black font-unbounded text-black tracking-tight">
          Incident Command Center
        </h1>
        <Text className="text-zinc-600 mt-2 font-medium font-onest block">
          Root cause analysis and temporal telemetry.
        </Text>
      </header>

      <Flex direction="column" gap="4">
        {incidents?.map((incident) => (
          <Box
            key={incident.id}
            className="bg-white border border-zinc-200 shadow-sm p-6 transition-colors duration-200 hover:bg-zinc-50"
          >
            <Flex align="start" justify="between" className="mb-6">
              <Flex align="center" gap="3">
                {incident.isResolved ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" strokeWidth={1} />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={1} />
                )}
                <Box>
                  <Text className="text-lg font-bold font-onest tracking-wide text-zinc-800 block">
                    {incident.friendlyName}
                  </Text>
                  <Text className="text-sm text-zinc-500 font-onest mt-1">
                    Fingerprint: <span className="font-mono text-zinc-600">{incident.incidentHash.substring(0, 8)}</span>
                  </Text>
                </Box>
              </Flex>
              <Box>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider font-onest ${incident.isResolved ? 'text-blue-700 bg-blue-50' : 'text-red-700 bg-red-50'}`}>
                  {incident.incidentType}
                </span>
              </Box>
            </Flex>

            <Grid columns={{ initial: '1', md: '3' }} gap="6" className="pt-4 border-t border-zinc-200">
              <Flex direction="column" gap="1">
                <Text className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2 font-onest">
                  <Clock className="w-3 h-3" strokeWidth={1} /> Start Time
                </Text>
                <Text className="text-xl font-medium text-zinc-900 font-onest">
                  {new Date(incident.startTime).toLocaleString()}
                </Text>
              </Flex>

              <Flex direction="column" gap="1">
                <Text className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2 font-onest">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={1} /> Resolution Status
                </Text>
                <Text className={`text-xl font-medium font-onest ${incident.resolvedAt ? 'text-zinc-900' : 'text-red-600'}`}>
                  {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'Ongoing'}
                </Text>
              </Flex>

              <Flex direction="column" gap="1">
                <Text className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2 font-onest">
                  <Activity className="w-3 h-3" strokeWidth={1} /> Occurrences
                </Text>
                <Text className="text-xl font-medium text-zinc-900 font-onest">
                  {incident.occurrenceCount}
                </Text>
              </Flex>
            </Grid>
          </Box>
        ))}

        {incidents?.length === 0 && (
          <Box className="text-center p-12 bg-white border border-zinc-200">
            <Text className="text-zinc-500 font-onest">No active or historical incidents recorded.</Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
};