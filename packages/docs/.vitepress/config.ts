import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Petboarding',
  description: 'Easy, fast and reliable pet boarding software',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        logo: '/logo.svg',
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Features', link: '/features' },
          { text: 'Pricing', link: '/pricing' },
          { text: 'Guide', link: '/guide/' },
          { text: 'Contact', link: '/contact' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'User Guide',
              items: [
                { text: 'Overview', link: '/guide/' },
                { text: 'Customer Guide', link: '/guide/customer' },
                { text: 'Employee Guide', link: '/guide/employee' },
                { text: 'Administrator Guide', link: '/guide/administrator' },
              ],
            },
          ],
        },
        footer: {
          message: 'Copyright © simsustech 2023-present',
          copyright: 'ELv2 License',
        },
      },
    },
    nl: {
      label: 'Nederlands',
      lang: 'nl-NL',
      themeConfig: {
        logo: '/logo.svg',
        nav: [
          { text: 'Home', link: '/nl/' },
          { text: 'Functionaliteiten', link: '/nl/features' },
          { text: 'Prijzen', link: '/nl/pricing' },
          { text: 'Handleiding', link: '/nl/guide/' },
          { text: 'Contact', link: '/nl/contact' },
        ],
        sidebar: {
          '/nl/guide/': [
            {
              text: 'Handleiding',
              items: [
                { text: 'Overzicht', link: '/nl/guide/' },
                { text: 'Klantenhandleiding', link: '/nl/guide/customer' },
                { text: 'Medewerkershandleiding', link: '/nl/guide/employee' },
                { text: 'Beheerdershandleiding', link: '/nl/guide/administrator' },
              ],
            },
          ],
        },
        outlineTitle: 'Op deze pagina',
        footer: {
          message: 'Copyright © simsustech 2023-heden',
          copyright: 'ELv2 Licentie',
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/simsustech/petboarding' },
    ],
  },
})
