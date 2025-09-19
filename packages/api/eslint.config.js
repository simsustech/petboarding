import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...typescriptEslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  globalIgnores(['**/slimfact.d.ts']),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: 'module',
        parser: {
          ts: typescriptEslint.parser
        }
      }
    }
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none'
        }
      ]
    }
  },
  /**
   * end
   */
  eslintConfigPrettier,
  eslintPluginPrettierRecommended
])
