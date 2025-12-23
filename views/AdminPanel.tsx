import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, Bell, Upload, Play, Loader2, ListMusic, Plus, Megaphone, MapPin, FileSpreadsheet, AlertTriangle, UserX, Film, Camera, Image as ImageIcon, Globe, Headphones, Mic, Volume2
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelProps {
  onLogout: () => void;
}

// --- SUB-COMPONENTS ---

const GroupManager = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    const { data } = await supabase.from('community_groups').select('*');
    setGroups(data || []);
    setLoading(false);
  };

  const fetchGroupMembers = async (groupId: string) => {
    const { data } = await supabase
      .from('community_group_members')
      .select('*, profiles(first_name, last_name, email)')
      .eq('group_id', groupId);
    setMembers(data || []);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleMemberAction = async (userId: string, groupId: string, action: 'Approve' | 'Decline' | 'Remove') => {
    let error;
    if (action === 'Approve') {
      const { error: err } = await supabase.from('community_group_members')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .eq('group_id', groupId);
      error = err;
    } else {
      const { error: err } = await supabase.from('community_group_members')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', groupId);
      error = err;
    }

    if (error) {
      alert("Membership action failed: " + error.message);
    } else {
      fetchGroupMembers(groupId);
      fetchGroups();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Community Groups</h3>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={16}/> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(g => (
          <div key={g.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="font-black dark:text-white text-lg mb-1">{g.name}</h4>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{g.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                {g.membersCount || 0} Members
              </span>
              <button 
                onClick={() => { setSelectedGroup(g.id); fetchGroupMembers(g.id); setShowMembers(true); }}
                className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Users size={14}/> Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {showMembers && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
              <h4 className="font-black dark:text-white uppercase tracking-tighter">Group Members</h4>
              <button onClick={() => setShowMembers(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {members.length === 0 ? (
                <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No members found</p>
              ) : members.map(m => (
                <div key={m.user_id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {m.profiles?.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{m.profiles?.first_name} {m.profiles?.last_name}</p>
                      <p className={`text-[10px] font-black uppercase ${m.status === 'pending' ? 'text-orange-500' : 'text-green-600'}`}>
                        {m.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {m.status === 'pending' ? (
                      <>
                        <button onClick={() => handleMemberAction(m.user_id, m.group_id, 'Approve')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"><Check size={16}/></button>
                        <button onClick={() => handleMemberAction(m.user_id, m.group_id, 'Decline')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"><X size={16}/></button>
                      </>
                    ) : (
                      <button onClick={() => handleMemberAction(m.user_id, m.group_id, 'Remove')} className="p-2 text-slate-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
                    )}
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

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'blogs' | 'sermons' | 'events' | 'groups'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      if (data) {
        setUsers(data.map((d: any) => ({
          id: d.id,
          firstName: d.first_name,
          lastName: d.last_name,
          email: d.email,
          phone: d.phone,
          dob: d.dob,
          role: d.role,
          joinedDate: d.created_at
        })));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'blogs', icon: FileText, label: 'Blog Posts' },
    { id: 'sermons', icon: Video, label: 'Sermons' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'groups', icon: Users, label: 'Groups' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">AD</div>
          <h1 className="font-black text-xl tracking-tighter">ADMIN PANEL</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{activeTab}</h2>
            <p className="text-slate-500 text-sm">Efficiently manage your platform content and users.</p>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : activeTab === 'groups' ? (
          <GroupManager />
        ) : activeTab === 'users' ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">User</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm dark:text-white">{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(u.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16}/></button>
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-fade-in">
             <AlertTriangle size={48} className="mb-4 opacity-20"/>
             <p className="font-black uppercase tracking-widest text-xs">Section under construction</p>
          </div>
        )}
      </div>
    </div>
  );
};
