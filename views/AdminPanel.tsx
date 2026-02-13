
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Search, Music, MessageCircle, Bell, Activity, TrendingUp, Settings, Zap, Home, Clock, Loader2
} from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Logo } from '../components/Logo';

interface AdminPanelProps {
  onLogout: () => void;
}

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
    <div className="flex justify-between items-start">
      <div className={`p-4 rounded-3xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={28} />
      </div>
      {trend && (
        <span className={`text-xs font-black px-3 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-600' : 'bg-rose-500/10 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-6">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{value}</h3>
    </div>
  </div>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'blogs' | 'sermons' | 'events' | 'groups' | 'media'>('dashboard');
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    supabase.from('profiles').select('*', { count: 'exact', head: true }).then(res => setUsersCount(res.count || 0));
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'blogs', icon: FileText, label: 'Blogs' },
    { id: 'sermons', icon: Video, label: 'Sermons' },
    { id: 'media', icon: Music, label: 'Media' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'groups', icon: MessageCircle, label: 'Groups' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden">
      {/* Sidebar with Logo restored */}
      <div className="w-72 bg-[#051121] text-white p-10 flex flex-col shadow-2xl z-50">
        <div className="mb-14 flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-lg">
            <Logo className="w-10 h-auto" />
          </div>
          <div>
            <h1 className="font-black text-[20px] tracking-tighter leading-none">ICC</h1>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Admin Control</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20 translate-x-1' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 mt-auto border-t border-white/5 flex flex-col gap-2">
          <button className="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:bg-white/5 transition-all font-bold text-sm">
            <Settings size={20} />
            Settings
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-12 scroll-smooth bg-slate-50 dark:bg-slate-900 no-scrollbar">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">{activeTab}</h2>
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
              <Clock size={14}/>
              Last update: Just now
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  placeholder="Global search..." 
                  className="bg-white dark:bg-slate-800 border-none rounded-2xl h-12 pl-12 pr-6 w-64 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                />
             </div>
             <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
               <Bell size={20}/>
             </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard title="Total Members" value={usersCount} icon={Users} color="text-blue-500" trend={12} />
              <StatCard title="New Blog Likes" value="1.2k" icon={Zap} color="text-amber-500" trend={8} />
              <StatCard title="Media Plays" value="458" icon={Music} color="text-purple-500" trend={-3} />
              <StatCard title="Active Groups" value="14" icon={Activity} color="text-green-500" trend={0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Recent Activity</h3>
                    <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-5 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Activity size={20}/>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">New user registered: David Jones</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight mb-2">Church Growth</h3>
                    <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed">Your community has grown by 15% in the last 30 days. Keep up the great work!</p>
                    <button className="bg-white text-blue-600 font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl transform group-hover:scale-105 transition-all active:scale-95">Generate Report</button>
                  </div>
                  <TrendingUp size={180} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
               </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-40 text-slate-400 font-black uppercase tracking-widest text-sm animate-fade-in">
             <div className="text-center">
                <Loader2 className="animate-spin mb-4 mx-auto" size={40}/>
                Loading {activeTab} components...
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
