/** @type {import('litedocs').LitedocsConfig} */
export default {
  siteUrl: 'https://litedocs.example.dev',
  themeConfig: {
    title: 'LiteDocs',
    description: 'A Vite documentation framework',

    navbar: [
        { text: 'Home', link: '/' },
        { text: 'Documentation', link: '/docs' },
    ],
    socialLinks: [
      { icon: 'discord', link: 'https://discord.com' }
    ],
    githubRepo: 'jesusalcaladev/hscale-issues',
    language: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: 'English',
      es: 'Español'
    }   
  },
  versions: {
    defaultVersion: 'v2.2.1',
    versions: {
      v1: 'Version 1.x',
      'v2.2.1': 'Version 2.2.1'
    }
  }
}
