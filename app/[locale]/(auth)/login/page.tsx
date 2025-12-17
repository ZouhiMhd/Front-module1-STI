"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden">
      {/* Left Side: Visual/Context */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <Image
          alt={t("imageAlt")}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2080&q=80"
          fill
          sizes="50vw"
          priority
        />
        <div className="relative z-10 flex flex-col justify-end p-16 w-full text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="size-8">
                <svg
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">MedExpert</h2>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-lg text-slate-200 max-w-md">
              {t("heroDescription")}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="h-1 w-8 bg-primary rounded-full"></span>
            <span className="h-1 w-2 bg-slate-500 rounded-full"></span>
            <span className="h-1 w-2 bg-slate-500 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20 xl:px-32 bg-white dark:bg-background-dark">
        {/* Mobile Logo (visible only on small screens) */}
        <div className="lg:hidden flex items-center gap-3 text-slate-900 dark:text-white mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold">MedExpert</h2>
          </Link>
        </div>

        <div className="w-full max-w-[480px] mx-auto">
          {/* Heading */}
          <div className="flex flex-col gap-3 mb-8">
            <h2 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight">
              {t("title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
              {t("subtitle")}
            </p>
          </div>

          <form className="space-y-6">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-slate-900 dark:text-slate-200 text-base font-medium leading-normal"
                htmlFor="email"
              >
                {t("email")}
              </label>
              <div className="relative flex w-full items-stretch rounded-lg group">
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-14 placeholder:text-slate-400 p-[15px] pr-12 text-base font-normal leading-normal transition-all"
                  id="email"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-[15px] pointer-events-none text-slate-400 dark:text-slate-500">
                  <span className="material-symbols-outlined">mail</span>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-slate-900 dark:text-slate-200 text-base font-medium leading-normal"
                  htmlFor="password"
                >
                  {t("password")}
                </label>
                <Link
                  className="text-primary hover:text-primary-600 text-sm font-medium leading-normal"
                  href="/forgot-password"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative flex w-full items-stretch rounded-lg">
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-14 placeholder:text-slate-400 p-[15px] pr-12 text-base font-normal leading-normal transition-all"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-[15px] cursor-pointer text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="flex w-full items-center justify-center rounded-lg bg-primary hover:bg-primary-600 text-white font-bold h-14 px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark gap-2"
              type="submit"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              {t("submit")}
            </button>
          </form>

          {/* Footer / Secondary Actions */}
          <div className="mt-8 flex flex-col gap-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t("noAccount")}{" "}
              <Link
                className="text-primary font-medium hover:underline"
                href="/register"
              >
                {t("register")}
              </Link>
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-600">
              <span className="material-symbols-outlined text-[16px]">
                verified_user
              </span>
              <span>{t("securityBadge")}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center lg:text-left">
          <Link
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-normal"
            href="/support"
          >
            {t("supportLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
