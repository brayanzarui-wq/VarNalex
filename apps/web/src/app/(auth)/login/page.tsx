'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const { user } = await api.login(data.email, data.password);
      setUser(user);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo iniciar sesión. Intenta de nuevo.',
      );
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca (visible en escritorio) */}
      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Logo className="[&_span]:text-white" />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            Reportes automáticos para tu agencia
          </h1>
          <p className="max-w-md text-primary-foreground/70">
            Conecta Meta Ads y Google Ads, y entrega reportes profesionales a tus
            clientes sin trabajo manual.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} VarNalex
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:hidden">
            <Logo className="justify-center" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Iniciar sesión
            </h2>
            <p className="text-sm text-muted-foreground">
              Accede a tu panel de reportes.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@agencia.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            ¿Olvidaste tu contraseña? Contacta a tu administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
