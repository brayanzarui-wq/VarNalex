'use client';

import { useEffect, useState } from 'react';
import { Check, Plug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { PROVIDER_LABELS, formatDate } from '@/lib/format';
import type { Connection, ConnectionProvider } from '@/lib/types';

const PROVIDERS: {
  provider: ConnectionProvider;
  description: string;
  color: string;
}[] = [
  {
    provider: 'META_ADS',
    description: 'Facebook e Instagram Ads',
    color: '#1877F2',
  },
  {
    provider: 'GOOGLE_ADS',
    description: 'Campañas de búsqueda y display',
    color: '#34A853',
  },
  {
    provider: 'GOOGLE_ANALYTICS',
    description: 'Analítica de sitio (GA4)',
    color: '#F9AB00',
  },
];

export default function ConexionesPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formFor, setFormFor] = useState<ConnectionProvider | null>(null);
  const [token, setToken] = useState('');
  const [externalId, setExternalId] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .connections()
      .then(setConnections)
      .catch((e) => setError(e.message ?? 'Error cargando conexiones'))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const activeFor = (p: ConnectionProvider) =>
    connections.find((c) => c.provider === p && c.isActive);

  const connect = async (provider: ConnectionProvider) => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      await api.connect({
        provider,
        accessToken: token,
        externalId: externalId || undefined,
      });
      setFormFor(null);
      setToken('');
      setExternalId('');
      await load();
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo conectar');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (id: string) => {
    setError(null);
    try {
      await api.disconnect(id);
      await load();
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo desconectar');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Fuentes de datos
        </h2>
        <p className="text-sm text-muted-foreground">
          Conecta tus plataformas para alimentar los reportes automáticamente.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PROVIDERS.map(({ provider, description, color }) => {
          const conn = activeFor(provider);
          const isOpen = formFor === provider;
          return (
            <Card key={provider}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Plug className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {PROVIDER_LABELS[provider]}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
                {conn ? (
                  <Badge variant="success">
                    <Check className="mr-1 h-3 w-3" /> Conectado
                  </Badge>
                ) : (
                  <Badge variant="outline">Pendiente</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {conn ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Conectado el {formatDate(conn.connectedAt)}
                      {conn.externalId ? ` · ${conn.externalId}` : ''}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnect(conn.id)}
                    >
                      Desconectar
                    </Button>
                  </>
                ) : isOpen ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor={`token-${provider}`}>Access token</Label>
                      <Input
                        id={`token-${provider}`}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Token OAuth del proveedor"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`ext-${provider}`}>
                        ID de cuenta (opcional)
                      </Label>
                      <Input
                        id={`ext-${provider}`}
                        value={externalId}
                        onChange={(e) => setExternalId(e.target.value)}
                        placeholder="act_123456789"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => connect(provider)}
                        disabled={busy || !token}
                      >
                        {busy ? 'Conectando…' : 'Guardar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormFor(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El flujo OAuth completo se habilitará con las credenciales
                      del proveedor. El token se cifra antes de guardarse.
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setFormFor(provider)}
                  >
                    Conectar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Cargando conexiones…</p>
      )}
    </div>
  );
}
