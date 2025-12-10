
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy, Loader2, ListMusic, Plus, UserPlus, Download, FolderPlus, FileAudio, Image as ImageIcon, Film, Link as LinkIcon, Youtube
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup, MusicTrack, Playlist, Reel } from '../types';
import { supabase } from '../lib/supabaseClient';

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

const formatDate = (dateString?: string, formatStr?: string) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString();
};

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
-- SECURITY FUNCTION
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

-- REELS TABLE UPDATE
create table if not exists public.reels (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  thumbnail text,
  embed_url text,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
-- Add columns if table exists but columns are missing
alter table public.reels add column if not exists embed_url text;
alter table public.reels add column if not exists video_url text;

alter table public.reels enable row level security;
drop policy if exists "Public read reels" on public.reels;
create policy "Public read reels" on public.reels for select using (true);
drop policy if exists "Admin manage reels" on public.reels;
create policy "Admin manage reels" on public.reels for all using ( public.is_admin() );
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

const ReelManager = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [viewMode, setViewMode] = useState<'LIST' | 'EDIT' | 'CREATE'>('LIST');
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        sourceType: 'YOUTUBE' as 'YOUTUBE' | 'LINK' | 'UPLOAD',
        urlInput: '',
        thumbnailUrl: '',
    });
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);

    useEffect(() => { fetchReels(); }, []);

    const fetchReels = async () => {
        const { data } = await supabase.from('reels').select('*').order('created_at', { ascending: false });
        if(data) setReels(data as any);
    };

    const handleEdit = (r: Reel) => {
        let type: 'YOUTUBE' | 'LINK' | 'UPLOAD' = 'LINK';
        let url = r.video_url || '';
        if (r.embed_url) { type = 'YOUTUBE'; url = r.embed_url; } 
        else if (r.video_url && r.video_url.includes('supabase')) { type = 'UPLOAD'; }
        setFormData({ id: r.id, title: r.title, description: r.description, sourceType: type, urlInput: url, thumbnailUrl: r.thumbnail || '' });
        setViewMode('EDIT');
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Delete this reel?")) return;
        const { error } = await supabase.from('reels').delete().eq('id', id);
        if(error) handleSupabaseError(error, 'Delete Reel'); else fetchReels();
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingVideo(true);
        try {
            const file = e.target.files[0];
            const fileName = `reel_${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const { error } = await supabase.storage.from('reels-videos').upload(fileName, file);
            if(error) throw error;
            const { data } = supabase.storage.from('reels-videos').getPublicUrl(fileName);
            setFormData(prev => ({ ...prev, urlInput: data.publicUrl }));
        } catch(error) { handleSupabaseError(error, 'Video Upload'); }
        finally { setUploadingVideo(false); }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingThumb(true);
        try {
            const file = e.target.files[0];
            const fileName = `thumb_${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const { error } = await supabase.storage.from('reels-thumbnails').upload(fileName, file);
            if(error) throw error;
            const { data } = supabase.storage.from('reels-thumbnails').getPublicUrl(fileName);
            setFormData(prev => ({ ...prev, thumbnailUrl: data.publicUrl }));
        } catch(error) { handleSupabaseError(error, 'Thumbnail Upload'); }
        finally { setUploadingThumb(false); }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.urlInput) return alert("Title and Video source required");
        let embedUrl: string | null = null;
        let videoUrl: string | null = null;
        let rawInput = formData.urlInput;
        if (rawInput.includes('<iframe') && rawInput.includes('src="')) {
            const srcMatch = rawInput.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) rawInput = srcMatch[1];
        }
        if (formData.sourceType === 'YOUTUBE') {
            const ytId = getYouTubeID(rawInput);
            if (!ytId && !rawInput.includes('/embed/')) return alert("Invalid YouTube URL.");
            embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : rawInput;
        } else { videoUrl = rawInput; }

        const payload = { title: formData.title, description: formData.description, thumbnail: formData.thumbnailUrl || null, embed_url: embedUrl, video_url: videoUrl, updated_at: new Date().toISOString() };
        let error;
        if (viewMode === 'EDIT' && formData.id) { const { error: err } = await supabase.from('reels').update(payload).eq('id', formData.id); error = err; } 
        else { const { error: err } = await supabase.from('reels').insert([payload]); error = err; }
        if(error) handleSupabaseError(error, 'Save Reel'); else { alert("Reel saved!"); fetchReels(); setViewMode('LIST'); setFormData({ id: '', title: '', description: '', sourceType: 'YOUTUBE', urlInput: '', thumbnailUrl: '' }); }
    };

    if (viewMode === 'LIST') {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg text-[#0c2d58]">Reels Library</h3><button onClick={() => { setFormData({ id: '', title: '', description: '', sourceType: 'YOUTUBE', urlInput: '', thumbnailUrl: '' }); setViewMode('CREATE'); }} className="bg-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-pink-700"><Plus size={16}/> Add New Reel</button></div>
                <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-4 text-xs font-bold text-slate-500 uppercase">Thumbnail</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Title</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Type</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Source</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Actions</th></tr></thead><tbody>{reels.map(r => (<tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="p-4"><div className="w-12 h-16 bg-slate-200 rounded overflow-hidden relative">{r.thumbnail ? (<img src={r.thumbnail} className="w-full h-full object-cover"/>) : r.embed_url ? (<div className="w-full h-full bg-red-100 flex items-center justify-center"><Youtube size={20} className="text-red-500"/></div>) : (<div className="w-full h-full bg-slate-300 flex items-center justify-center"><Film size={20} className="text-white"/></div>)}</div></td><td className="p-4 font-bold text-slate-800 text-sm max-w-[200px] truncate">{r.title}</td><td className="p-4">{r.embed_url ? (<span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded">YouTube</span>) : r.video_url?.includes('supabase') ? (<span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">Upload</span>) : (<span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded">Link</span>)}</td><td className="p-4 text-xs text-slate-500 max-w-[150px] truncate">{r.embed_url || r.video_url}</td><td className="p-4 flex gap-2"><button onClick={() => handleEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button><button onClick={() => handleDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-100"><h3 className="font-bold text-xl text-[#0c2d58]">{viewMode === 'EDIT' ? 'Edit Reel' : 'Add New Reel'}</h3><button onClick={()=>setViewMode('LIST')} className="text-slate-500 text-sm hover:underline">Cancel</button></div>
            <div className="space-y-6">
                <div className="space-y-3"><label className="text-sm font-bold text-slate-700">Reel Details</label><input className="w-full border p-3 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Reel Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /><textarea className="w-full border p-3 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-200 outline-none h-24" placeholder="Description (Optional)" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} /></div>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="text-sm font-bold text-slate-700 block mb-2">Video Source Type</label><div className="flex gap-2 mb-4">{[{ id: 'YOUTUBE', label: 'YouTube Link', icon: Youtube }, { id: 'LINK', label: 'External URL', icon: LinkIcon }, { id: 'UPLOAD', label: 'Upload File', icon: Upload }].map(type => (<button key={type.id} onClick={() => setFormData({...formData, sourceType: type.id as any, urlInput: ''})} className={`flex-1 py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-2 transition border ${formData.sourceType === type.id ? 'bg-white border-blue-500 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}><type.icon size={20}/> {type.label}</button>))}</div>
                    {formData.sourceType === 'YOUTUBE' && (<div><input className="w-full border p-3 rounded-xl text-slate-900 text-sm" placeholder="Paste YouTube link or Embed Code" value={formData.urlInput} onChange={e=>setFormData({...formData, urlInput: e.target.value})}/></div>)}
                    {formData.sourceType === 'LINK' && (<div><input className="w-full border p-3 rounded-xl text-slate-900 text-sm" placeholder="Paste direct video URL" value={formData.urlInput} onChange={e=>setFormData({...formData, urlInput: e.target.value})}/></div>)}
                    {formData.sourceType === 'UPLOAD' && (<div className="flex flex-col gap-2"><label className="bg-white border border-dashed border-slate-300 px-4 py-8 rounded-xl cursor-pointer hover:bg-slate-50 text-slate-600 flex flex-col items-center justify-center transition"><Upload size={24} className="mb-2 text-blue-500"/> <span className="font-bold text-sm">{uploadingVideo ? 'Uploading...' : 'Click to Upload Video'}</span><input type="file" hidden accept="video/*" onChange={handleVideoUpload} /></label>{formData.urlInput && (<div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2"><Check size={14}/> Video Uploaded Successfully</div>)}</div>)}
                </div>
                <div className="space-y-3 border p-4 rounded-xl border-slate-100"><label className="text-sm font-bold text-slate-700">Thumbnail (Optional)</label><div className="flex items-center gap-4"><div className="w-20 h-28 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">{formData.thumbnailUrl ? (<img src={formData.thumbnailUrl} className="w-full h-full object-cover"/>) : (<ImageIcon className="text-slate-300"/>)}</div><div className="flex-1"><label className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 inline-flex items-center gap-2">{uploadingThumb ? 'Uploading...' : 'Upload Image'}<input type="file" hidden accept="image/*" onChange={handleThumbnailUpload} /></label></div></div></div>
                <button onClick={handleSave} className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 transition transform active:scale-95">{viewMode === 'EDIT' ? 'Update Reel' : 'Publish Reel'}</button>
            </div>
        </div>
    );
};

const MembersManager = () => { const [members, setMembers] = useState<User[]>([]); const [search, setSearch] = useState(''); useEffect(() => { const fetchMembers = async () => { const { data } = await supabase.from('profiles').select('*'); if (data) setMembers(data.map((p: any) => ({ id: p.id, firstName: p.first_name || 'No Name', lastName: p.last_name || '', email: p.email, phone: p.phone, dob: p.dob, role: p.role, joinedDate: p.created_at }))); }; fetchMembers(); }, []); const handleDeleteMember = async (id: string) => { if(!confirm("Delete?")) return; const { error } = await supabase.from('profiles').delete().eq('id', id); if (!error) { alert("Deleted."); } }; const filtered = members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(search.toLowerCase()) || m.email.includes(search)); return (<div><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-800">Members</h2><input className="border p-2 rounded-lg text-slate-900" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div><div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-4 text-xs font-bold text-slate-500 uppercase">First Name</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Last Name</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th></tr></thead><tbody>{filtered.map(m => (<tr key={m.id} className="border-b border-slate-100"><td className="p-4 font-bold text-slate-900">{m.firstName}</td><td className="p-4 font-bold text-slate-900">{m.lastName}</td><td className="p-4 text-sm text-slate-600">{m.email}</td><td className="p-4"><button onClick={() => handleDeleteMember(m.id)} className="text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div></div>)};

const ContentManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({ id: '', title: '', author: 'Admin', category_id: '', excerpt: '', content: '', image_url: '', video_url: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { 
      fetchCategories();
  }, []);

  useEffect(() => {
      if(categories.length > 0) fetchBlogs();
  }, [categories]);

  const fetchBlogs = async () => {
    const { data } = await supabase.from('blog_posts').select('*, blog_categories(id, name)').order('created_at', { ascending: false });
    if(data) {
        setBlogs(data.map((b: any) => ({
             ...b,
             category: b.blog_categories?.name || 'Uncategorized',
             category_id: b.category_id || b.blog_categories?.id
        })));
    }
  };

  const fetchCategories = async () => {
      const { data } = await supabase.from('blog_categories').select('*').order('name');
      if(data) {
          setCategories(data);
          if (!formData.category_id && data.length > 0) {
              setFormData(prev => ({ ...prev, category_id: data[0].id }));
          }
      }
  };

  const handleAddCategory = async () => {
      if(!newCategory) return;
      const { data, error } = await supabase.from('blog_categories').insert({ name: newCategory }).select();
      if(error) handleSupabaseError(error, 'Add Category');
      else if (data) {
          setCategories([...categories, data[0]]);
          setNewCategory('');
      }
  };

  const handleDeleteCategory = async (id: string) => {
      if(!confirm("Delete this category permanently?")) return;
      const { error } = await supabase.from('blog_categories').delete().eq('id', id);
      if(error) handleSupabaseError(error, 'Delete Category');
      else setCategories(categories.filter(c => c.id !== id));
  };
  
  const handleCategoryRename = async (id: string, oldName: string) => {
      const newName = prompt("Rename category:", oldName);
      if(newName && newName !== oldName) {
          const { error } = await supabase.from('blog_categories').update({ name: newName }).eq('id', id);
          if(error) handleSupabaseError(error, 'Rename Category');
          else setCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
      }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this blog post?")) return;
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if(!error) fetchBlogs();
      else handleSupabaseError(error, 'Delete Blog');
  }

  const handleEdit = (blog: BlogPost) => {
      setFormData({
          id: blog.id,
          title: blog.title,
          author: blog.author,
          category_id: blog.category_id || categories[0]?.id || '',
          excerpt: blog.excerpt,
          content: blog.content,
          image_url: (blog as any).image_url || '',
          video_url: blog.videoUrl || ''
      });
      setEditingId(blog.id);
  };

  const cancelEdit = () => {
      setFormData({ id: '', title: '', author: 'Admin', category_id: categories[0]?.id || '', excerpt: '', content: '', image_url: '', video_url: '' });
      setEditingId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
        setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error) {
        handleSupabaseError(error, 'Image Upload');
    } finally {
        setUploadingImage(false);
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `content_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
          setFormData(prev => ({ ...prev, content: prev.content + `\n\n(Image: ${data.publicUrl})\n\n` }));
      } catch (error) {
          handleSupabaseError(error, 'Content Image Upload');
      }
  };

  const addContentImageByUrl = () => {
      const url = prompt("Enter image URL:");
      if (url) {
          setFormData(prev => ({ ...prev, content: prev.content + `\n\n(Image: ${url})\n\n` }));
      }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingVideo(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_vid.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('blog-videos').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('blog-videos').getPublicUrl(fileName);
        setFormData({ ...formData, video_url: data.publicUrl });
    } catch (error) {
        handleSupabaseError(error, 'Video Upload');
    } finally {
        setUploadingVideo(false);
    }
  };

  const handleSubmit = async () => {
      const payload: any = {
          title: formData.title,
          author: formData.author,
          category_id: formData.category_id,
          excerpt: formData.excerpt,
          content: formData.content,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null
      };

      let error;
      if (editingId) {
          const { error: updateError } = await supabase.from('blog_posts').update(payload).eq('id', editingId);
          error = updateError;
      } else {
          const { error: insertError } = await supabase.from('blog_posts').insert([payload]);
          error = insertError;
      }

      if(error) handleSupabaseError(error, editingId ? 'Blog Update' : 'Blog Publish');
      else { 
          alert(editingId ? 'Updated successfully!' : 'Published successfully!'); 
          fetchBlogs(); 
          cancelEdit(); 
      }
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-[#0c2d58]">{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
                  {editingId && <button onClick={cancelEdit} className="text-xs text-red-500 underline">Cancel Edit</button>}
              </div>
              
              <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Manage Categories</p>
                  <div className="flex gap-2 mb-2">
                      <input className="border p-2 rounded text-xs flex-1 text-slate-900" placeholder="New Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                      <button onClick={handleAddCategory} className="bg-blue-600 text-white px-3 rounded text-xs"><Plus size={14}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {categories.map(c => (
                          <span key={c.id} className="bg-white border px-2 py-1 rounded text-xs text-slate-800 flex gap-2 items-center">
                              {c.name} 
                              <div className="flex gap-1">
                                  <button onClick={()=>handleCategoryRename(c.id, c.name)} className="text-blue-500 hover:text-blue-700"><Edit size={10}/></button>
                                  <button onClick={()=>handleDeleteCategory(c.id)} className="text-red-500 hover:text-red-700"><X size={10}/></button>
                              </div>
                          </span>
                      ))}
                  </div>
              </div>

              <div className="space-y-3">
                  <div>
                      <label className="text-xs font-bold text-slate-500">Title</label>
                      <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Enter title..." value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
                  </div>
                  
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500">Author</label>
                          <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="Author Name" value={formData.author} onChange={e=>setFormData({...formData, author: e.target.value})} />
                      </div>
                      <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500">Category</label>
                          <select className="w-full border p-3 rounded-xl text-slate-900" value={formData.category_id} onChange={e=>setFormData({...formData, category_id: e.target.value})}>
                              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>
                  </div>

                  <div>
                      <label className="text-xs font-bold text-slate-500">Excerpt (Short Description)</label>
                      <textarea className="w-full border p-3 rounded-xl text-slate-900 h-20" placeholder="Brief summary..." value={formData.excerpt} onChange={e=>setFormData({...formData, excerpt: e.target.value})} />
                  </div>

                  <div>
                      <div className="flex justify-between items-end mb-1">
                          <label className="text-xs font-bold text-slate-500">Full Content</label>
                          <div className="flex gap-2">
                              <button onClick={addContentImageByUrl} className="flex items-center gap-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded transition border border-slate-200">
                                  <LinkIcon size={12}/> Link Image
                              </button>
                              <label className="cursor-pointer flex items-center gap-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded transition border border-slate-200">
                                  <Upload size={12}/> Upload Image
                                  <input type="file" hidden accept="image/*" onChange={handleContentImageUpload} />
                              </label>
                          </div>
                      </div>
                      <textarea className="w-full border p-3 rounded-xl text-slate-900 h-40" placeholder="Main blog content..." value={formData.content} onChange={e=>setFormData({...formData, content: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-200 rounded-xl p-3">
                          <label className="text-xs font-bold text-slate-500 mb-2 block flex items-center gap-1"><ImageIcon size={12}/> Featured Image</label>
                          <div className="flex flex-col gap-2">
                             <label className="flex items-center justify-center gap-2 bg-slate-100 px-3 py-2 rounded cursor-pointer text-xs text-slate-700 hover:bg-slate-200">
                                 <Upload size={12}/> {uploadingImage ? 'Uploading...' : 'Upload File'}
                                 <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                             </label>
                             <input className="w-full border p-2 rounded text-xs text-slate-900" placeholder="Or Image URL" value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})} />
                             {formData.image_url && (
                                 <div className="w-full h-24 bg-slate-100 rounded bg-cover bg-center mt-2" style={{backgroundImage: `url(${formData.image_url})`}}></div>
                             )}
                          </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-3">
                          <label className="text-xs font-bold text-slate-500 mb-2 block flex items-center gap-1"><Film size={12}/> Featured Video</label>
                          <div className="flex flex-col gap-2">
                             <label className="flex items-center justify-center gap-2 bg-slate-100 px-3 py-2 rounded cursor-pointer text-xs text-slate-700 hover:bg-slate-200">
                                 <Upload size={12}/> {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                                 <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                             </label>
                             <input className="w-full border p-2 rounded text-xs text-slate-900" placeholder="Or YouTube URL" value={formData.video_url} onChange={e=>setFormData({...formData, video_url: e.target.value})} />
                             {formData.video_url && (
                                 <div className="w-full h-24 bg-black rounded mt-2 flex items-center justify-center overflow-hidden">
                                     {getYouTubeID(formData.video_url) ? (
                                         <img src={`https://img.youtube.com/vi/${getYouTubeID(formData.video_url)}/default.jpg`} className="w-full h-full object-cover opacity-70"/>
                                     ) : (
                                         <Film className="text-white"/>
                                     )}
                                 </div>
                             )}
                          </div>
                      </div>
                  </div>

                  <button onClick={handleSubmit} className={`w-full text-white py-3 rounded-xl font-bold transition ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {editingId ? 'Update Post' : 'Publish Post'}
                  </button>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Published Content</h3>
              <div className="space-y-4 h-[700px] overflow-y-auto">
                  {blogs.length === 0 && <p className="text-slate-400 text-sm text-center">No blogs published yet.</p>}
                  {blogs.map(b => (
                      <div key={b.id} className="p-4 border rounded-xl hover:bg-slate-50 transition flex justify-between items-start gap-3">
                          <div className="flex-1">
                              <h4 className="font-bold text-slate-900 line-clamp-1">{b.title}</h4>
                              <p className="text-xs text-slate-500 mb-1">{b.author} • {b.category} • {formatDate(b.date)}</p>
                              <p className="text-xs text-slate-400 line-clamp-2">{b.excerpt}</p>
                              {b.image && (
                                  <div className="w-20 h-12 bg-cover bg-center rounded mt-2" style={{backgroundImage: `url(${b.image})`}}></div>
                              )}
                              {b.videoUrl && getYouTubeID(b.videoUrl) && (
                                  <div className="w-20 h-12 bg-black rounded mt-2 flex items-center justify-center">
                                      <img src={`https://img.youtube.com/vi/${getYouTubeID(b.videoUrl)}/default.jpg`} className="h-full object-cover opacity-70"/>
                                  </div>
                              )}
                          </div>
                          <div className="flex flex-col gap-2">
                              <button onClick={() => handleEdit(b)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                              <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

const SermonManager = () => {
    // ... no changes to SermonManager logic, just standard component structure
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
        // Automatically extract thumbnail from YouTube ID
        const videoId = getYouTubeID(form.videoUrl);
        let thumb = '';
        if (videoId) {
            // Use maxresdefault for better quality, fallback happens automatically in some players but here we store the URL
            thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }

        const { error } = await supabase.from('sermons').insert([{
            title: form.title, 
            preacher: form.preacher, 
            date_preached: form.date, 
            duration: form.duration, 
            video_url: form.videoUrl, // Store full URL, logic in view handles extraction
            thumbnail_url: thumb
        }]);

        if(error) handleSupabaseError(error, 'Add Sermon');
        else { 
            fetchSermons(); 
            setForm({ title: '', preacher: '', date: '', duration: '', videoUrl: '' }); 
            alert('Sermon uploaded successfully!');
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-lg text-[#0c2d58] mb-4">Add Sermon</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1">Sermon Title</label>
                        <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="e.g. The Power of Prayer" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1">Preacher</label>
                        <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="e.g. Pastor David" value={form.preacher} onChange={e=>setForm({...form, preacher: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1">Date Preached</label>
                        <input className="w-full border p-3 rounded-xl text-slate-900" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1">Duration</label>
                        <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="e.g. 45:00" value={form.duration} onChange={e=>setForm({...form, duration: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1">YouTube URL</label>
                        <input className="w-full border p-3 rounded-xl text-slate-900" placeholder="https://youtu.be/..." value={form.videoUrl} onChange={e=>setForm({...form, videoUrl: e.target.value})} />
                        <p className="text-[10px] text-slate-400 mt-1 ml-1">Supports standard links, shorts, and share links.</p>
                    </div>
                    <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Upload Sermon</button>
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 h-[500px] overflow-y-auto">
                 <h3 className="font-bold text-lg text-[#0c2d58] mb-4">Library</h3>
                 {sermons.map(s => (
                     <div key={s.id} className="flex justify-between items-center p-3 border-b">
                         <div>
                             <p className="font-bold text-sm text-slate-900">{s.title}</p>
                             <p className="text-xs text-slate-500">{s.preacher} • {s.date}</p>
                         </div>
                         <button onClick={()=>handleDelete(s.id)} className="text-red-500"><Trash2 size={16}/></button>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const MusicManager = () => {
    // ... no changes, standard logic
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
    const handleExport = async (eventId: string, title: string) => {
        const { data } = await supabase.from('event_rsvps').select('*, profiles(first_name, last_name, email)').eq('event_id', eventId);
        if(data) {
            const cleanData = data.map((r:any) => ({ 
                Name: `${r.profiles?.first_name} ${r.profiles?.last_name}`, 
                Email: r.profiles?.email, 
                Status: r.status,
                Timestamp: new Date(r.created_at).toLocaleString()
            }));
            exportToCSV(cleanData, `rsvp_${title.replace(/\s+/g, '_')}`);
        } else {
            alert("No RSVPs found for this event.");
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Create Event or Announcement</h3>
                <div className="space-y-3">
                    <select className="w-full border p-2 rounded text-slate-900" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                        <option value="EVENT">Event (Allows RSVP)</option>
                        <option value="ANNOUNCEMENT">Announcement (Read Only)</option>
                    </select>
                    <input className="w-full border p-2 rounded text-slate-900" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                    <input className="w-full border p-2 rounded text-slate-900" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
                    <input className="w-full border p-2 rounded text-slate-900" type="time" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} />
                    <input className="w-full border p-2 rounded text-slate-900" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
                    <textarea className="w-full border p-2 rounded text-slate-900" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                    <button onClick={saveEvent} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Publish</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4">Upcoming Items</h3>
                {events.map(e => (
                    <div key={e.id} className="p-3 border-b mb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-900">{e.title}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${e.type === 'ANNOUNCEMENT' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{e.type}</span>
                            </div>
                            <div className="flex gap-2">
                                {e.type === 'EVENT' && (
                                    <button onClick={()=>handleExport(e.id, e.title)} className="text-green-600 hover:text-green-800" title="Export RSVPs"><Download size={16}/></button>
                                )}
                                <button onClick={()=>deleteEvent(e.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{e.date} @ {e.time}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
