import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Tipografía oficial: Inter (sección 2 del contexto).
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VarNalex — Reportes automáticos',
  description:
    'Plataforma para agencias de marketing digital: reportes automáticos de Meta Ads y Google Ads.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
