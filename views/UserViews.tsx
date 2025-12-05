
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video, UserPlus, Mic, Volume2
} from 'lucide-react';
import { BlogPost, Sermon, CommunityGroup, GroupPost, GroupComment, BibleVerse, Event, MusicTrack, Playlist, User as UserType, Notification } from '../types';
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
     fetchSermon();
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
             </div>
          </div>

          {/* Latest Sermon */}
          {latestSermon && (
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg dark:text-white">Latest Sermon</h3>
                  </div>
                  <div onClick={() => onNavigate('sermons')} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 cursor-pointer">
                      <div className="w-24 h-24 bg-slate-200 rounded-xl bg-cover bg-center flex-shrink-0 relative" style={{ backgroundImage: latestSermon.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(latestSermon.videoUrl)}/default.jpg)` : 'none' }}>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl"><Play fill="white" className="text-white"/></div>
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">{latestSermon.title}</h4>
                          <p className="text-xs text-slate-500 mb-2">{latestSermon.preacher}</p>
                      </div>
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
    const [activeTab, setActiveTab] = useState<'read' | 'plan' | 'bookmarks'>('read');
    const [book, setBook] = useState('John');
    const [chapter, setChapter] = useState(1);
    const [text, setText] = useState('');

    useEffect(() => {
        fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}`).then(r=>r.json()).then(d=>setText(d.text));
    }, [book, chapter]);

    const openReadingMode = () => {
        const newWindow = window.open('', '_blank');
        if(newWindow) {
            newWindow.document.write(`<html><head><title>${book} ${chapter}</title></head><body style="font-family:serif; padding:40px; line-height:1.6; max-width:800px; margin:0 auto;"><h1>${book} ${chapter}</h1><p>${text}</p></body></html>`);
        }
    }

    return (
        <div className="p-4 pb-32 h-full flex flex-col">
             <div className="flex gap-4 mb-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
                 <button onClick={()=>setActiveTab('read')} className={`pb-2 px-2 text-sm font-bold whitespace-nowrap ${activeTab==='read' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Scripture</button>
                 <button onClick={()=>setActiveTab('plan')} className={`pb-2 px-2 text-sm font-bold whitespace-nowrap ${activeTab==='plan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Reading Plan</button>
                 <button onClick={()=>setActiveTab('bookmarks')} className={`pb-2 px-2 text-sm font-bold whitespace-nowrap ${activeTab==='bookmarks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Bookmarks</button>
             </div>

             {activeTab === 'read' && (
                 <>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 sticky top-0 z-10">
                        <div className="flex gap-2 mb-3">
                            <select className="flex-1 bg-slate-50 p-2 rounded-xl text-sm" value={book} onChange={e => setBook(e.target.value)}>{BIBLE_BOOKS.map(b=><option key={b}>{b}</option>)}</select>
                            <input type="number" className="w-16 bg-slate-50 p-2 rounded-xl text-sm" value={chapter} onChange={e=>setChapter(parseInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 overflow-y-auto cursor-pointer" onClick={openReadingMode} title="Click to read in full view">
                         <h2 className="text-2xl font-serif font-bold mb-4">{book} {chapter}</h2>
                         <p className="text-lg leading-loose font-serif text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{text}</p>
                    </div>
                 </>
             )}
             {/* Placeholders for Plan and Bookmarks */}
             {activeTab === 'plan' && <div className="text-center py-10 text-slate-400">Reading Plans Coming Soon</div>}
             {activeTab === 'bookmarks' && <div className="text-center py-10 text-slate-400">No Bookmarks Yet</div>}
        </div>
    );
};

// --- MUSIC VIEW (RESTORED PLAYER) ---
export const MusicView = () => {
  const [activeTab, setActiveTab] = useState<'music' | 'podcast'>('music');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
     const fetchData = async () => {
        const { data: tData } = await supabase.from('music_tracks').select('*');
        if(tData) setTracks(tData.map((t:any) => ({...t, isOffline: false})));
        
        const { data: pData } = await supabase.from('playlists').select('*');
        if(pData) setPlaylists(pData.map((p:any) => ({...p, name: p.title})));
     };
     fetchData();
  }, []);

  const filteredTracks = tracks.filter(t => activeTab === 'music' ? t.type === 'MUSIC' : t.type === 'PODCAST');

  const playTrack = (track: MusicTrack) => {
      setCurrentTrack(track);
      setIsPlaying(true);
      // Wait for React to render audio element if generic URL
      setTimeout(() => {
          if (audioRef.current) {
              audioRef.current.src = track.url;
              audioRef.current.play();
          }
      }, 100);
  }

  const togglePlay = () => {
      if (audioRef.current) {
          if (isPlaying) audioRef.current.pause();
          else audioRef.current.play();
          setIsPlaying(!isPlaying);
      }
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 flex flex-col relative overflow-hidden">
        <div className="p-4 flex gap-4">
            <button onClick={() => setActiveTab('music')} className={`px-4 py-2 rounded-full font-bold text-sm ${activeTab === 'music' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>Music</button>
            <button onClick={() => setActiveTab('podcast')} className={`px-4 py-2 rounded-full font-bold text-sm ${activeTab === 'podcast' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>Podcasts</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-32">
            {activeTab === 'music' && playlists.length > 0 && (
                <div className="mb-8 overflow-x-auto no-scrollbar flex gap-4 pb-2">
                    {playlists.map(p => (
                        <div key={p.id} className="min-w-[160px] h-40 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                            <Music size={40} className="opacity-50"/>
                            <p className="font-bold text-lg leading-tight">{p.name}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                {filteredTracks.map((track, idx) => (
                    <div key={track.id} onClick={() => playTrack(track)} className="bg-white p-4 rounded-2xl flex items-center justify-between cursor-pointer">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">{idx+1}</div>
                             <div>
                                 <p className="font-bold">{track.title}</p>
                                 <p className="text-xs text-slate-500">{track.artist}</p>
                             </div>
                         </div>
                         <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Play size={14}/></button>
                    </div>
                ))}
            </div>
        </div>

        {/* --- MINI PLAYER WIDGET --- */}
        {currentTrack && !isFullScreen && (
            <div onClick={() => setIsFullScreen(true)} className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-2xl flex items-center justify-between z-40 cursor-pointer">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Music className="text-white w-5 h-5"/></div>
                    <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900 truncate">{currentTrack.title}</p>
                        <p className="text-xs text-slate-500 truncate">{currentTrack.artist}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={togglePlay} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 shadow-sm">
                        {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                    </button>
                </div>
                {/* Audio Element Logic */}
                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
            </div>
        )}

        {/* --- FULL SCREEN PLAYER MODAL --- */}
        {currentTrack && isFullScreen && (
            <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col p-6 pb-12">
                <button onClick={() => setIsFullScreen(false)} className="self-center bg-white/10 p-2 rounded-full mb-8"><ChevronDown/></button>
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-8 flex items-center justify-center">
                        <Music size={80} className="text-white/50"/>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-center">{currentTrack.title}</h2>
                    <p className="text-slate-400 mb-8">{currentTrack.artist}</p>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-8">
                        <button className="text-slate-400"><SkipBack size={32}/></button>
                        <button onClick={togglePlay} className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition">
                            {isPlaying ? <Pause size={32} fill="white"/> : <Play size={32} fill="white"/>}
                        </button>
                        <button className="text-slate-400"><SkipForward size={32}/></button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

// --- EVENTS VIEW ---
export const EventsView = ({ onBack }: any) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [rsvpStatus, setRsvpStatus] = useState<{[key:string]: string}>({});

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('events').select('*').order('created_at', { ascending: true });
            if(data) setEvents(data as any);
        };
        fetch();
    }, []);

    const handleRsvp = (id: string, status: string) => {
        setRsvpStatus({...rsvpStatus, [id]: status});
        alert(`RSVP: ${status}`);
    };

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Events & Announcements</h1>
            {events.map(ev => (
                <div key={ev.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
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
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">RSVP</p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRsvp(ev.id, 'yes')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${rsvpStatus[ev.id] === 'yes' ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-500'}`}>Yes</button>
                                    <button onClick={() => handleRsvp(ev.id, 'maybe')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${rsvpStatus[ev.id] === 'maybe' ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-200 text-slate-500'}`}>Maybe</button>
                                    <button onClick={() => handleRsvp(ev.id, 'no')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${rsvpStatus[ev.id] === 'no' ? 'bg-red-500 text-white border-red-500' : 'border-slate-200 text-slate-500'}`}>No</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
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

    const handleShare = (blog: BlogPost) => {
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                text: blog.excerpt,
                url: window.location.href, 
            }).catch(console.error);
        } else {
            alert("Share feature not supported on this browser.");
        }
    };

    if (selectedBlog) {
        return (
            <div className="p-4 pb-24 bg-white dark:bg-slate-900 min-h-full">
                <button onClick={() => setSelectedBlog(null)} className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-600"><ArrowLeft size={16}/> Back</button>
                {selectedBlog.image && <img src={selectedBlog.image} className="w-full h-56 object-cover rounded-2xl mb-6" />}
                <h1 className="text-3xl font-black mb-4">{selectedBlog.title}</h1>
                <div className="flex items-center gap-4 mb-6">
                    <button className="flex items-center gap-1 text-slate-500"><Heart size={20}/> Like</button>
                    <button className="flex items-center gap-1 text-slate-500"><MessageCircle size={20}/> Comment</button>
                    <button onClick={() => handleShare(selectedBlog)} className="flex items-center gap-1 text-slate-500"><Share2 size={20}/> Share</button>
                </div>
                <div className="prose dark:prose-invert"><p>{selectedBlog.content}</p></div>
            </div>
        )
    }

    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black mb-4">Latest Articles</h1>
            {blogs.map(blog => (
                <div key={blog.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border mb-4">
                    {blog.image && <div className="h-32 bg-cover bg-center rounded-xl mb-3" style={{backgroundImage: `url(${blog.image})`}}></div>}
                    <h3 className="font-bold mb-2">{blog.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{blog.excerpt}</p>
                    <button onClick={() => setSelectedBlog(blog)} className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg w-full">Read More</button>
                </div>
            ))}
        </div>
    )
};

// ... CommunityView, SermonsView, ProfileView remain similar to previous logic ...
export const CommunityView = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    useEffect(() => {
        const fetch = async () => { const { data } = await supabase.from('community_groups').select('*'); if(data) setGroups(data as any); };
        fetch();
    }, []);
    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black mb-4">Community Groups</h1>
            {groups.map(g => (
                <div key={g.id} className="p-4 bg-white border rounded-2xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold">{g.name}</h3>
                        <p className="text-xs text-slate-500">{g.description}</p>
                    </div>
                    <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">Join</button>
                </div>
            ))}
        </div>
    )
};

export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [playing, setPlaying] = useState<Sermon | null>(null);
    useEffect(() => {
        const fetch = async () => { const { data } = await supabase.from('sermons').select('*'); if(data) setSermons(data as any); };
        fetch();
    }, []);
    return (
        <div className="p-4 pb-24 space-y-4">
            <h1 className="text-2xl font-black mb-4">Sermons</h1>
            {sermons.map(s => (
                <div key={s.id} onClick={()=>setPlaying(s)} className="cursor-pointer bg-white p-4 rounded-2xl border mb-4">
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-xs">{s.preacher}</p>
                </div>
            ))}
            {playing && <div className="fixed inset-0 bg-black z-50 flex items-center justify-center"><button className="absolute top-4 right-4 text-white" onClick={()=>setPlaying(null)}><X/></button><iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${getYouTubeID(playing.videoUrl || '')}?autoplay=1`}></iframe></div>}
        </div>
    )
};

export const ProfileView = ({ user, onLogout }: any) => { return <div className="p-4"><h1 className="text-2xl font-bold">Profile</h1><p>{user?.firstName} {user?.lastName}</p><p>{user?.email}</p><button onClick={onLogout} className="mt-4 text-red-500 font-bold">Logout</button></div> };
export const NotificationsView = () => <div>Notifications</div>;
export const ContactView = ({ onBack }: any) => <div>Contact Form</div>;
