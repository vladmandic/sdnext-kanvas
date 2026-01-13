import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
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
      ecmaVersion: 2020,
      parserOptions: {
        ecmaVersion: 2020,
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
      ecmaVersion: 2020,
      parserOptions: {
        ecmaVersion: 2020,
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
      'no-param-reassign': ['warn', { props: false }],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/indent': ['error', 2],
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@stylistic/max-len': ['warn', { code: 275, tabWidth: 2 }],
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/object-curly-newline': ['error', { multiline: true, consistent: true }],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always', { omitLastInOneLineBlock: false }],
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
      '@typescript-eslint/dot-notation': 'off',
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
      // Import as rule sets to prevent applying to files meant only for the browser
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

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  globalIgnores([
    '**/dist/**',
  ]),
  ...jsConfig,
  ...typescriptConfig,
  ...nodeConfig,
]);
