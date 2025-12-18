import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { verifyAuth } from '@/lib/auth/middleware';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: authResult.error },
        { status: authResult.status }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      });

      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get doctor from database
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, authResult.payload.sub))
      .limit(1);

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, doctor.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password', message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await db
      .update(doctors)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, authResult.payload.sub));

    return NextResponse.json(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);

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
