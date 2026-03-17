'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type DownloadCat = 'template' | 'worksheet' | 'guide' | 'toolkit' | 'handbook' | 'all';

type Tab = { label: string; value: DownloadCat };

const TABS: Tab[] = [
  { label: 'All', value: 'all' },
  { label: 'Templates', value: 'template' },
  { label: 'Worksheets', value: 'worksheet' },
  { label: 'Guides', value: 'guide' },
  { label: 'Toolkits', value: 'toolkit' },
  { label: 'Handbooks', value: 'handbook' },
];

interface DownloadCategoryTabsProps {
  activeCategory: string;
}

export function DownloadCategoryTabs({ activeCategory }: DownloadCategoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(value: DownloadCat) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-6 overflow-x-auto border-b border-bmj-tan/20 pb-0" role="tablist">
      {TABS.map((tab) => {
        const isActive = tab.value === activeCategory;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.value)}
            className={[
              'whitespace-nowrap pb-3 font-label text-sm uppercase tracking-widest transition-colors',
              isActive
                ? 'border-b-2 border-bmj-red text-bmj-white'
                : 'text-bmj-tan hover:text-bmj-cream',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
