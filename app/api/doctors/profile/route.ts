import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { withAuth, TokenPayload } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// GET /api/doctors/profile - Get current doctor's profile (protected route example)
export const GET = withAuth(
  async (
    _request: NextRequest,
    { auth }: { params: Promise<Record<string, string>>; auth: TokenPayload }
  ) => {
    try {
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
        .where(eq(doctors.id, auth.sub))
        .limit(1);

      if (!doctor) {
        return NextResponse.json(
          { success: false, error: 'Doctor not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { doctor },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/doctors/profile - Update current doctor's profile (protected route example)
export const PATCH = withAuth(
  async (
    request: NextRequest,
    { auth }: { params: Promise<Record<string, string>>; auth: TokenPayload }
  ) => {
    try {
      const body = await request.json();
      const { firstName, lastName, specialty } = body;

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (firstName || lastName) {
        updateData.fullName = `${firstName || ''} ${lastName || ''}`.trim();
      }
      if (specialty) updateData.specialty = specialty;

      const [updatedDoctor] = await db
        .update(doctors)
        .set(updateData)
        .where(eq(doctors.id, auth.sub))
        .returning({
          id: doctors.id,
          email: doctors.email,
          firstName: doctors.firstName,
          lastName: doctors.lastName,
          fullName: doctors.fullName,
          specialty: doctors.specialty,
          role: doctors.role,
          updatedAt: doctors.updatedAt,
        });

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: { doctor: updatedDoctor },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);
