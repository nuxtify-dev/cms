export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  content: {
    renderer: {
      anchorLinks: false,
    },
  },
  compatibilityDate: '2026-05-28',
  vite: {
    optimizeDeps: {
      include: [
        '@unhead/schema-org/vue',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
  nuxtifyCms: {
    verboseLogs: true,
  },
  ogImage: {
    enabled: false,
  },
})
