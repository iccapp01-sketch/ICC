
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video, UserPlus, Mic, Volume2, Link as LinkIcon, Copy
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
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
     fetch('https://bible-api.com/philippians+4:13')
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

     fetchSermon();
     fetchBlogs();
  }, []);

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
    const [activeTab, setActiveTab] = useState('read');

    useEffect(() => {
        const fetchText = async () => {
            try {
                const encodedBook = encodeURIComponent(book);
                const res = await fetch(`https://bible-api.com/${encodedBook}+${chapter}`);
                const data = await res.json();
                setText(data.text || "Text not found.");
            } catch (e) {
                setText("Could not fetch scripture. Please check internet connection.");
            }
        };
        fetchText();
    }, [book, chapter]);

    const openReadingMode = () => {
        const win = window.open('', '_blank');
        if(win) win.document.write(`<h1>${book} ${chapter}</h1><p>${text}</p>`);
    }

    return (
        <div className="p-4 pb-32 h-full flex flex-col">
             <div className="flex gap-4 mb-4 border-b border-slate-200">
                 <button onClick={()=>setActiveTab('read')} className={`pb-2 ${activeTab==='read'?'text-blue-600 border-b-2 border-blue-600':''}`}>Scripture</button>
                 <button onClick={()=>setActiveTab('plan')} className={`pb-2 ${activeTab==='plan'?'text-blue-600 border-b-2 border-blue-600':''}`}>Reading Plan</button>
                 <button onClick={()=>setActiveTab('bookmarks')} className={`pb-2 ${activeTab==='bookmarks'?'text-blue-600 border-b-2 border-blue-600':''}`}>Bookmarks</button>
             </div>
             
             {activeTab === 'read' && (
                 <>
                    <div className="flex gap-2 mb-3 bg-white p-4 rounded-xl shadow-sm">
                        <select className="flex-1 bg-slate-50 p-2 rounded text-slate-900" value={book} onChange={e => setBook(e.target.value)}>{BIBLE_BOOKS.map(b=><option key={b}>{b}</option>)}</select>
                        <select className="w-20 bg-slate-50 p-2 rounded text-slate-900" value={chapter} onChange={e=>setChapter(parseInt(e.target.value))}>{[...Array(50)].map((_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select>
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-2xl overflow-y-auto cursor-pointer" onClick={openReadingMode}>
                         <h2 className="text-2xl font-serif font-bold mb-4">{book} {chapter}</h2>
                         <p className="text-lg leading-loose font-serif whitespace-pre-wrap">{text}</p>
                    </div>
                 </>
             )}
             {activeTab === 'plan' && <div className="p-4 text-center text-slate-500">Reading Plans Coming Soon</div>}
             {activeTab === 'bookmarks' && <div className="p-4 text-center text-slate-500">Bookmarks Coming Soon</div>}
        </div>
    );
};

// --- EVENTS VIEW ---
export const EventsView = ({ onBack }: any) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [rsvp, setRsvp] = useState<any>({});

    useEffect(() => {
        const fetch = async () => { const { data } = await supabase.from('events').select('*'); if(data) setEvents(data as any); };
        fetch();
    }, []);

    const handleRsvp = async (eventId: string, status: string) => {
        setRsvp({...rsvp, [eventId]: status});
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
             await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: user.id, status });
        }
    };

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-4 dark:text-white">Events</h1>
            {events.map(ev => (
                <div key={ev.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-4 border dark:border-slate-700">
                    {ev.image && <div className="h-32 bg-cover bg-center rounded-xl mb-3" style={{backgroundImage: `url(${ev.image})`}}></div>}
                    <h3 className="font-bold dark:text-white">{ev.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{ev.date} at {ev.time}</p>
                    <div className="flex gap-2">
                        <button onClick={()=>handleRsvp(ev.id, 'Yes')} className={`flex-1 py-1 rounded text-xs font-bold border ${rsvp[ev.id]==='Yes'?'bg-green-600 text-white':'text-slate-500'}`}>Yes</button>
                        <button onClick={()=>handleRsvp(ev.id, 'No')} className={`flex-1 py-1 rounded text-xs font-bold border ${rsvp[ev.id]==='No'?'bg-red-500 text-white':'text-slate-500'}`}>No</button>
                        <button onClick={()=>handleRsvp(ev.id, 'Maybe')} className={`flex-1 py-1 rounded text-xs font-bold border ${rsvp[ev.id]==='Maybe'?'bg-orange-500 text-white':'text-slate-500'}`}>Maybe</button>
                    </div>
                </div>
            ))}
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
            <div className="flex px-4 pt-2 gap-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                {['MUSIC', 'PODCAST', 'MY_PLAYLISTS'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab as any)} 
                        className={`pb-3 text-sm font-bold tracking-wide whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
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

            {/* BIG PLAYER DOCK */}
            {currentTrack && (
                <div 
                    className={`fixed bottom-[80px] left-2 right-2 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-4 flex flex-col z-40 transition-all cursor-pointer border border-white/10`}
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
            )}
            
            {/* FULL SCREEN PLAYER MODAL */}
            {isFullScreen && currentTrack && (
                <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col p-8 text-white">
                    <button onClick={()=>setIsFullScreen(false)} className="self-center mb-8 bg-white/10 p-2 rounded-full"><ChevronDown/></button>
                    
                    {currentTrack.url.includes('youtube') ? (
                         <div className="w-full aspect-square bg-black rounded-3xl mb-8 overflow-hidden shadow-2xl">
                             <iframe 
                                width="100%" height="100%" 
                                src={`https://www.youtube.com/embed/${getYouTubeID(currentTrack.url)}?autoplay=1&controls=0`} 
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

    useEffect(() => {
        const fetchBlogs = async () => {
            const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
            if(data) setBlogs(data.map((b:any)=>({...b, image: b.image_url})));
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        if (selectedBlog) {
            setLikes(selectedBlog.likes || 0);
            const fetchComments = async () => {
                const { data } = await supabase
                    .from('blog_comments')
                    .select('*, profiles(first_name, last_name)')
                    .eq('blog_id', selectedBlog.id) // CHANGED FROM post_id
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
            blog_id: selectedBlog.id, // CHANGED FROM post_id
            user_id: user.id,
            content: commentText
        });
        
        if(error) alert("Error posting comment: " + error.message);
        else {
            setCommentText('');
            // Refetch
            const { data } = await supabase.from('blog_comments').select('*, profiles(first_name, last_name)').eq('blog_id', selectedBlog.id).order('created_at', { ascending: false });
            if(data) setComments(data);
        }
    }

    // --------------------------------------------------------
    // ROBUST SHARE FUNCTION
    // --------------------------------------------------------
    function shareBlog(selectedBlog: any) {
        const currentURL = window.location.href;
        const blogURL = selectedBlog?.url || currentURL; // use blog URL if available, else current page
        const text = selectedBlog?.content || "";
        const title = selectedBlog?.title || "Sharing this blog";

        if (blogURL && !blogURL.startsWith("http")) {
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

    if(selectedBlog) {
        return (
            <div className="p-4 pb-24 bg-white dark:bg-slate-900 min-h-full">
                <button onClick={()=>setSelectedBlog(null)} className="mb-4 flex items-center gap-2 text-slate-500"><ArrowLeft size={16}/> Back to Articles</button>
                {selectedBlog.image && <img src={selectedBlog.image} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm" alt="Blog cover" />}
                <div className="flex justify-between items-start gap-4 mb-2">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex-1">{selectedBlog.title}</h1>
                    {/* DUPLICATE SHARE BUTTON REMOVED FROM HERE */}
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
                        
                        {/* SINGLE SHARE BUTTON */}
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
            {blogs.map(blog => (
                <div key={blog.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-4">
                        {blog.image && <div className="w-24 h-24 bg-cover bg-center rounded-xl flex-shrink-0" style={{backgroundImage: `url(${blog.image})`}}></div>}
                        <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{blog.category}</span>
                                <span className="text-[10px] text-slate-400">{new Date(blog.date).toLocaleDateString()}</span>
                             </div>
                             <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">{blog.title}</h3>
                             <p className="text-xs text-slate-500 line-clamp-2 mb-3">{blog.excerpt}</p>
                             <button onClick={()=>setSelectedBlog(blog)} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">Read More <ChevronRight size={12}/></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- SERMONS VIEW ---
export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => { const { data } = await supabase.from('sermons').select('*'); if(data) setSermons(data as any); }
        fetch();
    }, []);

    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Sermon Library</h1>
            <div className="grid gap-4">
                {sermons.map(s => (
                    <div key={s.id} onClick={() => setSelectedVideo(s.videoUrl || null)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer group">
                        <div className="aspect-video bg-slate-200 relative bg-cover bg-center" style={{ backgroundImage: s.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(s.videoUrl)}/mqdefault.jpg)` : 'none' }}>
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                                 <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                     <Play fill="white" className="text-white ml-1"/>
                                 </div>
                             </div>
                             <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">{s.duration}</span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{s.title}</h3>
                            <p className="text-xs text-slate-500">{s.preacher} • {s.date}</p>
                        </div>
                    </div>
                ))}
            </div>
            {selectedVideo && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
                    <button onClick={()=>setSelectedVideo(null)} className="absolute top-4 right-4 text-white"><X size={32}/></button>
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                        <iframe 
                            width="100%" height="100%" 
                            src={`https://www.youtube.com/embed/${getYouTubeID(selectedVideo)}?autoplay=1`} 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMMUNITY VIEW ---
export const CommunityView = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [activeGroup, setActiveGroup] = useState<CommunityGroup | null>(null);

    useEffect(() => {
        const fetch = async () => { const { data } = await supabase.from('community_groups').select('*'); if(data) setGroups(data as any); };
        fetch();
    }, []);

    const handleJoin = async (groupId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        await supabase.from('community_group_members').insert({ group_id: groupId, user_id: user.id, status: 'pending' });
        alert("Request sent!");
    };

    if (activeGroup) {
        return (
            <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
                <div className="p-4 bg-white dark:bg-slate-800 border-b flex items-center gap-3">
                    <button onClick={()=>setActiveGroup(null)}><ArrowLeft/></button>
                    <h2 className="font-bold">{activeGroup.name}</h2>
                </div>
                <div className="flex-1 p-4 flex flex-col items-center justify-center text-slate-400">
                    <MessageCircle size={48} className="mb-4 opacity-50"/>
                    <p>Chat feed coming soon...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24">
             <h1 className="text-2xl font-black mb-6 dark:text-white">Community Groups</h1>
             <div className="space-y-4">
                 {groups.map(g => (
                     <div key={g.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                         <div className="flex gap-4 items-center mb-3">
                             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">{g.name[0]}</div>
                             <div className="flex-1">
                                 <h3 className="font-bold text-slate-900 dark:text-white">{g.name}</h3>
                                 <p className="text-xs text-slate-500 line-clamp-1">{g.description}</p>
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={()=>setActiveGroup(g)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 py-2 rounded-xl text-xs font-bold">View</button>
                             <button onClick={()=>handleJoin(g.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold">Join Group</button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
};

// --- PROFILE VIEW ---
export const ProfileView = ({ user, onLogout, onNavigate }: any) => {
    return (
        <div className="p-4 pb-24">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black dark:text-white">Profile</h1>
                <button onClick={onLogout} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg">Logout</button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 text-center">
                 <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                     {user?.firstName?.[0]}{user?.lastName?.[0]}
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
                 <p className="text-slate-500 text-sm">{user?.email}</p>
                 <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded mt-2 uppercase tracking-wide">{user?.role}</span>
            </div>

            <div className="space-y-2">
                <button onClick={()=>onNavigate('notifications')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-3"><Bell size={18} className="text-slate-400"/> Notifications</span>
                    <ChevronRight size={16} className="text-slate-400"/>
                </button>
                <button onClick={()=>onNavigate('contact')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-3"><Mail size={18} className="text-slate-400"/> Contact Us</span>
                    <ChevronRight size={16} className="text-slate-400"/>
                </button>
            </div>
        </div>
    );
};

export const ContactView = ({ onBack }: any) => (
    <div className="p-4">
        <button onClick={onBack} className="mb-4 flex items-center gap-2"><ArrowLeft/> Back</button>
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <div className="bg-white p-6 rounded-2xl space-y-4">
             <input className="w-full border p-3 rounded-xl" placeholder="Subject"/>
             <textarea className="w-full border p-3 rounded-xl h-32" placeholder="Message"/>
             <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Send Message</button>
        </div>
    </div>
);

export const NotificationsView = () => (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="text-center text-slate-400 mt-10">No new notifications</div>
    </div>
);
