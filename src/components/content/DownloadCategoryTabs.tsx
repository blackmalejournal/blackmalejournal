'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FILTER_TABLIST_ROW_CLASS } from '@/lib/constants';

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
    <div
      className={FILTER_TABLIST_ROW_CLASS}
      role="tablist"
      aria-label="Filter downloads by category"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === activeCategory;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.value)}
            className={[
              'filter-tab whitespace-nowrap',
              isActive
                ? 'border-b-2 border-bmj-red text-bmj-white'
                : 'filter-tab-inactive',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
