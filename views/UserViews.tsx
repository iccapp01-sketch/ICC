
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut
} from 'lucide-react';
import { BlogPost, Sermon, CommunityGroup, ChatMessage, BibleVerse, Event, MusicTrack, Playlist, User as UserType } from '../types';
import { explainVerse } from '../services/geminiService';
import { supabase } from '../lib/supabaseClient';

// --- CONSTANTS ---
// Bible constants moved inside component or fetched dynamically

// --- MOCK DATA (Kept for parts not fully DB integrated yet) ---
const MOCK_PLAYLISTS: Playlist[] = [
  { 
    id: '1', name: 'Worship Essentials', tracks: [
      { id: '1', title: 'Amazing Grace', artist: 'ICC Worship Team', duration: '4:20', date: '2024', isOffline: true, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'MUSIC' },
      { id: '2', title: 'Way Maker', artist: 'ICC Worship Team', duration: '5:10', date: '2024', isOffline: false, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'MUSIC' },
    ]
  }
];

const DAILY_VERSE: BibleVerse = {
  reference: "Philippians 4:13",
  text: "I can do all things through Christ who strengthens me.",
  version: "NKJV"
};

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'COMMENT', text: 'Sarah replied to your comment in Youth Ministry.', time: '5m ago', unread: true },
  { id: 2, type: 'EVENT', text: 'Reminder: Sunday Service starts in 1 hour.', time: '1h ago', unread: true },
];

// --- HELPER FUNCTIONS ---
const getYouTubeID = (url: string) => {
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
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (data) {
        setEvents(data.map((e: any) => ({
           id: e.id,
           title: e.title,
           date: e.date,
           time: e.time,
           location: e.location,
           description: e.description,
           type: e.type,
           rsvpCount: 0
        })));
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleRSVP = (id: string) => {
    if (rsvped.includes(id)) {
        setRsvped(rsvped.filter(e => e !== id));
    } else {
        setRsvped([...rsvped, id]);
        // Here you would typically send this to the DB
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
                           <p className="text-xs text-slate-500 mt-2">{event.date}</p>
                        </div>
                     </div>
                  ) : (
                     <div>
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

// 3. MUSIC VIEW
export const MusicView = () => {
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (selectedTrack && audioRef.current) {
      audioRef.current.src = selectedTrack.url;
      audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      setIsPlaying(true);
    }
  }, [selectedTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  // --- Music Player Overlay ---
  if (selectedTrack) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col animate-slide-up">
        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          onTimeUpdate={handleTimeUpdate} 
          onEnded={() => setIsPlaying(false)}
        />

        {/* Header */}
        <div className="p-6 pt-12 flex justify-between items-center">
           <button onClick={() => setSelectedTrack(null)}><ChevronDown className="text-white" size={32}/></button>
           <h3 className="text-white font-medium tracking-wide text-sm uppercase opacity-80">Now Playing</h3>
           <button><MoreVertical className="text-white" size={24}/></button>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center p-8">
           <div className="w-full aspect-square bg-gradient-to-br from-blue-900 to-slate-800 rounded-3xl shadow-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
              <Music className="text-white/20 w-32 h-32" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           </div>
        </div>

        {/* Track Info */}
        <div className="px-8 mb-8">
           <h2 className="text-3xl font-bold text-white mb-2">{selectedTrack.title}</h2>
           <p className="text-slate-400 text-lg">{selectedTrack.artist}</p>
        </div>

        {/* Scrubber */}
        <div className="px-8 mb-6">
           <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
           </div>
           <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
              <span>--:--</span>
              <span>{selectedTrack.duration}</span>
           </div>
        </div>

        {/* Controls */}
        <div className="px-8 pb-16 flex items-center justify-between">
           <button><Shuffle className="text-slate-500" size={24}/></button>
           <button><SkipBack className="text-white fill-white" size={32}/></button>
           <button onClick={togglePlay} className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              {isPlaying ? <Pause className="text-white fill-white ml-1" size={32}/> : <Play className="text-white fill-white ml-1" size={32}/>}
           </button>
           <button><SkipForward className="text-white fill-white" size={32}/></button>
           <button><Repeat className="text-slate-500" size={24}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Music Library</h1>
      </div>

      <div className="space-y-6">
           {/* Offline Widget */}
           <div className="bg-gradient-to-br from-green-800 to-slate-800 p-4 rounded-2xl border border-green-500/20 shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-green-300 flex items-center gap-2"><Download size={16}/> Downloaded</h3>
                 <span className="bg-black/20 text-green-200 text-xs px-2 py-1 rounded-full">2 items</span>
              </div>
              <div className="space-y-2">
                 {MOCK_PLAYLISTS[0].tracks.slice(0, 2).map(track => (
                    <div key={track.id} onClick={() => setSelectedTrack(track)} className="flex justify-between items-center bg-black/20 hover:bg-black/40 p-3 rounded-xl transition cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white"><Music size={18}/></div>
                          <div>
                             <p className="text-sm font-bold text-white">{track.title}</p>
                             <p className="text-[10px] text-white/70">{track.artist}</p>
                          </div>
                       </div>
                       <div className="bg-green-500/20 p-2 rounded-full text-green-400">
                          <CheckCircle size={14} className="fill-current"/>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Playlists */}
           {MOCK_PLAYLISTS.map(playlist => (
              <div key={playlist.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white flex items-center gap-2"><Music size={18} className="text-blue-500"/> {playlist.name}</h3>
                 <div className="space-y-1">
                    {playlist.tracks.map((track, i) => (
                       <div key={i} onClick={() => setSelectedTrack(track)} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition">
                          <div className="flex items-center gap-3">
                             <span className="text-slate-400 w-4 text-center text-sm font-medium">{i+1}</span>
                             <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{track.title}</p>
                                <p className="text-xs text-slate-500">{track.artist} • {track.duration}</p>
                             </div>
                          </div>
                          <button className="text-slate-400 hover:text-blue-500"><Play size={16} fill="currentColor"/></button>
                       </div>
                    ))}
                 </div>
              </div>
           ))}
      </div>
    </div>
  )
}

// 4. SERMONS VIEW
export const SermonsView = () => {
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermons = async () => {
      const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
      if (data) {
        setSermons(data.map((s: any) => ({
           id: s.id,
           title: s.title,
           preacher: s.preacher,
           date: s.date_preached,
           duration: s.duration,
           videoUrl: s.video_url,
           thumbnail: s.thumbnail_url || 'https://picsum.photos/800/450?grayscale',
           views: 0
        })));
      }
      setLoading(false);
    };
    fetchSermons();
  }, []);

  // --- Sermon Detail View ---
  if (selectedSermon) {
    const videoId = selectedSermon.videoUrl ? getYouTubeID(selectedSermon.videoUrl) : null;

    return (
      <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col animate-slide-up overflow-y-auto">
         <div className="w-full aspect-video bg-black relative shrink-0 sticky top-0 z-10">
            {videoId ? (
               <iframe 
                 className="w-full h-full" 
                 src={`https://www.youtube.com/embed/${videoId}`} 
                 title={selectedSermon.title} 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen 
               />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white bg-red-600/50 px-4 py-2 rounded">Video unavailable</p>
                </div>
            )}
            <button onClick={() => setSelectedSermon(null)} className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white backdrop-blur">
              <ChevronDown size={24} />
            </button>
         </div>
         <div className="p-6 flex-1 bg-slate-900">
            <h1 className="text-2xl font-bold text-white mb-2">{selectedSermon.title}</h1>
            <p className="text-slate-400 mb-6">{selectedSermon.preacher} • {selectedSermon.date}</p>
            
            <div className="flex gap-4 mb-8">
               <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50">
                 <Play size={18} fill="currentColor"/> Watch
               </button>
               <button className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700">
                 <Download size={18}/> Save
               </button>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <h3 className="font-bold text-white mb-2">Description</h3>
               <p className="text-slate-400 text-sm leading-relaxed">
                 Join us as we explore the depths of this topic in our latest Sunday service. 
                 Be blessed and encouraged by the Word.
               </p>
            </div>
         </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
      <div className="mb-6">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sermons Archive</h1>
         <p className="text-slate-500 dark:text-slate-400 text-sm">Watch & Listen</p>
      </div>

      {loading ? <p className="text-center text-slate-500">Loading sermons...</p> : (
        <div className="space-y-6">
            {sermons.length === 0 && <p className="text-center text-slate-500">No sermons found.</p>}
            {sermons.map((sermon) => (
              <div key={sermon.id} onClick={() => setSelectedSermon(sermon)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-transform cursor-pointer">
                <div className="relative aspect-video">
                    <img src={sermon.thumbnail} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shadow-lg">
                        <Play className="fill-white text-white ml-1" size={24} />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-xs px-2 py-1 rounded font-medium">{sermon.duration}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{sermon.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{sermon.preacher} • {sermon.date}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Play size={12}/> {sermon.views} views</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12}/> Comment</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// 5. BIBLE VIEW (CONNECTED API - API.BIBLE)
export const BibleView = () => {
  const [activeTab, setActiveTab] = useState<'read' | 'plan' | 'bookmarks'>('read');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Verse of Day Interactions
  const [vodLikes, setVodLikes] = useState(127);
  const [vodLiked, setVodLiked] = useState(false);

  // Bible Reader State
  const [books, setBooks] = useState<{id: string, name: string}[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('GEN');
  const [selectedBookName, setSelectedBookName] = useState('Genesis');
  const [selectedChapter, setSelectedChapter] = useState('1');
  const [selectedVersionId, setSelectedVersionId] = useState('de4e12af7f28f599-01'); // Default KJV
  const [chapters, setChapters] = useState<string[]>([]);
  const [chapterContent, setChapterContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  const API_KEY = 'j6HVB3_hdmcH_ue5C6QMx';
  const BASE_URL = 'https://api.scripture.api.bible/v1';

  // Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bibles/${selectedVersionId}/books`, {
          headers: { 'api-key': API_KEY }
        });
        const data = await res.json();
        if (data.data) {
           setBooks(data.data.map((b: any) => ({ id: b.id, name: b.name })));
        }
      } catch (e) {
        console.error("Error fetching books:", e);
      }
    };
    fetchBooks();
  }, [selectedVersionId]);

  // Fetch Chapters
  useEffect(() => {
    const fetchChapters = async () => {
        try {
            const res = await fetch(`${BASE_URL}/bibles/${selectedVersionId}/books/${selectedBookId}/chapters`, {
                headers: { 'api-key': API_KEY }
            });
            const data = await res.json();
            if (data.data) {
                // API returns chapters like 'GEN.1', 'GEN.intro'. We only want numbers.
                const validChapters = data.data
                    .map((c: any) => c.number)
                    .filter((n: string) => !isNaN(parseInt(n)));
                setChapters(validChapters);
                if (!validChapters.includes(selectedChapter)) {
                    setSelectedChapter('1');
                }
            }
        } catch(e) { console.error("Error fetching chapters:", e); }
    };
    if (selectedBookId) fetchChapters();
  }, [selectedBookId, selectedVersionId]);

  // Fetch Content
  useEffect(() => {
    const fetchContent = async () => {
        setLoadingText(true);
        try {
            const chapterId = `${selectedBookId}.${selectedChapter}`;
            const res = await fetch(`${BASE_URL}/bibles/${selectedVersionId}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true`, {
                headers: { 'api-key': API_KEY }
            });
            const data = await res.json();
            if(data.data) {
               setChapterContent(data.data.content);
            } else {
               setChapterContent('<p>Content not available.</p>');
            }
        } catch (e) {
            setChapterContent('<p>Error loading content. Please check connection.</p>');
        } finally {
            setLoadingText(false);
        }
    };
    if (selectedBookId && selectedChapter) fetchContent();
  }, [selectedBookId, selectedChapter, selectedVersionId]);
  
  const handleAskAI = async () => {
    setLoadingAi(true);
    const result = await explainVerse(DAILY_VERSE.text, DAILY_VERSE.reference);
    setAiExplanation(result);
    setLoadingAi(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
        navigator.share({ title: 'Verse of the Day', text: `"${DAILY_VERSE.text}" - ${DAILY_VERSE.reference}` });
    } else {
        alert("Share not supported");
    }
  }

  // Inject Custom Styles for API.Bible HTML
  const bibleStyles = `
    .bible-content .v { font-weight: bold; font-size: 0.75em; vertical-align: super; margin-right: 4px; color: #aaa; }
    .bible-content p { margin-bottom: 1em; line-height: 1.8; }
    .bible-content .q { margin-left: 20px; font-style: italic; }
    .bible-content .wj { color: #d00; } /* Words of Jesus */
    .bible-content .s { font-weight: bold; font-size: 1.1em; display: block; margin: 1em 0 0.5em 0; } /* Section Headers */
  `;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      <style>{bibleStyles}</style>
      <div className="p-4 bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-3">
             <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-full">
               <BookOpen className="text-blue-600 dark:text-blue-400" size={24}/>
             </div>
             <div>
               <h1 className="font-bold text-xl text-slate-900 dark:text-white">Holy Bible</h1>
               <p className="text-xs text-slate-500 dark:text-slate-400">Read & Study</p>
             </div>
           </div>
        </div>
        
        {/* Verse of Day */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group shadow-lg mb-4">
          <img src="https://picsum.photos/600/600?grayscale&blur=2" className="absolute inset-0 w-full h-full object-cover opacity-60 transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">Verse of the Day</span>
                <button className="bg-white/20 p-1 rounded-full"><Bell size={12} className="text-white"/></button>
             </div>
             <h2 className="text-xl font-serif italic text-white mb-2 leading-tight">"{DAILY_VERSE.text}"</h2>
             <p className="text-white/80 font-medium mb-4 text-sm">- {DAILY_VERSE.reference} ({DAILY_VERSE.version})</p>
             
             <div className="flex gap-3">
               <button onClick={() => { setVodLiked(!vodLiked); setVodLikes(prev => vodLiked ? prev - 1 : prev + 1)}} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full backdrop-blur transition ${vodLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                 <Heart size={14} fill={vodLiked ? "currentColor" : "none"} /> {vodLikes}
               </button>
               <button className="flex items-center gap-1.5 text-white text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur transition">
                 <MessageCircle size={14} /> Comment
               </button>
               <button onClick={handleShare} className="flex items-center gap-1.5 text-white text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur transition">
                 <Share2 size={14} /> Share
               </button>
             </div>

             <button 
                onClick={handleAskAI}
                className="absolute top-4 right-4 flex items-center gap-2 bg-purple-600/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full hover:bg-purple-600 transition shadow-lg"
              >
                <Sparkles size={12} />
                {loadingAi ? 'Asking AI...' : 'Explain Verse'}
              </button>
          </div>
        </div>
        
        {aiExplanation && (
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30 rounded-xl text-sm animate-fade-in">
             <div className="flex justify-between items-start mb-2">
               <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2"><Sparkles size={14}/> Biblical Insight</h4>
               <button onClick={() => setAiExplanation(null)}><X size={14} className="text-slate-400"/></button>
             </div>
             <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{aiExplanation}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 px-2 pb-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-700">
         <button onClick={() => setActiveTab('read')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'read' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><BookOpen size={16}/> Read</button>
         <button onClick={() => setActiveTab('plan')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'plan' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><Calendar size={16}/> Reading Plan</button>
         <button onClick={() => setActiveTab('bookmarks')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'bookmarks' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><Bookmark size={16}/> Bookmarks</button>
      </div>
      
      {/* Bible Content */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-4 overflow-y-auto pb-24">
          
          {activeTab === 'read' && (
            <>
              {/* Controls */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 space-y-4">
                 <div className="flex gap-2">
                    <select 
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 outline-none text-sm" 
                      value={selectedBookId} 
                      onChange={e => {
                         const book = books.find(b => b.id === e.target.value);
                         setSelectedBookId(e.target.value);
                         if(book) setSelectedBookName(book.name);
                      }}
                    >
                        {books.length === 0 && <option>Loading Books...</option>}
                        {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select 
                      className="w-20 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 outline-none text-sm" 
                      value={selectedChapter} 
                      onChange={e => setSelectedChapter(e.target.value)}
                    >
                        {chapters.length === 0 && <option>...</option>}
                        {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                      className="w-24 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 outline-none text-sm" 
                      value={selectedVersionId} 
                      onChange={e => setSelectedVersionId(e.target.value)}
                    >
                       <option value="de4e12af7f28f599-01">KJV</option>
                       <option value="9879dbb7cfe39e4d-01">WEB</option>
                       <option value="06125adad2d5898a-01">ASV</option>
                    </select>
                 </div>
              </div>

              {/* Text Display */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[300px]">
                 {loadingText ? (
                    <div className="text-center py-10 text-slate-500">Loading scripture...</div>
                 ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center font-serif">{selectedBookName} {selectedChapter}</h2>
                        <div 
                          className="bible-content font-serif text-lg leading-loose text-slate-800 dark:text-slate-300"
                          dangerouslySetInnerHTML={{ __html: chapterContent }}
                        />
                    </div>
                 )}
              </div>
            </>
          )}

          {activeTab === 'plan' && (
             <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-2">Yearly Plan - Day 245</h3>
                    <p className="text-slate-500 mb-4">Read Psalms 119:1-80</p>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Start Reading</button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-2">New Testament in 90 Days</h3>
                    <p className="text-slate-500 mb-4">Matthew 5-7</p>
                    <button className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 py-2 rounded-lg font-bold">Continue</button>
                </div>
             </div>
          )}

          {activeTab === 'bookmarks' && (
             <div className="text-center py-10 text-slate-500">
                 <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
                 <p>No bookmarks yet.</p>
             </div>
          )}
      </div>
    </div>
  );
};

// 6. BLOG VIEW
export const BlogView = () => {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (data) {
        setBlogs(data.map((b: any) => ({
           id: b.id,
           title: b.title,
           author: b.author,
           date: new Date(b.created_at).toLocaleDateString(),
           category: b.category,
           excerpt: b.excerpt,
           content: b.content,
           image: b.image_url || 'https://picsum.photos/800/400',
           videoUrl: b.video_url,
           likes: 0,
           comments: 0
        })));
      }
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  const handleShare = async () => {
    if (navigator.share && selectedBlog) {
      try {
        await navigator.share({
          title: selectedBlog.title,
          text: selectedBlog.excerpt,
          url: window.location.href, // This would be the actual permalink
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('Share not supported on this device');
    }
  };

  if (selectedBlog) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 bg-white dark:bg-slate-800 flex items-center text-slate-900 dark:text-white sticky top-0 z-20 shadow-md border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setSelectedBlog(null)} className="mr-4 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium"><ArrowLeft size={20}/> Back</button>
          <h2 className="font-bold">Blog Article</h2>
        </div>
        <div className="flex-1 overflow-y-auto pb-24">
          {selectedBlog.videoUrl ? (
             <div className="w-full aspect-video bg-black flex items-center justify-center">
                <Play className="text-white w-12 h-12" />
             </div>
          ) : (
             <img src={selectedBlog.image} className="w-full h-72 object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
               <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-bold uppercase">{selectedBlog.category}</span>
               <span className="text-slate-500 text-xs">{selectedBlog.date}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white leading-tight">{selectedBlog.title}</h1>
            <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
               <User size={14} /> <span>{selectedBlog.author}</span>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-lg whitespace-pre-wrap">{selectedBlog.content}</p>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 flex items-center justify-between">
               <div className="flex gap-6">
                 <button onClick={() => setLiked(!liked)} className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'} transition`}>
                    <Heart size={24} fill={liked ? "currentColor" : "none"} />
                    <span className="text-sm font-medium">{selectedBlog.likes + (liked ? 1 : 0)}</span>
                 </button>
                 <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition">
                    <MessageCircle size={24} />
                    <span className="text-sm font-medium">{selectedBlog.comments}</span>
                 </button>
               </div>
               <button onClick={handleShare} className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition">
                  <Share2 size={24} />
                  <span className="text-sm font-medium">Share</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
      {/* Search & Header */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-full flex items-center shadow-sm border border-slate-200 dark:border-slate-700 mb-4">
           <Search size={18} className="text-slate-400 ml-2" />
           <input placeholder="Search blogs..." className="bg-transparent flex-1 ml-3 text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400" />
        </div>
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
           {['All Blogs', 'Faith', 'Testimony', 'Teaching', 'Devotional'].map((cat, i) => (
             <button key={cat} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold ${i === 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                {cat}
             </button>
           ))}
        </div>

        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Featured Blogs</h1>
      </div>

      {loading ? <p className="text-center text-slate-500">Loading articles...</p> : (
        <div className="space-y-6">
          {blogs.map(blog => (
            <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition">
              <div className="h-48 overflow-hidden relative">
                <img src={blog.image} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">Featured</div>
                {blog.videoUrl && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play className="text-white fill-white"/></div>}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">{blog.category}</span>
                   <span className="text-[10px] text-slate-400">• {blog.date}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white leading-tight">{blog.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">{blog.excerpt}</p>
                
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                   <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User size={12} /> {blog.author}
                   </div>
                   <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="text-blue-500 font-bold flex items-center gap-0.5">Read More <ChevronRight size={12}/></span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 7. COMMUNITY VIEW (WITH CHAT)
export const CommunityView = () => {
  const [activeGroup, setActiveGroup] = useState<CommunityGroup | null>(null);
  const [messages, setMessages] = useState<{id: number, user: string, text: string}[]>([
      { id: 1, user: 'Sarah', text: 'Hey everyone! Excited for the meetup.'},
      { id: 2, user: 'John', text: 'Me too! See you there.'}
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
     if(!newMessage.trim()) return;
     setMessages([...messages, { id: Date.now(), user: 'Me', text: newMessage}]);
     setNewMessage('');
  };

  if (activeGroup) {
     return (
       <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
         <div className="p-4 bg-white dark:bg-slate-800 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveGroup(null)}><ArrowLeft className="text-slate-500 dark:text-slate-400"/></button>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{activeGroup.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeGroup.membersCount} members</p>
              </div>
            </div>
            <button><MoreVertical className="text-slate-500 dark:text-slate-400" size={20}/></button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.user === 'Me' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.user === 'Me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'}`}>
                        {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.user}</span>
                </div>
            ))}
         </div>

         <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
             <input 
                className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 text-sm outline-none dark:text-white"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
             />
             <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-full"><Send size={18}/></button>
         </div>
       </div>
     )
  }

  const allGroups = [
    { id: '1', name: 'Youth Ministry', description: 'For young adults to connect.', membersCount: 45, isMember: true, status: 'Joined' as const },
    { id: '2', name: 'Worship Team', description: 'Musicians and leaders.', membersCount: 28, isMember: false, status: 'Pending' as const },
  ];

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
      <p className="text-xs text-slate-500 mb-4 ml-1">Join groups to connect with others</p>

      <div className="space-y-4">
        {allGroups.map(group => (
          <div key={group.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition">
             <div className="w-14 h-14 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-100 dark:border-slate-600">
               <Users size={28} />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-lg text-slate-900 dark:text-white">{group.name}</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{group.description}</p>
               <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded font-medium">{group.membersCount} members</span>
             </div>
             <button 
                onClick={() => group.isMember && setActiveGroup(group)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
               group.status === 'Joined' ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700' : 
               group.status === 'Pending' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
               'bg-[#0c2d58] text-white hover:bg-slate-800'
             }`}>
               {group.status === 'Joined' ? 'Chat' : group.status === 'Pending' ? 'Pending' : 'Join'}
             </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// 8. NOTIFICATIONS VIEW
export const NotificationsView = () => {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
       <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <button className="text-xs text-blue-500 font-bold">Mark all read</button>
       </div>

       <div className="space-y-4">
          {MOCK_NOTIFICATIONS.map(notif => (
             <div key={notif.id} className={`p-4 rounded-2xl flex gap-4 ${notif.unread ? 'bg-white dark:bg-slate-800 border-l-4 border-blue-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/50 opacity-80'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                   notif.type === 'COMMENT' ? 'bg-blue-100 text-blue-600' :
                   notif.type === 'EVENT' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                   <Bell size={18}/>
                </div>
                <div>
                   <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">{notif.text}</p>
                   <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                </div>
             </div>
          ))}
       </div>
    </div>
  )
}

// 9. CONTACT VIEW
export const ContactView = ({ onBack }: { onBack?: () => void }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-center animate-fade-in">
         <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600 dark:text-green-400"/>
         </div>
         <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h2>
         <p className="text-slate-500 dark:text-slate-400 mb-8">Thank you for reaching out. We will get back to you shortly.</p>
         <button onClick={onBack} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold">Return to Profile</button>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 pb-24">
       <div className="flex items-center gap-2 mb-6">
          <button onClick={onBack}><ArrowLeft className="text-slate-500 dark:text-slate-400" size={24}/></button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">We'd love to hear from you</p>
          </div>
       </div>

       <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <div>
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Full Name</label>
             <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="John Doe" />
          </div>
          <div>
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Email Address</label>
             <input required type="email" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="john@example.com" />
          </div>
          <div>
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Subject</label>
             <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500">
                <option>General Inquiry</option>
                <option>Prayer Request</option>
             </select>
          </div>
          <div>
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Message</label>
             <textarea required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 h-32 resize-none" placeholder="How can we help you?"></textarea>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition">
             Send Message
          </button>
       </form>
    </div>
  )
}

// 10. PROFILE VIEW
export const ProfileView = ({ 
  user,
  onUpdateUser,
  onLogout, 
  toggleTheme, 
  isDarkMode, 
  onNavigate 
}: { 
  user: UserType | null,
  onUpdateUser: (data: Partial<UserType>) => void,
  onLogout: () => void, 
  toggleTheme: () => void, 
  isDarkMode: boolean,
  onNavigate: (tab: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
     firstName: user?.firstName || '',
     lastName: user?.lastName || '',
     email: user?.email || '',
     phone: user?.phone || '',
     dob: user?.dob || '',
     gender: user?.gender || 'Female'
  });

  const handleSave = () => {
     onUpdateUser(editForm);
     setIsEditing(false);
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 p-4 pb-32">
       {/* Hero Profile Card */}
       <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 text-white text-center shadow-lg mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-2 border-white/30 uppercase">
              {user ? user.firstName.substring(0,2) : 'GU'}
            </div>
            <h2 className="text-2xl font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</h2>
            <p className="text-blue-200 text-sm">Member since {user ? new Date(user.joinedDate).getFullYear() : '2024'}</p>
          </div>
       </div>

       {/* Personal Details Section */}
       <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><User size={18}/> Personal Details</h3>
             <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${isEditing ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                {isEditing ? <><CheckCircle size={12}/> Save</> : <><Edit size={12}/> Edit</>}
             </button>
          </div>

          <div className="space-y-4">
             {/* Name Fields */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-slate-400 block mb-1">First Name</label>
                   {isEditing ? (
                      <input className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                   ) : (
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.firstName}</p>
                   )}
                </div>
                <div>
                   <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                   {isEditing ? (
                      <input className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                   ) : (
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.lastName}</p>
                   )}
                </div>
             </div>
             
             {/* Contact Fields */}
             <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-slate-400 block mb-1">Phone</label>
                   {isEditing ? (
                      <input className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                   ) : (
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.phone}</p>
                   )}
                </div>
                <div>
                   <label className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                   {isEditing ? (
                      <input type="date" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} />
                   ) : (
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.dob}</p>
                   )}
                </div>
             </div>

             <div>
                <label className="text-xs text-slate-400 block mb-1">Gender</label>
                {isEditing ? (
                   <select className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                   </select>
                ) : (
                   <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.gender}</p>
                )}
             </div>
          </div>
       </section>

       <div className="space-y-6">
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {/* Events Item */}
                <button onClick={() => onNavigate('events')} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition rounded-xl">
                   <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                      <Calendar size={20} />
                   </div>
                   <div className="text-left flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Events & Calendar</p>
                      <p className="text-xs text-slate-400">Upcoming activities</p>
                   </div>
                   <ChevronRight size={18} className="text-slate-300"/>
                </button>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4">
                   <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                         <Moon size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dark Mode</p>
                         <p className="text-xs text-slate-400">Adjust appearance</p>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className="sr-only peer" />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </label>
                </div>

                {/* Contact Us */}
                <button onClick={() => onNavigate('contact')} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition rounded-xl">
                   <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                      <Mail size={20} />
                   </div>
                   <div className="text-left flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Contact Us</p>
                      <p className="text-xs text-slate-400">Get in touch with us</p>
                   </div>
                   <ChevronRight size={18} className="text-slate-300"/>
                </button>
             </div>
          </section>

          <button onClick={onLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition mb-8">
             <LogOut size={20} /> Logout
          </button>
       </div>
    </div>
  )
}
