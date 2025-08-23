import { Home, Eye, BarChart3, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs?: string[];
}

export function BottomNavigation({ activeTab, onTabChange, availableTabs }: BottomNavigationProps) {
  const allTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'simulate', label: 'Simulations', icon: Eye },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const tabs = availableTabs 
    ? allTabs.filter(tab => availableTabs.includes(tab.id))
    : allTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 shadow-lg z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center p-3 min-w-0 flex-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? 'text-blue-400 bg-blue-400/10' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-blue-400 rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}