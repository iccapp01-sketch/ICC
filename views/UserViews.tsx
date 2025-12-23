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
 */
const shareMediaFile = async (mediaUrl: string, title: string, fileName: string = 'share-content') => {
  if (!mediaUrl) return;

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
        // Fixed: Mapping tracks property from selectedPlaylist instead of the object itself
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
          <div className="bg-white dark:bg-slate-800 w-full max-sm rounded-[2rem] p-6">
            <h3 className="text-lg font-black mb-4 dark:text-white">New Playlist</h3>
            <input value={newPlaylistTitle} onChange={e => setNewPlaylistTitle(e.target.value)} placeholder="Title" className="w-full p-3 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4 dark:text-white"/>
            <div className="flex gap-2"><button onClick={() => setIsCreatingPlaylist(false)} className="flex-1">Cancel</button><button onClick={createPlaylist} className="flex-1 bg-blue-600 text-white rounded-xl py-2">Create</button></div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-[100]">
          <div className="bg-white dark:bg-slate-800 w-full max-sm rounded-[2rem] p-6 max-h-[70vh] overflow-y-auto">
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
  
  // Articles now strictly organized under these church-defined categories
  const categories = ['All', 'Sermon Devotional', 'Psalm Devotional', 'Community News'];

  useEffect(() => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(r => setBlogs(r.data || []));
  }, []);

  // Robust filtering logic: trimmed and case-insensitive to ensure reliable data matching
  const filtered = blogs.filter(b => {
    if (category === 'All') return true;
    const itemCat = (b.category || '').toString().toLowerCase().trim();
    const activeCat = category.toLowerCase().trim();
    return itemCat === activeCat;
  });

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
                <video src={selectedPost.video_url} controls playsInline preload="metadata" className="w-full h-full object-contain" poster={selectedPost.image_url} />
               )
            ) : (
              <img src={selectedPost.image_url} className="w-full h-full object-cover" alt={selectedPost.title} />
            )}
            
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => {
                   const isYT = selectedPost.video_url && (selectedPost.video_url.includes('youtube.com') || selectedPost.video_url.includes('youtu.be'));
                   const shareTarget = isYT ? selectedPost.image_url : (selectedPost.video_url || selectedPost.image_url);
                   shareMediaFile(shareTarget, selectedPost.title, selectedPost.title.replace(/\s+/g, '-').toLowerCase());
                }} 
                className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center text-blue-600 shadow-lg"
              >
                <Share2 size={20}/>
              </button>
            </div>
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
      <Logo className="absolute top-10 right-4 w-24 h-24 opacity-5 pointer-events-none" />
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Articles & Inspiration</h2>
      
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {categories.map(c => (
          <button 
            key={c} 
            onClick={() => setCategory(c)} 
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition ${category === c ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border dark:border-slate-700'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.length > 0 ? filtered.map(blog => (
          <div key={blog.id} onClick={() => setSelectedPost(blog)} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-[2.5rem] shadow-sm border dark:border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-3xl overflow-hidden flex-shrink-0 relative">
              <img src={blog.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={blog.title} />
              {blog.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                   <div className="bg-white/30 backdrop-blur-md p-2 rounded-full"><Play size={20} fill="white" className="text-white ml-0.5" /></div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">{blog.category}</span>
              <h3 className="font-black text-sm dark:text-white line-clamp-2 leading-tight mb-2">{blog.title}</h3>
              <div className="flex gap-2">
                 <button onClick={(e) => { 
                   e.stopPropagation(); 
                   const isYT = blog.video_url && (blog.video_url.includes('youtube.com') || blog.video_url.includes('youtu.be'));
                   const shareTarget = isYT ? blog.image_url : (blog.video_url || blog.image_url);
                   shareMediaFile(shareTarget, blog.title, blog.title.replace(/\s+/g, '-').toLowerCase()); 
                 }} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full"><Share2 size={14}/></button>
                 <button className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase">Read</button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-3xl border-slate-200">No articles found in this category</div>
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchPosts = async (groupId: string) => {
    const { data } = await supabase.from('group_posts').select('*, profiles(first_name, last_name), group_post_likes(user_id)').eq('group_id', groupId).order('created_at', { ascending: true });
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
    const { error } = await supabase.from('group_posts').insert([{ group_id: selected.id, user_id: currentUserId, content: comment }]);
    if (error) return alert(error.message);
    setComment(''); fetchPosts(selected.id);
  };

  const handleJoin = async (groupId: string) => {
    setIsJoining(groupId);
    await supabase.from('community_group_members').upsert({ group_id: groupId, user_id: currentUserId, status: 'pending' }, { onConflict: 'group_id,user_id' });
    setIsJoining(null); fetchGroupsData();
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-20 relative">
        <div className="p-4 flex items-center bg-white dark:bg-slate-800 border-b dark:border-slate-700">
          <button onClick={() => setSelected(null)} className="p-2"><ArrowLeft size={20}/></button>
          <h3 className="font-black text-lg dark:text-white ml-2">{selected.name}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {posts.map(p => (
            <div key={p.id} className={`flex flex-col ${p.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
               <span className="text-[8px] font-black text-slate-400 uppercase mb-1">{p.profiles?.first_name}</span>
               <div className={`p-4 rounded-2xl max-w-[80%] ${p.user_id === currentUserId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white rounded-tl-none'}`}>
                 <p className="text-sm">{p.content}</p>
               </div>
            </div>
          ))}
        </div>
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Type a message..." className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 rounded-full outline-none dark:text-white"/>
          <button onClick={handleSendMessage} className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center"><Send size={20}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase">Community Groups</h2>
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

// --- EVENTS PAGE ---
export const EventsView = ({ onBack }: { onBack: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    supabase.from('events').select('*').order('date', { ascending: true }).then(r => setEvents(r.data || []));
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-black mb-6 uppercase text-[10px]"><ArrowLeft size={16}/> Back</button>
      <h2 className="text-2xl font-black dark:text-white uppercase">Events & News</h2>
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${event.type === 'EVENT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{event.type}</span>
            <h4 className="text-lg font-black dark:text-white mt-4 mb-2 leading-tight">{event.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{event.description}</p>
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
              <span>{formatDate(event.date)} at {event.time}</span>
              <span className="text-blue-600">{event.location}</span>
            </div>
          </div>
        ))}
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