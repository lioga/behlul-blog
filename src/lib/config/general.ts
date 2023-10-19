import type { ThemeConfig, HeadConfig, HeaderConfig, FooterConfig, DateConfig, FeedConfig } from '$lib/types/general'

export const theme: ThemeConfig = [
  {
    name: 'cupcake',
    text: 'Light'
  },
  {
    name: 'dracula',
    text: 'Dark'
  },
  {
    name: 'night',
    text: 'Night'
  },
  {
    name: 'valentine',
    text: 'valentine'
  }
]

export const head: HeadConfig = {}

export const header: HeaderConfig = {
  nav: [
    {
      text: 'Home',
      link: '/'
    },
    {
      text: 'About',
      link: '/about'
    }
  ]
}

export const footer: FooterConfig = {

}

export const date: DateConfig = {
  locales: 'en-US',
  options: {
    year: '2-digit',
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }
}

export const feed: FeedConfig = {}
