import React from 'react';
import { Home, BookOpen, FileText, Music, Users, Video, Bell, Calendar } from 'lucide-react';
import { Logo } from './Logo';

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
    <div className="fixed inset-0 flex flex-col w-full h-full bg-[#051121] transition-colors duration-300 overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-[#051121]/90 backdrop-blur-md border-b border-white/5 transition-colors duration-300 pt-[env(safe-area-inset-top)]">
        <div className="h-16 flex items-center justify-between px-6">
          
          <div className="flex items-center gap-3">
             <Logo className="w-8 h-auto" />
             <div className="flex flex-col justify-center border-l border-white/10 pl-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Welcome,</span>
                <span className="text-[16px] font-black text-white leading-tight truncate max-w-[120px]">
                  {userName || 'Tasmim'}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onTabChange('events')}
              className={`p-2.5 rounded-xl transition ${activeTab === 'events' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <Calendar size={20} />
            </button>

            <button 
              onClick={() => onTabChange('notifications')}
              className={`p-2.5 rounded-xl transition relative ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#051121]"></span>
            </button>
            
            <button 
               onClick={() => onTabChange('profile')}
               className={`ml-1 transition-all ${activeTab === 'profile' ? 'scale-110' : ''}`}
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-[11px] font-black uppercase shadow-xl border border-white/10">
                {userName ? userName.substring(0,2).toUpperCase() : 'TA'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-y-auto w-full scroll-smooth bg-[#051121] no-scrollbar"
        style={{
          paddingTop: 'calc(4rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="min-h-full">
           {children}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-50 bg-[#0c2445]/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex justify-between items-center px-4 h-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group flex flex-col items-center gap-1.5 transition-all duration-300 flex-1 relative ${
                  isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isActive && <div className="absolute -top-4 w-10 h-1 bg-blue-400 rounded-full"></div>}
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
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
