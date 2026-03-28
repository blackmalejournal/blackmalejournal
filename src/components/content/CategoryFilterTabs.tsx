'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { CourseCategory } from '@/lib/supabase/types';
import { getCategoryLabel } from '@/lib/utils';

type Tab = { label: string; value: CourseCategory | 'all' };

const TABS: Tab[] = [
  { label: 'All', value: 'all' },
  { label: getCategoryLabel('martial-arts'), value: 'martial-arts' },
  { label: getCategoryLabel('mental-health'), value: 'mental-health' },
  { label: getCategoryLabel('relationships'), value: 'relationships' },
  { label: getCategoryLabel('purpose'), value: 'purpose' },
  { label: getCategoryLabel('branding'), value: 'branding' },
];

interface CategoryFilterTabsProps {
  activeCategory: CourseCategory | 'all';
}

export function CategoryFilterTabs({ activeCategory }: CategoryFilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(value: CourseCategory | 'all') {
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
