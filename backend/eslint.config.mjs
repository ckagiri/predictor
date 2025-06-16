import eslint from '@eslint/js';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/*.js'],
  },
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      perfectionist.configs['recommended-natural'],
    ],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
          defaultProject: 'tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-union-types': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    plugins: { 'chai-friendly': pluginChaiFriendly },
    rules: {
      '@typescript-eslint/no-unused-expressions': 0, // disable TypeScript ESLint version
      'chai-friendly/no-unused-expressions': 2,
      'no-unused-expressions': 0, // disable original rule
      // '@typescript-eslint/no-unused-expressions': 'off',
    },
  }
);
