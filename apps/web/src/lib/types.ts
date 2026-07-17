export type UserRole = 'ADMIN' | 'OPERATOR' | 'READER';

export interface AuthUser {
  userId?: string;
  id?: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export type ConnectionProvider =
  | 'GOOGLE_ANALYTICS'
  | 'META_ADS'
  | 'GOOGLE_ADS';

export interface Connection {
  id: string;
  provider: ConnectionProvider;
  externalId: string | null;
  isActive: boolean;
  connectedAt: string;
}

export type ReportStatus = 'PENDING' | 'GENERATED' | 'SENT' | 'FAILED';

export interface Report {
  id: string;
  organizationId: string;
  connectionId: string;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  pdfUrl: string | null;
  createdAt: string;
  connection?: {
    provider: ConnectionProvider;
    externalId: string | null;
  };
}
