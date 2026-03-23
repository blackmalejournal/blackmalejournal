'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Lens } from '@/lib/supabase/types';

type Tab = { label: string; value: Lens | 'all' };

const TABS: Tab[] = [
  { label: 'All',                          value: 'all' },
  { label: 'Health/Wellness',              value: 'health' },
  { label: 'Politics/Law',                 value: 'politics' },
  { label: 'Culture/Ideology',             value: 'culture' },
  { label: 'Entertainment/Technology',     value: 'entertainment' },
  { label: 'Commemorations/Remembrance',  value: 'commemoration' },
];

interface LensFilterTabsProps {
  activeLens: Lens | 'all';
}

export function LensFilterTabs({ activeLens }: LensFilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(value: Lens | 'all') {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('lens');
    } else {
      params.set('lens', value);
    }
    // Reset tag when changing lens
    params.delete('tag');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-6 border-b border-bmj-tan/20 pb-0" role="tablist">
      {TABS.map((tab) => {
        const isActive = tab.value === activeLens;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.value)}
            className={[
              'filter-tab',
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
