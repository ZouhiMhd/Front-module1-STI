import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Static imports for each locale
import en from "../../public/locales/en/common.json";
import fr from "../../public/locales/fr/common.json";

const messages = {
  en,
  fr,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as keyof typeof messages],
  };
});
