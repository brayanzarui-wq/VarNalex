'use client';

import { useEffect, useState } from 'react';
import { Download, Eye, Plus, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import {
  PROVIDER_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  formatDate,
} from '@/lib/format';
import type { Connection, Report } from '@/lib/types';

function monthRange(): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}

export default function ReportesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [connectionId, setConnectionId] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([api.reports(), api.connections()])
      .then(([r, c]) => {
        setReports(r);
        setConnections(c.filter((x) => x.isActive));
      })
      .catch((e) => setError(e.message ?? 'Error cargando reportes'))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const createReport = async () => {
    if (!connectionId) return;
    setBusy(true);
    setError(null);
    try {
      await api.createReport({ connectionId, ...monthRange() });
      setShowForm(false);
      setConnectionId('');
      await load();
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo crear el reporte');
    } finally {
      setBusy(false);
    }
  };

  const resend = async (id: string) => {
    try {
      await api.resendReport(id);
      await load();
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo reenviar');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            Todos los reportes
          </h2>
          <Badge variant="outline">{reports.length}</Badge>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="h-4 w-4" /> Nuevo reporte
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Fuente de datos</label>
              <Select
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
              >
                <option value="">Selecciona una conexión…</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {PROVIDER_LABELS[c.provider]}
                    {c.externalId ? ` — ${c.externalId}` : ''}
                  </option>
                ))}
              </Select>
              {connections.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay conexiones activas. Conecta una fuente primero.
                </p>
              )}
            </div>
            <Button
              variant="default"
              onClick={createReport}
              disabled={busy || !connectionId}
            >
              {busy ? 'Generando…' : 'Generar (mes actual)'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periodo</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Cargando…
                  </TableCell>
                </TableRow>
              )}
              {!loading && reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No hay reportes todavía.
                  </TableCell>
                </TableRow>
              )}
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {formatDate(r.periodStart)} — {formatDate(r.periodEnd)}
                  </TableCell>
                  <TableCell>
                    {r.connection
                      ? PROVIDER_LABELS[r.connection.provider]
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[r.status]}>
                      {STATUS_LABELS[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={r.pdfUrl ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!r.pdfUrl}
                        className={
                          r.pdfUrl
                            ? 'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary'
                            : 'pointer-events-none flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/40'
                        }
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => resend(r.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                        title="Reenviar"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <a
                        href={r.pdfUrl ?? undefined}
                        download
                        aria-disabled={!r.pdfUrl}
                        className={
                          r.pdfUrl
                            ? 'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary'
                            : 'pointer-events-none flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/40'
                        }
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
