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

export interface UptimeLogResponse {
  timestamp: string;
  status: number;
  latencyMs: number;
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
}

export interface UpdateMonitorRequest {
  url: string;
  friendlyName: string;
  intervalMinutes: number;
  requestTimeout: number;
  requestHeaders: Record<string, string> | null;
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