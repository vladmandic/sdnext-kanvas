import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import { configs, helpers, plugins } from 'eslint-config-airbnb-extended';
import globals from 'globals';
import css from '@eslint/css';
import pluginPromise from 'eslint-plugin-promise';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: 'js/config',
    files: helpers.extensions.allFiles,
    ...js.configs.recommended,
  },
  pluginPromise.configs['flat/recommended'],
  // Stylistic plugin
  plugins.stylistic,
  // Import X plugin
  plugins.importX,
  // Airbnb base recommended config
  ...configs.base.recommended,
  {
    files: helpers.extensions.allFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'dot-notation': 'off',
      'func-names': 'off',
      'guard-for-in': 'off',
      'import-x/extensions': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/prefer-default-export': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'newline-per-chained-call': 'off',
      'no-async-promise-executor': 'off',
      'no-await-in-loop': 'off',
      'no-bitwise': 'off',
      'no-case-declarations': 'off',
      'no-continue': 'off',
      'no-plusplus': 'off',
      'prefer-destructuring': 'off',
      'prefer-template': 'off',
      'promise/always-return': 'off',
      'promise/catch-or-return': 'off',
      radix: 'off',
      'linebreak-style': 'off',
      'no-underscore-dangle': 'off',
      'no-restricted-syntax': 'off',
      'no-return-assign': 'off',
      'no-control-regex': 'off',
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],
      // Begin copy from SDNext
      '@stylistic/brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true,
        },
      ],
      '@stylistic/indent': ['error', 2],
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],
      '@stylistic/max-len': [
        'warn',
        {
          code: 275,
          tabWidth: 2,
        },
      ],
      '@stylistic/max-statements-per-line': 'off',
      '@stylistic/no-mixed-operators': 'off',
      '@stylistic/object-curly-newline': [
        'error',
        {
          multiline: true,
          consistent: true,
        },
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      '@stylistic/semi': [
        'error',
        'always',
        {
          omitLastInOneLineBlock: false,
        },
      ],
    },
  },
]);

const typescriptConfig = defineConfig([
  // TypeScript ESLint plugin
  plugins.typescriptEslint,
  // Airbnb base TypeScript config
  ...configs.base.typescript,
  {
    name: 'sdnext/typescript',
    files: helpers.extensions.tsFiles,
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
]);

const cssConfig = defineConfig([
  {
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
    extends: ['css/recommended'],
    rules: {
      'css/font-family-fallbacks': 'off',
      'css/no-invalid-properties': [
        'error',
        {
          allowUnknownVariables: true,
        },
      ],
      'css/no-important': 'off',
      'css/use-baseline': [
        'warn',
        {
          available: 'newly',
        },
      ],
    },
  },
]);

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  globalIgnores([
    '**/dist/**',
  ]),
  ...jsConfig,
  ...typescriptConfig,
  ...cssConfig,
]);
