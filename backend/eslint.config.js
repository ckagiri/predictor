import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';

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
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-union-types': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
    // languageOptions: {
    //   parserOptions: {
    //     project: ['./tsconfig.json'],
    //   },
    // },
  }
);
