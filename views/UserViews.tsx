import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Film, Video, MessageSquare, Share2, Heart,
  Calendar, Check, X, ChevronRight, Search, Download, Instagram,
  Facebook, MessageCircle, Send, User as UserIcon, Bell, Phone, Mail,
  Clock, MapPin, MoreVertical, ListMusic, Mic, Globe, Loader2, Save,
  SkipBack, SkipForward, Square, Repeat, RotateCcw, Edit2, Shield,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { 
  BlogPost, Sermon, CommunityGroup, GroupPost, 
  Event, MusicTrack, BibleVerse, User, UserRole
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

const shareMedia = async (url: string, title: string) => {
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
      window.open(shareUrl, '_blank');
    }
  } catch (err) { 
    console.warn("Share failed:", err); 
    navigator.clipboard.writeText(`${title} ${url}`);
    alert("Link copied to clipboard!");
  }
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
                <button onClick={(e) => { e.stopPropagation(); shareMedia(window.location.href, blog.title); }} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1"><Share2 size={12}/> Share</button>
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
  const [current, setCurrent] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.from('music_tracks').select('*').then(r => setTracks(r.data || []));
  }, []);

  const filtered = activeTab === 'music' ? tracks.filter(t => t.type === 'MUSIC') : 
                   activeTab === 'podcast' ? tracks.filter(t => t.type === 'PODCAST') : [];

  const toggleTrack = (track: MusicTrack) => {
    if (current?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrent(track);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!current || filtered.length === 0) return;
    const currentIndex = filtered.findIndex(t => t.id === current.id);
    const nextIndex = (currentIndex + 1) % filtered.length;
    setCurrent(filtered[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!current || filtered.length === 0) return;
    const currentIndex = filtered.findIndex(t => t.id === current.id);
    const prevIndex = (currentIndex - 1 + filtered.length) % filtered.length;
    setCurrent(filtered[prevIndex]);
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

  return (
    <div className="p-4 flex flex-col h-full pb-48">
      <h2 className="text-2xl font-black mb-6 dark:text-white tracking-tighter uppercase">Media</h2>
      <div className="flex gap-2 mb-6">
        {['music', 'podcast', 'playlists'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)} 
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3 overflow-y-auto pr-1 no-scrollbar">
        {filtered.map(track => (
          <div 
            key={track.id} 
            onClick={() => toggleTrack(track)} 
            className={`p-4 rounded-3xl flex items-center gap-4 border transition-all cursor-pointer ${current?.id === track.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-white dark:bg-slate-800 border-transparent dark:border-slate-700 shadow-sm hover:border-slate-200'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${current?.id === track.id ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-600'}`}>
              {current?.id === track.id && isPlaying ? <Pause size={20}/> : <Play size={20} fill="currentColor"/>}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${current?.id === track.id ? 'text-blue-700 dark:text-blue-400' : 'dark:text-white'}`}>{track.title}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{track.artist}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
            No media found
          </div>
        )}
      </div>

      {current && (
        <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border dark:border-slate-700 z-40 animate-slide-up">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
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

                <button onClick={handleReplay} className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-red-900/20 rounded-full transition-colors active:scale-90">
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
             autoPlay={isPlaying} 
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
          {/* HEADER MEDIA SECTION - Displays Video if available, otherwise Image */}
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
              <button onClick={() => shareMedia(window.location.href, selectedPost.title)} className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center text-blue-600 shadow-lg hover:scale-110 transition"><Share2 size={20}/></button>
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
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-3xl overflow-hidden flex-shrink-0">
              <img src={blog.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={blog.title} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">{blog.category}</span>
              <h3 className="font-black text-sm dark:text-white line-clamp-2 leading-tight mb-2 truncate">{blog.title}</h3>
              <div className="flex gap-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); shareMedia(window.location.href, blog.title); }} 
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition"
                 >
                   <Share2 size={14}/>
                 </button>
                 {/* Fixed: Read Article button functionality */}
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
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
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

  const fetchGroupsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    supabase.from('group_posts').select('*, profiles(first_name, last_name)').eq('group_id', g.id).order('created_at', { ascending: false })
      .then(r => setPosts(r.data || []));
  };

  const handleJoin = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to join groups.");
        return;
      }

      setIsJoining(groupId);
      // Upsert to handle potential re-joins after declines if record persists as 'none' or similar
      const { error } = await supabase.from('community_group_members').upsert({ 
        group_id: groupId, 
        user_id: user.id, 
        status: 'pending' 
      }, { onConflict: 'group_id,user_id' });

      if (error) throw error;
      await fetchGroupsData();
    } catch (err: any) {
      console.error("Join error detail:", err);
      // Fixed: Improved error reporting to provide clear messages instead of [object Object]
      const errorMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || "An unexpected error occurred.";
      alert("Join error: " + errorMsg);
    } finally {
      setIsJoining(null);
    }
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-20">
        <div className="p-4 flex items-center gap-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
          <button onClick={() => setSelected(null)}><ArrowLeft/></button>
          <h3 className="font-black text-lg dark:text-white">{selected.name}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {posts.map(post => (
            <div key={post.id} className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 uppercase">
                {/* Fixed: Improved safety for avatar fallback to prevent crash if profiles is null */}
                {(post.profiles?.first_name || 'U')[0]}
              </div>
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border dark:border-slate-700 shadow-sm">
                  <p className="text-[10px] font-black text-blue-600 uppercase">{post.profiles?.first_name} {post.profiles?.last_name}</p>
                  <p className="text-sm dark:text-slate-200">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl text-sm outline-none dark:text-white" />
          <button className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center"><Send size={20}/></button>
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
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-black uppercase tracking-widest">Loading Word...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Sermon Archive</h2>
      
      {sermons.length > 0 ? (
        <div className="space-y-8">
          {sermons.map((sermon) => {
            const ytId = getYouTubeID(sermon.video_url);
            return (
              <div key={sermon.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border dark:border-slate-700 hover:border-blue-500 transition-colors group">
                <div className="aspect-video w-full bg-black">
                  {ytId ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={sermon.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      Invalid Video URL
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-black dark:text-white leading-tight pr-4">{sermon.title}</h3>
                    <button 
                      onClick={() => shareMedia(sermon.video_url, sermon.title)}
                      className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition shadow-sm active:scale-90"
                      title="Share Sermon"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                      <UserIcon size={12}/>
                      <span>{sermon.preacher}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                      <Calendar size={12}/>
                      <span>{formatDate(sermon.date_preached)}</span>
                    </div>
                    {sermon.duration && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                        <Clock size={12}/>
                        <span>{sermon.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
          <Video className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No sermons found in our archive</p>
        </div>
      )}
    </div>
  );
};

// --- EVENTS PAGE ---
export const EventsView = ({ onBack }: { onBack: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('events')
      .select('*')
      .order('date', { ascending: true })
      .then(r => {
        setEvents(r.data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 pb-24 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"><ArrowLeft/></button>
        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Church Events</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border dark:border-slate-700 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-[4rem] group-hover:bg-blue-600 transition-colors duration-500 -z-0"></div>
              
              <div className="relative z-10 space-y-4">
                 <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none mb-4">
                    <Calendar size={24}/>
                 </div>
                 
                 <div>
                    <h3 className="text-xl font-black dark:text-white leading-tight mb-2">{event.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{event.description}</p>
                 </div>

                 <div className="space-y-2 pt-4 border-t dark:border-slate-700">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-600">
                       <Calendar size={14}/> {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
                       <Clock size={14}/> {event.time || 'TBA'}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
                       <MapPin size={14}/> {event.location || 'Church Main Hall'}
                    </div>
                 </div>

                 <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transform group-hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2">
                   <Check size={14}/> Save in My Events
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No upcoming events scheduled</p>
        </div>
      )}
    </div>
  );
};

// --- PROFILE PAGE ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || 'Female'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender || 'Female'
      });
    }
  }, [user]);

  const handleSave = async () => {
    await onUpdateUser(formData);
    setEditing(false);
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto animate-fade-in">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-8">
        <Logo className="absolute -bottom-8 -right-8 w-48 h-48 opacity-10 pointer-events-none" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-xl border-4 border-white/30 rounded-[2.5rem] flex items-center justify-center text-4xl font-black mb-4 shadow-2xl">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-none mb-2">{user?.firstName} {user?.lastName}</h2>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
            <Shield size={12} className="text-blue-300"/>
            <p className="text-blue-100 font-black text-[10px] uppercase tracking-widest opacity-90">{user?.role} • Joined {formatDate(user?.joinedDate)}</p>
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 border dark:border-slate-700 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <UserIcon size={14}/> Personal Details
          </h3>
          <button 
            onClick={() => setEditing(!editing)}
            className={`p-3 rounded-2xl transition flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${editing ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}
          >
            {editing ? <X size={14}/> : <Edit2 size={14}/>}
            {editing ? 'Cancel' : 'Edit Info'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            { label: 'First Name', key: 'firstName', icon: UserIcon },
            { label: 'Last Name', key: 'lastName', icon: UserIcon },
            { label: 'Phone', key: 'phone', icon: Phone },
            { label: 'Date of Birth', key: 'dob', icon: Calendar, type: 'date' },
            { label: 'Gender', key: 'gender', icon: Users, type: 'select', options: ['Male', 'Female'] }
          ].map(field => (
            <div key={field.key} className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{field.label}</label>
              <div className="relative">
                <field.icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600"/>
                {editing ? (
                  field.type === 'select' ? (
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 pl-14 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold dark:text-white appearance-none"
                      value={(formData as any)[field.key]}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    >
                      {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      type={field.type || 'text'}
                      className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 pl-14 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold dark:text-white"
                      value={(formData as any)[field.key]}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    />
                  )
                ) : (
                  <div className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 p-4 pl-14 rounded-2xl text-sm font-bold dark:text-white">
                    {(user as any)[field.key] || 'Not specified'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 transition hover:bg-blue-700"
          >
            <Save size={18}/> Save Changes
          </button>
        )}
      </div>

      {/* Settings/Actions List */}
      <div className="mt-8 space-y-3">
        <button 
          onClick={toggleTheme}
          className="w-full bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 flex items-center justify-between group transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </div>
            <div className="text-left">
              <p className="font-black text-sm dark:text-white">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle Appearance</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition"/>
        </button>

        <button 
          onClick={() => onNavigate('contact')}
          className="w-full bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 flex items-center justify-between group transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Phone size={20}/>
            </div>
            <div className="text-left">
              <p className="font-black text-sm dark:text-white">Help & Support</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contact Office</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition"/>
        </button>

        <button 
          onClick={onLogout}
          className="w-full bg-red-50 dark:bg-red-900/10 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/20 flex items-center justify-between group transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-4 text-red-600">
            <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none">
              <LogOut size={20}/>
            </div>
            <div className="text-left">
              <p className="font-black text-sm">Sign Out</p>
              <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">Securely Logout</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-red-300 group-hover:translate-x-1 transition"/>
        </button>
      </div>
    </div>
  );
};

// --- NOTIFICATIONS VIEW ---
export const NotificationsView = () => (
  <div className="p-4 max-w-2xl mx-auto animate-fade-in">
    <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tighter">Notifications</h2>
    <div className="py-24 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
      <div className="relative inline-block mb-6">
        <Bell className="mx-auto text-slate-200" size={64} />
        <div className="absolute top-0 right-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900"></div>
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Your Inbox is clean</p>
      <p className="text-slate-300 dark:text-slate-600 text-[10px] mt-2 px-8 font-medium">We'll notify you when there's an update from the community.</p>
    </div>
  </div>
);

// --- CONTACT VIEW ---
export const ContactView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-4 pb-24 max-w-2xl mx-auto animate-fade-in">
    <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-black mb-6 hover:translate-x-[-4px] transition-transform uppercase tracking-widest text-[10px]"><ArrowLeft size={16}/> Back to Profile</button>
    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-8">Contact Us</h2>
    
    <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 border dark:border-slate-700 shadow-sm space-y-12">
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Our Location</h3>
        <div className="flex gap-4 items-start">
           <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><MapPin size={24}/></div>
           <div>
              <p className="font-black text-sm dark:text-white">Isipingo Community Church</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">123 Church Avenue, Isipingo Beach<br/>Durban, 4115, South Africa</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Channels</h3>
        <div className="grid grid-cols-1 gap-4">
          <a href="tel:+27123456789" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl group transition-all hover:bg-blue-600 hover:text-white">
             <div className="w-10 h-10 bg-white dark:bg-slate-800 text-blue-600 rounded-xl flex items-center justify-center group-hover:text-blue-600 group-hover:bg-white transition-colors"><Phone size={20}/></div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Call us</p>
                <p className="text-sm font-black">+27 12 345 6789</p>
             </div>
             <ExternalLink size={14} className="opacity-40 group-hover:opacity-100"/>
          </a>
          <a href="mailto:info@icc.com" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl group transition-all hover:bg-blue-600 hover:text-white">
             <div className="w-10 h-10 bg-white dark:bg-slate-800 text-blue-600 rounded-xl flex items-center justify-center group-hover:text-blue-600 group-hover:bg-white transition-colors"><Mail size={20}/></div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Email us</p>
                <p className="text-sm font-black">info@icc.com</p>
             </div>
             <ExternalLink size={14} className="opacity-40 group-hover:opacity-100"/>
          </a>
          <a href="https://wa.me/27123456789" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl group transition-all hover:bg-green-600 hover:text-white">
             <div className="w-10 h-10 bg-white dark:bg-slate-800 text-green-600 rounded-xl flex items-center justify-center group-hover:text-green-600 group-hover:bg-white transition-colors"><MessageCircle size={20}/></div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">WhatsApp</p>
                <p className="text-sm font-black">Open Chat</p>
             </div>
             <ExternalLink size={14} className="opacity-40 group-hover:opacity-100"/>
          </a>
        </div>
      </div>
    </div>
  </div>
);
