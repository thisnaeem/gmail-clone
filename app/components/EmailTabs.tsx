import { 
  InboxIcon,
  TagIcon,
  UsersIcon,
  BellAlertIcon
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
  newCounts?: {
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
  newCounts = { primary: 0, promotions: 0, social: 17, updates: 50 } // Default values for demo
}: EmailTabsProps) {
  const tabs = [
    { 
      id: 'primary', 
      name: 'Primary', 
      icon: InboxIcon, 
      count: counts.primary,
      newCount: newCounts.primary 
    },
    { 
      id: 'promotions', 
      name: 'Promotions', 
      icon: TagIcon, 
      count: counts.promotions,
      newCount: newCounts.promotions 
    },
    { 
      id: 'social', 
      name: 'Social', 
      icon: UsersIcon, 
      count: counts.social,
      newCount: newCounts.social 
    },
    { 
      id: 'updates', 
      name: 'Updates', 
      icon: BellAlertIcon, 
      count: counts.updates,
      newCount: newCounts.updates 
    },
  ];

  return (
    <div className="border-b border-gray-700 bg-gray-900">
      <nav className="flex space-x-1 px-4" aria-label="Email categories">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onCategoryChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-[3px]
              hover:text-blue-400 hover:border-blue-400 transition-colors
              ${selectedCategory === tab.id 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent text-gray-400'
              }
            `}
          >
            <tab.icon className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <span>{tab.name}</span>
              {tab.newCount > 0 && (
                <span className={`
                  text-xs font-medium px-1.5 py-0.5 rounded-full
                  ${selectedCategory === tab.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-500/10 text-blue-400'
                  }
                `}>
                  {tab.newCount} new
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
} 