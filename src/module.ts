import {
  addPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import { name, version } from '../package.json'

// Types
import type { ModuleOptions } from './types'

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name,
    version,
    configKey: 'nuxtifyCms',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
