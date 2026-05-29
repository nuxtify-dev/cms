export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2026-05-28',
  nuxtifyCms: {
    verboseLogs: true,
  },
  ogImage: {
    enabled: false,
  },
})
