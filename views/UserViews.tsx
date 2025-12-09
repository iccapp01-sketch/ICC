
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, ChevronUp, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video, UserPlus, Mic, Volume2, Link as LinkIcon, Copy, Info,
  Edit2, Save, Sun, Check, ArrowRight, Bookmark as BookmarkIcon, Film
} from 'lucide-react';
import { BlogPost, Sermon, CommunityGroup, GroupPost, BibleVerse, Event, MusicTrack, Playlist, User as UserType, Notification, Reel } from '../types';
import { supabase } from '../lib/supabaseClient';

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
         const { data } = await supabase.from('reels').select('*').order('created_at', { ascending: false }).limit(10);
         if(data) setReels(data as any);
     };

     fetchSermon();
     fetchBlogs();
     fetchReels();
  }, []);

  const handleShareReel = async (reel: Reel) => {
      // STRICT REQUIREMENT: Native Share API Only.
      // No clipboard fallback. No toast messages.
      if (navigator.share) {
          try {
              await navigator.share({
                  title: reel.title,
                  text: `${reel.title}\n\n${reel.description}`,
                  url: reel.videoUrl
              });
          } catch (err) {
              console.log("Share cancelled or failed:", err);
          }
      } else {
          console.warn("Native Share API not supported on this device.");
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
                  <h3 className="font-bold text-lg dark:text-white mb-4">Reels</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                      {reels.map(reel => (
                          <div key={reel.id} className="min-w-[160px] w-[160px] relative rounded-2xl overflow-hidden shadow-lg aspect-[9/16] bg-black">
                              <video 
                                  src={reel.videoUrl} 
                                  poster={reel.thumbnail} 
                                  className="w-full h-full object-cover" 
                                  controls 
                                  playsInline
                                  preload="metadata"
                              />
                              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                  <h4 className="text-white font-bold text-xs line-clamp-1 mb-1">{reel.title}</h4>
                              </div>
                              <div className="absolute bottom-3 right-3 pointer-events-auto">
                                  <button 
                                      onClick={() => handleShareReel(reel)}
                                      className="flex items-center gap-1 text-[10px] text-white bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
                                  >
                                      <Share2 size={12} /> Share
                                  </button>
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

    useEffect(() => {
        fetchProgress();
    }, []);

    useEffect(() => {
        fetchText();
        // Save progress whenever chapter changes (debounced logically by effect)
        saveProgress();
    }, [book, chapter]);

    const fetchProgress = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        
        try {
            const { data, error } = await supabase
                .from('user_bible_progress')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (data) {
                setProgress(data);
            }
        } catch (e) {
            console.log("No progress found or table missing");
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
        } catch(e) {
            // Fail silently if table doesn't exist
        }
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
             {/* Button Style Tabs */}
             <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10 sticky top-0 shadow-sm">
                 <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                     <button 
                        onClick={()=>setActiveTab('read')} 
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                            activeTab==='read'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                     >
                        Scripture
                     </button>
                     <button 
                        onClick={()=>setActiveTab('plan')} 
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                            activeTab==='plan'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                     >
                        Reading Plan
                     </button>
                 </div>
             </div>
             
             {/* Content */}
             {activeTab === 'read' && (
                 <div className="flex flex-col flex-1 overflow-hidden relative">
                    {/* Compact Controls */}
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm z-10">
                        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronDown size={16} className="rotate-90"/></button>
                        
                        <div className="flex-1 flex gap-2">
                            <select 
                                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg text-sm font-bold border-none outline-none appearance-none truncate" 
                                value={book} 
                                onChange={e => { setBook(e.target.value); setChapter(1); }}
                            >
                                {BIBLE_BOOKS.map(b=><option key={b} value={b}>{b}</option>)}
                            </select>
                            
                            <select 
                                className="w-20 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-lg text-sm font-bold border-none outline-none appearance-none text-center" 
                                value={chapter} 
                                onChange={e=>setChapter(parseInt(e.target.value))}
                            >
                                {[...Array(150)].map((_,i)=><option key={i+1} value={i+1}>Ch {i+1}</option>)}
                            </select>
                        </div>

                        <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronRight size={16}/></button>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 scroll-smooth pb-32">
                         <div className="max-w-xl mx-auto">
                             <h2 className="text-xl font-bold text-center mb-6 text-slate-400 uppercase tracking-widest">{book} {chapter}</h2>
                             {loading ? (
                                 <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                             ) : (
                                 <p className="text-lg leading-loose font-serif whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                                     {text}
                                 </p>
                             )}
                             <div className="mt-12 flex justify-center pb-8">
                                 <button onClick={handleNext} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                                     Next Chapter <ArrowRight size={16}/>
                                 </button>
                             </div>
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
                                 <button onClick={continueReading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
                                     <BookOpen size={18}/> Continue Reading
                                 </button>
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
    const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string}>({});
    const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({});

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

        setSubmitting({...submitting, [eventId]: true});
        const { data: { user } } = await supabase.auth.getUser();
        
        if(user) {
             const { error } = await supabase.from('event_rsvps').upsert({ 
                 event_id: eventId, 
                 user_id: user.id, 
                 status 
             }, { onConflict: 'event_id,user_id' });

             if(error) {
                 alert("Error submitting RSVP: " + error.message);
             } else {
                 setMyRsvps({...myRsvps, [eventId]: status});
             }
        } else {
            alert("Please login to RSVP.");
        }
        setSubmitting({...submitting, [eventId]: false});
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
                        {/* Event/Announcement Label */}
                        <div className="mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${isAnnouncement ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isAnnouncement ? 'Announcement' : 'Event'}
                            </span>
                        </div>

                        {/* Media */}
                        {ev.image && <div className="h-32 bg-cover bg-center rounded-2xl mb-4" style={{backgroundImage: `url(${ev.image})`}}></div>}
                        
                        {/* Details */}
                        <h3 className="text-lg font-bold dark:text-white mb-2 leading-tight">{ev.title}</h3>
                        
                        {!isAnnouncement && (
                            <div className="flex flex-col gap-1 mb-3 text-xs text-slate-500">
                                <div className="flex items-center gap-2"><Calendar size={14}/> {ev.date}</div>
                                <div className="flex items-center gap-2"><Clock size={14}/> {ev.time}</div>
                                {ev.location && <div className="flex items-center gap-2"><MapPin size={14}/> {ev.location}</div>}
                            </div>
                        )}
                        
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{ev.description}</p>

                        {/* Compact RSVP Section (Only for Events) */}
                        {!isAnnouncement && (
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">RSVP:</span>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                                    {['Yes', 'No', 'Maybe'].map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => handleSubmitRSVP(ev.id, opt)}
                                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${
                                                myStatus === opt 
                                                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm ring-1 ring-black/5' 
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            {opt}
                                        </button>
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
    // ... music logic retained
    const [activeTab, setActiveTab] = useState<'MUSIC' | 'PODCAST' | 'MY_PLAYLISTS'>('MUSIC');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState<string | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    
    // Audio Ref
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if(activeTab === 'MY_PLAYLISTS') {
             fetchPlaylists();
        } else {
             const fetchTracks = async () => {
                 const { data } = await supabase.from('music_tracks').select('*').eq('type', activeTab);
                 if(data) setTracks(data as any);
             };
             fetchTracks();
        }
    }, [activeTab]);

    const fetchPlaylists = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id);
            if(data) setPlaylists(data.map((p:any) => ({...p, name: p.title})));
        }
    };

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            if (currentTrack.url.includes('youtube')) {
                 // YouTube logic handled in render
                 setIsPlaying(true);
            } else {
                audioRef.current.src = currentTrack.url;
                audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Playback error", e));
            }
        }
    }, [currentTrack]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const playNext = () => {
        if(!currentTrack) return;
        const idx = tracks.findIndex(t => t.id === currentTrack.id);
        if(idx !== -1 && idx < tracks.length - 1) setCurrentTrack(tracks[idx + 1]);
    };

    const playPrev = () => {
        if(!currentTrack) return;
        const idx = tracks.findIndex(t => t.id === currentTrack.id);
        if(idx > 0) setCurrentTrack(tracks[idx - 1]);
    };

    const handleCreatePlaylist = async () => {
        if(!newPlaylistName) return;
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        await supabase.from('playlists').insert({ title: newPlaylistName, user_id: user.id, tracks: [] });
        setNewPlaylistName('');
        fetchPlaylists();
        alert("Playlist created! Go to My Playlists to view.");
    };

    const addToPlaylist = async (playlistId: string, track: MusicTrack) => {
        const playlist = playlists.find(p => p.id === playlistId);
        if(!playlist) return;
        const newTracks = [...(playlist.tracks || []), track];
        await supabase.from('playlists').update({ tracks: newTracks }).eq('id', playlistId);
        setShowPlaylistModal(null);
        alert("Added to playlist!");
    };

    return (
        <div className="h-full flex flex-col pb-24">
            
            {/* PLAYER WIDGET - Top Position */}
            {currentTrack && (
                <div className="px-4 pt-4 pb-2">
                    <div 
                        className={`bg-slate-900 text-white rounded-3xl shadow-lg p-4 flex flex-col cursor-pointer border border-white/10`}
                        onClick={() => setIsFullScreen(true)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                                <Music size={24} className="text-blue-400"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base truncate leading-tight">{currentTrack.title}</h4>
                                <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={(e)=>{e.stopPropagation(); playPrev();}} className="p-2 hover:bg-white/10 rounded-full"><SkipBack size={20}/></button>
                                <button onClick={(e)=>{e.stopPropagation(); togglePlay();}} className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition">
                                    {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                                </button>
                                <button onClick={(e)=>{e.stopPropagation(); playNext();}} className="p-2 hover:bg-white/10 rounded-full"><SkipForward size={20}/></button>
                            </div>
                        </div>
                        {/* Progress Bar Visual */}
                        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/3"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* BUTTON TABS - Below Player */}
            <div className="px-4 py-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['MUSIC', 'PODCAST', 'MY_PLAYLISTS'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab as any)} 
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border
                                ${activeTab === tab 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
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
                            <div onClick={() => setCurrentTrack(track)} className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                <Music size={20}/>
                            </div>
                            <div onClick={() => setCurrentTrack(track)} className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm truncate ${currentTrack?.id===track.id ? 'text-blue-600':'dark:text-white'}`}>{track.title}</h4>
                                <p className="text-xs text-slate-500 truncate">{track.artist}</p>
                            </div>
                            <button onClick={()=>setShowPlaylistModal(track.id)} className="p-2 text-slate-400 hover:text-blue-600"><ListMusic size={16}/></button>
                            {showPlaylistModal === track.id && (
                                <div className="absolute right-8 bg-white shadow-xl rounded-xl p-2 z-10 border border-slate-100">
                                    <p className="text-xs font-bold mb-2 px-2">Add to Playlist:</p>
                                    {playlists.length === 0 && <p className="text-xs text-slate-400 px-2">No playlists</p>}
                                    {playlists.map(p => (
                                        <button key={p.id} onClick={()=>addToPlaylist(p.id, track)} className="block w-full text-left px-2 py-1 text-xs hover:bg-slate-50 rounded">
                                            {p.name}
                                        </button>
                                    ))}
                                    <button onClick={()=>setShowPlaylistModal(null)} className="w-full text-center text-xs text-red-500 mt-2 border-t pt-1">Cancel</button>
                                </div>
                            )}
                        </div>
                    ))
                 )}
            </div>
            
            {/* FULL SCREEN PLAYER MODAL */}
            {isFullScreen && currentTrack && (
                <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col p-8 text-white">
                    <button onClick={()=>setIsFullScreen(false)} className="self-center mb-8 bg-white/10 p-2 rounded-full"><ChevronDown/></button>
                    
                    {currentTrack.url.includes('youtube') ? (
                         <div className="w-full aspect-square bg-black rounded-3xl mb-8 overflow-hidden shadow-2xl">
                             <iframe 
                                width="100%" height="100%" 
                                src={`https://www.youtube.com/embed/${getYouTubeID(currentTrack.url ?? "")}?autoplay=1&controls=0`} 
                                allow="autoplay"
                             ></iframe>
                         </div>
                    ) : (
                        <div className="w-full aspect-square bg-gradient-to-br from-blue-900 to-slate-800 rounded-3xl mb-8 flex items-center justify-center shadow-2xl border border-white/5">
                            <Music size={120} className="text-white/20"/>
                        </div>
                    )}
                    
                    <div className="mt-auto">
                        <h2 className="text-3xl font-bold mb-2 leading-tight">{currentTrack.title}</h2>
                        <p className="text-xl text-slate-400 mb-8 font-medium">{currentTrack.artist}</p>
                        
                        <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                             <div className="h-full bg-blue-500 w-1/3 relative">
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow"></div>
                             </div>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                             <button className="text-slate-400 hover:text-white"><Shuffle size={24}/></button>
                             <button onClick={playPrev} className="text-white hover:text-blue-400"><SkipBack size={32}/></button>
                             <button className="w-20 h-20 bg-blue-600 rounded-full text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition flex items-center justify-center" onClick={togglePlay}>
                                 {isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
                             </button>
                             <button onClick={playNext} className="text-white hover:text-blue-400"><SkipForward size={32}/></button>
                             <button className="text-slate-400 hover:text-white"><Repeat size={24}/></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Audio Element (Only used if not YouTube) */}
            {!currentTrack?.url.includes('youtube') && (
                 <audio ref={audioRef} onEnded={() => {setIsPlaying(false); playNext();}} />
            )}
        </div>
    );
};

// --- BLOG VIEW ---
export const BlogView = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch categories for tabs
            const { data: catData } = await supabase.from('blog_categories').select('*').order('name');
            if (catData) setCategories(catData);

            // Fetch blogs with join
            const { data: blogData } = await supabase.from('blog_posts').select('*, blog_categories(id, name)').order('created_at', { ascending: false });
            if(blogData) {
                // Map database columns to app interface
                setBlogs(blogData.map((b:any)=>({
                    ...b, 
                    image: b.image_url,
                    videoUrl: b.video_url, // Added video mapping
                    // Map joined category name to 'category' property
                    category: b.blog_categories?.name || 'Uncategorized',
                    category_id: b.category_id || b.blog_categories?.id
                })));
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedBlog) {
            setLikes(selectedBlog.likes || 0);
            const fetchComments = async () => {
                const { data } = await supabase
                    .from('blog_comments')
                    .select('*, profiles(first_name, last_name)')
                    .eq('blog_id', selectedBlog.id)
                    .order('created_at', { ascending: false });
                if (data) setComments(data);
            };
            fetchComments();
        }
    }, [selectedBlog]);

    const handleLike = async () => {
        if(!selectedBlog) return;
        const newLikes = likes + 1;
        setLikes(newLikes);
        await supabase.from('blog_posts').update({ likes: newLikes }).eq('id', selectedBlog.id);
    }

    const handleComment = async () => {
        if(!commentText.trim() || !selectedBlog) return;
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return alert("Please login to comment");
        
        const { error } = await supabase.from('blog_comments').insert({
            blog_id: selectedBlog.id,
            user_id: user.id,
            content: commentText
        });
        
        if(error) alert("Error posting comment: " + error.message);
        else {
            setCommentText('');
            const { data } = await supabase.from('blog_comments').select('*, profiles(first_name, last_name)').eq('blog_id', selectedBlog.id).order('created_at', { ascending: false });
            if(data) setComments(data);
        }
    }

    function shareBlog(selectedBlog: BlogPost) {
        const currentURL = window.location.href;
        const blogURL = (selectedBlog as any).url || currentURL; // use blog URL if available, else current page
        const text = selectedBlog?.content || "";
        const title = selectedBlog?.title || "Sharing this blog";

        if (!blogURL.startsWith("http")) {
            alert("Cannot share: invalid URL");
            console.log("Invalid share URL:", blogURL);
            return;
        }

        if (navigator.share) {
            navigator.share({
            title: title,
            text: text,
            url: blogURL
            }).catch((err) => console.log("Share canceled:", err));
        } else {
            navigator.clipboard.writeText(blogURL);
            alert("Blog link copied! You can paste it into WhatsApp, Instagram, Facebook, etc.");
        }
    }

    // Dynamic Filter Categories (Always include 'All')
    const filterTabs = [
        { id: 'All', name: 'All' },
        ...categories.map(c => ({ id: c.name, name: c.name })) // Use Name as ID for filter logic simplicity to match existing 'All' logic
    ];

    const filteredBlogs = activeCategory === 'All' 
        ? blogs 
        : blogs.filter(b => b.category === activeCategory);

    if(selectedBlog) {
        return (
            <div className="p-4 pb-24 bg-white dark:bg-slate-900 min-h-full">
                <button onClick={()=>setSelectedBlog(null)} className="mb-4 flex items-center gap-2 text-slate-500"><ArrowLeft size={16}/> Back to Articles</button>
                
                {/* Image Display */}
                {selectedBlog.image && <img src={selectedBlog.image} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm" alt="Blog cover" />}
                
                {/* Video Display */}
                {selectedBlog.videoUrl && getYouTubeID(selectedBlog.videoUrl) && (
                    <div className="w-full aspect-video bg-black rounded-2xl mb-6 overflow-hidden shadow-sm">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${getYouTubeID(selectedBlog.videoUrl ?? "")}`} 
                            title="Blog Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                )}

                <div className="flex justify-between items-start gap-4 mb-2">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex-1">{selectedBlog.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                    <span>{selectedBlog.author}</span> • <span>{new Date(selectedBlog.date).toLocaleDateString()}</span>
                </div>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-8">
                    {selectedBlog.content}
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex gap-4 mb-6">
                        <button onClick={handleLike} className="flex-1 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 transition">
                            <ThumbsUp size={20} fill={likes > (selectedBlog.likes || 0) ? "currentColor" : "none"}/> {likes} Likes
                        </button>
                        
                        <button onClick={() => shareBlog(selectedBlog)} className="flex-1 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition">
                             <Share2 size={20}/> Share
                        </button>
                    </div>

                    <h3 className="font-bold text-lg mb-4 dark:text-white">Comments</h3>
                    <div className="flex gap-3 mb-6">
                        <input 
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3" 
                            placeholder="Add a comment..." 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                        />
                        <button onClick={handleComment} className="bg-blue-600 text-white p-3 rounded-xl"><Send size={20}/></button>
                    </div>
                    <div className="space-y-4">
                        {comments.map(c => (
                            <div key={c.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm dark:text-white">{c.profiles?.first_name} {c.profiles?.last_name}</span>
                                    <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{c.content}</p>
                            </div>
                        ))}
                        {comments.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No comments yet. Be the first!</p>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 pb-24 space-y-6">
            <h1 className="text-2xl font-black dark:text-white">Articles & Devotionals</h1>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
                {filterTabs.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                            activeCategory === cat.id 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {filteredBlogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <p>No posts found in this category.</p>
                </div>
            ) : (
                filteredBlogs.map(blog => {
                    const videoId = getYouTubeID(blog.videoUrl || '');
                    // Use image if available, otherwise video thumbnail, otherwise default none
                    const displayImage = blog.image || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

                    return (
                        <div key={blog.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex gap-4">
                                {displayImage && (
                                    <div className="w-24 h-24 bg-cover bg-center rounded-xl flex-shrink-0 relative overflow-hidden" style={{backgroundImage: `url(${displayImage})`}}>
                                        {!blog.image && videoId && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Play size={20} fill="white" className="text-white opacity-80" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{blog.category}</span>
                                        <span className="text-xs text-slate-400">{new Date(blog.date).toLocaleDateString()}</span>
                                     </div>
                                     <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">{blog.title}</h3>
                                     <p className="text-xs text-slate-500 line-clamp-2 mb-3">{blog.excerpt}</p>
                                     <button onClick={()=>setSelectedBlog(blog)} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">Read More <ChevronRight size={12}/></button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

// --- SERMONS VIEW ---
export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [playingSermonId, setPlayingSermonId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSermons = async () => {
            const { data } = await supabase.from('sermons').select('*').order('date_preached', { ascending: false });
            if (data) setSermons(data as any);
        };
        fetchSermons();
    }, []);

    const filteredSermons = sermons.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.preacher.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black dark:text-white">Sermons</h1>
            
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
                <input 
                    className="w-full bg-white dark:bg-slate-800 py-3 pl-10 pr-4 rounded-xl border-none shadow-sm text-slate-900 dark:text-white"
                    placeholder="Search sermons..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="space-y-4">
                {filteredSermons.map(sermon => (
                    <div key={sermon.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="w-full aspect-video bg-slate-200 dark:bg-slate-900 rounded-xl mb-3 overflow-hidden relative">
                            {playingSermonId === sermon.id && sermon.videoUrl ? (
                                <iframe 
                                    src={`https://www.youtube.com/embed/${getYouTubeID(sermon.videoUrl)}?autoplay=1`} 
                                    className="w-full h-full" 
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    title={sermon.title}
                                ></iframe>
                            ) : (
                                <div 
                                    className="w-full h-full bg-cover bg-center cursor-pointer group relative"
                                    style={{ backgroundImage: `url(https://img.youtube.com/vi/${getYouTubeID(sermon.videoUrl || "")}/maxresdefault.jpg)` }}
                                    onClick={() => setPlayingSermonId(sermon.id)}
                                >
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <Play fill="white" className="text-white ml-1" size={24} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-bold">
                                        {sermon.duration}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg dark:text-white leading-tight mb-1">{sermon.title}</h3>
                                <p className="text-sm text-blue-600 font-bold mb-2">{sermon.preacher}</p>
                            </div>
                            <button className="text-slate-400 p-1"><MoreVertical size={20}/></button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3 mt-2">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {sermon.date}</span>
                            <span className="flex items-center gap-1 ml-auto"><Share2 size={14}/> Share</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMMUNITY VIEW ---
export const CommunityView = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [myGroups, setMyGroups] = useState<string[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            const { data } = await supabase.from('community_groups').select('*');
            if (data) setGroups(data as any);
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: members } = await supabase.from('community_group_members').select('group_id').eq('user_id', user.id).in('status', ['Approved', 'Joined']);
                if(members) setMyGroups(members.map((m:any) => m.group_id));
            }
        };
        fetchGroups();
    }, []);

    const handleJoin = async (groupId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return alert("Please login to join groups.");
        
        const { error } = await supabase.from('community_group_members').insert({
            group_id: groupId,
            user_id: user.id,
            status: 'Pending'
        });
        
        if(error) {
             if(error.code === '23505') alert("You have already requested to join this group.");
             else alert("Error joining group: " + error.message);
        } else {
            alert("Request sent! Waiting for approval.");
        }
    }

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black dark:text-white">Community Groups</h1>
            <p className="text-slate-500 text-sm">Connect with others, grow in faith, and do life together.</p>
            
            <div className="grid gap-4">
                {groups.map(group => (
                    <div key={group.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                        {group.image && <div className="h-32 w-full bg-cover bg-center" style={{backgroundImage: `url(${group.image})`}}></div>}
                        <div className="p-4">
                            <h3 className="font-bold text-lg dark:text-white mb-2">{group.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{group.description}</p>
                            
                            {myGroups.includes(group.id) ? (
                                <button disabled className="w-full bg-green-100 text-green-700 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                                    <CheckCircle size={16}/> Joined
                                </button>
                            ) : (
                                <button onClick={()=>handleJoin(group.id)} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-sm">
                                    Join Group
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- PROFILE VIEW ---
export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    
    // Notification Settings State (Local Storage)
    const [notifyComments, setNotifyComments] = useState(true);
    const [notifyBlogs, setNotifyBlogs] = useState(true);
    const [notifyGroups, setNotifyGroups] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        if(user) setFormData({ ...user });
        
        const storedSettings = localStorage.getItem('userSettings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            if (parsed.notifyComments !== undefined) setNotifyComments(parsed.notifyComments);
            if (parsed.notifyBlogs !== undefined) setNotifyBlogs(parsed.notifyBlogs);
            if (parsed.notifyGroups !== undefined) setNotifyGroups(parsed.notifyGroups);
        }
    }, [user]);

    const handleSave = () => {
        onUpdateUser(formData);
        setIsEditing(false);
    }

    const toggleSetting = (key: string, val: boolean, setter: any) => {
        setter(val);
        const current = JSON.parse(localStorage.getItem('userSettings') || '{}');
        localStorage.setItem('userSettings', JSON.stringify({ ...current, [key]: val }));
    };

    if(!user) return <div className="p-8 text-center text-slate-500">Please log in to view profile.</div>;

    const Initials = user.firstName ? user.firstName[0] : 'U';

    return (
        <div className="p-4 pb-24">
            {/* Header with Logout */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black dark:text-white">My Profile</h1>
                <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-bold text-xs bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                    <LogOut size={14}/> Logout
                </button>
            </div>

            {/* Profile Card & Editable Details */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 relative">
                <div className="flex justify-center mb-6">
                     <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-blue-50 dark:ring-slate-700">
                        {Initials}
                    </div>
                </div>

                {/* Pencil Icon (Top Right) */}
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition">
                        <Edit2 size={16} />
                    </button>
                )}

                {/* Details Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 block">Name</label>
                            {isEditing ? (
                                <input className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-colors" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                            ) : (
                                <p className="text-sm font-bold dark:text-white">{user.firstName}</p>
                            )}
                         </div>
                         <div>
                            <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 block">Surname</label>
                            {isEditing ? (
                                <input className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-colors" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                            ) : (
                                <p className="text-sm font-bold dark:text-white">{user.lastName}</p>
                            )}
                         </div>
                    </div>

                     <div>
                        <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 block">Date of Birth</label>
                        {isEditing ? (
                            <input type="date" className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-colors" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                        ) : (
                            <p className="text-sm font-bold dark:text-white">{user.dob || 'Not set'}</p>
                        )}
                     </div>

                     <div>
                        <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 block">Email</label>
                        {isEditing ? (
                            <input className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        ) : (
                            <p className="text-sm font-bold dark:text-white">{user.email}</p>
                        )}
                     </div>

                     <div>
                        <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 block">Phone</label>
                        {isEditing ? (
                            <input className="w-full border-b border-slate-200 dark:border-slate-600 bg-transparent py-1 text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-colors" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        ) : (
                            <p className="text-sm font-bold dark:text-white">{user.phone || 'Not set'}</p>
                        )}
                     </div>

                     {/* Save / Cancel Buttons */}
                     {isEditing && (
                         <div className="flex gap-2 mt-4 pt-2">
                             <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                                 <Save size={14}/> Save Changes
                             </button>
                             <button onClick={() => { setIsEditing(false); setFormData({...user}); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors">
                                 Cancel
                             </button>
                         </div>
                     )}
                </div>
            </div>

            {/* Settings Accordion */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 overflow-hidden transition-all">
                <button 
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="w-full flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg dark:text-white">Settings</span>
                    </div>
                    {settingsOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                </button>
                
                {settingsOpen && (
                    <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                        {/* Dark Mode */}
                        <div className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                                    {isDarkMode ? <Moon size={18}/> : <Sun size={18}/>}
                                </div>
                                <span className="text-sm font-bold dark:text-white">Dark Mode</span>
                            </div>
                            <button onClick={toggleTheme} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : ''}`}></div>
                            </button>
                        </div>

                        {/* Notifications Toggles */}
                        {[
                            { label: 'Comments Notifications', state: notifyComments, setter: setNotifyComments, key: 'notifyComments' },
                            { label: 'Blog Notifications', state: notifyBlogs, setter: setNotifyBlogs, key: 'notifyBlogs' },
                            { label: 'Group Notifications', state: notifyGroups, setter: setNotifyGroups, key: 'notifyGroups' }
                        ].map((item, i) => (
                            <div key={item.key} className="flex items-center justify-between p-2 border-t border-slate-50 dark:border-slate-700/50">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">{item.label}</span>
                                <button 
                                    onClick={() => toggleSetting(item.key, !item.state, item.setter)}
                                    className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${item.state ? 'bg-green-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${item.state ? 'translate-x-5' : ''}`}></div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation Links - Removed Notifications */}
            <div className="space-y-3">
                <button onClick={()=>onNavigate('contact')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between group active:scale-95 transition">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><MapPin size={20}/></div>
                        <div className="text-left">
                            <span className="font-bold text-slate-900 dark:text-white block">Contact Us</span>
                            <span className="text-xs text-slate-500">Get in touch with the church</span>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500"/>
                </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-300 mt-8 mb-4">Version 1.0.0 • Isipingo Community Church</p>
        </div>
    );
};

// --- NOTIFICATIONS VIEW ---
export const NotificationsView = () => {
    // Mock notifications for now, as DB table structure isn't confirmed/populated in seed
    const notifications = [
        { id: '1', title: 'Welcome to ICC App', message: 'We are glad to have you here. Explore sermons, blogs and more.', time: 'Just now', read: false },
        { id: '2', title: 'Sunday Service', message: 'Join us this Sunday at 9:00 AM for a powerful service.', time: '2 days ago', read: true },
    ];

    return (
        <div className="p-4 pb-24">
             <h1 className="text-2xl font-black dark:text-white mb-6">Notifications</h1>
             <div className="space-y-3">
                 {notifications.map(n => (
                     <div key={n.id} className={`p-4 rounded-2xl border ${n.read ? 'bg-slate-50 dark:bg-slate-800 border-transparent' : 'bg-white dark:bg-slate-700 border-blue-100 shadow-sm'}`}>
                         <div className="flex justify-between items-start mb-1">
                             <h4 className={`font-bold text-sm ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{n.title}</h4>
                             <span className="text-[10px] text-slate-400">{n.time}</span>
                         </div>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                     </div>
                 ))}
             </div>
        </div>
    );
};

// --- CONTACT VIEW ---
export const ContactView = ({ onBack }: any) => {
    return (
        <div className="p-4 pb-24">
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-sm"><ArrowLeft size={18}/> Back to Profile</button>
            <h1 className="text-2xl font-black dark:text-white mb-6">Contact Us</h1>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><MapPin size={24}/></div>
                        <div>
                            <h3 className="font-bold dark:text-white">Visit Us</h3>
                            <p className="text-slate-500 text-sm">123 Church Street<br/>Isipingo Hills, Durban<br/>4133</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                         <div className="bg-green-100 text-green-600 p-3 rounded-xl"><Phone size={24}/></div>
                         <div>
                             <h3 className="font-bold dark:text-white">Call Us</h3>
                             <p className="text-slate-500 text-sm">+27 31 123 4567</p>
                             <p className="text-slate-500 text-sm">+27 82 123 4567</p>
                         </div>
                    </div>

                    <div className="flex items-start gap-4">
                         <div className="bg-purple-100 text-purple-600 p-3 rounded-xl"><Mail size={24}/></div>
                         <div>
                             <h3 className="font-bold dark:text-white">Email Us</h3>
                             <p className="text-slate-500 text-sm">info@isipingochurch.co.za</p>
                         </div>
                    </div>
                </div>
            </div>
            
            {/* Map Embed Placeholder */}
            <div className="w-full h-64 bg-slate-200 rounded-3xl overflow-hidden relative">
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.811394173874!2d30.9333!3d-29.9833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDU5JzAwLjAiUyAzMMKwNTYnMDAuMCJF!5e0!3m2!1sen!2sza!4v1630000000000!5m2!1sen!2sza" 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen 
                    loading="lazy"
                 ></iframe>
            </div>
        </div>
    );
};
