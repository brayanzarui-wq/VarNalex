import { cn } from '@/lib/utils';

/**
 * Marca de VarNalex: anillos entrelazados en azul marino y teal (sección 2).
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="16" r="8" stroke="#11224D" strokeWidth="3" />
        <circle cx="20" cy="16" r="8" stroke="#19A7A5" strokeWidth="3" />
      </svg>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-primary">
          VarNalex
        </span>
      )}
    </div>
  );
}
