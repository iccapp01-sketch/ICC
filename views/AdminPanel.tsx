
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy, Loader2, ListMusic, Plus, UserPlus, Download, FolderPlus, FileAudio, Image as ImageIcon, Film, Link as LinkIcon, Youtube, ArrowLeft, ShieldOff
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup, MusicTrack, Playlist, Reel, ReadingPlan } from '../types';
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
    console.error(`${context} Error Full Object:`, error);
    let msg = "Unknown error";
    if (error?.message) msg = error.message;
    else if (typeof error === 'string') msg = error;
    
    if (error?.code === 'PGRST205' || error?.code === '42P01') {
        alert(`Error: Table missing! Go to Dashboard Overview and use the SQL Generator to fix database schema.`);
    } else {
        alert(`${context} Action Failed: ${msg}`);
    }
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
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: members } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: blogs } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
      const { count: sermons } = await supabase.from('sermons').select('*', { count: 'exact', head: true });
      const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      let pendingCount = 0;
      try {
          const { count, data } = await supabase.from('community_group_members')
              .select('*, profiles(first_name, last_name, email), community_groups(name)', { count: 'exact' })
              .eq('status', 'Pending');
          pendingCount = count || 0;
          if(data) setPendingMembers(data);
      } catch (e) {
          console.warn("community_group_members table likely missing");
      }

      setStats({
        members: members || 0,
        blogs: blogs || 0,
        sermons: sermons || 0,
        events: events || 0,
        pendingRequests: pendingCount
      });
    };
    fetchStats();
  }, []);

  const SQL_CODE = `
-- 1. GROUP CHAT TABLES
create table if not exists public.group_posts (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.community_groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.group_posts(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.group_post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.group_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- 2. SECURITY POLICIES (RLS)
alter table public.group_posts enable row level security;
alter table public.group_post_likes enable row level security;

-- Posts Policies
create policy "Public read posts" on public.group_posts for select using (true);
create policy "Authenticated insert posts" on public.group_posts for insert with check (auth.uid() = user_id);
create policy "Authenticated delete own posts" on public.group_posts for delete using (auth.uid() = user_id);

-- Likes Policies
create policy "Public read likes" on public.group_post_likes for select using (true);
create policy "Authenticated insert likes" on public.group_post_likes for insert with check (auth.uid() = user_id);
create policy "Authenticated delete likes" on public.group_post_likes for delete using (auth.uid() = user_id);

-- 3. ADMIN FUNCTION (If missing)
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'ADMIN'
  );
$$;
`;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      
      {stats.pendingRequests > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <UserPlus size={20}/> Pending Group Requests ({stats.pendingRequests})
              </h3>
              <div className="space-y-2">
                  {pendingMembers.map((req: any) => (
                      <div key={req.id} className="bg-white p-3 rounded-xl border flex justify-between items-center text-sm">
                          <div>
                              <span className="font-bold">{req.profiles?.first_name} {req.profiles?.last_name}</span>
                              <span className="text-slate-500"> wants to join </span>
                              <span className="font-bold text-blue-600">{req.community_groups?.name}</span>
                          </div>
                          <button onClick={() => onNavigate('groups')} className="text-blue-600 font-bold hover:underline">Manage</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Database size={24} /></div>
              <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-700">Database Status</h3>
                  <p className="text-xs text-blue-600 mb-2">If features like Chat, Likes, or Members aren't working, your database might be missing tables.</p>
                  <button onClick={() => setShowSql(!showSql)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 mt-2">
                      <Database size={16} /> {showSql ? 'Hide SQL' : 'View SQL Fix Code'}
                  </button>
                  {showSql && (
                      <div className="mt-4 bg-slate-900 rounded-xl p-4 relative">
                          <button onClick={() => navigator.clipboard.writeText(SQL_CODE)} className="absolute top-4 right-4 text-white bg-slate-700 p-2 rounded hover:bg-slate-600"><Copy size={16}/></button>
                          <pre className="text-xs text-green-400 overflow-x-auto p-2 h-64 whitespace-pre-wrap">{SQL_CODE}</pre>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        const fetchMembers = async () => { const { data } = await supabase.from('profiles').select('*'); if(data) setMembers(data as any); }
        fetchMembers();
    }, []);
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold mb-4">Members Directory</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead><tr className="border-b bg-slate-50"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead>
                    <tbody>{members.map(m => (<tr key={m.id} className="border-b"><td className="p-3 font-bold">{m.firstName} {m.lastName}</td><td className="p-3 text-slate-500">{m.email}</td><td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{m.role}</span></td><td className="p-3 text-slate-500">{new Date(m.joinedDate).toLocaleDateString()}</td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
}

const ContentManager = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [form, setForm] = useState({ title: '', content: '', author: 'Admin', category: 'General', image_url: '', excerpt: '' });
    useEffect(() => { fetchBlogs(); }, []);
    const fetchBlogs = async () => { const { data } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false}); if(data) setBlogs(data as any); };
    const saveBlog = async () => { await supabase.from('blog_posts').insert([{...form, likes: 0, comments: 0, date: new Date().toISOString()}]); fetchBlogs(); setForm({ title: '', content: '', author: 'Admin', category: 'General', image_url: '', excerpt: '' }); };
    const deleteBlog = async (id: string) => { await supabase.from('blog_posts').delete().eq('id', id); fetchBlogs(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Add New Blog Post</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Excerpt" value={form.excerpt} onChange={e=>setForm({...form, excerpt: e.target.value})} />
                    <textarea className="w-full border p-2 rounded h-32" placeholder="Content" value={form.content} onChange={e=>setForm({...form, content: e.target.value})} />
                    <button onClick={saveBlog} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Publish Post</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Existing Posts</h3>
                {blogs.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-3 border-b">
                        <div><p className="font-bold">{b.title}</p><p className="text-xs text-slate-500">{b.category} • {new Date(b.date).toLocaleDateString()}</p></div>
                        <button onClick={()=>deleteBlog(b.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SermonManager = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [form, setForm] = useState({ title: '', preacher: '', videoUrl: '', date: new Date().toISOString().split('T')[0], duration: '' });
    useEffect(() => { fetchSermons(); }, []);
    const fetchSermons = async () => { const { data } = await supabase.from('sermons').select('*').order('created_at', {ascending:false}); if(data) setSermons(data as any); };
    const saveSermon = async () => { await supabase.from('sermons').insert([form]); fetchSermons(); setForm({ title: '', preacher: '', videoUrl: '', date: new Date().toISOString().split('T')[0], duration: '' }); };
    const deleteSermon = async (id: string) => { await supabase.from('sermons').delete().eq('id', id); fetchSermons(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Upload Sermon</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Preacher" value={form.preacher} onChange={e=>setForm({...form, preacher: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="YouTube URL" value={form.videoUrl} onChange={e=>setForm({...form, videoUrl: e.target.value})} />
                    <div className="flex gap-2">
                        <input type="date" className="w-full border p-2 rounded" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="Duration (e.g. 45:00)" value={form.duration} onChange={e=>setForm({...form, duration: e.target.value})} />
                    </div>
                    <button onClick={saveSermon} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Add Sermon</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                 <h3 className="font-bold mb-4">Sermon Library</h3>
                 {sermons.map(s => (
                     <div key={s.id} className="flex justify-between items-center p-3 border-b">
                         <div><p className="font-bold">{s.title}</p><p className="text-xs text-slate-500">{s.preacher}</p></div>
                         <button onClick={()=>deleteSermon(s.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                     </div>
                 ))}
            </div>
        </div>
    );
};

const ReelManager = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [form, setForm] = useState({ title: '', description: '', embed_url: '', video_url: '' });
    useEffect(() => { fetchReels(); }, []);
    const fetchReels = async () => { const { data } = await supabase.from('reels').select('*').order('created_at', {ascending:false}); if(data) setReels(data as any); };
    const saveReel = async () => { await supabase.from('reels').insert([form]); fetchReels(); setForm({ title: '', description: '', embed_url: '', video_url: '' }); };
    const deleteReel = async (id: string) => { await supabase.from('reels').delete().eq('id', id); fetchReels(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Add Reel</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Embed URL (YouTube Shorts)" value={form.embed_url} onChange={e=>setForm({...form, embed_url: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Or Direct Video URL" value={form.video_url} onChange={e=>setForm({...form, video_url: e.target.value})} />
                    <button onClick={saveReel} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Add Reel</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Published Reels</h3>
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
                    <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Artist" value={form.artist} onChange={e=>setForm({...form, artist: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Audio URL" value={form.url} onChange={e=>setForm({...form, url: e.target.value})} />
                    <select className="w-full border p-2 rounded" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                        <option value="MUSIC">Music</option>
                        <option value="PODCAST">Podcast</option>
                    </select>
                    <button onClick={saveTrack} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Upload Track</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Library</h3>
                {tracks.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 border-b">
                        <div><p className="font-bold">{t.title}</p><p className="text-xs text-slate-500">{t.artist}</p></div>
                        <button onClick={()=>deleteTrack(t.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BibleManager = () => <div className="p-4 bg-white rounded-2xl">Bible Management features coming soon.</div>;

const EventManager = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [form, setForm] = useState({ title: '', date: '', time: '', location: '', description: '', type: 'EVENT' });
    useEffect(() => { fetchEvents(); }, []);
    const fetchEvents = async () => { const { data } = await supabase.from('events').select('*'); if(data) setEvents(data as any); };
    const saveEvent = async () => { await supabase.from('events').insert([form]); fetchEvents(); setForm({ title: '', date: '', time: '', location: '', description: '', type: 'EVENT' }); };
    const deleteEvent = async (id: string) => { await supabase.from('events').delete().eq('id', id); fetchEvents(); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Create Event</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <div className="flex gap-2">
                        <input type="date" className="w-full border p-2 rounded" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
                        <input type="time" className="w-full border p-2 rounded" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} />
                    </div>
                    <input className="w-full border p-2 rounded" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
                    <textarea className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                    <select className="w-full border p-2 rounded" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                        <option value="EVENT">Event</option>
                        <option value="ANNOUNCEMENT">Announcement</option>
                    </select>
                    <button onClick={saveEvent} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Create Event</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Upcoming Events</h3>
                {events.map(e => (
                    <div key={e.id} className="flex justify-between items-center p-3 border-b">
                        <div><p className="font-bold">{e.title}</p><p className="text-xs text-slate-500">{e.date} @ {e.time}</p></div>
                        <button onClick={()=>deleteEvent(e.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// UPDATED GroupManager
const GroupManager = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', description: '', image_url: '' });
    
    // Member Management State
    const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<CommunityGroup | null>(null);
    const [groupMembers, setGroupMembers] = useState<any[]>([]);

    useEffect(() => { fetchGroups(); fetchRequests(); }, []);
    
    useEffect(() => {
        if (selectedGroupForMembers) {
            fetchGroupMembers(selectedGroupForMembers.id);
        }
    }, [selectedGroupForMembers]);

    const fetchGroups = async () => { const { data } = await supabase.from('community_groups').select('*'); if(data) setGroups(data as any); }
    
    const fetchRequests = async () => {
        try {
            const { data } = await supabase.from('community_group_members')
                .select('*, profiles(first_name, last_name, email), community_groups(name)')
                .eq('status', 'Pending');
            if(data) setRequests(data);
        } catch(e) {}
    }

    const fetchGroupMembers = async (groupId: string) => {
        const { data } = await supabase.from('community_group_members')
            .select('*, profiles(first_name, last_name, email)')
            .eq('group_id', groupId)
            .eq('status', 'Approved');
        if (data) setGroupMembers(data);
    };
    
    const deleteGroup = async (id: string) => { if(confirm("Delete?")) { await supabase.from('community_groups').delete().eq('id', id); fetchGroups(); } }
    
    const saveGroup = async () => {
        const { error } = await supabase.from('community_groups').insert([form]);
        if(error) handleSupabaseError(error, 'Save Group'); else { fetchGroups(); setForm({ name: '', description: '', image_url: '' }); }
    }
    
    const handleApproval = async (id: string, action: 'Approved' | 'Rejected') => {
        if (action === 'Rejected') {
            if(!confirm("Reject this request?")) return;
            const { error } = await supabase.from('community_group_members').delete().eq('id', id);
            if(error) handleSupabaseError(error, 'Reject Request'); else fetchRequests();
        } else {
            const { error } = await supabase.from('community_group_members').update({ status: 'Approved' }).eq('id', id);
            if(error) handleSupabaseError(error, 'Approve Request'); else fetchRequests();
        }
    }

    const removeMember = async (recordId: string) => {
        if (!confirm("Are you sure you want to remove this member from the group?")) return;
        const { error } = await supabase.from('community_group_members').delete().eq('id', recordId);
        if (error) handleSupabaseError(error, 'Remove Member');
        else if (selectedGroupForMembers) fetchGroupMembers(selectedGroupForMembers.id);
    };

    if (selectedGroupForMembers) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                    <button onClick={() => setSelectedGroupForMembers(null)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                    <h3 className="font-bold text-lg text-[#0c2d58]">Members of {selectedGroupForMembers.name}</h3>
                </div>
                
                {groupMembers.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 italic">No approved members in this group yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500">Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">Email</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">Joined Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupMembers.map(m => (
                                    <tr key={m.id} className="border-b hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-900">{m.profiles?.first_name} {m.profiles?.last_name}</td>
                                        <td className="p-4 text-sm text-slate-600">{m.profiles?.email}</td>
                                        <td className="p-4 text-sm text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => removeMember(m.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1 ml-auto">
                                                <ShieldOff size={14}/> Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold mb-4">Add Group</h3>
                    <div className="space-y-3">
                        <input className="w-full border p-2 rounded text-slate-900" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                        <textarea className="w-full border p-2 rounded text-slate-900" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                        <input className="w-full border p-2 rounded text-slate-900" placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} />
                        <button onClick={saveGroup} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Create Group</button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold mb-4">Existing Groups</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {groups.map(g => (
                            <div key={g.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-slate-50">
                                <span className="font-bold text-slate-900">{g.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedGroupForMembers(g)} className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100" title="Manage Members"><Users size={16}/></button>
                                    <button onClick={()=>deleteGroup(g.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100" title="Delete Group"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4 text-[#0c2d58]">Pending Membership Requests</h3>
                {requests.length === 0 ? <p className="text-slate-500 italic text-sm">No pending requests found.</p> : (
                    <div className="space-y-3">
                        {requests.map(r => (
                            <div key={r.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50 transition">
                                <div>
                                    <p className="font-bold text-slate-900">{r.profiles?.first_name} {r.profiles?.last_name}</p>
                                    <p className="text-xs text-slate-500">Requested to join: <span className="text-blue-600 font-bold">{r.community_groups?.name}</span></p>
                                    <p className="text-[10px] text-slate-400 mt-1">Date: {new Date(r.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={()=>handleApproval(r.id, 'Approved')} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-200 flex items-center gap-1"><Check size={14}/> Approve</button>
                                    <button onClick={()=>handleApproval(r.id, 'Rejected')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"><X size={14}/> Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
