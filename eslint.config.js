import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import pluginQuery from '@tanstack/eslint-plugin-query';
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
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Agentic Optimization Rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Catch dead code immediately
      '@typescript-eslint/no-explicit-any': 'warn', // Discourage 'any', but allow if necessary
      '@typescript-eslint/consistent-type-imports': 'error', // Enforce type imports for better tree-shaking/clarity
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Discourage log spam

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




