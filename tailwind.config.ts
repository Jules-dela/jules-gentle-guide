import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'display': ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
        'sans': ['"Schibsted Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
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
        navy: {
          DEFAULT: "hsl(var(--navy))",
          light: "hsl(var(--navy-light))",
        },
        "grey-light": "hsl(var(--grey-light))",
        uk: {
          navy: "#263359",
          "navy-dark": "#0C2461",
          "navy-light": "#1B4D8C",
          "navy-tint": "#F3F5FA",
          gold: "#A98A45",
          "gold-soft": "#B8A868",
          "gold-light": "#C9B77E",
          "gold-tint": "#F5F1E4",
          ink: "#1A2136",
          muted: "#5E657A",
          hairline: "#E6E8EF",
          "hairline-soft": "#F0F1F6",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-hero': 'var(--gradient-hero)',
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
        "aurora": {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        "aurora-fast": {
          "0%": {
            backgroundPosition: "0% 0%, 100% 100%",
          },
          "50%": {
            backgroundPosition: "100% 100%, 0% 0%",
          },
          "100%": {
            backgroundPosition: "0% 0%, 100% 100%",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: "0.4",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.7",
            transform: "scale(1.1)",
          },
        },
        "mesh-gradient-1": {
          "0%, 100%": {
            transform: "rotate(0deg) scale(1)",
          },
          "50%": {
            transform: "rotate(3deg) scale(1.05)",
          },
        },
        "mesh-blob-1": {
          "0%": {
            transform: "translate(0%, 0%) scale(1)",
          },
          "25%": {
            transform: "translate(10%, 15%) scale(1.1)",
          },
          "50%": {
            transform: "translate(5%, 25%) scale(1)",
          },
          "75%": {
            transform: "translate(-5%, 10%) scale(1.05)",
          },
          "100%": {
            transform: "translate(0%, 0%) scale(1)",
          },
        },
        "mesh-blob-2": {
          "0%": {
            transform: "translate(0%, 0%) scale(1)",
          },
          "33%": {
            transform: "translate(-15%, -10%) scale(1.15)",
          },
          "66%": {
            transform: "translate(-5%, -20%) scale(0.95)",
          },
          "100%": {
            transform: "translate(0%, 0%) scale(1)",
          },
        },
        "mesh-blob-3": {
          "0%": {
            transform: "translate(0%, 0%) scale(1)",
            opacity: "0.8",
          },
          "50%": {
            transform: "translate(20%, -15%) scale(1.2)",
            opacity: "1",
          },
          "100%": {
            transform: "translate(0%, 0%) scale(1)",
            opacity: "0.8",
          },
        },
        "mesh-blob-4": {
          "0%": {
            transform: "translate(0%, 0%) scale(1)",
          },
          "40%": {
            transform: "translate(-10%, 20%) scale(1.1)",
          },
          "80%": {
            transform: "translate(5%, 5%) scale(0.95)",
          },
          "100%": {
            transform: "translate(0%, 0%) scale(1)",
          },
        },
        "mesh-accent": {
          "0%, 100%": {
            opacity: "0.6",
            transform: "translate(0%, 0%)",
          },
          "50%": {
            opacity: "1",
            transform: "translate(-30%, 20%)",
          },
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1)",
          },
          "50%": {
            transform: "translate(5%, -8%) scale(1.05)",
          },
        },
        "float-slower": {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1)",
          },
          "33%": {
            transform: "translate(-8%, 5%) scale(1.08)",
          },
          "66%": {
            transform: "translate(3%, -3%) scale(0.98)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora": "aurora 60s linear infinite",
        "aurora-fast": "aurora-fast 15s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "mesh-gradient-1": "mesh-gradient-1 40s ease-in-out infinite",
        "mesh-blob-1": "mesh-blob-1 45s ease-in-out infinite",
        "mesh-blob-2": "mesh-blob-2 50s ease-in-out infinite",
        "mesh-blob-3": "mesh-blob-3 35s ease-in-out infinite",
        "mesh-blob-4": "mesh-blob-4 55s ease-in-out infinite",
        "mesh-accent": "mesh-accent 30s ease-in-out infinite",
        "float-slow": "float-slow 20s ease-in-out infinite",
        "float-slower": "float-slower 30s ease-in-out infinite",
        "shimmer": "shimmer 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
