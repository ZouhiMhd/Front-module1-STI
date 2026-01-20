"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation"; // 1. Import de usePathname
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "./auth/AuthContext";
import { useOnboardingTour } from "./tour/OnboardingTourContext";

interface NavbarProps {
  expertImage?: string;
}

export function Navbar({ expertImage }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("navbar");
  const router = useRouter();
  const pathname = usePathname(); // 2. Récupération du chemin actuel
  const { doctor, isAuthenticated, isLoading, logout } = useAuth();
  const { startTour, resetTour } = useOnboardingTour();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: t("dashboard"), href: "/dashboard" },
    { name: t("statistics"), href: "/statistics" },
    // { name: t("parameters"), href: "/parameters" },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    router.push("/login");
  };

  const handleStartTour = () => {
    resetTour();
    startTour();
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 3. Fonction utilitaire pour vérifier si un lien est actif
  // Elle gère les locales (ex: /en/dashboard) et les sous-routes (ex: /patients/1)
  const isActiveLink = (href: string) => {
    return pathname === href || pathname.includes(href);
  };

  return (
    <nav id="main-navbar" className="fixed mb-5 top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link id="tour-logo-link" href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg text-primary">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              Med<span className="text-primary">Expert</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {isAuthenticated && navItems.map((item) => {
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  id={item.href === "/dashboard" ? "tour-dashboard-link" : "tour-statistics-link"}
                  key={item.name}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary" // Style Actif
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary" // Style Inactif
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {isAuthenticated && (
              <button
                id="tour-start-button"
                onClick={handleStartTour}
                className="ml-4 p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Start onboarding tour"
              >
                <span className="material-symbols-outlined">help</span>
              </button>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Auth Section */}
            {isLoading ? (
              <div className="ml-4 h-9 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            ) : isAuthenticated && doctor ? (
              /* Authenticated: Profile Dropdown */
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  id="tour-profile-dropdown-button"
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 dark:border-slate-700 py-1 pl-1 pr-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10">
                    {expertImage ? (
                      <Image
                        src={expertImage}
                        alt={doctor.fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
                        {getInitials(doctor.fullName)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {doctor.fullName}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    {isProfileDropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {doctor.fullName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {doctor.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                        {doctor.specialty.replace("_", " ")}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        id="tour-profile-link"
                        href="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isActiveLink("/profile") 
                            ? "bg-primary/5 text-primary" 
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">person</span>
                        {t("profile") || "My Profile"}
                      </Link>
                      {/* <Link
                        href="/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isActiveLink("/settings")
                            ? "bg-primary/5 text-primary"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">settings</span>
                        {t("settings") || "Settings"}
                      </Link> */}
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                      <button
                        id="tour-logout-button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        {t("logout") || "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not Authenticated: Login Button */
              <Link
                href="/login"
                className="ml-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                {t("login") || "Sign In"}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-4">
            <div className="flex flex-col gap-2">
              {isAuthenticated && navItems.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Language Switcher Mobile */}
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>

              {/* Auth Section Mobile */}
              {isAuthenticated && doctor ? (
                <>
                  {/* Profile Info */}
                  <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mx-2">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                      {expertImage ? (
                        <Image
                          src={expertImage}
                          alt={doctor.fullName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-medium text-primary">
                          {getInitials(doctor.fullName)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {doctor.fullName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {doctor.email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <Link
                    href="/profile"
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActiveLink("/profile")
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-lg">person</span>
                    {t("profile") || "My Profile"}
                  </Link>
                  {/* <Link
                    href="/settings"
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActiveLink("/settings")
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-lg">settings</span>
                    {t("settings") || "Settings"}
                  </Link> */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    {t("logout") || "Sign Out"}
                  </button>
                </>
              ) : (
                /* Not Authenticated: Login Button Mobile */
                <Link
                  href="/login"
                  className="mx-2 mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-lg">login</span>
                  {t("login") || "Sign In"}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}