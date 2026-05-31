import {
  addComponentsDir,
  addImportsDir,
  createResolver,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit'
import { defu } from 'defu'
import { name, version } from '../package.json'

// Types
import type { ModuleOptions } from './types/types'

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
      defaults: {
        renderer: {
          anchorLinks: false,
        },
      },
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

    // Pages
    extendPages((pages) => {
      pages.unshift({
        name: 'slug',
        path: '/:slug',
        file: resolve('./runtime/pages/[...slug].vue'),
      })
      pages.unshift({
        name: 'articles',
        path: '/articles',
        file: resolve('./runtime/pages/articles/index.vue'),
      })
      pages.unshift({
        name: 'articles-slug',
        path: '/articles/:slug',
        file: resolve('./runtime/pages/articles/[slug].vue'),
      })
      pages.unshift({
        name: 'topics',
        path: '/topics',
        file: resolve('./runtime/pages/topics/index.vue'),
      })
      pages.unshift({
        name: 'topics-slug',
        path: '/topics/:slug',
        file: resolve('./runtime/pages/topics/[slug].vue'),
      })
      pages.unshift({
        name: 'contributors',
        path: '/contributors',
        file: resolve('./runtime/pages/contributors/index.vue'),
      })
      pages.unshift({
        name: 'contributors-slug',
        path: '/contributors/:slug',
        file: resolve('./runtime/pages/contributors/[slug].vue'),
      })
    })
  },
})
