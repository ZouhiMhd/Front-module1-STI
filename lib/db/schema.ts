import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Define the role enum
export const roleEnum = pgEnum('role', ['doctor', 'admin']);

// Define the medical specialty enum
export const specialtyEnum = pgEnum('medical_specialty', [
  'cardiology',
  'dermatology',
  'general_medicine',
  'pediatrics',
  'neurology',
  'orthopedics',
  'psychiatry',
  'radiology',
  'surgery',
  'other',
]);

// Doctors table schema
export const doctors = pgTable('doctors', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  specialty: specialtyEnum('specialty').notNull(),
  role: roleEnum('role').default('doctor').notNull(),
  isActive: varchar('is_active', { length: 10 }).default('true').notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Sessions table for token management (optional - for refresh tokens)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for TypeScript
export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Type for the specialty values
export type MedicalSpecialty = typeof specialtyEnum.enumValues[number];

// Type for doctor profile (without sensitive data)
export type DoctorProfile = Omit<Doctor, 'passwordHash'>;
