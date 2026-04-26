import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        bg: "oklch(var(--bg) / <alpha-value>)",
        surface: "oklch(var(--surface) / <alpha-value>)",
        "surface-raised": "oklch(var(--surface-raised) / <alpha-value>)",
        "surface-overlay": "oklch(var(--surface-overlay) / <alpha-value>)",
        fg: "oklch(var(--fg) / <alpha-value>)",
        "fg-muted": "oklch(var(--fg-muted) / <alpha-value>)",
        "fg-subtle": "oklch(var(--fg-subtle) / <alpha-value>)",
        border: "oklch(var(--border) / <alpha-value>)",
        "border-strong": "oklch(var(--border-strong) / <alpha-value>)",
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          fg: "oklch(var(--accent-fg) / <alpha-value>)",
          muted: "oklch(var(--accent-muted) / <alpha-value>)",
        },
        success: "oklch(var(--success) / <alpha-value>)",
        warning: "oklch(var(--warning) / <alpha-value>)",
        danger: "oklch(var(--danger) / <alpha-value>)",
        // shadcn compatibility (mapped to our tokens)
        background: "oklch(var(--bg) / <alpha-value>)",
        foreground: "oklch(var(--fg) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-fg) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--surface-raised) / <alpha-value>)",
          foreground: "oklch(var(--fg) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--surface) / <alpha-value>)",
          foreground: "oklch(var(--fg-muted) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--danger) / <alpha-value>)",
          foreground: "oklch(var(--accent-fg) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--surface-raised) / <alpha-value>)",
          foreground: "oklch(var(--fg) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--surface-overlay) / <alpha-value>)",
          foreground: "oklch(var(--fg) / <alpha-value>)",
        },
        input: "oklch(var(--border) / <alpha-value>)",
        ring: "oklch(var(--accent) / <alpha-value>)",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        instant: "80ms",
        quick: "160ms",
        cinematic: "680ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 2s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "gradient-mesh":
          "radial-gradient(at 12% 20%, oklch(var(--mesh-1) / 0.45) 0px, transparent 50%), radial-gradient(at 85% 10%, oklch(var(--mesh-2) / 0.40) 0px, transparent 50%), radial-gradient(at 70% 80%, oklch(var(--mesh-3) / 0.35) 0px, transparent 50%), radial-gradient(at 20% 75%, oklch(var(--mesh-4) / 0.30) 0px, transparent 50%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
