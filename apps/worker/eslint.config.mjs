import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactCompiler from 'eslint-plugin-react-compiler'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'
import reactRefresh from 'eslint-plugin-react-refresh'

export default defineConfig([
  globalIgnores([
    '.now/*',
    '**/*.css',
    '**/.changeset',
    '**/dist',
    'esm/*',
    'public/*',
    'tests/*',
    'test/*',
    'scripts/*',
    '**/*.config.js',
    '**/*.config.ts',
    '**/*.config.mts',
    '**/*.config.mjs',
    '**/*.config.cjs',
    '**/.DS_Store',
    '**/node_modules',
    '**/coverage',
    '**/.next',
    '**/build',
    '!**/.commitlintrc.cjs',
    '!**/.lintstagedrc.cjs',
    '!**/jest.config.js',
    '!**/plopfile.js',
    '!**/react-shim.js',
    '!**/tsup.config.ts',
  ]),
  eslintPluginPrettierRecommended,
  reactCompiler.configs.recommended,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      unicorn,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      '@typescript-eslint': tseslint.plugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    extends: [reactRefresh.configs.vite],
    rules: {
      // General rules
      indent: 'off',
      semi: ['error', 'never'],
      'no-console': 'warn',
      'max-params': ['error', 5],
      'max-lines-per-function': 'off',

      // Unicorn rules
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],

      // React rules
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-inline-styles': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'warn',
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],

      // TypeScript rules
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // React Hooks
      'react-hooks/exhaustive-deps': 'off',

      // Import rules
      'import/prefer-default-export': 'off',

      // Simple import sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prettier
      'prettier/prettier': 'warn',

      // Misc
      'no-empty': 'off',

      // Padding lines (from old config)
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'multiline-expression', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-expression' },
        { blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],

      'react-refresh/only-export-components': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      'import/no-named-as-default-member': 'off',
    },
  },
])
