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
      { icon: 'github', link: 'https://github.com/my/repo' },
      { icon: 'discord', link: 'https://discord.com' }
    ],
    version: 'v2.8.9',
    githubRepo: 'jesusalcaladev/hscale-issues',
    language: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: 'English',
      es: 'Español'
    }   
  }
}
