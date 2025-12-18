import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { generateAccessToken } from '@/lib/auth/jwt';
import { registerSchema, formatZodErrors } from '@/lib/auth/validation';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
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

    const { email, password, firstName, lastName, specialty } = validationResult.data;

    // Check if email already exists
    const existingDoctor = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.email, email.toLowerCase()))
      .limit(1);

    if (existingDoctor.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
          details: { email: 'This email is already in use' },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create full name
    const fullName = `${firstName} ${lastName}`;

    // Insert new doctor
    const [newDoctor] = await db
      .insert(doctors)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        fullName,
        specialty,
        role: 'doctor',
        isActive: 'true',
      })
      .returning({
        id: doctors.id,
        email: doctors.email,
        firstName: doctors.firstName,
        lastName: doctors.lastName,
        fullName: doctors.fullName,
        specialty: doctors.specialty,
        role: doctors.role,
        createdAt: doctors.createdAt,
      });

    // Generate access token
    const accessToken = await generateAccessToken({
      id: newDoctor.id,
      email: newDoctor.email,
      firstName: newDoctor.firstName,
      lastName: newDoctor.lastName,
      fullName: newDoctor.fullName,
      specialty: newDoctor.specialty,
      role: newDoctor.role,
      isActive: 'true',
      emailVerified: null,
      createdAt: newDoctor.createdAt,
      updatedAt: newDoctor.createdAt,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          accessToken,
          doctor: {
            id: newDoctor.id,
            email: newDoctor.email,
            firstName: newDoctor.firstName,
            lastName: newDoctor.lastName,
            fullName: newDoctor.fullName,
            specialty: newDoctor.specialty,
            role: newDoctor.role,
            createdAt: newDoctor.createdAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email already registered',
          },
          { status: 409 }
        );
      }
    }

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
