import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, Bell, Upload, Play, Loader2, ListMusic, Plus, Megaphone, MapPin, FileSpreadsheet, AlertTriangle, UserX, Film, Camera, Image as ImageIcon, Globe, Headphones, Mic, Volume2, Clock, Download, TrendingUp, Activity, Send, Zap, Monitor, Settings, Tag
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup, MusicTrack, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelProps {
  onLogout: () => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not set';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ... (Rest of the helper components like Dashboard, MediaManager, etc. would stay the same but omit Logo) ...

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'blogs' | 'sermons' | 'events' | 'groups' | 'media'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'blogs', icon: FileText, label: 'Blogs' },
    { id: 'sermons', icon: Video, label: 'Sermons' },
    { id: 'media', icon: Music, label: 'Media' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'groups', icon: Users, label: 'Groups' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans overflow-hidden">
      {/* Sidebar - LOGO REMOVED */}
      <div className="w-64 bg-[#051121] text-white p-8 flex flex-col shadow-2xl z-50">
        <div className="mb-12">
          <h1 className="font-black text-[22px] tracking-tighter leading-tight">CHURCH<br/>ADMIN</h1>
          <div className="h-1 w-12 bg-blue-500 mt-2 rounded-full"></div>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-4 px-5 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-10 bg-slate-50 dark:bg-slate-900">
        <header className="mb-10">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{activeTab}</h2>
          <p className="text-slate-500 font-medium">Isipingo Community Church Management System</p>
        </header>

        {/* Content render logic for each tab (Dashboard, UserTable, etc.) would follow here */}
        <div className="animate-fade-in">
           {activeTab === 'dashboard' && <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Dashboard loading...</div>}
           {activeTab !== 'dashboard' && <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">{activeTab} view rendering...</div>}
        </div>
      </div>
    </div>
  );
};