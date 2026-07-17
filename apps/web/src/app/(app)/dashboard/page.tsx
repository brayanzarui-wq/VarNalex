'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Clock, Send, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  PROVIDER_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  formatDate,
  monthLabel,
} from '@/lib/format';
import type { Connection, Report } from '@/lib/types';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.reports(), api.connections()])
      .then(([r, c]) => {
        setReports(r);
        setConnections(c);
      })
      .catch((e) => setError(e.message ?? 'Error cargando datos'))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const generated = reports.filter(
      (r) => r.status === 'GENERATED' || r.status === 'SENT',
    ).length;
    const sentThisMonth = reports.filter(
      (r) =>
        r.status === 'SENT' &&
        new Date(r.createdAt).getMonth() === now.getMonth() &&
        new Date(r.createdAt).getFullYear() === now.getFullYear(),
    ).length;
    const activeConnections = connections.filter((c) => c.isActive).length;
    // Estimación: ~2.5 h ahorradas por reporte generado automáticamente.
    const hoursSaved = (generated * 2.5).toFixed(1);
    return { generated, sentThisMonth, activeConnections, hoursSaved };
  }, [reports, connections]);

  const chartData = useMemo(() => {
    const now = new Date();
    const buckets: { month: string; reportes: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ month: MONTHS[d.getMonth()], reportes: 0 });
    }
    for (const r of reports) {
      const label = monthLabel(r.createdAt);
      const bucket = buckets.find((b) => b.month === label);
      if (bucket) bucket.reportes += 1;
    }
    return buckets;
  }, [reports]);

  const recent = reports.slice(0, 5);

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas resumen */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BarChart3}
          value={loading ? '—' : metrics.generated}
          label="Reportes generados"
        />
        <StatCard
          icon={Users}
          value={loading ? '—' : metrics.activeConnections}
          label="Clientes conectados"
        />
        <StatCard
          icon={Send}
          value={loading ? '—' : metrics.sentThisMonth}
          label="Envíos este mes"
        />
        <StatCard
          icon={Clock}
          value={loading ? '—' : `${metrics.hoursSaved} h`}
          label="Tiempo ahorrado"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfica de reportes por mes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reportes por mes</CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(214 32% 91%)"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="hsl(215 16% 47%)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="hsl(215 16% 47%)"
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(210 40% 96%)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid hsl(214 32% 91%)',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="reportes"
                    fill="hsl(179 74% 38%)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Reportes recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            )}
            {!loading && recent.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aún no hay reportes. Conecta una fuente y genera el primero.
              </p>
            )}
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {r.connection?.externalId ??
                      (r.connection
                        ? PROVIDER_LABELS[r.connection.provider]
                        : 'Reporte')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE[r.status]}>
                  {STATUS_LABELS[r.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
