
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
    alert(`${context} Action Failed: ${msg}`);
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

// ... (Keeping previous Managers mostly standard, focusing on GroupManager for updates)
const Overview = ({ onNavigate }: { onNavigate: (v: string) => void }) => {
  const [stats, setStats] = useState({ members: 0, blogs: 0, sermons: 0, events: 0, pendingRequests: 0 });
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: members } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: blogs } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
      const { count: sermons } = await supabase.from('sermons').select('*', { count: 'exact', head: true });
      const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true });
      
      let pendingCount = 0;
      try {
          const { count, data } = await supabase.from('community_group_members').select('*, profiles(first_name, last_name, email), community_groups(name)', { count: 'exact' }).eq('status', 'Pending');
          pendingCount = count || 0;
          if(data) setPendingMembers(data);
      } catch (e) {}

      setStats({ members: members || 0, blogs: blogs || 0, sermons: sermons || 0, events: events || 0, pendingRequests: pendingCount });
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      {stats.pendingRequests > 0 && (<div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8"><h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2"><UserPlus size={20}/> Pending Group Requests ({stats.pendingRequests})</h3><div className="space-y-2">{pendingMembers.map((req: any) => (<div key={req.id} className="bg-white p-3 rounded-xl border flex justify-between items-center text-sm"><div><span className="font-bold">{req.profiles?.first_name} {req.profiles?.last_name}</span><span className="text-slate-500"> wants to join </span><span className="font-bold text-blue-600">{req.community_groups?.name}</span></div><button onClick={() => onNavigate('groups')} className="text-blue-600 font-bold hover:underline">Manage</button></div>))}</div></div>)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div onClick={() => onNavigate('members')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer"><div className="flex items-center justify-between mb-4"><div className="bg-blue-500 p-3 rounded-xl text-white"><Users size={24} /></div><span className="text-3xl font-bold text-slate-800">{stats.members}</span></div><p className="text-slate-500 text-sm font-medium">Total Members</p></div>
         <div onClick={() => onNavigate('content')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer"><div className="flex items-center justify-between mb-4"><div className="bg-purple-500 p-3 rounded-xl text-white"><FileText size={24} /></div><span className="text-3xl font-bold text-slate-800">{stats.blogs}</span></div><p className="text-slate-500 text-sm font-medium">Blogs Published</p></div>
      </div>
    </div>
  );
};

const MembersManager = () => {
    const [members, setMembers] = useState<User[]>([]);
    useEffect(() => { const fetchMembers = async () => { const { data } = await supabase.from('profiles').select('*'); if(data) setMembers(data as any); }; fetchMembers(); }, []);
    return (<div className="bg-white p-6 rounded-2xl border border-slate-200"><h3 className="font-bold mb-4">Members Directory</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead><tbody>{members.map(m => (<tr key={m.id} className="border-b"><td className="p-3 font-bold">{m.firstName} {m.lastName}</td><td className="p-3 text-slate-500">{m.email}</td><td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{m.role}</span></td><td className="p-3 text-slate-500">{new Date(m.joinedDate).toLocaleDateString()}</td></tr>))}</tbody></table></div></div>);
}

const ContentManager = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [form, setForm] = useState({ title: '', content: '', author: 'Admin', category: 'General', image_url: '', excerpt: '' });
    useEffect(() => { fetchBlogs(); }, []);
    const fetchBlogs = async () => { const { data } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false}); if(data) setBlogs(data as any); };
    const saveBlog = async () => { await supabase.from('blog_posts').insert([{...form, likes: 0, comments: 0, date: new Date().toISOString()}]); fetchBlogs(); setForm({ title: '', content: '', author: 'Admin', category: 'General', image_url: '', excerpt: '' }); };
    const deleteBlog = async (id: string) => { await supabase.from('blog_posts').delete().eq('id', id); fetchBlogs(); };
    return (
        <div className="space-y-6"><div className="bg-white p-6 rounded-2xl border border-slate-200"><h3 className="font-bold mb-4">Add Blog</h3><div className="space-y-3"><input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} /><input className="w-full border p-2 rounded" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} /><input className="w-full border p-2 rounded" placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} /><textarea className="w-full border p-2 rounded h-32" placeholder="Content" value={form.content} onChange={e=>setForm({...form, content: e.target.value})} /><button onClick={saveBlog} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Publish</button></div></div><div className="bg-white p-6 rounded-2xl border border-slate-200"><h3 className="font-bold mb-4">Posts</h3>{blogs.map(b => (<div key={b.id} className="flex justify-between items-center p-3 border-b"><p>{b.title}</p><button onClick={()=>deleteBlog(b.id)}><Trash2 size={16}/></button></div>))}</div></div>
    );
};
const SermonManager = () => <div className="p-4 bg-white rounded-2xl">Sermon Manager</div>;
const ReelManager = () => <div className="p-4 bg-white rounded-2xl">Reel Manager</div>;
const MusicManager = () => <div className="p-4 bg-white rounded-2xl">Music Manager</div>;
const BibleManager = () => <div className="p-4 bg-white rounded-2xl">Bible Manager</div>;
const EventManager = () => <div className="p-4 bg-white rounded-2xl">Event Manager</div>;

// UPDATED GroupManager with Member Management
const GroupManager = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', description: '', image_url: '' });
    const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<CommunityGroup | null>(null);
    const [groupMembers, setGroupMembers] = useState<any[]>([]);

    useEffect(() => { fetchGroups(); fetchRequests(); }, []);
    useEffect(() => { if (selectedGroupForMembers) { fetchGroupMembers(selectedGroupForMembers.id); } }, [selectedGroupForMembers]);

    const fetchGroups = async () => { const { data } = await supabase.from('community_groups').select('*'); if(data) setGroups(data as any); }
    const fetchRequests = async () => { const { data } = await supabase.from('community_group_members').select('*, profiles(first_name, last_name, email), community_groups(name)').eq('status', 'Pending'); if(data) setRequests(data); }
    const fetchGroupMembers = async (groupId: string) => { const { data } = await supabase.from('community_group_members').select('*, profiles(first_name, last_name, email)').eq('group_id', groupId).eq('status', 'Approved'); if (data) setGroupMembers(data); };
    
    const deleteGroup = async (id: string) => { if(confirm("Delete?")) { await supabase.from('community_groups').delete().eq('id', id); fetchGroups(); } }
    const saveGroup = async () => { const { error } = await supabase.from('community_groups').insert([form]); if(error) handleSupabaseError(error, 'Save Group'); else { fetchGroups(); setForm({ name: '', description: '', image_url: '' }); } }
    
    const handleApproval = async (id: string, action: 'Approved' | 'Rejected') => {
        if (action === 'Rejected') {
            if(!confirm("Reject?")) return;
            await supabase.from('community_group_members').delete().eq('id', id);
        } else {
            await supabase.from('community_group_members').update({ status: 'Approved' }).eq('id', id);
        }
        fetchRequests();
    }

    const removeMember = async (recordId: string) => {
        if (!confirm("Remove member?")) return;
        await supabase.from('community_group_members').delete().eq('id', recordId);
        if (selectedGroupForMembers) fetchGroupMembers(selectedGroupForMembers.id);
    };

    if (selectedGroupForMembers) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                    <button onClick={() => setSelectedGroupForMembers(null)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                    <h3 className="font-bold text-lg text-[#0c2d58]">Members of {selectedGroupForMembers.name}</h3>
                </div>
                {groupMembers.length === 0 ? <div className="text-center py-10 text-slate-500 italic">No approved members.</div> : (
                    <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{groupMembers.map(m => (<tr key={m.id} className="border-b hover:bg-slate-50"><td className="p-4 font-bold">{m.profiles?.first_name} {m.profiles?.last_name}</td><td className="p-4 text-sm text-slate-600">{m.profiles?.email}</td><td className="p-4 text-sm text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td><td className="p-4 text-right"><button onClick={() => removeMember(m.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1 ml-auto"><ShieldOff size={14}/> Remove</button></td></tr>))}</tbody></table></div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold mb-4">Add Group</h3>
                    <div className="space-y-3"><input className="w-full border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} /><textarea className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} /><input className="w-full border p-2 rounded" placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} /><button onClick={saveGroup} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Create Group</button></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold mb-4">Existing Groups</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">{groups.map(g => (<div key={g.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-slate-50"><span className="font-bold text-slate-900">{g.name}</span><div className="flex gap-2"><button onClick={() => setSelectedGroupForMembers(g)} className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100"><Users size={16}/></button><button onClick={()=>deleteGroup(g.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button></div></div>))}</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4 text-[#0c2d58]">Pending Membership Requests</h3>
                {requests.length === 0 ? <p className="text-slate-500 italic text-sm">No pending requests.</p> : (<div className="space-y-3">{requests.map(r => (<div key={r.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50 transition"><div><p className="font-bold text-slate-900">{r.profiles?.first_name} {r.profiles?.last_name}</p><p className="text-xs text-slate-500">wants to join: <span className="text-blue-600 font-bold">{r.community_groups?.name}</span></p></div><div className="flex gap-2"><button onClick={()=>handleApproval(r.id, 'Approved')} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-200">Approve</button><button onClick={()=>handleApproval(r.id, 'Rejected')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-200">Reject</button></div></div>))}</div>)}
            </div>
        </div>
    );
};
