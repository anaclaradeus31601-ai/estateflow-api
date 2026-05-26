// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'no-restricted-properties': [
        'error',
        {
          property: '$queryRaw',
          message:
            'Avoid raw SQL queries. Prefer Prisma methods like findMany, findUnique, create, update, and delete.',
        },
        {
          property: '$queryRawUnsafe',
          message:
            'Avoid unsafe raw SQL queries. Prefer Prisma methods or a reviewed repository abstraction.',
        },
        {
          property: '$executeRaw',
          message:
            'Avoid raw SQL execution. Prefer Prisma methods or isolate the query behind a reviewed abstraction.',
        },
        {
          property: '$executeRawUnsafe',
          message:
            'Avoid unsafe raw SQL execution. Prefer Prisma methods or isolate the query behind a reviewed abstraction.',
        },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
