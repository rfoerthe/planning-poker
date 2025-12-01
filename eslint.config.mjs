import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // Ignore patterns
  {
    ignores: [
      'build/**',
      'dist/**',
      'node_modules/**',
      'public/sw.js',
      '*.config.js',
      '*.config.ts',
      '**/*.d.ts',
      'vite-env.d.ts',
      'src/vite-env.d.ts',
    ],
  },

  // Base JavaScript config for JS files only
  {
    files: ['**/*.{js,jsx}'],
    ...js.configs.recommended,
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
            project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',

        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',

        // ES2021 globals
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
      },
    },
    rules: {
      // Convert all errors to warnings by overriding recommended rules
      'constructor-super': 'warn',
      'for-direction': 'warn',
      'getter-return': 'warn',
      'no-async-promise-executor': 'warn',
      'no-case-declarations': 'warn',
      'no-class-assign': 'warn',
      'no-compare-neg-zero': 'warn',
      'no-cond-assign': 'warn',
      'no-const-assign': 'warn',
      'no-constant-condition': 'warn',
      'no-control-regex': 'warn',
      'no-debugger': 'warn',
      'no-delete-var': 'warn',
      'no-dupe-args': 'warn',
      'no-dupe-class-members': 'warn',
      'no-dupe-else-if': 'warn',
      'no-dupe-keys': 'warn',
      'no-duplicate-case': 'warn',
      'no-empty': 'warn',
      'no-empty-character-class': 'warn',
      'no-empty-pattern': 'warn',
      'no-ex-assign': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-extra-semi': 'warn',
      'no-fallthrough': 'warn',
      'no-func-assign': 'warn',
      'no-global-assign': 'warn',
      'no-import-assign': 'warn',
      'no-inner-declarations': 'warn',
      'no-invalid-regexp': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-loss-of-precision': 'warn',
      'no-misleading-character-class': 'warn',
      'no-mixed-spaces-and-tabs': 'warn',
      'no-new-symbol': 'warn',
      'no-nonoctal-decimal-escape': 'warn',
      'no-obj-calls': 'warn',
      'no-octal': 'warn',
      'no-prototype-builtins': 'warn',
      'no-redeclare': 'warn',
      'no-regex-spaces': 'warn',
      'no-self-assign': 'warn',
      'no-setter-return': 'warn',
      'no-shadow-restricted-names': 'warn',
      'no-sparse-arrays': 'warn',
      'no-this-before-super': 'warn',
      'no-undef': 'warn',
      'no-unexpected-multiline': 'warn',
      'no-unreachable': 'warn',
      'no-unsafe-finally': 'warn',
      'no-unsafe-negation': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-unused-labels': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-useless-backreference': 'warn',
      'no-useless-catch': 'warn',
      'no-useless-escape': 'warn',
      'no-with': 'warn',
      'require-yield': 'warn',
      'use-isnan': 'warn',
      'valid-typeof': 'warn',

      // Custom overrides
      'no-console': 'off',
    },
  },

  // TypeScript files configuration
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      ...Object.fromEntries(
        Object.entries(config.rules || {}).map(([key, value]) => {
          // Convert errors to warnings
          if (value === 'error' || (Array.isArray(value) && value[0] === 'error')) {
            return [key, Array.isArray(value) ? ['warn', ...value.slice(1)] : 'warn'];
          }
          return [key, value];
        })
      ),
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'prefer-const': 'off',
    },
  })),

  // Test files
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    languageOptions: {
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        test: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Disable undefined plugin rules
      'jest/valid-describe-callback': 'off',
      'testing-library/no-render-in-setup': 'off',
      'testing-library/no-node-access': 'off',
      'testing-library/no-container': 'off',
      'testing-library/await-async-utils': 'off',
    },
  },
];
