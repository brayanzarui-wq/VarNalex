/**
 * Sanitización básica de texto libre para prevenir XSS almacenado
 * (sección 7 del contexto). Prisma ya parametriza las consultas, por lo que la
 * inyección SQL está cubierta; esto protege contra HTML/script en campos libres
 * como nombres de organización o notas.
 *
 * Se neutralizan los caracteres que abren etiquetas/atributos peligrosos y los
 * caracteres de control, y se recorta el espacio en blanco. No pretende ser un
 * sanitizador de HTML rico (para eso se usaría una librería dedicada); es una
 * defensa en profundidad para texto plano.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // elimina apertura/cierre de etiquetas
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '') // elimina caracteres de control (incl. NUL)
    .trim();
}
