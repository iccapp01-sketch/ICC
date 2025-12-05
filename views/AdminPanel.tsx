
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy
} from 'lucide-react';
import { BlogPost, User, Sermon, UserRole, Event, CommunityGroup, MusicTrack } from '../types';
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

// Helper to handle Supabase errors and suggest SQL fixes
const handleSupabaseError = (error: any, context: string) => {
    console.error(`${context} Error:`, error);
    const msg = error.message || JSON.stringify(error);
    
    if (error.code === 'PGRST205' || error.code === '42P01') {
        alert(`Error: Table missing! Go to Dashboard Overview and use the SQL Generator to fix database schema.`);
    } else if (error.code === 'PGRST204') {
        alert(`Error: A column is missing in your database table for ${context}.\n\nDetails: ${msg}`);
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
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-slate-50">
        {renderContent()}
      </div>
    </div>
  );
};

// 1. OVERVIEW
const Overview = ({ onNavigate }: { onNavigate: (v: string) => void }) => {
  const [stats, setStats] = useState({ members: 0, blogs: 0, sermons: 0, events: 0 });
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      // Check tables exist by trying to select 0 rows
      const checks = [
        { table: 'blog_posts', name: 'Blog Posts' },
        { table: 'music_tracks', name: 'Music' },
        { table: 'community_groups', name: 'Groups' },
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
-- 1. Blog Posts
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

-- 2. Music Tracks
create table if not exists public.music_tracks (
  id uuid default gen_random_uuid() primary key,
  title text,
  artist text,
  url text,
  type text, 
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Community Groups
create table if not exists public.community_groups (
  id uuid default gen_random_uuid() primary key,
  name text,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text,
  message text,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Reading Plans
create table if not exists public.reading_plans (
  id uuid default gen_random_uuid() primary key,
  month text,
  year int,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Add columns to Events if missing
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists video_url text;

-- 7. Enable Security (Allow All Read, Admin Write)
alter table public.blog_posts enable row level security;
create policy "Public read blogs" on public.blog_posts for select using (true);
create policy "Admin write blogs" on public.blog_posts for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admin update blogs" on public.blog_posts for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admin delete blogs" on public.blog_posts for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.music_tracks enable row level security;
create policy "Public read music" on public.music_tracks for select using (true);
create policy "Admin write music" on public.music_tracks for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admin delete music" on public.music_tracks for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.community_groups enable row level security;
create policy "Public read groups" on public.community_groups for select using (true);
create policy "Admin write groups" on public.community_groups for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admin update groups" on public.community_groups for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admin delete groups" on public.community_groups for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.notifications enable row level security;
create policy "Public read notifs" on public.notifications for select using (true);
create policy "Admin write notifs" on public.notifications for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

alter table public.reading_plans enable row level security;
create policy "Public read plans" on public.reading_plans for select using (true);
create policy "Admin write plans" on public.reading_plans for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
  `;

  const cards = [
    { label: 'Total Members', value: stats.members, icon: Users, color: 'bg-blue-500', id: 'members' },
    { label: 'Published Blogs', value: stats.blogs, icon: FileText, color: 'bg-green-500', id: 'content' },
    { label: 'Sermons', value: stats.sermons, icon: Video, color: 'bg-purple-500', id: 'media' },
    { label: 'Upcoming Events', value: stats.events, icon: Calendar, color: 'bg-orange-500', id: 'events' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      
      {/* System Health Check */}
      {missingTables.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full text-red-600">
                      <AlertTriangle size={24} />
                  </div>
                  <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-700">Database Tables Missing</h3>
                      <p className="text-red-600 mb-2">The following features will not work because their database tables are missing:</p>
                      <ul className="list-disc list-inside text-sm text-red-700 font-medium mb-4">
                          {missingTables.map(t => <li key={t}>{t}</li>)}
                      </ul>
                      <button onClick={() => setShowSql(!showSql)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                          <Database size={16} /> {showSql ? 'Hide SQL' : 'View SQL Fix'}
                      </button>
                      
                      {showSql && (
                          <div className="mt-4 bg-slate-900 rounded-xl p-4 relative">
                              <pre className="text-xs text-green-400 overflow-x-auto p-2">{SQL_CODE}</pre>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(SQL_CODE); alert("Copied to clipboard! Paste this in Supabase SQL Editor."); }}
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                              >
                                  <Copy size={12} /> Copy
                              </button>
                              <p className="text-slate-400 text-xs mt-2 border-t border-slate-700 pt-2">
                                  <strong>Instructions:</strong> Copy this code, go to your Supabase Dashboard &gt; SQL Editor, paste it, and run it.
                              </p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} onClick={() => onNavigate(card.id)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
             <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-xl text-white`}>
                   <card.icon size={24} />
                </div>
                <span className="text-3xl font-bold text-slate-800">{card.value}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. MEMBERS MANAGER
const MembersManager = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editingMember, setEditingMember] = useState<User | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if(data) {
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
    }
  };

  const handleUpdateMember = async () => {
     if(!editingMember) return;
     const { error } = await supabase.from('profiles').update({
        first_name: editingMember.firstName,
        last_name: editingMember.lastName,
        role: editingMember.role,
        phone: editingMember.phone
     }).eq('id', editingMember.id);

     if(!error) {
       alert("Member updated successfully");
       setEditingMember(null);
       fetchMembers();
     } else {
       handleSupabaseError(error, 'Member Update');
     }
  };

  const filteredMembers = members.filter(m => 
    (m.firstName + ' ' + m.lastName + m.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Members</h2>
          <div className="relative">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input 
               className="pl-10 pr-4 py-2 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Phone</th>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(m => (
                   <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium">{m.firstName} {m.lastName}</td>
                      <td className="p-4 text-slate-500 text-sm">{m.email}</td>
                      <td className="p-4 text-slate-500 text-sm">{m.phone}</td>
                      <td className="p-4">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                            m.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 
                            m.role === 'MODERATOR' ? 'bg-orange-100 text-orange-600' : 
                            'bg-blue-100 text-blue-600'
                         }`}>{m.role}</span>
                      </td>
                      <td className="p-4">
                         <button onClick={() => setEditingMember(m)} className="text-blue-600 hover:text-blue-800 font-bold text-xs">Edit</button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Edit Modal */}
       {editingMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">Edit Member</h3>
                <div className="space-y-3">
                   <input className="w-full border p-2 rounded-lg" value={editingMember.firstName} onChange={e => setEditingMember({...editingMember, firstName: e.target.value})} placeholder="First Name" />
                   <input className="w-full border p-2 rounded-lg" value={editingMember.lastName} onChange={e => setEditingMember({...editingMember, lastName: e.target.value})} placeholder="Last Name" />
                   <input className="w-full border p-2 rounded-lg" value={editingMember.phone} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} placeholder="Phone" />
                   <select className="w-full border p-2 rounded-lg" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value as any})}>
                      <option value="MEMBER">Member</option>
                      <option value="AUTHOR">Author</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                   </select>
                   <div className="flex gap-2 mt-4">
                      <button onClick={handleUpdateMember} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Save Changes</button>
                      <button onClick={() => setEditingMember(null)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold">Cancel</button>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

// 3. CONTENT (BLOG) MANAGER
const ContentManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [formData, setFormData] = useState({ id: '', title: '', category: 'Faith', excerpt: '', content: '', image: '', video: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
     const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
     if(data) {
        setBlogs(data.map((b: any) => ({
           id: b.id,
           title: b.title,
           author: b.author,
           date: b.created_at,
           category: b.category,
           excerpt: b.excerpt,
           content: b.content,
           image: b.image_url,
           videoUrl: b.video_url,
           likes: 0, comments: 0
        })));
     }
  };

  const handleSave = async () => {
     // Sanitization: Convert empty strings to null for optional fields
     const blogData = {
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        image_url: formData.image || null,
        video_url: formData.video || null,
        author: 'Admin'
     };

     let error;
     try {
        if(isEditing) {
            const res = await supabase.from('blog_posts').update(blogData).eq('id', formData.id);
            error = res.error;
        } else {
            const res = await supabase.from('blog_posts').insert([blogData]);
            error = res.error;
        }
     } catch(e: any) {
        error = e;
     }

     if(!error) {
        alert(isEditing ? 'Blog Updated' : 'Blog Posted');
        setFormData({ id: '', title: '', category: 'Faith', excerpt: '', content: '', image: '', video: '' });
        setIsEditing(false);
        fetchBlogs();
     } else {
        handleSupabaseError(error, 'Blog');
     }
  };

  const handleDelete = async (id: string) => {
     if(confirm("Delete post?")) {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if(!error) fetchBlogs();
        else handleSupabaseError(error, 'Blog Delete');
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
          <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">{isEditing ? 'Edit Post' : 'New Blog Post'}</h3>
          <div className="space-y-4">
             <input className="w-full border p-3 rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             <select className="w-full border p-3 rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Faith</option>
                <option>Testimony</option>
                <option>Teaching</option>
                <option>Devotional</option>
             </select>
             <input className="w-full border p-3 rounded-xl" placeholder="Image URL (Optional)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
             <input className="w-full border p-3 rounded-xl" placeholder="Video URL (Optional)" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} />
             <textarea className="w-full border p-3 rounded-xl h-20" placeholder="Short Excerpt" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
             <textarea className="w-full border p-3 rounded-xl h-40" placeholder="Full Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
             <div className="flex gap-2">
                 <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">{isEditing ? 'Update' : 'Publish'}</button>
                 {isEditing && <button onClick={() => {setIsEditing(false); setFormData({ id: '', title: '', category: 'Faith', excerpt: '', content: '', image: '', video: '' })}} className="px-4 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button>}
             </div>
          </div>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Published Posts</h3>
          <div className="space-y-3">
             {blogs.map(b => (
                <div key={b.id} className="p-3 border rounded-xl flex justify-between items-start">
                   <div>
                      <p className="font-bold text-sm">{b.title}</p>
                      <p className="text-xs text-slate-500">{b.category} • {new Date(b.date).toLocaleDateString()}</p>
                   </div>
                   <div className="flex gap-1">
                      <button onClick={() => { setIsEditing(true); setFormData({ id: b.id, title: b.title, category: b.category, excerpt: b.excerpt, content: b.content, image: b.image, video: b.videoUrl || '' }) }} className="p-1 text-blue-500"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1 text-red-500"><Trash2 size={16}/></button>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

// 4. SERMON MANAGER
const SermonManager = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [formData, setFormData] = useState({ id: '', title: '', preacher: 'Pastor David', date: '', duration: '', video: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { fetchSermons(); }, []);

  const fetchSermons = async () => {
     const { data } = await supabase.from('sermons').select('*').order('date_preached', { ascending: false });
     if(data) {
        setSermons(data.map((s:any) => ({
           id: s.id,
           title: s.title,
           preacher: s.preacher,
           date: s.date_preached,
           duration: s.duration,
           videoUrl: s.video_url,
           thumbnail: s.thumbnail_url || '',
           views: 0
        })));
     }
  };

  const handleEdit = (s: Sermon) => {
      setFormData({
          id: s.id,
          title: s.title,
          preacher: s.preacher,
          date: s.date,
          duration: s.duration,
          video: s.videoUrl || ''
      });
      setIsEditing(true);
  };

  const handleSave = async () => {
     // Extract YouTube Thumbnail
     let thumbnail = '';
     const vidMatch = formData.video.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([^"&?\/\s]{11})/);
     if(vidMatch) thumbnail = `https://img.youtube.com/vi/${vidMatch[1]}/hqdefault.jpg`;

     const payload = {
        title: formData.title,
        preacher: formData.preacher,
        date_preached: formData.date,
        duration: formData.duration,
        video_url: formData.video || null,
        thumbnail_url: thumbnail || null
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
        alert(isEditing ? 'Sermon Updated' : 'Sermon Added');
        setFormData({ id: '', title: '', preacher: 'Pastor David', date: '', duration: '', video: '' });
        setIsEditing(false);
        fetchSermons();
     } else {
        handleSupabaseError(error, 'Sermon');
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg text-[#0c2d58]">{isEditing ? 'Edit Sermon' : 'Upload Sermon'}</h3>
             {isEditing && <button onClick={() => { setIsEditing(false); setFormData({ id: '', title: '', preacher: 'Pastor David', date: '', duration: '', video: '' })}} className="text-xs text-slate-500 underline">Cancel</button>}
          </div>
          <div className="space-y-4">
             <input className="w-full border p-3 rounded-xl" placeholder="Sermon Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             <input className="w-full border p-3 rounded-xl" placeholder="Preacher Name" value={formData.preacher} onChange={e => setFormData({...formData, preacher: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
                <input type="date" className="border p-3 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="Duration (e.g. 45:00)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
             </div>
             <input className="w-full border p-3 rounded-xl" placeholder="YouTube URL" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} />
             <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{isEditing ? 'Update Sermon' : 'Add Sermon'}</button>
          </div>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-slate-200">
           <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Recent Sermons</h3>
           <div className="space-y-3">
              {sermons.map(s => (
                 <div key={s.id} className="p-3 border rounded-xl flex items-center gap-3">
                    <img src={s.thumbnail} className="w-16 h-12 object-cover rounded" />
                    <div className="flex-1">
                       <p className="font-bold text-sm line-clamp-1">{s.title}</p>
                       <p className="text-xs text-slate-500">{s.preacher}</p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => handleEdit(s)} className="p-2 text-blue-500"><Edit size={16}/></button>
                        <button onClick={async () => { if(confirm("Delete?")) { await supabase.from('sermons').delete().eq('id', s.id); fetchSermons(); }}} className="p-2 text-red-500"><Trash2 size={16}/></button>
                    </div>
                 </div>
              ))}
           </div>
       </div>
    </div>
  );
};

// 5. MUSIC MANAGER
const MusicManager = () => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [formData, setFormData] = useState({ title: '', artist: '', url: '', type: 'MUSIC' });

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        const { data, error } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
        if (error) {
            console.warn("Could not fetch music tracks", error);
        }
        if (data) {
            setTracks(data.map((t: any) => ({
                id: t.id,
                title: t.title,
                artist: t.artist,
                url: t.url,
                type: t.type,
                date: t.created_at,
                duration: '',
                isOffline: false
            })));
        }
    };

    const handleSave = async () => {
        const payload = {
            title: formData.title,
            artist: formData.artist,
            url: formData.url,
            type: formData.type
        };

        const { error } = await supabase.from('music_tracks').insert([payload]);

        if (error) {
            handleSupabaseError(error, 'Music');
        } else {
            alert("Track Uploaded!");
            setFormData({ title: '', artist: '', url: '', type: 'MUSIC' });
            fetchTracks();
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("Delete this track?")) {
            const { error } = await supabase.from('music_tracks').delete().eq('id', id);
            if (error) handleSupabaseError(error, 'Music Delete');
            else fetchTracks();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Add Music / Podcast</h3>
                <div className="space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Track Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl" placeholder="Artist" value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} />
                    <input className="w-full border p-3 rounded-xl" placeholder="Audio URL (MP3)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                    <select className="w-full border p-3 rounded-xl" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="MUSIC">Music Song</option>
                        <option value="PODCAST">Podcast Episode</option>
                    </select>
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Upload Track</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Library</h3>
                <div className="space-y-3">
                    {tracks.length === 0 && <p className="text-slate-400 text-sm">No tracks found.</p>}
                    {tracks.map(t => (
                        <div key={t.id} className="p-3 border rounded-xl flex items-center justify-between">
                            <div>
                                <span className={`text-[10px] font-bold px-1.5 rounded ${t.type === 'PODCAST' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>{t.type}</span>
                                <p className="font-bold text-sm">{t.title}</p>
                                <p className="text-xs text-slate-500">{t.artist}</p>
                            </div>
                            <button onClick={() => handleDelete(t.id)} className="text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 6. BIBLE MANAGER
const BibleManager = () => {
    const [plan, setPlan] = useState('');
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    
    const handleUpload = async () => {
        const { error } = await supabase.from('reading_plans').insert([{
            month,
            year: new Date().getFullYear(),
            content: plan
        }]);
        if(!error) alert("Reading Plan Uploaded!");
        else handleSupabaseError(error, 'Bible Plan');
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl">
            <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Upload Reading Plan</h3>
            <div className="space-y-4">
                <input className="w-full border p-3 rounded-xl" value={month} onChange={e => setMonth(e.target.value)} placeholder="Month" />
                <textarea className="w-full border p-3 rounded-xl h-48" placeholder="Paste plan here (e.g. Day 1: Genesis 1-3...)" value={plan} onChange={e => setPlan(e.target.value)} />
                <button onClick={handleUpload} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Upload Plan</button>
            </div>
        </div>
    );
};

// 7. EVENT MANAGER
const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({ id: '', title: '', desc: '', date: '', time: '', loc: '', type: 'EVENT', image: '', video: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (data) {
       setEvents(data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time,
          location: e.location,
          description: e.description,
          type: e.type,
          image: e.image_url,
          videoUrl: e.video_url
       })));
    }
  };

  const handlePublish = async () => {
     let error;
     const payload = {
           title: formData.title,
           description: formData.desc,
           date: formData.date,
           time: formData.time,
           location: formData.loc,
           type: formData.type,
           image_url: formData.image || null,
           video_url: formData.video || null
     };

     if (isEditing) {
        const res = await supabase.from('events').update(payload).eq('id', formData.id);
        error = res.error;
     } else {
        const res = await supabase.from('events').insert([payload]);
        error = res.error;
     }

     if (!error) {
        alert(isEditing ? 'Event Updated!' : 'Event Created!');
        resetForm();
        fetchEvents();
     } else {
        handleSupabaseError(error, 'Event');
     }
  };

  const handleDelete = async (id: string) => {
     if(confirm("Are you sure you want to delete this event?")) {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if(!error) fetchEvents();
        else handleSupabaseError(error, 'Event Delete');
     }
  };

  const handleEdit = (event: Event) => {
     setFormData({
        id: event.id,
        title: event.title,
        desc: event.description,
        date: event.date,
        time: event.time,
        loc: event.location,
        type: event.type as any,
        image: event.image || '',
        video: event.videoUrl || ''
     });
     setIsEditing(true);
  };

  const handlePushNotification = async (event: Event) => {
     const { error } = await supabase.from('notifications').insert([{
         title: `New ${event.type === 'EVENT' ? 'Event' : 'Announcement'}: ${event.title}`,
         message: event.description || `Check out ${event.title} on ${event.date}`,
         type: event.type
     }]);

     if (error) handleSupabaseError(error, 'Push Notification');
     else alert(`Push Notification Sent!`);
  };

  const resetForm = () => {
     setFormData({ id: '', title: '', desc: '', date: '', time: '', loc: '', type: 'EVENT', image: '', video: '' });
     setIsEditing(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#0c2d58]">{isEditing ? 'Edit Event' : 'Create Event'}</h3>
              {isEditing && <button onClick={resetForm} className="text-xs text-slate-500 underline">Cancel Edit</button>}
           </div>
           <div className="space-y-4">
              <input className="w-full border p-3 rounded-xl" placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <input type="date" className="border p-3 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                 <input type="time" className="border p-3 rounded-xl" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <input className="w-full border p-3 rounded-xl" placeholder="Location" value={formData.loc} onChange={e => setFormData({...formData, loc: e.target.value})} />
              <textarea className="w-full border p-3 rounded-xl h-24" placeholder="Description" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
              <input className="w-full border p-3 rounded-xl" placeholder="Image URL (Optional)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <input className="w-full border p-3 rounded-xl" placeholder="Video URL (Optional)" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} />
              <button onClick={handlePublish} className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                  {isEditing ? 'Update Event' : 'Publish Event'}
              </button>
           </div>
        </div>

        {/* List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
           <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Upcoming Events</h3>
           <div className="space-y-3 overflow-y-auto max-h-[600px]">
              {events.map(event => (
                 <div key={event.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-start group hover:bg-slate-50">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${event.type === 'EVENT' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>{event.type}</span>
                          <span className="text-xs text-slate-400">{event.date}</span>
                       </div>
                       <h4 className="font-bold text-slate-800">{event.title}</h4>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => handlePushNotification(event)} title="Push Notification" className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                            <Bell size={16}/>
                        </button>
                        <button onClick={() => handleEdit(event)} title="Edit" className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                            <Edit size={16}/>
                        </button>
                        <button onClick={() => handleDelete(event.id)} title="Delete" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
    </div>
  );
}

// 8. GROUP MANAGER
const GroupManager = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [formData, setFormData] = useState({ id: '', name: '', desc: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
     fetchGroups();
  }, []);

  const fetchGroups = async () => {
     const { data, error } = await supabase.from('community_groups').select('*');
     if (error) {
         console.warn("Fetch Groups Failed", error);
     }
     if (data) {
        setGroups(data.map((g: any) => ({
           id: g.id,
           name: g.name,
           description: g.description,
           image: g.image_url,
           membersCount: 0, 
           isMember: false
        })));
     }
  };

  const handleSave = async () => {
     let error;
     const payload = {
        name: formData.name,
        description: formData.desc,
        image_url: formData.image || null
     };

     if(isEditing) {
        const res = await supabase.from('community_groups').update(payload).eq('id', formData.id);
        error = res.error;
     } else {
        const res = await supabase.from('community_groups').insert([payload]);
        error = res.error;
     }

     if (!error) {
        alert(isEditing ? 'Group Updated' : 'Group Created');
        setFormData({ id: '', name: '', desc: '', image: '' });
        setIsEditing(false);
        fetchGroups();
     } else {
        handleSupabaseError(error, 'Group');
     }
  };

  const handleDelete = async (id: string) => {
     if(confirm("Delete this group?")) {
        const { error } = await supabase.from('community_groups').delete().eq('id', id);
        if(!error) fetchGroups();
        else handleSupabaseError(error, 'Group Delete');
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
          <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">{isEditing ? 'Edit Group' : 'Create Group'}</h3>
          <div className="space-y-4">
             <input className="w-full border p-3 rounded-xl" placeholder="Group Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             <input className="w-full border p-3 rounded-xl" placeholder="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
             <textarea className="w-full border p-3 rounded-xl" placeholder="Description" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
             <div className="flex gap-2">
                 <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">{isEditing ? 'Update' : 'Create'}</button>
                 {isEditing && <button onClick={() => { setIsEditing(false); setFormData({id:'', name:'', desc:'', image:''})}} className="px-4 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>}
             </div>
          </div>
       </div>

       <div className="bg-white p-6 rounded-2xl border border-slate-200">
           <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Existing Groups</h3>
           <div className="space-y-3">
              {groups.length === 0 && <p className="text-slate-400 text-sm">No groups found.</p>}
              {groups.map(group => (
                 <div key={group.id} className="p-3 border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {group.image ? <img src={group.image} className="w-full h-full object-cover"/> : <Users size={20}/>}
                       </div>
                       <div>
                          <p className="font-bold text-sm">{group.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{group.description}</p>
                       </div>
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => { setFormData({ id: group.id, name: group.name, desc: group.description, image: group.image || '' }); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                       <button onClick={() => handleDelete(group.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                 </div>
              ))}
           </div>
       </div>
    </div>
  )
}
