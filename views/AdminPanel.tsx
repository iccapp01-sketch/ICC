
// ... existing imports ...
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy, Loader2, ListMusic, Plus, UserPlus, Download, FolderPlus, FileAudio, Image as ImageIcon, Film, Link as LinkIcon, Youtube, ArrowLeft, ShieldOff, Phone, Monitor, Clock, Tag, Settings, Sun, Moon
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
-- 1. BLOG CATEGORIES TABLE
create table if not exists public.blog_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. GROUP CHAT TABLES
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

-- 3. SECURITY POLICIES (RLS)
alter table public.group_posts enable row level security;
alter table public.group_post_likes enable row level security;
alter table public.blog_categories enable row level security;

-- Categories Policies
create policy "Public read categories" on public.blog_categories for select using (true);
create policy "Admin only modify categories" on public.blog_categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
);

-- Posts Policies
create policy "Public read posts" on public.group_posts for select using (true);
create policy "Authenticated insert posts" on public.group_posts for insert with check (auth.uid() = user_id);
create policy "Authenticated delete own posts" on public.group_posts for delete using (auth.uid() = user_id);

-- Likes Policies
create policy "Public read likes" on public.group_post_likes for select using (true);
create policy "Authenticated insert likes" on public.group_post_likes for insert with check (auth.uid() = user_id);
create policy "Authenticated delete likes" on public.group_post_likes for delete using (auth.uid() = user_id);

-- 4. ADMIN FUNCTION (If missing)
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if(data) {
             const mappedMembers = data.map((m: any) => ({
                 id: m.id,
                 firstName: m.first_name || '',
                 lastName: m.last_name || '',
                 email: m.email || '',
                 phone: m.phone || '',
                 dob: m.dob || '',
                 gender: m.gender || '',
                 role: m.role || 'MEMBER',
                 joinedDate: m.created_at
             }));
             setMembers(mappedMembers);
        }
    }

    const deleteMember = async (id: string) => {
        if(!confirm("Are you sure you want to delete this member?")) return;
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if(error) handleSupabaseError(error, 'Delete Member');
        else fetchMembers();
    }

    const startEdit = (member: User) => {
        setEditingId(member.id);
        setEditForm(member);
    }

    const saveEdit = async () => {
        if(!editingId) return;
        const updates = {
            first_name: editForm.firstName,
            last_name: editForm.lastName,
            phone: editForm.phone,
            dob: editForm.dob,
            gender: editForm.gender,
            role: editForm.role
        };
        const { error } = await supabase.from('profiles').update(updates).eq('id', editingId);
        if(error) handleSupabaseError(error, 'Update Member');
        else {
            setEditingId(null);
            fetchMembers();
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold mb-4">Members Directory</h3>
            
            {editingId && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-[#0c2d58]">Edit Member</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                <input className="w-full border p-2 rounded-lg" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                <input className="w-full border p-2 rounded-lg" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                <input className="w-full border p-2 rounded-lg" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DOB</label>
                                <input type="date" className="w-full border p-2 rounded-lg" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                <select className="w-full border p-2 rounded-lg" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                                <select className="w-full border p-2 rounded-lg" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as any})}>
                                    <option value="MEMBER">Member</option>
                                    <option value="MODERATOR">Moderator</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="border-b bg-slate-50 text-slate-500">
                            <th className="p-4 font-bold rounded-tl-xl">Name</th>
                            <th className="p-4 font-bold">Details</th>
                            <th className="p-4 font-bold">Role</th>
                            <th className="p-4 font-bold rounded-tr-xl text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(m => (
                            <tr key={m.id} className="border-b hover:bg-slate-50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-slate-900">{m.firstName} {m.lastName}</div>
                                    <div className="text-xs text-slate-500">{m.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-600 flex items-center gap-1"><Phone size={12}/> {m.phone || 'N/A'}</span>
                                        <span className="text-xs text-slate-600 flex items-center gap-1"><Calendar size={12}/> {m.dob || 'N/A'}</span>
                                        <span className="text-xs text-slate-600 flex items-center gap-1"><UserPlus size={12}/> {m.gender || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        m.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                        m.role === 'MODERATOR' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {m.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => startEdit(m)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                            <Edit size={16}/>
                                        </button>
                                        <button onClick={() => deleteMember(m.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const ContentManager = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [publishOption, setPublishOption] = useState<'now' | 'schedule'>('now');
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    
    // Category Form State
    const [newCatName, setNewCatName] = useState('');
    const [editingCat, setEditingCat] = useState<{id: string, name: string} | null>(null);

    // UI Toggles
    const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
    const [videoInputType, setVideoInputType] = useState<'url' | 'upload'>('url');

    const [form, setForm] = useState({ 
        title: '', 
        content: '', 
        author: 'Admin', 
        category: '', 
        image_url: '', 
        video_url: '',
        excerpt: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00'
    });

    useEffect(() => { 
        fetchBlogs(); 
        fetchCategories();
    }, []);

    const fetchBlogs = async () => { 
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false}); 
        if(data) setBlogs(data.map((b: any) => ({
            ...b, 
            date: b.created_at,
            image: b.image_url, 
            videoUrl: b.video_url
        }))); 
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('blog_categories').select('*').order('name');
        if(data) setCategories(data);
        if(data && data.length > 0 && !form.category) setForm(prev => ({...prev, category: data[0].name}));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}_${Date.now()}.${fileExt}`;
            const bucket = 'blog-images'; 
            
            const { error: uploadError } = await supabase.storage
                .from(bucket) 
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            
            if (type === 'image') setForm({...form, image_url: publicUrl});
            else setForm({...form, video_url: publicUrl});
            
        } catch (error: any) {
            alert(`Upload failed: ${error.message}. Please ensure a storage bucket named 'blog-images' exists and is public.`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            alert("Please fill in title and content");
            return;
        }

        setIsLoading(true);
        
        const payload = {
            title: form.title,
            content: form.content,
            category: form.category || 'General',
            image_url: form.image_url,
            video_url: form.video_url,
            excerpt: form.excerpt,
            author: form.author,
            created_at: new Date().toISOString(),
            ...(editingId ? {} : { likes: 0, comments: 0 })
        };

        let error;
        if (editingId) {
            const { error: updateError } = await supabase.from('blog_posts').update(payload).eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('blog_posts').insert([payload]);
            error = insertError;
        }

        if (error) {
            alert("Error saving post: " + error.message);
        } else {
            setEditingId(null);
            resetForm();
            fetchBlogs();
        }
        setIsLoading(false);
    };

    const deleteBlog = async (id: string) => { 
        if(!confirm("Are you sure?")) return;
        await supabase.from('blog_posts').delete().eq('id', id); 
        fetchBlogs(); 
    };

    const startEdit = (blog: any) => {
        setEditingId(blog.id);
        const dateObj = new Date(blog.date);
        const isFuture = dateObj > new Date();
        setPublishOption(isFuture ? 'schedule' : 'now');
        
        setForm({
            title: blog.title,
            content: blog.content,
            category: blog.category,
            image_url: blog.image || '',
            video_url: blog.videoUrl || '',
            excerpt: blog.excerpt,
            author: blog.author,
            scheduledDate: dateObj.toISOString().split('T')[0],
            scheduledTime: dateObj.toTimeString().slice(0,5)
        });
        setImageInputType(blog.image ? 'url' : 'upload');
        setVideoInputType(blog.videoUrl ? 'url' : 'upload');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm({ 
            title: '', 
            content: '', 
            author: 'Admin', 
            category: categories[0]?.name || '', 
            image_url: '', 
            video_url: '', 
            excerpt: '', 
            scheduledDate: new Date().toISOString().split('T')[0], 
            scheduledTime: '09:00' 
        });
        setImageInputType('url');
        setVideoInputType('url');
        setPublishOption('now');
        setEditingId(null);
    };

    const handleAddCategory = async () => {
        if(!newCatName.trim()) return;
        const { error } = await supabase.from('blog_categories').insert({ name: newCatName });
        if(error) alert(error.message);
        else {
            setNewCatName('');
            fetchCategories();
        }
    };

    const handleUpdateCategory = async () => {
        if(!editingCat || !editingCat.name.trim()) return;
        const { error } = await supabase.from('blog_categories').update({ name: editingCat.name }).eq('id', editingCat.id);
        if(error) alert(error.message);
        else {
            setEditingCat(null);
            fetchCategories();
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if(!confirm("Delete this category? Posts using it will keep their label but it won't appear in the list.")) return;
        const { error } = await supabase.from('blog_categories').delete().eq('id', id);
        if(error) alert(error.message);
        else fetchCategories();
    };

    const minDateStr = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            {showCategoryManager && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-[2rem] w-full max-w-md shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-[#0c2d58] flex items-center gap-2"><Tag/> Manage Categories</h3>
                            <button onClick={() => setShowCategoryManager(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X/></button>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                             <div className="flex gap-2 mb-6">
                                <input className="flex-1 border p-2 rounded-xl text-sm" placeholder="New category name..." value={newCatName} onChange={e=>setNewCatName(e.target.value)} />
                                <button onClick={handleAddCategory} className="bg-blue-600 text-white p-2 rounded-xl"><Plus/></button>
                             </div>
                             {categories.map(cat => (
                                 <div key={cat.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border group">
                                     {editingCat && editingCat.id === cat.id ? (
                                         <input 
                                            autoFocus 
                                            className="flex-1 bg-white border rounded px-2 py-1 text-sm" 
                                            value={editingCat.name} 
                                            onChange={e=> setEditingCat(prev => prev ? {...prev, name: e.target.value} : null)} 
                                         />
                                     ) : (
                                         <span className="flex-1 font-bold text-slate-700">{cat.name}</span>
                                     )}
                                     <div className="flex gap-1">
                                         {editingCat && editingCat.id === cat.id ? (
                                             <button onClick={handleUpdateCategory} className="text-green-600 p-1"><Check size={18}/></button>
                                         ) : (
                                             <button onClick={() => { if(cat.id) setEditingCat({ id: cat.id, name: cat.name }); }} className="text-slate-400 hover:text-blue-600 p-1"><Edit size={18}/></button>
                                         )}
                                         <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-[#0c2d58]">{editingId ? 'Edit Post' : 'Create New Post'}</h3>
                    <div className="flex gap-2">
                         <button onClick={() => setShowCategoryManager(true)} className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition flex items-center gap-1"><Tag size={16}/> Categories</button>
                         {editingId && <button onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"><X size={14}/> Cancel Edit</button>}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                            <input className="w-full border p-2.5 rounded-xl bg-slate-50 focus:bg-white transition" placeholder="Enter title..." value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                <select className="w-full border p-2.5 rounded-xl bg-slate-50 focus:bg-white transition" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    <option value="General">General</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
                                <input className="w-full border p-2.5 rounded-xl bg-slate-50 focus:bg-white transition" placeholder="Author Name" value={form.author} onChange={e=>setForm({...form, author: e.target.value})} />
                             </div>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Excerpt</label>
                            <textarea className="w-full border p-2.5 rounded-xl bg-slate-50 focus:bg-white transition h-20" placeholder="Short summary..." value={form.excerpt} onChange={e=>setForm({...form, excerpt: e.target.value})} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Publishing Options</label>
                             <div className="flex gap-2 mb-3">
                                <button onClick={() => setPublishOption('now')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${publishOption === 'now' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Publish Now</button>
                                <button onClick={() => setPublishOption('schedule')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${publishOption === 'schedule' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Schedule</button>
                             </div>
                             {publishOption === 'schedule' && (
                                 <div className="flex gap-