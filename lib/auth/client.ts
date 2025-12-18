/**
 * Client-side auth utilities for the frontend
 */

// Types matching the API responses
export interface DoctorProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialty: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: Record<string, string>;
  data?: {
    accessToken: string;
    doctor: DoctorProfile;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const TOKEN_KEY = 'auth-token';
const DOCTOR_KEY = 'doctor-profile';

/**
 * Store auth token in localStorage and cookie
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    // Also set as cookie for middleware access
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove auth token from localStorage and cookie
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

/**
 * Store doctor profile in localStorage
 */
export function setDoctorProfile(doctor: DoctorProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(doctor));
  }
}

/**
 * Get doctor profile from localStorage
 */
export function getDoctorProfile(): DoctorProfile | null {
  if (typeof window !== 'undefined') {
    const profile = localStorage.getItem(DOCTOR_KEY);
    return profile ? JSON.parse(profile) : null;
  }
  return null;
}

/**
 * Remove doctor profile from localStorage
 */
export function removeDoctorProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DOCTOR_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Register a new doctor
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result: AuthResponse = await response.json();

  if (result.success && result.data) {
    setAuthToken(result.data.accessToken);
    setDoctorProfile(result.data.doctor);
  }

  return result;
}

/**
 * Login a doctor
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result: AuthResponse = await response.json();

  if (result.success && result.data) {
    setAuthToken(result.data.accessToken);
    setDoctorProfile(result.data.doctor);
  }

  return result;
}

/**
 * Logout - clear all auth data
 */
export function logout(): void {
  removeAuthToken();
  removeDoctorProfile();
}

/**
 * Get current user profile from API
 */
export async function getCurrentUser(): Promise<DoctorProfile | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      return null;
    }

    const result = await response.json();
    if (result.success && result.data?.doctor) {
      setDoctorProfile(result.data.doctor);
      return result.data.doctor;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Make authenticated API request
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
