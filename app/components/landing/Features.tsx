"use client";

import { useTranslations } from "next-intl";

export function Features() {
  const t = useTranslations("features");

  const features = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: t("caseSubmission.title"),
      description: t("caseSubmission.description"),
      color: "primary",
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: t("expertReview.title"),
      description: t("expertReview.description"),
      color: "info",
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("validationStatus.title"),
      description: t("validationStatus.description"),
      color: "success",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> = {
      primary: { bg: "bg-primary-100", icon: "text-primary", border: "border-primary-200" },
      info: { bg: "bg-info-light", icon: "text-info", border: "border-info/20" },
      success: { bg: "bg-success-light", icon: "text-success", border: "border-success/20" },
    };
    return colors[color] || colors.primary;
  };

  return (
    <section id="features" className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("sectionLabel")}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            {t("description")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(feature.color);
            return (
              <div
                key={index}
                className={`group relative rounded-2xl border ${colorClasses.border} bg-white p-8 transition-all hover:shadow-xl hover:shadow-primary/5`}
              >
                <div className={`inline-flex rounded-xl ${colorClasses.bg} p-3`}>
                  <span className={colorClasses.icon}>{feature.icon}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-3 text-text-secondary">{feature.description}</p>

                {/* Hover arrow */}
                <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {t("learnMore")}
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="mt-20 rounded-2xl bg-gradient-to-r from-primary-50 to-info-light p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-text-primary lg:text-3xl">
                {t("builtFor.title")}
              </h3>
              <p className="mt-4 text-text-secondary">
                {t("builtFor.description")}
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  t("builtFor.hipaa"),
                  t("builtFor.multiSpecialty"),
                  t("builtFor.collaborative"),
                  t("builtFor.auditTrails"),
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="text-3xl font-bold text-primary">{t("stats.uptimeValue")}</div>
                <p className="mt-1 text-sm text-text-secondary">{t("stats.uptime")}</p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="text-3xl font-bold text-success">{t("stats.supportValue")}</div>
                <p className="mt-1 text-sm text-text-secondary">{t("stats.support")}</p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="text-3xl font-bold text-info">{t("stats.responseTimeValue")}</div>
                <p className="mt-1 text-sm text-text-secondary">{t("stats.responseTime")}</p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="text-3xl font-bold text-warning">{t("stats.expertsValue")}</div>
                <p className="mt-1 text-sm text-text-secondary">{t("stats.experts")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
