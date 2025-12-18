import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play, Database, AlertTriangle, Copy, Loader2, ListMusic, Plus, UserPlus, Download, FolderPlus, FileAudio, Image as ImageIcon, Film, Link as LinkIcon, Youtube, ArrowLeft, ShieldOff, Phone, Monitor, Clock, Tag, Settings, Camera, Globe, Headphones, Mic, Volume2, UserCheck, UserX, ShieldCheck, Megaphone, MapPin, FileSpreadsheet
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup, MusicTrack, Playlist, Reel, ReadingPlanDay, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Logo } from '../components/Logo';

interface AdminProps {
  onLogout: () => void;
}

// --- UTILS ---
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const getYouTubeID = (url: string) => { 
    if (!url) return null; 
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null; 
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
      case 'events': return <EventManager />;
      default: return <Overview onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 hidden md:flex flex-col">
        <div className="p-6 border-b dark:border-slate-700 flex items-center gap-3">
           <h2 className="font-black text-lg text-[#0c2d58] dark:text-white leading-none">Admin</h2>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
           {[
             { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
             { id: 'members', icon: Users, label: 'Members' },
             { id: 'content', icon: FileText, label: 'Blog & Content' },
             { id: 'media', icon: Video, label: 'Sermons' },
             { id: 'reels', icon: Film, label: 'Reels' },
             { id: 'music', icon: Music, label: 'Media Library' },
             { id: 'groups', icon: MessageCircle, label: 'Communities' },
             { id: 'events', icon: Calendar, label: 'Events' }
           ].map(item => (
             <button 
               key={item.id} 
               onClick={() => setActiveView(item.id)} 
               className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition text-sm font-bold uppercase tracking-widest ${activeView === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
               <item.icon size={18} />
               {item.label}
             </button>
           ))}
        </div>
        <div className="p-4 border-t dark:border-slate-700">
           <button onClick={onLogout} className="flex items-center gap-3 text-red-500 w-full px-4 py-3 font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"><LogOut size={20}/> Logout</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">{renderContent()}</div>
    </div>
  );
};

// --- CONTENT MANAGER (BLOGS & CATEGORIES) ---
const ContentManager = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
    
    // Category Form State
    const [catName, setCatName] = useState('');
    const [editingCatId, setEditingCatId] = useState<string | null>(null);

    // Blog Form State
    const [form, setForm] = useState({
        title: '',
        author: '',
        category: '',
        excerpt: '',
        content: '',
        image_url: '',
        video_url: '',
    });

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, []);

    const fetchBlogs = async () => {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        if (data) setBlogs(data as any);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('blog_categories').select('*').order('name');
        if (data) setCategories(data);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const bucket = type === 'image' ? 'blog-images' : 'blog-videos';
        
        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
        
        if (error) {
            alert("Upload failed: " + error.message);
        } else {
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            if (type === 'image') setForm({...form, image_url: publicUrl});
            else setForm({...form, video_url: publicUrl});
        }
        setIsLoading(false);
    };

    const saveBlog = async () => {
        if (!form.title || !form.content) return alert("Title and Content are required.");
        setIsLoading(true);

        const payload = {
            ...form,
            created_at: new Date().toISOString()
        };

        let error;
        if (isEditing) {
            const { error: err } = await supabase.from('blog_posts').update(payload).eq('id', isEditing);
            error = err;
        } else {
            const { error: err } = await supabase.from('blog_posts').insert([payload]);
            error = err;
        }

        if (error) {
            alert("Save failed: " + error.message);
        } else {
            setForm({
                title: '', author: '', category: '', excerpt: '', content: '', image_url: '', video_url: '',
            });
            setIsEditing(null);
            fetchBlogs();
        }
        setIsLoading(false);
    };

    const editBlog = (blog: BlogPost) => {
        setForm({
            title: blog.title,
            author: blog.author,
            category: blog.category,
            excerpt: blog.excerpt,
            content: blog.content,
            image_url: blog.image_url,
            video_url: blog.video_url || '',
        });
        setIsEditing(blog.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteBlog = async (id: string) => {
        if (!confirm("Delete this blog post?")) return;
        await supabase.from('blog_posts').delete().eq('id', id);
        fetchBlogs();
    };

    // Category Methods
    const saveCategory = async () => {
        if (!catName) return;
        if (editingCatId) {
            await supabase.from('blog_categories').update({ name: catName }).eq('id', editingCatId);
        } else {
            await supabase.from('blog_categories').insert([{ name: catName }]);
        }
        setCatName('');
        setEditingCatId(null);
        fetchCategories();
    };

    const deleteCategory = async (id: string) => {
        if (!confirm("Delete category? Posts using this may lose their category link.")) return;
        await supabase.from('blog_categories').delete().eq('id', id);
        fetchCategories();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Content Hub</h2>
                <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl flex shadow-sm border dark:border-slate-700">
                    <button onClick={() => setActiveTab('posts')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition ${activeTab === 'posts' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-600'}`}>Posts</button>
                    <button onClick={() => setActiveTab('categories')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-600'}`}>Categories</button>
                </div>
            </div>

            {activeTab === 'posts' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl">
                            <h3 className="font-black mb-6 text-xl text-blue-600 flex items-center gap-2">
                                {isEditing ? <Edit size={24}/> : <Plus size={24}/>}
                                {isEditing ? 'Edit Article' : 'Compose New Article'}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Title</label>
                                        <input className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Enter headline..." value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Author</label>
                                        <input className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Author name..." value={form.author} onChange={e=>setForm({...form, author: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Category</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Excerpt (Short summary)</label>
                                    <textarea className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition h-20" placeholder="Brief hook for the reader..." value={form.excerpt} onChange={e=>setForm({...form, excerpt: e.target.value})} />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Main Content</label>
                                    <textarea className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition h-64 font-serif leading-relaxed" placeholder="Type your article here..." value={form.content} onChange={e=>setForm({...form, content: e.target.value})} />
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border dark:border-slate-700 space-y-4">
                                    <h4 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><ImageIcon size={14}/> Media & Attachments</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 ml-1">Cover Image</label>
                                            <div className="flex gap-2">
                                                <input className="flex-1 bg-white dark:bg-slate-800 border dark:border-slate-700 p-2 text-xs rounded-xl" placeholder="Image URL..." value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} />
                                                <label className="cursor-pointer bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition">
                                                    <Camera size={18}/>
                                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'image')} />
                                                </label>
                                            </div>
                                            {form.image_url && <img src={form.image_url} className="h-12 w-20 object-cover rounded-lg border shadow-sm" />}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 ml-1">Video Resource (Optional)</label>
                                            <div className="flex gap-2">
                                                <input className="flex-1 bg-white dark:bg-slate-800 border dark:border-slate-700 p-2 text-xs rounded-xl" placeholder="Video URL..." value={form.video_url} onChange={e=>setForm({...form, video_url: e.target.value})} />
                                                <label className="cursor-pointer bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition">
                                                    <Film size={18}/>
                                                    <input type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, 'video')} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={saveBlog} disabled={isLoading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Globe size={20}/>}
                                        {isEditing ? 'Update Article' : 'Publish Article Now'}
                                    </button>
                                    {isEditing && (
                                        <button onClick={() => { setIsEditing(null); setForm({title:'', author:'', category:'', excerpt:'', content:'', image_url:'', video_url:''}) }} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Column */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm overflow-hidden">
                            <h3 className="font-black mb-6 uppercase tracking-widest text-slate-400 flex items-center gap-2"><ListMusic size={16}/> Published Articles</h3>
                            <div className="space-y-3 max-h-[1000px] overflow-y-auto pr-2 no-scrollbar">
                                {blogs.map(blog => (
                                    <div key={blog.id} className="p-4 border dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-900/40 group hover:border-blue-500 transition">
                                        <div className="flex gap-4 mb-3">
                                            <img src={blog.image_url} className="w-16 h-16 object-cover rounded-2xl shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm truncate dark:text-white">{blog.title}</h4>
                                                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{blog.category}</p>
                                                <p className="text-[10px] text-slate-500">{formatDate(blog.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => editBlog(blog)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><Edit size={16}/></button>
                                            <button onClick={() => deleteBlog(blog.id)} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl">
                        <h3 className="font-black mb-6 text-xl text-blue-600">Category Manager</h3>
                        <div className="flex gap-2">
                            <input className="flex-1 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none" placeholder="New category name..." value={catName} onChange={e=>setCatName(e.target.value)} />
                            <button onClick={saveCategory} className="bg-blue-600 text-white px-6 rounded-2xl font-bold uppercase flex items-center gap-2">
                                {editingCatId ? <Save size={18}/> : <Plus size={18}/>}
                                {editingCatId ? 'Update' : 'Add'}
                            </button>
                            {editingCatId && <button onClick={() => {setEditingCatId(null); setCatName('');}} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl"><X size={18}/></button>}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
                        <div className="space-y-2">
                            {categories.map(c => (
                                <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl group hover:bg-white dark:hover:bg-slate-700 transition">
                                    <span className="font-bold dark:text-white">{c.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => {setEditingCatId(c.id); setCatName(c.name);}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                                        <button onClick={() => deleteCategory(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
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

const Overview = ({ onNavigate }: any) => {
  const [stats, setStats] = useState({ members: 0, blogs: 0, sermons: 0, events: 0 });
  useEffect(() => {
    supabase.from('profiles').select('*', { count: 'exact', head: true }).then(r => setStats(s => ({...s, members: r.count || 0})));
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).then(r => setStats(s => ({...s, blogs: r.count || 0})));
    supabase.from('sermons').select('*', { count: 'exact', head: true }).then(r => setStats(s => ({...s, sermons: r.count || 0})));
    supabase.from('events').select('*', { count: 'exact', head: true }).then(r => setStats(s => ({...s, events: r.count || 0})));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
      <StatCard title="Members" count={stats.members} color="bg-blue-500" icon={Users} />
      <StatCard title="Blogs" count={stats.blogs} color="bg-green-500" icon={FileText} />
      <StatCard title="Sermons" count={stats.sermons} color="bg-red-500" icon={Video} />
      <StatCard title="Events" count={stats.events} color="bg-purple-500" icon={Calendar} />
    </div>
  );
};

const StatCard = ({ title, count, color, icon: Icon }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border dark:border-slate-700 group hover:shadow-xl transition-all">
    <div className={`w-12 h-12 ${color} text-white rounded-2xl mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}><Icon size={24}/></div>
    <h3 className="text-3xl font-black dark:text-white tracking-tighter">{count}</h3>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
  </div>
);

const MembersManager = () => {
    const [members, setMembers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingMember, setEditingMember] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMembers = async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) {
            setMembers(data.map((m: any) => ({
                id: m.id,
                firstName: m.first_name,
                lastName: m.last_name,
                email: m.email,
                phone: m.phone,
                dob: m.dob,
                role: m.role as UserRole,
                joinedDate: m.created_at
            })));
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
        setIsLoading(true);
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else fetchMembers();
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!editingMember) return;
        setIsLoading(true);
        const { error } = await supabase.from('profiles').update({
            first_name: editingMember.firstName,
            last_name: editingMember.lastName,
            email: editingMember.email,
            phone: editingMember.phone,
            role: editingMember.role
        }).eq('id', editingMember.id);

        if (error) alert("Error: " + error.message);
        else {
            setEditingMember(null);
            fetchMembers();
        }
        setIsLoading(false);
    };

    const exportToExcel = () => {
        const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "DOB", "Role", "Joined Date"];
        const rows = members.map(m => [
            m.id, m.firstName, m.lastName, m.email, m.phone, m.dob, m.role, m.joinedDate
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ICC_Members_List_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredMembers = members.filter(m => 
        (m.firstName + ' ' + m.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border dark:border-slate-700">
                <h3 className="font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 shrink-0">
                    <Users size={20}/> Member Directory ({filteredMembers.length})
                </h3>
                
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-4 top-3 text-slate-400" size={18}/>
                    <input 
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 py-2.5 pl-12 pr-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button 
                    onClick={exportToExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition shadow-lg shadow-green-200 dark:shadow-none shrink-0"
                >
                    <Download size={16}/> Export to Excel
                </button>
            </div>

            {/* Members Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Member</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Phone</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Joined</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-700">
                            {filteredMembers.map(m => (
                                <tr key={m.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                                                {m.firstName?.[0]}{m.lastName?.[0]}
                                            </div>
                                            <span className="font-bold dark:text-white">{m.firstName} {m.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{m.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{m.phone || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {m.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-400">{formatDate(m.joinedDate)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => setEditingMember(m)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                title="Edit Member"
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(m.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                title="Delete Member"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredMembers.length === 0 && (
                    <div className="p-20 text-center text-slate-400 font-medium">
                        No members found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {/* Edit Modal Overlay */}
            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border dark:border-slate-700">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Edit Member Profile</h3>
                                <button onClick={() => setEditingMember(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><X size={24}/></button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">First Name</label>
                                        <input 
                                            className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                                            value={editingMember.firstName} 
                                            onChange={e => setEditingMember({...editingMember, firstName: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Last Name</label>
                                        <input 
                                            className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                                            value={editingMember.lastName} 
                                            onChange={e => setEditingMember({...editingMember, lastName: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Address</label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                                        value={editingMember.email} 
                                        onChange={e => setEditingMember({...editingMember, email: e.target.value})} 
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Phone Number</label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                                        value={editingMember.phone} 
                                        onChange={e => setEditingMember({...editingMember, phone: e.target.value})} 
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">User Role</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editingMember.role}
                                        onChange={e => setEditingMember({...editingMember, role: e.target.value as UserRole})}
                                    >
                                        <option value="MEMBER">MEMBER</option>
                                        <option value="AUTHOR">AUTHOR</option>
                                        <option value="MODERATOR">MODERATOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        disabled={isLoading}
                                        onClick={handleSave} 
                                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
                                        Save Changes
                                    </button>
                                    <button 
                                        onClick={() => setEditingMember(null)}
                                        className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SermonManager = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [form, setForm] = useState({ title: '', preacher: '', video_url: '', date_preached: '' });
    const [isLoading, setIsLoading] = useState(false);

    const fetch = () => supabase.from('sermons').select('*').order('created_at', { ascending: false }).then(r => setSermons(r.data || []));
    useEffect(() => { fetch(); }, []);

    const save = async () => {
        if(!form.title || !form.video_url) return alert("Title and URL required");
        setIsLoading(true);
        const { error } = await supabase.from('sermons').insert([{ ...form, created_at: new Date().toISOString() }]);
        if (!error) { fetch(); setForm({ title: '', preacher: '', video_url: '', date_preached: '' }); }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl">
                <h3 className="font-black mb-6 uppercase tracking-widest text-blue-600">Broadcast Center</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl outline-none" placeholder="Sermon Title..." value={form.title} onChange={e=>setForm({...form, title: e.target.value})}/>
                    <input className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl outline-none" placeholder="Preacher Name..." value={form.preacher} onChange={e=>setForm({...form, preacher: e.target.value})}/>
                    <input className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl outline-none" placeholder="YouTube URL..." value={form.video_url} onChange={e=>setForm({...form, video_url: e.target.value})}/>
                    <input type="date" className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl outline-none" value={form.date_preached} onChange={e=>setForm({...form, date_preached: e.target.value})}/>
                </div>
                <button onClick={save} disabled={isLoading} className="mt-6 w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">
                    {isLoading ? 'Processing...' : 'Upload Broadcast'}
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sermons.map(s => (
                    <div key={s.id} className="p-4 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center gap-4 border dark:border-slate-700 group">
                        <div className="w-24 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0 relative">
                            <img src={`https://img.youtube.com/vi/${getYouTubeID(s.video_url)}/default.jpg`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white"><Play size={16} fill="currentColor"/></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold dark:text-white truncate">{s.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{s.preacher}</p>
                        </div>
                        <button onClick={async () => { if(confirm("Delete sermon?")) { await supabase.from('sermons').delete().eq('id', s.id); fetch(); } }} className="text-red-500 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"><Trash2 size={20}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MusicManager = () => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [form, setForm] = useState({
        title: '',
        artist: '',
        type: 'MUSIC' as 'MUSIC' | 'PODCAST',
        url: ''
    });

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        const { data } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
        if (data) setTracks(data);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Automatically detect title and artist from filename
        // Assumes "Artist - Title.mp3" format
        let filename = file.name.replace(/\.[^/.]+$/, ""); // remove extension
        let artist = "Unknown Artist";
        let title = filename;

        if (filename.includes(" - ")) {
            const parts = filename.split(" - ");
            artist = parts[0].trim();
            title = parts.slice(1).join(" - ").trim();
        }

        setForm(prev => ({ ...prev, title, artist }));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        const fileInput = document.getElementById('audio-file') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file) return alert("Please select a file first.");
        if (!form.title || !form.artist) return alert("Title and Artist are required.");

        setIsLoading(true);
        setUploadProgress(10);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${form.type.toLowerCase()}s/${fileName}`;

            setUploadProgress(30);
            const { error: uploadError } = await supabase.storage
                .from('music-tracks')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setUploadProgress(70);
            const { data: { publicUrl } } = supabase.storage
                .from('music-tracks')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase.from('music_tracks').insert([{
                title: form.title,
                artist: form.artist,
                type: form.type,
                url: publicUrl,
                created_at: new Date().toISOString()
            }]);

            if (dbError) throw dbError;

            setUploadProgress(100);
            alert("Upload successful!");
            setForm({ title: '', artist: '', type: 'MUSIC', url: '' });
            fileInput.value = '';
            fetchTracks();
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    const deleteTrack = async (id: string, url: string) => {
        if (!confirm("Delete this track?")) return;
        
        try {
            // Extract path from URL to delete from storage
            const pathMatch = url.match(/\/music-tracks\/(.+)$/);
            if (pathMatch) {
                await supabase.storage.from('music-tracks').remove([pathMatch[1]]);
            }
            await supabase.from('music_tracks').delete().eq('id', id);
            fetchTracks();
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl sticky top-8">
                        <h3 className="font-black mb-6 text-xl text-blue-600 flex items-center gap-2">
                            <Upload size={24}/> Upload Media
                        </h3>
                        
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Audio File (MP3/WAV)</label>
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        id="audio-file"
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label 
                                        htmlFor="audio-file"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-dashed dark:border-slate-700 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer group-hover:border-blue-500 transition-all"
                                    >
                                        <FileAudio className="text-slate-400 group-hover:text-blue-500 mb-2" size={32}/>
                                        <span className="text-xs font-bold text-slate-500">Click to browse PC</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Media Type</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={form.type}
                                    onChange={e => setForm({...form, type: e.target.value as any})}
                                >
                                    <option value="MUSIC">🎵 Music Track</option>
                                    <option value="PODCAST">🎙️ Podcast Episode</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Detected Title</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Track Title" 
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Detected Artist</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Artist Name" 
                                    value={form.artist}
                                    onChange={e => setForm({...form, artist: e.target.value})}
                                />
                            </div>

                            {isLoading && (
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                    <p className="text-[10px] font-black text-center text-blue-600 uppercase">Uploading... {uploadProgress}%</p>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin"/> : <Volume2 size={20}/>}
                                Start Upload
                            </button>
                        </form>
                    </div>
                </div>

                {/* Track List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
                        <h3 className="font-black mb-6 uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ListMusic size={18}/> Library Contents ({tracks.length})
                        </h3>
                        
                        <div className="space-y-3">
                            {tracks.map(track => (
                                <div key={track.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl flex items-center gap-4 group hover:border-blue-500 border border-transparent transition-all">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${track.type === 'MUSIC' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                        {track.type === 'MUSIC' ? <Headphones size={20}/> : <Mic size={20}/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm dark:text-white truncate">{track.title}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{track.artist}</p>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <p className="text-[10px] font-black text-blue-500 uppercase">{track.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a 
                                            href={track.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl transition shadow-sm border dark:border-slate-700"
                                        >
                                            <Play size={18} fill="currentColor"/>
                                        </a>
                                        <button 
                                            onClick={() => deleteTrack(track.id, track.url)}
                                            className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-600 rounded-xl transition shadow-sm border dark:border-slate-700"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {tracks.length === 0 && (
                                <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                                    <Music size={48} className="mb-4 opacity-20"/>
                                    <p className="font-bold">No tracks in your library yet.</p>
                                    <p className="text-xs">Upload your first track or podcast from the left panel.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GroupManager = () => {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [isEditing, setIsEditing] = useState<CommunityGroup | null>(null);
    const [isViewingMembers, setIsViewingMembers] = useState<CommunityGroup | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [groupForm, setGroupForm] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        const { data } = await supabase.from('community_groups').select('*').order('name');
        if (data) setGroups(data);
    };

    const fetchGroupMembers = async (groupId: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('group_memberships')
            .select('*, profiles(*)')
            .eq('group_id', groupId);
        
        if (data) setMembers(data);
        setIsLoading(false);
    };

    const handleSaveGroup = async () => {
        if (!groupForm.name) return alert("Group name is required");
        setIsLoading(true);
        let error;
        if (isEditing && isEditing.id) {
            const { error: err } = await supabase.from('community_groups').update(groupForm).eq('id', isEditing.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('community_groups').insert([groupForm]);
            error = err;
        }

        if (error) alert(error.message);
        else {
            fetchGroups();
            setIsEditing(null);
            setGroupForm({ name: '', description: '' });
        }
        setIsLoading(false);
    };

    const handleDeleteGroup = async (id: string) => {
        if (!confirm("Are you sure? This will delete the group and all its memberships.")) return;
        await supabase.from('community_groups').delete().eq('id', id);
        fetchGroups();
    };

    const handleMemberAction = async (memberId: string, action: 'Approve' | 'Decline' | 'Remove') => {
        if (!isViewingMembers) return;
        setIsLoading(true);

        let error;
        if (action === 'Approve') {
            const { error: err } = await supabase.from('group_memberships').update({ status: 'Approved' }).eq('id', memberId);
            error = err;
        } else {
            // Decline and Remove both involve deleting the membership row
            const { error: err } = await supabase.from('group_memberships').delete().eq('id', memberId);
            error = err;
        }

        if (error) alert(error.message);
        else fetchGroupMembers(isViewingMembers.id);
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border dark:border-slate-700">
                <h3 className="font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                    <MessageCircle size={20}/> Community Hub ({groups.length})
                </h3>
                <button 
                    onClick={() => { setIsEditing({ id: '', name: '', description: '', membersCount: 0, isMember: false }); setGroupForm({ name: '', description: '' }); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition shadow-lg shadow-blue-200 dark:shadow-none"
                >
                    <Plus size={16}/> Create Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(g => (
                    <div key={g.id} className="p-6 bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <Users size={24}/>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setIsEditing(g); setGroupForm({ name: g.name, description: g.description }); }} className="p-2 text-slate-400 hover:text-blue-600 transition"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteGroup(g.id)} className="p-2 text-slate-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <h4 className="font-black text-lg dark:text-white mb-2">{g.name}</h4>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{g.description}</p>
                        </div>

                        <button 
                            onClick={() => { setIsViewingMembers(g); fetchGroupMembers(g.id); }}
                            className="w-full bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Users size={14}/> Manage Members
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-700">
                        <div className="p-8">
                            <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-blue-600">
                                {isEditing.id ? 'Edit Group' : 'New Community Group'}
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Group Name</label>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none" 
                                        value={groupForm.name}
                                        onChange={e => setGroupForm({...groupForm, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                                    <textarea 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none h-32" 
                                        value={groupForm.description}
                                        onChange={e => setGroupForm({...groupForm, description: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={handleSaveGroup} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">Save Group</button>
                                    <button onClick={() => setIsEditing(null)} className="bg-slate-100 dark:bg-slate-700 text-slate-600 px-6 rounded-2xl font-black uppercase">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Members View Modal */}
            {isViewingMembers && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border dark:border-slate-700 h-[80vh] flex flex-col">
                        <div className="p-8 border-b dark:border-slate-700 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest text-blue-600">Member Management</h3>
                                <p className="text-xs text-slate-400 font-bold">{isViewingMembers.name}</p>
                            </div>
                            <button onClick={() => setIsViewingMembers(null)} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full hover:bg-slate-100"><X/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 font-bold">No members in this group yet.</div>
                            ) : (
                                members.map(m => (
                                    <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-between border dark:border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">
                                                {m.profiles?.first_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm dark:text-white">{m.profiles?.first_name} {m.profiles?.last_name}</p>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'Approved' ? 'text-green-500' : 'text-orange-500'}`}>
                                                    {m.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {m.status === 'Pending' ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleMemberAction(m.id, 'Approve')}
                                                        className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                                                        title="Approve Member"
                                                    >
                                                        <Check size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMemberAction(m.id, 'Decline')}
                                                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                                                        title="Decline Request"
                                                    >
                                                        <UserX size={18}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => handleMemberAction(m.id, 'Remove')}
                                                    className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-600 hover:text-white transition"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReelManager = () => <div className="p-10 text-center text-slate-400">Reel Management Module Active.</div>;

const EventManager = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<Event | null>(null);
    const [form, setForm] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        type: 'EVENT' as 'EVENT' | 'ANNOUNCEMENT',
        requires_rsvp: false,
        requires_transport: false
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (data) setEvents(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.date) return alert("Title and Date are required");
        setIsLoading(true);

        // Explicitly set payload to only include columns that exist in the database schema.
        // columns 'requires_rsvp' and 'requires_transport' are excluded to prevent schema errors.
        const payload = { 
            title: form.title,
            date: form.date,
            time: form.time,
            location: form.location,
            description: form.description,
            type: form.type
        };

        let error;
        if (isEditing && isEditing.id) {
            const { error: err } = await supabase.from('events').update(payload).eq('id', isEditing.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('events').insert([payload]);
            error = err;
        }

        if (error) {
            alert("Error saving: " + error.message);
        } else {
            setForm({
                title: '', date: '', time: '', location: '', description: '', 
                type: 'EVENT', requires_rsvp: false, requires_transport: false
            });
            setIsEditing(null);
            fetchEvents();
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this event/announcement?")) return;
        await supabase.from('events').delete().eq('id', id);
        fetchEvents();
    };

    const exportToExcel = () => {
        const headers = ["ID", "Title", "Type", "Date", "Time", "Location", "Description", "RSVP Required", "Transport Required"];
        const rows = events.map(e => [
            e.id, 
            e.title, 
            e.type, 
            e.date, 
            e.time, 
            e.location, 
            `"${e.description.replace(/"/g, '""')}"`,
            e.type === 'EVENT' ? 'Yes' : 'N/A',
            (e as any).requires_transport ? 'Yes' : 'N/A'
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ICC_Events_List_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl sticky top-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                                <Megaphone size={24}/>
                            </div>
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">
                                {isEditing ? 'Update Entry' : 'New Entry'}
                            </h3>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Type</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition font-bold"
                                    value={form.type}
                                    onChange={e => setForm({...form, type: e.target.value as any})}
                                >
                                    <option value="EVENT">🗓️ Church Event</option>
                                    <option value="ANNOUNCEMENT">📢 Announcement</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Title</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none" 
                                    placeholder="Enter title..." 
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date</label>
                                    <input 
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none" 
                                        value={form.date}
                                        onChange={e => setForm({...form, date: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px) font-black uppercase text-slate-400 ml-2">Time</label>
                                    <input 
                                        type="time"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none" 
                                        value={form.time}
                                        onChange={e => setForm({...form, time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-slate-400" size={18}/>
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 pl-12 rounded-2xl outline-none" 
                                        placeholder="Venue address..." 
                                        value={form.location}
                                        onChange={e => setForm({...form, location: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 p-4 rounded-2xl outline-none h-24" 
                                    placeholder="Detailed info..." 
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                />
                            </div>

                            {form.type === 'EVENT' && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="peer hidden"
                                                checked={form.requires_rsvp}
                                                onChange={e => setForm({...form, requires_rsvp: e.target.checked})}
                                            />
                                            <div className="w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Enable RSVP (Yes/No/Maybe)</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="peer hidden"
                                                checked={form.requires_transport}
                                                onChange={e => setForm({...form, requires_transport: e.target.checked})}
                                            />
                                            <div className="w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Require Transport Selection</span>
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                                    {isEditing ? 'Update Entry' : 'Publish Entry'}
                                </button>
                                {isEditing && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsEditing(null); setForm({title:'', date:'', time:'', location:'', description:'', type:'EVENT', requires_rsvp:false, requires_transport:false}); }} 
                                        className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl"
                                    >
                                        <X size={20}/>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <h3 className="font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ListMusic size={18}/> Scheduled Items ({events.length})
                        </h3>
                        <button 
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition shadow-lg"
                        >
                            <FileSpreadsheet size={16}/> Export List
                        </button>
                    </div>

                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="p-6 bg-white dark:bg-slate-800 rounded-[2.5rem] border-l-8 border-l-blue-600 dark:border-slate-700 border-t border-r border-b group hover:border-blue-500 transition-all flex justify-between items-start">
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${event.type === 'EVENT' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {event.type}
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                            <Calendar size={12}/> {formatDate(event.date)}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-black dark:text-white truncate">{event.title}</h4>
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1"><Clock size={14}/> {event.time || 'All Day'}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14}/> {event.location || 'Church Main Hall'}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 italic">{event.description}</p>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <button 
                                        onClick={() => {
                                            setIsEditing(event);
                                            setForm({
                                                title: event.title,
                                                date: event.date,
                                                time: event.time,
                                                location: event.location,
                                                description: event.description,
                                                type: event.type,
                                                requires_rsvp: (event as any).requires_rsvp || false,
                                                requires_transport: (event as any).requires_transport || false
                                            });
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-blue-600 rounded-2xl transition"
                                    >
                                        <Edit size={20}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(event.id)}
                                        className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-600 rounded-2xl transition"
                                    >
                                        <Trash2 size={20}/>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {events.length === 0 && (
                            <div className="p-20 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <Calendar size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">The Calendar is Clear</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};