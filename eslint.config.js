import globals from "globals"
import pluginJs from "@eslint/js"
import deadExportPlugin from './bin/eslint-dead-exports.js'

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    plugins: {
      deadExportPlugin
    },
    rules: {
        "deadExportPlugin/count-imports": "warn"
    }
  }
]