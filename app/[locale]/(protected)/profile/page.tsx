"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthContext";
import { authFetch } from "@/lib/auth/client";

// Specialty options matching the database enum
const specialties = [
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "general_medicine", label: "General Medicine" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "neurology", label: "Neurology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "radiology", label: "Radiology" },
  { value: "surgery", label: "Surgery" },
  { value: "other", label: "Other" },
];

export default function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();
  const { doctor, isAuthenticated, isLoading, refreshUser } = useAuth();

  // Personal info state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Professional info state
  const [specialty, setSpecialty] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [personalLoading, setPersonalLoading] = useState(false);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState(false);
  const [professionalSuccess, setProfessionalSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with doctor data
  useEffect(() => {
    if (doctor) {
      setFirstName(doctor.firstName);
      setLastName(doctor.lastName);
      setEmail(doctor.email);
      setSpecialty(doctor.specialty);
    }
  }, [doctor]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalLoading(true);
    setError(null);
    setPersonalSuccess(false);

    try {
      const response = await authFetch("/api/doctors/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });

      const data = await response.json();

      if (data.success) {
        setPersonalSuccess(true);
        await refreshUser();
        setTimeout(() => setPersonalSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to update personal information");
      }
    } catch {
      setError("An error occurred while updating your profile");
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleProfessionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfessionalLoading(true);
    setError(null);
    setProfessionalSuccess(false);

    try {
      const response = await authFetch("/api/doctors/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty }),
      });

      const data = await response.json();

      if (data.success) {
        setProfessionalSuccess(true);
        await refreshUser();
        setTimeout(() => setProfessionalSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to update professional information");
      }
    } catch {
      setError("An error occurred while updating your profile");
    } finally {
      setProfessionalLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await authFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch {
      setError("An error occurred while changing your password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const resetPersonalForm = () => {
    if (doctor) {
      setFirstName(doctor.firstName);
      setLastName(doctor.lastName);
    }
  };

  const resetProfessionalForm = () => {
    if (doctor) {
      setSpecialty(doctor.specialty);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark">
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <Link id="tour-home-breadcrumb" href="/" className="hover:text-primary">
                {t("breadcrumb.home") || "Home"}
              </Link>
              {" / "}
              <span>{t("breadcrumb.profile") || "My Profile"}</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {t("title") || "My Profile"}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t("subtitle") || "Manage your personal, professional and account information."}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          <div className="space-y-10">
            <div id="profile-personal-info" className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  {t("personal.title") || "Personal Information"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t("personal.subtitle") || "Update your photo and personal details here."}
                </p>
              </div>
              <form onSubmit={handlePersonalSubmit}>
                <div className="p-6 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {getInitials(doctor.fullName)}
                    </div>
                    <div className="flex gap-3">
                      <button
                        id="tour-change-photo-button"
                        type="button"
                        className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        {t("personal.changePhoto") || "Change"}
                      </button>
                      <button
                        id="tour-remove-photo-button"
                        type="button"
                        className="px-4 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {t("personal.removePhoto") || "Remove"}
                      </button>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        htmlFor="first-name"
                      >
                        {t("personal.firstName") || "First Name"}
                      </label>
                      <input
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                        id="first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        htmlFor="last-name"
                      >
                        {t("personal.lastName") || "Last Name"}
                      </label>
                      <input
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                        id="last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      htmlFor="email"
                    >
                      {t("personal.email") || "Email Address"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        mail
                      </span>
                      <input
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 focus:ring-primary focus:border-primary pl-10 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("personal.emailNote") || "Email address cannot be changed."}
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between rounded-b-lg">
                  {personalSuccess && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      {t("saved") || "Saved successfully"}
                    </span>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <button
                      id="tour-personal-cancel-button"
                      type="button"
                      onClick={resetPersonalForm}
                      className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      id="tour-personal-save-button"
                      type="submit"
                      disabled={personalLoading}
                      className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {personalLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                          {t("saving") || "Saving..."}
                        </span>
                      ) : (
                        t("save") || "Save"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Professional Information */}
            <div id="profile-professional-info" className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  {t("professional.title") || "Professional Information"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t("professional.subtitle") || "Manage your professional details."}
                </p>
              </div>
              <form onSubmit={handleProfessionalSubmit}>
                <div className="p-6">
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="specialty"
                  >
                    {t("professional.specialty") || "Specialty"}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      medical_services
                    </span>
                    <select
                      className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary pl-10 text-slate-900 dark:text-white"
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    >
                      {specialties.map((s) => (
                        <option key={s.value} value={s.value}>
                          {t(`specialties.${s.value}`) || s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between rounded-b-lg">
                  {professionalSuccess && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      {t("saved") || "Saved successfully"}
                    </span>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <button
                      id="tour-professional-cancel-button"
                      type="button"
                      onClick={resetProfessionalForm}
                      className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      id="tour-professional-save-button"
                      type="submit"
                      disabled={professionalLoading}
                      className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {professionalLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                          {t("saving") || "Saving..."}
                        </span>
                      ) : (
                        t("save") || "Save"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div id="profile-change-password" className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  {t("password.title") || "Change Password"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t("password.subtitle") || "Update your password to secure your account."}
                </p>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="p-6 space-y-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      htmlFor="current-password"
                    >
                      {t("password.current") || "Current Password"}
                    </label>
                    <input
                      className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        htmlFor="new-password"
                      >
                        {t("password.new") || "New Password"}
                      </label>
                      <input
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        htmlFor="confirm-password"
                      >
                        {t("password.confirm") || "Confirm Password"}
                      </label>
                      <input
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between rounded-b-lg">
                  {passwordSuccess && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      {t("password.changed") || "Password changed successfully"}
                    </span>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <button
                      id="tour-password-cancel-button"
                      type="button"
                      onClick={resetPasswordForm}
                      className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      id="tour-password-save-button"
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                          {t("password.changing") || "Changing..."}
                        </span>
                      ) : (
                        t("password.change") || "Change Password"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
