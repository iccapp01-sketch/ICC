import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Plus, Trash2, ArrowLeft, Moon, Sun, LogOut,
  BookOpen, Users, Music, Film, MessageSquare, Share2, Heart,
  Calendar, Check, X, ChevronRight, Search, Download, Instagram,
  Facebook, MessageCircle, Send, Sparkles, User as UserIcon, Bell, Phone, Mail,
  Clock, MapPin, MoreVertical, ListMusic, Mic, Globe, Loader2, Save
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

const shareMedia = async (url: string, title: string) => {
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
    }
  } catch (err) { console.warn("Share failed:", err); }
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
              <img src={`https://img.youtube.com/vi/${getYouTubeID(sermon.video_url)}/hqdefault.jpg`} className="w-full h-full object-cover" />
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
                <img src={blog.image_url} className="w-full h-full object-cover" />
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.from('music_tracks').select('*').then(r => setTracks(r.data || []));
  }, []);

  const toggleTrack = (track: MusicTrack) => {
    if (current?.id === track.id) {
      setIsPlaying(!isPlaying);
      if (isPlaying) audioRef.current?.pause(); else audioRef.current?.play();
    } else {
      setCurrent(track);
      setIsPlaying(true);
    }
  };

  const filtered = activeTab === 'music' ? tracks.filter(t => t.type === 'MUSIC') : 
                   activeTab === 'podcast' ? tracks.filter(t => t.type === 'PODCAST') : [];

  return (
    <div className="p-4 flex flex-col h-full pb-32">
      <h2 className="text-2xl font-black mb-6 dark:text-white">Media</h2>
      <div className="flex gap-2 mb-6">
        {['music', 'podcast', 'playlists'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3 overflow-y-auto">
        {filtered.map(track => (
          <div key={track.id} onClick={() => toggleTrack(track)} className={`p-4 rounded-3xl flex items-center gap-4 border dark:border-slate-700 cursor-pointer ${current?.id === track.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-white dark:bg-slate-800'}`}>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center text-blue-600">
              {current?.id === track.id && isPlaying ? <Pause size={20}/> : <Play size={20} fill="currentColor"/>}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm dark:text-white">{track.title}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-slide-up border dark:border-slate-700 z-40">
           <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Music size={20}/></div>
           <div className="flex-1 min-w-0">
             <p className="font-black text-sm dark:text-white truncate">{current.title}</p>
             <p className="text-[10px] text-slate-500 truncate">{current.artist}</p>
           </div>
           <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center dark:text-white">
             {isPlaying ? <Pause size={20}/> : <Play size={20} fill="currentColor"/>}
           </button>
           <audio ref={audioRef} src={current.url} autoPlay={isPlaying} onEnded={() => setIsPlaying(false)} />
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
    return (
      <div className="p-4 pb-20 animate-fade-in">
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-blue-600 font-bold mb-6"><ArrowLeft size={20}/> Back</button>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border dark:border-slate-700">
          <img src={selectedPost.image_url} className="w-full h-64 object-cover" />
          <div className="p-6 space-y-4">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedPost.category}</span>
            <h2 className="text-2xl font-black dark:text-white leading-tight">{selectedPost.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
              <UserIcon size={14}/> {selectedPost.author} • {formatDate(selectedPost.created_at)}
            </div>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {selectedPost.content}
            </div>
            {selectedPost.video_url && (
               <div className="mt-6">
                  <a href={selectedPost.video_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-bold text-sm dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Film size={18}/> Watch Attached Resource
                  </a>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-black mb-6 dark:text-white">Articles</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition ${category === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white dark:bg-slate-800 text-slate-500 border dark:border-slate-700'}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.length > 0 ? filtered.map(blog => (
          <div key={blog.id} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-[2.5rem] shadow-sm border dark:border-slate-700">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-3xl overflow-hidden flex-shrink-0">
              <img src={blog.image_url} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">{blog.category}</span>
              <h3 className="font-black text-sm dark:text-white line-clamp-2 leading-tight mb-2">{blog.title}</h3>
              <div className="flex gap-2">
                 <button onClick={() => shareMedia(window.location.href, blog.title)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full"><Share2 size={14}/></button>
                 <button onClick={() => setSelectedPost(blog)} className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase transition transform active:scale-95">Read More</button>
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

      // 1. Fetch groups
      const { data: groupsData } = await supabase.from('community_groups').select('*');
      
      // 2. Fetch memberships for current user - with fallback for missing table
      const { data: myMemberships, error: memError } = await supabase.from('group_memberships').select('*').eq('user_id', user.id);
      
      // 3. Fetch count of approved members for all groups - with fallback for missing table
      const { data: allApprovedMemberships, error: allMemError } = await supabase.from('group_memberships').select('group_id').eq('status', 'Approved');
      
      let finalMyMems = myMemberships || [];
      let finalAllMems = allApprovedMemberships || [];

      // Check for specific "Table not found" error to use local fallback
      if (memError?.message.includes('not found') || memError?.message.includes('schema cache') || 
          allMemError?.message.includes('not found') || allMemError?.message.includes('schema cache')) {
        const local = JSON.parse(localStorage.getItem(`icc_group_mems_${user.id}`) || '[]');
        finalMyMems = local;
        finalAllMems = local.filter((m: any) => m.status === 'Approved');
      }

      if (groupsData) {
        const formatted = groupsData.map(g => {
          const userMem = finalMyMems.find((m: any) => m.group_id === g.id);
          const groupMems = finalAllMems.filter((m: any) => m.group_id === g.id);
          
          return {
            ...g,
            membersCount: (g.membersCount || 0) + (groupMems?.length || 0),
            status: userMem ? userMem.status : 'None',
            isMember: userMem?.status === 'Approved'
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
    if (g.status !== 'Approved') return alert("Access pending admin approval.");
    setSelected(g);
    supabase.from('group_posts').select('*, profiles(first_name, last_name)').eq('group_id', g.id).order('created_at', { ascending: false })
      .then(r => setPosts(r.data || []));
  };

  const handleJoin = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Please sign in to join groups.");

      setIsJoining(groupId);
      
      // Attempt join request via Supabase
      const { error } = await supabase.from('group_memberships').upsert({ 
        group_id: groupId, 
        user_id: user.id, 
        status: 'Pending' 
      }, { onConflict: 'group_id,user_id' });

      // If table is missing from DB, fallback to local persistence
      if (error && (error.message.includes('not found') || error.message.includes('schema cache'))) {
         const local = JSON.parse(localStorage.getItem(`icc_group_mems_${user.id}`) || '[]');
         if (!local.find((m: any) => m.group_id === groupId)) {
            local.push({ group_id: groupId, user_id: user.id, status: 'Pending' });
            localStorage.setItem(`icc_group_mems_${user.id}`, JSON.stringify(local));
         }
      } else if (error) {
          throw error;
      }
      
      await fetchGroupsData(); // Refresh statuses and counts
    } catch (err: any) {
      console.error("Join error:", err);
      // Even if generic error, let's try local fallback to keep the app functional
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const local = JSON.parse(localStorage.getItem(`icc_group_mems_${user.id}`) || '[]');
        if (!local.find((m: any) => m.group_id === groupId)) {
           local.push({ group_id: groupId, user_id: user.id, status: 'Pending' });
           localStorage.setItem(`icc_group_mems_${user.id}`, JSON.stringify(local));
           await fetchGroupsData();
        }
      }
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
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 uppercase">{post.profiles?.first_name[0]}</div>
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-8:0 p-3 rounded-2xl rounded-tl-none border dark:border-slate-700 shadow-sm">
                  <p className="text-[10px] font-black text-blue-600 uppercase">{post.profiles?.first_name} {post.profiles?.last_name}</p>
                  <p className="text-sm dark:text-slate-200">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white dark:bg-slate-8:0 border-t dark:border-slate-700 flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl text-sm outline-none dark:text-white" />
          <button className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center"><Send size={20}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-black mb-6 dark:text-white">Community Groups</h2>
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
                    {g.membersCount} {g.membersCount === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
                {g.status === 'Pending' && <span className="text-[8px] font-black text-orange-500 uppercase mt-2 animate-pulse tracking-widest">Approval Requested</span>}
              </div>
              
              {g.status === 'Approved' ? (
                <button onClick={() => openGroup(g)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Enter Chat</button>
              ) : (
                <button 
                  disabled={g.status === 'Pending' || isJoining === g.id}
                  onClick={() => handleJoin(g.id)} 
                  className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2 ${g.status === 'Pending' ? 'bg-slate-100 text-slate-400 cursor-not-allowed border dark:border-slate-700 dark:bg-slate-900' : 'bg-[#0c2d58] text-white hover:bg-blue-900'}`}
                >
                  {isJoining === g.id ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isJoining === g.id ? 'Joining...' : g.status === 'Pending' ? 'Requested' : 'Join Group'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {groups.length === 0 && (
         <div className="py-20 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
            <Users className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={48}/>
            <p className="text-slate-400 font-bold uppercase tracking-widest">No active groups found</p>
         </div>
      )}
    </div>
  );
};

// --- EVENTS PAGE ---
export const EventsView = ({ onBack }: { onBack: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from('events').select('*').order('date', { ascending: true }).then(r => setEvents(r.data || []));
  }, []);

  const handleRsvp = (id: string, status: 'Yes' | 'No' | 'Maybe') => {
    setEvents(events.map(e => e.id === id ? { ...e, rsvpStatus: status } : e));
    if (savedIds.has(id)) {
        const newSaved = new Set(savedIds);
        newSaved.delete(id);
        setSavedIds(newSaved);
    }
  };

  const handleTransportSelection = (id: string, needsTransport: 'Yes' | 'No') => {
    setEvents(events.map(e => e.id === id ? { ...e, transportStatus: needsTransport } as any : e));
    if (savedIds.has(id)) {
        const newSaved = new Set(savedIds);
        newSaved.delete(id);
        setSavedIds(newSaved);
    }
  };

  const handleSaveRsvp = (id: string) => {
    setSavingId(id);
    setTimeout(() => {
        setSavedIds(prev => new Set(prev).add(id));
        setSavingId(null);
    }, 1000);
  };

  return (
    <div className="p-4 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-6"><ArrowLeft size={20}/> Back</button>
      <h2 className="text-2xl font-black mb-6 dark:text-white">Church Events</h2>
      <div className="space-y-6">
        {events.map(e => (
          <div key={e.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border-l-8 border-l-blue-600 dark:border-slate-700 border-t border-r border-b animate-fade-in">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">{e.type}</span>
            <h3 className="text-xl font-black mb-2 dark:text-white">{e.title}</h3>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-2"><Clock size={14}/> {e.date} • {e.time}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{e.description}</p>
            
            {e.type === 'EVENT' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                   {['Yes', 'No', 'Maybe'].map(opt => (
                     <button 
                        key={opt} 
                        onClick={() => handleRsvp(e.id, opt as any)}
                        className={`flex-1 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${e.rsvpStatus === opt ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:border-slate-600 hover:bg-slate-100'}`}
                     >
                       {opt}
                     </button>
                   ))}
                </div>

                {e.rsvpStatus === 'Yes' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex flex-col gap-3 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Need Transport?</span>
                        <div className="flex gap-2">
                           {['Yes', 'No'].map(tOpt => (
                             <button 
                                key={tOpt}
                                onClick={() => handleTransportSelection(e.id, tOpt as any)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${(e as any).transportStatus === tOpt ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border dark:border-slate-700'}`}
                             >
                               {tOpt}
                             </button>
                           ))}
                        </div>
                     </div>
                     <p className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter">* Transport details will be sent via SMS once confirmed.</p>
                  </div>
                )}

                {e.rsvpStatus && e.rsvpStatus !== 'None' && (
                   <div className="pt-2 animate-fade-in">
                      <button 
                        disabled={savingId === e.id || savedIds.has(e.id)}
                        onClick={() => handleSaveRsvp(e.id)}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${savedIds.has(e.id) ? 'bg-green-600 text-white' : 'bg-[#0c2d58] text-white hover:bg-blue-900 active:scale-95'}`}
                      >
                         {savingId === e.id ? <Loader2 className="animate-spin" size={20}/> : savedIds.has(e.id) ? <Check size={20}/> : <Save size={20}/>}
                         {savingId === e.id ? 'Saving...' : savedIds.has(e.id) ? 'RSVP Confirmed' : 'Save RSVP Selection'}
                      </button>
                   </div>
                )}
              </div>
            )}
          </div>
        ))}
        {events.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            No upcoming events or announcements
          </div>
        )}
      </div>
    </div>
  );
};

// --- PROFILE PAGE ---
export const ProfileView = ({ user, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] text-center shadow-sm border dark:border-slate-700 relative">
        <button onClick={onLogout} className="absolute top-6 right-6 text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded-full"><LogOut size={20}/></button>
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
        <h2 className="text-2xl font-black dark:text-white">{user?.firstName} {user?.lastName}</h2>
        <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
        <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{user?.role}</span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 overflow-hidden shadow-sm">
        <button onClick={toggleTheme} className="w-full flex items-center justify-between p-5 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <div className="flex items-center gap-4 dark:text-white"><Sun size={20}/> <span className="font-bold">Light / Dark Mode</span></div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div></div>
        </button>
        <button className="w-full flex items-center gap-4 p-5 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition dark:text-white">
          <Bell size={20}/> <span className="font-bold">Mute Notifications</span>
        </button>
        <button onClick={() => onNavigate('contact')} className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-700 transition dark:text-white">
          <Phone size={20}/> <span className="font-bold">Contact Us</span>
        </button>
      </div>
    </div>
  );
};

// --- STUB VIEWS (Required by switch) ---
export const SermonsView = () => (
  <div className="p-4 space-y-6">
    <h2 className="text-2xl font-black mb-6 dark:text-white">Sermon Library</h2>
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400">
      Search and play full sermons coming in next update.
    </div>
  </div>
);

export const NotificationsView = () => (
  <div className="p-4"><h2 className="text-2xl font-black mb-6 dark:text-white">Notifications</h2><p className="text-slate-400 text-center py-20">No new messages.</p></div>
);

export const ContactView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-4"><button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-6"><ArrowLeft size={20}/> Back</button><h2 className="text-2xl font-black dark:text-white">Contact Us</h2></div>
);