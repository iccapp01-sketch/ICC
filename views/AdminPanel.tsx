
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
              .eq('status', 'Pending'); // Capital 'Pending' to match User insert
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
-- SECURITY FUNCTION TO FIX INFINITE RECURSION
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

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text, last_name text, email text, phone text, dob text, gender text,
  role text default 'MEMBER',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;

-- DROP POLICIES BEFORE CREATING TO PREVENT ERRORS
drop policy if exists "Public profiles" on public.profiles;
create policy "Public profiles" on public.profiles for select using (true);

drop policy if exists "Users update own" on public.profiles;
create policy "Users update own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users insert own" on public.profiles;
create policy "Users insert own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Admin manage profiles" on public.profiles;
create policy "Admin manage profiles" on public.profiles for all using ( public.is_admin() );

-- CONTENT TABLES
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null, author text, category text, content text, excerpt text,
  image_url text, video_url text, likes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.blog_comments (
  id uuid default gen_random_uuid() primary key,
  blog_id uuid references public.blog_posts on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.sermons (
  id uuid default gen_random_uuid() primary key,
  title text not null, preacher text, date_preached text, duration text,
  video_url text, thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null, date text, time text, location text, description text,
  type text, image_url text, video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.event_rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  status text, -- 'Yes','No','Maybe'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.music_tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null, artist text, url text not null, type text default 'MUSIC',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  title text, description text, tracks jsonb default '[]'::jsonb,
  user_id uuid references public.profiles on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.community_groups (
  id uuid default gen_random_uuid() primary key,
  name text, description text, image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.community_group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.community_groups on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  status text default 'Pending', -- 'Approved', 'Pending'
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.group_posts (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.community_groups on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  content text,
  likes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table if not exists public.group_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.group_posts on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.reading_plans (
  id uuid default gen_random_uuid() primary key,
  month text, year int, content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text, message text, type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ADD MISSING COLUMNS IF TABLES EXIST
alter table public.playlists add column if not exists user_id uuid references public.profiles on delete cascade;
alter table public.blog_posts add column if not exists likes int default 0;
alter table public.blog_posts add column if not exists image_url text;
alter table public.blog_posts add column if not exists video_url text;
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists video_url text;

-- ENABLE RLS
alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;
alter table public.sermons enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.music_tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.community_groups enable row level security;
alter table public.community_group_members enable row level security;
alter table public.group_posts enable row level security;
alter table public.group_comments enable row level security;
alter table public.reading_plans enable row level security;
alter table public.notifications enable row level security;

-- RECREATE POLICIES (DROP FIRST)
drop policy if exists "Public read blogs" on public.blog_posts;
create policy "Public read blogs" on public.blog_posts for select using (true);

drop policy if exists "Admin manage blogs" on public.blog_posts;
create policy "Admin manage blogs" on public.blog_posts for all using ( public.is_admin() );

drop policy if exists "Public read comments" on public.blog_comments;
create policy "Public read comments" on public.blog_comments for select using (true);

drop policy if exists "Auth insert comments" on public.blog_comments;
create policy "Auth insert comments" on public.blog_comments for insert with check (auth.uid() = user_id);

drop policy if exists "Public read sermons" on public.sermons;
create policy "Public read sermons" on public.sermons for select using (true);

drop policy if exists "Admin manage sermons" on public.sermons;
create policy "Admin manage sermons" on public.sermons for all using ( public.is_admin() );

drop policy if exists "Public read events" on public.events;
create policy "Public read events" on public.events for select using (true);

drop policy if exists "Admin manage events" on public.events;
create policy "Admin manage events" on public.events for all using ( public.is_admin() );

drop policy if exists "Auth rsvp" on public.event_rsvps;
create policy "Auth rsvp" on public.event_rsvps for all using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Public read music" on public.music_tracks;
create policy "Public read music" on public.music_tracks for select using (true);

drop policy if exists "Admin manage music" on public.music_tracks;
create policy "Admin manage music" on public.music_tracks for all using ( public.is_admin() );

drop policy if exists "Public read playlists" on public.playlists;
create policy "Public read playlists" on public.playlists for select using (true);

drop policy if exists "Auth manage playlists" on public.playlists;
create policy "Auth manage playlists" on public.playlists for all using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Public read groups" on public.community_groups;
create policy "Public read groups" on public.community_groups for select using (true);

drop policy if exists "Admin manage groups" on public.community_groups;
create policy "Admin manage groups" on public.community_groups for all using ( public.is_admin() );

drop policy if exists "Auth join groups" on public.community_group_members;
create policy "Auth join groups" on public.community_group_members for all using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Auth group posts" on public.group_posts;
create policy "Auth group posts" on public.group_posts for all using (auth.uid() = user_id or public.is_admin() or true); -- allow read

drop policy if exists "Auth group comments" on public.group_comments;
create policy "Auth group comments" on public.group_comments for all using (auth.uid() = user_id or public.is_admin() or true); -- allow read

drop policy if exists "Public read plans" on public.reading_plans;
create policy "Public read plans" on public.reading_plans for select using (true);

drop policy if exists "Admin manage plans" on public.reading_plans;
create policy "Admin manage plans" on public.reading_plans for all using ( public.is_admin() );

drop policy if exists "Public read notifs" on public.notifications;
create policy "Public read notifs" on public.notifications for select using (true);

drop policy if exists "Admin manage notifs" on public.notifications;
create policy "Admin manage notifs" on public.notifications for all using ( public.is_admin() );

-- STORAGE POLICIES
insert into storage.buckets (id, name, public) values ('music', 'music', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true) on conflict do nothing;

drop policy if exists "Public Access Music" on storage.objects;
create policy "Public Access Music" on storage.objects for select using ( bucket_id = 'music' );

drop policy if exists "Admin Upload Music" on storage.objects;
create policy "Admin Upload Music" on storage.objects for insert with check ( bucket_id = 'music' and public.is_admin() );

drop policy if exists "Admin Delete Music" on storage.objects;
create policy "Admin Delete Music" on storage.objects for delete using ( bucket_id = 'music' and public.is_admin() );

drop policy if exists "Public Access Blog" on storage.objects;
create policy "Public Access Blog" on storage.objects for select using ( bucket_id = 'blog-images' );

drop policy if exists "Admin Upload Blog" on storage.objects;
create policy "Admin Upload Blog" on storage.objects for insert with check ( bucket_id = 'blog-images' and public.is_admin() );
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
    const [search, setSearch] = useState('');

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (data) {
            setMembers(data.map((p: any) => ({
                id: p.id,
                firstName: p.first_name || 'No Name',
                lastName: p.last_name || '',
                email: p.email,
                phone: p.phone,
                dob: p.dob,
                role: p.role,
                joinedDate: p.created_at
            })));
        } else if (error) {
            console.error(error);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if(!confirm("Are you sure? This will delete the member's profile data completely.")) return;
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (!error) {
            alert("Member profile deleted.");
            fetchMembers();
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
                        {filtered.map(m => (
                            <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-bold text-slate-900">{m.firstName}</td>
                                <td className="p-4 font-bold text-slate-900">{m.lastName}</td>
                                <td className="p-4 text-sm text-slate-600">{m.email}</td>
                                <td className="p-4 text-sm text-slate-600">{m.phone}</td>
                                <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{m.role}</span></td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleDeleteMember(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    )
};

const ContentManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState(['Faith', 'Testimony', 'Teaching', 'Devotional']);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({ id: '', title: '', author: '', category: 'Faith', excerpt: '', content: '', image_url: '', video_url: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if(data) setBlogs(data as any);
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this blog post?")) return;
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if(!error) fetchBlogs();
      else handleSupabaseError(error, 'Delete Blog');
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
        setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error) {
        handleSupabaseError(error, 'File Upload');
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = async () => {
      const payload = { ...formData, image_url: formData.image_url || null, video_url: formData.video_url || null };
      delete (payload as any).id;
      const { error } = await supabase.from('blog_posts').insert([payload]);
      if(error) handleSupabaseError(error, 'Blog Publish');
      else { alert('Published!'); fetchBlogs(); setFormData({ id: '', title: '', author: '', category: 'Faith', excerpt: '', content: '', image_url: '', video_url: '' }); }
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg text-[#0c2d58] mb-4">Blog Manager</h3>
              <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                      <input className="border p-2 rounded text-xs flex-1 text-slate-900" placeholder="New Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                      <button onClick={() => {if(newCategory){setCategories([...categories, newCategory]); setNewCategory('');}}} className="bg-blue-600 text-white px-3 rounded text-xs"><Plus size={14}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {categories.map(c => <span key={c} className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-800 flex gap-1">{c} <button onClick={()=>setCategories(categories.filter(cat=>cat!==c))} className="text-red-500"><X size={10}/></button></span>)}
                  </div>
              </div>
              <div className="space-y-3">
                  <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
                  <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Author" value={formData.author} onChange={e=>setFormData({...formData, author: e.target.value})} />
                  <select className="w-full border p-3 rounded-xl text-slate-900" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select>
                  <textarea className="w-full border p-3 rounded-xl text-slate-900 h-24" placeholder="Excerpt" value={formData.excerpt} onChange={e=>setFormData({...formData, excerpt: e.target.value})} />
                  <textarea className="w-full border p-3 rounded-xl text-slate-900 h-40" placeholder="Content" value={formData.content} onChange={e=>setFormData({...formData, content: e.target.value})} />
                  <div className="flex gap-2 items-center">
                     <label className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded cursor-pointer text-sm text-slate-700 hover:bg-slate-200">
                         <Upload size={16}/> Upload Image
                         <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                     </label>
                     <span className="text-xs text-slate-400">{uploading ? 'Uploading...' : formData.image_url ? 'Image Attached' : 'No Image'}</span>
                  </div>
                  <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Or Paste Image URL" value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})} />
                  <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Publish Post</button>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Published Content</h3>
              <div className="space-y-4 h-[600px] overflow-y-auto">
                  {blogs.map(b => (
                      <div key={b.id} className="p-4 border rounded-xl hover:bg-slate-50 transition flex justify-between">
                          <div><h4 className="font-bold text-slate-900">{b.title}</h4></div>
                          <button onClick={() => handleDelete(b.id)} className="text-red-500"><Trash2 size={16}/></button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

const SermonManager = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [form, setForm] = useState({ title: '', preacher: '', date: '', duration: '', videoUrl: '' });

    useEffect(() => { fetchSermons(); }, []);
    const fetchSermons = async () => {
        const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
        if(data) setSermons(data as any);
    }
    const handleDelete = async (id: string) => {
        if(!confirm("Delete sermon?")) return;
        const { error } = await supabase.from('sermons').delete().eq('id', id);
        if(!error) fetchSermons();
        else handleSupabaseError(error, 'Delete Sermon');
    }
    const handleSubmit = async () => {
        // Auto extract thumbnail
        let thumb = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = form.videoUrl.match(regExp);
        if (match && match[2].length === 11) thumb = `https://img.youtube.com/vi/${match[2]}/0.jpg`;

        const { error } = await supabase.from('sermons').insert([{
            title: form.title, preacher: form.preacher, date_preached: form.date, 
            duration: form.duration, video_url: form.videoUrl, thumbnail_url: thumb
        }]);
        if(error) handleSupabaseError(error, 'Add Sermon');
        else { fetchSermons(); setForm({ title: '', preacher: '', date: '', duration: '', videoUrl: '' }); }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg text-[#0c2d58] mb-4">Add Sermon</h3>
                <div className="space-y-3">
                    <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Preacher" value={form.preacher} onChange={e=>setForm({...form, preacher: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl text-slate-900" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Duration (e.g. 45:00)" value={form.duration} onChange={e=>setForm({...form, duration: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="YouTube URL" value={form.videoUrl} onChange={e=>setForm({...form, videoUrl: e.target.value})} />
                    <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Upload Sermon</button>
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 h-[500px] overflow-y-auto">
                 <h3 className="font-bold text-lg text-[#0c2d58] mb-4">Library</h3>
                 {sermons.map(s => (
                     <div key={s.id} className="flex justify-between items-center p-3 border-b">
                         <div><p className="font-bold text-sm text-slate-900">{s.title}</p><p className="text-xs text-slate-500">{s.preacher}</p></div>
                         <button onClick={()=>handleDelete(s.id)} className="text-red-500"><Trash2 size={16}/></button>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const MusicManager = () => {
    const [tab, setTab] = useState('tracks');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title: '', artist: '', url: '', type: 'MUSIC' });
    const [plForm, setPlForm] = useState({ name: '', tracks: [] as string[] });

    useEffect(() => { fetchTracks(); fetchPlaylists(); }, []);

    const fetchTracks = async () => { const { data } = await supabase.from('music_tracks').select('*'); if(data) setTracks(data as any); };
    const fetchPlaylists = async () => { 
        const { data } = await supabase.from('playlists').select('*'); 
        if(data) setPlaylists(data.map((p:any) => ({...p, name: p.title}))); 
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const fileName = `${Date.now()}_${file.name}`;
            const { error } = await supabase.storage.from('music').upload(fileName, file);
            if(error) throw error;
            const { data } = supabase.storage.from('music').getPublicUrl(fileName);
            setForm({...form, url: data.publicUrl });
        } catch(err) { handleSupabaseError(err, 'Music Upload'); } 
        finally { setUploading(false); }
    };

    const saveTrack = async () => {
        if(!form.url) { alert("URL required"); return; }
        const { error } = await supabase.from('music_tracks').insert([form]);
        if(error) handleSupabaseError(error, 'Save Track'); else { fetchTracks(); setForm({ title: '', artist: '', url: '', type: 'MUSIC' }); }
    };

    const savePlaylist = async () => {
        const selectedTracks = tracks.filter(t => plForm.tracks.includes(t.id));
        const { error } = await supabase.from('playlists').insert([{ title: plForm.name, tracks: selectedTracks }]);
        if(error) handleSupabaseError(error, 'Save Playlist'); else { fetchPlaylists(); setPlForm({ name: '', tracks: [] }); }
    };

    const deleteTrack = async (id: string) => {
        if(!confirm("Delete?")) return;
        await supabase.from('music_tracks').delete().eq('id', id);
        fetchTracks();
    };

    const deletePlaylist = async (id: string) => {
        if(!confirm("Delete?")) return;
        await supabase.from('playlists').delete().eq('id', id);
        fetchPlaylists();
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex gap-4 mb-6 border-b">
                <button onClick={()=>setTab('tracks')} className={`pb-2 ${tab==='tracks'?'border-b-2 border-blue-600 font-bold':''}`}>Tracks</button>
                <button onClick={()=>setTab('playlists')} className={`pb-2 ${tab==='playlists'?'border-b-2 border-blue-600 font-bold':''}`}>Playlists</button>
            </div>

            {tab === 'tracks' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h4 className="font-bold">Add Track</h4>
                        <input className="w-full border p-2 rounded text-slate-900" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                        <input className="w-full border p-2 rounded text-slate-900" placeholder="Artist" value={form.artist} onChange={e=>setForm({...form, artist: e.target.value})} />
                        <select className="w-full border p-2 rounded text-slate-900" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                            <option value="MUSIC">Music</option>
                            <option value="PODCAST">Podcast</option>
                        </select>
                        <div className="flex gap-2 items-center">
                            <label className="bg-slate-100 px-3 py-2 rounded text-xs cursor-pointer hover:bg-slate-200 text-slate-800">
                                <Upload size={14}/> Upload MP3
                                <input type="file" hidden accept="audio/*" onChange={handleUpload} />
                            </label>
                            <span className="text-xs text-slate-400">{uploading?'Uploading...':form.url?'File Ready':'No File'}</span>
                        </div>
                        <input className="w-full border p-2 rounded text-slate-900 text-xs" placeholder="Or Paste URL" value={form.url} onChange={e=>setForm({...form, url: e.target.value})} />
                        <button onClick={saveTrack} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Save Track</button>
                    </div>
                    <div className="h-[400px] overflow-y-auto">
                        {tracks.map(t => (
                            <div key={t.id} className="flex justify-between p-2 border-b">
                                <div><p className="font-bold text-sm text-slate-900">{t.title}</p><p className="text-xs text-slate-500">{t.type}</p></div>
                                <button onClick={()=>deleteTrack(t.id)} className="text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h4 className="font-bold">Create Playlist</h4>
                        <input className="w-full border p-2 rounded text-slate-900" placeholder="Playlist Name" value={plForm.name} onChange={e=>setPlForm({...plForm, name: e.target.value})} />
                        <div className="h-48 overflow-y-auto border p-2 rounded">
                            {tracks.map(t => (
                                <label key={t.id} className="flex items-center gap-2 text-sm p-1 hover:bg-slate-50 text-slate-800">
                                    <input type="checkbox" checked={plForm.tracks.includes(t.id)} onChange={e => {
                                        if(e.target.checked) setPlForm({...plForm, tracks: [...plForm.tracks, t.id]});
                                        else setPlForm({...plForm, tracks: plForm.tracks.filter(id => id !== t.id)});
                                    }} />
                                    {t.title}
                                </label>
                            ))}
                        </div>
                        <button onClick={savePlaylist} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Create Playlist</button>
                    </div>
                    <div>
                        {playlists.map(p => (
                            <div key={p.id} className="flex justify-between p-2 border-b items-center">
                                <span className="font-bold text-sm text-slate-900">{p.name} ({p.tracks?.length || 0})</span>
                                <button onClick={()=>deletePlaylist(p.id)} className="text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const GroupManager = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', description: '', image_url: '' });

    useEffect(() => { fetchGroups(); fetchRequests(); }, []);
    const fetchGroups = async () => { const { data } = await supabase.from('community_groups').select('*'); if(data) setGroups(data as any); }
    const fetchRequests = async () => {
        try {
            const { data } = await supabase.from('community_group_members')
                .select('*, profiles(first_name, last_name, email), community_groups(name)')
                .eq('status', 'Pending'); // Ensure capital 'Pending'
            if(data) setRequests(data);
        } catch(e) {}
    }
    
    const deleteGroup = async (id: string) => { if(confirm("Delete?")) { await supabase.from('community_groups').delete().eq('id', id); fetchGroups(); } }
    const saveGroup = async () => {
        const { error } = await supabase.from('community_groups').insert([form]);
        if(error) handleSupabaseError(error, 'Save Group'); else { fetchGroups(); setForm({ name: '', description: '', image_url: '' }); }
    }
    const handleApproval = async (id: string, status: string) => {
        const { error } = await supabase.from('community_group_members').update({ status }).eq('id', id);
        if(error) handleSupabaseError(error, 'Update Request'); else fetchRequests();
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
                    {groups.map(g => (
                        <div key={g.id} className="flex justify-between p-2 border-b">
                            <span className="font-bold text-slate-900">{g.name}</span>
                            <button onClick={()=>deleteGroup(g.id)} className="text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Pending Requests</h3>
                {requests.length === 0 ? <p className="text-slate-500">No pending requests</p> : (
                    <div className="space-y-2">
                        {requests.map(r => (
                            <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                    <p className="font-bold">{r.profiles?.first_name} {r.profiles?.last_name}</p>
                                    <p className="text-xs text-slate-500">Wants to join: {r.community_groups?.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={()=>handleApproval(r.id, 'Approved')} className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200">Approve</button>
                                    <button onClick={()=>handleApproval(r.id, 'Rejected')} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const BibleManager = () => {
    const [text, setText] = useState('');
    const handleUpload = async () => {
        const lines = text.split('\n').filter(l => l.trim());
        const plans = lines.map(line => ({ month: 'General', year: 2025, content: line }));
        const { error } = await supabase.from('reading_plans').insert(plans);
        if(error) handleSupabaseError(error, 'Bulk Upload'); else { alert('Uploaded!'); setText(''); }
    }
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold mb-4">Bulk Upload Reading Plan</h3>
            <p className="text-xs text-slate-500 mb-2">Format: One entry per line (e.g., "Day 1: Genesis 1-3")</p>
            <textarea className="w-full border p-3 rounded h-64 text-slate-900" value={text} onChange={e=>setText(e.target.value)} />
            <button onClick={handleUpload} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded font-bold">Upload Plans</button>
        </div>
    )
};

const EventManager = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [form, setForm] = useState({ title: '', date: '', time: '', location: '', description: '', type: 'EVENT' });

    useEffect(() => { fetchEvents(); }, []);
    const fetchEvents = async () => { const { data } = await supabase.from('events').select('*'); if(data) setEvents(data as any); }
    const deleteEvent = async (id: string) => { if(confirm("Delete?")) { await supabase.from('events').delete().eq('id', id); fetchEvents(); } }
    const saveEvent = async () => {
        const { error } = await supabase.from('events').insert([form]);
        if(error) handleSupabaseError(error, 'Save Event'); else { fetchEvents(); setForm({ title: '', date: '', time: '', location: '', description: '', type: 'EVENT' }); }
    }
    const handleExport = async (eventId: string) => {
        const { data } = await supabase.from('event_rsvps').select('*, profiles(first_name, last_name, email)').eq('event_id', eventId);
        if(data) {
            const cleanData = data.map((r:any) => ({ Name: `${r.profiles?.first_name} ${r.profiles?.last_name}`, Email: r.profiles?.email, Status: r.status }));
            exportToCSV(cleanData, 'event_rsvp');
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Create Event</h3>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded text-slate-900" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded text-slate-900" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
                    <input className="w-full border p-2 rounded text-slate-900" type="time" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} />
                    <input className="w-full border p-2 rounded text-slate-900" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
                    <textarea className="w-full border p-2 rounded text-slate-900" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                    <button onClick={saveEvent} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Publish Event</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Upcoming Events</h3>
                {events.map(e => (
                    <div key={e.id} className="p-3 border-b mb-2">
                        <div className="flex justify-between">
                            <h4 className="font-bold text-slate-900">{e.title}</h4>
                            <div className="flex gap-2">
                                <button onClick={()=>handleExport(e.id)} className="text-green-600"><Download size={16}/></button>
                                <button onClick={()=>deleteEvent(e.id)} className="text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">{e.date} @ {e.time}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
