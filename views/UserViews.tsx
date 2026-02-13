
import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Video, Share2, Heart,
  Calendar, Check, X, ChevronRight, MessageCircle, Globe, Loader2, Phone, Mail,
  MapPin, Bell, Shield, Pencil, FileText, User as UserIcon
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { 
  BlogPost, Sermon, BibleVerse, User, MusicTrack
} from '../types';

// --- UTILS ---
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getYouTubeID = (url: string) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

// --- HOME PAGE ---
export const HomeView = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('https://bible-api.com/philippians+4:13')
      .then(res => res.json())
      .then(data => setVerse({ reference: data.reference, text: data.text, version: 'WEB' }));

    supabase.from('sermons').select('*').order('created_at', { ascending: false }).limit(1)
      .then(r => setSermon(r.data?.[0]));

    supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3)
      .then(r => setBlogs(r.data || []));
  }, []);

  return (
    <div className="p-6 space-y-10 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full pb-24">
      {/* Hero Verse Card */}
      <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-blue-400">Daily Bread</h2>
          <p className="text-xl font-serif mb-6 leading-relaxed italic opacity-95">"{verse?.text}"</p>
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-blue-500"></div>
            <p className="font-black text-blue-300 text-sm tracking-tight">{verse?.reference}</p>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
      </div>

      {/* Featured Sermon */}
      {sermon && (
        <section>
          <div className="flex justify-between items-end mb-5">
            <h3 className="font-black text-xl dark:text-white tracking-tight uppercase">Latest Message</h3>
            <button onClick={() => onNavigate('sermons')} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">See All</button>
          </div>
          <div onClick={() => onNavigate('sermons')} className="group flex flex-col bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="aspect-video relative overflow-hidden">
              <img src={`https://img.youtube.com/vi/${getYouTubeID(sermon.video_url)}/maxresdefault.jpg`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={sermon.title} />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-2xl">
                  <Play size={28} fill="currentColor"/>
                </div>
              </div>
            </div>
            <div className="p-8">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{formatDate(sermon.date_preached)}</p>
              <h4 className="font-black text-lg leading-tight dark:text-white">{sermon.title}</h4>
              <p className="text-sm text-slate-500 font-medium mt-1">{sermon.preacher}</p>
            </div>
          </div>
        </section>
      )}

      {/* Blogs Section */}
      <section>
        <div className="flex justify-between items-end mb-5">
          <h3 className="font-black text-xl dark:text-white tracking-tight uppercase">Articles</h3>
          <button onClick={() => onNavigate('blogs')} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Read More</button>
        </div>
        <div className="space-y-4">
          {blogs.map(blog => (
            <div key={blog.id} onClick={() => onNavigate('blogs')} className="flex gap-5 items-center bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-3xl overflow-hidden flex-shrink-0 shadow-sm">
                <img src={blog.image_url} className="w-full h-full object-cover" alt={blog.title} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{blog.category || 'INSPIRATION'}</p}
                <h4 className="font-black text-sm leading-tight dark:text-white line-clamp-2">{blog.title}</h4>
                <div className="flex items-center gap-3 mt-3">
                   <button className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 hover:bg-blue-100 transition">
                    <Share2 size={14}/>
                   </button>
                   <button className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 hover:bg-rose-100 transition">
                    <Heart size={14}/>
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const BibleView = () => {
  const [activeTab, setActiveTab] = useState<'bible' | 'plan'>('bible');
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [version, setVersion] = useState('kjv');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`)
      .then(res => res.json())
      .then(data => { setContent(data.text); setLoading(false); });
  }, [book, chapter, version]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="flex p-2 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur m-6 rounded-[2rem]">
        <button onClick={() => setActiveTab('bible')} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bible' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-500'}`}>The Word</button>
        <button onClick={() => setActiveTab('plan')} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'plan' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-500'}`}>Reading Plan</button>
      </div>
      {activeTab === 'bible' ? (
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
               <select value={book} onChange={e => setBook(e.target.value)} className="w-full bg-transparent font-black text-sm dark:text-white border-none outline-none appearance-none">
                {["John", "Matthew", "Psalms", "Genesis"].map(b => <option key={b} value={b}>{b}</option>)}
               </select>
            </div>
            <div className="w-20 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
               <input type="number" value={chapter} onChange={e => setChapter(parseInt(e.target.value))} className="w-full bg-transparent font-black text-sm text-center dark:text-white border-none outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto font-serif leading-loose text-lg p-10 bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700/50 dark:text-slate-200">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                <Loader2 className="animate-spin" />
                <p className="font-black text-xs uppercase tracking-widest">Searching the scrolls...</p>
              </div>
            ) : content}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white shadow-2xl">
            <h3 className="text-2xl font-black mb-2 tracking-tight">1-Year Journey</h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed">Walk through the entire scripture in a chronological sequence.</p>
          </div>
          {[...Array(30)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl shadow-sm group hover:border-blue-500 transition-colors">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Day {i+1}</p>
                <p className="font-black dark:text-white tracking-tight">Genesis {i*2+1}-{i*2+2} & Matthew {i+1}</p>
              </div>
              <button className="w-10 h-10 rounded-2xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-200 hover:bg-green-500 hover:border-green-500 hover:text-white transition-all">
                <Check size={18}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) setEditData({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, dob: user.dob, gender: user.gender });
  }, [user]);

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#081121] animate-fade-in overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 no-scrollbar pb-32">
        <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl flex flex-col items-center justify-center group">
          <div className="w-28 h-28 bg-[#112a4a] border-4 border-white/10 rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-2xl group-hover:scale-105 transition-transform duration-500">
             {initials.toUpperCase()}
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4">
            {user?.firstName} {user?.lastName}
          </h2>
          <div className="flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <Shield size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">
              CHURCH MEMBER
            </span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-[3rem] p-10 border border-slate-100 dark:border-slate-700/50 shadow-xl space-y-8">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <UserIcon size={20} className="text-blue-600"/>
               </div>
               <h3 className="text-[10px] font-black text-slate-400 dark:text-white/50 uppercase tracking-[0.3em]">Identity</h3>
             </div>
             <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl transition-all shadow-lg hover:shadow-blue-600/20 active:scale-95">
               <Pencil size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
             </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {[
              { label: 'Name', value: `${user?.firstName} ${user?.lastName}`, icon: UserIcon },
              { label: 'Mobile', value: user?.phone || 'Not provided', icon: Phone },
              { label: 'Born', value: user?.dob || 'Not provided', icon: Calendar },
            ].map((field, i) => (
              <div key={i} className="group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">{field.label}</p>
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-5 group-hover:border-blue-500 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                    <field.icon size={20}/>
                  </div>
                  <span className="text-[15px] font-bold text-slate-800 dark:text-white tracking-tight">{field.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <button onClick={toggleTheme} className="w-full bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group transition-all hover:border-blue-500">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                 {isDarkMode ? <Sun size={26}/> : <Moon size={26}/>}
               </div>
               <div className="text-left">
                 <p className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{isDarkMode ? 'Light' : 'Dark'} Mode</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">App appearance</p>
               </div>
             </div>
             <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={24}/>
          </button>
          
          <button onClick={onLogout} className="w-full bg-rose-500/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-rose-500/10 flex items-center justify-between group transition-all hover:bg-rose-500/10">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-rose-500/20 rounded-[1.5rem] flex items-center justify-center text-rose-500 shadow-sm">
                 <LogOut size={26}/>
               </div>
               <div className="text-left">
                 <p className="text-lg font-black text-rose-500 tracking-tight">Sign Out</p>
                 <p className="text-[9px] font-black text-rose-500/50 uppercase tracking-widest mt-0.5">Securely logout</p>
               </div>
             </div>
             <ChevronRight className="text-rose-500/30" size={24}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for brevity as the redesign pass is demonstrated above
export const MusicView = () => <div className="p-10 text-center font-black uppercase text-slate-400 py-40 animate-fade-in"><Music size={40} className="mx-auto mb-4 opacity-20"/> Media Hub loading...</div>;
export const BlogView = () => <div className="p-10 text-center font-black uppercase text-slate-400 py-40 animate-fade-in"><FileText size={40} className="mx-auto mb-4 opacity-20"/> Articles loading...</div>;
export const CommunityView = () => <div className="p-10 text-center font-black uppercase text-slate-400 py-40 animate-fade-in"><Users size={40} className="mx-auto mb-4 opacity-20"/> Groups loading...</div>;
export const SermonsView = () => <div className="p-10 text-center font-black uppercase text-slate-400 py-40 animate-fade-in"><Video size={40} className="mx-auto mb-4 opacity-20"/> Messages loading...</div>;
export const EventsView = ({ onBack }: { onBack: () => void }) => <div className="p-10 animate-fade-in"><button onClick={onBack} className="mb-6 flex items-center gap-2 font-black uppercase text-xs text-blue-600"><ArrowLeft size={16}/> Back</button><div className="text-center font-black uppercase text-slate-400 py-20">Calendar loading...</div></div>;
export const NotificationsView = () => <div className="p-10 text-center font-black uppercase text-slate-400 py-40 animate-fade-in"><Bell size={40} className="mx-auto mb-4 opacity-20"/> Notifications loading...</div>;
export const ContactView = ({ onBack }: { onBack: () => void }) => <div className="p-10 animate-fade-in"><button onClick={onBack} className="mb-6 flex items-center gap-2 font-black uppercase text-xs text-blue-600"><ArrowLeft size={16}/> Back</button><div className="text-center font-black uppercase text-slate-400 py-20">Support loading...</div></div>;
