
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

const MOCK_PLAYLISTS: Playlist[] = [
  { 
    id: '1', name: 'Worship Essentials', tracks: [
      { id: '1', title: 'Amazing Grace', artist: 'ICC Worship Team', duration: '4:20', date: '2024', isOffline: true, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'MUSIC' },
      { id: '2', title: 'Way Maker', artist: 'ICC Worship Team', duration: '5:10', date: '2024', isOffline: false, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'MUSIC' },
    ]
  }
];

// --- HELPER FUNCTIONS ---
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

// 3. COMMUNITY VIEW (Social Feed Style)
export const CommunityView = () => {
  const [activeGroup, setActiveGroup] = useState<CommunityGroup | null>(null);
  const [allGroups, setAllGroups] = useState<CommunityGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Feed State
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<string | null>(null); // Post ID
  const [newComment, setNewComment] = useState('');

  // 1. Fetch Groups
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

  // 2. Fetch Posts Mock
  useEffect(() => {
    if(activeGroup) {
       setPosts([
         {
           id: '1',
           groupId: activeGroup.id,
           userId: '101',
           userName: 'Sarah Jenkins',
           userAvatar: '',
           content: 'Really enjoyed the youth service last night! The worship was amazing. 🙌',
           likes: 12,
           comments: [
             { id: 'c1', postId: '1', userId: '102', userName: 'Mike', content: 'It was powerful!', createdAt: '10m ago' }
           ],
           createdAt: '2 hours ago'
         },
         {
           id: '2',
           groupId: activeGroup.id,
           userId: '103',
           userName: 'Pastor David',
           userAvatar: '',
           content: 'Reminder: We have a leadership meeting this Tuesday. Please check your emails for the agenda.',
           imageUrl: 'https://picsum.photos/600/300',
           likes: 24,
           comments: [],
           createdAt: '5 hours ago'
         }
       ]);
    }
  }, [activeGroup]);

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

  const handleLike = (postId: string) => {
     setPosts(posts.map(p => 
        p.id === postId 
        ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe }
        : p
     ));
  };

  const handleAddComment = (postId: string) => {
     if(!newComment.trim()) return;
     const comment: GroupComment = {
        id: Date.now().toString(),
        postId,
        userId: 'me',
        userName: 'Me',
        content: newComment,
        createdAt: 'Just now'
     };
     setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
     setNewComment('');
  };

  if (activeGroup) {
     return (
       <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900">
         {/* Group Header */}
         <div className="p-4 bg-white dark:bg-slate-800 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveGroup(null)}><ArrowLeft className="text-slate-500 dark:text-slate-400"/></button>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{activeGroup.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeGroup.membersCount} members</p>
              </div>
            </div>
            <button><MoreVertical className="text-slate-500 dark:text-slate-400" size={20}/></button>
         </div>
         
         {/* Feed Content */}
         <div className="flex-1 overflow-y-auto pb-20">
            {/* Create Post Widget */}
            <div className="bg-white dark:bg-slate-800 p-4 mb-2 shadow-sm">
                <div className="flex gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500"><User size={20}/></div>
                   <input 
                     className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-4 text-sm outline-none dark:text-white"
                     placeholder={`What's on your mind?`}
                     value={newPostContent}
                     onChange={e => setNewPostContent(e.target.value)}
                   />
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                   <button className="flex items-center gap-2 text-slate-500 text-xs font-bold px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                      <ImageIcon size={16} className="text-green-500"/> Photo/Video
                   </button>
                   <button 
                     onClick={handleCreatePost}
                     disabled={!newPostContent.trim()}
                     className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                   >
                      Post
                   </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-2">
               {posts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-slate-800 p-4 shadow-sm">
                     {/* Post Header */}
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center font-bold">
                           {post.userName.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-900 dark:text-white">{post.userName}</p>
                           <p className="text-xs text-slate-500">{post.createdAt}</p>
                        </div>
                     </div>
                     
                     {/* Post Content */}
                     <p className="text-sm text-slate-800 dark:text-slate-200 mb-3 whitespace-pre-wrap">{post.content}</p>
                     {post.imageUrl && <img src={post.imageUrl} className="w-full rounded-lg mb-3" />}
                     
                     {/* Stats */}
                     <div className="flex justify-between text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                        <span>{post.likes} Likes</span>
                        <span>{post.comments.length} Comments</span>
                     </div>

                     {/* Actions */}
                     <div className="flex justify-between gap-1">
                        <button 
                           onClick={() => handleLike(post.id)}
                           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-sm ${post.likedByMe ? 'text-blue-600' : 'text-slate-500'}`}
                        >
                           <ThumbsUp size={18} /> Like
                        </button>
                        <button 
                           onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                           className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-sm text-slate-500"
                        >
                           <MessageCircle size={18} /> Comment
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-sm text-slate-500">
                           <Share2 size={18} /> Share
                        </button>
                     </div>

                     {/* Comments Section */}
                     {expandedComments === post.id && (
                        <div className="mt-3 pt-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl animate-fade-in">
                           <div className="space-y-3 mb-3">
                              {post.comments.map(comment => (
                                 <div key={comment.id} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></div>
                                    <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl px-3 py-2">
                                       <p className="text-xs font-bold text-slate-900 dark:text-white">{comment.userName}</p>
                                       <p className="text-sm text-slate-800 dark:text-slate-200">{comment.content}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="flex gap-2">
                              <input 
                                 className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full px-3 py-1.5 text-sm outline-none"
                                 placeholder="Write a comment..."
                                 value={newComment}
                                 onChange={e => setNewComment(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                              />
                              <button onClick={() => handleAddComment(post.id)} className="text-blue-600 p-1"><Send size={18}/></button>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
       </div>
     )
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
      <div className="bg-blue-600 p-6 rounded-3xl text-white mb-6 shadow-lg relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-1">Community Groups</h1>
            <p className="text-blue-100 text-sm">Connect & Grow Together</p>
         </div>
         <div className="absolute -right-4 -bottom-8 opacity-20">
            <Users size={120} />
         </div>
      </div>

      <h2 className="font-bold text-slate-900 dark:text-white mb-4 ml-1">Your Groups</h2>
      
      {loadingGroups ? <p className="text-center text-slate-500">Loading Groups...</p> : (
        <div className="space-y-4">
            {allGroups.length === 0 && <p className="text-center text-slate-500">No active groups found.</p>}
            {allGroups.map(group => (
            <div key={group.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div className="w-14 h-14 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-100 dark:border-slate-600 overflow-hidden">
                {group.image ? <img src={group.image} className="w-full h-full object-cover"/> : <Users size={28} />}
                </div>
                <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{group.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{group.description}</p>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded font-medium">Active Member</span>
                </div>
                <button 
                    onClick={() => setActiveGroup(group)}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                Open Feed
                </button>
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
       <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <button className="text-xs text-blue-500 font-bold">Mark all read</button>
       </div>

       {loading ? <p className="text-center text-slate-500">Loading...</p> : (
         <div className="space-y-4">
            {notifications.length === 0 && <p className="text-center text-slate-500">No new notifications.</p>}
            {notifications.map(notif => (
                <div key={notif.id} className="p-4 rounded-2xl flex gap-4 bg-white dark:bg-slate-800 border-l-4 border-blue-500 shadow-sm animate-fade-in">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === 'COMMENT' ? 'bg-blue-100 text-blue-600' :
                        notif.type === 'EVENT' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                        <Bell size={18}/>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{notif.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.created_at}</p>
                    </div>
                </div>
            ))}
         </div>
       )}
    </div>
  )
}

// 5. BIBLE VIEW (API Integration)
export const BibleView = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [view, setView] = useState<'books' | 'chapters' | 'text'>('books');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books`, {
          headers: { 'api-key': BIBLE_API_KEY }
        });
        if (!res.ok) throw new Error('Failed to fetch books');
        const data = await res.json();
        setBooks(data.data);
      } catch (err: any) {
        console.error("Bible API Error:", err);
        setError('Could not connect to Bible API. Please check your internet connection.');
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
        const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${book.id}/chapters`, {
            headers: { 'api-key': BIBLE_API_KEY }
        });
        if (!res.ok) throw new Error('Failed to fetch chapters');
        const data = await res.json();
        setChapters(data.data);
        setView('chapters');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleChapterSelect = async (chapterId: string) => {
    setSelectedChapter(chapterId);
    setLoading(true);
    try {
        const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/chapters/${chapterId}?content-type=html`, {
            headers: { 'api-key': BIBLE_API_KEY }
        });
        if (!res.ok) throw new Error('Failed to fetch content');
        const data = await res.json();
        setContent(data.data.content);
        setView('text');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        {view !== 'books' && (
           <button onClick={() => setView(view === 'text' ? 'chapters' : 'books')} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
             <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300"/>
           </button>
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {view === 'books' ? 'Holy Bible' : view === 'chapters' ? selectedBook.name : selectedChapter}
        </h1>
      </div>

      {loading && <div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>}
      
      {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-center">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="mt-2 text-xs font-bold underline">Retry</button>
          </div>
      )}

      {!loading && !error && (
        <div className="flex-1 overflow-y-auto">
           {view === 'books' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {books.map(book => (
                    <button key={book.id} onClick={() => handleBookSelect(book)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{book.name}</span>
                    </button>
                 ))}
              </div>
           )}
           
           {view === 'chapters' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                 {chapters.map(chap => (
                    <button key={chap.id} onClick={() => handleChapterSelect(chap.id)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-bold text-center text-slate-700 dark:text-slate-200">
                        {chap.number}
                    </button>
                 ))}
              </div>
           )}

           {view === 'text' && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 prose dark:prose-invert max-w-none">
                 <div className="bible-content" dangerouslySetInnerHTML={{ __html: content }} />
                 <style>{`
                    .bible-content .p { margin-bottom: 1em; line-height: 1.8; }
                    .bible-content .v { font-size: 0.7em; color: #94a3b8; font-weight: bold; vertical-align: super; margin-right: 4px; }
                    .bible-content .q1, .bible-content .q2 { margin-left: 20px; font-style: italic; color: #475569; }
                    .bible-content .wj { color: #e11d48; } /* Words of Jesus in Red */
                 `}</style>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

// 6. BLOG VIEW
export const BlogView = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
        try {
            const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if(data) {
                setBlogs(data.map((b:any) => ({
                    id: b.id,
                    title: b.title,
                    author: b.author,
                    date: new Date(b.created_at).toLocaleDateString(),
                    category: b.category,
                    excerpt: b.excerpt,
                    content: b.content,
                    image: b.image_url || 'https://picsum.photos/800/400',
                    likes: 0,
                    comments: 0
                })));
            }
        } catch (err) {
            console.error("Fetch blogs error", err);
        } finally {
            setLoading(false);
        }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Latest Articles</h1>
        {loading ? <p className="text-center text-slate-500">Loading...</p> : (
            <div className="space-y-6">
                {blogs.map(blog => (
                    <div key={blog.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                        {blog.image && <img src={blog.image} className="w-full h-48 object-cover" />}
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">{blog.category}</span>
                                <span className="text-xs text-slate-400">{blog.date}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{blog.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{blog.excerpt}</p>
                            <button className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-1">Read Full Article <ChevronRight size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

// 7. SERMONS VIEW
export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    
    useEffect(() => {
        const fetchSermons = async () => {
            try {
                const { data, error } = await supabase.from('sermons').select('*').order('date_preached', { ascending: false });
                if (error) throw error;
                if (data) {
                    setSermons(data.map((s:any) => ({
                        id: s.id,
                        title: s.title,
                        preacher: s.preacher,
                        date: s.date_preached,
                        duration: s.duration,
                        videoUrl: s.video_url,
                        thumbnail: s.thumbnail_url || 'https://picsum.photos/800/450',
                        views: 0
                    })));
                }
            } catch (err) {
                console.error("Fetch sermons error", err);
            }
        };
        fetchSermons();
    }, []);

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Sermons</h1>
            <div className="space-y-4">
                {sermons.map(sermon => (
                    <div key={sermon.id} className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="w-24 h-24 rounded-xl bg-slate-200 shrink-0 relative overflow-hidden">
                            <img src={sermon.thumbnail} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="bg-white/90 p-1.5 rounded-full"><Play size={12} className="text-slate-900 ml-0.5"/></div>
                            </div>
                        </div>
                        <div className="flex-1 py-1">
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">{sermon.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{sermon.preacher}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1"><Calendar size={10}/> {sermon.date}</span>
                                <span className="flex items-center gap-1"><Clock size={10}/> {sermon.duration}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 8. MUSIC VIEW
export const MusicView = () => {
  // Simple Mock or Supabase fetch
  const playlists = MOCK_PLAYLISTS;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Worship Music</h1>
        {playlists.map(playlist => (
            <div key={playlist.id} className="mb-8">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-3">{playlist.name}</h3>
                <div className="space-y-3">
                    {playlist.tracks.map((track, idx) => (
                        <div key={track.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold text-sm w-4 text-center">{idx + 1}</span>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{track.title}</p>
                                    <p className="text-xs text-slate-500">{track.artist}</p>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-600 flex items-center justify-center">
                                <Play size={14} fill="currentColor" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        ))}
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
                    <p className="text-sm text-slate-500">Durban, South Africa</p>
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Service Times</h3>
                    <p className="text-sm text-slate-500">Sunday Service: 09:00 AM</p>
                    <p className="text-sm text-slate-500">Youth Meeting: Friday 06:00 PM</p>
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
    });

    const handleSave = () => {
        onUpdateUser(editData);
        setIsEditing(false);
    };

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h1>
            
            {/* Profile Card */}
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
                        <div className="flex gap-2 mt-2">
                             <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Save</button>
                             <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold text-sm">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user?.email}</p>
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-full border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Edit Profile</button>
                    </>
                )}
            </div>

            {/* Menu */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
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

                <button onClick={onLogout} className="w-full p-4 flex items-center justify-between text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                     <div className="flex items-center gap-3">
                         <LogOut size={20} />
                         <span className="font-medium">Log Out</span>
                     </div>
                </button>
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-6">Version 1.0.0 • Isipingo Community Church</p>
        </div>
    );
};
