import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import css from '@eslint/css';
import js from '@eslint/js';
import json from '@eslint/json';
import html from '@html-eslint/eslint-plugin';
import { configs, helpers, plugins, rules } from 'eslint-config-airbnb-extended';
import pluginPromise from 'eslint-plugin-promise';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: 'js/config',
    files: helpers.extensions.allFiles,
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
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
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaVersion: 'latest',
      },
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

const nodeConfig = defineConfig([
  // Node plugin
  plugins.node,
  {
    name: 'sdnext/node',
    files: helpers.extensions.allFiles,
    ignores: ['**/src/*', '**/javascript/*'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Import as rule sets to override the `files` setting from default config
      ...rules.node.base.rules,
      ...rules.node.globals.rules,
      ...rules.node.noUnsupportedFeatures.rules,
      ...rules.node.promises.rules,
      'n/no-sync': 'off',
      'n/no-process-exit': 'off',
      'n/hashbang': 'off',
    },
  },
]);

const jsonConfig = defineConfig([
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
]);

// const markdownConfig = defineConfig([
//   {
//     files: ['**/*.md'],
//     plugins: { markdown },
//     language: 'markdown/gfm',
//     processor: 'markdown/markdown',
//     extends: ['markdown/recommended'],
//   },
// ]);

const cssConfig = defineConfig([
  {
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
    extends: ['css/recommended'],
    // languageOptions: {
    //   tolerant: true,
    // },
    rules: {
      'css/font-family-fallbacks': 'off',
      'css/no-invalid-properties': [
        'error',
        {
          allowUnknownVariables: true,
        },
      ],
      'css/no-important': 'off',
      'css/use-baseline': 'off',
    },
  },
]);

const htmlConfig = defineConfig([
  {
    files: ['**/*.html'],
    plugins: {
      html,
    },
    extends: ['html/recommended'],
    language: 'html/html',
    rules: {
      'html/attrs-newline': 'off',
      'html/element-newline': [
        'error',
        {
          inline: ['$inline'],
        },
      ],
      'html/indent': [
        'warn',
        2,
      ],
      'html/no-duplicate-class': 'error',
      'html/no-extra-spacing-attrs': [
        'error',
        {
          enforceBeforeSelfClose: true,
          disallowMissing: true,
          disallowTabs: true,
          disallowInAssignment: true,
        },
      ],
      'html/require-closing-tags': [
        'error',
        {
          selfClosing: 'always',
        },
      ],
      'html/use-baseline': 'off',
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
  ...nodeConfig,
  ...jsonConfig,
  // ...markdownConfig,
  ...cssConfig,
  ...htmlConfig,
]);
