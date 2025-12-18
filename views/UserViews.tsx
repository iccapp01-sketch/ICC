
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Plus, Trash2, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Film, MessageSquare, Share2, Heart,
  Calendar, Check, X, ChevronRight, Search, Download, Instagram,
  Facebook, MessageCircle, Send, Sparkles, User as UserIcon, Bell, Phone, Mail,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { explainVerse } from '../services/geminiService';
import { 
  BlogPost, Sermon, CommunityGroup, GroupPost, 
  Event, MusicTrack, Playlist, BibleVerse, ReadingPlanDay 
} from '../types';
import { Logo } from '../components/Logo';

// --- UTILS ---
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const getYouTubeID = (url: string) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

const shareToWhatsApp = (url: string, text: string) => {
  window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
};

const shareToFacebook = (url: string) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
};

// --- HOME VIEW ---
export const HomeView = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('https://bible-api.com/philippians+4:13')
      .then(res => res.json())
      .then(data => setVerse({ reference: data.reference, text: data.text, version: 'WEB' }))
      .catch(() => setVerse({ reference: "Phil 4:13", text: "I can do all things through Christ...", version: "KJV" }));

    supabase.from('sermons').select('*').order('created_at', { ascending: false }).limit(1)
      .then(r => setLatestSermon(r.data?.[0]));

    supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3)
      .then(r => setBlogs(r.data || []));
  }, []);

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 opacity-20" size={80} />
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-80">Daily Scripture</h2>
        <p className="text-xl font-serif mb-4 leading-relaxed italic">"{verse?.text}"</p>
        <div className="flex justify-between items-center">
          <p className="font-bold text-blue-200">{verse?.reference}</p>
          <button onClick={() => onNavigate('bible')} className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Study More</button>
        </div>
      </div>

      {latestSermon && (
        <section>
          <h3 className="font-black text-lg mb-4 dark:text-white flex items-center gap-2">
            <Film size={20} className="text-red-500" /> Latest Sermon
          </h3>
          <div onClick={() => onNavigate('sermons')} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border dark:border-slate-700 cursor-pointer transition active:scale-95">
            <div className="w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0 relative">
              {latestSermon.video_url && (
                <img
                  src={`https://img.youtube.com/vi/${getYouTubeID(latestSermon.video_url)}/hqdefault.jpg`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white"><Play size={24} fill="currentColor"/></div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate dark:text-white">{latestSermon.title}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{latestSermon.preacher}</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">{formatDate(latestSermon.date_preached)}</p>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg dark:text-white">Recent Articles</h3>
          <button onClick={() => onNavigate('blogs')} className="text-xs font-bold text-blue-600">View All</button>
        </div>
        <div className="space-y-4">
          {blogs.map(blog => (
            <div key={blog.id} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border dark:border-slate-700">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0">
                {blog.image_url && <img src={blog.image_url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase">{blog.category}</span>
                <h4 className="font-bold text-sm leading-tight mb-2 dark:text-white line-clamp-2">{blog.title}</h4>
                <div className="flex gap-2">
                  <button onClick={() => shareToWhatsApp(window.location.href, blog.title)} className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full"><MessageCircle size={14}/></button>
                  <button onClick={() => shareToFacebook(window.location.href)} className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full"><Facebook size={14}/></button>
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
const BIBLE_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];

export const BibleView = () => {
  const [activeTab, setActiveTab] = useState<'read' | 'plan'>('read');
  const [version, setVersion] = useState('kjv');
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const fetchChapter = async () => {
    setLoading(true);
    setAiInsight('');
    try {
      const res = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`);
      const data = await res.json();
      setContent(data.text);
    } catch (e) { setContent("Error loading chapter."); }
    setLoading(false);
  };

  useEffect(() => { fetchChapter(); }, [book, chapter, version]);

  const handleExplain = async () => {
    setExplaining(true);
    const insight = await explainVerse(content.slice(0, 500), `${book} ${chapter}`);
    setAiInsight(insight);
    setExplaining(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex p-2 bg-slate-100 dark:bg-slate-800 m-4 rounded-2xl">
        <button onClick={() => setActiveTab('read')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTab==='read' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}>Bible Reader</button>
        <button onClick={() => setActiveTab('plan')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTab==='plan' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}>1-Year Plan</button>
      </div>

      {activeTab === 'read' ? (
        <div className="flex-1 flex flex-col overflow-hidden px-4">
          <div className="flex gap-2 mb-4">
            <select value={book} onChange={e=>setBook(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-sm font-bold border-none outline-none dark:text-white">
              {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="number" value={chapter} onChange={e=>setChapter(parseInt(e.target.value))} className="w-20 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center font-bold dark:text-white" />
            <select value={version} onChange={e=>setVersion(e.target.value)} className="w-20 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs font-bold dark:text-white">
              <option value="kjv">KJV</option>
              <option value="web">WEB</option>
              <option value="asv">ASV</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-6 shadow-inner relative">
            {loading ? <div className="text-center py-20 text-slate-400">Opening the Word...</div> : (
              <div className="prose dark:prose-invert max-w-none font-serif leading-loose text-lg">
                <h2 className="text-2xl font-black mb-6 text-center text-blue-600">{book} {chapter}</h2>
                <p className="whitespace-pre-wrap">{content}</p>
                
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={handleExplain} 
                    disabled={explaining}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
                  >
                    {explaining ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white" /> : <Sparkles size={20}/>}
                    AI Pastoral Insights
                  </button>
                  {aiInsight && (
                    <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800 animate-fade-in">
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic">"{aiInsight}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-20">
          <div className="bg-blue-600 p-6 rounded-[2rem] text-white mb-6">
            <h3 className="text-xl font-black mb-2">1-Year Bible Plan</h3>
            <p className="text-sm opacity-80">Read through the entire Word of God this year.</p>
          </div>
          {[...Array(31)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 mb-2 rounded-2xl border dark:border-slate-700">
              <div>
                <p className="text-xs font-bold text-blue-600">DAY {i+1}</p>
                <p className="font-bold dark:text-white">Gen {i*2+1}-{i*2+2} & Matt {i+1}</p>
              </div>
              <button className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-200 hover:bg-blue-500 hover:border-blue-500 transition">
                <Check size={16}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- BLOG VIEW ---
export const BlogView = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const categories = ['All', 'Devotional', 'News', 'Youth', 'Family'];

  useEffect(() => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(r => setBlogs(r.data || []));
  }, []);

  const filtered = activeCat === 'All' ? blogs : blogs.filter(b => b.category === activeCat);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-black mb-6 dark:text-white">Church Blog</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCat(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCat === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white dark:bg-slate-800 text-slate-500 border dark:border-slate-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="space-y-6">
        {filtered.map(blog => (
          <div key={blog.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 group">
            <div className="relative h-56 overflow-hidden">
              <img src={blog.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest">{blog.category}</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black mb-2 dark:text-white leading-tight">{blog.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">{blog.excerpt}</p>
              <div className="flex justify-between items-center">
                <button className="text-blue-600 font-bold flex items-center gap-1 group/btn">
                  Read More <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1"/>
                </button>
                <div className="flex gap-2">
                  <button onClick={() => shareToWhatsApp(window.location.href, blog.title)} className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center transition active:scale-90"><MessageCircle size={18}/></button>
                  <button onClick={() => shareToFacebook(window.location.href)} className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center transition active:scale-90"><Facebook size={18}/></button>
                </div>
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
  const [activeTab, setActiveTab] = useState<'music' | 'podcast' | 'playlists'>('music');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.from('music_tracks').select('*').then(r => setTracks(r.data || []));
    // Fetch user playlists...
  }, []);

  const togglePlay = (track: MusicTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
      if (isPlaying) audioRef.current?.pause(); else audioRef.current?.play();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const filtered = activeTab === 'music' ? tracks.filter(t => t.type === 'MUSIC') : 
                  activeTab === 'podcast' ? tracks.filter(t => t.type === 'PODCAST') : [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar">
        {['music', 'podcast', 'playlists'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-3">
        {filtered.map(track => (
          <div key={track.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex items-center gap-4 border dark:border-slate-700 group transition hover:border-indigo-200">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 relative overflow-hidden">
               {currentTrack?.id === track.id && isPlaying ? (
                 <div className="flex items-end gap-0.5 h-6 animate-pulse">
                   <div className="w-1 bg-indigo-600 h-2"></div>
                   <div className="w-1 bg-indigo-600 h-6"></div>
                   <div className="w-1 bg-indigo-600 h-4"></div>
                 </div>
               ) : <Music size={24}/>}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm dark:text-white truncate">{track.title}</h4>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{track.artist}</p>
            </div>
            <button onClick={() => togglePlay(track)} className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center transition active:scale-90">
              {currentTrack?.id === track.id && isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" className="ml-0.5"/>}
            </button>
          </div>
        ))}
      </div>

      {currentTrack && (
        <div className="fixed bottom-20 left-4 right-4 bg-indigo-900 text-white p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-slide-up z-40 border border-white/10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Music size={20}/></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate">{currentTrack.title}</p>
            <p className="text-[10px] opacity-70 truncate">{currentTrack.artist}</p>
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-white text-indigo-900 rounded-full flex items-center justify-center">
            {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-0.5"/>}
          </button>
          <audio ref={audioRef} src={currentTrack.url} autoPlay={isPlaying} onEnded={() => setIsPlaying(false)} />
        </div>
      )}
    </div>
  );
};

// --- SERMONS VIEW ---
export const SermonsView = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    supabase.from('sermons').select('*').order('created_at', { ascending: false }).then(r => setSermons(r.data || []));
  }, []);

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black dark:text-white">Sermons</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
          <input 
            placeholder="Search sermons..." 
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 rounded-full text-sm outline-none border dark:border-slate-700 w-48"
            onChange={e=>setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {sermons.filter(s => s.title.toLowerCase().includes(filter.toLowerCase())).map(sermon => {
          const ytId = getYouTubeID(sermon.video_url);
          return (
            <div key={sermon.id} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border dark:border-slate-700 group transition hover:border-blue-500">
              <div className="w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0 relative">
                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Play size={24} fill="white" className="text-white"/></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm line-clamp-1 dark:text-white">{sermon.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1">{sermon.preacher}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{formatDate(sermon.date_preached)}</span>
                  <span className="text-[9px] font-bold text-slate-400">{sermon.duration}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- COMMUNITY VIEW ---
export const CommunityView = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    supabase.from('community_groups').select('*').then(r => setGroups(r.data || []));
  }, []);

  const handleJoin = async (id: string) => {
    // Logic for join request
    setGroups(groups.map(g => g.id === id ? {...g, status: 'Pending'} : g));
  };

  const loadPosts = async (groupId: string) => {
    supabase.from('group_posts').select('*, profiles(first_name, last_name, avatar_url)').eq('group_id', groupId).order('created_at', {ascending: false})
      .then(r => setPosts(r.data || []));
  };

  if (selectedGroup) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-20">
        <div className="p-4 flex items-center gap-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-10">
          <button onClick={() => setSelectedGroup(null)} className="p-2 -ml-2"><ArrowLeft/></button>
          <div className="flex-1">
            <h3 className="font-black text-lg leading-none dark:text-white">{selectedGroup.name}</h3>
            <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Group Chat Active</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {posts.map(post => (
            <div key={post.id} className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">{post.profiles?.first_name[0]}</div>
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm border dark:border-slate-700">
                  <p className="text-[10px] font-black text-blue-600 mb-1 uppercase">{post.profiles?.first_name} {post.profiles?.last_name}</p>
                  <p className="text-sm dark:text-slate-200">{post.content}</p>
                </div>
                <div className="flex gap-4 mt-2 px-1">
                  <button className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Heart size={12}/> Like</button>
                  <button className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MessageCircle size={12}/> Reply</button>
                  <span className="text-[10px] text-slate-300 ml-auto">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex gap-2">
          <input 
            value={newPost} 
            onChange={e=>setNewPost(e.target.value)} 
            placeholder="Write a message..." 
            className="flex-1 bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl text-sm outline-none dark:text-white"
          />
          <button onClick={() => {/* Submit logic */ loadPosts(selectedGroup.id); setNewPost(''); }} className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center"><Send size={20}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      <h2 className="text-2xl font-black mb-6 dark:text-white">Community Groups</h2>
      <div className="grid grid-cols-1 gap-4">
        {groups.map(group => (
          <div key={group.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border dark:border-slate-700">
            <h4 className="text-xl font-black mb-2 dark:text-white">{group.name}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{group.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Users size={16}/> {group.membersCount || 0} Members</span>
              {group.status === 'Pending' ? (
                <button className="bg-slate-100 dark:bg-slate-700 text-slate-400 px-6 py-2 rounded-full text-xs font-bold" disabled>Pending Approval</button>
              ) : group.status === 'Approved' ? (
                <button onClick={() => {setSelectedGroup(group); loadPosts(group.id);}} className="bg-green-600 text-white px-6 py-2 rounded-full text-xs font-bold">Enter Chat</button>
              ) : (
                <button onClick={() => handleJoin(group.id)} className="bg-blue-600 text-white px-8 py-2 rounded-full text-xs font-bold shadow-lg shadow-blue-200">Join Group</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- EVENTS VIEW ---
export const EventsView = ({ onBack }: { onBack: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    supabase.from('events').select('*').order('date', { ascending: true }).then(r => setEvents(r.data || []));
  }, []);

  const handleRSVP = async (id: string, status: string) => {
    // RSVP submission logic to Supabase
    setEvents(events.map(e => e.id === id ? {...e, rsvpStatus: status as any} : e));
  };

  return (
    <div className="p-4 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-6">
        <ArrowLeft size={20}/> Back
      </button>
      <h2 className="text-2xl font-black mb-6 dark:text-white">Church Events</h2>
      <div className="space-y-6">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border-l-8 border-l-blue-600 dark:border-slate-700 border-t border-r border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">{event.type}</span>
                <h3 className="text-xl font-black dark:text-white leading-tight">{event.title}</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-2xl text-center min-w-[60px]">
                <p className="text-xs font-black text-blue-600 uppercase">{new Date(event.date).toLocaleDateString('en-US', {month: 'short'})}</p>
                <p className="text-lg font-black text-blue-800 dark:text-blue-200">{new Date(event.date).getDate()}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <p className="text-xs text-slate-500 flex items-center gap-2"><Clock size={14}/> {event.time}</p>
              <p className="text-xs text-slate-500 flex items-center gap-2"><MapPin size={14}/> {event.location}</p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">{event.description}</p>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Will you be attending?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleRSVP(event.id, 'Yes')}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${event.rsvpStatus === 'Yes' ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                >Yes</button>
                <button 
                  onClick={() => handleRSVP(event.id, 'Maybe')}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${event.rsvpStatus === 'Maybe' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                >Maybe</button>
                <button 
                   onClick={() => handleRSVP(event.id, 'No')}
                   className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${event.rsvpStatus === 'No' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                >No</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PROFILE VIEW ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode }: any) => {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] text-center shadow-sm border dark:border-slate-700 relative">
        <button onClick={onLogout} className="absolute top-6 right-6 text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded-full"><LogOut size={20}/></button>
        <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-xl border-4 border-white dark:border-slate-900">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <h2 className="text-2xl font-black dark:text-white mb-1">{user?.firstName} {user?.lastName}</h2>
        <p className="text-sm text-slate-500 font-medium mb-6">{user?.email}</p>
        <div className="flex justify-center gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Role</p>
            <p className="text-xs font-bold dark:text-white">{user?.role}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Joined</p>
            <p className="text-xs font-bold dark:text-white">{new Date(user?.joinedDate).getFullYear()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b dark:border-slate-700">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Account Settings</h4>
        </div>
        <button onClick={toggleTheme} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-900 text-indigo-400' : 'bg-yellow-100 text-yellow-600'}`}>
              {isDarkMode ? <Moon size={20}/> : <Sun size={20}/>}
            </div>
            <span className="font-bold dark:text-white">Dark Mode</span>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </button>
        
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Bell size={20}/></div>
            <span className="font-bold dark:text-white">Mute Notifications</span>
          </div>
          <div className="w-12 h-6 bg-slate-200 rounded-full p-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
        </button>

        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl"><Phone size={20}/></div>
            <span className="font-bold dark:text-white">Contact Us</span>
          </div>
          <ChevronRight size={18} className="text-slate-300"/>
        </button>
      </div>
    </div>
  );
};

export const NotificationsView = () => (
  <div className="p-4">
    <h2 className="text-2xl font-black mb-6 dark:text-white">Notifications</h2>
    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-700">
      <Bell size={48} className="mx-auto text-slate-200 mb-4" />
      <p className="text-slate-400 font-bold">No new notifications</p>
    </div>
  </div>
);

export const ContactView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-4">
    <button onClick={onBack} className="mb-6 text-blue-600 font-bold flex items-center gap-2"><ArrowLeft size={20}/> Back</button>
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-10 rounded-[3rem] text-center text-white shadow-xl mb-6">
      <Logo className="w-24 h-24 mx-auto mb-6" />
      <h3 className="text-2xl font-black mb-2">Get in Touch</h3>
      <p className="opacity-80">We're here to serve our community.</p>
    </div>
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] flex items-center gap-4 border dark:border-slate-700">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600"><Phone size={24}/></div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone</p>
          <p className="font-bold dark:text-white">+27 (031) 123 4567</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] flex items-center gap-4 border dark:border-slate-700">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600"><Mail size={24}/></div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</p>
          <p className="font-bold dark:text-white">office@isipingocc.org</p>
        </div>
      </div>
    </div>
  </div>
);

const MapPin = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
