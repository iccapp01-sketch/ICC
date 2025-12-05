
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy, Loader2, ListMusic, Plus, UserPlus, Download, FolderPlus, FileAudio
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup, MusicTrack, Playlist } from '../types';
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

const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
        alert("No data to export");
        return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = "data:text/csv;charset=utf-8," + 
        [headers.join(','), ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleSupabaseError = (error: any, context: string) => {
    console.error(`${context} Error:`, error);
    
    let msg = "Unknown error";
    if (typeof error === 'string') {
        msg = error;
    } else if (error?.message) {
        msg = error.message;
    } else if (error?.error_description) {
        msg = error.error_description;
    } else {
        msg = JSON.stringify(error);
    }
    
    if (error?.code === 'PGRST205' || error?.code === '42P01') {
        alert(`Error: Table missing! Go to Dashboard Overview and use the SQL Generator to fix database schema.`);
    } else if (error?.code === '42501') {
        alert(`Permission Denied: You do not have permission to perform this action. Ensure you are an Admin. Run the SQL Fix in Overview.`);
    } else if (error?.code === '42P17') {
        alert(`System Error: Infinite Recursion. Please go to Overview > View SQL Fix and run the new 'is_admin()' function code.`);
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
  const [stats, setStats] = useState({ members: 0, blogs: 0, sermons: 0, events: 0, pendingRequests: 0 });
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: members } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: blogs } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
      const { count: sermons } = await supabase.from('sermons').select('*', { count: 'exact', head: true });
      const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      let pending = 0;
      try {
          const { count } = await supabase.from('community_group_members').select('*', { count: 'exact', head: true }).eq('status', 'pending');
          pending = count || 0;
      } catch (e) {
          console.warn("community_group_members table likely missing");
      }

      setStats({
        members: members || 0,
        blogs: blogs || 0,
        sermons: sermons || 0,
        events: events || 0,
        pendingRequests: pending
      });
    };
    fetchStats();
  }, []);

  const SQL_CODE = `
-- FIX FOR INFINITE RECURSION ERROR & MISSING TABLES & STORAGE POLICIES
-- Run this in Supabase SQL Editor

-- 1. Create SECURITY DEFINER function to bypass RLS recursion
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

-- 2. Profiles & RLS
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text, last_name text, email text, phone text, dob text, gender text,
  role text default 'MEMBER',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists dob text;
alter table public.profiles add column if not exists role text default 'MEMBER';

alter table public.profiles enable row level security;

-- Drop old policies to prevent conflicts
drop policy if exists "Public profiles" on public.profiles;
drop policy if exists "Users update own" on public.profiles;
drop policy if exists "Users insert own" on public.profiles;
drop policy if exists "Admin manage profiles" on public.profiles;

-- Create new robust policies
create policy "Public profiles" on public.profiles for select using (true);
create policy "Users update own" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own" on public.profiles for insert with check (auth.uid() = id);
-- Use is_admin() function to prevent recursion
create policy "Admin manage profiles" on public.profiles for all using ( public.is_admin() );

-- 3. Content Tables (Blog, Sermons, etc) - Use is_admin() everywhere

-- Blogs
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null, author text, category text, content text, excerpt text, image_url text, video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.blog_posts add column if not exists likes int default 0;
alter table public.blog_posts add column if not exists comments int default 0;

create table if not exists public.blog_comments (
  id uuid default gen_random_uuid() primary key,
  blog_id uuid references public.blog_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;

drop policy if exists "Public blogs" on public.blog_posts;
create policy "Public blogs" on public.blog_posts for select using (true);
drop policy if exists "Admin blog" on public.blog_posts;
create policy "Admin blog" on public.blog_posts for all using ( public.is_admin() );
-- Allow authenticated users to update likes (basic implementation)
drop policy if exists "Auth users update blogs" on public.blog_posts;
create policy "Auth users update blogs" on public.blog_posts for update using ( auth.role() = 'authenticated' );

drop policy if exists "Public view comments" on public.blog_comments;
create policy "Public view comments" on public.blog_comments for select using (true);
drop policy if exists "Auth users comment" on public.blog_comments;
create policy "Auth users comment" on public.blog_comments for insert with check (auth.uid() = user_id);
drop policy if exists "Admin manage comments" on public.blog_comments;
create policy "Admin manage comments" on public.blog_comments for all using ( public.is_admin() );


-- Sermons
create table if not exists public.sermons (
  id uuid default gen_random_uuid() primary key,
  title text, preacher text, date_preached text, duration text, video_url text, thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.sermons enable row level security;
drop policy if exists "Public sermons" on public.sermons;
create policy "Public sermons" on public.sermons for select using (true);
drop policy if exists "Admin sermons" on public.sermons;
create policy "Admin sermons" on public.sermons for all using ( public.is_admin() );

-- Music
create table if not exists public.music_tracks (
  id uuid default gen_random_uuid() primary key,
  title text, artist text, url text, type text default 'MUSIC',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  title text, description text, tracks jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.music_tracks enable row level security;
alter table public.playlists enable row level security;
drop policy if exists "Public music" on public.music_tracks;
create policy "Public music" on public.music_tracks for select using (true);
drop policy if exists "Admin music" on public.music_tracks;
create policy "Admin music" on public.music_tracks for all using ( public.is_admin() );

drop policy if exists "Public playlists" on public.playlists;
create policy "Public playlists" on public.playlists for select using (true);
drop policy if exists "Admin playlists" on public.playlists;
create policy "Admin playlists" on public.playlists for all using ( public.is_admin() );

-- Groups
create table if not exists public.community_groups (
  id uuid default gen_random_uuid() primary key,
  name text, description text, image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.community_group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.community_groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.community_groups enable row level security;
alter table public.community_group_members enable row level security;

drop policy if exists "Public groups" on public.community_groups;
create policy "Public groups" on public.community_groups for select using (true);
drop policy if exists "Admin groups" on public.community_groups;
create policy "Admin groups" on public.community_groups for all using ( public.is_admin() );

drop policy if exists "Public group members" on public.community_group_members;
create policy "Public group members" on public.community_group_members for select using (true);
drop policy if exists "Users join groups" on public.community_group_members;
create policy "Users join groups" on public.community_group_members for insert with check (auth.uid() = user_id);
drop policy if exists "Admin manage members" on public.community_group_members;
create policy "Admin manage members" on public.community_group_members for all using ( public.is_admin() );

-- Events
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text, date text, time text, location text, description text, type text, image_url text, video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.events enable row level security;
drop policy if exists "Public events" on public.events;
create policy "Public events" on public.events for select using (true);
drop policy if exists "Admin events" on public.events;
create policy "Admin events" on public.events for all using ( public.is_admin() );

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text, message text, type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.notifications enable row level security;
drop policy if exists "Public notifications" on public.notifications;
create policy "Public notifications" on public.notifications for select using (true);
drop policy if exists "Admin notifications" on public.notifications;
create policy "Admin notifications" on public.notifications for all using ( public.is_admin() );

-- Storage Buckets & Policies
insert into storage.buckets (id, name, public) values ('music', 'music', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true) on conflict do nothing;

-- Music Bucket
drop policy if exists "Public Access Music" on storage.objects;
create policy "Public Access Music" on storage.objects for select using ( bucket_id = 'music' );
drop policy if exists "Admin Upload Music" on storage.objects;
create policy "Admin Upload Music" on storage.objects for insert with check ( bucket_id = 'music' and public.is_admin() );
drop policy if exists "Admin Delete Music" on storage.objects;
create policy "Admin Delete Music" on storage.objects for delete using ( bucket_id = 'music' and public.is_admin() );

-- Blog Images Bucket
drop policy if exists "Public Access Blog Images" on storage.objects;
create policy "Public Access Blog Images" on storage.objects for select using ( bucket_id = 'blog-images' );
drop policy if exists "Admin Upload Blog Images" on storage.objects;
create policy "Admin Upload Blog Images" on storage.objects for insert with check ( bucket_id = 'blog-images' and public.is_admin() );
drop policy if exists "Admin Delete Blog Images" on storage.objects;
create policy "Admin Delete Blog Images" on storage.objects for delete using ( bucket_id = 'blog-images' and public.is_admin() );

-- Reading Plans
create table if not exists public.reading_plans (
  id uuid default gen_random_uuid() primary key,
  month text, year int, content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.reading_plans enable row level security;
drop policy if exists "Public plans" on public.reading_plans;
create policy "Public plans" on public.reading_plans for select using (true);
drop policy if exists "Admin plans" on public.reading_plans;
create policy "Admin plans" on public.reading_plans for all using ( public.is_admin() );
  `;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Database size={24} /></div>
              <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-700">Database Status</h3>
                  <p className="text-blue-600 mb-2">Ensure your database has all required tables and updated security policies.</p>
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

          <div onClick={() => onNavigate('groups')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
             <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500 p-3 rounded-xl text-white"><UserPlus size={24} /></div>
                <span className="text-3xl font-bold text-slate-800">{stats.pendingRequests}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">Pending Group Requests</p>
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
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            handleSupabaseError(error, "Fetch Members");
            return;
        }
        if(data) {
            setMembers(data.map((p: any) => ({
                id: p.id,
                firstName: p.first_name || 'No Name',
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
            alert("Member updated.");
            fetchMembers();
            setEditingMember(null);
        } else {
            handleSupabaseError(error, 'Update Member');
        }
    };

    const handleDeleteMember = async (id: string) => {
        if(!confirm("Are you sure? This will delete the member's profile data completely.")) return;
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (!error) {
            alert("Member profile deleted.");
            fetchMembers();
            setEditingMember(null);
        } else {
            handleSupabaseError(error, 'Delete Member');
        }
    };

    const handleExport = () => {
        const exportData = members.map(m => ({
            'First Name': m.firstName,
            'Last Name': m.lastName,
            'Email': m.email,
            'Phone': m.phone,
            'DOB': m.dob,
            'Role': m.role
        }));
        exportToCSV(exportData, 'icc_members');
    };

    const filtered = members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(search.toLowerCase()) || m.email.includes(search));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-800">Members</h2>
                 <div className="flex gap-2">
                    <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                        <Download size={16}/> Export Excel
                    </button>
                    <input className="border p-2 rounded-lg text-slate-900" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                 </div>
            </div>
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">First Name</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Last Name</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Phone</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} className="p-4 text-center text-slate-500">No members found.</td></tr>
                        ) : (
                            filtered.map(m => (
                                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-900">{m.firstName}</td>
                                    <td className="p-4 font-bold text-slate-900">{m.lastName}</td>
                                    <td className="p-4 text-sm text-slate-600">{m.email}</td>
                                    <td className="p-4 text-sm text-slate-600">{m.phone}</td>
                                    <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{m.role}</span></td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => setEditingMember(m)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteMember(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
             {/* Edit Modal */}
             {editingMember && (
                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                         <h3 className="font-bold text-lg mb-4 text-slate-900">Edit Member</h3>
                         <div className="space-y-3 mb-6">
                            <input className="w-full border p-2 rounded text-slate-900" value={editingMember.firstName} onChange={e=>setEditingMember({...editingMember, firstName: e.target.value})} placeholder="First Name" />
                            <input className="w-full border p-2 rounded text-slate-900" value={editingMember.lastName} onChange={e=>setEditingMember({...editingMember, lastName: e.target.value})} placeholder="Last Name" />
                            <input className="w-full border p-2 rounded text-slate-900" value={editingMember.email} onChange={e=>setEditingMember({...editingMember, email: e.target.value})} placeholder="Email" />
                            <input className="w-full border p-2 rounded text-slate-900" value={editingMember.phone} onChange={e=>setEditingMember({...editingMember, phone: e.target.value})} placeholder="Phone" />
                            <select className="w-full border p-2 rounded text-slate-900" value={editingMember.role} onChange={e=>setEditingMember({...editingMember, role: e.target.value as any})}>
                                <option value="MEMBER">Member</option>
                                <option value="MODERATOR">Moderator</option>
                                <option value="AUTHOR">Author</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={handleUpdateMember} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Save</button>
                             <button onClick={() => setEditingMember(null)} className="px-4 py-2 border rounded text-slate-700">Cancel</button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    )
};

const ContentManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState(['Faith', 'Testimony', 'Teaching', 'Devotional']);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({ id: '', title: '', author: '', category: 'Faith', excerpt: '', content: '', image_url: '', video_url: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if(data) setBlogs(data as any);
  };

  const handleAddCategory = () => {
      if(newCategory && !categories.includes(newCategory)) {
          setCategories([...categories, newCategory]);
          setNewCategory('');
      }
  }

  const handleDeleteCategory = (cat: string) => {
      setCategories(categories.filter(c => c !== cat));
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `blog_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file);
            if (uploadError) throw uploadError;
            
            const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
            setFormData({ ...formData, image_url: data.publicUrl });
            alert("Image uploaded!");
        } catch (error: any) {
            handleSupabaseError(error, 'File Upload');
        } finally {
            setUploading(false);
        }
  };

  const handleSave = async () => {
      const payload = {
          title: formData.title, author: formData.author, category: formData.category, 
          excerpt: formData.excerpt, content: formData.content, 
          image_url: formData.image_url || null, video_url: formData.video_url || null
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
          alert("Blog Published!");
          setFormData({ id: '', title: '', author: '', category: categories[0], excerpt: '', content: '', image_url: '', video_url: '' });
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
              <h3 className="font-bold text-lg text-[#0c2d58] mb-4">{isEditing ? 'Edit Blog' : 'Create New Blog Post'}</h3>
              
              <div className="space-y-4">
                  {/* Category Manager */}
                  <div className="p-3 bg-slate-50 rounded-xl border mb-4">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Manage Categories</label>
                      <div className="flex gap-2 mb-2">
                          <input className="border p-2 rounded text-xs flex-1 text-slate-900" placeholder="New Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                          <button onClick={handleAddCategory} className="bg-blue-600 text-white px-3 rounded text-xs"><Plus size={14}/></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {categories.map(c => (
                              <span key={c} className="bg-white border px-2 py-1 rounded text-xs flex items-center gap-1 text-slate-800">
                                  {c} <button onClick={()=>handleDeleteCategory(c)} className="text-red-500 hover:text-red-700"><X size={10}/></button>
                              </span>
                          ))}
                      </div>
                  </div>

                  <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <div className="flex gap-4">
                      <input className="flex-1 border p-3 rounded-xl text-slate-900" placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                      <select className="flex-1 border p-3 rounded-xl text-slate-900" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                  </div>
                  <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Excerpt" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
                  <textarea className="w-full border p-3 rounded-xl h-40 text-slate-900" placeholder="Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
                  
                  {/* Media Upload */}
                  <div className="border p-3 rounded-xl bg-slate-50">
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Media</label>
                     <div className="flex items-center gap-2 mb-2">
                         <label className="bg-white border px-3 py-2 rounded text-xs font-bold cursor-pointer hover:bg-slate-100 flex items-center gap-2 text-slate-700">
                             {uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>} Upload Image (PC)
                             <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                         </label>
                         <span className="text-xs text-slate-400">or</span>
                         <input className="flex-1 border p-2 rounded text-sm text-slate-900" placeholder="Paste Image URL" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                     </div>
                  </div>
                  
                  <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Publish Blog</button>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Published Content</h3>
              <div className="space-y-4 h-[600px] overflow-y-auto">
                  {blogs.map(b => (
                      <div key={b.id} className="p-4 border rounded-xl hover:bg-slate-50 transition flex justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900">{b.title}</h4>
                            <p className="text-xs text-slate-500 mb-2">{b.category}</p>
                          </div>
                          <div className="flex gap-2 text-xs">
                              <button onClick={() => { setIsEditing(true); setFormData({ id: b.id, title: b.title, author: b.author, category: b.category as any, excerpt: b.excerpt, content: b.content, image_url: b.image || '', video_url: b.videoUrl || '' }) }} className="text-blue-500"><Edit size={16}/></button>
                              <button onClick={() => handleDelete(b.id)} className="text-red-500"><Trash2 size={16}/></button>
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
    
    // Helper to get thumbnail from YouTube URL
    const getYouTubeID = (url: string) => { 
        if (!url) return null; 
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null; 
    };

    const handleSave = async () => {
        const videoId = getYouTubeID(formData.video_url);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : '';
        const payload = { 
            title: formData.title, preacher: formData.preacher, date_preached: formData.date, 
            duration: formData.duration, video_url: formData.video_url, thumbnail_url: thumbnailUrl 
        };
        const res = isEditing ? await supabase.from('sermons').update(payload).eq('id', formData.id) : await supabase.from('sermons').insert([payload]);
        if(!res.error) { alert("Sermon Saved!"); fetchSermons(); setFormData({ id: '', title: '', preacher: '', date: '', duration: '', video_url: '' }); setIsEditing(false); }
        else handleSupabaseError(res.error, 'Sermon');
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Delete sermon?")) return;
        const { error } = await supabase.from('sermons').delete().eq('id', id);
        if(!error) fetchSermons();
        else handleSupabaseError(error, 'Delete Sermon');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg text-[#0c2d58] mb-4">{isEditing ? 'Edit Sermon' : 'Upload Sermon'}</h3>
                <div className="space-y-4">
                    <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Preacher" value={formData.preacher} onChange={e => setFormData({...formData, preacher: e.target.value})} />
                    <div className="flex gap-2">
                        <input className="flex-1 border p-3 rounded-xl text-slate-900" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        <input className="flex-1 border p-3 rounded-xl text-slate-900" placeholder="Duration (45:00)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                    </div>
                    <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="YouTube URL" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} />
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Save</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-900">Sermon Library</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {sermons.map(s => (
                        <div key={s.id} className="p-4 border rounded-xl flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                                <p className="text-xs text-slate-500">{s.preacher} • {s.videoUrl}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setIsEditing(true); setFormData({ id: s.id, title: s.title, preacher: s.preacher, date: s.date, duration: s.duration, video_url: s.videoUrl || '' }) }} className="text-blue-500"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(s.id)} className="text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

const MusicManager = () => {
    const [activeTab, setActiveTab] = useState<'tracks' | 'playlists'>('tracks');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    
    // Track Form
    const [trackForm, setTrackForm] = useState({ id: '', title: '', artist: '', url: '', type: 'MUSIC' });
    const [isUploadMode, setIsUploadMode] = useState<'url' | 'file'>('url');
    const [uploading, setUploading] = useState(false);

    // Playlist Form
    const [playlistForm, setPlaylistForm] = useState({ id: '', title: '', description: '', selectedTracks: [] as string[] });

    useEffect(() => { fetchTracks(); fetchPlaylists(); }, []);

    const fetchTracks = async () => { const { data } = await supabase.from('music_tracks').select('*'); if (data) setTracks(data as any); };
    const fetchPlaylists = async () => { 
        const { data } = await supabase.from('playlists').select('*'); 
        if (data) setPlaylists(data.map((p:any) => ({...p, name: p.title, tracks: p.tracks || []}))); 
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `track_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('music').upload(fileName, file);
            if(uploadError) throw uploadError;
            
            const { data } = supabase.storage.from('music').getPublicUrl(fileName);
            setTrackForm({...trackForm, url: data.publicUrl});
            alert("File Uploaded successfully!");
        } catch (error: any) {
            handleSupabaseError(error, 'Music Upload');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveTrack = async () => {
        if(!trackForm.url) return alert("Please provide a URL or upload a file.");
        const payload = { title: trackForm.title, artist: trackForm.artist, url: trackForm.url, type: trackForm.type };
        const { error } = await supabase.from('music_tracks').insert([payload]);
        if(!error) { alert("Track Saved"); fetchTracks(); setTrackForm({ id: '', title: '', artist: '', url: '', type: 'MUSIC' }); }
        else handleSupabaseError(error, 'Save Track');
    }

    const handleDeleteTrack = async (id: string) => {
        if(!confirm("Delete this track?")) return;
        const { error } = await supabase.from('music_tracks').delete().eq('id', id);
        if(!error) fetchTracks();
        else handleSupabaseError(error, 'Delete Track');
    }

    const handleSavePlaylist = async () => {
        const payload = { title: playlistForm.title, description: playlistForm.description, tracks: playlistForm.selectedTracks };
        const { error } = await supabase.from('playlists').insert([payload]);
        if(!error) { alert("Playlist Created"); fetchPlaylists(); setPlaylistForm({ id: '', title: '', description: '', selectedTracks: [] }); }
        else handleSupabaseError(error, 'Save Playlist');
    }

    const handleDeletePlaylist = async (id: string) => {
        if(!confirm("Delete playlist?")) return;
        const { error } = await supabase.from('playlists').delete().eq('id', id);
        if(!error) fetchPlaylists();
        else handleSupabaseError(error, 'Delete Playlist');
    }

    return (
        <div>
             <div className="flex gap-4 mb-6">
                 <button onClick={()=>setActiveTab('tracks')} className={`px-4 py-2 rounded-lg font-bold ${activeTab==='tracks'?'bg-blue-600 text-white':'bg-white text-slate-700'}`}>Tracks</button>
                 <button onClick={()=>setActiveTab('playlists')} className={`px-4 py-2 rounded-lg font-bold ${activeTab==='playlists'?'bg-blue-600 text-white':'bg-white text-slate-700'}`}>Playlists</button>
             </div>
             
             {activeTab === 'tracks' ? (
                 <div className="grid lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 border rounded-2xl space-y-4">
                         <h3 className="font-bold text-lg text-slate-900">Add New Track</h3>
                         <div className="flex gap-2 mb-2">
                             <button onClick={()=>setIsUploadMode('file')} className={`flex-1 py-1 text-xs rounded ${isUploadMode==='file'?'bg-slate-200 font-bold text-slate-900':'text-slate-600'}`}>Upload File</button>
                             <button onClick={()=>setIsUploadMode('url')} className={`flex-1 py-1 text-xs rounded ${isUploadMode==='url'?'bg-slate-200 font-bold text-slate-900':'text-slate-600'}`}>External URL</button>
                         </div>
                         
                         {isUploadMode === 'file' ? (
                             <label className="block w-full border-2 border-dashed p-4 text-center cursor-pointer rounded-xl hover:bg-slate-50">
                                 {uploading ? <Loader2 className="animate-spin mx-auto"/> : <Upload className="mx-auto mb-2 text-slate-400"/>}
                                 <span className="text-xs font-bold text-slate-500">Click to Upload MP3</span>
                                 <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload}/>
                             </label>
                         ) : (
                             <input className="w-full border p-2 rounded text-slate-900" placeholder="Paste URL (YouTube/Spotify/MP3)" value={trackForm.url} onChange={e=>setTrackForm({...trackForm, url: e.target.value})} />
                         )}

                         <input className="w-full border p-2 rounded text-slate-900" placeholder="Track Title" value={trackForm.title} onChange={e=>setTrackForm({...trackForm, title: e.target.value})} />
                         <input className="w-full border p-2 rounded text-slate-900" placeholder="Artist" value={trackForm.artist} onChange={e=>setTrackForm({...trackForm, artist: e.target.value})} />
                         <select className="w-full border p-2 rounded text-slate-900" value={trackForm.type} onChange={e=>setTrackForm({...trackForm, type: e.target.value})}>
                             <option value="MUSIC">Music</option>
                             <option value="PODCAST">Podcast</option>
                         </select>
                         <button onClick={handleSaveTrack} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Save Track</button>
                     </div>
                     <div className="bg-white p-6 border rounded-2xl max-h-[600px] overflow-y-auto">
                         {tracks.map(t => (
                             <div key={t.id} className="flex justify-between items-center p-3 border-b hover:bg-slate-50">
                                 <div>
                                     <div className="font-bold text-sm text-slate-900">{t.title}</div>
                                     <div className="text-xs text-slate-500">{t.type} • {t.artist}</div>
                                 </div>
                                 <button onClick={()=>handleDeleteTrack(t.id)} className="text-red-500"><Trash2 size={16}/></button>
                             </div>
                         ))}
                     </div>
                 </div>
             ) : (
                 <div className="grid lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 border rounded-2xl space-y-4">
                         <h3 className="font-bold text-lg text-slate-900">Create Playlist</h3>
                         <input className="w-full border p-2 rounded text-slate-900" placeholder="Playlist Name" value={playlistForm.title} onChange={e=>setPlaylistForm({...playlistForm, title: e.target.value})} />
                         <input className="w-full border p-2 rounded text-slate-900" placeholder="Description" value={playlistForm.description} onChange={e=>setPlaylistForm({...playlistForm, description: e.target.value})} />
                         
                         <div className="border rounded-xl p-2 max-h-60 overflow-y-auto">
                             <p className="text-xs font-bold text-slate-500 mb-2 px-2">Select Songs:</p>
                             {tracks.filter(t=>t.type==='MUSIC').map(t => (
                                 <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                     <input 
                                        type="checkbox" 
                                        checked={playlistForm.selectedTracks.includes(t.id)}
                                        onChange={(e) => {
                                            if(e.target.checked) setPlaylistForm({...playlistForm, selectedTracks: [...playlistForm.selectedTracks, t.id]});
                                            else setPlaylistForm({...playlistForm, selectedTracks: playlistForm.selectedTracks.filter(id => id !== t.id)});
                                        }}
                                     />
                                     <span className="text-sm text-slate-900">{t.title}</span>
                                 </label>
                             ))}
                         </div>

                         <button onClick={handleSavePlaylist} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Save Playlist</button>
                     </div>
                     <div className="bg-white p-6 border rounded-2xl">
                         {playlists.map(p => (
                             <div key={p.id} className="flex justify-between p-3 border-b items-center">
                                 <div>
                                    <div className="font-bold text-slate-900">{p.name}</div>
                                    <div className="text-xs text-slate-500">{p.tracks?.length || 0} songs</div>
                                 </div>
                                 <button onClick={()=>handleDeletePlaylist(p.id)} className="text-red-500"><Trash2 size={16}/></button>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
        </div>
    )
}

const GroupManager = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [formData, setFormData] = useState({ name: '', description: '', image_url: '' });

    useEffect(() => { fetchGroups(); }, []);
    const fetchGroups = async () => { const { data } = await supabase.from('community_groups').select('*'); if(data) setGroups(data as any); };

    const handleSave = async () => {
        const { error } = await supabase.from('community_groups').insert([formData]);
        if(!error) { alert("Group Created"); fetchGroups(); setFormData({name: '', description: '', image_url: ''}); }
        else handleSupabaseError(error, 'Create Group');
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Delete group?")) return;
        const { error } = await supabase.from('community_groups').delete().eq('id', id);
        if(!error) fetchGroups();
        else handleSupabaseError(error, 'Delete Group');
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border rounded-2xl space-y-4">
                <h3 className="font-bold text-lg text-slate-900">Create Group</h3>
                <input className="w-full border p-2 rounded text-slate-900" placeholder="Group Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                <textarea className="w-full border p-2 rounded text-slate-900" placeholder="Description" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
                <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Create Group</button>
            </div>
            <div className="bg-white p-6 border rounded-2xl space-y-2">
                <h3 className="font-bold text-lg mb-4 text-slate-900">Existing Groups</h3>
                {groups.map(g => (
                    <div key={g.id} className="p-3 border rounded flex justify-between items-center">
                        <span className="font-bold text-slate-900">{g.name}</span>
                        <button onClick={()=>handleDelete(g.id)} className="text-red-500"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

const BibleManager = () => {
    const [planText, setPlanText] = useState('');
    const [month, setMonth] = useState('January');
    const [year, setYear] = useState(2025);

    const handleBulkUpload = async () => {
        const lines = planText.split('\n').filter(l => l.trim().length > 0);
        const entries = lines.map(line => ({
            month, year, content: line.trim()
        }));

        const { error } = await supabase.from('reading_plans').insert(entries);
        if(!error) { alert("Reading Plan Uploaded"); setPlanText(''); }
        else handleSupabaseError(error, 'Upload Plan');
    }

    return (
        <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Upload Reading Plan</h3>
            <div className="flex gap-4 mb-4">
                <select className="border p-2 rounded text-slate-900" value={month} onChange={e=>setMonth(e.target.value)}>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m=><option key={m}>{m}</option>)}
                </select>
                <input type="number" className="border p-2 rounded text-slate-900" value={year} onChange={e=>setYear(parseInt(e.target.value))} />
            </div>
            <textarea className="w-full h-40 border p-2 rounded mb-4 text-slate-900" placeholder="Paste plan here (e.g. Day 1: Genesis 1)" value={planText} onChange={e=>setPlanText(e.target.value)}></textarea>
            <button onClick={handleBulkUpload} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Upload Bulk</button>
        </div>
    )
}

const EventManager = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [formData, setFormData] = useState({ title: '', date: '', time: '', location: '', description: '', type: 'EVENT' });

    useEffect(() => { fetchEvents(); }, []);
    const fetchEvents = async () => { const { data } = await supabase.from('events').select('*'); if(data) setEvents(data as any); }

    const handleSave = async () => {
        const { error } = await supabase.from('events').insert([formData]);
        if(!error) { alert("Event Created"); fetchEvents(); setFormData({title: '', date: '', time: '', location: '', description: '', type: 'EVENT'}); }
        else handleSupabaseError(error, 'Create Event');
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Delete event?")) return;
        const { error } = await supabase.from('events').delete().eq('id', id);
        if(!error) fetchEvents();
        else handleSupabaseError(error, 'Delete Event');
    }

    const handleExport = () => {
        const mockRsvpData = events.map(e => ({ Event: e.title, Date: e.date, 'Yes': 12, 'No': 4, 'Maybe': 3 })); 
        exportToCSV(mockRsvpData, 'event_rsvps');
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Create Event / Announcement</h3>
                </div>
                <input className="w-full border p-2 rounded text-slate-900" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
                <div className="flex gap-2">
                    <input type="date" className="flex-1 border p-2 rounded text-slate-900" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
                    <input type="time" className="flex-1 border p-2 rounded text-slate-900" value={formData.time} onChange={e=>setFormData({...formData, time: e.target.value})} />
                </div>
                <input className="w-full border p-2 rounded text-slate-900" placeholder="Location" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} />
                <textarea className="w-full border p-2 rounded text-slate-900" placeholder="Description" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
                <select className="w-full border p-2 rounded text-slate-900" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                    <option value="EVENT">Event</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                </select>
                <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Publish</button>
            </div>

            <div className="bg-white p-6 border rounded-2xl">
                <div className="flex justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900">Upcoming Events</h3>
                    <button onClick={handleExport} className="bg-green-600 text-white text-xs px-3 py-1 rounded font-bold flex items-center gap-1"><Download size={12}/> Export RSVP</button>
                </div>
                <div className="space-y-2">
                    {events.map(e => (
                        <div key={e.id} className="p-3 border rounded flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm text-slate-900">{e.title}</div>
                                <div className="text-xs text-slate-500">{e.date} • {e.type}</div>
                            </div>
                            <button onClick={()=>handleDelete(e.id)} className="text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
