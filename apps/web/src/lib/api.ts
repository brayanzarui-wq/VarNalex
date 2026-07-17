import type {
  AuthUser,
  Connection,
  ConnectionProvider,
  Organization,
  Report,
} from './types';

/**
 * Cliente HTTP hacia la API de VarNalex.
 *
 * La sesión se maneja con cookies httpOnly (sección 10: no localStorage para
 * tokens), por eso todas las peticiones usan `credentials: 'include'`. El
 * navegador adjunta las cookies automáticamente y la API valida el JWT.
 */
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  // --- auth ---
  login(email: string, password: string) {
    return request<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register(organizationName: string, email: string, password: string) {
    return request<{ user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ organizationName, email, password }),
    });
  },
  logout() {
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },
  me() {
    return request<AuthUser>('/auth/me');
  },

  // --- organización ---
  organization() {
    return request<Organization>('/organizations/me');
  },

  // --- conexiones (módulo reporting) ---
  connections() {
    return request<Connection[]>('/reporting/connections');
  },
  connect(input: {
    provider: ConnectionProvider;
    accessToken: string;
    refreshToken?: string;
    externalId?: string;
  }) {
    return request<Connection>('/reporting/connections', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  disconnect(id: string) {
    return request<Connection>(`/reporting/connections/${id}`, {
      method: 'DELETE',
    });
  },

  // --- reportes (módulo reporting) ---
  reports() {
    return request<Report[]>('/reporting/reports');
  },
  createReport(input: {
    connectionId: string;
    periodStart: string;
    periodEnd: string;
  }) {
    return request<Report>('/reporting/reports', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  resendReport(id: string) {
    return request<Report>(`/reporting/reports/${id}/resend`, {
      method: 'POST',
    });
  },
  generateReport(id: string) {
    return request<Report>(`/reporting/reports/${id}/generate`, {
      method: 'POST',
    });
  },
};
