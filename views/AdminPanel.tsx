
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen, Bell, Upload, RefreshCw, Play
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

  useEffect(() => {
    const fetchStats = async () => {
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

  const cards = [
    { label: 'Total Members', value: stats.members, icon: Users, color: 'bg-blue-500', id: 'members' },
    { label: 'Published Blogs', value: stats.blogs, icon: FileText, color: 'bg-green-500', id: 'content' },
    { label: 'Sermons', value: stats.sermons, icon: Video, color: 'bg-purple-500', id: 'media' },
    { label: 'Upcoming Events', value: stats.events, icon: Calendar, color: 'bg-orange-500', id: 'events' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
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
          firstName: p.first_name,
          lastName: p.last_name,
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
       alert("Error updating member: " + error.message);
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
     const blogData = {
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        image_url: formData.image,
        video_url: formData.video,
        author: 'Admin' // Should be current user
     };

     let error;
     if(isEditing) {
        const res = await supabase.from('blog_posts').update(blogData).eq('id', formData.id);
        error = res.error;
     } else {
        const res = await supabase.from('blog_posts').insert([blogData]);
        error = res.error;
     }

     if(!error) {
        alert(isEditing ? 'Blog Updated' : 'Blog Posted');
        setFormData({ id: '', title: '', category: 'Faith', excerpt: '', content: '', image: '', video: '' });
        setIsEditing(false);
        fetchBlogs();
     } else {
        alert("Error: " + JSON.stringify(error));
     }
  };

  const handleDelete = async (id: string) => {
     if(confirm("Delete post?")) {
        await supabase.from('blog_posts').delete().eq('id', id);
        fetchBlogs();
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
             <input className="w-full border p-3 rounded-xl" placeholder="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
             <input className="w-full border p-3 rounded-xl" placeholder="Video URL (Optional)" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} />
             <textarea className="w-full border p-3 rounded-xl h-20" placeholder="Short Excerpt" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
             <textarea className="w-full border p-3 rounded-xl h-40" placeholder="Full Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
             <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{isEditing ? 'Update' : 'Publish'}</button>
             {isEditing && <button onClick={() => {setIsEditing(false); setFormData({ id: '', title: '', category: 'Faith', excerpt: '', content: '', image: '', video: '' })}} className="w-full bg-slate-100 mt-2 py-2 rounded-xl text-xs font-bold">Cancel</button>}
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

  const handleSave = async () => {
     // Extract YouTube Thumbnail
     let thumbnail = '';
     const vidMatch = formData.video.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([^"&?\/\s]{11})/);
     if(vidMatch) thumbnail = `https://img.youtube.com/vi/${vidMatch[1]}/hqdefault.jpg`;

     const { error } = await supabase.from('sermons').insert([{
        title: formData.title,
        preacher: formData.preacher,
        date_preached: formData.date,
        duration: formData.duration,
        video_url: formData.video,
        thumbnail_url: thumbnail
     }]);

     if(!error) {
        alert('Sermon Added');
        setFormData({ id: '', title: '', preacher: 'Pastor David', date: '', duration: '', video: '' });
        fetchSermons();
     } else {
        alert(error.message);
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
          <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Upload Sermon</h3>
          <div className="space-y-4">
             <input className="w-full border p-3 rounded-xl" placeholder="Sermon Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             <input className="w-full border p-3 rounded-xl" placeholder="Preacher Name" value={formData.preacher} onChange={e => setFormData({...formData, preacher: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
                <input type="date" className="border p-3 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <input className="border p-3 rounded-xl" placeholder="Duration (e.g. 45:00)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
             </div>
             <input className="w-full border p-3 rounded-xl" placeholder="YouTube URL" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} />
             <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Add Sermon</button>
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
                    <button onClick={async () => { if(confirm("Delete?")) { await supabase.from('sermons').delete().eq('id', s.id); fetchSermons(); }}} className="text-red-500"><Trash2 size={16}/></button>
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
        // Fetch logic would go here if 'music_tracks' table exists
    }, []);

    const handleSave = async () => {
        alert("Music upload functionality requires 'music_tracks' table in Supabase.");
        // const { error } = await supabase.from('music_tracks').insert([formData]);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl">
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
        else alert(error.message);
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

// 7. EVENT MANAGER (Fixed)
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
           image_url: formData.image,
           video_url: formData.video
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
        console.error("Event Error:", JSON.stringify(error, null, 2));
        alert(`Error saving event: ${error.message}`);
     }
  };

  const handleDelete = async (id: string) => {
     if(confirm("Are you sure you want to delete this event?")) {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if(!error) fetchEvents();
        else alert(`Error deleting event: ${error.message}`);
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

     if (error) alert("Failed to send notification: " + error.message);
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

// 8. GROUP MANAGER (Fixed)
const GroupManager = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [formData, setFormData] = useState({ id: '', name: '', desc: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
     fetchGroups();
  }, []);

  const fetchGroups = async () => {
     const { data } = await supabase.from('community_groups').select('*');
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
        image_url: formData.image
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
        console.error("Group Error:", JSON.stringify(error, null, 2));
        alert(`Error saving group: ${error.message}`);
     }
  };

  const handleDelete = async (id: string) => {
     if(confirm("Delete this group?")) {
        const { error } = await supabase.from('community_groups').delete().eq('id', id);
        if(!error) fetchGroups();
        else alert(`Error deleting group: ${error.message}`);
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
