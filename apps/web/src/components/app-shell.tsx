'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { useAuthStore } from '@/store/auth-store';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reportes': 'Reportes',
  '/conexiones': 'Conexiones',
  '/configuracion': 'Configuración de envío',
};

function titleFor(pathname: string): string {
  const match = Object.keys(TITLES).find((p) => pathname.startsWith(p));
  return match ? TITLES[match] : 'VarNalex';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrate = useAuthStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'idle') {
      void hydrate();
    }
  }, [status, hydrate]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={titleFor(pathname)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
