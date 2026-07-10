import { defineConfig } from 'eslint/config'
import { bootstrap } from './eslint/bootstrap.mjs'
import { core } from './eslint/core.mjs'
import { prettierCompat } from './eslint/prettier.mjs'
import { typescript } from './eslint/typescript.mjs'

export default defineConfig(
  ...bootstrap(),
  ...core(),
  ...typescript(),
  ...prettierCompat(),
)
