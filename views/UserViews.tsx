
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Download, Search, CheckCircle, ArrowLeft, Bookmark,
  Calendar, Clock, MoreVertical, X, Send, Sparkles,
  BookOpen, Users, MapPin, Music, ChevronDown, SkipBack, SkipForward, Repeat, Shuffle, Pause, ThumbsUp,
  Edit, Moon, Mail, LogOut, Image as ImageIcon, Phone, Maximize2, Minimize2, ListMusic
} from 'lucide-react';
import { BlogPost, Sermon, CommunityGroup, GroupPost, GroupComment, BibleVerse, Event, MusicTrack, Playlist, User as UserType, Notification } from '../types';
import { supabase } from '../lib/supabaseClient';

const DAILY_VERSE: BibleVerse = { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me.", version: "NKJV" };
const BIBLE_API_KEY = 'j6HVB3_hdmcH_ue5C6QMx';
const BIBLE_ID = 'de4e12af7f28f599-01'; 
const getYouTubeID = (url: string) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };

export const HomeView = ({ onNavigate }: any) => <div className="p-4">Home View</div>;
export const EventsView = ({ onBack }: any) => <div className="p-4">Events View</div>;
export const CommunityView = () => <div className="p-4">Community View</div>;
export const NotificationsView = () => <div className="p-4">Notifications View</div>;
export const BibleView = () => <div className="p-4">Bible View</div>;
export const BlogView = () => <div className="p-4">Blog View</div>;
export const SermonsView = () => <div className="p-4">Sermons View</div>;
export const ContactView = ({ onBack }: any) => <div className="p-4">Contact View</div>;
export const ProfileView = ({ user }: any) => <div className="p-4">Profile View</div>;

export const MusicView = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
     const fetchData = async () => {
        const { data: tData } = await supabase.from('music_tracks').select('*');
        if(tData) setTracks(tData.map((t:any) => ({...t, isOffline: false})));
        
        const { data: pData } = await supabase.from('playlists').select('*');
        if(pData) setPlaylists(pData);
     };
     fetchData();
  }, []);

  useEffect(() => {
     if(currentTrack) {
        setShowMiniPlayer(true);
        if (!currentTrack.url.includes('youtu') && audioRef.current) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay prevented", e));
        } else {
            setIsPlaying(true); 
        }
     }
  }, [currentTrack]);

  const handlePlayPause = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!currentTrack) return;
      if (currentTrack.url.includes('youtu')) {
         setIsPlaying(!isPlaying);
      } else {
         if (isPlaying) audioRef.current?.pause();
         else audioRef.current?.play();
         setIsPlaying(!isPlaying);
      }
  };

  const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if(!currentTrack) return;
      const idx = tracks.findIndex(t => t.id === currentTrack.id);
      if(idx < tracks.length - 1) setCurrentTrack(tracks[idx + 1]);
      else setCurrentTrack(tracks[0]); // Loop
  };

  const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if(!currentTrack) return;
      const idx = tracks.findIndex(t => t.id === currentTrack.id);
      if(idx > 0) setCurrentTrack(tracks[idx - 1]);
      else setCurrentTrack(tracks[tracks.length - 1]);
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 flex flex-col relative overflow-hidden">
        
        {/* Main Content (List) */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Music & Podcasts</h1>

            {/* Playlists */}
            {playlists.length > 0 && (
                <div className="mb-8 overflow-x-auto no-scrollbar flex gap-4 pb-2">
                    {playlists.map(p => (
                        <div key={p.id} className="min-w-[160px] h-40 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl text-white shadow-xl shadow-blue-500/20 shrink-0 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-110 transition"><Music size={64}/></div>
                            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"><Play size={16} fill="white"/></div>
                            <div>
                                <p className="font-bold text-lg truncate leading-tight">{p.name}</p>
                                <p className="text-xs opacity-70 mt-1">Playlist</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Track List */}
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest mb-4">All Tracks</h3>
            <div className="space-y-3">
                {tracks.map((track, idx) => (
                    <div key={track.id} onClick={() => setCurrentTrack(track)} className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${currentTrack?.id === track.id ? 'bg-white dark:bg-slate-800 shadow-lg scale-[1.02] border-blue-500/30' : 'bg-transparent hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${currentTrack?.id === track.id ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                               {currentTrack?.id === track.id && isPlaying ? (
                                   <div className="flex gap-0.5 items-end h-3">
                                       <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                                       <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-3"></div>
                                       <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-1"></div>
                                   </div>
                               ) : (
                                   <span>{idx + 1}</span>
                               )}
                            </div>
                            <div>
                                <p className={`font-bold text-base ${currentTrack?.id === track.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{track.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{track.artist}</p>
                            </div>
                        </div>
                        <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-opacity ${currentTrack?.id === track.id ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`}>
                            <Play size={16} fill="currentColor"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* MINI PLAYER WIDGET */}
        {showMiniPlayer && currentTrack && !isFullScreen && (
            <div onClick={() => setIsFullScreen(true)} className="fixed bottom-[85px] left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 pr-4 rounded-full flex items-center justify-between z-40 animate-slide-up cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative shadow-inner">
                        {currentTrack.url.includes('youtu') ? (
                            <img src={`https://img.youtube.com/vi/${getYouTubeID(currentTrack.url)}/default.jpg`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"><Music size={16} className="text-white"/></div>
                        )}
                        {/* Rotating ring logic could go here */}
                    </div>
                    <div className="min-w-0 max-w-[120px]">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentTrack.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentTrack.artist}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handlePlayPause} className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-md transition transform active:scale-90">
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1"/>}
                    </button>
                    <button onClick={handleNext} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                        <SkipForward size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* FULL SCREEN PLAYER MODAL */}
        {isFullScreen && currentTrack && (
            <div className="fixed inset-0 z-50 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-3xl flex flex-col animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center p-6 mt-safe">
                    <button onClick={() => setIsFullScreen(false)} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                        <ChevronDown className="text-slate-900 dark:text-white" size={28}/>
                    </button>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Now Playing</span>
                    <button className="p-2"><MoreVertical className="text-slate-900 dark:text-white" size={24}/></button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
                    
                    {/* Album Art / Video */}
                    <div className="relative w-full max-w-sm aspect-square rounded-[40px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-white/10">
                        {currentTrack.url.includes('youtu') ? (
                           <iframe 
                             className="w-full h-full pointer-events-none"
                             src={`https://www.youtube.com/embed/${getYouTubeID(currentTrack.url)}?autoplay=${isPlaying ? 1 : 0}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
                             allow="autoplay"
                           />
                        ) : (
                           <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                               <Music size={120} className="text-slate-400 opacity-50"/>
                           </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="text-center w-full">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{currentTrack.title}</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{currentTrack.artist}</p>
                    </div>

                    {/* Progress Bar (Visual Only for MVP) */}
                    <div className="w-full max-w-sm">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                            <span>1:20</span>
                            <span>3:45</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between w-full max-w-sm px-4">
                        <button onClick={handlePrev} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition"><SkipBack size={36}/></button>
                        
                        <button 
                            onClick={handlePlayPause} 
                            className="w-24 h-24 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 transition transform active:scale-95"
                        >
                            {isPlaying ? <Pause size={40} fill="currentColor"/> : <Play size={40} fill="currentColor" className="ml-2"/>}
                        </button>

                        <button onClick={handleNext} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition"><SkipForward size={36}/></button>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 pb-12 flex justify-between items-center max-w-sm mx-auto w-full text-slate-400">
                    <button><Share2 size={24} /></button>
                    <button><ListMusic size={24} /></button>
                </div>
            </div>
        )}

        {/* Hidden Audio Element for MP3s */}
        <audio ref={audioRef} onEnded={() => handleNext()} className="hidden" />
    </div>
  );
};
