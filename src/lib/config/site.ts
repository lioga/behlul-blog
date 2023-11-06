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
    bio: 'Currently studying Electronics Engineering at Karadeniz Technical University.',
    metadata: [
      {
        //text: 'github',
        icon: 'i-simple-icons-github',
        link: 'https://github.com/lioga'
      },
      {
        // text: '0x4444777733334444',
        icon: 'i-simple-icons-linkedin',
        link: 'https://www.linkedin.com/in/behlulsena/',
      },
      {
        // text: '0x4444777733334444',
        icon: 'i-simple-icons-microsoftoutlook',
        link: 'mailto:behlulsena09@hotmail.com',
      }
    ]
  },
  
  themeColor: '#3D4451'
}
