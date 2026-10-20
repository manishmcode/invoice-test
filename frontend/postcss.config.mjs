/**
 * PostCSS requires this filename. Exception to PascalCase source files.
 * Tailwind v4 uses @tailwindcss/postcss instead of a tailwind.config theme file.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
