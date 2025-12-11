
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, ChevronUp, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic, Video, UserPlus, Mic, Volume2, Link as LinkIcon, Copy, Info,
  Edit2, Save, Sun, Check, ArrowRight, Bookmark as BookmarkIcon, Film, MessageSquare, Reply, Facebook, Instagram, Loader2, Lock, ThumbsDown, Plus, Trash2, MoreHorizontal
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
      <div className="p-4 space-y-6">
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

// --- MUSIC VIEW (UPDATED) ---
export const MusicView = () => {
    const [activeTab, setActiveTab] = useState<'library' | 'podcast' | 'playlists'>('library');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    
    // Playlist Management
    const [viewingPlaylist, setViewingPlaylist] = useState<Playlist | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [isAddingToPlaylist, setIsAddingToPlaylist] = useState<string | null>(null); // track id to add
    
    const audioRef = useRef<HTMLAudioElement>(null);

    // Initial Fetch
    useEffect(() => { 
        const fetchContent = async () => {
             // Fetch Tracks
             const { data: trackData } = await supabase.from('music_tracks').select('*'); 
             if(trackData) setTracks(trackData as any);
             
             // Fetch Playlists
             const { data: { user } } = await supabase.auth.getUser();
             if(user) {
                 const { data: playlistData } = await supabase.from('playlists').select('*').eq('user_id', user.id);
                 if(playlistData) setPlaylists(playlistData as any);
             }
        }; 
        fetchContent(); 
    }, []);

    // Audio Logic
    useEffect(() => {
        if(currentTrack && audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Auto-play prevented", e));
        }
    }, [currentTrack]);

    const togglePlay = () => {
        if(!audioRef.current || !currentTrack) return;
        if(isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if(audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(audioRef.current) {
            const time = Number(e.target.value);
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        if(isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Playlist Actions
    const createPlaylist = async () => {
        if(!newPlaylistName.trim()) return;
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        const { data, error } = await supabase.from('playlists').insert({
            title: newPlaylistName,
            user_id: user.id,
            tracks: []
        }).select();

        if(data) {
            setPlaylists([...playlists, data[0] as any]);
            setIsCreatingPlaylist(false);
            setNewPlaylistName('');
        }
    };

    const deletePlaylist = async (id: string) => {
        if(!confirm("Are you sure you want to delete this playlist?")) return;
        await supabase.from('playlists').delete().eq('id', id);
        setPlaylists(playlists.filter(p => p.id !== id));
        if(viewingPlaylist?.id === id) setViewingPlaylist(null);
    };

    const addTrackToPlaylist = async (playlistId: string, track: MusicTrack) => {
        const playlist = playlists.find(p => p.id === playlistId);
        if(!playlist) return;

        const currentTracks = playlist.tracks || [];
        // Avoid duplicates
        if(currentTracks.find(t => t.id === track.id)) {
            alert("Track already in playlist");
            setIsAddingToPlaylist(null);
            return;
        }
        
        const updatedTracks = [...currentTracks, track];
        
        const { error } = await supabase.from('playlists')
            .update({ tracks: updatedTracks })
            .eq('id', playlistId);

        if(!error) {
            setPlaylists(playlists.map(p => p.id === playlistId ? { ...p, tracks: updatedTracks } : p));
            alert("Added to playlist!");
        }
        setIsAddingToPlaylist(null);
    };

    const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
        const playlist = playlists.find(p => p.id === playlistId);
        if(!playlist) return;
        
        const updatedTracks = (playlist.tracks || []).filter(t => t.id !== trackId);
        
        const { error } = await supabase.from('playlists')
            .update({ tracks: updatedTracks })
            .eq('id', playlistId);

        if(!error) {
            const updatedPlaylist = { ...playlist, tracks: updatedTracks };
            setPlaylists(playlists.map(p => p.id === playlistId ? updatedPlaylist : p));
            if(viewingPlaylist?.id === playlistId) setViewingPlaylist(updatedPlaylist);
        }
    };

    // Filter Content
    const libraryTracks = tracks.filter(t => t.type !== 'PODCAST'); // Default to music if null or 'MUSIC'
    const podcastTracks = tracks.filter(t => t.type === 'PODCAST');

    return (
        <div className="flex flex-col min-h-full pb-20"> {/* pb-20 for fixed player + safe area */}
            
            {/* Header & Tabs */}
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-30 pt-4 px-4 pb-2 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <h1 className="text-2xl font-black mb-4 dark:text-white">Media</h1>
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                    <button onClick={()=>{setActiveTab('library'); setViewingPlaylist(null);}} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab==='library' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Music Library</button>
                    <button onClick={()=>{setActiveTab('podcast'); setViewingPlaylist(null);}} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab==='podcast' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Podcasts</button>
                    <button onClick={()=>{setActiveTab('playlists');}} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab==='playlists' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Playlists</button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 pb-32"> {/* Extra padding bottom for player */}
                
                {activeTab === 'library' && (
                    <div className="space-y-3">
                        {libraryTracks.map(track => (
                            <TrackItem 
                                key={track.id} 
                                track={track} 
                                isPlaying={currentTrack?.id === track.id && isPlaying}
                                onClick={() => setCurrentTrack(track)}
                                onAddToPlaylist={() => setIsAddingToPlaylist(track.id)}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'podcast' && (
                    <div className="space-y-3">
                        {podcastTracks.map(track => (
                            <TrackItem 
                                key={track.id} 
                                track={track} 
                                isPlaying={currentTrack?.id === track.id && isPlaying}
                                onClick={() => setCurrentTrack(track)}
                                onAddToPlaylist={() => setIsAddingToPlaylist(track.id)}
                                isPodcast
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'playlists' && !viewingPlaylist && (
                    <div>
                        <button 
                            onClick={() => setIsCreatingPlaylist(true)}
                            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition mb-6"
                        >
                            <Plus size={20}/> Create New Playlist
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {playlists.map(playlist => (
                                <div key={playlist.id} onClick={() => setViewingPlaylist(playlist)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border dark:border-slate-700 cursor-pointer hover:scale-[1.02] transition">
                                    <div className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-3 flex items-center justify-center text-white shadow-inner">
                                        <ListMusic size={32}/>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{playlist.title || playlist.name}</h3>
                                    <p className="text-xs text-slate-500">{(playlist.tracks || []).length} Tracks</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'playlists' && viewingPlaylist && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setViewingPlaylist(null)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border dark:border-slate-700"><ArrowLeft size={20} className="text-slate-600 dark:text-slate-300"/></button>
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{viewingPlaylist.title || viewingPlaylist.name}</h2>
                                <p className="text-xs text-slate-500">{(viewingPlaylist.tracks || []).length} Tracks</p>
                            </div>
                            <button onClick={() => deletePlaylist(viewingPlaylist.id)} className="p-2 bg-red-50 text-red-500 rounded-full"><Trash2 size={20}/></button>
                        </div>
                        
                        <div className="space-y-3">
                            {(viewingPlaylist.tracks || []).length === 0 ? (
                                <p className="text-center text-slate-400 py-10 italic">No tracks in this playlist yet.</p>
                            ) : (
                                (viewingPlaylist.tracks || []).map(track => (
                                    <TrackItem 
                                        key={track.id} 
                                        track={track} 
                                        isPlaying={currentTrack?.id === track.id && isPlaying}
                                        onClick={() => setCurrentTrack(track)}
                                        onRemoveFromPlaylist={() => removeTrackFromPlaylist(viewingPlaylist.id, track.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isCreatingPlaylist && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl w-full max-w-xs shadow-2xl animate-fade-in">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">New Playlist</h3>
                        <input 
                            autoFocus
                            className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-xl p-3 mb-4 outline-none dark:text-white font-medium" 
                            placeholder="Playlist Name"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsCreatingPlaylist(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-slate-500">Cancel</button>
                            <button onClick={createPlaylist} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingToPlaylist && (
                 <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl w-full max-w-xs shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Add to Playlist</h3>
                            <button onClick={() => setIsAddingToPlaylist(null)}><X size={20} className="text-slate-400"/></button>
                        </div>
                        <div className="space-y-2">
                            {playlists.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => {
                                        const track = tracks.find(t => t.id === isAddingToPlaylist);
                                        if(track) addTrackToPlaylist(p.id, track);
                                    }}
                                    className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><ListMusic size={16}/></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{p.title || p.name}</span>
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => { setIsAddingToPlaylist(null); setActiveTab('playlists'); setIsCreatingPlaylist(true); }}
                            className="w-full mt-4 py-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 font-bold text-sm"
                        >
                            + Create New Playlist
                        </button>
                    </div>
                </div>
            )}

            {/* Persistent Media Player */}
            <div className={`fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-2 right-2 z-40 transition-all duration-300 transform ${currentTrack ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                {currentTrack && (
                    <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-2xl p-3 flex flex-col gap-2">
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden cursor-pointer group">
                             <div className="h-full bg-blue-500 rounded-full relative" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                             <input 
                                type="range" 
                                min="0" 
                                max={duration || 0} 
                                value={currentTime} 
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Cover Art */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                                {currentTrack.type === 'PODCAST' ? <Mic size={20}/> : <Music size={20}/>}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{currentTrack.title}</h4>
                                <p className="text-xs text-slate-500 truncate">{currentTrack.artist}</p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hidden sm:block"><SkipBack size={20} fill="currentColor" /></button>
                                <button 
                                    onClick={togglePlay}
                                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition transform active:scale-95"
                                >
                                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1"/>}
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hidden sm:block"><SkipForward size={20} fill="currentColor" /></button>
                            </div>
                        </div>
                        
                        {/* Mobile Time */}
                        <div className="flex justify-between px-1">
                             <span className="text-[10px] font-medium text-slate-400 font-mono">{formatTime(currentTime)}</span>
                             <span className="text-[10px] font-medium text-slate-400 font-mono">-{formatTime(duration - currentTime)}</span>
                        </div>

                        <audio 
                            ref={audioRef} 
                            src={currentTrack.url} 
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Component for Track Item
const TrackItem = ({ track, isPlaying, onClick, onAddToPlaylist, onRemoveFromPlaylist, isPodcast }: any) => (
    <div className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer relative overflow-hidden">
        <div onClick={onClick} className="absolute inset-0 z-0"></div>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm z-10 relative transition-transform group-hover:scale-105 ${isPlaying ? 'bg-blue-500' : isPodcast ? 'bg-purple-500' : 'bg-indigo-500'}`}>
            {isPlaying ? (
                <div className="flex gap-0.5 items-end h-4">
                    <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                    <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-4"></div>
                    <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-3"></div>
                </div>
            ) : (
                <Play size={18} fill="currentColor" />
            )}
        </div>
        
        <div className="flex-1 min-w-0 z-10 pointer-events-none">
            <h4 className={`font-bold text-sm truncate ${isPlaying ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{track.title}</h4>
            <p className="text-xs text-slate-500 truncate">{track.artist} • {track.duration}</p>
        </div>

        <div className="z-20 flex items-center gap-1">
             {onAddToPlaylist && (
                 <button onClick={(e) => { e.stopPropagation(); onAddToPlaylist(); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition">
                     <Plus size={18}/>
                 </button>
             )}
             {onRemoveFromPlaylist && (
                 <button onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-full transition">
                     <Trash2 size={18}/>
                 </button>
             )}
        </div>
    </div>
);

// --- GROUP CHAT (STANDALONE FULL SCREEN LAYOUT) ---
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
        
        // 1. Optimistic Update
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
        
        try {
            if (isLiked) {
                await supabase.from('group_post_likes').delete().match({ post_id: postId, user_id: userId });
            } else {
                await supabase.from('group_post_likes').insert({ post_id: postId, user_id: userId });
            }
        } catch (error) {
            console.error("Like error:", error);
            fetchPosts();
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
            await fetchPosts();
        } else {
            console.error("Post Error:", error);
            alert(`Failed to post: ${error.message}`);
        }
    };

    const rootPosts = posts.filter(p => !p.parent_id);

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100 dark:bg-slate-900 h-full overflow-hidden">
            {/* Header */}
            <div className="flex-none bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm z-10 pt-[env(safe-area-inset-top)]">
                <div className="px-4 py-4 flex items-center gap-3">
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
            </div>

            {/* Posts Feed */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-100 dark:bg-slate-900/50 pb-4"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
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

                            {/* Content */}
                            <div className="mb-4">
                                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Actions */}
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

                            {/* Replies */}
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
            <div className="flex-none bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20"
                 style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
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
        <div className="bg-slate-50 dark:bg-slate-900 min-h-full">
             <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10 sticky top-0 shadow-sm">
                 <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                     <button onClick={()=>setActiveTab('read')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab==='read' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Scripture</button>
                     <button onClick={()=>setActiveTab('plan')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab==='plan' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Reading Plan</button>
                 </div>
             </div>
             {activeTab === 'read' && (
                 <div className="p-6">
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
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Events</h1>
            {events.map(ev => (<div key={ev.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-4 border dark:border-slate-700"><h3 className="font-bold dark:text-white">{ev.title}</h3><p className="text-sm text-slate-500">{ev.description}</p></div>))}
        </div>
    );
};

export const SermonsView = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    useEffect(() => { const fetchSermons = async () => { const { data } = await supabase.from('sermons').select('*'); if(data) setSermons(data as any); }; fetchSermons(); }, []);
    return (
        <div className="p-4">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Sermons</h1>
            <div className="grid gap-6">{sermons.map(s => (<div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border dark:border-slate-700"><div className="h-48 bg-slate-200 bg-cover bg-center" style={{ backgroundImage: s.videoUrl ? `url(https://img.youtube.com/vi/${getYouTubeID(s.videoUrl ?? "")}/mqdefault.jpg)` : 'none' }}></div><div className="p-4"><h3 className="font-bold dark:text-white">{s.title}</h3></div></div>))}</div>
        </div>
    );
};

export const BlogView = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
    useEffect(() => { const fetchBlogs = async () => { const { data } = await supabase.from('blog_posts').select('*'); if(data) setBlogs(data.map((b: any) => ({...b, image: b.image_url}))); }; fetchBlogs(); }, []);
    if (selectedBlog) return <div className="p-4"><button onClick={()=>setSelectedBlog(null)} className="mb-4 flex items-center gap-2"><ArrowLeft size={16}/> Back</button><h1 className="text-2xl font-bold dark:text-white">{selectedBlog.title}</h1><p className="dark:text-white mt-4">{selectedBlog.content}</p></div>;
    return (
        <div className="p-4">
            <h1 className="text-2xl font-black mb-6 dark:text-white">Articles</h1>
            <div className="grid gap-6">{blogs.map(blog => (<div key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700"><h3 className="font-bold dark:text-white">{blog.title}</h3><p className="text-xs text-slate-500">{blog.excerpt}</p></div>))}</div>
        </div>
    );
};

export const ContactView = ({ onBack }: { onBack: () => void }) => (<div className="p-4"><button onClick={onBack} className="mb-6 flex items-center gap-2"><ArrowLeft size={16}/> Back</button><h1 className="text-2xl font-black dark:text-white">Contact</h1><p className="dark:text-white">info@isipingochurch.com</p></div>);

export const ProfileView = ({ user, onUpdateUser, onLogout, toggleTheme, isDarkMode, onNavigate }: any) => {
    if(!user) return <div className="p-4 text-center">Please log in.</div>;
    return (
        <div className="p-4">
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

export const NotificationsView = () => <div className="p-4"><h1 className="text-2xl font-black dark:text-white">Notifications</h1><p className="text-center text-slate-500">No new notifications.</p></div>;

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
        <div className="p-4 space-y-6">
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
