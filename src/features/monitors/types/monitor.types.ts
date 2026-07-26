export interface SecurityAuditResponse {
  hasCsp: boolean;
  hasHsts: boolean;
  hasXfo: boolean;
  hasNosniff: boolean;
  sslIssuer: string | null;
  sslExpiryAt: string | null;
  rawHeaders: string | null;
  tlsVersion: string | null;
  detectedPlatform: string | null;
  remediationSnippet: string | null;
}

export interface CopilotResponse {
  explanation: string | null;
  detectedPlatform: string | null;
  remediationSnippet: string | null;
}

export interface UptimeLogResponse {
  timestamp: string;
  status: number;
  latencyMs: number;
}

export enum MonitorType {
  Http = 0,
  Journey = 1,
}

export interface JourneyStep {
  stepOrder: number;
  method: string;
  url: string;
  headers: Record<string, string> | null;
  body: string | null;
  captureAs: string | null;
  captureJsonPath: string | null;
  assertJsonPath: string | null;
  assertEquals: string | null;
  expectedStatusCode: number | null;
}

export interface MonitorDetailResponse {
  id: string;
  url: string;
  friendlyName: string;
  intervalMinutes: number;
  requestTimeout: number;
  requestHeaders: Record<string, string> | null;
  currentUptimeStatus: number;
  currentSecurityGrade: string;
  isActive: boolean;
  isPublic: boolean;
  publicSlug: string | null;
  monitorType: MonitorType;
  steps: JourneyStep[] | null;
}

export interface CreateMonitorRequest {
  url: string | null;
  friendlyName: string;
  monitorType: MonitorType;
  steps: JourneyStep[] | null;
}

export interface UpdateMonitorRequest {
  url: string | null;
  friendlyName: string;
  intervalMinutes: number;
  requestTimeout: number;
  requestHeaders: Record<string, string> | null;
  monitorType: MonitorType;
  steps: JourneyStep[] | null;
}

export interface PublicStatusResponse {
  isPublic: boolean;
  publicSlug: string | null;
}

export interface PublicMonitorResponse {
  friendlyName: string;
  url: string;
  currentUptimeStatus: number;
  isActive: boolean;
  updatedAt: string;
  history: UptimeLogResponse[];
}