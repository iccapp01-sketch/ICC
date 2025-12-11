
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, ChevronUp, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video, UserPlus, Mic, Volume2, Link as LinkIcon, Copy, Info,
  Edit2, Save, Sun, Check, ArrowRight, Bookmark as BookmarkIcon, Film, MessageSquare, Reply, Facebook, Instagram, Loader2, Lock
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
      // Prioritize embed_url but fallback to video_url
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
                                  <button onClick={() => handleShareReel(reel, 'whatsapp')} className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow hover:scale-110 transition"><MessageCircle size={12} /></button>
                                  <button onClick={() => handleShareReel(reel, 'facebook')} className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow hover:scale-110 transition"><Facebook size={12} /></button>
                                  <button onClick={() => handleShareReel(reel, 'instagram')} className="w-7 h-7 bg-pink-600 rounded-full flex items-center justify-center text-white shadow hover:scale-110 transition"><Instagram size={12} /></button>
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
    const [progress, setProgress] = useState<{book: string, chapter: number, updated_at: string} | null>(null);
    
    // AI Integration State
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    useEffect(() => {
        fetchProgress();
    }, []);

    useEffect(() => {
        fetchText();
        saveProgress();
        setExplanation('');
    }, [book, chapter]);

    const fetchProgress = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        
        try {
            const { data } = await supabase.from('user_bible_progress').select('*').eq('user_id', user.id).single();
            if (data) setProgress(data);
        } catch (e) {
            console.log("No progress found");
        }
    };

    const saveProgress = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        try {
            const { error } = await supabase.from('user_bible_progress').upsert({
                user_id: user.id,
                book,
                chapter,
                last_read_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            if(!error) setProgress({ book, chapter, updated_at: new Date().toISOString() });
        } catch(e) {}
    };

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

    const continueReading = () => {
        if(progress) {
            setBook(progress.book);
            setChapter(progress.chapter);
            setActiveTab('read');
        }
    };

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
                 <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 pb-32">
                     <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                         <h3 className="text-lg font-black dark:text-white mb-2">Current Read</h3>
                         {progress ? (
                             <div>
                                 <div className="flex items-center gap-3 mb-4">
                                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><BookmarkIcon size={20}/></div>
                                     <div>
                                         <p className="font-bold text-slate-900 dark:text-white text-xl">{progress.book} {progress.chapter}</p>
                                         <p className="text-xs text-slate-500">Last read: {new Date(progress.updated_at).toLocaleDateString()}</p>
                                     </div>
                                 </div>
                                 <button onClick={continueReading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"><BookOpen size={18}/> Continue Reading</button>
                             </div>
                         ) : (
                             <div className="text-center py-6 text-slate-500">
                                 <p className="mb-4">Start reading the Bible to track your progress here.</p>
                                 <button onClick={()=>setActiveTab('read')} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-white">Go to Bible</button>
                             </div>
                         )}
                     </div>

                     <h3 className="font-bold text-slate-900 dark:text-white mb-4 px-2">Reading Plans</h3>
                     <div className="grid gap-3">
                         {['New Testament in 90 Days', 'Psalms & Proverbs', 'The Gospels', 'Whole Bible in a Year'].map((plan, i) => (
                             <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between opacity-70">
                                 <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{plan}</span>
                                 <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">Coming Soon</span>
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
    const [myRsvps, setMyRsvps] = useState<{[key: string]: string}>({});

    useEffect(() => {
        fetchEvents();
        fetchMyRsvps();
    }, []);

    const fetchEvents = async () => { 
        const { data } = await supabase.from('events').select('*').order('date', { ascending: true }); 
        if(data) setEvents(data as any); 
    };

    const fetchMyRsvps = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            const { data } = await supabase.from('event_rsvps').select('*').eq('user_id', user.id);
            if(data) {
                const rsvpMap: {[key: string]: string} = {};
                data.forEach((r: any) => rsvpMap[r.event_id] = r.status);
                setMyRsvps(rsvpMap);
            }
        }
    };

    const handleSubmitRSVP = async (eventId: string, status: string) => {
        if(!status) return;
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
             const { error } = await supabase.from('event_rsvps').upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: 'event_id,user_id' });
             if(!error) setMyRsvps({...myRsvps, [eventId]: status});
        }
    };

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Events & Announcements</h1>
            {events.length === 0 && <p className="text-slate-500 text-center">No upcoming events.</p>}
            {events.map(ev => {
                const isAnnouncement = ev.type === 'ANNOUNCEMENT';
                const myStatus = myRsvps[ev.id];
                return (
                    <div key={ev.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-6 border dark:border-slate-700 shadow-sm">
                        <div className="mb-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${isAnnouncement ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{isAnnouncement ? 'Announcement' : 'Event'}</span></div>
                        {ev.image && <div className="h-32 bg-cover bg-center rounded-2xl mb-4" style={{backgroundImage: `url(${ev.image})`}}></div>}
                        <h3 className="text-lg font-bold dark:text-white mb-2 leading-tight">{ev.title}</h3>
                        {!isAnnouncement && (
                            <div className="flex flex-col gap-1 mb-3 text-xs text-slate-500">
                                <div className="flex items-center gap-2"><Calendar size={14}/> {ev.date}</div>
                                <div className="flex items-center gap-2"><Clock size={14}/> {ev.time}</div>
                                {ev.location && <div className="flex items-center gap-2"><MapPin size={14}/> {ev.location}</div>}
                            </div>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{ev.description}</p>
                        {!isAnnouncement && (
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">RSVP:</span>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                                    {['Yes', 'No', 'Maybe'].map(opt => (
                                        <button key={opt} onClick={() => handleSubmitRSVP(ev.id, opt)} className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${myStatus === opt ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// --- MUSIC VIEW ---
export const MusicView = () => {
    const [activeTab, setActiveTab] = useState<'MUSIC' | 'PODCAST' | 'MY_PLAYLISTS'>('MUSIC');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState<string | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if(activeTab === 'MY_PLAYLISTS') fetchPlaylists();
        else fetchTracks();
    }, [activeTab]);

    const fetchTracks = async () => { const { data } = await supabase.from('music_tracks').select('*').eq('type', activeTab); if(data) setTracks(data as any); };
    const fetchPlaylists = async () => { const { data: { user } } = await supabase.auth.getUser(); if(user) { const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id); if(data) setPlaylists(data.map((p:any) => ({...p, name: p.title}))); } };

    useEffect(() => {
        if (currentTrack && audioRef.current && !currentTrack.url.includes('youtube')) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Playback error", e));
        } else if (currentTrack?.url.includes('youtube')) {
            setIsPlaying(true);
        }
    }, [currentTrack]);

    const togglePlay = () => { if (audioRef.current) { if (isPlaying) audioRef.current.pause(); else audioRef.current.play(); setIsPlaying(!isPlaying); } };
    const playNext = () => { if(!currentTrack) return; const idx = tracks.findIndex(t => t.id === currentTrack.id); if(idx !== -1 && idx < tracks.length - 1) setCurrentTrack(tracks[idx + 1]); };
    const playPrev = () => { if(!currentTrack) return; const idx = tracks.findIndex(t => t.id === currentTrack.id); if(idx > 0) setCurrentTrack(tracks[idx - 1]); };

    const handleCreatePlaylist = async () => {
        if(!newPlaylistName) return;
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        await supabase.from('playlists').insert({ title: newPlaylistName, user_id: user.id, tracks: [] });
        setNewPlaylistName('');
        fetchPlaylists();
    };

    const addToPlaylist = async (playlistId: string, track: MusicTrack) => {
        const playlist = playlists.find(p => p.id === playlistId);
        if(!playlist) return;
        const newTracks = [...(playlist.tracks || []), track];
        await supabase.from('playlists').update({ tracks: newTracks }).eq('id', playlistId);
        setShowPlaylistModal(null);
    };

    return (
        <div className="h-full flex flex-col pb-24">
            {currentTrack && (
                <div className="px-4 pt-4 pb-2">
                    <div className={`bg-slate-900 text-white rounded-3xl shadow-lg p-4 flex flex-col cursor-pointer border border-white/10`} onClick={() => setIsFullScreen(true)}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg"><Music size={24} className="text-blue-400"/></div>
                            <div className="flex-1 min-w-0"><h4 className="font-bold text-base truncate leading-tight">{currentTrack.title}</h4><p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p></div>
                            <div className="flex items-center gap-3">
                                <button onClick={(e)=>{e.stopPropagation(); playPrev();}} className="p-2 hover:bg-white/10 rounded-full"><SkipBack size={20}/></button>
                                <button onClick={(e)=>{e.stopPropagation(); togglePlay();}} className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition">{isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}</button>
                                <button onClick={(e)=>{e.stopPropagation(); playNext();}} className="p-2 hover:bg-white/10 rounded-full"><SkipForward size={20}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="px-4 py-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['MUSIC', 'PODCAST', 'MY_PLAYLISTS'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${activeTab === tab ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-50'}`}>{tab.replace('_', ' ')}</button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {activeTab === 'MY_PLAYLISTS' ? (
                     <div>
                         <div className="flex gap-2 mb-4">
                             <input className="flex-1 border p-2 rounded-xl" placeholder="New Playlist Name" value={newPlaylistName} onChange={e=>setNewPlaylistName(e.target.value)} />
                             <button onClick={handleCreatePlaylist} className="bg-blue-600 text-white px-4 rounded-xl font-bold text-xs">Create</button>
                         </div>
                         {playlists.map(p => (
                             <div key={p.id} onClick={() => { setTracks(p.tracks || []); if(p.tracks?.length) setCurrentTrack(p.tracks[0]); }} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-2 cursor-pointer border border-slate-100 dark:border-slate-700">
                                 <h4 className="font-bold dark:text-white">{p.name}</h4>
                                 <p className="text-xs text-slate-500">{p.tracks?.length || 0} tracks</p>
                             </div>
                         ))}
                     </div>
                 ) : (
                    tracks.map(track => (
                        <div key={track.id} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <div onClick={() => setCurrentTrack(track)} className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold flex-shrink-0"><Music size={20}/></div>
                            <div onClick={() => setCurrentTrack(track)} className="flex-1 min-w-0"><h4 className={`font-bold text-sm truncate ${currentTrack?.id===track.id ? 'text-blue-600':'dark:text-white'}`}>{track.title}</h4><p className="text-xs text-slate-500 truncate">{track.artist}</p></div>
                            <button onClick={()=>setShowPlaylistModal(track.id)} className="p-2 text-slate-400 hover:text-blue-600"><ListMusic size={16}/></button>
                            {showPlaylistModal === track.id && (
                                <div className="absolute right-8 bg-white shadow-xl rounded-xl p-2 z-10 border border-slate-100">
                                    <p className="text-xs font-bold mb-2 px-2">Add to Playlist:</p>
                                    {playlists.map(p => (
                                        <button key={p.id} onClick={()=>addToPlaylist(p.id, track)} className="block w-full text-left px-2 py-1 text-xs hover:bg-slate-50 rounded">{p.name}</button>
                                    ))}
                                    <button onClick={()=>setShowPlaylistModal(null)} className="w-full text-center text-xs text-red-500 mt-2 border-t pt-1">Cancel</button>
                                </div>
                            )}
                        </div>
                    ))
                 )}
            </div>
            {isFullScreen && currentTrack && (
                <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col p-8 text-white">
                    <button onClick={()=>setIsFullScreen(false)} className="self-center mb-8 bg-white/10 p-2 rounded-full"><ChevronDown/></button>
                    {currentTrack.url.includes('youtube') ? (
                         <div className="w-full aspect-square bg-black rounded-3xl mb-8 overflow-hidden shadow-2xl">
                             <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeID(currentTrack.url ?? "")}?autoplay=1&controls=0`} allow="autoplay"></iframe>
                         </div>
                    ) : (
                        <div className="w-full aspect-square bg-gradient-to-br from-blue-900 to-slate-800 rounded-3xl mb-8 flex items-center justify-center shadow-2xl border border-white/5"><Music size={120} className="text-white/20"/></div>
                    )}
                    <div className="mt-auto">
                        <h2 className="text-3xl font-bold mb-2 leading-tight">{currentTrack.title}</h2>
                        <p className="text-xl text-slate-400 mb-8 font-medium">{currentTrack.artist}</p>
                        <div className="flex justify-between items-center mb-8">
                             <button className="text-slate-400 hover:text-white"><Shuffle size={24}/></button>
                             <button onClick={playPrev} className="text-white hover:text-blue-400"><SkipBack size={32}/></button>
                             <button className="w-20 h-20 bg-blue-600 rounded-full text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition flex items-center justify-center" onClick={togglePlay}>{isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}</button>
                             <button onClick={playNext} className="text-white hover:text-blue-400"><SkipForward size={32}/></button>
                             <button className="text-slate-400 hover:text-white"><Repeat size={24}/></button>
                        </div>
                    </div>
                </div>
            )}
            {!currentTrack?.url.includes('youtube') && <audio ref={audioRef} onEnded={() => {setIsPlaying(false); playNext();}} />}
        </div>
    );
};

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
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
        }
    };

    const rootPosts = posts.filter(p => !p.parent_id);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 absolute inset-0 z-50">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-4 border-b dark:border-slate-700 flex items-center gap-3 shadow-sm z-10">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><ArrowLeft size={20} className="text-slate-600 dark:text-slate-300"/></button>
                <div>
                    <h2 className="font-bold text-lg dark:text-white leading-none">{group.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">{group.membersCount || 0} Members</p>
                </div>
            </div>

            {/* Posts List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {rootPosts.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <MessageSquare size={48} className="mx-auto mb-2"/>
                        <p>No posts yet. Start the conversation!</p>
                    </div>
                )}
                
                {rootPosts.map(post => {
                    const likes = post.group_post_likes || [];
                    const isLiked = userId ? likes.some((l: any) => l.user_id === userId) : false;
                    const replies = posts.filter(p => p.parent_id === post.id);

                    return (
                        <div key={post.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            {/* Author Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {post.profiles?.first_name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{post.profiles?.first_name} {post.profiles?.last_name}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-slate-800 dark:text-slate-200 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                                <button 
                                    onClick={() => handleLike(post.id, isLiked)}
                                    className={`flex items-center gap-1.5 text-xs font-bold transition ${isLiked ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    <ThumbsUp size={16} fill={isLiked ? "currentColor" : "none"} />
                                    {likes.length > 0 ? likes.length : 'Like'}
                                </button>
                                <button 
                                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 transition"
                                >
                                    <MessageSquare size={16} />
                                    Reply
                                </button>
                            </div>

                            {/* Replies Section */}
                            {(replies.length > 0 || replyingTo === post.id) && (
                                <div className="mt-4 pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-4">
                                    {replies.map(reply => (
                                        <div key={reply.id} className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-xs text-slate-900 dark:text-white">{reply.profiles?.first_name} {reply.profiles?.last_name}</span>
                                                <span className="text-[10px] text-slate-400">• {new Date(reply.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-xs text-slate-700 dark:text-slate-300">{reply.content}</p>
                                        </div>
                                    ))}

                                    {/* Reply Input */}
                                    {replyingTo === post.id && (
                                        <div className="flex gap-2 animate-fade-in mt-2">
                                            <input 
                                                autoFocus
                                                className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-xl px-3 py-2 text-xs dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSend(post.id)}
                                            />
                                            <button 
                                                onClick={() => handleSend(post.id)}
                                                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"
                                            >
                                                <Send size={14}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Main Input Area */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 fixed bottom-0 w-full z-20">
                <div className="flex gap-2 items-end">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 flex items-center">
                        <input 
                            className="w-full bg-transparent border-none text-sm dark:text-white focus:outline-none max-h-24"
                            placeholder="Share something with the group..."
                            value={newPostText}
                            onChange={e => setNewPostText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        />
                    </div>
                    <button 
                        onClick={() => handleSend()} 
                        disabled={!newPostText.trim()}
                        className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                    >
                        <Send size={20}/>
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

// --- NOTIFICATIONS VIEW ---
export const NotificationsView = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Mock notifications or fetch from DB
        setNotifications([
            { id: '1', title: 'New Sermon Uploaded', message: 'Pastor David uploaded "Faith in Action".', type: 'ANNOUNCEMENT', created_at: new Date().toISOString(), isRead: false },
            { id: '2', title: 'Event Reminder', message: 'Youth Night is tomorrow at 6 PM.', type: 'EVENT', created_at: new Date(Date.now() - 86400000).toISOString(), isRead: true }
        ]);
    }, []);

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Notifications</h1>
            <div className="space-y-3">
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-2xl border ${notif.isRead ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-blue-50 dark:bg-slate-800 border-blue-100 dark:border-blue-900'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm dark:text-white">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{notif.message}</p>
                    </div>
                ))}
                {notifications.length === 0 && <p className="text-center text-slate-500 py-10">No new notifications.</p>}
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
            <div className="bg-white dark:bg-slate-900 min-h-full pb-24">
                <div className="relative h-64 md:h-80 w-full">
                    <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${selectedBlog.image})`}}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <button onClick={()=>setSelectedBlog(null)} className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white backdrop-blur-md"><ArrowLeft size={20}/></button>
                </div>
                <div className="px-5 -mt-10 relative z-10">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{selectedBlog.category}</span>
                            <span className="text-[10px] text-slate-400">• {new Date(selectedBlog.date).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{selectedBlog.title}</h1>
                        <p className="text-xs text-slate-500 font-bold mb-6">By {selectedBlog.author}</p>
                        
                        <div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {selectedBlog.content}
                        </div>

                         {selectedBlog.videoUrl && (
                             <div className="mt-8 rounded-2xl overflow-hidden shadow-lg">
                                  <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${getYouTubeID(selectedBlog.videoUrl)}`} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Articles & Devotionals</h1>
            <div className="grid gap-6">
                {blogs.map(blog => (
                    <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="group cursor-pointer">
                        <div className="h-48 w-full bg-cover bg-center rounded-2xl mb-3 shadow-sm relative overflow-hidden" style={{backgroundImage: `url(${blog.image})`}}>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                        </div>
                        <h3 className="font-bold text-lg dark:text-white leading-tight mb-1 group-hover:text-blue-600 transition">{blog.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{blog.excerpt}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{blog.category}</span>
                            <span>•</span>
                            <span>{new Date(blog.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SERMONS VIEW ---
export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [playingSermon, setPlayingSermon] = useState<Sermon | null>(null);

    useEffect(() => {
         const fetchSermons = async () => {
             const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
             if(data) setSermons(data as any);
         };
         fetchSermons();
    }, []);

    if (playingSermon) {
        return (
             <div className="flex flex-col h-full bg-black">
                 <div className="relative w-full aspect-video bg-black">
                     <iframe 
                        src={`https://www.youtube.com/embed/${getYouTubeID(playingSermon.videoUrl || "")}?autoplay=1`} 
                        className="w-full h-full" 
                        allowFullScreen 
                        allow="autoplay"
                     ></iframe>
                     <button onClick={()=>setPlayingSermon(null)} className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full"><ChevronDown size={24} className="rotate-90"/></button>
                 </div>
                 <div className="flex-1 bg-white dark:bg-slate-900 p-6 overflow-y-auto">
                     <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{playingSermon.title}</h1>
                     <p className="text-sm text-slate-500 mb-6">{playingSermon.preacher} • {playingSermon.date}</p>
                     
                     <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                         <button className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex flex-col items-center gap-2"><ThumbsUp size={20}/> Like</button>
                         <button className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex flex-col items-center gap-2"><Share2 size={20}/> Share</button>
                         <button className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex flex-col items-center gap-2"><Download size={20}/> Download</button>
                     </div>

                     <h3 className="font-bold dark:text-white mb-4">More Sermons</h3>
                     <div className="space-y-4 pb-24">
                         {sermons.filter(s=>s.id!==playingSermon.id).map(s => (
                             <div key={s.id} onClick={() => setPlayingSermon(s)} className="flex gap-3 cursor-pointer">
                                 <div className="w-24 h-16 bg-slate-200 rounded-lg bg-cover bg-center relative flex-shrink-0" style={{ backgroundImage: s.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(s.videoUrl ?? "")}/default.jpg)` : 'none' }}></div>
                                 <div>
                                     <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{s.title}</h4>
                                     <p className="text-xs text-slate-500">{s.preacher}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        );
    }

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Sermons</h1>
            <div className="grid gap-6">
                {sermons.map(s => (
                    <div key={s.id} onClick={() => setPlayingSermon(s)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer group">
                        <div className="h-48 bg-slate-200 bg-cover bg-center relative" style={{ backgroundImage: s.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(s.videoUrl ?? "")}/mqdefault.jpg)` : 'none' }}>
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Play fill="white" className="text-white ml-1"/>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{s.duration}</div>
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

// --- CONTACT VIEW ---
export const ContactView = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="p-4 pb-24 min-h-full bg-white dark:bg-slate-900">
             <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-sm"><ArrowLeft size={16}/> Back to Profile</button>
             <h1 className="text-2xl font-black mb-6 dark:text-white">Contact Us</h1>
             
             <div className="space-y-6">
                 <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                     <h3 className="font-bold mb-4 dark:text-white">Get in Touch</h3>
                     <div className="space-y-4">
                         <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Phone size={20}/></div>
                             <div>
                                 <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
                                 <p className="font-bold">+27 12 345 6789</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Mail size={20}/></div>
                             <div>
                                 <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                                 <p className="font-bold">info@isipingochurch.com</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                             <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><MapPin size={20}/></div>
                             <div>
                                 <p className="text-xs text-slate-400 font-bold uppercase">Address</p>
                                 <p className="font-bold">123 Church Street, Isipingo, Durban</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-2xl">
                     <h3 className="font-bold mb-4 dark:text-white">Send a Message</h3>
                     <div className="space-y-3">
                         <input className="w-full bg-slate-50 dark:bg-slate-700 border-none p-3 rounded-xl dark:text-white" placeholder="Your Name" />
                         <input className="w-full bg-slate-50 dark:bg-slate-700 border-none p-3 rounded-xl dark:text-white" placeholder="Email Address" />
                         <textarea className="w-full bg-slate-50 dark:bg-slate-700 border-none p-3 rounded-xl h-32 dark:text-white" placeholder="How can we help?" />
                         <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Send Message</button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// --- PROFILE VIEW ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});

    useEffect(() => {
        if(user) setEditForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, dob: user.dob, gender: user.gender });
    }, [user]);

    const handleSave = () => {
        onUpdateUser(editForm);
        setIsEditing(false);
    };

    if(!user) return <div className="p-4 text-center">Please log in.</div>;

    return (
        <div className="p-4 pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black dark:text-white">My Profile</h1>
                <button onClick={onLogout} className="text-red-500 font-bold text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg flex items-center gap-2"><LogOut size={16}/> Logout</button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex flex-col items-center relative overflow-hidden">
                <div className="w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0"></div>
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg z-10 mt-8 mb-3">
                     <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400">
                         {user.firstName[0]}{user.lastName[0]}
                     </div>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-slate-500 mb-4">{user.email}</p>
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-white flex items-center gap-2">
                        {isEditing ? <X size={14}/> : <Edit2 size={14}/>} {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 space-y-4">
                    <h3 className="font-bold dark:text-white">Edit Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">First Name</label>
                            <input className="w-full border-b py-2 bg-transparent dark:text-white border-slate-200 dark:border-slate-700 outline-none" value={editForm.firstName} onChange={e=>setEditForm({...editForm, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Last Name</label>
                            <input className="w-full border-b py-2 bg-transparent dark:text-white border-slate-200 dark:border-slate-700 outline-none" value={editForm.lastName} onChange={e=>setEditForm({...editForm, lastName: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Phone</label>
                        <input className="w-full border-b py-2 bg-transparent dark:text-white border-slate-200 dark:border-slate-700 outline-none" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Date of Birth</label>
                            <input type="date" className="w-full border-b py-2 bg-transparent dark:text-white border-slate-200 dark:border-slate-700 outline-none" value={editForm.dob} onChange={e=>setEditForm({...editForm, dob: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Gender</label>
                            <select className="w-full border-b py-2 bg-transparent dark:text-white border-slate-200 dark:border-slate-700 outline-none" value={editForm.gender} onChange={e=>setEditForm({...editForm, gender: e.target.value})}>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Save size={16}/> Save Changes</button>
                </div>
            ) : (
                <div className="space-y-4">
                     <button onClick={toggleTheme} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">{isDarkMode ? <Moon size={20}/> : <Sun size={20}/>}</div>
                             <span className="font-bold text-slate-700 dark:text-white">Dark Mode</span>
                         </div>
                         <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}>
                             <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : ''}`}></div>
                         </div>
                     </button>

                     <button onClick={() => onNavigate('contact')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400"><Mail size={20}/></div>
                             <span className="font-bold text-slate-700 dark:text-white">Contact Us</span>
                         </div>
                         <ChevronRight size={16} className="text-slate-400"/>
                     </button>

                     <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400"><Info size={20}/></div>
                             <span className="font-bold text-slate-700 dark:text-white">About ICC App</span>
                         </div>
                         <span className="text-xs font-bold text-slate-400">v1.1.4</span>
                     </div>
                </div>
            )}
        </div>
    );
};
