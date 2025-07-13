import { Send, History, Settings } from 'lucide-react';
import { TabType } from '@/types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isWalletConnected: boolean;
  transactionCount: number;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  isWalletConnected,
  transactionCount
}: TabNavigationProps) {
  const tabs = [
    {
      id: 'send' as TabType,
      label: 'Send',
      icon: Send,
      disabled: false
    },
    {
      id: 'history' as TabType,
      label: 'History',
      icon: History,
      disabled: !isWalletConnected,
      badge: transactionCount > 0 ? transactionCount : undefined
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      disabled: !isWalletConnected
    }
  ];

  return (
    <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon className="h-4 w-4 inline mr-2" />
            {tab.label}
            {tab.badge && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}