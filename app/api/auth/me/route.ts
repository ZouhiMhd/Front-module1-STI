import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'No access token provided',
        },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    // Fetch doctor from database
    const [doctor] = await db
      .select({
        id: doctors.id,
        email: doctors.email,
        firstName: doctors.firstName,
        lastName: doctors.lastName,
        fullName: doctors.fullName,
        specialty: doctors.specialty,
        role: doctors.role,
        isActive: doctors.isActive,
        emailVerified: doctors.emailVerified,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
      })
      .from(doctors)
      .where(eq(doctors.id, payload.sub))
      .limit(1);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Doctor not found',
        },
        { status: 404 }
      );
    }

    // Check if account is still active
    if (doctor.isActive !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account disabled',
          message: 'Your account has been disabled',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          doctor,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
