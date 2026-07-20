export interface SecurityAuditResponse {
  hasCsp: boolean;
  hasHsts: boolean;
  hasXfo: boolean;
  hasNosniff: boolean;
  sslIssuer: string | null;
  sslExpiryAt: string | null;
  rawHeaders: string | null;
  tlsVersion: string | null;
}

export interface UptimeLogResponse {
  timestamp: string;
  status: number;
  latencyMs: number;
}