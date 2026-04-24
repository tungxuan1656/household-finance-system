module.exports = {
  'apps/web/**/*.{js,cjs,mjs,jsx,ts,tsx}': [
    'pnpm --filter web exec eslint --fix',
    'pnpm --filter web exec prettier --write',
  ],
  'apps/web/**/*.{json,yml,yaml,css,scss,html}': [
    'pnpm --filter web exec prettier --write',
  ],
  'apps/worker/**/*.{js,cjs,mjs,jsx,ts,tsx}': [
    'pnpm --filter worker exec eslint --fix',
    'pnpm --filter worker exec prettier --write',
  ],
  'apps/worker/**/*.{json,yml,yaml,css,scss,html}': [
    'pnpm --filter worker exec prettier --write',
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  'docs/**/*.{md,yml,yaml}': ['prettier --write'],
  'harness/**/*.{json,md,yml,yaml}': ['prettier --write'],
  '.github/**/*.{yml,yaml}': ['prettier --write'],
}
