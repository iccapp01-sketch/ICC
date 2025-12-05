
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone
} from 'lucide-react';
import { BlogPost, Sermon, CommunityGroup, GroupPost, GroupComment, BibleVerse, Event, MusicTrack, Playlist, User as UserType, Notification } from '../types';
import { explainVerse } from '../services/geminiService';
import { supabase } from '../lib/supabaseClient';

// --- CONSTANTS ---
const DAILY_VERSE: BibleVerse = {
  reference: "Philippians 4:13",
  text: "I can do all things through Christ who strengthens me.",
  version: "NKJV"
};

const BIBLE_API_KEY = 'j6HVB3_hdmcH_ue5C6QMx';
const BIBLE_ID = 'de4e12af7f28f599-01'; // KJV

const getYouTubeID = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// 1. HOME VIEW
export const HomeView = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [featuredSermon, setFeaturedSermon] = useState<Sermon | null>(null);
  const [latestBlog, setLatestBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeContent = async () => {
      setLoading(true);
      // Fetch latest sermon
      const { data: sermons } = await supabase
        .from('sermons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (sermons && sermons.length > 0) {
        setFeaturedSermon({
           id: sermons[0].id,
           title: sermons[0].title,
           preacher: sermons[0].preacher,
           date: sermons[0].date_preached,
           duration: sermons[0].duration,
           videoUrl: sermons[0].video_url,
           thumbnail: sermons[0].thumbnail_url || 'https://picsum.photos/800/450?grayscale',
           views: 0
        });
      }

      // Fetch latest blog
      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (blogs && blogs.length > 0) {
        setLatestBlog({
           id: blogs[0].id,
           title: blogs[0].title,
           author: blogs[0].author,
           date: new Date(blogs[0].created_at).toLocaleDateString(),
           category: blogs[0].category,
           excerpt: blogs[0].excerpt,
           content: blogs[0].content,
           image: blogs[0].image_url || 'https://picsum.photos/800/400',
           likes: 0,
           comments: 0
        });
      }
      setLoading(false);
    };

    fetchHomeContent();
  }, []);

  return (
    <div className="pb-10 pt-4">
      {/* Featured Card */}
      <div className="mx-6 mb-8 relative">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl shadow-xl p-6 border border-white/10 overflow-hidden min-h-[200px] flex flex-col justify-center">
           {loading ? (
             <div className="text-white text-center">Loading Featured Sermon...</div>
           ) : featuredSermon ? (
             <div className="relative z-10 flex flex-col items-start">
                <span className="bg-blue-500/30 text-blue-100 text-[10px] font-bold px-2 py-1 rounded-full mb-3 uppercase tracking-wider backdrop-blur-sm border border-blue-400/20">Featured Sermon</span>
                <h3 className="text-white font-bold text-2xl mb-1 leading-tight">{featuredSermon.title}</h3>
                <p className="text-sm text-blue-200 mb-6">{featuredSermon.preacher}</p>
                <button 
                  onClick={() => onNavigate('sermons')}
                  className="bg-white text-blue-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-50 transition shadow-lg flex items-center gap-2"
                >
                  <Play size={16} fill="currentColor" /> Watch Now
                </button>
             </div>
           ) : (
             <div className="text-white/60 text-center w-full">No sermons available yet.</div>
           )}
           
           {/* Decorative Background */}
           <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 pointer-events-none">
              <Music size={200} className="absolute -right-10 -bottom-10 rotate-12" />
           </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="font-bold text-slate-900 dark:text-white text-lg">Latest Updates</h3>
           <button onClick={() => onNavigate('blogs')} className="text-blue-500 text-sm font-medium">View All</button>
        </div>

        {/* Latest Blog */}
        {latestBlog ? (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-98 transition-transform cursor-pointer" onClick={() => onNavigate('blogs')}>
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                  <span className="bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">{latestBlog.category || 'Blog'}</span>
                  <span className="text-xs text-slate-400">{latestBlog.date}</span>
               </div>
             </div>
             <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">{latestBlog.title}</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3">
               {latestBlog.excerpt}
             </p>
             <div className="text-blue-500 text-sm font-medium flex items-center gap-1">Read More <ChevronRight size={14}/></div>
          </div>
        ) : (
           <div className="text-center text-slate-400 text-sm py-4">No blogs posted recently.</div>
        )}
        
        {/* Daily Verse Card */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-500/20">
           <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-orange-500" />
              <span className="text-orange-700 dark:text-orange-300 text-xs font-bold uppercase">Verse of the Day</span>
           </div>
           <p className="text-slate-800 dark:text-slate-200 font-serif italic text-lg leading-relaxed">"{DAILY_VERSE.text}"</p>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">- {DAILY_VERSE.reference}</p>
        </div>
      </div>
    </div>
  );
};

// 2. EVENTS VIEW
export const EventsView = ({ onBack }: { onBack?: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvped, setRsvped] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (error) throw error;
        if (data) {
          setEvents(data.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            location: e.location,
            description: e.description,
            type: e.type,
            rsvpCount: 0,
            image: e.image_url
          })));
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRSVP = (id: string) => {
    if (rsvped.includes(id)) {
        setRsvped(rsvped.filter(e => e !== id));
    } else {
        setRsvped([...rsvped, id]);
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
       <div className="mb-6 flex items-center gap-2">
          {onBack && <button onClick={onBack}><ArrowLeft className="text-slate-500" size={24}/></button>}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Events & News</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Upcoming activities</p>
          </div>
       </div>

       {loading ? <p className="text-center text-slate-500">Loading events...</p> : (
         <div className="space-y-4">
            {events.length === 0 && <p className="text-center text-slate-500 mt-10">No upcoming events.</p>}
            {events.map(event => (
               <div key={event.id} className={`p-4 rounded-2xl border shadow-sm ${event.type === 'EVENT' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-500/30'}`}>
                  {event.type === 'ANNOUNCEMENT' ? (
                     <div className="flex items-start gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg shrink-0">
                          <Bell className="text-white" size={20} />
                        </div>
                        <div>
                           <h3 className="font-bold text-orange-800 dark:text-orange-200">{event.title}</h3>
                           <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{event.description}</p>
                           {event.image && <img src={event.image} className="mt-2 rounded-lg w-full h-32 object-cover" />}
                           <p className="text-xs text-slate-500 mt-2">{event.date}</p>
                        </div>
                     </div>
                  ) : (
                     <div>
                        {event.image && <img src={event.image} className="mb-3 rounded-lg w-full h-40 object-cover" />}
                        <div className="flex justify-between items-start mb-3">
                           <div className="bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-center px-3 py-2 rounded-xl">
                              <span className="block text-xs uppercase font-bold">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="block text-xl font-bold">{new Date(event.date).getDate()}</span>
                           </div>
                           <button 
                             onClick={() => handleRSVP(event.id)}
                             className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${rsvped.includes(event.id) ? 'bg-green-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}
                           >
                              {rsvped.includes(event.id) ? 'Going ✓' : 'RSVP'}
                           </button>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2 mb-3">
                           <span className="flex items-center gap-1"><Clock size={14}/> {event.time}</span>
                           <span className="flex items-center gap-1"><MapPin size={14}/> {event.location}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
                     </div>
                  )}
               </div>
            ))}
         </div>
       )}
    </div>
  )
}

// 3. COMMUNITY VIEW
export const CommunityView = () => {
  const [activeGroup, setActiveGroup] = useState<CommunityGroup | null>(null);
  const [allGroups, setAllGroups] = useState<CommunityGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Feed State
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<string | null>(null); 
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
       setLoadingGroups(true);
       try {
           const { data, error } = await supabase.from('community_groups').select('*');
           if (error) throw error;
           if (data) {
              setAllGroups(data.map((g: any) => ({
                 id: g.id,
                 name: g.name,
                 description: g.description,
                 image: g.image_url,
                 membersCount: 0, 
                 isMember: true, 
                 status: 'Joined'
              })));
           }
       } catch (err) {
           console.error("Fetch groups error:", err);
       } finally {
           setLoadingGroups(false);
       }
    };
    fetchGroups();
  }, []);

  const handleCreatePost = () => {
    if(!newPostContent.trim()) return;
    const newPost: GroupPost = {
       id: Date.now().toString(),
       groupId: activeGroup!.id,
       userId: 'me',
       userName: 'Me', 
       content: newPostContent,
       likes: 0,
       comments: [],
       createdAt: 'Just now'
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  if (activeGroup) {
     return (
       <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900">
         <div className="p-4 bg-white dark:bg-slate-800 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveGroup(null)}><ArrowLeft className="text-slate-500 dark:text-slate-400"/></button>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{activeGroup.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeGroup.membersCount} members</p>
              </div>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto pb-20 p-4">
            <div className="bg-white dark:bg-slate-800 p-4 mb-4 rounded-xl shadow-sm">
                <input 
                  className="w-full bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 text-sm outline-none dark:text-white mb-2"
                  placeholder={`What's on your mind?`}
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                />
                <button onClick={handleCreatePost} disabled={!newPostContent.trim()} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 float-right">Post</button>
            </div>
            {posts.map(post => (
               <div key={post.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.userName}</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 my-2">{post.content}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                     <button>Like ({post.likes})</button>
                     <button>Comment ({post.comments.length})</button>
                  </div>
               </div>
            ))}
         </div>
       </div>
     )
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Groups</h2>
      {loadingGroups ? <p className="text-center text-slate-500">Loading...</p> : (
        <div className="space-y-4">
            {allGroups.map(group => (
            <div key={group.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                {group.image ? <img src={group.image} className="w-full h-full object-cover"/> : <Users size={20} />}
                </div>
                <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{group.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{group.description}</p>
                </div>
                <button onClick={() => setActiveGroup(group)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Open</button>
            </div>
            ))}
        </div>
      )}
    </div>
  )
}

// 4. NOTIFICATIONS VIEW
export const NotificationsView = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
       try {
           const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
           if (error) throw error;
           if(data) {
              setNotifications(data.map((n: any) => ({
                 id: n.id,
                 title: n.title,
                 message: n.message,
                 type: n.type,
                 created_at: new Date(n.created_at).toLocaleString(),
                 isRead: false
              })));
           }
       } catch (err) {
           console.error("Fetch notifications error", err);
       } finally {
           setLoading(false);
       }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
       <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Notifications</h1>
       {loading ? <p className="text-center text-slate-500">Loading...</p> : (
         <div className="space-y-4">
            {notifications.length === 0 && <p className="text-center text-slate-500">No new notifications.</p>}
            {notifications.map(notif => (
                <div key={notif.id} className="p-4 rounded-2xl flex gap-4 bg-white dark:bg-slate-800 border-l-4 border-blue-500 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><Bell size={18}/></div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{notif.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.created_at}</p>
                    </div>
                </div>
            ))}
         </div>
       )}
    </div>
  )
}

// 5. BIBLE VIEW
export const BibleView = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [view, setView] = useState<'books' | 'chapters' | 'text'>('books');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books`, { headers: { 'api-key': BIBLE_API_KEY } });
        if (!res.ok) throw new Error('Failed to fetch books');
        const data = await res.json();
        setBooks(data.data);
      } catch (err: any) {
        setError('Could not connect to Bible API.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleBookSelect = async (book: any) => {
    setSelectedBook(book);
    setLoading(true);
    try {
        const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${book.id}/chapters`, { headers: { 'api-key': BIBLE_API_KEY } });
        const data = await res.json();
        setChapters(data.data);
        setView('chapters');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleChapterSelect = async (chapterId: string) => {
    setSelectedChapter(chapterId);
    setLoading(true);
    try {
        const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/chapters/${chapterId}?content-type=html`, { headers: { 'api-key': BIBLE_API_KEY } });
        const data = await res.json();
        setContent(data.data.content);
        setView('text');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        {view !== 'books' && <button onClick={() => setView(view === 'text' ? 'chapters' : 'books')}><ArrowLeft size={24} className="text-slate-500"/></button>}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{view === 'books' ? 'Holy Bible' : view === 'chapters' ? selectedBook.name : selectedChapter}</h1>
      </div>
      {loading ? <div className="text-center text-slate-500">Loading...</div> : error ? <div className="text-red-500 text-center">{error}</div> : (
        <div className="flex-1 overflow-y-auto">
           {view === 'books' && <div className="grid grid-cols-2 gap-3">{books.map(b => <button key={b.id} onClick={() => handleBookSelect(b)} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left font-bold text-slate-700 dark:text-slate-200">{b.name}</button>)}</div>}
           {view === 'chapters' && <div className="grid grid-cols-5 gap-3">{chapters.map(c => <button key={c.id} onClick={() => handleChapterSelect(c.id)} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">{c.number}</button>)}</div>}
           {view === 'text' && <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />}
        </div>
      )}
    </div>
  );
};

// 6. BLOG VIEW
export const BlogView = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  useEffect(() => {
    const fetchBlogs = async () => {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        if(data) setBlogs(data.map((b:any) => ({ ...b, date: new Date(b.created_at).toLocaleDateString(), image: b.image_url })));
    }
    fetchBlogs();
  }, []);
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Latest Articles</h1>
        <div className="space-y-6">{blogs.map(blog => (
            <div key={blog.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                {blog.image && <img src={blog.image} className="w-full h-48 object-cover" />}
                <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{blog.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{blog.excerpt}</p>
                </div>
            </div>
        ))}</div>
    </div>
  );
};

// 7. SERMONS VIEW
export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [playingSermon, setPlayingSermon] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchSermons = async () => {
            const { data } = await supabase.from('sermons').select('*').order('date_preached', { ascending: false });
            if (data) setSermons(data.map((s:any) => ({ ...s, date: s.date_preached, videoUrl: s.video_url, thumbnail: s.thumbnail_url || 'https://picsum.photos/800/450' })));
        };
        fetchSermons();
    }, []);

    const playVideo = (url: string) => {
       const id = getYouTubeID(url);
       if(id) setPlayingSermon(id);
       else alert("Invalid YouTube URL");
    };

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Sermons</h1>
            <div className="space-y-4">
                {sermons.map(sermon => (
                    <div key={sermon.id} className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700" onClick={() => sermon.videoUrl && playVideo(sermon.videoUrl)}>
                        <div className="w-24 h-24 rounded-xl bg-slate-200 shrink-0 relative overflow-hidden">
                            <img src={sermon.thumbnail} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Play size={20} className="text-white fill-current"/>
                            </div>
                        </div>
                        <div className="flex-1 py-1">
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">{sermon.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{sermon.preacher}</p>
                        </div>
                    </div>
                ))}
            </div>

            {playingSermon && (
                <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center p-4">
                   <button onClick={() => setPlayingSermon(null)} className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full"><X size={24}/></button>
                   <div className="w-full aspect-video max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl">
                      <iframe 
                        width="100%" height="100%" 
                        src={`https://www.youtube.com/embed/${playingSermon}?autoplay=1`} 
                        title="Sermon Video" frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                   </div>
                </div>
            )}
        </div>
    );
};

// 8. MUSIC VIEW (With Player)
export const MusicView = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
     const fetchMusic = async () => {
        const { data } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
        if(data) setTracks(data.map((t:any) => ({...t, isOffline: false})));
     };
     fetchMusic();
  }, []);

  useEffect(() => {
     if(currentTrack && audioRef.current) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.play().catch(e => console.error("Playback error:", e));
     }
  }, [currentTrack]);

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-32">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Worship Music</h1>
        <div className="space-y-3">
            {tracks.map((track, idx) => (
                <div key={track.id} onClick={() => setCurrentTrack(track)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${currentTrack?.id === track.id ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-bold text-sm w-4 text-center">{idx + 1}</span>
                        <div>
                            <p className={`font-bold text-sm ${currentTrack?.id === track.id ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>{track.title}</p>
                            <p className="text-xs text-slate-500">{track.artist}</p>
                        </div>
                    </div>
                    {currentTrack?.id === track.id && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                </div>
            ))}
        </div>

        {/* Fixed Player */}
        <div className="fixed bottom-[72px] left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 flex items-center gap-4 px-4 shadow-lg z-40">
           <audio ref={audioRef} controls className="w-full h-10" />
           {/* Custom UI overlay could go here, but native controls are most reliable for cross-browser */}
        </div>
    </div>
  );
};

// 9. CONTACT VIEW
export const ContactView = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={onBack}><ArrowLeft className="text-slate-500" size={24}/></button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Church Office</h3>
                    <p className="text-sm text-slate-500">123 Church Street, Isipingo</p>
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Service Times</h3>
                    <p className="text-sm text-slate-500">Sunday Service: 09:00 AM</p>
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Get in Touch</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={14}/> +27 31 123 4567</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2"><Mail size={14}/> info@isipingochurch.com</p>
                 </div>
            </div>
        </div>
    )
}

// 10. PROFILE VIEW
export const ProfileView = ({ user, onLogout, toggleTheme, isDarkMode, onNavigate, onUpdateUser }: {
    user: UserType | null;
    onLogout: () => void;
    toggleTheme: () => void;
    isDarkMode: boolean;
    onNavigate: (tab: string) => void;
    onUpdateUser: (data: any) => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        dob: user?.dob || ''
    });

    const handleSave = () => {
        onUpdateUser(editData);
        setIsEditing(false);
    };

    return (
        <div className="min-h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24 overflow-y-auto">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h1>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                
                {isEditing ? (
                    <div className="w-full space-y-3">
                        <div className="flex gap-2">
                             <input className="flex-1 bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-700 dark:text-white" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} placeholder="First Name" />
                             <input className="flex-1 bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-700 dark:text-white" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} placeholder="Last Name" />
                        </div>
                        <input className="w-full bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-700 dark:text-white" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="Phone" />
                        <label className="text-xs text-slate-500 ml-1">Date of Birth</label>
                        <input type="date" className="w-full bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-700 dark:text-white" value={editData.dob} onChange={e => setEditData({...editData, dob: e.target.value})} />
                        
                        <div className="flex gap-2 mt-2">
                             <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Save</button>
                             <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold text-sm">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full text-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{user?.email}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{user?.phone}</p>
                        {user?.dob && <p className="text-slate-400 text-xs mb-4">Born: {user.dob}</p>}
                        
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-full border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 mt-2">Edit Profile</button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                <button onClick={toggleTheme} className="w-full p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                        {isDarkMode ? <Moon size={20}/> : <Sparkles size={20}/>}
                        <span className="font-medium">Dark Mode</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-5' : 'left-1'}`}></div>
                    </div>
                </button>
                
                <button onClick={() => onNavigate('events')} className="w-full p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                     <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                         <Calendar size={20} />
                         <span className="font-medium">My Events</span>
                     </div>
                     <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button onClick={() => onNavigate('contact')} className="w-full p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                     <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                         <Mail size={20} />
                         <span className="font-medium">Contact Support</span>
                     </div>
                     <ChevronRight size={16} className="text-slate-400" />
                </button>
            </div>

            <button onClick={onLogout} className="w-full p-4 flex items-center justify-center gap-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 font-bold mb-8">
                 <LogOut size={20} />
                 <span>Log Out</span>
            </button>
        </div>
    );
};
