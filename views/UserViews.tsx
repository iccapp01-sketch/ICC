import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Film, Video, MessageSquare, Share2, Heart,
  Calendar, Check, X, ChevronRight, Search, Download, Instagram,
  Facebook, MessageCircle, Send, User as UserIcon, Bell, Phone, Mail,
  Clock, MapPin, MoreVertical, ListMusic, Mic, Globe, Loader2, Save,
  SkipBack, SkipForward, Square, Repeat, RotateCcw, Edit2, Shield,
  ExternalLink, Info, Trash2, Pencil, CornerDownRight, Plus, FolderPlus, FileText, ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { 
  BlogPost, Sermon, CommunityGroup, GroupPost, 
  Event, MusicTrack, BibleVerse, User, UserRole, Playlist
} from '../types';
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

const isAPKMode = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true ||
    /wv/.test(navigator.userAgent) ||
    document.referrer.includes('android-app://')
  );
};

const shareMediaFile = async (mediaUrl: string, title: string, fileName: string = 'share-content', onAPKShare?: (data: {url: string, title: string}) => void) => {
  if (!mediaUrl) return;

  if (isAPKMode() && onAPKShare) {
    onAPKShare({ url: mediaUrl, title });
    return;
  }

  try {
    const response = await fetch(mediaUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    
    const mimeType = blob.type || (mediaUrl.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/png');
    const ext = mimeType.split('/')[1]?.split('+')[0] || 'png';
    const file = new File([blob], `${fileName}.${ext}`, { type: mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: title,
        text: title
      });
      return;
    }
  } catch (err) {
    console.warn("Direct file share not supported or failed, falling back to link:", err);
  }

  if (navigator.share) {
    try {
      await navigator.share({ title, url: mediaUrl });
      return;
    } catch (e) {}
  }

  window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + mediaUrl)}`, '_blank');
};

const ShareModal = ({ isOpen, onClose, shareData }: { isOpen: boolean, onClose: () => void, shareData: { url: string, title: string } | null }) => {
  if (!isOpen || !shareData) return null;

  const encodedTitle = encodeURIComponent(shareData.title);
  const encodedUrl = encodeURIComponent(shareData.url);

  const handleDeepLink = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'instagram':
        window.location.href = `intent://share#Intent;package=com.instagram.android;end`;
        break;
      case 'tiktok':
        window.location.href = `intent://#Intent;package=com.zhiliaoapp.musically;end`;
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl animate-slide-up border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Share to Socials</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20}/></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => handleDeepLink('whatsapp')} className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/10 rounded-3xl transition-transform active:scale-95">
            <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center"><MessageCircle size={24}/></div>
            <span className="text-[10px] font-black uppercase text-green-600">WhatsApp</span>
          </button>
          <button onClick={() => handleDeepLink('facebook')} className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-3xl transition-transform active:scale-95">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center"><Facebook size={24}/></div>
            <span className="text-[10px] font-black uppercase text-blue-600">Facebook</span>
          </button>
          <button onClick={() => handleDeepLink('instagram')} className="flex flex-col items-center gap-2 p-4 bg-pink-50 dark:bg-pink-900/10 rounded-3xl transition-transform active:scale-95">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white rounded-2xl flex items-center justify-center"><Instagram size={24}/></div>
            <span className="text-[10px] font-black uppercase text-pink-600">Instagram</span>
          </button>
          <button onClick={() => handleDeepLink('tiktok')} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl transition-transform active:scale-95">
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center"><Globe size={24}/></div>
            <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">TikTok</span>
          </button>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <div className="flex gap-3">
            <Info size={18} className="text-blue-600 shrink-0"/>
            <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 leading-tight">
              Note: Instagram and TikTok will open the app. You may need to manually select the media from your gallery after the app opens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HOME PAGE ---
export const HomeView = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [apkShareData, setApkShareData] = useState<{url: string, title: string} | null>(null);

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
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
      <ShareModal isOpen={!!apkShareData} onClose={() => setApkShareData(null)} shareData={apkShareData} />
      <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <h2 className="text-xs font-black uppercase tracking-widest mb-3 opacity-80">Daily Verse</h2>
        <p className="text-lg font-serif mb-4 leading-relaxed">"{verse?.text}"</p>
        <p className="font-black text-blue-300 text-sm">{verse?.reference}</p>
      </div>
      {sermon && (
        <section>
          <h3 className="font-black text-lg mb-3 dark:text-white">Latest Sermon</h3>
          <div onClick={() => onNavigate('sermons')} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border dark:border-slate-700 cursor-pointer">
            <div className="w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0 relative">
              <img src={`https://img.youtube.com/vi/${getYouTubeID(sermon.video_url)}/hqdefault.jpg`} className="w-full h-full object-cover" alt={sermon.title} />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white"><Play size={24} fill="currentColor"/></div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate dark:text-white">{sermon.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{sermon.preacher}</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">{formatDate(sermon.date_preached)}</p>
            </div>
          </div>
        </section>
      )}
      <section>
        <h3 className="font-black text-lg mb-3 dark:text-white">Recent Articles</h3>
        <div className="space-y-4">
          {blogs.map(blog => (
            <div key={blog.id} onClick={() => onNavigate('blogs')} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border dark:border-slate-700 cursor-pointer">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={blog.image_url} className="w-full h-full object-cover" alt={blog.title} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm leading-tight mb-2 dark:text-white line-clamp-2">{blog.title}</h4>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    shareMediaFile(blog.image_url, blog.title, blog.title.replace(/\s+/g, '-').toLowerCase(), setApkShareData); 
                  }} 
                  className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:bg-blue-50 p-2 rounded-xl"
                >
                  <Share2 size={12}/> Share
                </button>
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex p-2 bg-slate-100 dark:bg-slate-800 m-4 rounded-2xl">
        <button onClick={() => setActiveTab('bible')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${activeTab === 'bible' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow' : 'text-slate-500'}`}>Bible</button>
        <button onClick={() => setActiveTab('plan')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${activeTab === 'plan' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow' : 'text-slate-500'}`}>Reading Plan</button>
      </div>
      {activeTab === 'bible' ? (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex gap-2 mb-4">
            <select value={book} onChange={e => setBook(e.target.value)} className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold dark:text-white border-none outline-none">
              {["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="number" value={chapter} onChange={e => setChapter(parseInt(e.target.value))} className="w-20 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-center dark:text-white border-none" />
            <select value={version} onChange={e => setVersion(e.target.value)} className="w-20 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold dark:text-white border-none">
              <option value="asv">ASV</option>
              <option value="kjv">KJV</option>
              <option value="web">WEB</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto font-serif leading-loose text-lg p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] dark:text-slate-200">
            {loading ? "Loading Word..." : content}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="p-6 bg-blue-600 rounded-[2rem] text-white">
            <h3 className="text-xl font-black mb-1">1-Year Reading Plan</h3>
            <p className="text-sm opacity-80">Chronological journey through scripture.</p>
          </div>
          {[...Array(30)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl">
              <div>
                <p className="text-[10px] font-black text-blue-600">DAY {i+1}</p>
                <p className="font-bold dark:text-white">Gen {i*2+1}-{i*2+2} & Matt {i+1}</p>
              </div>
              <button className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-200 hover:bg-green-500 hover:border-green-500 transition"><Check size={16}/></button>
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
    <div className="flex flex-col h-full bg-[#08182e] animate-fade-in overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 no-scrollbar pb-24">
        <div className="bg-[#0c2d58] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-[#112a4a] border-4 border-white/5 rounded-full flex items-center justify-center text-3xl font-black mb-4 shadow-xl">
             {initials.toUpperCase()}
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-3">
            {user?.firstName} {user?.lastName}
          </h2>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
            <Shield size={12} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
              MEMBER • JOINED {formatDate(user?.joinedDate).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="bg-[#112a4a]/40 backdrop-blur-md rounded-[3rem] p-8 border border-white/5 shadow-2xl space-y-6">
          <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-2.5">
               <UserIcon size={20} className="text-blue-400"/>
               <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">PERSONAL DETAILS</h3>
             </div>
             <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
               <Pencil size={14} className="text-blue-400"/>
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">EDIT INFO</span>
             </button>
          </div>
          {isEditing ? (
            <div className="space-y-4 animate-slide-up">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">FIRST NAME</label>
                <input value={editData.firstName || ''} onChange={e => setEditData({...editData, firstName: e.target.value})} className="w-full p-4 bg-[#0c1f38] border border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="First Name"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">LAST NAME</label>
                <input value={editData.lastName || ''} onChange={e => setEditData({...editData, lastName: e.target.value})} className="w-full p-4 bg-[#0c1f38] border border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="Last Name"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">PHONE</label>
                <input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full p-4 bg-[#0c1f38] border border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="Phone"/>
              </div>
              <button onClick={() => { onUpdateUser(editData); setIsEditing(false); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95">Save Changes</button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'FIRST NAME', value: user?.firstName, icon: UserIcon },
                { label: 'LAST NAME', value: user?.lastName, icon: UserIcon },
                { label: 'PHONE', value: user?.phone || 'Not set', icon: Phone },
                { label: 'DATE OF BIRTH', value: user?.dob || 'Not set', icon: Calendar },
                { label: 'GENDER', value: user?.gender || 'Not specified', icon: Users },
              ].map((field, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{field.label}</p>
                  <div className="bg-[#0c1f38] border border-white/5 rounded-2xl p-4 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[#112a4a] flex items-center justify-center text-slate-400">
                      <field.icon size={18}/>
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight">{field.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <button onClick={toggleTheme} className="w-full bg-[#112a4a]/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/5 flex items-center justify-between group transition-all hover:bg-white/5 active:scale-[0.98]">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-[#0c1f38] border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                 {isDarkMode ? <Sun size={24}/> : <Moon size={24}/>}
               </div>
               <div className="text-left">
                 <p className="text-sm font-black text-white tracking-tight">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</p>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TOGGLE APPEARANCE</p>
               </div>
             </div>
             <ChevronRight className="text-slate-500" size={24}/>
          </button>
          <button onClick={onLogout} className="w-full bg-rose-500/10 backdrop-blur-md rounded-[2.5rem] p-6 border border-rose-500/20 flex items-center justify-between group transition-all hover:bg-rose-500/20 active:scale-[0.98]">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-[#0c1f38] border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500">
                 <LogOut size={24}/>
               </div>
               <div className="text-left">
                 <p className="text-sm font-black text-rose-500 tracking-tight">Sign Out</p>
                 <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest">SECURELY LOGOUT</p>
               </div>
             </div>
             <ChevronRight className="text-rose-500/60" size={24}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MusicView = () => {
  return (
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
      <div className="bg-[#0c2d58] p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Media Hub</h2>
        <p className="opacity-80 text-sm">Worship music, podcasts, and recordings.</p>
      </div>
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="text-center">
          <Music size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-xs">Media content coming soon</p>
        </div>
      </div>
    </div>
  );
};

export const BlogView = () => {
  return (
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
       <div className="bg-[#0c2d58] p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Church Articles</h2>
        <p className="opacity-80 text-sm">Inspiration and news from our community.</p>
      </div>
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-xs">No articles available</p>
        </div>
      </div>
    </div>
  );
};

export const CommunityView = () => {
  return (
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
      <div className="bg-[#0c2d58] p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Community Groups</h2>
        <p className="opacity-80 text-sm">Find your place in our church family.</p>
      </div>
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-xs">Groups loading...</p>
        </div>
      </div>
    </div>
  );
};

export const SermonsView = () => {
  return (
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
      <div className="bg-[#0c2d58] p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Sermon Archive</h2>
        <p className="opacity-80 text-sm">Listen to the word wherever you go.</p>
      </div>
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="text-center">
          <Video size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-xs">Archiving messages...</p>
        </div>
      </div>
    </div>
  );
};

export const EventsView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
       <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold mb-2">
         <ArrowLeft size={20}/> Back
       </button>
       <div className="bg-[#0c2d58] p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Church Events</h2>
        <p className="opacity-80 text-sm">Join us for fellowship and worship.</p>
      </div>
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="text-center">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-xs">No upcoming events</p>
        </div>
      </div>
    </div>
  );
};

export const NotificationsView = () => {
  return (
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
      <div className="bg-[#0c2d58] p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Updates</h2>
        <p className="opacity-80 text-sm">Stay in the loop with ICC notifications.</p>
      </div>
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="text-center">
          <Bell size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-xs">All caught up!</p>
        </div>
      </div>
    </div>
  );
};

export const ContactView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="p-4 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
       <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold mb-2">
         <ArrowLeft size={20}/> Back
       </button>
       <div className="bg-[#0c2d58] p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Contact Us</h2>
        <p className="opacity-80 text-sm">We'd love to hear from you.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm">
           <p className="font-bold mb-2 dark:text-white">Isipingo Community Church</p>
           <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><MapPin size={16}/> 123 Church Road, Isipingo</p>
           <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-2"><Phone size={16}/> +27 123 456 789</p>
           <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-2"><Mail size={16}/> info@icc.com</p>
        </div>
      </div>
    </div>
  );
};