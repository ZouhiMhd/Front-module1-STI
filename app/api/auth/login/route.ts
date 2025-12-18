import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { generateAccessToken } from '@/lib/auth/jwt';
import { loginSchema, formatZodErrors } from '@/lib/auth/validation';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(validationResult.error),
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find doctor by email
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, email.toLowerCase()))
      .limit(1);

    // Check if doctor exists
    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        },
        { status: 401 }
      );
    }

    // Check if account is active
    if (doctor.isActive !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account disabled',
          message: 'Your account has been disabled. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, doctor.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await db
      .update(doctors)
      .set({ updatedAt: new Date() })
      .where(eq(doctors.id, doctor.id));

    // Generate access token
    const accessToken = await generateAccessToken({
      id: doctor.id,
      email: doctor.email,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      role: doctor.role,
      isActive: doctor.isActive,
      emailVerified: doctor.emailVerified,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          doctor: {
            id: doctor.id,
            email: doctor.email,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            fullName: doctor.fullName,
            specialty: doctor.specialty,
            role: doctor.role,
            createdAt: doctor.createdAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);

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
