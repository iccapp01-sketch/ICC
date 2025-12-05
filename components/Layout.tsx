
import React from 'react';
import { Home, BookOpen, FileText, Music, Users, Video, Bell, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  userName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  userName
}) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'bible', icon: BookOpen, label: 'Bible' },
    { id: 'blogs', icon: FileText, label: 'Blogs' },
    { id: 'media', icon: Music, label: 'Media' },
    { id: 'sermons', icon: Video, label: 'Sermons' },
    { id: 'community', icon: Users, label: 'Groups' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <div className="fixed top-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm h-16 flex items-center justify-between px-4 transition-colors duration-300">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
           <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">ICC App</span>
        </div>

        {/* Right: Events, Notifications & Profile */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onTabChange('events')}
            className={`p-2 rounded-full transition ${activeTab === 'events' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Calendar size={22} />
          </button>

          <button 
            onClick={() => onTabChange('notifications')}
            className={`p-2 rounded-full transition relative ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
          </button>
          
          <button 
             onClick={() => onTabChange('profile')}
             className={`p-1 rounded-full border-2 transition ${activeTab === 'profile' ? 'border-blue-500' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
              {userName ? userName.substring(0,2) : 'GU'}
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-16 relative">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div 
        className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-colors duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-between items-end px-1 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group flex flex-col items-center gap-1.5 transition-all duration-300 flex-1 relative ${
                  isActive ? 'text-blue-600 dark:text-blue-400 -translate-y-1' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-3 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-full shadow-[0_0_12px_rgba(37,99,235,0.4)] animate-pulse"></div>
                )}
                
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 group-active:scale-90" />
                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100 font-bold' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
