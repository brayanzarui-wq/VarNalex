'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
  Link2,
  Settings,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/conexiones', label: 'Conexiones', icon: Link2 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 flex-col items-center border-r border-border bg-primary py-4">
      {/* Marca */}
      <Link href="/dashboard" className="mb-6" aria-label="VarNalex">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="12" cy="16" r="8" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="20" cy="16" r="8" stroke="#19A7A5" strokeWidth="3" />
        </svg>
      </Link>

      {/* Navegación principal */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-primary-foreground/60 hover:bg-white/10 hover:text-primary-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      {/* Usuario */}
      <Link
        href="/configuracion"
        title="Usuario"
        aria-label="Usuario"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground"
      >
        <User className="h-5 w-5" />
      </Link>
    </aside>
  );
}
