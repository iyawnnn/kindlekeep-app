export interface IncidentResponse {
  id: string;
  monitorId: string;
  friendlyName: string;
  incidentHash: string;
  incidentType: string;
  isResolved: boolean;
  startTime: string;
  resolvedAt: string | null;
  occurrenceCount: number;
  acknowledgedAt: string | null;
  escalatedAt: string | null;
  mttrMinutes: number | null;
}

export interface AcknowledgeResponse {
  acknowledgedAt: string;
}
