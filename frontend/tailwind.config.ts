import type { Config } from "tailwindcss";

/**
 * Tailwind config with Neobrutalism design tokens.
 *
 * Neobrutalism key rules:
 *  - Black/white base with bold accent colors
 *  - Thick, flat borders (2–4px solid black)
 *  - Hard box-shadows (no blur, solid color offset)
 *  - Zero or very small border-radius (brutalism = sharp corners)
 *  - Bold, oversized typography
 */
const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			// ── Neobrutalism color palette ───────────────────────────────────────
			colors: {
				// Base
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				// Accents — bright, saturated
				neo: {
					yellow: "#FFE500",   // primary CTA accent
					orange: "#FF6B35",   // warning / highlight
					red: "#FF2424",   // danger / scam
					green: "#00CC66",   // safe / success
					blue: "#2D6BE4",   // info
					pink: "#FF3EAD",   // tag pill
					purple: "#7B2FBE",   // blockchain accent
				},
				// ShadCN tokens (keep working)
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},

			// ── Neobrutalism: sharp corners ──────────────────────────────────────
			borderRadius: {
				none: "0px",
				sm: "2px",
				DEFAULT: "4px",
				md: "4px",
				lg: "6px",
			},

			// ── Neobrutalism: hard box shadows (no blur) ─────────────────────────
			boxShadow: {
				neo: "4px 4px 0px 0px #000",
				"neo-sm": "2px 2px 0px 0px #000",
				"neo-lg": "6px 6px 0px 0px #000",
				"neo-yellow": "4px 4px 0px 0px #FFE500",
				"neo-red": "4px 4px 0px 0px #FF2424",
				"neo-green": "4px 4px 0px 0px #00CC66",
				"neo-blue": "4px 4px 0px 0px #2D6BE4",
			},

			// ── Neobrutalism: thick borders ──────────────────────────────────────
			borderWidth: {
				"3": "3px",
				"4": "4px",
			},

			// ── Typography (Space Grotesk loaded in layout.tsx) ──────────────────
			fontFamily: {
				sans: ["Space Grotesk", "sans-serif"],
				mono: ["Space Mono", "monospace"],
			},

			// ── Oversized font sizes for hero text ──────────────────────────────
			fontSize: {
				"7xl": ["4.5rem", { lineHeight: "1" }],
				"8xl": ["6rem", { lineHeight: "1" }],
				"9xl": ["8rem", { lineHeight: "1" }],
				"10xl": ["10rem", { lineHeight: "1" }],
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
