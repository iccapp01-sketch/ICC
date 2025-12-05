
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video
} from 'lucide-react';
import { BlogPost, Sermon, CommunityGroup, GroupPost, GroupComment, BibleVerse, Event, MusicTrack, Playlist, User as UserType, Notification } from '../types';
import { supabase } from '../lib/supabaseClient';

const getYouTubeID = (url: string) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };

// --- HOME VIEW ---
export const HomeView = ({ onNavigate }: any) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
     // Fetch Verse of Day
     fetch('https://bible-api.com/philippians+4:13')
       .then(res => res.json())
       .then(data => setVerse({ reference: data.reference, text: data.text, version: 'WEB' }))
       .catch(() => setVerse({ reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me.", version: "KJV" }));

     // Fetch Latest Sermon
     const fetchSermon = async () => {
         const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false }).limit(1).single();
         if(data) setLatestSermon(data as any);
     };
     
     // Fetch Events
     const fetchEvents = async () => {
         const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(2);
         if(data) setEvents(data as any);
     }

     fetchSermon();
     fetchEvents();
  }, []);

  return (
      <div className="p-4 space-y-6 pb-24">
          {/* Verse of the Day Hero */}
          <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={120} /></div>
             <div className="relative z-10">
                 <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Verse of the Day</span>
                 <p className="text-xl font-serif leading-relaxed mb-4">"{verse?.text}"</p>
                 <p className="font-bold text-blue-200">{verse?.reference}</p>
                 <div className="flex gap-4 mt-6">
                    <button className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100"><Heart size={18}/> Like</button>
                    <button className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100"><Share2 size={18}/> Share</button>
                 </div>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
              <button onClick={() => onNavigate('bible')} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-600 dark:text-blue-300"><BookOpen size={20}/></div>
                  <span className="text-[10px] font-bold">Bible</span>
              </button>
              <button onClick={() => onNavigate('sermons')} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full text-purple-600 dark:text-purple-300"><Video size={20}/></div>
                  <span className="text-[10px] font-bold">Watch</span>
              </button>
              <button onClick={() => onNavigate('media')} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full text-orange-600 dark:text-orange-300"><Music size={20}/></div>
                  <span className="text-[10px] font-bold">Listen</span>
              </button>
              <button onClick={() => onNavigate('events')} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full text-green-600 dark:text-green-300"><Calendar size={20}/></div>
                  <span className="text-[10px] font-bold">Events</span>
              </button>
          </div>

          {/* Latest Sermon */}
          {latestSermon && (
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg dark:text-white">Latest Sermon</h3>
                      <button onClick={() => onNavigate('sermons')} className="text-blue-500 text-xs font-bold">View All</button>
                  </div>
                  <div onClick={() => onNavigate('sermons')} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 cursor-pointer">
                      <div className="w-24 h-24 bg-slate-200 rounded-xl bg-cover bg-center flex-shrink-0 relative" style={{ backgroundImage: latestSermon.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(latestSermon.videoUrl)}/default.jpg)` : 'none' }}>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl"><Play fill="white" className="text-white"/></div>
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">{latestSermon.title}</h4>
                          <p className="text-xs text-slate-500 mb-2">{latestSermon.preacher} • {latestSermon.date}</p>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{latestSermon.duration || 'Full Service'}</span>
                      </div>
                  </div>
              </div>
          )}

          {/* Upcoming Events */}
          {events.length > 0 && (
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg dark:text-white">Upcoming</h3>
                      <button onClick={() => onNavigate('events')} className="text-blue-500 text-xs font-bold">View All</button>
                  </div>
                  <div className="space-y-3">
                      {events.map(ev => (
                          <div key={ev.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="bg-blue-50 dark:bg-blue-900 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-300">
                                      <span className="text-[10px] font-bold uppercase">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                                      <span className="text-lg font-black leading-none">{new Date(ev.date).getDate()}</span>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                                      <p className="text-xs text-slate-500">{ev.time} • {ev.location}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );
};

// --- EVENTS VIEW ---
export const EventsView = ({ onBack }: any) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [rsvped, setRsvped] = useState<string[]>([]);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('events').select('*').order('created_at', { ascending: true });
            if(data) setEvents(data as any);
        };
        fetch();
    }, []);

    const toggleRsvp = (id: string) => {
        if (rsvped.includes(id)) {
            setRsvped(rsvped.filter(i => i !== id));
        } else {
            setRsvped([...rsvped, id]);
            alert("RSVP Successful!");
        }
    };

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Events & Announcements</h1>
            {events.map(ev => (
                <div key={ev.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                    {ev.image && (
                        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${ev.image})` }}></div>
                    )}
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                             <div>
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase mb-2 inline-block ${ev.type === 'EVENT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{ev.type}</span>
                                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">{ev.title}</h3>
                             </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(ev.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={14}/> {ev.time}</span>
                            <span className="flex items-center gap-1"><MapPin size={14}/> {ev.location}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{ev.description}</p>
                        
                        {ev.type === 'EVENT' && (
                            <button 
                                onClick={() => toggleRsvp(ev.id)}
                                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${rsvped.includes(ev.id) ? 'bg-green-100 text-green-700' : 'bg-[#0c2d58] text-white'}`}
                            >
                                {rsvped.includes(ev.id) ? <CheckCircle size={18}/> : <Calendar size={18}/>}
                                {rsvped.includes(ev.id) ? 'Going' : 'RSVP Now'}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- COMMUNITY VIEW (SOCIAL FEED) ---
export const CommunityView = () => {
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [content, setContent] = useState('');

    // Mock initial data or fetch from Supabase if table exists
    useEffect(() => {
        // Since we might not have a full 'group_posts' table, we'll mock interactions locally for demo
        setPosts([
            {
                id: '1', groupId: '1', userId: 'user1', userName: 'Sarah Smith', content: 'Excited for the upcoming youth retreat! Who else is going?', likes: 12, createdAt: '2 hours ago', comments: []
            },
            {
                id: '2', groupId: '1', userId: 'user2', userName: 'Pastor David', content: 'Remember to read Psalm 23 for this week\'s study. It brings so much peace.', likes: 24, createdAt: '5 hours ago', comments: []
            }
        ]);
    }, []);

    const handlePost = () => {
        if(!content) return;
        const newPost: GroupPost = {
            id: Date.now().toString(),
            groupId: '1',
            userId: 'me',
            userName: 'Me',
            content,
            likes: 0,
            comments: [],
            createdAt: 'Just now'
        };
        setPosts([newPost, ...posts]);
        setContent('');
    };

    const handleLike = (id: string) => {
        setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1, likedByMe: true } : p));
    };

    return (
        <div className="p-4 pb-24 space-y-4 bg-slate-50 dark:bg-slate-900 min-h-full">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Community Feed</h1>
            
            {/* Create Post */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-sm outline-none resize-none mb-3 dark:text-white"
                    placeholder="Share something with the community..."
                    rows={3}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                    <button onClick={handlePost} disabled={!content} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                        <Send size={16}/> Post
                    </button>
                </div>
            </div>

            {/* Feed */}
            {posts.map(post => (
                <div key={post.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            {post.userName.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.userName}</h4>
                            <p className="text-xs text-slate-500">{post.createdAt}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 text-sm font-medium transition ${post.likedByMe ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                        >
                            <Heart size={18} fill={post.likedByMe ? "currentColor" : "none"}/> {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition">
                            <MessageCircle size={18}/> Comment
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-600 transition ml-auto">
                            <Share2 size={18}/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
};

// --- BIBLE VIEW ---
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

export const BibleView = () => {
    const [book, setBook] = useState('John');
    const [chapter, setChapter] = useState(1);
    const [version, setVersion] = useState('web'); // web is public domain
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchText();
    }, [book, chapter, version]);

    const fetchText = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`);
            const data = await res.json();
            setText(data.text || "Could not load text.");
        } catch (e) {
            setText("Error loading Bible text. Check connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 pb-32 h-full flex flex-col">
             <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 sticky top-0 z-10">
                 <div className="flex gap-2 mb-3">
                     <select className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm font-bold" value={book} onChange={e => { setBook(e.target.value); setChapter(1); }}>
                         {BIBLE_BOOKS.map(b => <option key={b}>{b}</option>)}
                     </select>
                     <select className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm font-bold" value={chapter} onChange={e => setChapter(parseInt(e.target.value))}>
                         {[...Array(150).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
                     </select>
                     <select className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm font-bold" value={version} onChange={e => setVersion(e.target.value)}>
                         <option value="web">WEB</option>
                         <option value="kjv">KJV</option>
                         <option value="bbe">BBE</option>
                     </select>
                 </div>
                 <div className="flex justify-between items-center">
                     <button onClick={() => setChapter(Math.max(1, chapter - 1))} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full"><ChevronDown className="rotate-90" size={16}/></button>
                     <span className="text-xs font-bold text-slate-500">READING MODE</span>
                     <button onClick={() => setChapter(chapter + 1)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full"><ChevronDown className="-rotate-90" size={16}/></button>
                 </div>
             </div>

             <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 overflow-y-auto">
                 {loading ? (
                     <div className="flex items-center justify-center h-full text-slate-400">Loading scripture...</div>
                 ) : (
                     <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-2xl font-serif font-bold mb-4">{book} {chapter}</h2>
                         <p className="text-lg leading-loose font-serif text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{text}</p>
                     </div>
                 )}
             </div>
        </div>
    );
};

// --- BLOG VIEW ---
export const BlogView = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
            if(data) setBlogs(data as any);
        };
        fetch();
    }, []);

    if (selectedBlog) {
        return (
            <div className="p-4 pb-24 bg-white dark:bg-slate-900 min-h-full">
                <button onClick={() => setSelectedBlog(null)} className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-600"><ArrowLeft size={16}/> Back to Blogs</button>
                {selectedBlog.image && <img src={selectedBlog.image} className="w-full h-56 object-cover rounded-2xl mb-6 shadow-sm" />}
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 inline-block">{selectedBlog.category}</span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{selectedBlog.title}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 border-b border-slate-100 pb-4">
                    <User size={14}/> {selectedBlog.author} • <Calendar size={14}/> {new Date(selectedBlog.date).toLocaleDateString()}
                </div>
                <div className="prose dark:prose-invert max-w-none pb-12">
                     <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{selectedBlog.content}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Latest Articles</h1>
            {blogs.map(blog => (
                <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    {blog.image && <div className="w-24 h-24 bg-cover bg-center rounded-xl flex-shrink-0" style={{ backgroundImage: `url(${blog.image})` }}></div>}
                    <div className="flex-1">
                        <span className="text-[10px] font-bold text-blue-500 uppercase mb-1 block">{blog.category}</span>
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">{blog.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{blog.excerpt}</p>
                        <span className="text-[10px] text-slate-400">{new Date(blog.date).toLocaleDateString()} • Read More</span>
                    </div>
                </div>
            ))}
        </div>
    )
};

// --- SERMONS VIEW ---
export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [playing, setPlaying] = useState<Sermon | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
            if(data) setSermons(data as any);
        };
        fetch();
    }, []);

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Watch Sermons</h1>
            
            {sermons.map(s => (
                <div key={s.id} onClick={() => setPlaying(s)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer group">
                    <div className="h-48 bg-slate-200 relative bg-cover bg-center" style={{ backgroundImage: s.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(s.videoUrl)}/mqdefault.jpg)` : 'none' }}>
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"><Play fill="white" className="text-white"/></div>
                        </div>
                        <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-bold">{s.duration}</span>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{s.title}</h3>
                        <p className="text-xs text-slate-500">{s.preacher} • {new Date(s.date).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}

            {playing && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center">
                    <button onClick={() => setPlaying(null)} className="absolute top-4 right-4 text-white p-4 z-50"><X size={32}/></button>
                    <div className="w-full aspect-video bg-black">
                         {playing.videoUrl && (
                             <iframe 
                                 width="100%" 
                                 height="100%" 
                                 src={`https://www.youtube.com/embed/${getYouTubeID(playing.videoUrl)}?autoplay=1`} 
                                 allow="autoplay; encrypted-media" 
                                 allowFullScreen
                             ></iframe>
                         )}
                    </div>
                    <div className="p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">{playing.title}</h2>
                        <p className="opacity-70">{playing.preacher} • {playing.date}</p>
                    </div>
                </div>
            )}
        </div>
    )
};

// --- NOTIFICATIONS VIEW ---
export const NotificationsView = () => {
    const [notifs, setNotifs] = useState<Notification[]>([]);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
            if(data) setNotifs(data as any);
        }
        fetch();
    }, []);

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Notifications</h1>
            {notifs.map(n => (
                <div key={n.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'EVENT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {n.type === 'EVENT' ? <Calendar size={18}/> : <Bell size={18}/>}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
            {notifs.length === 0 && <div className="text-center text-slate-400 py-10">No new notifications</div>}
        </div>
    )
};

// --- CONTACT VIEW ---
export const ContactView = ({ onBack }: any) => {
    return (
        <div className="p-4 pb-24">
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-bold text-blue-600"><ArrowLeft size={16}/> Back to Profile</button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Contact Us</h1>
            <p className="text-sm text-slate-500 mb-8">We'd love to hear from you. Send us a message below.</p>
            
            <form className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Subject</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm">
                        <option>Prayer Request</option>
                        <option>General Inquiry</option>
                        <option>Technical Support</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Message</label>
                    <textarea className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 h-32 text-sm" placeholder="How can we help?"></textarea>
                </div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">Send Message</button>
            </form>
            
            <div className="mt-8 text-center text-slate-500 text-sm space-y-2">
                <p>Email: info@isipingo.church</p>
                <p>Phone: +27 12 345 6789</p>
            </div>
        </div>
    )
};

// --- PROFILE VIEW ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        dob: user?.dob || '',
        gender: user?.gender || 'Female'
    });

    const handleSave = () => {
        onUpdateUser(formData);
        setIsEditing(false);
    };

    return (
        <div className="p-4 pb-24 min-h-full flex flex-col">
            <div className="text-center mb-8 mt-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                    {user?.firstName?.charAt(0) || 'U'}
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">Personal Info</h3>
                    <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-slate-900 px-3 py-1.5 rounded-full">
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-[10px] font-bold text-slate-400 uppercase">First Name</label>
                             {isEditing ? <input className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm dark:text-white" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /> : <p className="text-sm font-medium dark:text-white">{user?.firstName}</p>}
                         </div>
                         <div>
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Last Name</label>
                             {isEditing ? <input className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm dark:text-white" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /> : <p className="text-sm font-medium dark:text-white">{user?.lastName}</p>}
                         </div>
                    </div>
                    <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                         {isEditing ? <input className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm dark:text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /> : <p className="text-sm font-medium dark:text-white">{user?.phone || 'Not set'}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                             {isEditing ? <input type="date" className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm dark:text-white" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /> : <p className="text-sm font-medium dark:text-white">{user?.dob || 'Not set'}</p>}
                         </div>
                         <div>
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                             {isEditing ? (
                                 <select className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm dark:text-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                     <option>Female</option><option>Male</option>
                                 </select>
                             ) : <p className="text-sm font-medium dark:text-white">{user?.gender}</p>}
                         </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <button onClick={toggleTheme} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full"><Moon size={18} className="text-slate-600 dark:text-slate-300"/></div>
                        <span className="text-sm font-bold dark:text-white">Dark Mode</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
                    </div>
                </button>
                <button onClick={() => onNavigate('contact')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full"><Mail size={18} className="text-blue-600 dark:text-blue-300"/></div>
                    <span className="text-sm font-bold dark:text-white">Contact Us</span>
                </button>
                <button onClick={onLogout} className="w-full bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30 mt-6">
                    <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full"><LogOut size={18} className="text-red-600 dark:text-red-300"/></div>
                    <span className="text-sm font-bold text-red-600 dark:text-red-300">Log Out</span>
                </button>
            </div>
        </div>
    )
};

export const MusicView = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
     const fetchData = async () => {
        const { data: tData } = await supabase.from('music_tracks').select('*');
        if(tData) setTracks(tData.map((t:any) => ({...t, isOffline: false})));
        
        const { data: pData } = await supabase.from('playlists').select('*');
        if(pData) setPlaylists(pData);
     };
     fetchData();
  }, []);

  useEffect(() => {
     if(currentTrack) {
        setShowMiniPlayer(true);
        if (!currentTrack.url.includes('youtu') && audioRef.current) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay prevented", e));
        } else {
            setIsPlaying(true); 
        }
     }
  }, [currentTrack]);

  const handlePlayPause = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!currentTrack) return;
      if (currentTrack.url.includes('youtu')) {
         setIsPlaying(!isPlaying);
      } else {
         if (isPlaying) audioRef.current?.pause();
         else audioRef.current?.play();
         setIsPlaying(!isPlaying);
      }
  };

  const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if(!currentTrack) return;
      const idx = tracks.findIndex(t => t.id === currentTrack.id);
      if(idx < tracks.length - 1) setCurrentTrack(tracks[idx + 1]);
      else setCurrentTrack(tracks[0]); // Loop
  };

  const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if(!currentTrack) return;
      const idx = tracks.findIndex(t => t.id === currentTrack.id);
      if(idx > 0) setCurrentTrack(tracks[idx - 1]);
      else setCurrentTrack(tracks[tracks.length - 1]);
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 flex flex-col relative overflow-hidden">
        
        {/* Main Content (List) */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Music & Podcasts</h1>

            {/* Playlists */}
            {playlists.length > 0 && (
                <div className="mb-8 overflow-x-auto no-scrollbar flex gap-4 pb-2">
                    {playlists.map(p => (
                        <div key={p.id} className="min-w-[160px] h-40 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl text-white shadow-xl shadow-blue-500/20 shrink-0 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-110 transition"><Music size={64}/></div>
                            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"><Play size={16} fill="white"/></div>
                            <div>
                                <p className="font-bold text-lg truncate leading-tight">{p.name}</p>
                                <p className="text-xs opacity-70 mt-1">Playlist</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Track List */}
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest mb-4">All Tracks</h3>
            <div className="space-y-3">
                {tracks.map((track, idx) => (
                    <div key={track.id} onClick={() => setCurrentTrack(track)} className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${currentTrack?.id === track.id ? 'bg-white dark:bg-slate-800 shadow-lg scale-[1.02] border-blue-500/30' : 'bg-transparent hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${currentTrack?.id === track.id ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                               {currentTrack?.id === track.id && isPlaying ? (
                                   <div className="flex gap-0.5 items-end h-3">
                                       <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                                       <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-3"></div>
                                       <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-1"></div>
                                   </div>
                               ) : (
                                   <span>{idx + 1}</span>
                               )}
                            </div>
                            <div>
                                <p className={`font-bold text-base ${currentTrack?.id === track.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{track.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{track.artist}</p>
                            </div>
                        </div>
                        <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-opacity ${currentTrack?.id === track.id ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`}>
                            <Play size={16} fill="currentColor"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* MINI PLAYER WIDGET */}
        {showMiniPlayer && currentTrack && !isFullScreen && (
            <div onClick={() => setIsFullScreen(true)} className="fixed bottom-[85px] left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 pr-4 rounded-full flex items-center justify-between z-40 animate-slide-up cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative shadow-inner">
                        {currentTrack.url.includes('youtu') ? (
                            <img src={`https://img.youtube.com/vi/${getYouTubeID(currentTrack.url)}/default.jpg`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"><Music size={16} className="text-white"/></div>
                        )}
                        {/* Rotating ring logic could go here */}
                    </div>
                    <div className="min-w-0 max-w-[120px]">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentTrack.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentTrack.artist}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handlePlayPause} className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-md transition transform active:scale-90">
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1"/>}
                    </button>
                    <button onClick={handleNext} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                        <SkipForward size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* FULL SCREEN PLAYER MODAL */}
        {isFullScreen && currentTrack && (
            <div className="fixed inset-0 z-50 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-3xl flex flex-col animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center p-6 mt-safe">
                    <button onClick={() => setIsFullScreen(false)} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                        <ChevronDown className="text-slate-900 dark:text-white" size={28}/>
                    </button>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Now Playing</span>
                    <button className="p-2"><MoreVertical className="text-slate-900 dark:text-white" size={24}/></button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
                    
                    {/* Album Art / Video */}
                    <div className="relative w-full max-w-sm aspect-square rounded-[40px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-white/10">
                        {currentTrack.url.includes('youtu') ? (
                           <iframe 
                             className="w-full h-full pointer-events-none"
                             src={`https://www.youtube.com/embed/${getYouTubeID(currentTrack.url)}?autoplay=${isPlaying ? 1 : 0}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
                             allow="autoplay"
                           />
                        ) : (
                           <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                               <Music size={120} className="text-slate-400 opacity-50"/>
                           </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="text-center w-full">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{currentTrack.title}</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{currentTrack.artist}</p>
                    </div>

                    {/* Progress Bar (Visual Only for MVP) */}
                    <div className="w-full max-w-sm">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                            <span>1:20</span>
                            <span>3:45</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between w-full max-w-sm px-4">
                        <button onClick={handlePrev} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition"><SkipBack size={36}/></button>
                        
                        <button 
                            onClick={handlePlayPause} 
                            className="w-24 h-24 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 transition transform active:scale-95"
                        >
                            {isPlaying ? <Pause size={40} fill="currentColor"/> : <Play size={40} fill="currentColor" className="ml-2"/>}
                        </button>

                        <button onClick={handleNext} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition"><SkipForward size={36}/></button>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 pb-12 flex justify-between items-center max-w-sm mx-auto w-full text-slate-400">
                    <button><Share2 size={24} /></button>
                    <button><ListMusic size={24} /></button>
                </div>
            </div>
        )}

        {/* Hidden Audio Element for MP3s */}
        <audio ref={audioRef} onEnded={() => handleNext()} className="hidden" />
    </div>
  );
};
