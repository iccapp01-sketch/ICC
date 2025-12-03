
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, BookOpen 
} from 'lucide-react';
import { BlogPost, User, Sermon, UserRole, Event } from '../types';
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

// --- SUB-COMPONENTS ---

// 1. MEMBERS MANAGER
const MembersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (data) {
      setUsers(data.map((u: any) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phone: u.phone,
        dob: u.dob,
        role: u.role as UserRole,
        joinedDate: new Date(u.created_at).toLocaleDateString()
      })));
    }
    setLoading(false);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: editingUser.firstName,
        last_name: editingUser.lastName,
        role: editingUser.role,
        phone: editingUser.phone
      })
      .eq('id', editingUser.id);

    if (!error) {
      alert('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } else {
      alert('Error updating user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-2xl text-slate-800">Member Management</h2>
          <p className="text-slate-500 text-sm">Manage users, roles, and profiles</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
           <input 
             placeholder="Search members..." 
             className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {loading ? <p>Loading users...</p> : (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
         <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
             <tr>
               <th className="p-4">Member</th>
               <th className="p-4">Contact</th>
               <th className="p-4">Role</th>
               <th className="p-4">Status</th>
               <th className="p-4 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredUsers.map(user => (
               <tr key={user.id} className="hover:bg-slate-50 transition">
                 <td className="p-4">
                    <div className="font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-slate-400">Joined: {user.joinedDate}</div>
                 </td>
                 <td className="p-4 text-slate-600">
                    <div>{user.email}</div>
                    <div className="text-xs text-slate-400 font-bold text-blue-600">{user.phone || 'No phone'}</div>
                 </td>
                 <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'MODERATOR' ? 'bg-orange-100 text-orange-700' :
                      user.role === 'AUTHOR' ? 'bg-green-100 text-green-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                 </td>
                 <td className="p-4">
                    <span className="text-green-600 font-bold text-xs flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full w-fit">
                      <Check size={12}/> Active
                    </span>
                 </td>
                 <td className="p-4 text-right">
                    <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                       <Edit size={18}/>
                    </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg">Edit Member</h3>
                 <button onClick={() => setEditingUser(null)}><X size={24} className="text-slate-400 hover:text-slate-900"/></button>
              </div>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">First Name</label>
                       <input 
                         className="w-full border p-2 rounded-lg" 
                         value={editingUser.firstName} 
                         onChange={e => setEditingUser({...editingUser, firstName: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Last Name</label>
                       <input 
                         className="w-full border p-2 rounded-lg" 
                         value={editingUser.lastName} 
                         onChange={e => setEditingUser({...editingUser, lastName: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Role</label>
                    <select 
                      className="w-full border p-2 rounded-lg bg-white"
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                    >
                       <option value="MEMBER">Member</option>
                       <option value="MODERATOR">Moderator</option>
                       <option value="AUTHOR">Author</option>
                       <option value="ADMIN">Admin</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                    <input 
                      className="w-full border p-2 rounded-lg" 
                      value={editingUser.phone} 
                      onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                    />
                 </div>

                 <button onClick={handleSaveUser} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 transition">
                    Save Changes
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// 7. CONTENT MANAGER (BLOG DB)
const ContentManager = () => {
  const [formData, setFormData] = useState({ title: '', content: '', excerpt: '', image: '', category: 'Faith' });
  
  const handlePublish = async () => {
    const { error } = await supabase.from('blog_posts').insert([{
       title: formData.title,
       content: formData.content,
       excerpt: formData.excerpt,
       image_url: formData.image,
       category: formData.category,
       author: 'Admin'
    }]);

    if (!error) {
      alert('Blog Published!');
      setFormData({ title: '', content: '', excerpt: '', image: '', category: 'Faith' });
    } else {
      console.error("Blog Error:", error);
      alert('Error publishing blog. Check console.');
    }
  };

  return (
  <div className="space-y-6">
     <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Create New Blog Post</h3>
        <div className="space-y-4">
           <input className="w-full border p-3 rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
           <div className="flex gap-4">
              <input className="w-full border p-3 rounded-xl" placeholder="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <select className="border p-3 rounded-xl bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                 <option>Faith</option>
                 <option>Testimony</option>
                 <option>Teaching</option>
                 <option>Devotional</option>
              </select>
           </div>
           <textarea className="w-full border p-3 rounded-xl h-20" placeholder="Short Excerpt" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
           <textarea className="w-full border p-3 rounded-xl h-48" placeholder="Full Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
           <button onClick={handlePublish} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">Publish Post</button>
        </div>
     </div>
  </div>
)};

// 8. SERMON MANAGER
const SermonManager = () => {
  const [formData, setFormData] = useState({ title: '', preacher: '', date: '', duration: '', video: '' });

  const handlePublish = async () => {
    const { error } = await supabase.from('sermons').insert([{
       title: formData.title,
       preacher: formData.preacher,
       date_preached: formData.date,
       duration: formData.duration,
       video_url: formData.video
    }]);
    if (!error) {
       alert('Sermon Uploaded!');
       setFormData({ title: '', preacher: '', date: '', duration: '', video: '' });
    }
  };

  return (
  <div className="bg-white p-6 rounded-2xl border border-slate-200">
     <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Upload New Sermon</h3>
     <div className="space-y-4">
        <input className="w-full border p-3 rounded-xl" placeholder="Sermon Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
           <input className="w-full border p-3 rounded-xl" placeholder="Preacher Name" value={formData.preacher} onChange={e => setFormData({...formData, preacher: e.target.value})} />
           <input className="w-full border p-3 rounded-xl" placeholder="Duration (e.g. 45:20)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <input className="w-full border p-3 rounded-xl" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            <input className="w-full border p-3 rounded-xl" placeholder="YouTube Video ID or URL" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} />
        </div>
        <button onClick={handlePublish} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Publish Sermon</button>
     </div>
  </div>
)};

// 5. EVENT MANAGER
const EventManager = () => {
  const [formData, setFormData] = useState({ title: '', desc: '', date: '', time: '', loc: '', type: 'EVENT' });

  const handlePublish = async () => {
     const { error } = await supabase.from('events').insert([{
        title: formData.title,
        description: formData.desc,
        date: formData.date,
        time: formData.time,
        location: formData.loc,
        type: formData.type
     }]);
     if (!error) {
        alert('Event Created!');
        setFormData({ title: '', desc: '', date: '', time: '', loc: '', type: 'EVENT' });
     }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
       <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Create Event or Announcement</h3>
       <div className="space-y-4">
          <div className="flex gap-4">
             <input className="flex-1 border p-3 rounded-xl" placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             <select className="border p-3 rounded-xl bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="EVENT">Event</option>
                <option value="ANNOUNCEMENT">Announcement</option>
             </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <input type="date" className="border p-3 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
             <input type="time" className="border p-3 rounded-xl" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
          <input className="w-full border p-3 rounded-xl" placeholder="Location" value={formData.loc} onChange={e => setFormData({...formData, loc: e.target.value})} />
          <textarea className="w-full border p-3 rounded-xl h-24" placeholder="Description" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
          <button onClick={handlePublish} className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold hover:bg-blue-700 transition">Publish</button>
       </div>
    </div>
  );
}

// 9. MUSIC MANAGER (NEW)
const MusicManager = () => {
  const [formData, setFormData] = useState({ title: '', artist: '', url: '', type: 'MUSIC' });
  // In real app, you would use supabase storage to upload files. Here we mock URL input.
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Upload Music or Podcast</h3>
      <div className="space-y-4">
         <input className="w-full border p-3 rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
         <input className="w-full border p-3 rounded-xl" placeholder="Artist / Speaker" value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} />
         <select className="w-full border p-3 rounded-xl bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="MUSIC">Music</option>
            <option value="PODCAST">Podcast</option>
         </select>
         <input className="w-full border p-3 rounded-xl" placeholder="File URL (MP3)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
         <button onClick={() => alert("Simulated Upload")} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition">Upload Track</button>
      </div>
    </div>
  )
}

// 10. GROUP MANAGER (NEW)
const GroupManager = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
       <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Manage Community Groups</h3>
       <div className="space-y-4">
          <input className="w-full border p-3 rounded-xl" placeholder="Group Name" />
          <textarea className="w-full border p-3 rounded-xl" placeholder="Description" />
          <button onClick={() => alert("Group Created")} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Create Group</button>
       </div>
    </div>
  )
}

// 11. BIBLE MANAGER (NEW)
const BibleManager = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="font-bold text-lg mb-4 text-[#0c2d58]">Upload Reading Plan</h3>
      <textarea className="w-full border p-3 rounded-xl h-48" placeholder="Paste reading plan text here..." />
      <button onClick={() => alert("Plan Uploaded")} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4">Upload Plan</button>
    </div>
  )
}

const Overview = ({ onNavigate }: { onNavigate: (v: string) => void }) => (
  <div className="space-y-6">
    <h2 className="font-bold text-2xl text-[#0c2d58]">Overview</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('members')}>
         <Users className="text-blue-500 mb-2" size={32} />
         <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Members</p>
         <p className="text-xl font-bold text-slate-900">Manage</p>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('media')}>
         <Video className="text-purple-500 mb-2" size={32} />
         <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Sermons</p>
         <p className="text-xl font-bold text-slate-900">Upload</p>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('content')}>
         <FileText className="text-green-500 mb-2" size={32} />
         <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Blog</p>
         <p className="text-xl font-bold text-slate-900">Post</p>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition" onClick={() => onNavigate('events')}>
         <Calendar className="text-orange-500 mb-2" size={32} />
         <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Events</p>
         <p className="text-xl font-bold text-slate-900">Create</p>
       </div>
    </div>
  </div>
);
