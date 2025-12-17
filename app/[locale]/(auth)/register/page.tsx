"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import DocTablet from "../../../../public/assets/doctor-using-tablet.png"

export default function RegisterPage() {
  const t = useTranslations("register");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column: Form Section */}
      <div className="flex flex-col w-full lg:w-1/2 bg-white dark:bg-background-dark">

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 xl:px-32 py-8">
          <div className="w-full max-w-[560px] mx-auto flex flex-col gap-6">
            {/* Headings */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#111518] dark:text-white">
                {t("title")}
              </h1>
              <p className="text-base text-[#617989] dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 h-12 px-4 rounded-lg border border-[#dbe1e6] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Image
                  alt="Google"
                  className="w-5 h-5"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium text-[#111518] dark:text-white">
                  Google
                </span>
              </button>
              <button className="flex items-center justify-center gap-3 h-12 px-4 rounded-lg border border-[#dbe1e6] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Image
                  alt="LinkedIn"
                  className="w-5 h-5"
                  src="https://www.svgrepo.com/show/448234/linkedin.svg"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium text-[#111518] dark:text-white">
                  LinkedIn
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#dbe1e6] dark:border-gray-700"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-[#617989] dark:text-gray-500 uppercase tracking-wider">
                {t("divider")}
              </span>
              <div className="flex-grow border-t border-[#dbe1e6] dark:border-gray-700"></div>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-5">
              {/* Names */}
              <div className="flex flex-col md:flex-row gap-5">
                <label className="flex flex-col flex-1 gap-2">
                  <span className="text-sm font-medium text-[#111518] dark:text-gray-200">
                    {t("firstName")}
                  </span>
                  <input
                    className="form-input w-full h-12 rounded-lg border border-[#dbe1e6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111518] dark:text-white px-4 placeholder:text-[#617989] dark:placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder={t("firstNamePlaceholder")}
                    type="text"
                  />
                </label>
                <label className="flex flex-col flex-1 gap-2">
                  <span className="text-sm font-medium text-[#111518] dark:text-gray-200">
                    {t("lastName")}
                  </span>
                  <input
                    className="form-input w-full h-12 rounded-lg border border-[#dbe1e6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111518] dark:text-white px-4 placeholder:text-[#617989] dark:placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder={t("lastNamePlaceholder")}
                    type="text"
                  />
                </label>
              </div>

              {/* Specialty */}
              <label className="flex flex-col gap-2 relative">
                <span className="text-sm font-medium text-[#111518] dark:text-gray-200">
                  {t("specialty")}
                </span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#617989] pointer-events-none">
                    medical_services
                  </span>
                  <select className="form-select w-full h-12 rounded-lg border border-[#dbe1e6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111518] dark:text-white px-4 pr-10 appearance-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                    <option disabled value="">
                      {t("specialtyPlaceholder")}
                    </option>
                    <option value="cardio">{t("specialties.cardiology")}</option>
                    <option value="derma">{t("specialties.dermatology")}</option>
                    <option value="gene">{t("specialties.generalMedicine")}</option>
                    <option value="pedia">{t("specialties.pediatrics")}</option>
                    <option value="neuro">{t("specialties.neurology")}</option>
                  </select>
                </div>
              </label>

              {/* Email */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#111518] dark:text-gray-200">
                  {t("email")}
                </span>
                <input
                  className="form-input w-full h-12 rounded-lg border border-[#dbe1e6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111518] dark:text-white px-4 placeholder:text-[#617989] dark:placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                />
              </label>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#111518] dark:text-gray-200">
                    {t("password")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    className="form-input w-full h-12 rounded-lg border border-[#dbe1e6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111518] dark:text-white px-4 placeholder:text-[#617989] dark:placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all pr-12"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#617989] hover:text-[#111518] dark:hover:text-white focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {/* Strength Meter */}
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full ${
                        passwordStrength >= level
                          ? "bg-green-500"
                          : "bg-[#dbe1e6] dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#617989]">
                  {t("passwordHint")}
                </span>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 mt-2 cursor-pointer">
                <input
                  className="w-5 h-5 rounded border-[#dbe1e6] text-primary focus:ring-primary focus:ring-offset-0 bg-white dark:bg-gray-800 dark:border-gray-600 mt-0.5"
                  type="checkbox"
                />
                <span className="text-sm text-[#617989] dark:text-gray-400">
                  {t("termsText")}{" "}
                  <Link
                    className="text-primary hover:underline font-medium"
                    href="/terms"
                  >
                    {t("termsLink")}
                  </Link>{" "}
                  {t("and")}{" "}
                  <Link
                    className="text-primary hover:underline font-medium"
                    href="/privacy"
                  >
                    {t("privacyLink")}
                  </Link>
                  .
                </span>
              </label>

              {/* Submit Button */}
              <button
                className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-primary-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm"
                type="submit"
              >
                {t("submit")}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-4 pb-8">
              <p className="text-sm text-[#617989] dark:text-gray-400">
                {t("hasAccount")}{" "}
                <Link
                  className="text-primary font-bold hover:underline ml-1"
                  href="/login"
                >
                  {t("login")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual/Feature Section */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 dark:bg-[#0b1218] relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background Decoration */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#1392ec 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Image Container */}
        <div className="relative z-10 w-full max-w-[600px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            alt={t("imageAlt")}
            className="w-full h-full object-cover"
            src={DocTablet}
            fill
            sizes="(max-width: 1024px) 0vw, 50vw"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Testimonial/Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-200" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-300" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-400" />
              </div>
              <span className="text-sm font-medium ml-2">
                {t("trustBadge")}
              </span>
            </div>
            <blockquote className="text-xl font-medium leading-relaxed mb-4">
              &ldquo;{t("testimonial")}&rdquo;
            </blockquote>
            <div className="flex flex-col">
              <cite className="font-bold not-italic">{t("testimonialAuthor")}</cite>
              <span className="text-white/80 text-sm">{t("testimonialRole")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
