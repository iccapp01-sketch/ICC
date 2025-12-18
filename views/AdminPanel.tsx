
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy, Loader2, ListMusic, Plus, UserPlus, Download, FolderPlus, FileAudio, Image as ImageIcon, Film, Link as LinkIcon, Youtube, ArrowLeft, ShieldOff, Phone, Monitor, Clock, Tag, Settings
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup, MusicTrack, Playlist, Reel, ReadingPlanDay } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Logo } from '../components/Logo';

interface AdminProps {
  onLogout: () => void;
}

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'content', icon: FileText, label: 'Blog' },
  { id: 'media', icon: Video, label: 'Sermons' },
  { id: 'reels', icon: Film, label: 'Reels' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'groups', icon: MessageCircle, label: 'Groups' },
  { id: 'bible', icon: BookOpen, label: 'Bible' },
  { id: 'events', icon: Calendar, label: 'Events' },
];

const getYouTubeID = (url: string) => { 
    if (!url) return null; 
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null; 
};

const handleSupabaseError = (error: any, context: string) => {
    console.error(`${context} Error:`, error);
    alert(`${context} Action Failed: ${error.message || "Check console for details."}`);
};

export const AdminPanel: React.FC<AdminProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState('overview');

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return <Overview onNavigate={setActiveView} />;
      case 'members': return <MembersManager />;
      case 'content': return <ContentManager />;
      case 'media': return <SermonManager />;
      case 'reels': return <ReelManager />;
      case 'music': return <MusicManager />;
      case 'groups': return <GroupManager />;
      case 'bible': return <BibleManager />;
      case 'events': return <EventManager />;
      default: return <Overview onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans">
      <div className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
           <Logo className="w-8 h-8" />
           <div>
               <h2 className="font-bold text-lg text-[#0c2d58] leading-none">Admin</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dashboard</p>
           </div>
        </div>
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
           {SIDEBAR_ITEMS.map(item => (
             <button 
               key={item.id}
               onClick={() => setActiveView(item.id)}
               className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition text-sm font-medium ${
                 activeView === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
               }`}
             >
               <item.icon size={20} />
               {item.label}
             </button>
           ))}
        </div>
        <div className="p-4 border-t border-slate-100">
           <button onClick={onLogout} className="flex items-center gap-3 text-red-500 px-4 py-2 hover:bg-red-50 w-full rounded-xl transition text-sm font-bold">
             <LogOut size={20} /> Logout
           </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-slate-50">
        {renderContent()}
      </div>
    </div>
  );
};

const Overview = ({ onNavigate }: { onNavigate: (v: string) => void }) => {
  const [stats, setStats] = useState({ members: 0, blogs: 0, sermons: 0, events: 0, pendingRequests: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: members } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: blogs } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
      const { count: sermons } = await supabase.from('sermons').select('*', { count: 'exact', head: true });
      const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      setStats({
        members: members || 0,
        blogs: blogs || 0,
        sermons: sermons || 0,
        events: events || 0,
        pendingRequests: 0
      });
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div onClick={() => onNavigate('members')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
             <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-xl text-white"><Users size={24} /></div>
                <span className="text-3xl font-bold text-slate-800">{stats.members}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">Total Members</p>
          </div>
          <div onClick={() => onNavigate('content')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
             <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 p-3 rounded-xl text-white"><FileText size={24} /></div>
                <span className="text-3xl font-bold text-slate-800">{stats.blogs}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">Blogs Published</p>
          </div>
          <div onClick={() => onNavigate('media')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
             <div className="flex items-center justify-between mb-4">
                <div className="bg-red-500 p-3 rounded-xl text-white"><Video size={24} /></div>
                <span className="text-3xl font-bold text-slate-800">{stats.sermons}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">Sermons Uploaded</p>
          </div>
          <div onClick={() => onNavigate('events')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
             <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500 p-3 rounded-xl text-white"><Calendar size={24} /></div>
                <span className="text-3xl font-bold text-slate-800">{stats.events}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">Upcoming Events</p>
          </div>
      </div>
    </div>
  );
};

const MembersManager = () => {
    const [members, setMembers] = useState<User[]>([]);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if(data) {
             setMembers(data.map((m: any) => ({
                 id: m.id,
                 firstName: m.first_name || '',
                 lastName: m.last_name || '',
                 email: m.email || '',
                 phone: m.phone || '',
                 dob: m.dob || '',
                 role: m.role || 'MEMBER',
                 joinedDate: m.created_at
             })));
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold mb-4">Members Directory</h3>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b text-slate-500">
                        <th className="pb-3 px-2">Name</th>
                        <th className="pb-3 px-2">Email</th>
                        <th className="pb-3 px-2">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(m => (
                        <tr key={m.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-2 font-bold">{m.firstName} {m.lastName}</td>
                            <td className="py-3 px-2">{m.email}</td>
                            <td className="py-3 px-2"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{m.role}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const ContentManager = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [form, setForm] = useState({ title: '', content: '', author: 'Admin', category: 'General', image_url: '' });

    useEffect(() => { fetchBlogs(); }, []);
    const fetchBlogs = async () => { 
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false}); 
        if(data) setBlogs(data as any); 
    };
    const saveBlog = async () => { 
        await supabase.from('blog_posts').insert([{ ...form, created_at: new Date().toISOString() }]); 
        fetchBlogs(); 
        setForm({ title: '', content: '', author: 'Admin', category: 'General', image_url: '' }); 
    };
    const deleteBlog = async (id: string) => { await supabase.from('blog_posts').delete().eq('id', id); fetchBlogs(); };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Create Blog Post</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <textarea className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Content" value={form.content} onChange={e=>setForm({...form, content: e.target.value})} />
                    <button onClick={saveBlog} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Publish Post</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                {blogs.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-2 border-b">
                        <span className="font-bold">{b.title}</span>
                        <button onClick={()=>deleteBlog(b.id)} className="text-red-500"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SermonManager = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ 
        title: '', 
        preacher: '', 
        video_url: '', 
        date_preached: new Date().toISOString().split('T')[0], 
        duration: '' 
    });

    useEffect(() => { fetchSermons(); }, []);

    const fetchSermons = async () => { 
        const { data } = await supabase.from('sermons').select('*').order('created_at', {ascending:false}); 
        if(data) setSermons(data as any); 
    };

    const saveSermon = async () => {
        if (!form.title || !form.video_url) return alert("Title and Video URL are required.");
        setIsLoading(true);

        const payload = {
            title: form.title,
            preacher: form.preacher,
            video_url: form.video_url,
            date_preached: form.date_preached,
            duration: form.duration,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('sermons').insert([payload]);

        if (error) {
            handleSupabaseError(error, 'Add Sermon');
        } else {
            setForm({ title: '', preacher: '', video_url: '', date_preached: new Date().toISOString().split('T')[0], duration: '' });
            fetchSermons();
        }
        setIsLoading(false);
    };

    const deleteSermon = async (id: string) => { 
        if(!confirm("Delete this sermon?")) return;
        await supabase.from('sermons').delete().eq('id', id); 
        fetchSermons(); 
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-4 text-[#0c2d58] text-lg">Upload Sermon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Title</label>
                        <input className="w-full border p-2.5 rounded-xl bg-slate-50" placeholder="e.g. The Power of Grace" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                        <label className="block text-xs font-bold text-slate-500 uppercase">Preacher</label>
                        <input className="w-full border p-2.5 rounded-xl bg-slate-50" placeholder="Speaker Name" value={form.preacher} onChange={e=>setForm({...form, preacher: e.target.value})} />
                        <label className="block text-xs font-bold text-slate-500 uppercase">YouTube Video URL</label>
                        <input className="w-full border p-2.5 rounded-xl bg-slate-50" placeholder="https://www.youtube.com/watch?v=..." value={form.video_url} onChange={e=>setForm({...form, video_url: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Date Preached</label>
                        <input type="date" className="w-full border p-2.5 rounded-xl bg-slate-50" value={form.date_preached} onChange={e=>setForm({...form, date_preached: e.target.value})} />
                        <label className="block text-xs font-bold text-slate-500 uppercase">Duration</label>
                        <input className="w-full border p-2.5 rounded-xl bg-slate-50" placeholder="e.g. 45:00" value={form.duration} onChange={e=>setForm({...form, duration: e.target.value})} />
                        <button onClick={saveSermon} disabled={isLoading} className="w-full mt-5 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>}
                            Add Sermon
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold mb-4 text-[#0c2d58] text-lg">Sermon Library</h3>
                 <div className="space-y-3">
                     {sermons.map(s => {
                         const ytId = getYouTubeID(s.video_url);
                         return (
                            <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-12 bg-slate-200 rounded-lg bg-cover bg-center flex-shrink-0" style={{backgroundImage: ytId ? `url(https://img.youtube.com/vi/${ytId}/default.jpg)` : 'none'}}></div>
                                    <div>
                                        <p className="font-bold text-slate-900 line-clamp-1">{s.title}</p>
                                        <p className="text-xs text-slate-500">{s.preacher} • {s.date_preached}</p>
                                    </div>
                                </div>
                                <button onClick={()=>deleteSermon(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                            </div>
                         );
                     })}
                 </div>
            </div>
        </div>
    );
};

const ReelManager = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [form, setForm] = useState({ title: '', description: '', video_url: '' });
    useEffect(() => { fetchReels(); }, []);
    const fetchReels = async () => { const { data } = await supabase.from('reels').select('*').order('created_at', {ascending:false}); if(data) setReels(data as any); };
    const saveReel = async () => { await supabase.from('reels').insert([{...form, created_at: new Date().toISOString()}]); fetchReels(); setForm({ title: '', description: '', video_url: '' }); };
    const deleteReel = async (id: string) => { await supabase.from('reels').delete().eq('id', id); fetchReels(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Add Reel</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Direct Video URL" value={form.video_url} onChange={e=>setForm({...form, video_url: e.target.value})} />
                    <button onClick={saveReel} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Add Reel</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                {reels.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-3 border-b">
                        <p className="font-bold">{r.title}</p>
                        <button onClick={()=>deleteReel(r.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MusicManager = () => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [form, setForm] = useState({ title: '', artist: '', url: '', type: 'MUSIC' });
    useEffect(() => { fetchTracks(); }, []);
    const fetchTracks = async () => { const { data } = await supabase.from('music_tracks').select('*'); if(data) setTracks(data as any); };
    const saveTrack = async () => { await supabase.from('music_tracks').insert([form]); fetchTracks(); setForm({ title: '', artist: '', url: '', type: 'MUSIC' }); };
    const deleteTrack = async (id: string) => { await supabase.from('music_tracks').delete().eq('id', id); fetchTracks(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Add Music Track</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Artist" value={form.artist} onChange={e=>setForm({...form, artist: e.target.value})} />
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Audio URL" value={form.url} onChange={e=>setForm({...form, url: e.target.value})} />
                    <button onClick={saveTrack} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Upload Track</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                {tracks.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-2 border-b">
                        <div><p className="font-bold">{t.title}</p><p className="text-xs text-slate-500">{t.artist}</p></div>
                        <button onClick={()=>deleteTrack(t.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GroupManager = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [form, setForm] = useState({ name: '', description: '', image: '' });
    useEffect(() => { fetchGroups(); }, []);
    const fetchGroups = async () => { const { data } = await supabase.from('community_groups').select('*'); if(data) setGroups(data as any); };
    const saveGroup = async () => { await supabase.from('community_groups').insert([form]); fetchGroups(); setForm({ name: '', description: '', image: '' }); };
    const deleteGroup = async (id: string) => { await supabase.from('community_groups').delete().eq('id', id); fetchGroups(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Add Group</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Image URL" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} />
                    <button onClick={saveGroup} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold">Create Group</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                {groups.map(g => (
                    <div key={g.id} className="flex justify-between items-center p-3 border-b">
                        <span className="font-bold">{g.name}</span>
                        <button onClick={()=>deleteGroup(g.id)} className="text-red-500"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BibleManager = () => <div className="p-4 bg-white rounded-2xl">Bible Management features coming soon.</div>;

const EventManager = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [form, setForm] = useState({ title: '', date: '', time: '', location: '', description: '', type: 'EVENT' as any });
    useEffect(() => { fetchEvents(); }, []);
    const fetchEvents = async () => { const { data } = await supabase.from('events').select('*'); if(data) setEvents(data as any); };
    const saveEvent = async () => { await supabase.from('events').insert([form]); fetchEvents(); setForm({ title: '', date: '', time: '', location: '', description: '', type: 'EVENT' }); };
    const deleteEvent = async (id: string) => { await supabase.from('events').delete().eq('id', id); fetchEvents(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Create Event</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded-xl bg-slate-50" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input type="date" className="w-full border p-2 rounded-xl bg-slate-50" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
                    <button onClick={saveEvent} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Create Event</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                {events.map(e => (
                    <div key={e.id} className="flex justify-between items-center p-3 border-b">
                        <div><p className="font-bold">{e.title}</p><p className="text-xs text-slate-500">{e.date}</p></div>
                        <button onClick={()=>deleteEvent(e.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
