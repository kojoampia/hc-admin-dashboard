/**
 * BridgeCare design tokens, exposed as Tailwind utilities.
 *
 * The names here are deliberately identical to hc-professional/web's — `bg-hpd-primary`,
 * `text-hpd-muted`, `rounded-hpd`, `shadow-hpd` and the rest mean the same thing in both apps, so
 * markup copies across without translation. That app declares them in a Tailwind v4 `@theme`
 * block; this one is on v3, where the equivalent is `theme.extend`. Same vocabulary, same values —
 * nothing in the app source can tell the two apart.
 *
 * content/scss/global.scss's `:root` is the single source of truth for the *values*; nothing below
 * hardcodes a colour. Changing the palette means editing that block and nothing else.
 */

/**
 * Tailwind v3 can't apply an opacity modifier (`bg-hpd-gold/20`) to a bare `var()` — it emits
 * `--tw-bg-opacity` next to a colour that ignores it, so the modifier silently does nothing. The
 * functional form below is the supported escape hatch: return the plain variable when there is no
 * modifier, and mix it towards transparent when there is. `color-mix()` needs Chrome 111 /
 * Safari 16.2 / Firefox 113, all well inside .browserslistrc (`last 1 Chrome version`,
 * `last 2 Safari major versions`, `Firefox ESR`, …).
 *
 * @param {string} name the custom property to read, without the `--` prefix
 * @returns {(options: { opacityValue?: string }) => string}
 */
const token =
  name =>
  ({ opacityValue }) =>
    opacityValue === undefined ? `var(--${name})` : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/main/webapp/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        'hpd-primary': token('hpd-color-primary-blue'),
        'hpd-primary-hover': token('hpd-color-primary-hover'),
        'hpd-primary-deep': token('hpd-color-primary-deep'),
        'hpd-primary-dark': token('hpd-color-text-primary'),
        'hpd-gold': token('hpd-color-gold'),
        'hpd-gold-bright': token('hpd-color-gold-bright'),
        'hpd-gold-tint': token('hpd-color-gold-tint'),
        'hpd-cream': token('hpd-color-cream'),
        'hpd-surface': token('hpd-color-surface'),
        'hpd-border': token('hpd-color-border'),
        'hpd-muted': token('hpd-color-text-muted'),
        'hpd-subtle': token('hpd-color-text-subtle'),
        'hpd-on-navy-muted': token('hpd-color-on-navy-muted'),
        'hpd-on-navy-soft': token('hpd-color-on-navy-soft'),
        'hpd-on-navy-faint': token('hpd-color-on-navy-faint'),
        'hpd-success': token('hpd-color-success'),
        'hpd-success-accent': token('hpd-color-success-accent'),
        'hpd-success-tint': token('hpd-color-success-tint'),
        'hpd-warning': token('hpd-color-warning'),
        'hpd-warning-accent': token('hpd-color-warning-accent'),
        'hpd-warning-tint': token('hpd-color-warning-tint'),
        'hpd-danger': token('hpd-color-danger'),
        'hpd-danger-accent': token('hpd-color-danger-accent'),
        'hpd-danger-tint': token('hpd-color-danger-tint'),
        'hpd-urgent': token('hpd-color-card-urgent'),
        'hpd-open': token('hpd-color-card-open'),
        'hpd-closed': token('hpd-color-card-closed'),
        'hpd-row-urgent': token('hpd-color-row-urgent'),
        'hpd-row-open': token('hpd-color-row-open'),
        'hpd-row-closed': token('hpd-color-row-closed'),
        'hpd-chart-navy': token('hpd-color-chart-navy'),
        'hpd-chart-gold': token('hpd-color-chart-gold'),
        'hpd-chart-blue': token('hpd-color-chart-blue'),
      },
      borderRadius: {
        'hpd-sm': 'var(--hpd-r-sm)',
        hpd: 'var(--hpd-r)',
        'hpd-lg': 'var(--hpd-r-lg)',
        'hpd-xl': 'var(--hpd-r-xl)',
      },
      boxShadow: {
        'hpd-sm': 'var(--hpd-sh-sm)',
        hpd: 'var(--hpd-sh)',
        'hpd-lg': 'var(--hpd-sh-lg)',
      },
      fontFamily: {
        // Keeps the `font-sans` utility itself in step with the rest of the app for the handful of
        // places that apply it explicitly (shared/alert's <pre> blocks, mainly).
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
