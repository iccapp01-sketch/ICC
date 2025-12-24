import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Film, Video, MessageSquare, Share2, Heart,
  Calendar, Check, X, ChevronRight, Search, Download, Instagram,
  Facebook, MessageCircle, Send, User as UserIcon, Bell, Phone, Mail,
  Clock, MapPin, MoreVertical, ListMusic, Mic, Globe, Loader2, Save,
  SkipBack, SkipForward, Square, Repeat, RotateCcw, Edit2, Shield,
  ExternalLink, Info, Trash2, Pencil, CornerDownRight, Plus, FolderPlus, FileText
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

/**
 * Environment Detection for PWA / APK
 */
const isAPKMode = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true ||
    /wv/.test(navigator.userAgent) ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Enhanced Share Utility
 */
const shareMediaFile = async (mediaUrl: string, title: string, fileName: string = 'share-content', onAPKShare?: (data: {url: string, title: string}) => void) => {
  if (!mediaUrl) return;

  // In APK/WebView mode, we prefer the custom share dialog if provided
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

  // Final fallback to WhatsApp web if all else fails in browser
  window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + mediaUrl)}`, '_blank');
};

// --- SHARE MODAL COMPONENT ---
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
        // Try to open Instagram app via intent
        window.location.href = `intent://share#Intent;package=com.instagram.android;end`;
        break;
      case 'tiktok':
        // Try to open TikTok app via intent
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
    <div className="p-4 space-y-6 animate-fade-in">
      <ShareModal isOpen={!!apkShareData} onClose={() => setApkShareData(null)} shareData={apkShareData} />
      
      <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <Logo className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 pointer-events-none" />
        <h2 className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Daily Verse</h2>
        <p className="text-lg font-serif mb-3 leading-relaxed">"{verse?.text}"</p>
        <p className="font-bold text-blue-300 text-sm">{verse?.reference}</p>
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

// --- BIBLE PAGE ---
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

// --- MUSIC PAGE ---
export const MusicView = () => {
  const [activeTab, setActiveTab] = useState<'music' | 'podcast' | 'playlists'>('music');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [current, setCurrent] = useState<MusicTrack | null>(null);
  const [playingList, setPlayingList] = useState<MusicTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [trackToAdd, setTrackToAdd] = useState<MusicTrack | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchTracks = async () => {
    const { data } = await supabase.from('music_tracks').select('*');
    setTracks(data || []);
  };

  const fetchPlaylists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      const { data: playlistsData } = await supabase
        .from('playlists')
        .select('*, playlist_tracks(music_tracks(*))')
        .eq('user_id', user.id);
      
      if (playlistsData) {
        const formatted: Playlist[] = playlistsData.map(p => ({
          id: p.id,
          title: p.title,
          user_id: p.user_id,
          tracks: p.playlist_tracks?.map((pt: any) => pt.music_tracks).filter(Boolean) || []
        }));
        setUserPlaylists(formatted);
      }
    } catch (err) {
      console.warn("Playlists error:", err);
    }
  };

  useEffect(() => { fetchTracks(); fetchPlaylists(); }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play().catch(() => setIsPlaying(false)) : audioRef.current.pause();
  }, [isPlaying, current]);

  const toggleTrack = (track: MusicTrack, list: MusicTrack[]) => {
    if (current?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingList(list);
      setCurrent(track);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!current || playingList.length === 0) return;
    const currentIndex = playingList.findIndex(t => t.id === current.id);
    setCurrent(playingList[(currentIndex + 1) % playingList.length]);
    setIsPlaying(true);
  };

  const createPlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Sign in to create playlists.");
    const { error } = await supabase.from('playlists').insert([{ title: newPlaylistTitle, user_id: user.id }]);
    if (error) return alert(error.message);
    setNewPlaylistTitle(''); setIsCreatingPlaylist(false); fetchPlaylists();
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!trackToAdd) return;
    const { error } = await supabase.from('playlist_tracks').insert([{ playlist_id: playlistId, track_id: trackToAdd.id }]);
    if (error) return alert(error.message);
    setShowAddModal(false); fetchPlaylists(); alert("Added!");
  };

  const filtered = activeTab === 'music' ? tracks.filter(t => t.type === 'MUSIC') : 
                   activeTab === 'podcast' ? tracks.filter(t => t.type === 'PODCAST') : [];

  return (
    <div className="p-4 flex flex-col h-full pb-48 animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Media Hub</h2>
        {activeTab === 'playlists' && (
          <button onClick={() => setIsCreatingPlaylist(true)} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><FolderPlus size={20}/></button>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {['music', 'podcast', 'playlists'].map(t => (
          <button key={t} onClick={() => { setActiveTab(t as any); setSelectedPlaylist(null); }} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border dark:border-slate-700'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3 overflow-y-auto no-scrollbar">
        {activeTab === 'playlists' && !selectedPlaylist ? (
          <div className="grid grid-cols-2 gap-4">
            {userPlaylists.map(pl => (
              <div key={pl.id} onClick={() => setSelectedPlaylist(pl)} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border dark:border-slate-700 cursor-pointer">
                <ListMusic size={24} className="text-blue-600 mb-4"/>
                <h4 className="font-black text-sm dark:text-white truncate">{pl.title}</h4>
              </div>
            ))}
          </div>
        ) : (selectedPlaylist?.tracks || filtered).map(track => (
          <div key={track.id} onClick={() => toggleTrack(track, selectedPlaylist?.tracks || filtered)} className={`p-4 rounded-3xl flex items-center gap-4 border ${current?.id === track.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-white dark:bg-slate-800 border-transparent dark:border-slate-700'}`}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600">
              {current?.id === track.id && isPlaying ? <Pause size={18}/> : <Play size={18} fill="currentColor"/>}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm dark:text-white truncate">{track.title}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{track.artist}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); setShowAddModal(true); }} className="p-2 text-slate-400"><Plus size={18}/></button>
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border dark:border-slate-700 z-40">
           <div className="flex items-center gap-4 mb-4">
             <Music size={20} className="text-blue-600"/>
             <div className="flex-1 truncate"><p className="font-black text-sm dark:text-white">{current.title}</p></div>
             <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center"><Pause size={24}/></button>
           </div>
           <audio ref={audioRef} src={current.url} onEnded={handleNext}/>
        </div>
      )}

      {isCreatingPlaylist && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-[100]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-6">
            <h3 className="text-lg font-black mb-4 dark:text-white">New Playlist</h3>
            <input value={newPlaylistTitle} onChange={e => setNewPlaylistTitle(e.target.value)} placeholder="Title" className="w-full p-3 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4 dark:text-white"/>
            <div className="flex gap-2"><button onClick={() => setIsCreatingPlaylist(false)} className="flex-1">Cancel</button><button onClick={createPlaylist} className="flex-1 bg-blue-600 text-white rounded-xl py-2">Create</button></div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-[100]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-6 max-h-[70vh] overflow-y-auto">
            <h3 className="text-lg font-black mb-4 dark:text-white">Add to Playlist</h3>
            {userPlaylists.map(pl => (
              <button key={pl.id} onClick={() => addToPlaylist(pl.id)} className="w-full p-3 text-left border-b dark:border-slate-700 dark:text-white">{pl.title}</button>
            ))}
            <button onClick={() => setShowAddModal(false)} className="w-full mt-4 text-slate-500">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- BLOG PAGE ---
export const BlogView = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [apkShareData, setApkShareData] = useState<{url: string, title: string} | null>(null);

  const categories = ['All', 'Sermon Devotional', 'Psalm Devotional', 'Community News'];

  useEffect(() => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(r => setBlogs(r.data || []));
  }, []);

  const filtered = blogs.filter(b => {
    if (category === 'All') return true;
    return (b.category || '').toString().toLowerCase().trim() === category.toLowerCase().trim();
  });

  if (selectedPost) {
    const ytId = getYouTubeID(selectedPost.video_url || '');
    return (
      <div className="p-4 pb-24 animate-fade-in max-w-4xl mx-auto">
        <ShareModal isOpen={!!apkShareData} onClose={() => setApkShareData(null)} shareData={apkShareData} />
        
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-blue-600 font-black mb-6 uppercase tracking-widest text-[10px]"><ArrowLeft size={16}/> Back</button>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border dark:border-slate-700">
          <div className="relative aspect-video bg-black">
            {selectedPost.video_url ? (
               ytId ? <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}?rel=0`} frameBorder="0" allowFullScreen></iframe> : <video src={selectedPost.video_url} controls className="w-full h-full" />
            ) : <img src={selectedPost.image_url} className="w-full h-full object-cover" alt={selectedPost.title} />}
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                const isYT = selectedPost.video_url && (selectedPost.video_url.includes('youtube.com') || selectedPost.video_url.includes('youtu.be'));
                const shareTarget = isYT ? selectedPost.image_url : (selectedPost.video_url || selectedPost.image_url);
                shareMediaFile(shareTarget, selectedPost.title, selectedPost.title.replace(/\s+/g, '-').toLowerCase(), setApkShareData); 
              }} 
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center text-blue-600 shadow-lg"
            >
              <Share2 size={20}/>
            </button>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{selectedPost.category}</span>
              <h2 className="text-3xl font-black dark:text-white leading-tight mt-2">{selectedPost.title}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase mt-2">{selectedPost.author} • {formatDate(selectedPost.created_at)}</p>
            </div>
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{selectedPost.content}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto relative">
      <ShareModal isOpen={!!apkShareData} onClose={() => setApkShareData(null)} shareData={apkShareData} />
      
      <Logo className="absolute top-10 right-4 w-24 h-24 opacity-5 pointer-events-none" />
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Articles & Inspiration</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition ${category === c ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border dark:border-slate-700'}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-6">
        {filtered.length > 0 ? filtered.map(blog => (
          <div key={blog.id} onClick={() => setSelectedPost(blog)} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-[2.5rem] shadow-sm border dark:border-slate-700 cursor-pointer group">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-3xl overflow-hidden flex-shrink-0 relative">
              <img src={blog.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">{blog.category}</span>
              <h3 className="font-black text-sm dark:text-white line-clamp-2 leading-tight mb-2">{blog.title}</h3>
              <div className="flex gap-2">
                 <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const isYT = blog.video_url && (blog.video_url.includes('youtube.com') || blog.video_url.includes('youtu.be'));
                    const shareTarget = isYT ? blog.image_url : (blog.video_url || blog.image_url);
                    shareMediaFile(shareTarget, blog.title, blog.title.replace(/\s+/g, '-').toLowerCase(), setApkShareData); 
                  }} 
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full hover:bg-blue-100"
                >
                   <Share2 size={14}/>
                 </button>
                 <button className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase">Read</button>
              </div>
            </div>
          </div>
        )) : <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-3xl">No articles found</div>}
      </div>
    </div>
  );
};

// --- GROUPS PAGE (REFINED CHAT INTERFACE) ---
export const CommunityView = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selected, setSelected] = useState<CommunityGroup | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [comment, setComment] = useState('');
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const fetchPosts = async (groupId: string) => {
    const { data } = await supabase.from('group_posts')
      .select('*, profiles(first_name, last_name, avatar_url), group_post_likes(user_id)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    setPosts(data || []);
  };

  const fetchGroupsData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    const { data: gs } = await supabase.from('community_groups').select('*');
    const { data: ms } = await supabase.from('community_group_members').select('*').eq('user_id', user.id);
    if (gs) setGroups(gs.map(g => {
      const mem = ms?.find((m: any) => m.group_id === g.id);
      return { ...g, status: mem?.status || 'none', isMember: mem?.status === 'approved' };
    }));
  };

  useEffect(() => { fetchGroupsData(); }, []);

  const handleSendMessage = async () => {
    if (!comment.trim() || !selected || !currentUserId) return;
    
    if (editingPostId) {
      await supabase.from('group_posts').update({ content: comment }).eq('id', editingPostId);
      setEditingPostId(null);
    } else {
      await supabase.from('group_posts').insert([{ group_id: selected.id, user_id: currentUserId, content: comment }]);
    }
    
    setComment('');
    fetchPosts(selected.id);
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUserId) return;
    const post = posts.find(p => p.id === postId);
    const isLiked = post?.group_post_likes?.some(l => l.user_id === currentUserId);
    if (isLiked) {
      await supabase.from('group_post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
    } else {
      await supabase.from('group_post_likes').insert([{ post_id: postId, user_id: currentUserId }]);
    }
    fetchPosts(selected!.id);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete message?")) return;
    await supabase.from('group_posts').delete().eq('id', id);
    fetchPosts(selected!.id);
  };

  const handleJoin = async (groupId: string) => {
    setIsJoining(groupId);
    await supabase.from('community_group_members').upsert({ group_id: groupId, user_id: currentUserId, status: 'pending' }, { onConflict: 'group_id,user_id' });
    setIsJoining(null); 
    fetchGroupsData();
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full bg-[#08182e] pb-24 relative animate-fade-in overflow-hidden">
        {/* Header matching screenshot */}
        <div className="p-4 flex items-center justify-between bg-[#08182e] border-b border-slate-800/50 sticky top-0 z-10 h-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelected(null)} className="p-2 text-white hover:bg-slate-800 rounded-full transition"><ArrowLeft size={24}/></button>
            <div className="flex flex-col">
              <h3 className="font-black text-xl text-white leading-none mb-1">{selected.name}</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{posts.length} MESSAGES</p>
            </div>
          </div>
          <button className="p-2 text-slate-400"><MoreVertical size={24}/></button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth no-scrollbar">
          {posts.map(p => {
            const isMe = p.user_id === currentUserId;
            const isLiked = p.group_post_likes?.some(l => l.user_id === currentUserId);
            return (
              <div key={p.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Bubble Container */}
                  <div className="flex flex-col">
                    <div className={`p-4 rounded-[2rem] shadow-xl relative min-w-[100px] ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#112a4a] text-white rounded-tl-none'}`}>
                      <p className="text-base font-medium leading-relaxed">{p.content}</p>
                      <p className={`text-[9px] font-bold mt-2 opacity-60 text-right`}>
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Interactions Row matching screenshot exactly */}
                    <div className={`flex items-center gap-3 mt-2 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <button onClick={() => handleLikePost(p.id)} className={`flex items-center gap-1.5 text-[11px] font-black transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-400'}`}>
                        <Heart size={14} fill={isLiked ? "currentColor" : "none"}/> {p.group_post_likes?.length || 0}
                      </button>
                      <button className="text-slate-400 hover:text-blue-500"><CornerDownRight size={14}/></button>
                      {isMe && (
                        <>
                          <button onClick={() => { setEditingPostId(p.id); setComment(p.content); }} className="text-slate-400 hover:text-blue-400"><Pencil size={14}/></button>
                          <button onClick={() => handleDeletePost(p.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={14}/></button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Initials Avatar matching screenshot */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg border border-white/5 ${isMe ? 'bg-[#112a4a] text-blue-400' : 'bg-blue-600 text-white'}`}>
                    {(p.profiles?.first_name?.[0] || 'U').toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Input Area matching screenshot */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-transparent z-20 flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..." 
              className="w-full bg-[#112a4a]/80 backdrop-blur-xl border border-white/10 p-4 rounded-full text-sm font-medium text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500/50 shadow-2xl transition-all" 
            />
          </div>
          <button 
            onClick={handleSendMessage}
            className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 active:scale-90 transition-transform transform shrink-0"
          >
            <Send size={24} className="ml-1" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Community Groups</h2>
      <div className="grid gap-6">
        {groups.map(g => (
          <div key={g.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border dark:border-slate-700">
            <h4 className="text-xl font-black mb-1 dark:text-white">{g.name}</h4>
            <p className="text-xs text-slate-500 mb-6">{g.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">{g.membersCount || 0} Members</span>
              {g.status === 'approved' ? (
                <button onClick={() => { setSelected(g); fetchPosts(g.id); }} className="bg-green-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase">Enter</button>
              ) : (
                <button disabled={g.status === 'pending'} onClick={() => handleJoin(g.id)} className="bg-[#0c2d58] text-white px-6 py-2 rounded-full text-xs font-black uppercase">
                  {isJoining === g.id ? '...' : g.status === 'pending' ? 'Pending' : 'Join'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SERMONS PAGE ---
export const SermonsView = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('sermons').select('*').order('date_preached', { ascending: false })
      .then(r => { setSermons(r.data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="py-24 text-center text-slate-400">Loading Library...</div>;

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Sermon Archive</h2>
      <div className="space-y-6">
        {sermons.map(sermon => {
          const ytId = getYouTubeID(sermon.video_url);
          return (
            <div key={sermon.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border dark:border-slate-700">
              <div className="aspect-video bg-black relative">
                {ytId ? (
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} title={sermon.title} frameBorder="0" allowFullScreen className="w-full h-full"></iframe>
                ) : (
                  <video src={sermon.video_url} controls className="w-full h-full object-contain" />
                )}
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{sermon.preacher}</span>
                <h3 className="text-lg font-black dark:text-white leading-tight mt-2 mb-2">{sermon.title}</h3>
                <p className="text-[10px] font-bold text-blue-500 uppercase">{formatDate(sermon.date_preached)} • {sermon.duration}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- EVENTS PAGE (REFINED TO MATCH SCREENSHOT) ---
export const EventsView = ({ onBack }: { onBack: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, { status: string, transport: boolean, guests: number }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('events').select('*').order('date', { ascending: true })
      .then(r => setEvents(r.data || []));
  }, []);

  const handleRSVPChange = (eventId: string, status: string) => {
    setRsvps(prev => ({
      ...prev,
      [eventId]: { ...(prev[eventId] || { transport: false, guests: 0 }), status }
    }));
  };

  const handleTransportToggle = (eventId: string) => {
    setRsvps(prev => ({
      ...prev,
      [eventId]: { ...(prev[eventId] || { status: 'None', guests: 0 }), transport: !prev[eventId]?.transport }
    }));
  };

  const handleGuestsChange = (eventId: string, count: number) => {
    setRsvps(prev => ({
      ...prev,
      [eventId]: { ...(prev[eventId] || { status: 'None', transport: false }), guests: count }
    }));
  };

  const submitRSVP = async (eventId: string) => {
    const data = rsvps[eventId];
    if (!data || data.status === 'None') return alert("Please select an RSVP option first.");

    setSubmitting(eventId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to RSVP.");

      const { error } = await supabase.from('event_rsvps').upsert({
        event_id: eventId,
        user_id: user.id,
        status: data.status,
        transport_required: data.transport,
        plus_guests: data.guests
      }, { onConflict: 'event_id,user_id' });

      if (error) throw error;
      alert("RSVP Submitted Successfully!");
    } catch (err: any) {
      alert("RSVP failed: " + err.message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#08182e] animate-fade-in overflow-hidden">
      {/* Header matching screenshot */}
      <div className="p-6 flex items-center gap-6 bg-[#08182e] sticky top-0 z-10">
        <button onClick={onBack} className="p-2 text-white hover:bg-white/10 rounded-full transition">
          <ArrowLeft size={28}/>
        </button>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">COMMUNITY UPDATES</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 no-scrollbar">
        {events.map(event => {
          const isEvent = event.type === 'EVENT';
          const currentRSVP = rsvps[event.id] || { status: 'None', transport: false, guests: 0 };
          
          return (
            <div key={event.id} className="bg-[#112a4a]/40 backdrop-blur-md rounded-[3rem] p-8 border border-white/5 shadow-2xl transition-all hover:border-white/10">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${isEvent ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                  {isEvent ? <Calendar size={32}/> : <Info size={32}/>}
                </div>
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isEvent ? 'bg-white text-blue-600' : 'bg-[#fff5f0] text-orange-600'}`}>
                  {event.type}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">{event.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{event.description}</p>
              </div>

              <div className="border-t border-white/5 pt-6 pb-6 flex flex-wrap gap-x-8 gap-y-4 items-center">
                 <div className="flex items-center gap-2.5 text-blue-500 font-black text-xs uppercase tracking-widest">
                   <Calendar size={18}/> <span>{formatDate(event.date).toUpperCase()}</span>
                 </div>
                 <div className="flex items-center gap-2.5 text-slate-400 font-bold text-xs uppercase tracking-widest">
                   <Clock size={18}/> <span>{event.time}</span>
                 </div>
                 <div className="flex items-center gap-2.5 text-slate-400 font-bold text-xs uppercase tracking-widest">
                   <MapPin size={18}/> <span>{event.location}</span>
                 </div>
              </div>

              {isEvent && (
                <div className="bg-[#0c1f38] rounded-[2rem] p-8 space-y-6 border border-white/5 animate-slide-up">
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">RSVP CONFIRMATION</p>
                    <div className="flex bg-[#112a4a] rounded-2xl p-1.5 border border-white/5">
                      {['YES', 'MAYBE', 'NO'].map((status) => (
                        <button 
                          key={status}
                          onClick={() => handleRSVPChange(event.id, status)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentRSVP.status === status ? 'bg-[#1a3b63] text-blue-400 shadow-inner ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-white tracking-tight">Transport Needed?</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Let us help you get here</p>
                    </div>
                    <button 
                      onClick={() => handleTransportToggle(event.id)}
                      className={`w-14 h-8 rounded-full relative transition-colors p-1 ${currentRSVP.transport ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${currentRSVP.transport ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  {/* Plus Guest Dropdown as requested */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm font-black text-white tracking-tight">Plus Guest?</p>
                    <select 
                      value={currentRSVP.guests}
                      onChange={(e) => handleGuestsChange(event.id, parseInt(e.target.value))}
                      className="bg-[#112a4a] text-blue-400 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Guests</option>)}
                    </select>
                  </div>

                  <button 
                    disabled={submitting === event.id}
                    onClick={() => submitRSVP(event.id)}
                    className="w-full bg-white text-[#08182e] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-100 transition-all transform active:scale-[0.98]"
                  >
                    {submitting === event.id ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24}/>}
                    <span className="font-black text-sm uppercase tracking-widest">{submitting === event.id ? 'SUBMITTING...' : 'SUBMIT RSVP'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="py-24 text-center">
            <Calendar size={64} className="mx-auto text-slate-800 mb-6 opacity-20" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No updates at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PROFILE PAGE ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) setEditData({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
  }, [user]);

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <div className="bg-[#0c2d58] p-8 rounded-[2.5rem] text-white relative overflow-hidden">
        <Logo className="absolute -bottom-8 -right-8 w-40 h-40 opacity-10" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-3xl font-black">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <div><h2 className="text-2xl font-black">{user?.firstName} {user?.lastName}</h2><p className="text-xs uppercase font-black opacity-60">{user?.role}</p></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex justify-between items-center"><h3 className="font-black dark:text-white uppercase text-lg">My Information</h3><button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-blue-50 rounded-full text-blue-600">{isEditing ? <X size={20}/> : <Edit2 size={20}/>}</button></div>
        {isEditing ? (
          <div className="space-y-4">
            <input value={editData.firstName || ''} onChange={e => setEditData({...editData, firstName: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl dark:text-white" placeholder="First Name"/>
            <input value={editData.lastName || ''} onChange={e => setEditData({...editData, lastName: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl dark:text-white" placeholder="Last Name"/>
            <button onClick={() => { onUpdateUser(editData); setIsEditing(false); }} className="w-full bg-[#0c2d58] text-white p-4 rounded-2xl font-black uppercase">Save Changes</button>
          </div>
        ) : (
          <div className="space-y-4 text-sm font-bold dark:text-white">
            <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-400">Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-400">Phone</span><span>{user?.phone || 'Not set'}</span></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={toggleTheme} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 flex flex-col items-center gap-2">
          {isDarkMode ? <Sun className="text-amber-500"/> : <Moon className="text-indigo-600"/>}
          <span className="text-[10px] font-black uppercase dark:text-white">{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
        <button onClick={() => onNavigate('contact')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 flex flex-col items-center gap-2">
          <Phone className="text-blue-600"/>
          <span className="text-[10px] font-black uppercase dark:text-white">Support</span>
        </button>
      </div>

      <button onClick={onLogout} className="w-full bg-rose-50 text-rose-600 p-6 rounded-[2.5rem] font-black uppercase border border-rose-100 flex items-center justify-center gap-3"><LogOut size={24}/> Sign Out</button>
    </div>
  );
};

// --- MISC VIEWS ---
export const NotificationsView = () => (
  <div className="p-4 space-y-6 pb-24 text-center">
    <h2 className="text-2xl font-black dark:text-white uppercase">Notifications</h2>
    <div className="py-24 flex flex-col items-center bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700">
      <Bell size={48} className="text-slate-200 mb-4"/>
      <p className="text-slate-400 font-black uppercase text-xs">No new notifications</p>
    </div>
  </div>
);

export const ContactView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-4 space-y-6 pb-24">
    <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px]"><ArrowLeft size={16}/> Back</button>
    <h2 className="text-2xl font-black dark:text-white uppercase">Contact Us</h2>
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 space-y-8">
      <div className="flex items-center gap-5"><Phone className="text-blue-600" size={24}/><div><p className="text-[10px] font-black text-slate-400 uppercase">Call Us</p><p className="font-bold dark:text-white">+27 31 123 4567</p></div></div>
      <div className="flex items-center gap-5"><Mail className="text-blue-600" size={24}/><div><p className="text-[10px] font-black text-slate-400 uppercase">Email Us</p><p className="font-bold dark:text-white">info@icc.com</p></div></div>
    </div>
  </div>
);
