import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Film, Video, MessageSquare, Share2, Heart,
  Calendar, Check, X, ChevronRight, Search, User as UserIcon, Bell, Phone, Mail,
  Clock, MapPin, MoreVertical, ListMusic, Mic, Globe, Loader2, Save,
  SkipBack, SkipForward, Square, Repeat, RotateCcw, Edit2, Shield,
  Plus, FolderPlus, CornerDownRight, Pencil, Trash2, Send, FileText
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { BlogPost, Sermon, CommunityGroup, GroupPost, Event, MusicTrack, BibleVerse, User, Playlist } from '../types';
import { Logo } from '../components/Logo';

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

// --- HOME VIEW ---
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
    <div className="p-4 space-y-8 animate-fade-in pb-24">
      {/* Daily Verse Card (Screenshot 10) */}
      <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <Logo className="absolute -bottom-8 -right-8 w-48 h-48 opacity-10 pointer-events-none" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Daily Verse</h2>
        <p className="text-xl font-serif italic mb-6 leading-relaxed">"{verse?.text}"</p>
        <p className="font-bold text-blue-300 text-sm">{verse?.reference}</p>
      </div>

      {/* Latest Sermon (Screenshot 10) */}
      {sermon && (
        <section>
          <h3 className="font-black text-[18px] mb-5 dark:text-white uppercase tracking-tight">Latest Sermon</h3>
          <div onClick={() => onNavigate('sermons')} className="bg-[#1a304a]/40 p-6 rounded-[2.5rem] shadow-sm border border-white/5 cursor-pointer relative overflow-hidden group">
            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-5 relative shadow-lg">
              <img src={`https://img.youtube.com/vi/${getYouTubeID(sermon.video_url)}/maxresdefault.jpg`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={sermon.title} />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                <Play size={48} fill="currentColor" className="ml-1 opacity-80" />
              </div>
            </div>
            <div>
              <h4 className="font-black text-lg dark:text-white leading-tight mb-1">{sermon.title}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase">{sermon.preacher}</p>
              <p className="text-[10px] text-blue-500 font-black uppercase mt-2 tracking-widest">{formatDate(sermon.date_preached)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Articles (Screenshot 10) */}
      <section>
        <h3 className="font-black text-[18px] mb-5 dark:text-white uppercase tracking-tight">Recent Articles</h3>
        <div className="space-y-4">
          {blogs.map(blog => (
            <div key={blog.id} onClick={() => onNavigate('blogs')} className="bg-[#1a304a]/40 p-6 rounded-[2.5rem] shadow-sm border border-white/5 cursor-pointer">
              <div className="flex gap-5 items-center">
                 <div className="w-20 h-20 bg-slate-800 rounded-2xl overflow-hidden shrink-0 shadow-md">
                   <img src={blog.image_url} className="w-full h-full object-cover" alt={blog.title} />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-black text-[15px] dark:text-white leading-tight mb-3">{blog.title}</h4>
                   <button className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1.5 tracking-[0.2em]"><Share2 size={12}/> Share</button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- BIBLE VIEW ---
const BIBLE_BOOKS = ["John", "Genesis", "Matthew", "Psalms", "Proverbs", "Revelation"];
export const BibleView = () => {
  const [activeTab, setActiveTab] = useState<'bible' | 'plan'>('bible');
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [version, setVersion] = useState('KJV');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`https://bible-api.com/${book}+${chapter}?translation=${version.toLowerCase()}`)
      .then(res => res.json())
      .then(data => setContent(data.text));
  }, [book, chapter, version]);

  return (
    <div className="flex flex-col h-full bg-[#051121] animate-fade-in">
      <div className="flex p-2 bg-[#1a304a]/40 m-6 rounded-2xl border border-white/5">
        <button onClick={() => setActiveTab('bible')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${activeTab === 'bible' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Bible</button>
        <button onClick={() => setActiveTab('plan')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${activeTab === 'plan' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Reading Plan</button>
      </div>

      <div className="flex-1 p-6 pt-0 flex flex-col overflow-hidden">
        <div className="flex gap-3 mb-6">
          <select value={book} onChange={e => setBook(e.target.value)} className="flex-1 p-4 bg-[#1a304a]/40 text-white rounded-2xl font-bold border-none outline-none appearance-none shadow-sm">
            {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="relative">
            <input type="number" value={chapter} onChange={e => setChapter(parseInt(e.target.value))} className="w-16 p-4 bg-[#1a304a]/40 text-white rounded-2xl font-bold text-center border-none outline-none shadow-sm" />
          </div>
          <select value={version} onChange={e => setVersion(e.target.value)} className="w-24 p-4 bg-[#1a304a]/40 text-white rounded-2xl font-black text-center border-none outline-none appearance-none shadow-sm">
            <option>KJV</option>
            <option>ASV</option>
            <option>WEB</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto font-serif leading-loose text-[17px] p-8 bg-[#1a304a]/20 rounded-[2.5rem] text-slate-300 shadow-inner border border-white/5">
          {content || "Loading Scripture..."}
        </div>
      </div>
    </div>
  );
};

// --- BLOG VIEW ---
export const BlogView = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState('ALL');
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(r => setBlogs(r.data || []));
  }, []);

  if (selected) {
    const ytId = getYouTubeID(selected.video_url || '');
    return (
      <div className="p-6 animate-fade-in pb-24">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-blue-500 font-black mb-8 text-[10px] uppercase tracking-widest">
          <ArrowLeft size={16}/> BACK TO FEED
        </button>
        <div className="bg-[#1a304a]/40 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
          <div className="aspect-video bg-black relative">
            {ytId ? (
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen></iframe>
            ) : (
              <img src={selected.image_url} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="p-8">
            <span className="bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-400/20">{selected.category}</span>
            <h2 className="text-3xl font-black text-white mt-6 mb-4">{selected.title}</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">
              <UserIcon size={12}/> {selected.author} • {formatDate(selected.created_at)}
            </div>
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{selected.content}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 space-y-8 animate-fade-in">
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Articles & Inspiration</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['ALL', 'SERMON DEVOTIONAL', 'PSALM DEVOTIONAL'].map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${category === c ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-[#1a304a]/40 text-slate-500 border border-white/5'}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-6">
        {blogs.filter(b => category === 'ALL' || b.category.toUpperCase() === category).map(blog => (
          <div key={blog.id} className="bg-[#1a304a]/40 p-8 rounded-[2.5rem] border border-white/5 flex gap-6 items-center shadow-xl">
             <div className="w-32 h-32 bg-slate-800 rounded-3xl overflow-hidden shrink-0 shadow-lg relative">
                <img src={blog.image_url} className="w-full h-full object-cover" />
                {blog.video_url && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play size={24} fill="white"/></div>}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">{blog.category.toUpperCase()}</p>
                <h4 className="text-lg font-black text-white leading-tight mb-6 line-clamp-2">{blog.title}</h4>
                <div className="flex items-center gap-4">
                  <Share2 size={18} className="text-blue-500 cursor-pointer"/>
                  <button onClick={() => setSelected(blog)} className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">Read Article</button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MUSIC VIEW ---
export const MusicView = () => {
  const [activeTab, setActiveTab] = useState<'MUSIC' | 'PODCAST' | 'PLAYLISTS'>('MUSIC');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);

  useEffect(() => {
    supabase.from('music_tracks').select('*').then(r => setTracks(r.data || []));
  }, []);

  return (
    <div className="p-6 pb-24 space-y-8 animate-fade-in">
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Media Hub</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['MUSIC', 'PODCAST', 'PLAYLISTS'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#1a304a]/40 text-slate-500 border border-white/5'}`}>{t}</button>
        ))}
      </div>

      {activeTab === 'PLAYLISTS' ? (
        <div className="py-32 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
           <Music size={48} className="text-slate-700 mx-auto mb-6"/>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No playlists created yet</p>
           <button className="text-blue-500 font-black uppercase text-[10px] mt-4 tracking-widest">Create your first one</button>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.filter(t => t.type === activeTab).map(track => (
            <div key={track.id} className="bg-[#1a304a]/40 p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl group">
               <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition cursor-pointer">
                  <Play size={24} fill="currentColor"/>
               </div>
               <div className="flex-1">
                  <h4 className="font-black text-[16px] text-white leading-tight">{track.title}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{track.artist}</p>
               </div>
               <button className="text-slate-600 hover:text-white transition"><Plus size={24}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- SERMONS VIEW ---
export const SermonsView = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  useEffect(() => {
    supabase.from('sermons').select('*').order('date_preached', { ascending: false }).then(r => setSermons(r.data || []));
  }, []);

  return (
    <div className="p-6 pb-24 space-y-10 animate-fade-in">
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Sermon Archive</h2>
      {sermons.map(s => (
        <div key={s.id} className="bg-[#1a304a]/40 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
           <div className="aspect-video bg-black relative">
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeID(s.video_url)}`} frameBorder="0" allowFullScreen></iframe>
           </div>
           <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                 <h3 className="text-2xl font-black text-white pr-4 leading-tight">{s.title}</h3>
                 <button className="bg-blue-600/10 p-4 rounded-full text-blue-400 border border-blue-600/20"><Share2 size={20}/></button>
              </div>
              <div className="flex flex-wrap gap-4">
                 <span className="bg-slate-800/50 text-slate-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><UserIcon size={14}/> {s.preacher.toUpperCase()}</span>
                 <span className="bg-blue-600/10 text-blue-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> {formatDate(s.date_preached).toUpperCase()}</span>
              </div>
           </div>
        </div>
      ))}
    </div>
  );
};

// --- COMMUNITY VIEW ---
export const CommunityView = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<CommunityGroup | null>(null);

  useEffect(() => {
    supabase.from('community_groups').select('*').then(r => {
      const g = (r.data || []).map(d => ({ ...d, status: 'approved' } as CommunityGroup));
      setGroups(g);
    });
  }, []);

  if (activeGroup) {
    return (
      <div className="flex flex-col h-full bg-[#051121] animate-fade-in pb-20">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-5">
              <button onClick={() => setActiveGroup(null)} className="text-white"><ArrowLeft size={24}/></button>
              <div>
                <h3 className="text-xl font-black text-white">{activeGroup.name}</h3>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">1 Messages</p>
              </div>
           </div>
           <button className="text-slate-500"><MoreVertical size={24}/></button>
        </div>
        <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
           <div className="flex flex-col items-end">
              <div className="flex gap-4 max-w-[80%] flex-row-reverse">
                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black text-white text-xs">T</div>
                 <div className="bg-blue-600 p-5 rounded-[2rem] rounded-tr-none shadow-xl text-white">
                    <p className="text-[15px] font-medium">Test</p>
                    <p className="text-[9px] font-black uppercase mt-2 opacity-60 text-right tracking-widest">08:59 PM</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 mt-2 px-4 text-slate-500">
                 <button className="flex items-center gap-1.5 text-[10px] font-black uppercase"><Heart size={14} fill="rose" className="text-rose-500"/> 1</button>
                 <button><CornerDownRight size={14}/></button>
                 <button><Pencil size={14}/></button>
                 <button><Trash2 size={14}/></button>
              </div>
           </div>
        </div>
        <div className="p-6 border-t border-white/5">
           <div className="bg-[#1a304a]/40 rounded-[2.5rem] p-2 flex items-center gap-2 border border-white/5">
              <input placeholder="Type a message..." className="flex-1 bg-transparent px-6 py-3 text-white text-sm outline-none font-bold" />
              <button className="bg-blue-600 w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl"><Send size={24}/></button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 space-y-10 animate-fade-in">
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Community Groups</h2>
      <div className="space-y-6">
        {groups.map(g => (
          <div key={g.id} className="bg-[#1a304a]/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
             <h4 className="text-2xl font-black text-white mb-8">{g.name}</h4>
             <div className="flex justify-between items-center">
                <div className="bg-blue-600/10 px-5 py-2 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20 flex items-center gap-2"><Users size={14}/> 0 Members</div>
                <button onClick={() => setActiveGroup(g)} className="bg-[#10b981] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition">Enter Chat</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- EVENTS VIEW ---
export const EventsView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-6 pb-24 space-y-10 animate-fade-in">
    <div className="flex items-center gap-5">
       <button onClick={onBack} className="text-white"><ArrowLeft size={24}/></button>
       <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Community Updates</h2>
    </div>
    <div className="bg-[#1a304a]/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative">
       <div className="absolute top-10 right-10 bg-blue-600/10 text-blue-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20">Event</div>
       <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white mb-10 shadow-xl"><Calendar size={32}/></div>
       <h3 className="text-3xl font-black text-white mb-2">Kids Party</h3>
       <p className="text-slate-500 font-bold mb-10 uppercase tracking-widest text-xs">Kids only</p>
       <div className="grid grid-cols-3 gap-4 pb-10 border-b border-white/5 mb-10">
          <div className="text-blue-400 flex items-center gap-2 text-xs font-black uppercase"><Calendar size={16}/> 21 Dec 2025</div>
          <div className="text-slate-500 flex items-center gap-2 text-xs font-black uppercase"><Clock size={16}/> 08:58</div>
          <div className="text-slate-500 flex items-center gap-2 text-xs font-black uppercase"><MapPin size={16}/> ICC</div>
       </div>
       <div className="bg-[#051121]/50 p-8 rounded-[3rem] border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">RSVP Confirmation</p>
          <div className="flex gap-2 p-1.5 bg-[#051121] rounded-[1.5rem] mb-10 border border-white/5">
             {['YES', 'MAYBE', 'NO'].map(s => <button key={s} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition ${s === 'YES' ? 'text-slate-500' : 'text-slate-500'}`}>{s}</button>)}
          </div>
          <div className="flex items-center justify-between mb-10 px-4">
             <div>
                <p className="text-lg font-black text-white">Transport Needed?</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Let us help you get here</p>
             </div>
             <div className="w-14 h-8 bg-slate-800 rounded-full relative"><div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full"></div></div>
          </div>
          <button className="w-full bg-white text-[#051121] py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition"><FileText size={20}/> Submit RSVP</button>
       </div>
    </div>
  </div>
);

// --- PROFILE VIEW ---
export const ProfileView = ({ user, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => (
  <div className="p-6 pb-24 space-y-10 animate-fade-in max-w-2xl mx-auto">
    <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] p-12 rounded-[3.5rem] text-white shadow-2xl text-center relative overflow-hidden">
       <Logo className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
       <div className="relative z-10">
          <div className="w-28 h-28 bg-white/20 backdrop-blur-xl border-4 border-white/30 rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl">
            {user?.firstName?.[0] || 'T'}{user?.lastName?.[0] || 'C'}
          </div>
          <h2 className="text-3xl font-black mb-3">{user?.firstName || 'Tasmim'} {user?.lastName || 'Cassim'}</h2>
          <div className="bg-white/10 px-6 py-2.5 rounded-full inline-flex items-center gap-3 border border-white/20 backdrop-blur-md">
            <Shield size={16} className="text-blue-400"/>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Member • Joined 3 December 2025</span>
          </div>
       </div>
    </div>

    <div className="bg-[#1a304a]/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-500 uppercase font-black tracking-[0.2em] text-[10px]"><UserIcon size={16}/> Personal Details</div>
          <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Pencil size={14}/> Edit Info</button>
       </div>
       <div className="space-y-6">
          {[
            { label: 'FIRST NAME', value: user?.firstName || 'Tasmim', icon: UserIcon },
            { label: 'LAST NAME', value: user?.lastName || 'Cassim', icon: UserIcon },
            { label: 'PHONE', value: user?.phone || '0815021328', icon: Phone },
            { label: 'DATE OF BIRTH', value: user?.dob || '1989-11-28', icon: Calendar },
            { label: 'GENDER', value: user?.gender || 'Female', icon: Users }
          ].map(f => (
            <div key={f.label} className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{f.label}</label>
               <div className="bg-[#051121]/50 p-5 rounded-[1.5rem] border border-white/5 flex items-center gap-4 text-white font-bold text-sm">
                  <f.icon size={18} className="text-slate-600"/> {f.value}
               </div>
            </div>
          ))}
       </div>
    </div>

    <div className="space-y-4">
       {[
         { icon: isDarkMode ? Sun : Moon, label: isDarkMode ? 'Light Mode' : 'Dark Mode', sub: 'TOGGLE APPEARANCE', action: toggleTheme },
         { icon: Phone, label: 'Help & Support', sub: 'CONTACT OFFICE', action: () => onNavigate('contact') },
         { icon: LogOut, label: 'Sign Out', sub: 'SECURELY LOGOUT', action: onLogout, danger: true }
       ].map(btn => (
         <button key={btn.label} onClick={btn.action} className={`w-full p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between transition group shadow-xl ${btn.danger ? 'bg-rose-900/10 border-rose-500/10' : 'bg-[#1a304a]/40'}`}>
            <div className="flex items-center gap-6">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${btn.danger ? 'bg-rose-600 text-white' : 'bg-[#051121] text-slate-500'}`}><btn.icon size={24}/></div>
               <div className="text-left">
                  <p className={`font-black text-lg ${btn.danger ? 'text-rose-500' : 'text-white'}`}>{btn.label}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{btn.sub}</p>
               </div>
            </div>
            <ChevronRight size={24} className="text-slate-700 group-hover:translate-x-1 transition"/>
         </button>
       ))}
    </div>
  </div>
);

export const NotificationsView = () => (
  <div className="p-10 text-center text-slate-400 py-40">
    <Bell size={64} className="mx-auto mb-8 opacity-20" />
    <p className="text-xs font-black uppercase tracking-[0.3em]">No notifications yet</p>
  </div>
);

export const ContactView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-10 text-center text-slate-400">
    <button onClick={onBack} className="text-white mb-10"><ArrowLeft/></button>
    <Phone size={40} className="mx-auto mb-4 opacity-20" />
    Support loading...
  </div>
);
