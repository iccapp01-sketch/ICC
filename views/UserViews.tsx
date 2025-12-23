import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Film, Video, MessageSquare, Share2, Heart,
  Calendar, Check, X, ChevronRight, Search, Download, Instagram,
  Facebook, MessageCircle, Send, User as UserIcon, Bell, Phone, Mail,
  Clock, MapPin, MoreVertical, ListMusic, Mic, Globe, Loader2, Save,
  SkipBack, SkipForward, Square, Repeat, RotateCcw, Edit2, Shield,
  ExternalLink, Info, Trash2, Pencil, CornerDownRight, Plus, FolderPlus
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
 * Enhanced Share Utility
 * Shares the ACTUAL file (image or video) via System Share Sheet.
 * This allows sharing to Instagram, TikTok, Facebook, and WhatsApp.
 */
const shareMediaFile = async (mediaUrl: string, title: string, fileName: string = 'share-content') => {
  if (!mediaUrl) return;

  try {
    // 1. Fetch the media as a blob
    const response = await fetch(mediaUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    
    // 2. Create a File object
    const mimeType = blob.type || (mediaUrl.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/png');
    const ext = mimeType.split('/')[1]?.split('+')[0] || 'png';
    const file = new File([blob], `${fileName}.${ext}`, { type: mimeType });

    // 3. Use Native Share Sheet with files
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

  // Fallback 1: Native Share (Link only)
  if (navigator.share) {
    try {
      await navigator.share({ title, url: mediaUrl });
      return;
    } catch (e) {}
  }

  // Fallback 2: WhatsApp Link
  window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + mediaUrl)}`, '_blank');
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
    <div className="p-4 space-y-6 animate-fade-in">
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
                <button onClick={(e) => { e.stopPropagation(); shareMediaFile(blog.image_url, blog.title); }} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1"><Share2 size={12}/> Share</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- BIBLE PAGE ---
const BIBLE_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];

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
              {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
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
      console.warn("Playlists table might not exist yet:", err);
    }
  };

  useEffect(() => {
    fetchTracks();
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.warn("Autoplay blocked or playback failed:", e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, current]);

  const filtered = activeTab === 'music' ? tracks.filter(t => t.type === 'MUSIC') : 
                   activeTab === 'podcast' ? tracks.filter(t => t.type === 'PODCAST') : [];

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
    const nextIndex = (currentIndex + 1) % playingList.length;
    setCurrent(playingList[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!current || playingList.length === 0) return;
    const currentIndex = playingList.findIndex(t => t.id === current.id);
    const prevIndex = (currentIndex - 1 + playingList.length) % playingList.length;
    setCurrent(playingList[prevIndex]);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Sign in to create playlists.");

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([{ title: newPlaylistTitle, user_id: user.id }])
        .select();
      
      if (error) throw error;
      setNewPlaylistTitle('');
      setIsCreatingPlaylist(false);
      fetchPlaylists();
    } catch (err: any) {
      alert("Failed to create playlist: " + err.message);
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!trackToAdd) return;
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .insert([{ playlist_id: playlistId, track_id: trackToAdd.id }]);
      
      if (error) throw error;
      setShowAddModal(false);
      setTrackToAdd(null);
      fetchPlaylists();
      alert("Added to playlist!");
    } catch (err: any) {
      alert("Failed to add track: " + err.message);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full pb-48 animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Media Hub</h2>
        {activeTab === 'playlists' && !selectedPlaylist && (
          <button 
            onClick={() => setIsCreatingPlaylist(true)}
            className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <FolderPlus size={20}/>
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {['music', 'podcast', 'playlists'].map(t => (
          <button 
            key={t} 
            onClick={() => { setActiveTab(t as any); setSelectedPlaylist(null); }} 
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white dark:bg-slate-800 text-slate-500 border dark:border-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'playlists' && selectedPlaylist ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase mb-4">
            <ArrowLeft size={14}/> Back to Playlists
          </button>
          <div className="p-6 bg-gradient-to-br from-[#0c2d58] to-blue-900 rounded-[2.5rem] text-white shadow-xl mb-6">
             <h3 className="text-2xl font-black tracking-tight">{selectedPlaylist.title}</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{selectedPlaylist.tracks.length} Tracks</p>
          </div>
          <div className="space-y-3">
            {selectedPlaylist.tracks.map((track: MusicTrack) => (
              <div 
                key={track.id} 
                className={`p-4 rounded-3xl flex items-center gap-4 border transition-all cursor-pointer ${current?.id === track.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-white dark:bg-slate-800 border-transparent dark:border-slate-700 shadow-sm'}`}
                onClick={() => toggleTrack(track, selectedPlaylist.tracks)}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${current?.id === track.id ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-600'}`}>
                  {current?.id === track.id && isPlaying ? <Pause size={18}/> : <Play size={18} fill="currentColor"/>}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm dark:text-white leading-tight">{track.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'playlists' ? (
        <div className="grid grid-cols-2 gap-4">
           {userPlaylists.length > 0 ? userPlaylists.map(pl => (
             <div 
              key={pl.id} 
              onClick={() => setSelectedPlaylist(pl)}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border dark:border-slate-700 hover:border-blue-500 transition-all cursor-pointer group"
             >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                   <ListMusic size={24}/>
                </div>
                <h4 className="font-black text-sm dark:text-white mb-1 truncate">{pl.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pl.tracks.length} Tracks</p>
             </div>
           )) : (
             <div className="col-span-2 py-20 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
               <Music size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No playlists created yet</p>
               <button onClick={() => setIsCreatingPlaylist(true)} className="mt-4 text-blue-600 font-black uppercase text-[10px] tracking-widest">Create Your First One</button>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 no-scrollbar">
          {filtered.map(track => (
            <div 
              key={track.id} 
              className={`p-4 rounded-3xl flex items-center gap-4 border transition-all cursor-pointer ${current?.id === track.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-white dark:bg-slate-800 border-transparent dark:border-slate-700 shadow-sm hover:border-slate-200'}`}
              onClick={() => toggleTrack(track, filtered)}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${current?.id === track.id ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-600'}`}>
                {current?.id === track.id && isPlaying ? <Pause size={20}/> : <Play size={20} fill="currentColor"/>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm truncate ${current?.id === track.id ? 'text-blue-700 dark:text-blue-400' : 'dark:text-white'}`}>{track.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{track.artist}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); setShowAddModal(true); }}
                className="p-2 text-slate-400 hover:text-blue-600 transition"
              >
                <Plus size={20}/>
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
              No media found
            </div>
          )}
        </div>
      )}

      {/* Playlist Creation Modal */}
      {isCreatingPlaylist && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
           <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border dark:border-slate-700 animate-slide-up">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 dark:text-white">Create Playlist</h3>
              <input 
                autoFocus
                value={newPlaylistTitle}
                onChange={e => setNewPlaylistTitle(e.target.value)}
                placeholder="My Worship List..."
                className="w-full bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl text-sm font-bold mb-6 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <div className="flex gap-3">
                <button onClick={() => setIsCreatingPlaylist(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Cancel</button>
                <button onClick={createPlaylist} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition">Create</button>
              </div>
           </div>
        </div>
      )}

      {/* Add Track to Playlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
           <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border dark:border-slate-700 animate-slide-up">
              <h3 className="text-lg font-black uppercase tracking-tighter mb-4 dark:text-white">Add to Playlist</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Select a playlist for: <span className="text-blue-600">{trackToAdd?.title}</span></p>
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar mb-6">
                {userPlaylists.length > 0 ? userPlaylists.map(pl => (
                   <button 
                    key={pl.id} 
                    onClick={() => addToPlaylist(pl.id)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-left font-bold text-sm dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-between"
                   >
                     {pl.title}
                     <ChevronRight size={16} className="text-slate-300"/>
                   </button>
                )) : (
                  <p className="text-center py-4 text-xs text-slate-500">No playlists found. Create one first!</p>
                )}
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-500">Close</button>
           </div>
        </div>
      )}

      {/* Fixed Media Player */}
      {current && (
        <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border dark:border-slate-700 z-40 animate-slide-up">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none animate-pulse">
               <Music size={24}/>
             </div>
             <div className="flex-1 min-w-0">
               <p className="font-black text-sm dark:text-white truncate">{current.title}</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{current.artist}</p>
             </div>
             <button onClick={() => setIsLooping(!isLooping)} className={`p-2 rounded-xl transition-colors ${isLooping ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/40' : 'text-slate-400'}`}>
               <Repeat size={20} />
             </button>
           </div>

           <div className="flex items-center justify-between px-2">
             <button onClick={handlePrevious} className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors active:scale-90">
               <SkipBack size={24} fill="currentColor" />
             </button>
             
             <div className="flex items-center gap-4">
                <button onClick={handleStop} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors active:scale-90">
                  <Square size={20} fill="currentColor" />
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 transform"
                >
                  {isPlaying ? <Pause size={32}/> : <Play size={32} fill="currentColor" className="ml-1"/>}
                </button>

                <button onClick={handleReplay} className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors active:scale-90">
                  <RotateCcw size={20} />
                </button>
             </div>

             <button onClick={handleNext} className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors active:scale-90">
               <SkipForward size={24} fill="currentColor" />
             </button>
           </div>

           <audio 
             ref={audioRef} 
             src={current.url} 
             loop={isLooping}
             onEnded={() => {
               if (!isLooping) handleNext();
             }}
             onPlay={() => setIsPlaying(true)}
             onPause={() => setIsPlaying(false)}
           />
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
  const categories = ['All', 'Sermon Devotional', 'Psalm Devotional'];

  useEffect(() => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(r => setBlogs(r.data || []));
  }, []);

  const filtered = category === 'All' ? blogs : blogs.filter(b => b.category === category);

  if (selectedPost) {
    const ytId = getYouTubeID(selectedPost.video_url || '');

    return (
      <div className="p-4 pb-24 animate-fade-in max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedPost(null)} 
          className="flex items-center gap-2 text-blue-600 font-black mb-6 hover:translate-x-[-4px] transition-transform uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft size={16}/> Back to Feed
        </button>
        
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border dark:border-slate-700">
          <div className="relative group bg-slate-100 dark:bg-slate-900 min-h-[300px] flex items-center justify-center overflow-hidden aspect-video bg-black">
            {selectedPost.video_url ? (
               ytId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                  title={selectedPost.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
               ) : (
                <video 
                  src={selectedPost.video_url} 
                  controls 
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                  poster={selectedPost.image_url}
                >
                  Your browser does not support the video tag.
                </video>
               )
            ) : (
              <img 
                src={selectedPost.image_url} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt={selectedPost.title}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button 
                onClick={() => {
                   const isYT = selectedPost.video_url && (selectedPost.video_url.includes('youtube.com') || selectedPost.video_url.includes('youtu.be'));
                   const shareTarget = isYT ? selectedPost.image_url : (selectedPost.video_url || selectedPost.image_url);
                   shareMediaFile(shareTarget, selectedPost.title, selectedPost.title.replace(/\s+/g, '-').toLowerCase());
                }} 
                className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center text-blue-600 shadow-lg hover:scale-110 transition"
              >
                <Share2 size={20}/>
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full w-fit">{selectedPost.category}</span>
              <h2 className="text-3xl font-black dark:text-white leading-tight tracking-tight mt-2">{selectedPost.title}</h2>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 w-fit px-4 py-2 rounded-full mt-2">
                <UserIcon size={12}/> {selectedPost.author} • {formatDate(selectedPost.created_at)}
              </div>
            </div>

            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium text-base">
              {selectedPost.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto">
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Articles & Inspiration</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition ${category === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white dark:bg-slate-800 text-slate-500 border dark:border-slate-700'}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.length > 0 ? filtered.map(blog => (
          <div key={blog.id} onClick={() => setSelectedPost(blog)} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-[2.5rem] shadow-sm border dark:border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-3xl overflow-hidden flex-shrink-0 relative">
              <img src={blog.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={blog.title} />
              {blog.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                   <div className="bg-white/30 backdrop-blur-md p-2 rounded-full">
                     <Play size={20} fill="white" className="text-white ml-0.5" />
                   </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">{blog.category}</span>
              <h3 className="font-black text-sm dark:text-white line-clamp-2 leading-tight mb-2 truncate">{blog.title}</h3>
              <div className="flex gap-2">
                 <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const isYT = blog.video_url && (blog.video_url.includes('youtube.com') || blog.video_url.includes('youtu.be'));
                    const shareTarget = isYT ? blog.image_url : (blog.video_url || blog.image_url);
                    shareMediaFile(shareTarget, blog.title, blog.title.replace(/\s+/g, '-').toLowerCase()); 
                  }} 
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition"
                 >
                   <Share2 size={14}/>
                 </button>
                 <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedPost(blog); }}
                  className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase transition transform active:scale-95 shadow-md hover:bg-blue-700"
                 >
                   Read Article
                 </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
            No articles found in this category
          </div>
        )}
      </div>
    </div>
  );
};

// --- GROUPS PAGE ---
export const CommunityView = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selected, setSelected] = useState<CommunityGroup | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [comment, setComment] = useState('');
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [replyingToPost, setReplyingToPost] = useState<GroupPost | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchPosts = async (groupId: string) => {
    const { data } = await supabase
      .from('group_posts')
      .select('*, profiles(first_name, last_name, avatar_url), group_post_likes(user_id)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    setPosts(data || []);
  };

  const fetchGroupsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: groupsData } = await supabase.from('community_groups').select('*');
      const { data: myMemberships } = await supabase.from('community_group_members').select('*').eq('user_id', user.id);
      
      if (groupsData) {
        const formatted = groupsData.map(g => {
          const userMem = myMemberships?.find((m: any) => m.group_id === g.id);
          return {
            ...g,
            status: userMem ? userMem.status : 'none',
            isMember: userMem?.status === 'approved'
          };
        });
        setGroups(formatted);
      }
    } catch (err) {
      console.error("Error fetching group data:", err);
    }
  };

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const openGroup = (g: CommunityGroup) => {
    if (g.status !== 'approved') return alert("Access pending admin approval.");
    setSelected(g);
    fetchPosts(g.id);
  };

  const handleSendMessage = async () => {
    if (!comment.trim() || !selected || !currentUserId) return;
    setIsSending(true);

    try {
      if (editingPostId) {
        const { error } = await supabase
          .from('group_posts')
          .update({ content: comment })
          .eq('id', editingPostId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('group_posts')
          .insert([{
            group_id: selected.id,
            user_id: currentUserId,
            content: comment,
            parent_id: replyingToPost?.id || null
          }]);
        if (error) throw error;
      }

      setComment('');
      setEditingPostId(null);
      setReplyingToPost(null);
      await fetchPosts(selected.id);
    } catch (err: any) {
      alert("Error sending message: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUserId) return;
    const post = posts.find(p => p.id === postId);
    const isLiked = post?.group_post_likes?.some(l => l.user_id === currentUserId);

    try {
      if (isLiked) {
        await supabase.from('group_post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
      } else {
        await supabase.from('group_post_likes').insert([{ post_id: postId, user_id: currentUserId }]);
      }
      fetchPosts(selected!.id);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const { error } = await supabase.from('group_posts').delete().eq('id', postId);
      if (error) throw error;
      fetchPosts(selected!.id);
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    }
  };

  const handleEditClick = (post: GroupPost) => {
    setComment(post.content);
    setEditingPostId(post.id);
    setReplyingToPost(null);
  };

  const handleJoin = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to join groups.");
        return;
      }

      setIsJoining(groupId);
      const { error } = await supabase.from('community_group_members').upsert({ 
        group_id: groupId, 
        user_id: user.id, 
        status: 'pending' 
      }, { onConflict: 'group_id,user_id' });

      if (error) throw error;
      await fetchGroupsData();
    } catch (err: any) {
      const errorMsg = err?.message || "An unexpected error occurred.";
      alert("Join error: " + errorMsg);
    } finally {
      setIsJoining(null);
    }
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-20 relative">
        <div className="p-4 flex items-center justify-between bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><ArrowLeft size={20}/></button>
            <div>
              <h3 className="font-black text-lg dark:text-white leading-tight">{selected.name}</h3>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{posts.length} Messages</p>
            </div>
          </div>
          <button className="p-2 text-slate-400"><MoreVertical size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <MessageSquare size={48} className="opacity-20 mb-4"/>
               <p className="text-xs font-black uppercase tracking-widest">No messages yet. Start the conversation!</p>
            </div>
          ) : posts.map(post => {
            const isMe = post.user_id === currentUserId;
            const parent = post.parent_id ? posts.find(p => p.id === post.parent_id) : null;
            const isLiked = post.group_post_likes?.some(l => l.user_id === currentUserId);

            return (
              <div key={post.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${isMe ? 'bg-[#0c2d58] text-white' : 'bg-white dark:bg-slate-800 text-blue-600 border dark:border-slate-700'}`}>
                    {post.profiles?.first_name?.[0] || 'U'}
                  </div>
                  
                  <div className="space-y-1">
                    {!isMe && (
                      <span className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                        {post.profiles?.first_name} {post.profiles?.last_name}
                      </span>
                    )}

                    <div className={`relative p-4 rounded-[2rem] shadow-sm border ${isMe ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 dark:text-slate-200 rounded-tl-none'}`}>
                      {parent && (
                        <div className={`mb-2 p-2 rounded-xl text-[10px] border-l-4 ${isMe ? 'bg-blue-700/50 border-white/30 text-white/80' : 'bg-slate-50 dark:bg-slate-900 border-blue-500 text-slate-500'}`}>
                           <p className="font-black uppercase mb-0.5">Replying to {parent.profiles?.first_name}</p>
                           <p className="line-clamp-1 italic">{parent.content}</p>
                        </div>
                      )}
                      <p className="text-sm font-medium leading-relaxed">{post.content}</p>
                      <p className={`text-[8px] font-black uppercase mt-2 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className={`flex items-center gap-3 mt-1 px-2 transition-opacity ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-1 text-[10px] font-black uppercase transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}>
                        <Heart size={14} fill={isLiked ? "currentColor" : "none"}/> {post.group_post_likes?.length || 0}
                      </button>
                      <button onClick={() => setReplyingToPost(post)} className="text-slate-400 hover:text-blue-500 transition-colors"><CornerDownRight size={14}/></button>
                      {isMe && (
                        <>
                          <button onClick={() => handleEditClick(post)} className="text-slate-400 hover:text-blue-500 transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t dark:border-slate-800 z-20">
          {(replyingToPost || editingPostId) && (
            <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-between animate-slide-up border dark:border-slate-700">
               <div className="flex items-center gap-2 overflow-hidden">
                 {editingPostId ? <Pencil size={16} className="text-blue-600"/> : <CornerDownRight size={16} className="text-blue-600"/>}
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest truncate">
                   {editingPostId ? 'Editing Message' : `Replying to ${replyingToPost?.profiles?.first_name}`}
                 </p>
               </div>
               <button onClick={() => { setEditingPostId(null); setReplyingToPost(null); setComment(''); }} className="p-1 hover:bg-white rounded-full transition"><X size={14}/></button>
            </div>
          )}
          <div className="flex gap-2">
            <input 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..." 
              className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-[2rem] text-sm font-bold outline-none dark:text-white border dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition shadow-inner" 
            />
            <button 
              disabled={isSending || !comment.trim()}
              onClick={handleSendMessage}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isSending ? 'bg-slate-400' : editingPostId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {isSending ? <Loader2 size={24} className="animate-spin"/> : editingPostId ? <Check size={24}/> : <Send size={24}/>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Community Groups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(g => (
          <div key={g.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border dark:border-slate-700 animate-fade-in hover:border-blue-500 transition-colors group">
            <h4 className="text-xl font-black mb-1 dark:text-white">{g.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{g.description}</p>
            
            <div className="flex justify-between items-center mt-auto">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full w-fit">
                  <Users size={12} className="text-blue-600" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    {g.membersCount || 0} Members
                  </span>
                </div>
                {g.status === 'pending' && <span className="text-[8px] font-black text-orange-500 uppercase mt-2 animate-pulse tracking-widest">Pending approval</span>}
              </div>
              
              {g.status === 'approved' ? (
                <button onClick={() => openGroup(g)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Enter Chat</button>
              ) : (
                <button 
                  disabled={g.status === 'pending' || isJoining === g.id}
                  onClick={() => handleJoin(g.id)} 
                  className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2 ${g.status === 'pending' ? 'bg-slate-100 text-slate-400 cursor-not-allowed border dark:border-slate-700 dark:bg-slate-900 shadow-none' : 'bg-[#0c2d58] text-white hover:bg-blue-900'}`}
                >
                  {isJoining === g.id ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isJoining === g.id ? 'Joining...' : g.status === 'pending' ? 'Pending Approval' : 'Join Group'}
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
    supabase.from('sermons')
      .select('*')
      .order('date_preached', { ascending: false })
      .then(r => {
        setSermons(r.data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-xs font-black uppercase tracking-widest">Loading Library...</p>
      </div>
    );
  }

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
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={sermon.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <video src={sermon.video_url} controls className="w-full h-full object-contain" />
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                    {sermon.preacher}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12}/>
                    <span className="text-[10px] font-bold uppercase">{sermon.duration}</span>
                  </div>
                </div>
                <h3 className="text-lg font-black dark:text-white leading-tight mb-2">{sermon.title}</h3>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{formatDate(sermon.date_preached)}</p>
              </div>
            </div>
          );
        })}
        {sermons.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
            No sermons found
          </div>
        )}
      </div>
    </div>
  );
};

// --- EVENTS PAGE ---
export const EventsView = ({ onBack }: { onBack: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    supabase.from('events').select('*').order('date', { ascending: true })
      .then(r => setEvents(r.data || []));
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border dark:border-slate-700 text-slate-600 dark:text-slate-300"><ArrowLeft size={20}/></button>
        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Events & News</h2>
      </div>

      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.type === 'EVENT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {event.type}
              </span>
              <div className="text-right">
                <p className="text-xs font-black text-slate-800 dark:text-white">{formatDate(event.date)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.time}</p>
              </div>
            </div>
            <h4 className="text-lg font-black dark:text-white mb-2 leading-tight">{event.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{event.description}</p>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
              <MapPin size={14}/> {event.location}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
            No events scheduled
          </div>
        )}
      </div>
    </div>
  );
};

// --- NOTIFICATIONS PAGE ---
export const NotificationsView = () => {
  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Notifications</h2>
      <div className="bg-white dark:bg-slate-800 p-12 rounded-[2.5rem] border dark:border-slate-700 shadow-sm text-center py-24 flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
          <Bell size={40} className="text-slate-200 dark:text-slate-700" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Stay tuned for church updates</p>
      </div>
    </div>
  );
};

// --- CONTACT PAGE ---
export const ContactView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border dark:border-slate-700 text-slate-600 dark:text-slate-300"><ArrowLeft size={20}/></button>
        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Contact Us</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><Phone size={24}/></div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Call Us</p>
               <p className="font-bold dark:text-white text-lg leading-none">+27 31 123 4567</p>
             </div>
          </div>
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><Mail size={24}/></div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Us</p>
               <p className="font-bold dark:text-white text-lg leading-none">info@icc.com</p>
             </div>
          </div>
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><MapPin size={24}/></div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Visit Us</p>
               <p className="font-bold dark:text-white text-lg leading-tight">123 Main Road, Isipingo, Durban</p>
             </div>
          </div>
        </div>

        <div className="pt-8 border-t dark:border-slate-700">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Service Times</p>
           <div className="space-y-2">
              <div className="flex justify-between items-center"><span className="text-sm font-bold dark:text-slate-300">Sunday Morning</span><span className="text-sm font-black text-blue-600 uppercase">08:00 AM</span></div>
              <div className="flex justify-between items-center"><span className="text-sm font-bold dark:text-slate-300">Mid-Week Prayer</span><span className="text-sm font-black text-blue-600 uppercase">06:30 PM</span></div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- PROFILE PAGE ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: { 
  user: User | null, 
  onUpdateUser: (data: Partial<User>) => void,
  onLogout: () => void,
  toggleTheme: () => void,
  isDarkMode: boolean,
  onNavigate: (tab: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender
    });
  }, [user]);

  const handleSave = () => {
    onUpdateUser(editData);
    setIsEditing(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <div className="bg-[#0c2d58] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <Logo className="absolute -bottom-8 -right-8 w-40 h-40 opacity-5" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-inner border border-white/20">
             {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">{user?.firstName} {user?.lastName}</h2>
            <div className="px-3 py-1 bg-blue-500/20 rounded-full w-fit mt-1 border border-blue-400/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate('contact')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform group">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Mail size={24}/>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Us</span>
        </button>
        <button onClick={toggleTheme} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-50 text-indigo-600'}`}>
            {isDarkMode ? <Sun size={24}/> : <Moon size={24}/>}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-black dark:text-white uppercase tracking-tighter text-lg">My Information</h3>
          <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
            {isEditing ? <X size={20}/> : <Edit2 size={20}/>}
          </button>
        </div>

        <div className="space-y-4">
           {isEditing ? (
             <div className="space-y-5 animate-slide-up">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">First Name</label>
                 <input value={editData.firstName || ''} onChange={e => setEditData({...editData, firstName: e.target.value})} placeholder="First Name" className="w-full bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Last Name</label>
                 <input value={editData.lastName || ''} onChange={e => setEditData({...editData, lastName: e.target.value})} placeholder="Last Name" className="w-full bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Phone</label>
                 <input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="Phone" className="w-full bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition" />
               </div>
               <button onClick={handleSave} className="w-full bg-[#0c2d58] text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform mt-2">Save Changes</button>
             </div>
           ) : (
             <div className="space-y-3">
               <div className="flex justify-between items-center py-3 border-b dark:border-slate-700/50">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                 <span className="text-sm font-bold dark:text-white truncate max-w-[200px]">{user?.email}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b dark:border-slate-700/50">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Contact</span>
                 <span className="text-sm font-bold dark:text-white">{user?.phone || 'Not set'}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b dark:border-slate-700/50">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</span>
                 <span className="text-sm font-bold dark:text-white">{formatDate(user?.joinedDate)}</span>
               </div>
             </div>
           )}
        </div>
      </div>

      <button onClick={onLogout} className="w-full bg-rose-50 dark:bg-rose-900/10 text-rose-600 p-6 rounded-[2.5rem] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm">
        <LogOut size={24}/> Sign Out from ICC
      </button>
    </div>
  );
};
