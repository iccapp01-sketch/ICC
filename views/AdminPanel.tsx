
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy, Loader2, ListMusic, Plus, UserPlus
} from 'lucide-react';
import { BlogPost, User, Sermon, UserRole, Event, CommunityGroup, MusicTrack, Playlist } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AdminProps {
  onLogout: () => void;
}

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'content', icon: FileText, label: 'Blog' },
  { id: 'media', icon: Video, label: 'Sermons' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'groups', icon: MessageCircle, label: 'Groups' },
  { id: 'bible', icon: BookOpen, label: 'Bible' },
  { id: 'events', icon: Calendar, label: 'Events' },
];

const handleSupabaseError = (error: any, context: string) => {
    console.error(`${context} Error:`, error);
    const msg = error.message || JSON.stringify(error);
    
    if (error.code === 'PGRST205' || error.code === '42P01') {
        alert(`Error: Table missing! Go to Dashboard Overview and use the SQL Generator to fix database schema.`);
    } else if (error.code === '42501') {
        alert(`Permission Denied: You do not have permission to perform this action. Ensure you are an Admin and RLS policies are set.\n\nCheck Overview tab for SQL fixes.`);
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
        <div className="p-6 border-b border-slate-100">
           <h2 className="font-bold text-xl text-[#0c2d58]">Admin Dashboard</h2>
           <p className="text-xs text-slate-400">ICC Management Panel</p>
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
  const [stats, setStats] = useState({ members: 0, blogs: 0, sermons: 0, events: 0 });
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const checks = [
        { table: 'blog_posts', name: 'Blog Posts' },
        { table: 'music_tracks', name: 'Music' },
        { table: 'playlists', name: 'Playlists' },
        { table: 'community_groups', name: 'Groups' },
        { table: 'community_group_members', name: 'Group Members' },
        { table: 'notifications', name: 'Notifications' },
        { table: 'reading_plans', name: 'Bible Plans' }
      ];
      
      const missing = [];
      for (const check of checks) {
          const { error } = await supabase.from(check.table).select('id').limit(1);
          if (error && (error.code === '42P01' || error.code === 'PGRST205')) {
              missing.push(check.name);
          }
      }
      setMissingTables(missing);

      const { count: members } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: blogs } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
      const { count: sermons } = await supabase.from('sermons').select('*', { count: 'exact', head: true });
      const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      setStats({
        members: members || 0,
        blogs: blogs || 0,
        sermons: sermons || 0,
        events: events || 0
      });
    };
    fetchStats();
  }, []);

  const SQL_CODE = `
-- 1. ENABLE STORAGE FOR MUSIC
insert into storage.buckets (id, name, public) 
values ('music', 'music', true) 
on conflict (id) do nothing;

drop policy if exists "Public Access Music" on storage.objects;
create policy "Public Access Music" on storage.objects for select using ( bucket_id = 'music' );

drop policy if exists "Admin Upload Music" on storage.objects;
create policy "Admin Upload Music" on storage.objects for insert with check ( bucket_id = 'music' AND exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') );

drop policy if exists "Admin Delete Music" on storage.objects;
create policy "Admin Delete Music" on storage.objects for delete using ( bucket_id = 'music' AND exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') );

-- 2. Blog Posts
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text,
  author text,
  category text,
  excerpt text,
  content text,
  image_url text,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Music Tracks
create table if not exists public.music_tracks (
  id uuid default gen_random_uuid() primary key,
  title text,
  artist text,
  url text,
  type text, 
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Playlists
create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  title text,
  description text,
  tracks jsonb default '[]'::jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Community Groups
create table if not exists public.community_groups (
  id uuid default gen_random_uuid() primary key,
  name text,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5b. Group Members (Approvals)
create table if not exists public.community_group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.community_groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text default 'PENDING', -- PENDING, APPROVED, REJECTED
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text,
  message text,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. Reading Plans
create table if not exists public.reading_plans (
  id uuid default gen_random_uuid() primary key,
  month text,
  year int,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. Add columns to Events if missing
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists video_url text;

-- 9. Enable Security
alter table public.blog_posts enable row level security;
drop policy if exists "Public read blogs" on public.blog_posts;
create policy "Public read blogs" on public.blog_posts for select using (true);
drop policy if exists "Admin write blogs" on public.blog_posts;
create policy "Admin write blogs" on public.blog_posts for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin delete blogs" on public.blog_posts;
create policy "Admin delete blogs" on public.blog_posts for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin update blogs" on public.blog_posts;
create policy "Admin update blogs" on public.blog_posts for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.music_tracks enable row level security;
drop policy if exists "Public read music" on public.music_tracks;
create policy "Public read music" on public.music_tracks for select using (true);
drop policy if exists "Admin write music" on public.music_tracks;
create policy "Admin write music" on public.music_tracks for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin delete music" on public.music_tracks;
create policy "Admin delete music" on public.music_tracks for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin update music" on public.music_tracks;
create policy "Admin update music" on public.music_tracks for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.playlists enable row level security;
drop policy if exists "Public read playlists" on public.playlists;
create policy "Public read playlists" on public.playlists for select using (true);
drop policy if exists "Admin write playlists" on public.playlists;
create policy "Admin write playlists" on public.playlists for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin delete playlists" on public.playlists;
create policy "Admin delete playlists" on public.playlists for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin update playlists" on public.playlists;
create policy "Admin update playlists" on public.playlists for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.community_groups enable row level security;
drop policy if exists "Public read groups" on public.community_groups;
create policy "Public read groups" on public.community_groups for select using (true);
drop policy if exists "Admin write groups" on public.community_groups;
create policy "Admin write groups" on public.community_groups for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin delete groups" on public.community_groups;
create policy "Admin delete groups" on public.community_groups for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
drop policy if exists "Admin update groups" on public.community_groups;
create policy "Admin update groups" on public.community_groups for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.community_group_members enable row level security;
drop policy if exists "Public read group members" on public.community_group_members;
create policy "Public read group members" on public.community_group_members for select using (true);
drop policy if exists "Authenticated insert group members" on public.community_group_members;
create policy "Authenticated insert group members" on public.community_group_members for insert with check (auth.uid() = user_id);
drop policy if exists "Admin update group members" on public.community_group_members;
create policy "Admin update group members" on public.community_group_members for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.notifications enable row level security;
drop policy if exists "Public read notifs" on public.notifications;
create policy "Public read notifs" on public.notifications for select using (true);
drop policy if exists "Admin write notifs" on public.notifications;
create policy "Admin write notifs" on public.notifications for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.reading_plans enable row level security;
drop policy if exists "Public read plans" on public.reading_plans;
create policy "Public read plans" on public.reading_plans for select using (true);
drop policy if exists "Admin write plans" on public.reading_plans;
create policy "Admin write plans" on public.reading_plans for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
  `;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                  <Database size={24} />
              </div>
              <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-700">Database & Storage Setup</h3>
                  <p className="text-red-600 mb-2">If features like Music Upload or Blog Publish are failing, your database might be missing tables or policies.</p>
                  
                  {missingTables.length > 0 && (
                      <div className="mb-4">
                        <strong className="text-red-800">Missing Tables Detected:</strong>
                        <ul className="list-disc list-inside text-sm text-red-700 font-medium">
                            {missingTables.map(t => <li key={t}>{t}</li>)}
                        </ul>
                      </div>
                  )}

                  <button onClick={() => setShowSql(!showSql)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 mt-2">
                      <Database size={16} /> {showSql ? 'Hide SQL' : 'View SQL Fix Code'}
                  </button>
                  
                  {showSql && (
                      <div className="mt-4 bg-slate-900 rounded-xl p-4 relative">
                          <pre className="text-xs text-green-400 overflow-x-auto p-2 h-64">{SQL_CODE}</pre>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(SQL_CODE); alert("Copied to clipboard! Paste this in Supabase SQL Editor."); }}
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                          >
                              <Copy size={12} /> Copy
                          </button>
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
                <div className="bg-green-500 p-3 rounded-xl text-white"><FileText size={24} /></div>
                <span className="text-3xl font-bold text-slate-800">{stats.blogs}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">Published Blogs</p>
          </div>
          <div onClick={() => onNavigate('media')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
             <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 p-3 rounded-xl text-white"><Video size={24} /></div>
                <span className="text-3xl font-bold text-slate-800">{stats.sermons}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">Sermons</p>
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
    const [search, setSearch] = useState('');
    const [editingMember, setEditingMember] = useState<User | null>(null);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        const { data } = await supabase.from('profiles').select('*');
        if(data) {
        setMembers(data.map((p: any) => ({
            id: p.id,
            firstName: p.first_name || '',
            lastName: p.last_name || '',
            email: p.email,
            phone: p.phone,
            dob: p.dob,
            gender: p.gender,
            role: p.role,
            joinedDate: p.created_at
        })));
        }
    };

    const handleUpdateMember = async () => {
        if(!editingMember) return;
        const { error } = await supabase.from('profiles').update({ 
            first_name: editingMember.firstName,
            last_name: editingMember.lastName,
            email: editingMember.email,
            phone: editingMember.phone,
            dob: editingMember.dob,
            gender: editingMember.gender,
            role: editingMember.role
        }).eq('id', editingMember.id);

        if(!error) {
            alert("Member details updated successfully.");
            fetchMembers();
            setEditingMember(null);
        } else {
            handleSupabaseError(error, 'Update Member');
        }
    };

    const handleDeleteMember = async (id: string) => {
        if(!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
        
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        
        if (!error) {
            alert("Member deleted.");
            fetchMembers();
            setEditingMember(null);
        } else {
            handleSupabaseError(error, 'Delete Member');
        }
    };
    
    const filteredMembers = members.filter(m => 
        (m.firstName + ' ' + m.lastName).toLowerCase().includes(search.toLowerCase()) || 
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-800">Members</h2>
                 <div className="relative">
                     <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                     <input 
                        className="pl-10 pr-4 py-2 border rounded-xl"
                        placeholder="Search members..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                     />
                 </div>
            </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(m => (
                            <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{m.firstName || 'No Name'} {m.lastName}</div>
                                    <div className="text-xs text-slate-500">Joined: {new Date(m.joinedDate).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-slate-700">{m.email}</div>
                                    <div className="text-xs text-slate-500">{m.phone || 'No Phone'}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${m.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {m.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => setEditingMember(m)} className="p-2 text-slate-500 hover:text-blue-600">
                                        <Edit size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>

             {/* Edit Modal */}
             {editingMember && (
                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Edit Member</h3>
                            <button onClick={() => setEditingMember(null)}><X size={20} className="text-slate-400"/></button>
                         </div>
                         
                         <div className="space-y-3 mb-6">
                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 mb-1">First Name</label>
                                     <input className="w-full border p-2 rounded-lg" value={editingMember.firstName} onChange={(e) => setEditingMember({...editingMember, firstName: e.target.value})} />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 mb-1">Last Name</label>
                                     <input className="w-full border p-2 rounded-lg" value={editingMember.lastName} onChange={(e) => setEditingMember({...editingMember, lastName: e.target.value})} />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                                 <input className="w-full border p-2 rounded-lg" value={editingMember.email} onChange={(e) => setEditingMember({...editingMember, email: e.target.value})} />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                                 <input className="w-full border p-2 rounded-lg" value={editingMember.phone} onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})} />
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                                     <input type="date" className="w-full border p-2 rounded-lg" value={editingMember.dob} onChange={(e) => setEditingMember({...editingMember, dob: e.target.value})} />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 mb-1">Gender</label>
                                     <select className="w-full border p-2 rounded-lg" value={editingMember.gender} onChange={(e) => setEditingMember({...editingMember, gender: e.target.value})}>
                                         <option>Female</option>
                                         <option>Male</option>
                                     </select>
                                 </div>
                             </div>

                             <label className="block text-xs font-bold text-slate-500 mt-2">Role</label>
                             <select 
                                className="w-full border p-2 rounded-lg bg-blue-50 border-blue-200 text-blue-800 font-medium"
                                value={editingMember.role}
                                onChange={(e) => setEditingMember({...editingMember, role: e.target.value as any})}
                             >
                                 <option value="MEMBER">Member</option>
                                 <option value="AUTHOR">Author</option>
                                 <option value="MODERATOR">Moderator</option>
                                 <option value="ADMIN">Admin</option>
                             </select>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={handleDeleteMember.bind(null, editingMember.id)} className="px-4 bg-red-50 text-red-600 py-2 rounded-lg font-bold hover:bg-red-100"><Trash2 size={18}/></button>
                             <button onClick={handleUpdateMember} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Save Changes</button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    )
};

const MusicManager = () => {
    const [activeTab, setActiveTab] = useState<'tracks' | 'playlists'>('tracks');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    
    // Track Form
    const [formData, setFormData] = useState({ id: '', title: '', artist: '', url: '', type: 'MUSIC' });
    const [uploading, setUploading] = useState(false);
    const [isEditingTrack, setIsEditingTrack] = useState(false);

    // Playlist Form
    const [playlistForm, setPlaylistForm] = useState({ id: '', name: '', tracks: [] as string[] });
    const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);

    useEffect(() => {
        fetchTracks();
        fetchPlaylists();
    }, []);

    const fetchTracks = async () => {
        const { data } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
        if (data) setTracks(data.map((t: any) => ({ ...t, isOffline: false })));
    };

    const fetchPlaylists = async () => {
        const { data } = await supabase.from('playlists').select('*').order('created_at', { ascending: false });
        if (data) setPlaylists(data.map((p: any) => ({ 
            ...p, 
            name: p.title, // Map title to name for UI consistency
            tracks: p.tracks || [] 
        }))); 
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('music').upload(fileName, file);
            if (uploadError) throw uploadError;
            
            const { data } = supabase.storage.from('music').getPublicUrl(fileName);
            setFormData({ ...formData, url: data.publicUrl });
            alert("File uploaded successfully!");
        } catch (error: any) {
            handleSupabaseError(error, 'File Upload');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveTrack = async () => {
        const payload = { title: formData.title, artist: formData.artist, url: formData.url, type: formData.type };
        let error;
        if (isEditingTrack) {
            const res = await supabase.from('music_tracks').update(payload).eq('id', formData.id);
            error = res.error;
        } else {
            const res = await supabase.from('music_tracks').insert([payload]);
            error = res.error;
        }

        if (!error) {
            alert(isEditingTrack ? "Track Updated" : "Track Saved");
            setFormData({ id: '', title: '', artist: '', url: '', type: 'MUSIC' });
            setIsEditingTrack(false);
            fetchTracks();
        } else {
            handleSupabaseError(error, 'Save Track');
        }
    };

    const handleDeleteTrack = async (id: string, url: string) => {
        if (!confirm("Delete this track? This cannot be undone.")) return;
        
        // 1. Try to delete from storage if it's a Supabase URL
        if (url && url.includes('supabase')) {
            try {
                const path = url.split('/').pop();
                if (path) {
                    await supabase.storage.from('music').remove([path]);
                }
            } catch (err) {
                console.warn("Storage delete failed (might be external link):", err);
            }
        }

        // 2. Delete from DB
        const { error } = await supabase.from('music_tracks').delete().eq('id', id);
        
        if (!error) {
            fetchTracks();
            // Refresh playlists as well in case they contained this track
            fetchPlaylists();
        } else {
            handleSupabaseError(error, 'Delete Track');
        }
    };

    const handleSavePlaylist = async () => {
        // Important: DB column is 'title', UI uses 'name'
        const payload = { title: playlistForm.name, tracks: playlistForm.tracks };
        
        let error;
        if (isEditingPlaylist) {
            const res = await supabase.from('playlists').update(payload).eq('id', playlistForm.id);
            error = res.error;
        } else {
            const res = await supabase.from('playlists').insert([payload]);
            error = res.error;
        }

        if(!error) {
            alert("Playlist Saved!");
            setPlaylistForm({ id: '', name: '', tracks: [] });
            setIsEditingPlaylist(false);
            fetchPlaylists();
        } else {
            handleSupabaseError(error, 'Playlist');
        }
    };

    const handleDeletePlaylist = async (id: string) => {
        if(!confirm("Delete this playlist?")) return;
        const { error } = await supabase.from('playlists').delete().eq('id', id);
        if(!error) {
            fetchPlaylists();
        } else {
            handleSupabaseError(error, 'Delete Playlist');
        }
    }

    return (
        <div>
            <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2">
                <button onClick={() => setActiveTab('tracks')} className={`pb-2 px-4 font-bold ${activeTab === 'tracks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>All Tracks</button>
                <button onClick={() => setActiveTab('playlists')} className={`pb-2 px-4 font-bold ${activeTab === 'playlists' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Playlists</button>
            </div>

            {activeTab === 'tracks' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-[#0c2d58]">{isEditingTrack ? 'Edit Track' : 'Add New Track'}</h3>
                            {isEditingTrack && <button onClick={() => { setIsEditingTrack(false); setFormData({ id: '', title: '', artist: '', url: '', type: 'MUSIC' })}} className="text-xs text-slate-500">Cancel</button>}
                        </div>
                        <div className="space-y-4">
                            <input className="w-full border p-3 rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            <input className="w-full border p-3 rounded-xl" placeholder="Artist" value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} />
                            
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-500 mb-2">AUDIO SOURCE</label>
                                <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium w-fit mb-3 transition hover:bg-slate-50">
                                    {uploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16}/>}
                                    {uploading ? 'Uploading...' : 'Upload MP3 from PC'}
                                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                                </label>
                                <input className="w-full border p-3 rounded-xl bg-white" placeholder="Or Paste URL (YouTube/Spotify/MP3)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                            </div>

                            <select className="w-full border p-3 rounded-xl" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="MUSIC">Music</option>
                                <option value="PODCAST">Podcast</option>
                            </select>
                            <button onClick={handleSaveTrack} disabled={uploading || !formData.url} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-blue-700 transition">Save Track</button>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Library</h3>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {tracks.map(t => (
                                <div key={t.id} className="p-3 border rounded-xl flex items-center justify-between hover:bg-slate-50 transition">
                                    <div>
                                        <p className="font-bold text-sm">{t.title}</p>
                                        <p className="text-xs text-slate-500">{t.artist}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setIsEditingTrack(true); setFormData({ id: t.id, title: t.title, artist: t.artist, url: t.url, type: t.type as any }) }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteTrack(t.id, t.url)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-lg text-[#0c2d58]">{isEditingPlaylist ? 'Edit Playlist' : 'Create Playlist'}</h3>
                             {isEditingPlaylist && <button onClick={() => { setIsEditingPlaylist(false); setPlaylistForm({ id: '', name: '', tracks: [] }) }} className="text-xs text-slate-500">Cancel</button>}
                        </div>
                        <div className="space-y-4">
                            <input className="w-full border p-3 rounded-xl" placeholder="Playlist Name" value={playlistForm.name} onChange={e => setPlaylistForm({...playlistForm, name: e.target.value})} />
                            
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                                <label className="block text-xs font-bold text-slate-500 mb-2">SELECT TRACKS</label>
                                {tracks.map(t => (
                                    <label key={t.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition">
                                        <input 
                                            type="checkbox" 
                                            checked={playlistForm.tracks.includes(t.id)}
                                            onChange={e => {
                                                if(e.target.checked) setPlaylistForm({...playlistForm, tracks: [...playlistForm.tracks, t.id]});
                                                else setPlaylistForm({...playlistForm, tracks: playlistForm.tracks.filter(id => id !== t.id)});
                                            }}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm truncate">{t.title} - {t.artist}</span>
                                    </label>
                                ))}
                            </div>
                            <button onClick={handleSavePlaylist} disabled={!playlistForm.name} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-green-700 transition">Save Playlist</button>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">My Playlists</h3>
                        <div className="space-y-3">
                            {playlists.map(p => (
                                <div key={p.id} className="p-4 border rounded-xl flex justify-between items-center hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ListMusic size={20}/></div>
                                        <div>
                                            <p className="font-bold text-sm">{p.name}</p>
                                            <p className="text-xs text-slate-500">{Array.isArray(p.tracks) ? p.tracks.length : 0} tracks</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                         <button onClick={() => { setIsEditingPlaylist(true); setPlaylistForm({ id: p.id, name: p.name, tracks: p.tracks as any || [] }) }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                         <button onClick={() => handleDeletePlaylist(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContentManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [formData, setFormData] = useState({ id: '', title: '', author: '', category: 'Faith', excerpt: '', content: '', image_url: '', video_url: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if(data) setBlogs(data as any);
  };

  const handleSave = async () => {
      const payload = {
          title: formData.title,
          author: formData.author,
          category: formData.category,
          excerpt: formData.excerpt,
          content: formData.content,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null
      };

      let error;
      if (isEditing) {
          const res = await supabase.from('blog_posts').update(payload).eq('id', formData.id);
          error = res.error;
      } else {
          const res = await supabase.from('blog_posts').insert([payload]);
          error = res.error;
      }

      if(!error) {
          alert("Blog Published Successfully!");
          setFormData({ id: '', title: '', author: '', category: 'Faith', excerpt: '', content: '', image_url: '', video_url: '' });
          setIsEditing(false);
          fetchBlogs();
      } else {
          handleSupabaseError(error, 'Blog Publish');
      }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this blog post?")) return;
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if(!error) fetchBlogs();
      else handleSupabaseError(error, 'Delete Blog');
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-[#0c2d58]">{isEditing ? 'Edit Blog' : 'Create New Blog Post'}</h3>
                  {isEditing && <button onClick={() => { setIsEditing(false); setFormData({ id: '', title: '', author: '', category: 'Faith', excerpt: '', content: '', image_url: '', video_url: '' }) }} className="text-xs text-slate-500">Cancel</button>}
              </div>
              <div className="space-y-4">
                  <input className="w-full border p-3 rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <div className="flex gap-4">
                      <input className="flex-1 border p-3 rounded-xl" placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                      <select className="flex-1 border p-3 rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          <option>Faith</option><option>Testimony</option><option>Teaching</option><option>Devotional</option>
                      </select>
                  </div>
                  <input className="w-full border p-3 rounded-xl" placeholder="Excerpt (Short summary)" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
                  <textarea className="w-full border p-3 rounded-xl h-40" placeholder="Full Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
                  <input className="w-full border p-3 rounded-xl" placeholder="Image URL (Optional)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                  <input className="w-full border p-3 rounded-xl" placeholder="Video URL (Optional)" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} />
                  <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Publish Blog</button>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Published Content</h3>
              <div className="space-y-4 h-[600px] overflow-y-auto">
                  {blogs.map(b => (
                      <div key={b.id} className="p-4 border rounded-xl hover:bg-slate-50 transition">
                          <h4 className="font-bold">{b.title}</h4>
                          <p className="text-xs text-slate-500 mb-2">{b.author} • {b.category}</p>
                          <div className="flex gap-2 text-xs">
                              <button onClick={() => { setIsEditing(true); setFormData({ id: b.id, title: b.title, author: b.author, category: b.category as any, excerpt: b.excerpt, content: b.content, image_url: b.image || '', video_url: b.videoUrl || '' }) }} className="text-blue-500 font-bold hover:underline">Edit</button>
                              <button onClick={() => handleDelete(b.id)} className="text-red-500 font-bold hover:underline">Delete</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

const SermonManager = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [formData, setFormData] = useState({ id: '', title: '', preacher: '', date: '', duration: '', video_url: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchSermons(); }, []);

    const fetchSermons = async () => {
        const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
        if(data) setSermons(data as any);
    }

    const handleSave = async () => {
        const payload = {
            title: formData.title,
            preacher: formData.preacher,
            date_preached: formData.date,
            duration: formData.duration,
            video_url: formData.video_url
        };
        
        let error;
        if (isEditing) {
            const res = await supabase.from('sermons').update(payload).eq('id', formData.id);
            error = res.error;
        } else {
            const res = await supabase.from('sermons').insert([payload]);
            error = res.error;
        }

        if(!error) {
            alert("Sermon Saved!");
            setFormData({ id: '', title: '', preacher: '', date: '', duration: '', video_url: '' });
            setIsEditing(false);
            fetchSermons();
        } else {
            handleSupabaseError(error, 'Sermon Save');
        }
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Delete sermon?")) return;
        const { error } = await supabase.from('sermons').delete().eq('id', id);
        if(!error) fetchSermons();
        else handleSupabaseError(error, 'Delete Sermon');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-[#0c2d58]">{isEditing ? 'Edit Sermon' : 'Upload Sermon'}</h3>
                    {isEditing && <button onClick={() => { setIsEditing(false); setFormData({ id: '', title: '', preacher: '', date: '', duration: '', video_url: '' }) }} className="text-xs text-slate-500">Cancel</button>}
                </div>
                <div className="space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl" placeholder="Preacher" value={formData.preacher} onChange={e => setFormData({...formData, preacher: e.target.value})} />
                    <div className="flex gap-4">
                        <input type="date" className="flex-1 border p-3 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        <input className="flex-1 border p-3 rounded-xl" placeholder="Duration (e.g. 45:00)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                    </div>
                    <input className="w-full border p-3 rounded-xl" placeholder="YouTube URL" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} />
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Save Sermon</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Sermon Library</h3>
                <div className="space-y-4 h-[600px] overflow-y-auto">
                    {sermons.map(s => (
                        <div key={s.id} className="p-4 border rounded-xl flex justify-between items-center hover:bg-slate-50 transition">
                            <div>
                                <h4 className="font-bold text-sm">{s.title}</h4>
                                <p className="text-xs text-slate-500">{s.preacher} • {s.date}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setIsEditing(true); setFormData({ id: s.id, title: s.title, preacher: s.preacher, date: s.date as any, duration: s.duration, video_url: s.videoUrl || '' }) }} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

const GroupManager = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [formData, setFormData] = useState({ id: '', name: '', description: '', image_url: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [managingGroupId, setManagingGroupId] = useState<string | null>(null);

    useEffect(() => { fetchGroups(); }, []);

    const fetchGroups = async () => {
        const { data } = await supabase.from('community_groups').select('*');
        if(data) setGroups(data as any);
    }

    const fetchGroupMembers = async (groupId: string) => {
        const { data } = await supabase
            .from('community_group_members')
            .select('*, profiles(first_name, last_name, email)')
            .eq('group_id', groupId);
        if(data) setMembers(data);
    };

    const handleSave = async () => {
        const payload = { name: formData.name, description: formData.description, image_url: formData.image_url || null };
        let error;
        if(isEditing) {
            const res = await supabase.from('community_groups').update(payload).eq('id', formData.id);
            error = res.error;
        } else {
            const res = await supabase.from('community_groups').insert([payload]);
            error = res.error;
        }

        if(!error) {
            alert("Group Saved!");
            setFormData({ id: '', name: '', description: '', image_url: '' });
            setIsEditing(false);
            fetchGroups();
        } else {
            handleSupabaseError(error, 'Group Save');
        }
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Delete group? This will also remove all messages and member links.")) return;
        const { error } = await supabase.from('community_groups').delete().eq('id', id);
        if(!error) fetchGroups();
        else handleSupabaseError(error, 'Delete Group');
    }

    const handleApproval = async (membershipId: string, status: string) => {
        const { error } = await supabase.from('community_group_members').update({ status }).eq('id', membershipId);
        if(!error && managingGroupId) {
            fetchGroupMembers(managingGroupId);
        } else {
            handleSupabaseError(error, 'Member Approval');
        }
    }

    if (managingGroupId) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <button onClick={() => setManagingGroupId(null)} className="mb-4 text-blue-500 font-bold text-sm hover:underline">← Back to Groups</button>
                <h3 className="font-bold text-lg text-[#0c2d58] mb-6">Manage Group Members</h3>
                <div className="space-y-2">
                    {members.length === 0 && <p className="text-slate-500">No members in this group.</p>}
                    {members.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between p-3 border rounded-xl">
                            <div>
                                <p className="font-bold">{m.profiles?.first_name} {m.profiles?.last_name}</p>
                                <p className="text-xs text-slate-500">{m.profiles?.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${m.status === 'APPROVED' ? 'bg-green-100 text-green-700' : m.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span>
                                {m.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleApproval(m.id, 'APPROVED')} className="p-1 bg-green-500 text-white rounded"><Check size={16}/></button>
                                        <button onClick={() => handleApproval(m.id, 'REJECTED')} className="p-1 bg-red-500 text-white rounded"><X size={16}/></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-[#0c2d58]">{isEditing ? 'Edit Group' : 'Create Group'}</h3>
                     {isEditing && <button onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', description: '', image_url: '' }) }} className="text-xs text-slate-500">Cancel</button>}
                </div>
                <div className="space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Group Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <textarea className="w-full border p-3 rounded-xl h-24" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    <input className="w-full border p-3 rounded-xl" placeholder="Image URL (Optional)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Save Group</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Active Groups</h3>
                <div className="space-y-4">
                    {groups.map(g => (
                        <div key={g.id} className="p-4 border rounded-xl flex justify-between items-center hover:bg-slate-50 transition">
                            <div>
                                <h4 className="font-bold text-sm">{g.name}</h4>
                                <p className="text-xs text-slate-500 line-clamp-1">{g.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setManagingGroupId(g.id); fetchGroupMembers(g.id); }} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Manage Members"><Users size={16}/></button>
                                <button onClick={() => { setIsEditing(true); setFormData({ id: g.id, name: g.name, description: g.description, image_url: g.image || '' }) }} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

const BibleManager = () => {
    const [month, setMonth] = useState('January');
    const [year, setYear] = useState('2025');
    const [content, setContent] = useState('');

    const handleUploadPlan = async () => {
        const { error } = await supabase.from('reading_plans').insert([{ month, year: parseInt(year), content }]);
        if (!error) {
            alert("Reading Plan Uploaded");
            setContent('');
        } else {
            handleSupabaseError(error, 'Reading Plan');
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl mx-auto">
            <h3 className="font-bold text-lg text-[#0c2d58] mb-4">Upload Reading Plan</h3>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <select className="flex-1 border p-3 rounded-xl" value={month} onChange={e => setMonth(e.target.value)}>
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
                    </select>
                    <input className="flex-1 border p-3 rounded-xl" type="number" value={year} onChange={e => setYear(e.target.value)} />
                </div>
                <div className="border border-dashed border-slate-300 p-8 rounded-xl text-center">
                    <textarea 
                        className="w-full h-64 p-4 border rounded-xl"
                        placeholder="Paste Reading Plan Here... (e.g. Day 1: Genesis 1-3)"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    ></textarea>
                </div>
                <button onClick={handleUploadPlan} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Upload Plan</button>
            </div>
        </div>
    )
};

const EventManager = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [formData, setFormData] = useState({ id: '', title: '', date: '', time: '', location: '', description: '', type: 'EVENT' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        const { data } = await supabase.from('events').select('*').order('created_at', { ascending: true });
        if(data) setEvents(data as any);
    }

    const handleSave = async () => {
        const payload = { 
            title: formData.title, date: formData.date, time: formData.time, 
            location: formData.location, description: formData.description, type: formData.type 
        };
        let error;
        if(isEditing) {
            const res = await supabase.from('events').update(payload).eq('id', formData.id);
            error = res.error;
        } else {
            const res = await supabase.from('events').insert([payload]);
            error = res.error;
        }

        if(!error) {
            alert("Event Saved!");
            setFormData({ id: '', title: '', date: '', time: '', location: '', description: '', type: 'EVENT' });
            setIsEditing(false);
            fetchEvents();
        } else {
            handleSupabaseError(error, 'Event Save');
        }
    }

    const handlePushNotification = async (event: Event) => {
        const { error } = await supabase.from('notifications').insert([{
            title: `New ${event.type === 'EVENT' ? 'Event' : 'Announcement'}: ${event.title}`,
            message: event.description,
            type: event.type
        }]);
        if(!error) alert("Notification Sent to All Users");
        else handleSupabaseError(error, 'Push Notification');
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Delete event?")) return;
        const { error } = await supabase.from('events').delete().eq('id', id);
        if(!error) fetchEvents();
        else handleSupabaseError(error, 'Delete Event');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-[#0c2d58]">{isEditing ? 'Edit Event' : 'Create Event'}</h3>
                     {isEditing && <button onClick={() => { setIsEditing(false); setFormData({ id: '', title: '', date: '', time: '', location: '', description: '', type: 'EVENT' }) }} className="text-xs text-slate-500">Cancel</button>}
                </div>
                <div className="space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <div className="flex gap-4">
                        <input type="date" className="flex-1 border p-3 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        <input type="time" className="flex-1 border p-3 rounded-xl" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                    </div>
                    <input className="w-full border p-3 rounded-xl" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    <textarea className="w-full border p-3 rounded-xl h-24" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    <select className="w-full border p-3 rounded-xl" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="EVENT">Event</option>
                        <option value="ANNOUNCEMENT">Announcement</option>
                    </select>
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Save Event</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Upcoming</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {events.map(ev => (
                        <div key={ev.id} className="p-4 border rounded-xl hover:bg-slate-50 transition">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-sm">{ev.title}</h4>
                                    <p className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString()} at {ev.time} • {ev.location}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${ev.type === 'EVENT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{ev.type}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => { setIsEditing(true); setFormData({ id: ev.id, title: ev.title, date: ev.date as any, time: ev.time, location: ev.location, description: ev.description, type: ev.type as any }) }} className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Edit</button>
                                <button onClick={() => handlePushNotification(ev)} className="flex-1 py-2 text-xs font-bold text-green-600 bg-green-50 rounded hover:bg-green-100 flex items-center justify-center gap-1"><Bell size={12}/> Notify</button>
                                <button onClick={() => handleDelete(ev.id)} className="p-2 text-red-500 bg-red-50 rounded hover:bg-red-100"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};
