import { transform } from '@swc/core';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Plugin de transpilación con SWC para Vitest (sección 4 del contexto).
 *
 * NestJS depende de decoradores legacy y de metadata de tipos. El esbuild
 * interno de Vitest emite decoradores nativos (helper `__esDecorate`) y rompe
 * NestJS. Aquí forzamos SWC con `legacyDecorator` + `decoratorMetadata`, el
 * equivalente a `experimentalDecorators` + `emitDecoratorMetadata` de tsc.
 */
function swcLegacyDecorators(): Plugin {
  return {
    name: 'swc-legacy-decorators',
    enforce: 'pre',
    async transform(code, id) {
      // Vite añade query params al id (p. ej. `?v=hash`); se recortan antes de
      // decidir si el archivo es TypeScript.
      const cleanId = id.split('?')[0];
      if (cleanId.includes('node_modules') || !/\.ts$/.test(cleanId)) {
        return null;
      }
      const result = await transform(code, {
        filename: cleanId,
        sourceMaps: true,
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: 'es2021',
          keepClassNames: true,
        },
        module: { type: 'es6' },
      });
      return {
        code: result.code,
        map: result.map ? JSON.parse(result.map) : null,
      };
    },
  };
}

export default defineConfig({
  // Desactiva el esbuild interno de Vitest para que SWC sea el único
  // transformador de TypeScript.
  esbuild: false,
  test: {
    globals: true,
    environment: 'node',
    root: './',
    include: ['src/**/*.spec.ts'],
  },
  plugins: [swcLegacyDecorators()],
});
