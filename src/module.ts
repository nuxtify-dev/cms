import {
  addComponentsDir,
  addImportsDir,
  createResolver,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit'
import { defu } from 'defu'
import { name, version } from '../package.json'
import { normalizePrefix } from './runtime/utils/routes'

// Types
import type { ModuleOptions } from './types/module'

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
    email: {
      reply: '',
    },
    content: {
      articles: {
        routePrefix: '/articles',
        title: 'Articles',
        subtitle: 'Long, in-depth posts.',
        description: '',
        readTime: {
          enabled: true,
          // Same as Ghost: https://docs.ghost.org/themes/helpers/utility/reading_time
          wordsPerMinute: 275,
        },
      },
      notes: {
        routePrefix: '/notes',
        title: 'Notes',
        subtitle: 'Short updates, thoughts, and links.',
        description: '',
      },
      topics: {
        routePrefix: '/topics',
        title: 'Topics',
        subtitle: 'Explore posts by category.',
        description: '',
      },
      contributors: {
        routePrefix: '/contributors',
        title: 'Contributors',
        subtitle: 'The wonderful humans who make this website possible.',
        description: '',
      },
    },
  },
  setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const articlesPrefix = normalizePrefix(_options.content?.articles?.routePrefix, '/articles')
    const notesPrefix = normalizePrefix(_options.content?.notes?.routePrefix, '/notes')
    const topicsPrefix = normalizePrefix(_options.content?.topics?.routePrefix, '/topics')
    const contributorsPrefix = normalizePrefix(_options.content?.contributors?.routePrefix, '/contributors')

    // Expose module options to app config with normalized route prefixes
    _nuxt.options.appConfig.nuxtify = defu(_nuxt.options.appConfig.nuxtify || {}, {
      ..._options,
      content: {
        ..._options.content,
        articles: {
          ..._options.content?.articles,
          routePrefix: articlesPrefix,
        },
        notes: {
          ..._options.content?.notes,
          routePrefix: notesPrefix,
        },
        topics: {
          ..._options.content?.topics,
          routePrefix: topicsPrefix,
        },
        contributors: {
          ..._options.content?.contributors,
          routePrefix: contributorsPrefix,
        },
      },
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
        path: '/:slug?',
        file: resolve('./runtime/pages/[...slug].vue'),
      })
      pages.unshift({
        name: 'articles',
        path: articlesPrefix,
        file: resolve('./runtime/pages/articles/index.vue'),
      })
      pages.unshift({
        name: 'articles-slug',
        path: `${articlesPrefix}/:slug`,
        file: resolve('./runtime/pages/articles/[slug].vue'),
      })
      pages.unshift({
        name: 'notes',
        path: notesPrefix,
        file: resolve('./runtime/pages/notes/index.vue'),
      })
      pages.unshift({
        name: 'notes-slug',
        path: `${notesPrefix}/:slug`,
        file: resolve('./runtime/pages/notes/[slug].vue'),
      })
      pages.unshift({
        name: 'tags-slug',
        path: '/tags/:slug',
        file: resolve('./runtime/pages/tags/[slug].vue'),
      })
      pages.unshift({
        name: 'topics',
        path: topicsPrefix,
        file: resolve('./runtime/pages/topics/index.vue'),
      })
      pages.unshift({
        name: 'topics-slug',
        path: `${topicsPrefix}/:slug`,
        file: resolve('./runtime/pages/topics/[slug].vue'),
      })
      pages.unshift({
        name: 'contributors',
        path: contributorsPrefix,
        file: resolve('./runtime/pages/contributors/index.vue'),
      })
      pages.unshift({
        name: 'contributors-slug',
        path: `${contributorsPrefix}/:slug`,
        file: resolve('./runtime/pages/contributors/[slug].vue'),
      })
    })
  },
})
