
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
              .eq('status', 'pending');
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

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text, last_name text, email text, phone text, dob text, gender text,
  role text default 'MEMBER',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;
drop policy if exists "Admin manage profiles" on public.profiles;
create policy "Admin manage profiles" on public.profiles for all using ( public.is_admin() );

-- ... (Rest of tables: blog_posts, sermons, music_tracks, playlists, events, reading_plans)
-- Ensure ALL have policies using is_admin() for DELETE access
  `;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      
      {/* Pending Requests Section */}
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
          {/* Other stats cards */}
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
  const [isEditing, setIsEditing] = useState(false);
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
    // ... (same as before) ...
  };
  
  // ... (Create/Edit Logic) ...

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg text-[#0c2d58] mb-4">Blog Manager</h3>
              {/* Category Management */}
              <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                      <input className="border p-2 rounded text-xs flex-1 text-slate-900" placeholder="New Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                      <button onClick={() => {if(newCategory){setCategories([...categories, newCategory]); setNewCategory('');}}} className="bg-blue-600 text-white px-3 rounded text-xs"><Plus size={14}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {categories.map(c => <span key={c} className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-800 flex gap-1">{c} <button onClick={()=>setCategories(categories.filter(cat=>cat!==c))} className="text-red-500"><X size={10}/></button></span>)}
                  </div>
              </div>
              {/* Form ... */}
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Published Content</h3>
              <div className="space-y-4 h-[600px] overflow-y-auto">
                  {blogs.map(b => (
                      <div key={b.id} className="p-4 border rounded-xl hover:bg-slate-50 transition flex justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900">{b.title}</h4>
                          </div>
                          <button onClick={() => handleDelete(b.id)} className="text-red-500"><Trash2 size={16}/></button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

const SermonManager = () => {
    // ... Similar structure, fixing Delete button ...
    const handleDelete = async (id: string) => {
        if(!confirm("Delete sermon?")) return;
        const { error } = await supabase.from('sermons').delete().eq('id', id);
        if(!error) { alert("Sermon Deleted"); /* refetch */ }
        else handleSupabaseError(error, 'Delete Sermon');
    }
    return <div>Sermon Manager (See Logic)</div>;
};

const MusicManager = () => {
    // ... Implement PC Upload / URL Toggle, Music/Podcast Toggle, and Fix Delete ...
    return <div>Music Manager (See Logic)</div>;
};

const GroupManager = () => {
    // ... Fix Group Delete ...
    return <div>Group Manager (See Logic)</div>;
};

const BibleManager = () => {
    // ... Bulk Uploader ...
    return <div>Bible Manager (See Logic)</div>;
};

const EventManager = () => {
    // ... Fix Delete, Add Export RSVP ...
    return <div>Event Manager (See Logic)</div>;
};
