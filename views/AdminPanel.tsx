import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Search, Music, MessageCircle, Bell, Activity, TrendingUp, Settings, Zap, Home, Clock, Loader2,
  Plus, X, Edit2, Trash2, Globe, Monitor, Upload, FileSpreadsheet, Check, Info, Film, Mic, Headphones,
  ImageIcon, Send, Save
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup, MusicTrack, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Logo } from '../components/Logo';

interface AdminPanelProps {
  onLogout: () => void;
}

// --- UTILS ---
const formatDateLong = (dateString?: string) => {
  if (!dateString) return 'Not set';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getYouTubeID = (url: string) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

// --- SUB-COMPONENTS ---

const DashboardView = ({ stats }: { stats: any }) => {
  const statCards = [
    { label: 'Total Members', value: stats.users, icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Blog Articles', value: stats.blogs, icon: FileText, color: 'bg-purple-500/10 text-purple-500' },
    { label: 'Sermon Archive', value: stats.sermons, icon: Video, color: 'bg-rose-500/10 text-rose-500' },
    { label: 'Live Events', value: stats.events, icon: Calendar, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Community Groups', value: stats.groups, icon: MessageCircle, color: 'bg-emerald-500/10 text-emerald-500' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[#1a304a]/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:bg-[#1a304a]/60 transition-all shadow-xl">
            <div className={`w-14 h-14 ${stat.color} rounded-[1.25rem] flex items-center justify-center mb-6 shadow-lg`}>
              <stat.icon size={28} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
            <h4 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a304a]/40 p-10 rounded-[3rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-blue-400" size={24} />
            <h4 className="font-black text-white uppercase tracking-tighter text-xl">System Overview</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-[#051121]/50 rounded-[2rem] border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Health</span>
              <span className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase"><Check size={16}/> Active</span>
            </div>
            <div className="flex items-center justify-between p-6 bg-[#051121]/50 rounded-[2rem] border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media Storage</span>
              <span className="text-xs font-black text-white">Cloud Integrated</span>
            </div>
            <div className="flex items-center justify-between p-6 bg-[#051121]/50 rounded-[2rem] border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Backup</span>
              <span className="text-xs font-black text-white">Today, 04:00 AM</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a304a]/40 p-10 rounded-[3rem] border border-white/5 shadow-xl flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3 self-start mb-8">
            <TrendingUp className="text-emerald-400" size={24} />
            <h4 className="font-black text-white uppercase tracking-tighter text-xl">Growth Status</h4>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
             <svg className="w-full h-full -rotate-90">
               <circle cx="96" cy="96" r="80" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
               <circle cx="96" cy="96" r="80" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="502" strokeDashoffset="120" strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-[#10b981]">+12%</span>
             </div>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Membership growth this month</p>
        </div>
      </div>
    </div>
  );
};

// --- BLOG MANAGEMENT ---
const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [publishMode, setPublishMode] = useState<'now' | 'scheduled'>('now');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setBlogs(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const postData = {
      title: editingBlog?.title,
      author: editingBlog?.author || 'Church Admin',
      category: editingBlog?.category || 'Sermon Devotional',
      content: editingBlog?.content,
      image_url: editingBlog?.image_url || '',
      video_url: editingBlog?.video_url || null,
      created_at: publishMode === 'now' ? new Date().toISOString() : editingBlog?.created_at
    };
    if (editingBlog?.id) await supabase.from('blog_posts').update(postData).eq('id', editingBlog.id);
    else await supabase.from('blog_posts').insert([postData]);
    setIsFormOpen(false);
    fetchBlogs();
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Blog Management</h3>
          <p className="text-slate-400 text-sm">Create, schedule and manage church articles.</p>
        </div>
        <button 
          onClick={() => { setEditingBlog({ title: '', content: '', author: 'Church Admin', category: 'Sermon Devotional' }); setIsFormOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18}/> New Article
        </button>
      </div>

      <div className="bg-[#1a304a]/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#051121]/50 border-b border-white/5">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Article</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Scheduled</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {blogs.map(blog => (
              <tr key={blog.id} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img src={blog.image_url} className="w-14 h-14 rounded-2xl object-cover bg-slate-800" alt="" />
                    <div>
                      <p className="font-black text-white leading-tight mb-1">{blog.title}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">By {blog.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full border border-blue-400/20">
                    {blog.category}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-slate-400 flex items-center gap-2 mt-4">
                  <Calendar size={14}/> {formatDateLong(blog.created_at)}
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingBlog(blog); setIsFormOpen(true); }} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"><Edit2 size={18}/></button>
                      <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('blog_posts').delete().eq('id', blog.id); fetchBlogs(); } }} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition"><Trash2 size={18}/></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-[#051121]/90 backdrop-blur-xl z-[120] flex items-center justify-center p-6">
          <div className="bg-[#1a304a] w-full max-w-4xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#051121]/50">
               <h4 className="text-xl font-black text-white uppercase tracking-tighter">{editingBlog?.id ? 'Edit Article' : 'Create New Article'}</h4>
               <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition"><X size={24} className="text-white"/></button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Article Title</label>
                  <input required value={editingBlog?.title || ''} onChange={e => setEditingBlog({...editingBlog, title: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl border-none outline-none font-bold text-sm" placeholder="Enter title..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                  <select value={editingBlog?.category} onChange={e => setEditingBlog({...editingBlog, category: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl border-none outline-none font-bold text-sm appearance-none">
                    <option>All Categories</option>
                    <option>Sermon Devotional</option>
                    <option>Psalm Devotional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Author Name</label>
                  <input value={editingBlog?.author || ''} onChange={e => setEditingBlog({...editingBlog, author: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl border-none outline-none font-bold text-sm" placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{editingBlog?.id ? 'Schedule Post' : 'Publishing Option'}</label>
                  {editingBlog?.id ? (
                     <div className="relative">
                       <input type="datetime-local" value={editingBlog?.created_at?.slice(0,16)} onChange={e => setEditingBlog({...editingBlog, created_at: new Date(e.target.value).toISOString()})} className="w-full bg-[#051121] text-white p-5 rounded-2xl border-none outline-none font-bold text-sm" />
                       <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                     </div>
                  ) : (
                    <div className="flex gap-2 p-1 bg-[#051121] rounded-2xl">
                      <button type="button" onClick={() => setPublishMode('now')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${publishMode === 'now' ? 'bg-[#1a304a] text-blue-400 border border-white/5' : 'text-slate-500'}`}><Zap size={14} className="inline mr-2"/> Publish Now</button>
                      <button type="button" onClick={() => setPublishMode('scheduled')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${publishMode === 'scheduled' ? 'bg-[#1a304a] text-blue-400 border border-white/5' : 'text-slate-500'}`}><Clock size={14} className="inline mr-2"/> Schedule</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Content Body</label>
                 <textarea required rows={8} value={editingBlog?.content || ''} onChange={e => setEditingBlog({...editingBlog, content: e.target.value})} className="w-full bg-[#051121] text-white p-6 rounded-[2rem] border-none outline-none font-medium leading-relaxed" placeholder="Share the word..." />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Featured Image</label>
                  <input placeholder="Image URL..." value={editingBlog?.image_url || ''} onChange={e => setEditingBlog({...editingBlog, image_url: e.target.value})} className="w-full bg-[#051121] text-white p-4 rounded-xl border-none outline-none text-xs" />
                  <div className="w-full p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition">
                     <ImageIcon size={32} className="text-slate-500"/>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload from PC</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Video Attachment (Optional)</label>
                  <input placeholder="YouTube URL..." value={editingBlog?.video_url || ''} onChange={e => setEditingBlog({...editingBlog, video_url: e.target.value})} className="w-full bg-[#051121] text-white p-4 rounded-xl border-none outline-none text-xs" />
                  <div className="w-full p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition">
                     <Video size={32} className="text-slate-500"/>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload from PC</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                 <button type="button" onClick={() => setIsFormOpen(false)} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition">Cancel</button>
                 <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : editingBlog?.id ? <Check size={18}/> : <Send size={18}/>}
                    {editingBlog?.id ? 'Update Post' : 'Publish Now'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SERMON MANAGEMENT (Screenshots 27, 28) ---
const SermonManager = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Partial<Sermon> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSermons(); }, []);
  const fetchSermons = async () => {
    const { data } = await supabase.from('sermons').select('*').order('date_preached', { ascending: false });
    setSermons(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingSermon?.id) await supabase.from('sermons').update(editingSermon).eq('id', editingSermon.id);
    else await supabase.from('sermons').insert([editingSermon]);
    setIsFormOpen(false);
    fetchSermons();
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Sermons</h3>
          <p className="text-slate-400 text-sm">Efficiently manage your platform content and users.</p>
        </div>
        <button 
          onClick={() => { setEditingSermon({ title: '', preacher: '', video_url: '', duration: '', date_preached: new Date().toISOString().split('T')[0] }); setIsFormOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18}/> New Sermon
        </button>
      </div>

      <div className="bg-[#1a304a]/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/5">
           <h4 className="text-xl font-black text-white uppercase tracking-tighter">Sermon Management</h4>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Upload YouTube sermons and manage previous records.</p>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#051121]/50 border-b border-white/5">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sermon</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Speaker</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sermons.map(s => {
              const ytId = getYouTubeID(s.video_url);
              return (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-12 bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-white/10">
                        {ytId && <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <p className="font-black text-white">{s.title}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">
                      {s.preacher.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-400">{formatDateLong(s.date_preached)}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setEditingSermon(s); setIsFormOpen(true); }} className="p-2.5 text-slate-400 hover:text-white rounded-xl transition"><Edit2 size={18}/></button>
                       <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('sermons').delete().eq('id', s.id); fetchSermons(); } }} className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl transition"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-[#051121]/90 backdrop-blur-xl z-[120] flex items-center justify-center p-6">
          <div className="bg-[#1a304a] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/10 animate-slide-up">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
               <h4 className="text-xl font-black text-white uppercase tracking-tighter">{editingSermon?.id ? 'Edit Sermon' : 'Add New Sermon'}</h4>
               <button onClick={() => setIsFormOpen(false)} className="text-white hover:bg-white/5 rounded-full p-2 transition"><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sermon Title</label>
                  <input required value={editingSermon?.title} onChange={e => setEditingSermon({...editingSermon, title: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" placeholder="The Power of Grace" />
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preacher</label>
                     <input required value={editingSermon?.preacher} onChange={e => setEditingSermon({...editingSermon, preacher: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" placeholder="Pastor John Smith" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date Preached</label>
                     <div className="relative">
                       <input type="date" required value={editingSermon?.date_preached} onChange={e => setEditingSermon({...editingSermon, date_preached: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" />
                       <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">YouTube URL</label>
                     <div className="relative">
                       <input required value={editingSermon?.video_url} onChange={e => setEditingSermon({...editingSermon, video_url: e.target.value})} className="w-full bg-[#051121] text-white p-5 pl-12 rounded-2xl outline-none font-bold text-sm" placeholder="https://youtube.com/watch?v=..." />
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Duration (E.G. 45:00)</label>
                     <div className="relative">
                       <input value={editingSermon?.duration} onChange={e => setEditingSermon({...editingSermon, duration: e.target.value})} className="w-full bg-[#051121] text-white p-5 pl-12 rounded-2xl outline-none font-bold text-sm" placeholder="HH:MM:SS" />
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                     </div>
                  </div>
               </div>
               <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 font-black uppercase text-xs px-10 py-4 transition hover:text-white">Cancel</button>
                  <button type="submit" disabled={loading} className="bg-[#0c2445] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 transition hover:bg-[#112a4a]">
                    <Save size={18}/> Save Sermon
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- EVENTS ---
const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);

  useEffect(() => { fetchEvents(); }, []);
  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    setEvents(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent?.id) await supabase.from('events').update(editingEvent).eq('id', editingEvent.id);
    else await supabase.from('events').insert([editingEvent]);
    setIsFormOpen(false);
    fetchEvents();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Events</h3>
          <p className="text-slate-400 text-sm">Efficiently manage church gatherings and announcements.</p>
        </div>
        <button 
          onClick={() => { setEditingEvent({ title: '', type: 'EVENT', date: new Date().toISOString().split('T')[0], time: '10:00' }); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
        >
          <Plus size={18}/> New Entry
        </button>
      </div>

      <div className="bg-[#1a304a]/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#051121]/50 border-b border-white/5">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Entry</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Type</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date/Time</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.map(ev => (
              <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6">
                   <p className="font-black text-white">{ev.title}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ICC</p>
                </td>
                <td className="px-8 py-6">
                   <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${ev.type === 'EVENT' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-orange-400/10 text-orange-400 border-orange-400/20'}`}>
                    {ev.type}
                   </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-400">{formatDateLong(ev.date)}</p>
                  <p className="text-[10px] font-black text-slate-500">{ev.time}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2.5 text-slate-400 hover:text-white rounded-xl"><Users size={18}/></button>
                    <button onClick={() => { setEditingEvent(ev); setIsFormOpen(true); }} className="p-2.5 text-slate-400 hover:text-white rounded-xl"><Edit2 size={18}/></button>
                    <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('events').delete().eq('id', ev.id); fetchEvents(); } }} className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-[#051121]/90 backdrop-blur-xl z-[120] flex items-center justify-center p-6">
          <div className="bg-[#1a304a] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/10 animate-slide-up">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
               <h4 className="text-xl font-black text-white uppercase tracking-tighter">Create Entry</h4>
               <button onClick={() => setIsFormOpen(false)} className="text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Title</label>
                  <input required value={editingEvent?.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" placeholder="Worship Night..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Type</label>
                  <select value={editingEvent?.type} onChange={e => setEditingEvent({...editingEvent, type: e.target.value as any})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm appearance-none">
                    <option value="EVENT">Event (Allows RSVPs)</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date</label>
                  <div className="relative">
                    <input type="date" value={editingEvent?.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Time</label>
                  <div className="relative">
                    <input type="time" value={editingEvent?.time} onChange={e => setEditingEvent({...editingEvent, time: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Location</label>
                   <input value={editingEvent?.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" placeholder="Main Hall" />
                </div>
                <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                   <textarea rows={4} value={editingEvent?.description} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} className="w-full bg-[#051121] text-white p-6 rounded-[2rem] outline-none font-medium" placeholder="Details about the event..." />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                 <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 font-black uppercase text-xs px-6">Cancel</button>
                 <button type="submit" className="bg-[#0c2445] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Save size={18}/> Publish Entry
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- GROUPS ---
const GroupManager = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  useEffect(() => { fetchGroups(); }, []);
  const fetchGroups = async () => {
    const { data } = await supabase.from('community_groups').select('*');
    setGroups(data || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('community_groups').insert([newGroup]);
    setIsFormOpen(false);
    fetchGroups();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Groups</h3>
          <p className="text-slate-400 text-sm">Efficiently manage your platform content and users.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
        >
          <Plus size={18}/> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map(g => (
          <div key={g.id} className="bg-[#1a304a]/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative group">
             <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button className="text-slate-500 hover:text-white"><Edit2 size={16}/></button>
                <button className="text-slate-500 hover:text-rose-500"><Trash2 size={16}/></button>
             </div>
             <h4 className="text-2xl font-black text-white mb-8">{g.name}</h4>
             <div className="flex justify-between items-center">
                <div className="px-5 py-2 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20 flex items-center gap-2">
                   <Users size={14}/> {g.membersCount || 0} Members
                </div>
                <button className="bg-[#0c2445] text-white px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg">Manage Members</button>
             </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-[#051121]/90 backdrop-blur-xl z-[120] flex items-center justify-center p-6">
          <div className="bg-[#1a304a] w-full max-w-xl rounded-[3rem] shadow-2xl border border-white/10 animate-slide-up">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
               <h4 className="text-xl font-black text-white uppercase tracking-tighter">New Community Group</h4>
               <button onClick={() => setIsFormOpen(false)} className="text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreate} className="p-10 space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Group Name</label>
                  <input required value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl border-2 border-blue-600/50 outline-none font-bold text-sm" placeholder="Youth Ministry..." />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                  <textarea rows={4} value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} className="w-full bg-[#051121] text-white p-6 rounded-[2rem] outline-none font-medium" placeholder="Tell us about this community..." />
               </div>
               <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 font-black uppercase text-xs px-6">Cancel</button>
                  <button type="submit" className="bg-[#0c2445] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Save size={18}/> Create Group
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MEDIA HUB ---
const MediaManager = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Partial<MusicTrack> | null>(null);

  useEffect(() => { fetchTracks(); }, []);
  const fetchTracks = async () => {
    const { data } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
    setTracks(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrack?.id) await supabase.from('music_tracks').update(editingTrack).eq('id', editingTrack.id);
    else await supabase.from('music_tracks').insert([editingTrack]);
    setIsFormOpen(false);
    fetchTracks();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Media Hub</h3>
          <p className="text-slate-400 text-sm">Manage church music, worship tracks, and podcasts.</p>
        </div>
        <button 
          onClick={() => { setEditingTrack({ title: '', artist: 'ICC Worship Team', type: 'MUSIC', duration: '05:30' }); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
        >
          <Plus size={18}/> Add Media
        </button>
      </div>

      <div className="bg-[#1a304a]/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#051121]/50 border-b border-white/5">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Media</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Artist</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Type</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tracks.map(track => (
              <tr key={track.id} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center">
                        {track.type === 'MUSIC' ? <Music size={24}/> : <Mic size={24}/>}
                      </div>
                      <p className="font-black text-white">{track.title}</p>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <span className="text-[10px] font-black uppercase text-slate-500">{track.artist}</span>
                </td>
                <td className="px-8 py-6">
                   <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-full border bg-blue-400/10 text-blue-400 border-blue-400/20">
                    {track.type}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingTrack(track); setIsFormOpen(true); }} className="p-2.5 text-slate-400 hover:text-white rounded-xl"><Edit2 size={18}/></button>
                    <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('music_tracks').delete().eq('id', track.id); fetchTracks(); } }} className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-[#051121]/90 backdrop-blur-xl z-[120] flex items-center justify-center p-6">
          <div className="bg-[#1a304a] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/10 animate-slide-up">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
               <h4 className="text-xl font-black text-white uppercase tracking-tighter">Add New Media</h4>
               <button onClick={() => setIsFormOpen(false)} className="text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Track Title</label>
                     <input required value={editingTrack?.title} onChange={e => setEditingTrack({...editingTrack, title: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" placeholder="Worship Session #1" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Artist / Speaker</label>
                     <input required value={editingTrack?.artist} onChange={e => setEditingTrack({...editingTrack, artist: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" placeholder="ICC Worship Team" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Type</label>
                     <select value={editingTrack?.type} onChange={e => setEditingTrack({...editingTrack, type: e.target.value as any})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm appearance-none">
                        <option value="MUSIC">Music / Worship</option>
                        <option value="PODCAST">Podcast / Talk</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Duration (e.g. 05:30)</label>
                     <input value={editingTrack?.duration} onChange={e => setEditingTrack({...editingTrack, duration: e.target.value})} className="w-full bg-[#051121] text-white p-5 rounded-2xl outline-none font-bold text-sm" placeholder="MM:SS" />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Source Selection</label>
                  <div className="flex gap-2 p-1 bg-[#051121] rounded-2xl w-fit">
                    <button type="button" className="flex items-center gap-2 px-6 py-3 bg-[#1a304a] text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5"><Monitor size={14}/> From PC</button>
                    <button type="button" className="flex items-center gap-2 px-6 py-3 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest"><Globe size={14}/> YouTube / URL</button>
                  </div>
                  <div className="w-full p-12 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition cursor-pointer">
                     <Upload size={40} className="text-slate-500"/>
                     <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Choose Media File</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">Audio (MP3, WAV) or Video (MP4)</p>
                     </div>
                  </div>
               </div>
               <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 font-black uppercase text-xs px-6">Cancel</button>
                  <button type="submit" className="bg-[#0c2445] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Save size={18}/> Save Media
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- USERS ---
const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if(data) setUsers(data.map(d => ({
      id: d.id, firstName: d.first_name, lastName: d.last_name, email: d.email, role: d.role as UserRole, joinedDate: d.created_at
    } as User)));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Users</h3>
        <p className="text-slate-400 text-sm">Efficiently manage your platform content and users.</p>
      </div>

      <div className="bg-[#1a304a]/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#051121]/50 border-b border-white/5">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Role</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Joined</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6">
                   <p className="font-black text-white">{u.firstName} {u.lastName}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{u.email}</p>
                </td>
                <td className="px-8 py-6">
                   <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${u.role === 'ADMIN' ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' : 'bg-blue-400/10 text-blue-400 border-blue-400/20'}`}>
                    {u.role}
                   </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-400">{new Date(u.joinedDate).toLocaleDateString('en-GB')}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2.5 text-slate-400 hover:text-white rounded-xl"><Edit2 size={18}/></button>
                    <button className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN PANEL ---
export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'blogs' | 'sermons' | 'events' | 'groups' | 'media'>('dashboard');
  const [stats, setStats] = useState({ users: 0, blogs: 0, sermons: 0, events: 0, groups: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [u, b, s, e, g] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('sermons').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('community_groups').select('*', { count: 'exact', head: true })
      ]);
      setStats({ users: u.count || 0, blogs: b.count || 0, sermons: s.count || 0, events: e.count || 0, groups: g.count || 0 });
    };
    fetchStats();
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'blogs', icon: FileText, label: 'Blog Posts' },
    { id: 'sermons', icon: Video, label: 'Sermons' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'groups', icon: Users, label: 'Groups' },
    { id: 'media', icon: Music, label: 'Media / Music' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView stats={stats} />;
      case 'users': return <UserManager />;
      case 'blogs': return <BlogManager />;
      case 'sermons': return <SermonManager />;
      case 'events': return <EventManager />;
      case 'groups': return <GroupManager />;
      case 'media': return <MediaManager />;
      default: return <DashboardView stats={stats} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#051121] font-sans overflow-hidden">
      {/* Sidebar (Screenshot 18/20/22/24) */}
      <div className="w-80 bg-[#051121] text-white p-12 flex flex-col border-r border-white/5 shadow-2xl z-50 overflow-y-auto no-scrollbar">
        <div className="mb-14 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl border border-white/10">
            AD
          </div>
          <h1 className="font-black text-[22px] tracking-tighter leading-none">ADMIN PANEL</h1>
        </div>

        <nav className="flex-1 space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[1.5rem] transition-all duration-300 relative group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-bold text-[15px]">{item.label}</span>
                {isActive && (
                   <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-8 mt-12 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-[15px]"
          >
            <LogOut size={22} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-16 scroll-smooth bg-[#051121] no-scrollbar">
         {renderContent()}
      </div>
    </div>
  );
};