import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
  createHash,
} from 'crypto';

/**
 * Cifrado simétrico para los tokens de terceros de `Connection`
 * (accessToken / refreshToken de Meta y Google).
 *
 * Sección 6 del contexto: estos tokens se cifran en la capa de servicio ANTES
 * de escribir a base de datos y se descifran al leer — nunca en texto plano,
 * nunca dentro de Prisma.
 *
 * Algoritmo: AES-256-GCM (autenticado). Formato almacenado:
 *   iv(hex) : authTag(hex) : ciphertext(hex)
 */
@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const hexKey = config.get<string>('CONNECTION_ENCRYPTION_KEY') ?? '';
    this.key = Buffer.from(hexKey, 'hex'); // 32 bytes (validado por Zod: 64 chars hex)
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(payload: string): string {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    if (!ivHex || !tagHex || !dataHex) {
      throw new Error('Formato de token cifrado inválido');
    }
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  /**
   * Hash SHA-256 de un secreto. Se usa para guardar refresh tokens en BD sin
   * almacenarlos en claro, permitiendo comparación por igualdad.
   */
  hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  /** Comparación en tiempo constante de dos hashes hex. */
  safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  /** Token opaco aleatorio (para refresh tokens). */
  randomToken(bytes = 48): string {
    return randomBytes(bytes).toString('hex');
  }
}
