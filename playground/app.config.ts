export default defineAppConfig({
  nuxtify: {
    // Brand
    brand: {
      name: '@nuxtify/cms',
      tagline: 'This is a sample tagline for the @nuxtify/cms module.',
      logo: {
        lightUrl: '/img/nuxtify-logo-light.png', // Recommended 5:1 aspect ratio (e.g. 400 x 80 px)
        darkUrl: '/img/nuxtify-logo-dark.png', // Recommended 5:1 aspect ratio (e.g. 400 x 80 px)
        width: 200,
        height: 40,
      },
    },

    // Email
    email: {
      general: 'hello@nuxtify.dev',
      support: 'support@nuxtify.dev',
      provider: {
        // Need any URL so it displays
        defaultSubmitUrl: 'https://api.mailerlite.com/v2/groups/123456/subscribers',
      },
    },

    // Footer
    footer: {
      cta: {
        show: true,
        title: 'Ready to build something awesome?',
        subtitle: 'Subscribe to our newsletter to receive the latest updates.',
      },
    },

    // Navigation
    navigation: {
      primary: [
        { text: 'About', to: '/about' },
        { text: 'Pages Features', to: '/pages-features' },
        { text: 'Config', to: '/config' },
        { text: 'Nuxtify.dev', href: 'https://nuxtify.dev', openInNew: true },
      ],
      secondary: [
        { text: 'Sign Up', to: '/signup' },
        { text: 'Sign In', to: '/signin' },
      ],
      altPrimary: [
        {
          title: 'Product',
          links: [
            { text: 'Features', to: '/features' },
            { text: 'Pricing', to: '/pricing' },
            { text: 'Changelog', to: '/changelog' },
          ],
        },
        {
          title: 'Company',
          links: [
            { text: 'About', to: '/about' },
            { text: 'Team', to: '/team' },
            { text: 'Careers', to: '/careers' },
          ],
        },
        {
          title: 'Support',
          links: [
            { text: 'Contact', to: '/contact' },
            { text: 'Documentation', to: '/docs' },
            { text: 'Help', to: '/help' },
          ],
        },
        {
          title: 'CMS',
          links: [
            { text: 'Articles', to: '/articles' },
            { text: 'Topics', to: '/topics' },
            { text: 'Contributors', to: '/contributors' },
          ],
        },
        {
          title: 'Ecosystem',
          links: [
            { text: 'Partners', to: '/partners' },
            { text: 'Affiliates', to: '/affiliates' },
            { text: 'Themes', to: '/themes' },
            { text: 'Plugins', to: '/plugins' },
            { text: 'Integrations', to: '/integrations' },
          ],
        },
      ],
      altSecondary: [
        { text: 'Privacy', to: '/privacy' },
        { text: 'Terms', to: '/terms' },
      ],
    },

    // Announcement
    announcement: {
      show: true,
      chipText: 'News',
      message: 'This is a site wide announcement!',
      buttonText: 'Click me',
      buttonUrl: 'https://nuxtify.dev/',
      exclude: ['/privacy', '/terms'],
    },

    // Credits
    credits: {
      creator: {
        name: 'Nuxtify',
        domain: 'nuxtify.dev',
      },
      prependText: 'Made with love by',
      appendText: ' Ship weirdly fast.',
    },
  },
})
