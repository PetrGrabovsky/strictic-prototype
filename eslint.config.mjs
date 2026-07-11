import { defineConfig } from 'eslint/config'
import { bootstrap } from './eslint/bootstrap.mjs'
import { core } from './eslint/core.mjs'
import { next } from './eslint/next.mjs'
import { prettierCompat } from './eslint/prettier.mjs'
import { react } from './eslint/react.mjs'
import { typescript } from './eslint/typescript.mjs'

export default defineConfig(
  ...bootstrap(),
  ...core(),
  ...typescript(),
  ...react(),
  ...next(),
  ...prettierCompat(),
)
