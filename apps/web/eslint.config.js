import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jsdoc from 'eslint-plugin-jsdoc'
import tsdoc from 'eslint-plugin-tsdoc'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      jsdoc,
      tsdoc,
    },
    settings: {
      jsdoc: { mode: 'typescript' },
    },
    rules: {
      // Require docs for exported APIs (components, store, types), but not for local helpers
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          contexts: [
            // Document TS interface/type declarations
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
          ],
        },
      ],
      // Do not force @param/@returns when TS types already express them
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/check-tag-names': 'warn',
      // Validate TSDoc syntax when present
      'tsdoc/syntax': 'warn',
    },
  },
])
