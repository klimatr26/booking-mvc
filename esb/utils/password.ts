import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'node:crypto';

const PBKDF2_ITERATIONS = 310_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Crea un hash seguro para contrasenas usando PBKDF2.
 * Resultado en formato: pbkdf2$iteraciones$salt$hash
 */
export function createPasswordHash(plain: string): string {
  if (!plain || typeof plain !== 'string') {
    throw new Error('La contrasena es requerida');
  }

  const salt = randomBytes(16).toString('hex');
  const derivedKey = pbkdf2Sync(
    plain,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  ).toString('hex');

  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${derivedKey}`;
}

/**
 * Verifica que una contrasena en texto plano coincida con un hash generado por createPasswordHash.
 */
export function verifyPasswordHash(plain: string, hash: string): boolean {
  if (!plain || !hash) {
    return false;
  }

  const parts = hash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false;
  }

  const [, iterationsRaw, salt, storedKey] = parts;
  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!iterations || !salt || !storedKey) {
    return false;
  }

  const storedKeyBuffer = Buffer.from(storedKey, 'hex');
  const derivedKey = pbkdf2Sync(
    plain,
    salt,
    iterations,
    storedKeyBuffer.length,
    PBKDF2_DIGEST
  );

  if (derivedKey.length !== storedKeyBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKeyBuffer);
}
