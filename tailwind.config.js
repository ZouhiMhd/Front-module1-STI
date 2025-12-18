/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
      },
      colors: {
        // Primary Blue Scale
        primary: {
          50: "#EBF5FF",
          100: "#D6EBFF",
          200: "#ADD6FF",
          300: "#7ABDFF",
          400: "#47A4FF",
          500: "#1392EC", // Base color
          600: "#0D78C9",
          700: "#0A5E9E",
          800: "#084A7C",
          900: "#063759",
          950: "#042438",
          DEFAULT: "#1392EC",
        },

        // Background colors
        background: {
          DEFAULT: "var(--background)",
          light: "#F6F7F8",
          white: "var(--background-white)",
          dark: "#101A22",
        },
        "surface-dark": "#1A2632",

        // Text colors
        foreground: {
          DEFAULT: "var(--foreground)",
        },
        "text-primary": "#111518",
        "text-secondary": "var(--foreground-secondary)",
        "text-light": "#E5E7EB",

        // Functional colors
        success: {
          DEFAULT: "#22C55E",
          light: "#DCFCE7",
          dark: "#166534",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#991B1B",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#92400E",
        },
        info: {
          DEFAULT: "#38BDF8",
          light: "#E0F2FE",
          dark: "#0369A1",
        },

        // Border colors
        border: {
          DEFAULT: "#E5E7EB",
          dark: "#374151",
        },
      },
    },
  },
  plugins: [],
};
