import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { DoctorProfile } from '@/lib/db/schema';

// Custom payload interface extending JWTPayload
export interface TokenPayload extends JWTPayload {
  sub: string; // doctor id
  email: string;
  role: string;
  specialty: string;
}

// Get the secret key as Uint8Array
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return new TextEncoder().encode(secret);
}

// Parse expiration time string to seconds
function parseExpirationTime(expiration: string): number {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60; // Default: 7 days in seconds
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 7 * 24 * 60 * 60;
  }
}

/**
 * Generate an access token for a doctor
 */
export async function generateAccessToken(doctor: DoctorProfile): Promise<string> {
  const secretKey = getSecretKey();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const expirationSeconds = parseExpirationTime(expiresIn);

  const token = await new SignJWT({
    sub: doctor.id,
    email: doctor.email,
    role: doctor.role,
    specialty: doctor.specialty,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationSeconds)
    .setIssuer('medexpert')
    .setAudience('medexpert-api')
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'medexpert',
      audience: 'medexpert-api',
    });

    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );

    return payload as TokenPayload;
  } catch {
    return null;
  }
}
