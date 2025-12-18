"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavbarProps {
  expertName?: string;
  expertImage?: string;
}

export function Navbar({ expertName = "Dr. Expert", expertImage }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("navbar");

  const navItems = [
    { name: t("dashboard"), href: "/dashboard" },
    { name: t("patients"), href: "/patients" },
    { name: t("parameters"), href: "/parameters" },
  ];

  return (
    <nav className="fixed mb-5 top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
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
            <span className="text-xl font-bold text-text-primary">
              Med<span className="text-primary">Expert</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-light hover:text-text-primary"
              >
                {item.name}
              </Link>
            ))}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Expert Profile */}
            <div className="ml-4 flex items-center gap-3 rounded-full border border-border py-1 pl-1 pr-4 transition-colors hover:bg-background-light">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary-100">
                {expertImage ? (
                  <Image
                    src={expertImage}
                    alt={expertName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-primary-700">
                    {expertName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-text-primary">
                {expertName}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-text-secondary hover:bg-background-light"
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
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-light hover:text-text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Language Switcher Mobile */}
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>

              {/* Expert Profile Mobile */}
              <div className="mt-4 flex items-center gap-3 px-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-primary-100">
                  {expertImage ? (
                    <Image
                      src={expertImage}
                      alt={expertName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium text-primary-700">
                      {expertName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{expertName}</p>
                  <p className="text-xs text-text-secondary">{t("medicalExpert")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
