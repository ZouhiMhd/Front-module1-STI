// Auth module exports
// Server-side exports
export { hashPassword, verifyPassword, validatePasswordStrength } from './password';
export {
  generateAccessToken,
  verifyAccessToken,
  extractTokenFromHeader,
  decodeToken,
  type TokenPayload
} from './jwt';
export {
  verifyAuth,
  withAuth,
  withRole,
  unauthorizedResponse,
  forbiddenResponse,
  isProtectedApiRoute,
  isPublicApiRoute,
  type AuthResult
} from './middleware';
export {
  registerSchema,
  loginSchema,
  formatZodErrors,
  medicalSpecialties,
  type RegisterInput,
  type LoginInput
} from './validation';
