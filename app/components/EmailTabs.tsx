'use client';

import {
  InboxIcon,
  TagIcon,
  UsersIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface EmailTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  counts: {
    primary: number;
    promotions: number;
    social: number;
    updates: number;
  };
  newCounts: {
    primary: number;
    promotions: number;
    social: number;
    updates: number;
  };
}

export default function EmailTabs({
  selectedCategory,
  onCategoryChange,
  counts,
  newCounts,
}: EmailTabsProps) {
  const tabs = [
    {
      id: 'primary',
      name: 'Primary',
      icon: InboxIcon,
      count: counts.primary,
      newCount: newCounts.primary,
    },
    {
      id: 'promotions',
      name: 'Promotions',
      icon: TagIcon,
      count: counts.promotions,
      newCount: newCounts.promotions,
    },
    {
      id: 'social',
      name: 'Social',
      icon: UsersIcon,
      count: counts.social,
      newCount: newCounts.social,
    },
    {
      id: 'updates',
      name: 'Updates',
      icon: BellIcon,
      count: counts.updates,
      newCount: newCounts.updates,
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <nav className="flex space-x-8 px-4" aria-label="Email categories">
        {tabs.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium
                ${isSelected
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
                transition-colors duration-200
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
              {tab.newCount > 0 && (
                <span className="ml-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  {tab.newCount} new
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
} 