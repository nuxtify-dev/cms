import {
  addComponentsDir,
  addImportsDir,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import { defu } from 'defu'
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
  moduleDependencies: {
    '@nuxtify/pages': {
      version: '>=0.7.0',
    },
    '@nuxtjs/seo': {
      version: '>=5.1.3',
      defaults: {
        ogImage: {
          enabled: false,
        },
      },
    },
    '@nuxt/content': {
      version: '>=3.14.0',
    },
  },
  defaults: {
    content: {
      articles: {
        title: 'Articles',
        subtitle: 'Long, in-depth posts.',
        description: '',
      },
      topics: {
        title: 'Topics',
        subtitle: 'Explore posts by category.',
        description: '',
      },
      contributors: {
        title: 'Contributors',
        subtitle: 'The wonderful humans who make this website possible.',
        description: '',
      },
    },
  },
  setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Expose module options to app config
    _nuxt.options.appConfig.nuxtify = defu(_nuxt.options.appConfig.nuxtify || {}, {
      ..._options,
    })

    // Components
    addComponentsDir({
      path: resolve('./runtime/components'),
    })

    // Composables
    addImportsDir(resolve('./runtime/composables'))

    // Utils
    addImportsDir(resolve('./runtime/utils'))
  },
})
