import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, TokenPayload } from './jwt';

// Extend the NextRequest type to include our custom auth property
declare module 'next/server' {
  interface NextRequest {
    auth?: TokenPayload;
  }
}

/**
 * Authentication result type
 */
export type AuthResult =
  | { success: true; payload: TokenPayload }
  | { success: false; error: string; status: number };

/**
 * Verify authentication from request headers
 * Use this in API routes that require authentication
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      error: 'No access token provided',
      status: 401,
    };
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return {
      success: false,
      error: 'Invalid or expired token',
      status: 401,
    };
  }

  return {
    success: true,
    payload,
  };
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message,
    },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden',
      message,
    },
    { status: 403 }
  );
}

/**
 * Higher-order function to protect API routes
 * Wraps your route handler with authentication check
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params: Promise<Record<string, string>>; auth: TokenPayload }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const authResult = await verifyAuth(request);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: authResult.error,
        },
        { status: authResult.status }
      );
    }

    return handler(request, { ...context, auth: authResult.payload });
  };
}

/**
 * Higher-order function to protect API routes with role check
 */
export function withRole(allowedRoles: string[]) {
  return function (
    handler: (
      request: NextRequest,
      context: { params: Promise<Record<string, string>>; auth: TokenPayload }
    ) => Promise<NextResponse>
  ) {
    return async (
      request: NextRequest,
      context: { params: Promise<Record<string, string>> }
    ): Promise<NextResponse> => {
      const authResult = await verifyAuth(request);

      if (!authResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            message: authResult.error,
          },
          { status: authResult.status }
        );
      }

      if (!allowedRoles.includes(authResult.payload.role)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You do not have permission to access this resource',
          },
          { status: 403 }
        );
      }

      return handler(request, { ...context, auth: authResult.payload });
    };
  };
}

/**
 * Protected routes configuration
 * Add paths that require authentication
 */
export const protectedApiRoutes = [
  '/api/cases',
  '/api/doctors/profile',
  '/api/dashboard',
];

/**
 * Public routes configuration
 * These routes don't require authentication
 */
export const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/health',
];

/**
 * Check if a path is a protected API route
 */
export function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is a public API route
 */
export function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some((route) => pathname.startsWith(route));
}
