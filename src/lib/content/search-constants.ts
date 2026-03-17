import { FileText, BookOpen, Newspaper, Send } from 'lucide-react';

export const SEARCH_TYPE_ICONS = {
  article: FileText,
  briefing: Newspaper,
  handbook: BookOpen,
  dispatch: Send,
} as const;

export const SEARCH_TYPE_PATHS = {
  article: '/articles',
  briefing: '/briefings',
  handbook: '/handbooks',
  dispatch: '/blog',
} as const;
