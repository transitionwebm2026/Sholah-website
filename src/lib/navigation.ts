export const navItems = [
  {key: 'home', href: '/'},
  {key: 'about', href: '/about'},
  {key: 'services', href: '/services'},
  {key: 'reviews', href: '/reviews'},
  {key: 'videos', href: '/videos'},
  {key: 'articles', href: '/articles'},
  {key: 'contact', href: '/contact'}
] as const;

export type NavItem = {href: string; label: string};
