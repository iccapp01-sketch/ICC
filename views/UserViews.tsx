
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, ChevronUp, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video, UserPlus, Mic, Volume2, Link as LinkIcon, Copy, Info,
  Edit2, Save, Sun, Check, ArrowRight, Bookmark as BookmarkIcon, Film, MessageSquare, Reply, Facebook, Instagram, Loader2, Lock, ThumbsDown
} from 'lucide-react';
import { BlogPost, Sermon, CommunityGroup, GroupPost, BibleVerse, Event, MusicTrack, Playlist, User as UserType, Notification, Reel } from '../types';
import { supabase } from '../lib/supabaseClient';
import { explainVerse } from '../services/geminiService';

const getYouTubeID = (url: string) => { 
    if (!url) return null; 
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null; 
};

// --- HOME VIEW ---
export const HomeView = ({ onNavigate }: any) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);

  useEffect(() => {
     fetch('https://corsproxy.io/?' + encodeURIComponent('https://bible-api.com/philippians+4:13'))
       .then(res => res.json())
       .then(data => setVerse({ reference: data.reference, text: data.text, version: 'WEB' }))
       .catch(() => setVerse({ reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me.", version: "KJV" }));

     const fetchSermon = async () => {
         const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false }).limit(1).single();
         if(data) setLatestSermon(data as any);
     };

     const fetchBlogs = async () => {
         const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3);
         if(data) setLatestBlogs(data.map((b: any) => ({...b, image: b.image_url})));
     };

     const fetchReels = async () => {
         const { data } = await supabase.from('reels').select('*').order('created_at', { ascending: false }).limit(3);
         if(data) setReels(data as any);
     };

     fetchSermon();
     fetchBlogs();
     fetchReels();
  }, []);

  const handleShareReel = async (reel: Reel, platform: string) => {
      const shareText = `${reel.title}\n\n${reel.description || ''}`;
      const shareUrl = reel.embed_url || reel.video_url || window.location.href;
      
      if (platform === 'whatsapp') {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      } else if (platform === 'facebook') {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      } else if (platform === 'instagram') {
          if (navigator.clipboard) {
              navigator.clipboard.writeText(shareUrl);
              alert("Link copied! Open Instagram to share.");
          }
      } else {
          if (navigator.share) {
              try {
                  await navigator.share({
                      title: reel.title,
                      text: shareText,
                      url: shareUrl
                  });
              } catch (err) {
                  console.log("Share cancelled or failed:", err);
              }
          }
      }
  };

  return (
      <div className="p-4 space-y-6 pb-24">
          <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={120} /></div>
             <div className="relative z-10">
                 <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Verse of the Day</span>
                 <p className="text-xl font-serif leading-relaxed mb-4">"{verse?.text}"</p>
                 <p className="font-bold text-blue-200">{verse?.reference}</p>
             </div>
          </div>

          {latestSermon && (
              <div>
                  <h3 className="font-bold text-lg dark:text-white mb-4">Latest Sermon</h3>
                  <div onClick={() => onNavigate('sermons')} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 cursor-pointer">
                      <div className="w-24 h-24 bg-slate-200 rounded-xl bg-cover bg-center flex-shrink-0 relative" style={{ backgroundImage: latestSermon.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(latestSermon.videoUrl ?? "")}/default.jpg)` : 'none' }}>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl"><Play fill="white" className="text-white"/></div>
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">{latestSermon.title}</h4>
                          <p className="text-xs text-slate-500 mb-2">{latestSermon.preacher}</p>
                      </div>
                  </div>
              </div>
          )}

          {latestBlogs.length > 0 && (
              <div>
                  <h3 className="font-bold text-lg dark:text-white mb-4">Latest Articles</h3>
                  <div className="space-y-4">
                      {latestBlogs.map(blog => (
                          <div key={blog.id} onClick={() => onNavigate('blogs')} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer">
                              {blog.image && <div className="h-32 w-full bg-cover bg-center rounded-xl mb-3" style={{backgroundImage: `url(${blog.image})`}}></div>}
                              <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{blog.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2">{blog.excerpt}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {reels.length > 0 && (
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg dark:text-white">Latest Reels</h3>
                      <button onClick={()=>onNavigate('sermons')} className="text-xs text-blue-600 font-bold">View All</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                      {reels.map(reel => (
                          <div key={reel.id} className="min-w-[180px] w-[180px] relative rounded-2xl overflow-hidden shadow-lg aspect-[9/16] bg-black group">
                              {reel.embed_url ? (
                                  <iframe 
                                      src={reel.embed_url} 
                                      className="w-full h-full pointer-events-none" 
                                      allowFullScreen
                                      title={reel.title}
                                  ></iframe>
                              ) : (
                                  <video 
                                      src={reel.video_url} 
                                      poster={reel.thumbnail} 
                                      className="w-full h-full object-cover" 
                                      controls 
                                      playsInline
                                      preload="metadata"
                                  />
                              )}
                              
                              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10">
                                  <h4 className="text-white font-bold text-xs line-clamp-2 mb-8">{reel.title}</h4>
                              </div>
                              <div className="absolute bottom-2 right-2 flex gap-1 z-20 pointer-events-auto">
                                  <button onClick={() => handleShareReel(reel, 'whatsapp')} className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow"><MessageCircle size={12} /></button>
                                  <button onClick={() => handleShareReel(reel, 'facebook')} className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow"><Facebook size={12} /></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );
};

// --- BIBLE VIEW ---
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

export const BibleView = () => {
    const [book, setBook] = useState('John');
    const [chapter, setChapter] = useState(1);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'read' | 'plan'>('read');
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    useEffect(() => {
        fetchText();
        setExplanation('');
    }, [book, chapter]);

    const fetchText = async () => {
        setLoading(true);
        try {
            const encodedBook = encodeURIComponent(book);
            const res = await fetch(`https://corsproxy.io/?` + encodeURIComponent(`https://bible-api.com/${encodedBook}+${chapter}`));
            const data = await res.json();
            setText(data.text || "Text not found.");
        } catch (e) {
            setText("Could not fetch scripture. Please check internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleExplain = async () => {
        if (!text) return;
        setIsExplaining(true);
        try {
            const insight = await explainVerse(text, `${book} ${chapter}`);
            setExplanation(insight);
        } catch (e) {
            setExplanation("Sorry, I couldn't generate an insight right now.");
        } finally {
            setIsExplaining(false);
        }
    };

    const handleNext = () => setChapter(c => c + 1);
    const handlePrev = () => setChapter(c => Math.max(1, c - 1));

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
             <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10 sticky top-0 shadow-sm">
                 <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                     <button onClick={()=>setActiveTab('read')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab==='read' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Scripture</button>
                     <button onClick={()=>setActiveTab('plan')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab==='plan' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Reading Plan</button>
                 </div>
             </div>
             
             {activeTab === 'read' && (
                 <div className="flex flex-col flex-1 overflow-hidden relative">
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm z-10">
                        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronDown size={16} className="rotate-90"/></button>
                        <div className="flex-1 flex gap-2">
                            <select className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg text-sm font-bold" value={book} onChange={e => { setBook(e.target.value); setChapter(1); }}>{BIBLE_BOOKS.map(b=><option key={b} value={b}>{b}</option>)}</select>
                            <select className="w-20 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg text-sm font-bold text-center" value={chapter} onChange={e=>setChapter(parseInt(e.target.value))}>{[...Array(150)].map((_,i)=><option key={i+1} value={i+1}>Ch {i+1}</option>)}</select>
                        </div>
                        <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronRight size={16}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 scroll-smooth pb-32">
                         <div className="max-w-xl mx-auto">
                             <h2 className="text-xl font-bold text-center mb-6 text-slate-400 uppercase tracking-widest">{book} {chapter}</h2>
                             {loading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : <p className="text-lg leading-loose font-serif whitespace-pre-wrap text-slate-800 dark:text-slate-200">{text}</p>}
                             
                             <div className="mt-8 flex justify-center">
                                 {isExplaining ? (
                                     <button disabled className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                         <Loader2 size={16} className="animate-spin"/> Analyzing Scripture...
                                     </button>
                                 ) : !explanation ? (
                                     <button onClick={handleExplain} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none hover:scale-105 transition">
                                         <Sparkles size={16}/> Get AI Insight
                                     </button>
                                 ) : null}
                             </div>

                             {explanation && (
                                 <div className="mt-6 bg-blue-50 dark:bg-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700 animate-fade-in relative">
                                     <div className="flex items-center justify-between mb-3">
                                         <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm uppercase tracking-wide">
                                             <Sparkles size={16}/> Insight
                                         </div>
                                         <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(explanation);
                                                alert("Insight copied!");
                                            }}
                                            className="text-slate-400 hover:text-blue-600 transition"
                                         >
                                             <Copy size={14}/>
                                         </button>
                                     </div>
                                     <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                         {explanation}
                                     </p>
                                     <div className="mt-4 flex justify-end">
                                         <button onClick={()=>setExplanation('')} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Close</button>
                                     </div>
                                 </div>
                             )}
                             <div className="mt-12 flex justify-center pb-8"><button onClick={handleNext} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">Next Chapter <ArrowRight size={16}/></button></div>
                         </div>
                    </div>
                 </div>
             )}
             {activeTab === 'plan' && (
                 <div className="flex-1 p-8 text-center text-slate-500">Reading Plans Coming Soon</div>
             )}
        </div>
    );
};

// --- EVENTS VIEW ---
export const EventsView = ({ onBack }: any) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [myRsvps, setMyRsvps] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const fetchEvents = async () => { 
            const { data } = await supabase.from('events').select('*').order('date', { ascending: true }); 
            if(data) setEvents(data as any); 
        };
        fetchEvents();
    }, []);

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Events & Announcements</h1>
            {events.length === 0 && <p className="text-slate-500 text-center">No upcoming events.</p>}
            {events.map(ev => (
                <div key={ev.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-6 border dark:border-slate-700 shadow-sm">
                    <div className="mb-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${ev.type === 'ANNOUNCEMENT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{ev.type === 'ANNOUNCEMENT' ? 'Announcement' : 'Event'}</span></div>
                    {ev.image && <div className="h-32 bg-cover bg-center rounded-2xl mb-4" style={{backgroundImage: `url(${ev.image})`}}></div>}
                    <h3 className="text-lg font-bold dark:text-white mb-2 leading-tight">{ev.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{ev.description}</p>
                </div>
            ))}
        </div>
    );
};

// --- MUSIC VIEW ---
export const MusicView = () => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const fetchTracks = async () => { const { data } = await supabase.from('music_tracks').select('*'); if(data) setTracks(data as any); };
        fetchTracks();
    }, []);

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Music</h1>
            {tracks.map(track => (
                 <div key={track.id} onClick={()=>setCurrentTrack(track)} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-2xl mb-2 cursor-pointer border border-slate-100 dark:border-slate-700">
                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Music size={18}/></div>
                     <div className="flex-1"><h4 className="font-bold text-sm dark:text-white">{track.title}</h4><p className="text-xs text-slate-500">{track.artist}</p></div>
                 </div>
            ))}
            {currentTrack && (
                <div className="fixed bottom-20 left-4 right-4 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg z-50">
                    <div><p className="font-bold text-sm">{currentTrack.title}</p><p className="text-xs text-slate-400">{currentTrack.artist}</p></div>
                    <audio ref={audioRef} src={currentTrack.url} controls autoPlay className="h-8 w-32"/>
                </div>
            )}
        </div>
    );
};

// --- SERMONS VIEW ---
export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    useEffect(() => {
         const fetchSermons = async () => {
             const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
             if(data) setSermons(data as any);
         };
         fetchSermons();
    }, []);

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Sermons</h1>
            <div className="grid gap-6">
                {sermons.map(s => (
                    <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="h-48 bg-slate-200 bg-cover bg-center relative" style={{ backgroundImage: s.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(s.videoUrl ?? "")}/mqdefault.jpg)` : 'none' }}>
                            <a href={s.videoUrl} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/20"><Play fill="white" className="text-white"/></a>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{s.title}</h3>
                            <p className="text-xs text-slate-500">{s.preacher} • {s.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- BLOG VIEW ---
export const BlogView = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

    useEffect(() => {
        const fetchBlogs = async () => {
             const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
             if(data) setBlogs(data.map((b: any) => ({...b, image: b.image_url})));
        };
        fetchBlogs();
    }, []);

    if (selectedBlog) {
        return (
            <div className="bg-white dark:bg-slate-900 min-h-full pb-24 p-4">
                <button onClick={()=>setSelectedBlog(null)} className="mb-4 flex items-center gap-2 text-slate-500 font-bold text-sm"><ArrowLeft size={16}/> Back</button>
                <h1 className="text-2xl font-black mb-2 dark:text-white">{selectedBlog.title}</h1>
                <p className="text-xs text-slate-500 mb-4">{selectedBlog.author} • {new Date(selectedBlog.date).toLocaleDateString()}</p>
                <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap">{selectedBlog.content}</div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Articles</h1>
            <div className="grid gap-6">
                {blogs.map(blog => (
                    <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="cursor-pointer bg-white dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700">
                        <h3 className="font-bold text-lg dark:text-white mb-1">{blog.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{blog.excerpt}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- CONTACT VIEW ---
export const ContactView = ({ onBack }: { onBack: () => void }) => (
    <div className="p-4 pb-24 min-h-full bg-white dark:bg-slate-900">
         <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-sm"><ArrowLeft size={16}/> Back to Profile</button>
         <h1 className="text-2xl font-black mb-6 dark:text-white">Contact Us</h1>
         <div className="space-y-4">
             <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl"><p className="font-bold dark:text-white">Email</p><p className="text-sm text-slate-500">info@isipingochurch.com</p></div>
             <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl"><p className="font-bold dark:text-white">Phone</p><p className="text-sm text-slate-500">+27 12 345 6789</p></div>
         </div>
    </div>
);

// --- PROFILE VIEW ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
    if(!user) return <div className="p-4 text-center">Please log in.</div>;
    return (
        <div className="p-4 pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black dark:text-white">My Profile</h1>
                <button onClick={onLogout} className="text-red-500 font-bold text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg flex items-center gap-2"><LogOut size={16}/> Logout</button>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 mb-3">
                     {user.firstName[0]}{user.lastName[0]}
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="space-y-4">
                 <button onClick={toggleTheme} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                     <span className="font-bold text-slate-700 dark:text-white">Dark Mode</span>
                     <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-5' : ''}`}></div></div>
                 </button>
                 <button onClick={() => onNavigate('contact')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                     <span className="font-bold text-slate-700 dark:text-white">Contact Us</span>
                     <ChevronRight size={16} className="text-slate-400"/>
                 </button>
            </div>
        </div>
    );
};

// --- NOTIFICATIONS VIEW ---
export const NotificationsView = () => (
    <div className="p-4 pb-24"><h1 className="text-2xl font-black mb-6 dark:text-white">Notifications</h1><p className="text-center text-slate-500">No new notifications.</p></div>
);

// --- GROUP CHAT (UPDATED THREAD SYSTEM) ---
export const GroupChat = ({ group, onBack }: { group: CommunityGroup, onBack: () => void }) => {
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [newPostText, setNewPostText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null); // postId
    const [replyText, setReplyText] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();

        const fetchPosts = async () => {
            const { data } = await supabase
                .from('group_posts')
                .select('*, profiles(first_name, last_name, avatar_url), group_post_likes(user_id)')
                .eq('group_id', group.id)
                .order('created_at', { ascending: true });
            
            if (data) {
                setPosts(data as any);
            }
        };
        
        fetchPosts();
        
        const channel = supabase.channel('group_chat_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_posts', filter: `group_id=eq.${group.id}` }, () => {
            fetchPosts(); 
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_post_likes' }, () => {
            fetchPosts(); 
        })
        .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [group.id]);

    const handleLike = async (postId: string, isLiked: boolean) => {
        if (!userId) return;
        
        if (isLiked) {
            await supabase.from('group_post_likes').delete().match({ post_id: postId, user_id: userId });
        } else {
            await supabase.from('group_post_likes').insert({ post_id: postId, user_id: userId });
        }
    };

    const handleSend = async (parentId: string | null = null) => {
        const content = parentId ? replyText : newPostText;
        if (!content.trim() || !userId) return;

        const { error } = await supabase.from('group_posts').insert({
            group_id: group.id,
            user_id: userId,
            content: content,
            parent_id: parentId
        });

        if (!error) {
            if (parentId) {
                setReplyText('');
                setReplyingTo(null);
            } else {
                setNewPostText('');
                // Scroll to bottom only for main posts
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
        } else {
            alert("Failed to post. You might have been removed from this group.");
            onBack(); // Exit if permission denied (likely removed)
        }
    };

    const rootPosts = posts.filter(p => !p.parent_id);

    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 absolute inset-0 z-50">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-4 border-b dark:border-slate-700 flex items-center gap-3 shadow-sm z-10 sticky top-0">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><ArrowLeft size={20} className="text-slate-600 dark:text-slate-300"/></button>
                <div className="flex items-center gap-3">
                    {group.image ? (
                        <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{backgroundImage: `url(${group.image})`}}></div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{group.name.substring(0,1)}</div>
                    )}
                    <div>
                        <h2 className="font-bold text-sm dark:text-white leading-none">{group.name}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{group.membersCount || 0} Members</p>
                    </div>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
                {rootPosts.length === 0 && (
                    <div className="text-center py-20 opacity-60">
                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-300"/>
                        <p className="text-slate-500 font-medium">No posts yet.</p>
                        <p className="text-xs text-slate-400">Be the first to share something!</p>
                    </div>
                )}
                
                {rootPosts.map(post => {
                    const likes = post.group_post_likes || [];
                    const isLiked = userId ? likes.some((l: any) => l.user_id === userId) : false;
                    const replies = posts.filter(p => p.parent_id === post.id);

                    return (
                        <div key={post.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            {/* Author Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs overflow-hidden">
                                    {post.profiles?.avatar_url ? (
                                        <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        post.profiles?.first_name?.[0] || 'U'
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{post.profiles?.first_name} {post.profiles?.last_name}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-slate-800 dark:text-slate-200 text-sm mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                            {/* Actions Stats */}
                            <div className="flex justify-between items-center text-xs text-slate-500 mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                {likes.length > 0 && <span className="flex items-center gap-1"><ThumbsUp size={10} className="bg-blue-500 text-white p-0.5 rounded-full w-4 h-4"/> {likes.length}</span>}
                                {replies.length > 0 && <span className="ml-auto">{replies.length} replies</span>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleLike(post.id, isLiked)}
                                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition ${isLiked ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <ThumbsUp size={16} className={isLiked ? "fill-current" : ""} />
                                    Like
                                </button>
                                <button 
                                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                    className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    <MessageSquare size={16} />
                                    Reply
                                </button>
                            </div>

                            {/* Replies Section */}
                            <div className="mt-3 space-y-3">
                                {replies.map(reply => (
                                    <div key={reply.id} className="flex gap-2 pl-2">
                                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {reply.profiles?.first_name?.[0]}
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-2.5 flex-1">
                                            <p className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">{reply.profiles?.first_name} {reply.profiles?.last_name}</p>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{reply.content}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Reply Input */}
                                {replyingTo === post.id && (
                                    <div className="flex gap-2 items-center mt-3 pl-2 animate-fade-in">
                                        <div className="w-6 h-6 bg-slate-200 rounded-full flex-shrink-0"></div>
                                        <div className="flex-1 relative">
                                            <input 
                                                autoFocus
                                                className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-full px-4 py-2 text-xs dark:text-white focus:ring-1 focus:ring-blue-500 outline-none pr-10"
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSend(post.id)}
                                            />
                                            <button 
                                                onClick={() => handleSend(post.id)}
                                                disabled={!replyText.trim()}
                                                className="absolute right-1 top-1 p-1 bg-blue-600 text-white rounded-full disabled:opacity-50 hover:bg-blue-700 transition"
                                            >
                                                <Send size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Main Input Area */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t dark:border-slate-700 fixed bottom-0 w-full z-50">
                <div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-700 rounded-2xl px-2 py-1">
                    <input 
                        className="flex-1 bg-transparent border-none text-sm dark:text-white focus:outline-none px-3 py-3"
                        placeholder="Write a comment..."
                        value={newPostText}
                        onChange={e => setNewPostText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    />
                    <button 
                        onClick={() => handleSend()} 
                        disabled={!newPostText.trim()}
                        className="bg-blue-600 text-white p-2 rounded-xl shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Send size={18}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMMUNITY VIEW ---
export const CommunityView = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
    const [myMemberships, setMyMemberships] = useState<Record<string, string>>({}); // group_id -> status

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        // Fetch Groups
        const { data: groupsData } = await supabase.from('community_groups').select('*');
        if (groupsData) setGroups(groupsData as any);

        // Fetch User's Memberships
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: membersData } = await supabase
                .from('community_group_members')
                .select('group_id, status')
                .eq('user_id', user.id);
            
            if (membersData) {
                const membershipMap: Record<string, string> = {};
                membersData.forEach((m: any) => {
                    membershipMap[m.group_id] = m.status;
                });
                setMyMemberships(membershipMap);
            }
        }
    };

    const handleJoin = async (groupId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please login to join groups.");
        
        const { error } = await supabase.from('community_group_members').insert({
            group_id: groupId,
            user_id: user.id,
            status: 'Pending' // Explicitly set to Pending
        });
        
        if (error) {
            alert(error.message);
        } else {
            // Update local state immediately for UI feedback
            setMyMemberships({ ...myMemberships, [groupId]: 'Pending' });
            alert("Request sent! Pending approval.");
        }
    };

    const handleView = (group: CommunityGroup) => {
        const status = myMemberships[group.id];
        if (status === 'Approved') {
            setSelectedGroup(group);
        } else if (status === 'Pending') {
            alert("Your membership is still pending approval.");
        } else {
            // Should not happen if UI is correct, but safe fallback
            alert("You must join this group first.");
        }
    };

    if (selectedGroup) {
        return <GroupChat group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
    }

    return (
        <div className="p-4 pb-24 space-y-6">
            <h1 className="text-2xl font-black dark:text-white">Community Groups</h1>
             <div className="grid gap-4">
                 {groups.map(group => {
                     const status = myMemberships[group.id]; // 'Pending', 'Approved', or undefined
                     const isMember = status === 'Approved';
                     const isPending = status === 'Pending';

                     return (
                        <div key={group.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex gap-4 mb-3">
                                {group.image ? (
                                    <div className="w-16 h-16 rounded-xl bg-cover bg-center" style={{backgroundImage: `url(${group.image})`}}></div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">{group.name.substring(0,1)}</div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">{group.name}</h3>
                                    <p className="text-xs text-slate-500">{group.membersCount || 0} Members</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{group.description}</p>
                            
                            <div className="flex gap-2">
                                {isMember ? (
                                    // User is fully approved
                                    <button 
                                        onClick={() => handleView(group)} 
                                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-none"
                                    >
                                        Enter Group <ArrowRight size={14}/>
                                    </button>
                                ) : isPending ? (
                                    // User is pending approval
                                    <button 
                                        disabled
                                        className="flex-1 bg-orange-100 text-orange-600 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                                    >
                                        <Lock size={14}/> Pending Approval
                                    </button>
                                ) : (
                                    // User has not joined yet
                                    <button 
                                        onClick={() => handleJoin(group.id)} 
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition"
                                    >
                                        Join Group
                                    </button>
                                )}
                            </div>
                        </div>
                     );
                 })}
             </div>
        </div>
    );
};
