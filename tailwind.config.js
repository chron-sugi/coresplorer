/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
				'xs-': ['0.6875rem', { lineHeight: '1rem' }],    // 11px
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// Knowledge Object type colors - values defined in tokens.css
				ko: {
					dashboard: 'var(--color-ko-dashboard)',
					'saved-search': 'var(--color-ko-saved-search)',
					macro: 'var(--color-ko-macro)',
					'event-type': 'var(--color-ko-event-type)',
					lookup: 'var(--color-ko-lookup)',
					'data-model': 'var(--color-ko-data-model)',
					index: 'var(--color-ko-index)',
					unknown: 'var(--color-ko-unknown)',
				},
				// Semantic colors - values defined in tokens.css
				semantic: {
					'code-bg': 'var(--color-code-bg)',
					'node-bg': 'var(--color-node-bg)',
					'node-border': 'var(--color-node-border)',
					'edge-default': 'var(--color-edge-default)',
				},
				// Field event colors - values defined in tokens.css
				event: {
					origin: 'var(--color-event-origin)',
					created: 'var(--color-event-created)',
					renamed: 'var(--color-event-renamed)',
					consumed: 'var(--color-event-consumed)',
					dropped: 'var(--color-event-dropped)',
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
