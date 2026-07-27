import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /**
       * Fluid type scale.
       * Each size interpolates smoothly between a small-screen minimum (~360px
       * viewport) and the original Tailwind size as the maximum (~1280px+), so
       * large screens render exactly as before while smaller screens scale down
       * instead of overflowing. Line heights are unitless so they track the
       * fluid font size.
       */
      fontSize: {
        xs: ["clamp(0.6875rem, 0.663rem + 0.11vw, 0.75rem)", { lineHeight: "1.45" }],
        sm: ["clamp(0.78125rem, 0.745rem + 0.16vw, 0.875rem)", { lineHeight: "1.5" }],
        base: ["clamp(0.875rem, 0.826rem + 0.22vw, 1rem)", { lineHeight: "1.5" }],
        lg: ["clamp(0.96875rem, 0.907rem + 0.27vw, 1.125rem)", { lineHeight: "1.55" }],
        xl: ["clamp(1.0625rem, 0.989rem + 0.33vw, 1.25rem)", { lineHeight: "1.4" }],
        "2xl": ["clamp(1.1875rem, 1.065rem + 0.54vw, 1.5rem)", { lineHeight: "1.3" }],
        "3xl": ["clamp(1.375rem, 1.179rem + 0.87vw, 1.875rem)", { lineHeight: "1.2" }],
        "4xl": ["clamp(1.5625rem, 1.294rem + 1.2vw, 2.25rem)", { lineHeight: "1.15" }],
        "5xl": ["clamp(1.875rem, 1.435rem + 1.96vw, 3rem)", { lineHeight: "1.1" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
