
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Logo } from '../components/Logo';

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
             <div className="absolute bottom-4 right-4 opacity-10"><Logo className="w-16 h-16"/></div>
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

// --- GROUP CHAT (FIXED LAYOUT & VISIBILITY) ---
export const GroupChat = ({ group, onBack }: { group: CommunityGroup, onBack: () => void }) => {
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [newPostText, setNewPostText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null); // postId
    const [replyText, setReplyText] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch posts function
    const fetchPosts = useCallback(async () => {
        const { data } = await supabase
            .from('group_posts')
            .select('*, profiles(first_name, last_name, avatar_url), group_post_likes(user_id)')
            .eq('group_id', group.id)
            .order('created_at', { ascending: true });
        
        if (data) {
            setPosts(data as any);
        }
    }, [group.id]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();

        fetchPosts();
        
        // Setup Realtime Subscription
        const channel = supabase.channel(`group_${group.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_posts', filter: `group_id=eq.${group.id}` }, () => {
            fetchPosts(); 
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_post_likes' }, () => {
            fetchPosts(); 
        })
        .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [group.id, fetchPosts]);

    const handleLike = async (postId: string, isLiked: boolean) => {
        if (!userId) return;
        
        // 1. Optimistic Update (Immediate UI Change)
        setPosts(currentPosts => currentPosts.map(p => {
             if (p.id === postId) {
                 const likes = p.group_post_likes || [];
                 if (isLiked) {
                     return { ...p, group_post_likes: likes.filter(l => l.user_id !== userId) };
                 } else {
                     return { ...p, group_post_likes: [...likes, { user_id: userId }] };
                 }
             }
             return p;
        }));
        
        // 2. Database Update
        try {
            if (isLiked) {
                await supabase.from('group_post_likes').delete().match({ post_id: postId, user_id: userId });
            } else {
                await supabase.from('group_post_likes').insert({ post_id: postId, user_id: userId });
            }
        } catch (error) {
            console.error("Like error:", error);
            // Revert on error could be added here
            fetchPosts();
        }
    };

    const handleSend = async (parentId: string | null = null) => {
        const content = parentId ? replyText : newPostText;
        if (!content.trim() || !userId) return;

        // 1. Send to DB
        const { error } = await supabase.from('group_posts').insert({
            group_id: group.id,
            user_id: userId,
            content: content,
            parent_id: parentId
        });

        if (!error) {
            // 2. Clear Inputs
            if (parentId) {
                setReplyText('');
                setReplyingTo(null);
            } else {
                setNewPostText('');
                // Scroll to bottom only for main posts
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
            
            // 3. Force Fetch (Ensures your post appears immediately even if realtime is delayed)
            await fetchPosts();
        } else {
            console.error("Post Error:", error);
            if (error.code === '42P01') {
                alert("Database Error: The 'group_posts' table is missing. Please ask Admin to run SQL Fix.");
            } else {
                alert(`Failed to post: ${error.message}`);
            }
        }
    };

    // Filter root posts (comments)
    const rootPosts = posts.filter(p => !p.parent_id);

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100 dark:bg-slate-900">
            {/* Header */}
            <div className="flex-none bg-white dark:bg-slate-800 px-4 py-4 border-b dark:border-slate-700 flex items-center gap-3 shadow-sm z-10">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><ArrowLeft size={20} className="text-slate-600 dark:text-slate-300"/></button>
                <div className="flex items-center gap-3">
                    {group.image ? (
                        <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{backgroundImage: `url(${group.image})`}}></div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{group.name.substring(0,1)}</div>
                    )}
                    <div>
                        <h2 className="font-bold text-base dark:text-white leading-none">{group.name}</h2>
                        <p className="text-xs text-slate-500 mt-1">{group.membersCount || 0} Members</p>
                    </div>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-100 dark:bg-slate-900/50">
                {rootPosts.length === 0 && (
                    <div className="text-center py-20 opacity-60">
                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-300"/>
                        <p className="text-slate-500 font-medium">Start the conversation!</p>
                    </div>
                )}
                
                {rootPosts.map(post => {
                    const likes = post.group_post_likes || [];
                    const isLiked = userId ? likes.some((l: any) => l.user_id === userId) : false;
                    const replies = posts.filter(p => p.parent_id === post.id);

                    return (
                        <div key={post.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            {/* Main Post Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-sm overflow-hidden shadow-inner">
                                    {post.profiles?.avatar_url ? (
                                        <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        post.profiles?.first_name?.[0] || 'U'
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-base text-slate-900 dark:text-white">{post.profiles?.first_name} {post.profiles?.last_name}</p>
                                    <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                            </div>

                            {/* Main Post Content */}
                            <div className="mb-4">
                                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Actions Bar - IMPROVED UI */}
                            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                                <button 
                                    onClick={() => handleLike(post.id, isLiked)}
                                    className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                                        isLiked 
                                          ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    <Heart size={18} className={isLiked ? "fill-current" : ""} />
                                    <span>{likes.length > 0 ? likes.length : 'Like'}</span>
                                </button>
                                
                                <button 
                                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                    className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                                        replyingTo === post.id
                                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    <MessageSquare size={18} />
                                    <span>Reply</span>
                                </button>
                            </div>

                            {/* Replies Area - INDENTED */}
                            {(replies.length > 0 || replyingTo === post.id) && (
                                <div className="mt-4 pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-4">
                                    {replies.map(reply => (
                                        <div key={reply.id} className="flex gap-3">
                                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                                {reply.profiles?.first_name?.[0]}
                                            </div>
                                            <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 rounded-r-xl rounded-bl-xl p-3 border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="font-bold text-xs text-slate-900 dark:text-white">{reply.profiles?.first_name} {reply.profiles?.last_name}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(reply.created_at).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Nested Reply Input */}
                                    {replyingTo === post.id && (
                                        <div className="flex gap-3 items-start animate-fade-in mt-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-slate-700">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                                                Me
                                            </div>
                                            <div className="flex-1 relative">
                                                <input 
                                                    autoFocus
                                                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none pr-12 shadow-sm"
                                                    placeholder={`Reply to ${post.profiles?.first_name}...`}
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleSend(post.id)}
                                                />
                                                <button 
                                                    onClick={() => handleSend(post.id)}
                                                    disabled={!replyText.trim()}
                                                    className="absolute right-1 top-1 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-full disabled:opacity-50 transition"
                                                >
                                                    <Send size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-8 md:pb-6 z-20">
                <div className="max-w-3xl mx-auto">
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 ml-1">Add a comment:</label>
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner">
                            <input 
                                ref={inputRef}
                                className="w-full bg-transparent border-none text-base dark:text-white focus:outline-none placeholder-slate-400"
                                placeholder="Type your message here..."
                                value={newPostText}
                                onChange={e => setNewPostText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            />
                        </div>
                        <button 
                            onClick={() => handleSend()} 
                            disabled={!newPostText.trim()}
                            className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
                        >
                            <Send size={22}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BibleView = () => {
    const [book, setBook] = useState('John');
    const [chapter, setChapter] = useState(1);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'read' | 'plan'>('read');
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    useEffect(() => { fetchText(); setExplanation(''); }, [book, chapter]);

    const fetchText = async () => {
        setLoading(true);
        try {
            const encodedBook = encodeURIComponent(book);
            const res = await fetch(`https://corsproxy.io/?` + encodeURIComponent(`https://bible-api.com/${encodedBook}+${chapter}`));
            const data = await res.json();
            setText(data.text || "Text not found.");
        } catch (e) { setText("Could not fetch scripture."); } finally { setLoading(false); }
    };
    
    const handleExplain = async () => {
        if (!text) return;
        setIsExplaining(true);
        try { const insight = await explainVerse(text, `${book} ${chapter}`); setExplanation(insight); } catch (e) { setExplanation("Error getting insight."); } finally { setIsExplaining(false); }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
             <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10 sticky top-0 shadow-sm">
                 <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                     <button onClick={()=>setActiveTab('read')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab==='read' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Scripture</button>
                     <button onClick={()=>setActiveTab('plan')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab==='plan' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Reading Plan</button>
                 </div>
             </div>
             {activeTab === 'read' && (
                 <div className="flex-1 overflow-y-auto p-6 pb-24">
                     <h2 className="text-xl font-bold text-center mb-6 text-slate-400 uppercase">{book} {chapter}</h2>
                     {loading ? <div className="text-center">Loading...</div> : <p className="text-lg leading-loose font-serif whitespace-pre-wrap text-slate-800 dark:text-slate-200">{text}</p>}
                     <div className="mt-8 flex justify-center">{!explanation && <button onClick={handleExplain} className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2"><Sparkles size={16}/> AI Insight</button>}</div>
                     {explanation && <div className="mt-6 bg-blue-50 dark:bg-slate-800 p-4 rounded-2xl border border-blue-100 dark:border-slate-700"><p className="text-sm">{explanation}</p></div>}
                     <div className="mt-8 flex justify-center pb-8"><button onClick={()=>setChapter(c=>c+1)} className="bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-full font-bold text-sm">Next Chapter</button></div>
                 </div>
             )}
        </div>
    );
};

export const EventsView = ({ onBack }: any) => {
    const [events, setEvents] = useState<Event[]>([]);
    useEffect(() => { const fetchEvents = async () => { const { data } = await supabase.from('events').select('*').order('date', { ascending: true }); if(data) setEvents(data as any); }; fetchEvents(); }, []);
    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Events</h1>
            {events.map(ev => (<div key={ev.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-4 border dark:border-slate-700"><h3 className="font-bold dark:text-white">{ev.title}</h3><p className="text-sm text-slate-500">{ev.description}</p></div>))}
        </div>
    );
};

export const MusicView = () => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    useEffect(() => { const fetchTracks = async () => { const { data } = await supabase.from('music_tracks').select('*'); if(data) setTracks(data as any); }; fetchTracks(); }, []);
    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Music</h1>
            {tracks.map(track => (<div key={track.id} onClick={()=>setCurrentTrack(track)} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-2xl mb-2 cursor-pointer border dark:border-slate-700"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Music size={18}/></div><div><h4 className="font-bold text-sm dark:text-white">{track.title}</h4></div></div>))}
            {currentTrack && (<div className="fixed bottom-20 left-4 right-4 bg-slate-900 text-white p-4 rounded-2xl flex justify-between shadow-lg z-50"><div><p className="font-bold text-sm">{currentTrack.title}</p></div><audio src={currentTrack.url} controls autoPlay className="h-8 w-32"/></div>)}
        </div>
    );
};

export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    useEffect(() => { const fetchSermons = async () => { const { data } = await supabase.from('sermons').select('*'); if(data) setSermons(data as any); }; fetchSermons(); }, []);
    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Sermons</h1>
            <div className="grid gap-6">{sermons.map(s => (<div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border dark:border-slate-700"><div className="h-48 bg-slate-200 bg-cover bg-center" style={{ backgroundImage: s.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(s.videoUrl ?? "")}/mqdefault.jpg)` : 'none' }}></div><div className="p-4"><h3 className="font-bold dark:text-white">{s.title}</h3></div></div>))}</div>
        </div>
    );
};

export const BlogView = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
    useEffect(() => { const fetchBlogs = async () => { const { data } = await supabase.from('blog_posts').select('*'); if(data) setBlogs(data.map((b: any) => ({...b, image: b.image_url}))); }; fetchBlogs(); }, []);
    if (selectedBlog) return <div className="p-4 pb-24"><button onClick={()=>setSelectedBlog(null)} className="mb-4 flex items-center gap-2"><ArrowLeft size={16}/> Back</button><h1 className="text-2xl font-bold dark:text-white">{selectedBlog.title}</h1><p className="dark:text-white mt-4">{selectedBlog.content}</p></div>;
    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Articles</h1>
            <div className="grid gap-6">{blogs.map(blog => (<div key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700"><h3 className="font-bold dark:text-white">{blog.title}</h3><p className="text-xs text-slate-500">{blog.excerpt}</p></div>))}</div>
        </div>
    );
};

export const ContactView = ({ onBack }: { onBack: () => void }) => (<div className="p-4 pb-24"><button onClick={onBack} className="mb-6 flex items-center gap-2"><ArrowLeft size={16}/> Back</button><h1 className="text-2xl font-black dark:text-white">Contact</h1><p className="dark:text-white">info@isipingochurch.com</p></div>);

export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
    if(!user) return <div className="p-4 text-center">Please log in.</div>;
    return (
        <div className="p-4 pb-24">
            <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-black dark:text-white">My Profile</h1><button onClick={onLogout} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded">Logout</button></div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 mb-3">{user.firstName[0]}{user.lastName[0]}</div>
                <h2 className="text-xl font-black dark:text-white">{user.firstName} {user.lastName}</h2>
            </div>
            <button onClick={toggleTheme} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex justify-between shadow-sm border dark:border-slate-700 mb-4"><span className="dark:text-white">Dark Mode</span><div className={`w-10 h-5 rounded-full p-1 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : ''}`}></div></div></button>
            <button onClick={()=>onNavigate('contact')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex justify-between shadow-sm border dark:border-slate-700"><span className="dark:text-white">Contact Us</span><ChevronRight size={16}/></button>
        </div>
    );
};

export const NotificationsView = () => <div className="p-4 pb-24"><h1 className="text-2xl font-black dark:text-white">Notifications</h1><p className="text-center text-slate-500">No new notifications.</p></div>;

export const CommunityView = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
    const [myMemberships, setMyMemberships] = useState<Record<string, string>>({}); 

    useEffect(() => { fetchGroups(); }, []);
    const fetchGroups = async () => {
        const { data: groupsData } = await supabase.from('community_groups').select('*');
        if (groupsData) setGroups(groupsData as any);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: membersData } = await supabase.from('community_group_members').select('group_id, status').eq('user_id', user.id);
            if (membersData) { const map: any = {}; membersData.forEach((m:any) => map[m.group_id] = m.status); setMyMemberships(map); }
        }
    };

    const handleJoin = async (groupId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from('community_group_members').insert({ group_id: groupId, user_id: user.id, status: 'Pending' });
        if (!error) { setMyMemberships({...myMemberships, [groupId]: 'Pending'}); alert("Request sent."); }
    };

    if (selectedGroup) return <GroupChat group={selectedGroup} onBack={() => setSelectedGroup(null)} />;

    return (
        <div className="p-4 pb-24 space-y-6">
            <h1 className="text-2xl font-black dark:text-white">Groups</h1>
             {groups.map(group => {
                 const status = myMemberships[group.id];
                 return (
                    <div key={group.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border dark:border-slate-700">
                        <h3 className="font-bold text-lg dark:text-white">{group.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{group.description}</p>
                        {status === 'Approved' ? <button onClick={() => setSelectedGroup(group)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Enter Group</button> : 
                         status === 'Pending' ? <button disabled className="w-full bg-orange-100 text-orange-600 py-3 rounded-xl font-bold">Pending</button> :
                         <button onClick={() => handleJoin(group.id)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Join Group</button>}
                    </div>
                 );
             })}
        </div>
    );
};
