import { builtinModules } from 'node:module';

import pluginJs from '@eslint/js';
import parserAstro from 'astro-eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginAstro from 'eslint-plugin-astro';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import pluginVitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default [
  // 1. Global Ignores
  {
    ignores: ['dist', 'node_modules', '.astro', '.output', 'coverage'],
  },

  // 2. Base JavaScript & TypeScript Configuration
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  eslintPluginUnicorn.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      // Optional: Type-checked rules often flag code in JS files incorrectly;
      // you might want to disable type-checking for plain JS files if you have them.
      'unicorn/no-null': 'off',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js builtins.
            [
              `^(${builtinModules.map((moduleName) => `node:${moduleName}`).join('|')})(/|$)`,
            ],
            // libs.
            [String.raw`^@?(\w|.)[^./]`],
            // Internal libs.
            // Same scope imports
            [
              String.raw`^\.\.(?!/?$)`, // Parent imports. Put `..` last.
              String.raw`^\.\./?$`,
            ],
            // Other relative imports. Put same-folder imports and `.` last.
            [
              String.raw`^\./(?=.*/)(?!/?$)`,
              String.raw`^\.(?!/?$)`,
              String.raw`^\./?$`,
            ],
            // Style imports.
            [String.raw`^.+\.s?css$`],
            // Image imports.
            [String.raw`^.+\.svg|png|jpg$`],
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // These two lines enable type-aware linting
        project: true, // Finds the nearest tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {},
  },

  // 3. React Configuration
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            pascalCase: true,
          },
        },
      ],
    },
  },

  // 4. Astro Configuration
  ...pluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: parserAstro,
      parserOptions: {
        parser: tsEslint.parser,
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
        // --- FIX FOR ASTRO ---
        // Astro files also need access to the TS project to lint scripts inside ---
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        Astro: 'readonly',
        Fragment: 'readonly',
      },
    },
    rules: {
      'react/no-unknown-property': 'off',
      // Determine if you want Type-Aware linting inside Astro files.
      // Sometimes this is too strict for Astro's specific syntax.
      // If it fails, disable specific rules here.
      'unicorn/filename-case': 'off',
    },
  },

  // 5. Vitest Configuration
  {
    files: ['**/*.test.{ts,tsx,js}', '**/*.spec.{ts,tsx,js}'],
    plugins: {
      vitest: pluginVitest,
    },
    languageOptions: {
      globals: {
        ...pluginVitest.environments.env.globals,
      },
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
    },
  },
  eslintConfigPrettier, // align prettier rules with eslint rules
];
