import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import pluginQuery from '@tanstack/eslint-plugin-query';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'scripts/**/*.ts', '**/test-debug.ts'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginQuery.configs['flat/recommended'],
      jsxA11y.flatConfigs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/no-did-update-set-state': 'off',
      'react-refresh/only-export-components': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      // Agentic Optimization Rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Catch dead code immediately
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'error', // Enforce type imports for better tree-shaking/clarity
      'no-console': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
            '**/e2e/**/*',
            'e2e/**/*.{ts,tsx}',
            '**/playwright.*',
            '**/*.config.{js,ts}',
            'vite.config.ts',
            'src/shared/testing/**',
            'src/test/**',
            'src/test/**/*',
            'src/test/setupTests.ts',
            'src/app/providers/QueryProvider.tsx',
          ],
        },
      ],

      // Style Policy Enforcement
      // Warn on !important in className strings (should be in react-flow-overrides.css)
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/!important/]',
          message: '!important should not be used in component classNames. Add overrides to react-flow-overrides.css instead.',
        },
        {
          selector: 'JSXAttribute[name.name="className"] TemplateElement[value.raw=/!important/]',
          message: '!important should not be used in component classNames. Add overrides to react-flow-overrides.css instead.',
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
    },
  },
);




