import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoService } from './crypto.service';

/**
 * Verifica el cifrado de tokens de Connection (sección 6): lo que se guarda
 * nunca es texto plano y el descifrado recupera el valor original.
 */
describe('CryptoService', () => {
  let crypto: CryptoService;

  beforeEach(() => {
    // Clave de 32 bytes en hex (solo para pruebas).
    const key = 'a'.repeat(64);
    const config = {
      get: (name: string) =>
        name === 'CONNECTION_ENCRYPTION_KEY' ? key : undefined,
    } as unknown as ConfigService;
    crypto = new CryptoService(config);
  });

  it('cifra y descifra recuperando el valor original', () => {
    const secret = 'meta-ads-access-token-123';
    const encrypted = crypto.encrypt(secret);

    expect(encrypted).not.toBe(secret);
    expect(encrypted).toContain(':'); // formato iv:tag:ciphertext
    expect(crypto.decrypt(encrypted)).toBe(secret);
  });

  it('produce salidas distintas para el mismo texto (IV aleatorio)', () => {
    const secret = 'token';
    expect(crypto.encrypt(secret)).not.toBe(crypto.encrypt(secret));
  });

  it('hace hash determinista y compara en tiempo constante', () => {
    const h1 = crypto.hash('valor');
    const h2 = crypto.hash('valor');
    expect(h1).toBe(h2);
    expect(crypto.safeCompare(h1, h2)).toBe(true);
    expect(crypto.safeCompare(h1, crypto.hash('otro'))).toBe(false);
  });
});
