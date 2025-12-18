
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, ChevronUp, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video, UserPlus, Mic, Volume2, Link as LinkIcon, Copy, Info,
  Edit2, Save, Sun, Check, ArrowRight, Bookmark as BookmarkIcon, Film, MessageSquare, Reply, Facebook, Instagram, Loader2, Lock, ThumbsDown, Plus, Trash2, MoreHorizontal, Repeat1, Globe
} from 'lucide-react';
// Fixed: Removed missing 'Notification' member from types import
import { BlogPost, User as UserType, Sermon, CommunityGroup, GroupPost, BibleVerse, Event, MusicTrack, Playlist, Reel } from '../types';
import { supabase } from '../lib/supabaseClient';
import { explainVerse } from '../services/geminiService';
import { Logo } from '../components/Logo';

const getYouTubeID = (url: string) => { 
    if (!url) return null; 
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null; 
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
    } catch (e) {
        return '';
    }
};

// --- HELPER FOR MEDIA SHARING ---
const shareMediaFile = async (url: string, title: string, text: string) => {
    try {
        if (!navigator.share || !navigator.canShare) return false;
        
        const response = await fetch(url);
        const blob = await response.blob();
        const fileName = url.split('/').pop()?.split('?')[0] || 'media';
        const fileExt = fileName.split('.').pop() || (blob.type.includes('video') ? 'mp4' : 'jpg');
        const file = new File([blob], `icc_share.${fileExt}`, { type: blob.type });

        if (navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: title,
                text: text,
            });
            return true;
        }
    } catch (error) {
        console.warn("Media share failed:", error);
    }
    return false;
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
      const shareUrl = reel.video_url || window.location.href;
      if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      else if (navigator.share) await navigator.share({ title: reel.title, text: shareText, url: shareUrl });
  };

  return (
      <div className="p-4 space-y-6">
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
                  <div onClick={() => onNavigate('sermons')} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 cursor-pointer group">
                      <div className="w-28 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl bg-cover bg-center flex-shrink-0 relative overflow-hidden transition-transform group-hover:scale-105" style={{ backgroundImage: latestSermon.video_url && getYouTubeID(latestSermon.video_url) ? `url(https://img.youtube.com/vi/${getYouTubeID(latestSermon.video_url)}/hqdefault.jpg)` : 'none' }}>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play fill="white" className="text-white" size={24}/></div>
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">{latestSermon.title}</h4>
                          <p className="text-xs text-slate-500 mb-1">{latestSermon.preacher}</p>
                          <p className="text-[10px] text-slate-400">{formatDate(latestSermon.date_preached || latestSermon.created_at)}</p>
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
                              <p className="text-[10px] text-slate-400 mt-1">{formatDate(blog.created_at)}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );
};

interface TrackItemProps {
  track: MusicTrack;
  isPlaying: boolean;
  onClick: () => void;
  onAddToPlaylist?: () => void;
  onRemoveFromPlaylist?: () => void;
  isPodcast?: boolean;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, isPlaying, onClick, onAddToPlaylist, onRemoveFromPlaylist, isPodcast }) => {
    return (
        <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-2xl transition cursor-pointer ${isPlaying ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 border' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${isPlaying ? 'bg-blue-600' : 'bg-slate-400'}`}>
                {isPlaying ? <div className="flex gap-0.5 items-end h-4"><div className="w-1 bg-white animate-pulse h-2"></div><div className="w-1 bg-white animate-pulse h-4"></div><div className="w-1 bg-white animate-pulse h-3"></div></div> : isPodcast ? <Mic size={20}/> : <Music size={20}/>}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate dark:text-white">{track.title}</h4>
                <p className="text-xs text-slate-500 truncate">{track.artist}</p>
            </div>
            {onAddToPlaylist && <button onClick={(e)=>{e.stopPropagation(); onAddToPlaylist();}} className="p-2 text-slate-400 hover:text-blue-600"><Plus size={18}/></button>}
            {onRemoveFromPlaylist && <button onClick={(e)=>{e.stopPropagation(); onRemoveFromPlaylist();}} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>}
        </div>
    );
};

export const MusicView = () => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    useEffect(() => { const fetchTracks = async () => { const { data } = await supabase.from('music_tracks').select('*'); if(data) setTracks(data as any); }; fetchTracks(); }, []);
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-black dark:text-white">Media Library</h2>
            <div className="space-y-3 pb-32">
                {tracks.map(track => (
                    <TrackItem key={track.id} track={track} isPlaying={currentTrack?.id === track.id && isPlaying} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} />
                ))}
            </div>
        </div>
    );
};

export const BlogView = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost|null>(null);
    useEffect(() => { const fetchBlogs = async () => { const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }); if(data) setBlogs(data as any); }; fetchBlogs(); }, []);

    if (selectedBlog) {
        return (
            <div className="p-4 bg-white dark:bg-slate-900 min-h-full">
                <button onClick={() => setSelectedBlog(null)} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><ArrowLeft size={20} className="dark:text-white"/></button>
                {selectedBlog.image && <img src={selectedBlog.image} className="w-full h-56 object-cover rounded-[2rem] shadow-xl mb-6 border border-slate-100 dark:border-slate-700"/>}
                <h1 className="text-2xl font-black mb-2 dark:text-white">{selectedBlog.title}</h1>
                <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-wider">{formatDate(selectedBlog.created_at)}</p>
                <div className="prose dark:prose-invert max-w-none"><p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">{selectedBlog.content}</p></div>
            </div>
        );
    }
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-black mb-2 dark:text-white">Articles</h2>
            {blogs.map(blog => (
                <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer flex flex-col sm:flex-row gap-4">
                    {blog.image && <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm bg-cover bg-center" style={{backgroundImage: `url(${blog.image})`}}></div>}
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 text-lg">{blog.title}</h3>
                        <p className="text-xs text-slate-400">{formatDate(blog.created_at)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [playingId, setPlayingId] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchSermons = async () => {
            const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
            if(data) setSermons(data as any);
        };
        fetchSermons();
    }, []);

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-black dark:text-white mb-6">Sermon Library</h2>
            <div className="space-y-4 pb-20">
                {sermons.map(sermon => {
                    const ytId = getYouTubeID(sermon.video_url);
                    const thumb = sermon.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
                    const isPlaying = playingId === sermon.id;

                    return (
                        <div key={sermon.id} className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 p-4">
                            {isPlaying && ytId ? (
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-4 animate-fade-in relative">
                                    <button onClick={() => setPlayingId(null)} className="absolute top-2 right-2 z-10 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
                                    <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay"></iframe>
                                </div>
                            ) : (
                                <div className="flex gap-4 items-center">
                                    <div 
                                        onClick={() => ytId ? setPlayingId(sermon.id) : null}
                                        className="w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl bg-cover bg-center flex-shrink-0 relative cursor-pointer group overflow-hidden" 
                                        style={{ backgroundImage: `url(${thumb})` }}
                                    >
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                                            <Play fill="white" className="text-white drop-shadow-lg" size={24}/>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight mb-1">{sermon.title}</h3>
                                        <p className="text-xs text-slate-500 mb-1">{sermon.preacher}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <span>{formatDate(sermon.date_preached || sermon.created_at)}</span>
                                            {sermon.duration && (
                                                <>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>{sermon.duration}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const CommunityView = () => (
  <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <Users size={48} className="text-slate-300 mb-4" />
    <h2 className="text-xl font-bold dark:text-white">Groups</h2>
  </div>
);

export const BibleView = () => (
  <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <BookOpen size={48} className="text-slate-300 mb-4" />
    <h2 className="text-xl font-bold dark:text-white">Bible Tools</h2>
  </div>
);

export const EventsView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-4">
    <button onClick={onBack} className="mb-4 flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={18}/> Back</button>
    <h2 className="text-2xl font-black dark:text-white">Events</h2>
  </div>
);

export const NotificationsView = () => (
  <div className="p-4"><h2 className="text-2xl font-black dark:text-white">Notifications</h2></div>
);

export const ContactView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-4"><button onClick={onBack} className="mb-4 flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={18}/> Back</button></div>
);

export const ProfileView = ({ user, onLogout, toggleTheme, isDarkMode }: any) => (
  <div className="p-4 space-y-4">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] text-center border dark:border-slate-700 shadow-sm">
      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">{user?.firstName?.[0]}</div>
      <h2 className="text-xl font-black dark:text-white">{user?.firstName} {user?.lastName}</h2>
      <p className="text-sm text-slate-500">{user?.email}</p>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border dark:border-slate-700 overflow-hidden shadow-sm">
      <button onClick={toggleTheme} className="w-full flex items-center justify-between p-5 border-b dark:border-slate-700"><div className="flex items-center gap-3 font-bold dark:text-white">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}<span>Theme</span></div></button>
      <button onClick={onLogout} className="w-full flex items-center gap-3 p-5 text-red-500 font-bold"><LogOut size={20}/><span>Logout</span></button>
    </div>
  </div>
);
