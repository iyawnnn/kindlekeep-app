import type { UptimeLogResponse } from '../../monitors/types/monitor.types';

export interface StatusPageResponse {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface StatusPageSummaryResponse {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  serviceCount: number;
}

export interface StatusPageServiceResponse {
  id: string;
  monitorId: string;
  displayName: string;
  sectionName: string | null;
  sortOrder: number;
  currentUptimeStatus: number;
}

export interface StatusPageDetailResponse {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  services: StatusPageServiceResponse[];
}

export interface CreateStatusPageRequest {
  name: string;
  slug: string;
}

export interface UpdateStatusPageRequest {
  name: string;
  slug: string;
  isPublished: boolean;
}

export interface AttachServiceRequest {
  monitorId: string;
  displayName: string;
  sectionName: string | null;
}

export interface UpdateServiceRequest {
  displayName: string;
  sectionName: string | null;
}

export interface ServiceOrderEntry {
  serviceId: string;
  sectionName: string | null;
  sortOrder: number;
}

export interface PublicServiceResponse {
  displayName: string;
  sectionName: string | null;
  sortOrder: number;
  currentUptimeStatus: number;
  recent24h: UptimeLogResponse[];
}

export interface PublicIncidentResponse {
  monitorDisplayName: string;
  incidentType: string;
  createdAt: string;
  resolvedAt: string | null;
  mttrMinutes: number | null;
}

export const AggregateStatus = {
  Operational: 0,
  PartialOutage: 1,
  MajorOutage: 2,
} as const;

export interface PublicStatusPageResponse {
  name: string;
  aggregateStatus: number;
  services: PublicServiceResponse[];
  recentIncidents: PublicIncidentResponse[];
}
