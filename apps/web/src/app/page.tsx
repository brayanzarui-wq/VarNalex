import { redirect } from 'next/navigation';

/**
 * La raíz redirige al dashboard; el middleware se encarga de mandar a /login si
 * no hay sesión activa.
 */
export default function Home() {
  redirect('/dashboard');
}
