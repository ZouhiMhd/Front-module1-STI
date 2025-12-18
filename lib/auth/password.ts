import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Returns an object with validation result and message
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let score = 0;
  if (password.length >= minLength) score++;
  if (password.length >= 12) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'fair';
  else if (score <= 4) strength = 'good';
  else strength = 'strong';

  const isValid = password.length >= minLength && hasUppercase && hasLowercase && hasNumber;

  let message = '';
  if (!isValid) {
    const missing: string[] = [];
    if (password.length < minLength) missing.push(`at least ${minLength} characters`);
    if (!hasUppercase) missing.push('an uppercase letter');
    if (!hasLowercase) missing.push('a lowercase letter');
    if (!hasNumber) missing.push('a number');
    message = `Password must contain ${missing.join(', ')}`;
  }

  return { isValid, message, strength };
}
