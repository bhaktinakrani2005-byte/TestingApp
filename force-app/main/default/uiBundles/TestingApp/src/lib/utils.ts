import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDynamicBasePath(): string {
  const isLocalhost = typeof window !== 'undefined' && 
    window.location && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocalhost) {
    return (import.meta.env.VITE_SFDC_BASE_PATH as string) || '/TestingApp';
  }
  if (typeof window !== 'undefined' && window.location && typeof window.location.pathname === 'string') {
    const pathSegments = window.location.pathname.split('/');
    const firstSegment = pathSegments[1];
    if (firstSegment && !['home', 'login', 'contact', 'todo', 'profile'].includes(firstSegment)) {
      return '/' + firstSegment;
    }
  }
  return (import.meta.env.VITE_SFDC_BASE_PATH as string) || '/TestingApp';
}

export function getDynamicInstanceUrl(): string {
  const isLocalhost = typeof window !== 'undefined' && 
    window.location && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocalhost) {
    return (import.meta.env.VITE_SFDC_INSTANCE as string) || 'https://momentum-fun-8796-dev-ed.scratch.my.site.com';
  }
  return typeof window !== 'undefined' && window.location && window.location.origin ? window.location.origin : 'https://momentum-fun-8796-dev-ed.scratch.my.site.com';
}

