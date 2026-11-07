import type { SiteConfig } from '$lib/types/site'


export const site: SiteConfig = {
  protocol: import.meta.env.URARA_SITE_PROTOCOL ?? import.meta.env.DEV ? 'http://' : 'https://',
  domain: import.meta.env.URARA_SITE_DOMAIN ?? 'behlulakbudak.com',
  title: 'Behlul Akbudak',
  subtitle: 'An Electronics Engineer Blog',
  lang: 'en-US',
  description: 'Personal blog of Behlul Akbudak.',
  author: {
    avatar: '/assets/maskable@512.png',
    name: 'Behlul Akbudak',
    bio: 'I build lab and scientific instruments in Istanbul, mostly the embedded software.',
    metadata: [
      {
        //text: 'github',
        icon: 'i-simple-icons-github',
        link: 'https://github.com/lioga'
      },
      {
        // text: '0x4444777733334444',
        icon: 'i-simple-icons-gmail',
        link: 'mailto:behlulsena444@gmail.com',
      }

    ]
  },

  themeColor: '#3D4451'
}
