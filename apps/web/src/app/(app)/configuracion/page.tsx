'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';
import { PROVIDER_LABELS } from '@/lib/format';
import type { Connection } from '@/lib/types';

type Frequency = 'weekly' | 'monthly';

export default function ConfiguracionPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [clientName, setClientName] = useState('Agencia Impulso');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [sendDay, setSendDay] = useState('1');
  const [email, setEmail] = useState('cliente@ejemplo.com');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .connections()
      .then((c) => {
        const active = c.filter((x) => x.isActive);
        setConnections(active);
        setSelectedSources(active.map((x) => x.id));
      })
      .catch(() => setConnections([]));
  }, []);

  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setSaved(false);
  };

  const periodLabel = useMemo(() => {
    const now = new Date();
    const month = now.toLocaleDateString('es-MX', {
      month: 'long',
      year: 'numeric',
    });
    return month.charAt(0).toUpperCase() + month.slice(1);
  }, []);

  const save = () => {
    // La programación de envíos automáticos (Resend + cron) es una función
    // pendiente en el backend; por ahora la configuración se mantiene en la UI.
    setSaved(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Formulario de configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar reporte automático</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define cuándo y a quién se envía el reporte.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="space-y-1">
            <Label>Frecuencia</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={frequency === 'weekly' ? 'accent' : 'outline'}
                size="sm"
                onClick={() => {
                  setFrequency('weekly');
                  setSaved(false);
                }}
              >
                Semanal
              </Button>
              <Button
                type="button"
                variant={frequency === 'monthly' ? 'accent' : 'outline'}
                size="sm"
                onClick={() => {
                  setFrequency('monthly');
                  setSaved(false);
                }}
              >
                Mensual
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="day">
              {frequency === 'weekly' ? 'Día de la semana' : 'Día del mes'}
            </Label>
            <Select
              id="day"
              value={sendDay}
              onChange={(e) => {
                setSendDay(e.target.value);
                setSaved(false);
              }}
            >
              {frequency === 'weekly'
                ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(
                    (d, i) => (
                      <option key={d} value={String(i + 1)}>
                        {d}
                      </option>
                    ),
                  )
                : Array.from({ length: 28 }, (_, i) => (
                    <option key={i} value={String(i + 1)}>
                      Día {i + 1}
                    </option>
                  ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Enviar a</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Fuentes incluidas</Label>
            {connections.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay conexiones activas.
              </p>
            )}
            <div className="space-y-2">
              {connections.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-[#19A7A5]"
                    checked={selectedSources.includes(c.id)}
                    onChange={() => toggleSource(c.id)}
                  />
                  {PROVIDER_LABELS[c.provider]}
                  {c.externalId ? ` — ${c.externalId}` : ''}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={save}>Guardar configuración</Button>
            {saved && (
              <span className="text-sm text-success">Configuración guardada</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            El envío programado (Resend) se activará en una próxima iteración del
            backend.
          </p>
        </CardContent>
      </Card>

      {/* Vista previa del envío */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">
            Vista previa del envío
          </CardTitle>
          <p className="text-sm text-primary-foreground/70">
            Así se verá el correo que recibirá {clientName || 'tu cliente'}.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-white p-5 text-foreground">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Reporte de {periodLabel}
            </p>
            <h3 className="mt-1 text-lg font-bold text-primary">
              {clientName || 'Cliente'}
            </h3>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Impresiones', value: '124K' },
                { label: 'Clics', value: '3.2K' },
                { label: 'Conversiones', value: '89' },
              ].map((m) => (
                <div key={m.label} className="rounded-md bg-secondary p-3">
                  <div className="text-lg font-bold text-primary">
                    {m.value}
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Reporte generado automáticamente por VarNalex con datos de{' '}
              {selectedSources.length > 0
                ? connections
                    .filter((c) => selectedSources.includes(c.id))
                    .map((c) => PROVIDER_LABELS[c.provider])
                    .join(', ')
                : 'las fuentes conectadas'}
              .
            </p>

            <Button variant="accent" size="sm" className="mt-4 w-full">
              Ver reporte completo
            </Button>
          </div>

          <p className="mt-4 text-xs text-primary-foreground/60">
            Frecuencia: {frequency === 'weekly' ? 'Semanal' : 'Mensual'} · Envío
            a {email || '—'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
