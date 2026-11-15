export default defineAppConfig({
  nuxtify: {
    // Brand
    brand: {
      name: '@nuxtify/cms',
      domain: 'nuxtify.dev',
      tagline: 'Catchy tagline for the @nuxtify/cms module.',
      logo: {
        lightUrl: '/img/nuxtify-logo-light.png', // Recommended 5:1 aspect ratio (e.g. 400 x 80 px)
        darkUrl: '/img/nuxtify-logo-dark.png', // Recommended 5:1 aspect ratio (e.g. 400 x 80 px)
        width: 200,
        mobileWidth: 150,
        height: 40,
        mobileHeight: 28,
      },
    },

    // Email
    email: {
      general: 'hello@nuxtify.dev',
      support: 'support@nuxtify.dev',
      reply: 'hello@nuxtify.dev',
      provider: {
        // Need any URL so it displays
        defaultSubmitUrl: 'https://api.mailerlite.com/v2/groups/123456/subscribers',
      },
    },

    // Content
    content: {
      tags: {
        prependIcon: 'mdi-pound',
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
        {
          title: 'CMS',
          links: [
            {
              text: 'CMS Features',
              description: 'Explore collections, schemas, and query composables.',
              icon: 'mdi-file-document-multiple-outline',
              to: '/cms-features',
            },
            {
              text: 'CMS Components',
              description: 'Preview markdown-driven page, grid, and FAQ blocks.',
              icon: 'mdi-view-dashboard-outline',
              to: '/demo-components',
            },
          ],
        },
        { text: 'Pages Features', to: '/pages-features' },
        { text: 'Config', to: '/config' },
        {
          title: 'Resources',
          links: [
            {
              text: 'Showcase',
              description: 'See production sites built with Nuxtify.',
              icon: 'mdi-heart-outline',
              href: 'https://nuxtify.dev/showcase',
              openInNew: true,
            },
            {
              text: 'Nuxtify.dev',
              description: 'Guides, module configuration, and examples.',
              icon: 'mdi-book-open-outline',
              href: 'https://nuxtify.dev',
              openInNew: true,
            },
          ],
        },
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
            { text: 'Articles', to: '/posts' },
            { text: 'Notes', to: '/notes' },
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
      buttonUrl: '/terms',
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
