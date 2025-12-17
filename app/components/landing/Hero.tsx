"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-100 opacity-50 blur-3xl" />
        <div className="absolute top-60 -left-20 h-60 w-60 rounded-full bg-info-light opacity-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
              <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              {t("badge")}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              {t("title")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h1>

            <p className="mt-6 text-lg text-text-secondary lg:text-xl">
              {t("description")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30"
              >
                {t("ctaPrimary")}
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-white px-8 py-4 text-base font-semibold text-text-primary transition-all hover:border-primary hover:text-primary"
              >
                {t("ctaSecondary")}
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{t("stats.casesValue")}</p>
                <p className="text-sm text-text-secondary">{t("stats.cases")}</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{t("stats.accuracyValue")}</p>
                <p className="text-sm text-text-secondary">{t("stats.accuracy")}</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{t("stats.specialtiesValue")}</p>
                <p className="text-sm text-text-secondary">{t("stats.specialties")}</p>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative lg:pl-8">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main card */}
              <div className="rounded-2xl bg-white p-6 shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{t("card.caseNumber")}</p>
                    <p className="text-sm text-text-secondary">{t("card.department")}</p>
                  </div>
                  <span className="ml-auto rounded-full bg-warning-light px-3 py-1 text-xs font-medium text-warning-dark">
                    {t("card.pendingReview")}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm text-text-secondary">{t("card.historyVerified")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm text-text-secondary">{t("card.symptomsDocumented")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span className="text-sm text-text-secondary">{t("card.diagnosisAwaiting")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-border" />
                    <span className="text-sm text-text-secondary">{t("card.treatmentPending")}</span>
                  </div>
                </div>

                <button className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600">
                  {t("card.reviewCase")}
                </button>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 rounded-xl bg-success-light p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-success-dark">{t("caseValidated")}</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary-200 border-2 border-white" />
                    <div className="h-8 w-8 rounded-full bg-primary-300 border-2 border-white" />
                    <div className="h-8 w-8 rounded-full bg-primary-400 border-2 border-white" />
                  </div>
                  <span className="text-sm text-text-secondary">{t("expertsReviewing")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
