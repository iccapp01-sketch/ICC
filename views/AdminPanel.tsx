import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Calendar, Video, LogOut, 
  Edit, Check, X, Search, Save, Trash2, Music, MessageCircle, Bell, Upload, Play, Loader2, ListMusic, Plus, Megaphone, MapPin, FileSpreadsheet, AlertTriangle, UserX, Film, Camera, Image as ImageIcon, Globe, Headphones, Mic, Volume2, Clock, Download
} from 'lucide-react';
import { BlogPost, User, Sermon, Event, CommunityGroup } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelProps {
  onLogout: () => void;
}

// --- UTILS ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const formatDate = (dateString?: string) => {
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

const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [showRSVPs, setShowRSVPs] = useState(false);
  const [currentEventRSVPs, setCurrentEventRSVPs] = useState<any[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent?.date) return alert("Title and Date are required.");

    setLoading(true);
    const eventData = {
      title: editingEvent.title,
      description: editingEvent.description || '',
      date: editingEvent.date,
      time: editingEvent.time || '00:00',
      location: editingEvent.location || 'Church Main Hall',
      type: editingEvent.type || 'EVENT'
    };

    try {
      if (editingEvent.id) {
        await supabase.from('events').update(eventData).eq('id', editingEvent.id);
      } else {
        await supabase.from('events').insert([eventData]);
      }
      setIsFormOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert("Error saving event: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event/announcement?")) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  const fetchRSVPs = async (eventId: string) => {
    setRsvpLoading(true);
    setShowRSVPs(true);
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('*, profiles(first_name, last_name, email)')
      .eq('event_id', eventId);
    
    if (error) console.error("RSVP Fetch error:", error);
    setCurrentEventRSVPs(data || []);
    setRsvpLoading(false);
  };

  const exportToCSV = (eventName: string) => {
    if (currentEventRSVPs.length === 0) return alert("No data to export.");
    
    const headers = ["First Name", "Last Name", "Email", "Status", "Transport Required"];
    const rows = currentEventRSVPs.map(r => [
      r.profiles?.first_name,
      r.profiles?.last_name,
      r.profiles?.email,
      r.status,
      r.transport_required ? "Yes" : "No"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `RSVPs_${eventName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Event & Announcement Hub</h3>
          <p className="text-sm text-slate-500">Schedule church gatherings and broadcast announcements.</p>
        </div>
        <button 
          onClick={() => { setEditingEvent({ type: 'EVENT', date: new Date().toISOString().split('T')[0] }); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18}/> New Entry
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border dark:border-slate-700">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-black dark:text-white uppercase tracking-tighter">{editingEvent?.id ? 'Edit Entry' : 'Create Entry'}</h4>
              <button onClick={() => { setIsFormOpen(false); setEditingEvent(null); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Title</label>
                  <input 
                    required
                    value={editingEvent?.title || ''}
                    onChange={e => setEditingEvent(prev => ({...prev, title: e.target.value}))}
                    placeholder="Worship Night..." 
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Type</label>
                  <select 
                    value={editingEvent?.type || 'EVENT'}
                    onChange={e => setEditingEvent(prev => ({...prev, type: e.target.value as any}))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none"
                  >
                    <option value="EVENT">Event (Allows RSVPs)</option>
                    <option value="ANNOUNCEMENT">Announcement Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Date</label>
                  <input 
                    type="date"
                    required
                    value={editingEvent?.date || ''}
                    onChange={e => setEditingEvent(prev => ({...prev, date: e.target.value}))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Time</label>
                  <input 
                    type="time"
                    value={editingEvent?.time || ''}
                    onChange={e => setEditingEvent(prev => ({...prev, time: e.target.value}))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Location</label>
                  <input 
                    value={editingEvent?.location || ''}
                    onChange={e => setEditingEvent(prev => ({...prev, location: e.target.value}))}
                    placeholder="Main Hall"
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
                <textarea 
                  rows={4}
                  value={editingEvent?.description || ''}
                  onChange={e => setEditingEvent(prev => ({...prev, description: e.target.value}))}
                  placeholder="Details about the event..." 
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="pt-6 border-t dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingEvent(null); }} className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#0c2d58] text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
                  {editingEvent?.id ? 'Update Entry' : 'Publish Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRSVPs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
              <div>
                <h4 className="font-black dark:text-white uppercase tracking-tighter">RSVP Management</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Guest list and logistics tracking</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => exportToCSV(events.find(e => e.id === currentEventRSVPs[0]?.event_id)?.title || 'Event')} 
                  className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <FileSpreadsheet size={16}/> Export CSV
                </button>
                <button onClick={() => setShowRSVPs(false)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"><X size={20}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {rsvpLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-blue-600"/></div>
              ) : currentEventRSVPs.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs border-2 border-dashed rounded-[2rem] border-slate-200">No RSVPs collected for this event yet</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b dark:border-slate-700">
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Transport</th>
                      <th className="px-4 py-3">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {currentEventRSVPs.map(r => (
                      <tr key={r.id} className="text-sm dark:text-white">
                        <td className="px-4 py-4 font-bold">{r.profiles?.first_name} {r.profiles?.last_name}</td>
                        <td className="px-4 py-4">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${r.status === 'Yes' ? 'bg-green-100 text-green-600' : r.status === 'Maybe' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                             {r.status}
                           </span>
                        </td>
                        <td className="px-4 py-4">
                          {r.transport_required ? (
                            <span className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase"><MapPin size={12}/> Required</span>
                          ) : (
                            <span className="text-slate-400 font-black text-[10px] uppercase">Not Needed</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500">{r.profiles?.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {events.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
            <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No scheduled entries</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Entry</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date/Time</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-black text-sm dark:text-white leading-tight">{event.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{event.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${event.type === 'EVENT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{formatDate(event.date)}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{event.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {event.type === 'EVENT' && (
                          <button onClick={() => fetchRSVPs(event.id)} className="p-2 text-slate-400 hover:text-green-600 transition-colors" title="View RSVPs"><Users size={16}/></button>
                        )}
                        <button onClick={() => { setEditingEvent(event); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(event.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SermonManager = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Partial<Sermon> | null>(null);

  const fetchSermons = async () => {
    setLoading(true);
    const { data } = await supabase.from('sermons').select('*').order('date_preached', { ascending: false });
    setSermons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSermons(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSermon?.title || !editingSermon?.video_url) return alert("Title and Video URL are required.");

    setLoading(true);
    const sermonData = {
      title: editingSermon.title,
      preacher: editingSermon.preacher || 'Guest Speaker',
      video_url: editingSermon.video_url,
      duration: editingSermon.duration || '00:00',
      date_preached: editingSermon.date_preached || new Date().toISOString().split('T')[0]
    };

    try {
      if (editingSermon.id) {
        const { error } = await supabase.from('sermons').update(sermonData).eq('id', editingSermon.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sermons').insert([sermonData]);
        if (error) throw error;
      }
      setIsFormOpen(false);
      setEditingSermon(null);
      fetchSermons();
    } catch (err: any) {
      alert("Error saving sermon: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sermon?")) return;
    try {
      const { error } = await supabase.from('sermons').delete().eq('id', id);
      if (error) throw error;
      fetchSermons();
    } catch (err: any) {
      alert("Error deleting sermon: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Sermon Management</h3>
          <p className="text-sm text-slate-500">Upload YouTube sermons and manage previous records.</p>
        </div>
        <button 
          onClick={() => { setEditingSermon({ date_preached: new Date().toISOString().split('T')[0] }); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18}/> New Sermon
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border dark:border-slate-700">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-black dark:text-white uppercase tracking-tighter">{editingSermon?.id ? 'Edit Sermon' : 'Add New Sermon'}</h4>
              <button onClick={() => { setIsFormOpen(false); setEditingSermon(null); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sermon Title</label>
                <input 
                  required
                  value={editingSermon?.title || ''}
                  onChange={e => setEditingSermon(prev => ({...prev, title: e.target.value}))}
                  placeholder="The Power of Grace" 
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Preacher</label>
                  <input 
                    value={editingSermon?.preacher || ''}
                    onChange={e => setEditingSermon(prev => ({...prev, preacher: e.target.value}))}
                    placeholder="Pastor John Smith"
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Date Preached</label>
                  <input 
                    type="date"
                    value={editingSermon?.date_preached || ''}
                    onChange={e => setEditingSermon(prev => ({...prev, date_preached: e.target.value}))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">YouTube URL</label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required
                      value={editingSermon?.video_url || ''}
                      onChange={e => setEditingSermon(prev => ({...prev, video_url: e.target.value}))}
                      placeholder="https://youtube.com/watch?v=..." 
                      className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 pl-12 rounded-2xl text-sm font-bold dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Duration (e.g. 45:00)</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      value={editingSermon?.duration || ''}
                      onChange={e => setEditingSermon(prev => ({...prev, duration: e.target.value}))}
                      placeholder="HH:MM:SS"
                      className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 pl-12 rounded-2xl text-sm font-bold dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingSermon(null); }} className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#0c2d58] text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
                  {editingSermon?.id ? 'Update Sermon' : 'Save Sermon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {sermons.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
            <Video size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No sermons in archive</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sermon</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Speaker</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {sermons.map(s => {
                  const ytId = getYouTubeID(s.video_url);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-10 rounded-lg bg-black overflow-hidden flex-shrink-0 border dark:border-slate-700">
                            {ytId ? (
                              <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-full h-full object-cover" alt="" />
                            ) : <Play className="m-auto text-slate-600" size={14}/>}
                          </div>
                          <p className="font-black text-sm dark:text-white leading-tight max-w-xs truncate">{s.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                          {s.preacher}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {formatDate(s.date_preached)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingSermon(s); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'video_url') => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadProgress(true);
      try {
        const base64 = await fileToBase64(file);
        setEditingBlog(prev => ({ ...prev, [field]: base64 }));
      } catch (err) {
        alert("Failed to process file.");
      } finally {
        setUploadProgress(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title || !editingBlog?.content) return alert("Title and Content are required.");

    setLoading(true);
    const postData = {
      title: editingBlog.title,
      author: editingBlog.author || 'Admin',
      category: editingBlog.category || 'All',
      content: editingBlog.content,
      excerpt: editingBlog.content.substring(0, 150) + '...',
      image_url: editingBlog.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800',
      video_url: editingBlog.video_url || null,
      created_at: editingBlog.created_at || new Date().toISOString()
    };

    try {
      if (editingBlog.id) {
        await supabase.from('blog_posts').update(postData).eq('id', editingBlog.id);
      } else {
        await supabase.from('blog_posts').insert([postData]);
      }
      setIsFormOpen(false);
      setEditingBlog(null);
      fetchBlogs();
    } catch (err) {
      alert("Error saving post.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchBlogs();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Blog Management</h3>
          <p className="text-sm text-slate-500">Create, schedule and manage church articles.</p>
        </div>
        <button 
          onClick={() => { setEditingBlog({ category: 'All', author: 'Church Admin', created_at: new Date().toISOString() }); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18}/> New Article
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border dark:border-slate-700">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-black dark:text-white uppercase tracking-tighter">{editingBlog?.id ? 'Edit Article' : 'Create New Article'}</h4>
              <button onClick={() => { setIsFormOpen(false); setEditingBlog(null); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 max-h-[80vh] overflow-y-auto space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Article Title</label>
                  <input 
                    required
                    value={editingBlog?.title || ''}
                    onChange={e => setEditingBlog(prev => ({...prev, title: e.target.value}))}
                    placeholder="Enter a compelling title..." 
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                  <select 
                    value={editingBlog?.category || 'All'}
                    onChange={e => setEditingBlog(prev => ({...prev, category: e.target.value}))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Sermon Devotional">Sermon Devotional</option>
                    <option value="Psalm Devotional">Psalm Devotional</option>
                    <option value="Community News">Community News</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Author Name</label>
                  <input 
                    value={editingBlog?.author || ''}
                    onChange={e => setEditingBlog(prev => ({...prev, author: e.target.value}))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Schedule Post (Next 7 Days)</label>
                  <input 
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    value={editingBlog?.created_at?.slice(0, 16) || ''}
                    onChange={e => setEditingBlog(prev => ({...prev, created_at: new Date(e.target.value).toISOString()}))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Content Body</label>
                <textarea 
                  required
                  rows={8}
                  value={editingBlog?.content || ''}
                  onChange={e => setEditingBlog(prev => ({...prev, content: e.target.value}))}
                  placeholder="Share the word..." 
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Featured Image</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      placeholder="Image URL..." 
                      value={editingBlog?.image_url || ''}
                      onChange={e => setEditingBlog(prev => ({...prev, image_url: e.target.value}))}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs"
                    />
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image_url')} className="hidden" id="blog-image-upload" />
                      <label htmlFor="blog-image-upload" className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <ImageIcon size={20} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload from PC</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Video Attachment (Optional)</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      placeholder="YouTube or Video URL..." 
                      value={editingBlog?.video_url || ''}
                      onChange={e => setEditingBlog(prev => ({...prev, video_url: e.target.value}))}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs"
                    />
                    <div className="relative">
                      <input type="file" accept="video/*" onChange={e => handleFileChange(e, 'video_url')} className="hidden" id="blog-video-upload" />
                      <label htmlFor="blog-video-upload" className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <Video size={20} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload from PC</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingBlog(null); }} className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading || uploadProgress}
                  className="bg-[#0c2d58] text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
                  {editingBlog?.id ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {blogs.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800">
            <FileText size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No blog posts yet</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Article</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {blogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          <img src={blog.image_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="font-black text-sm dark:text-white leading-tight">{blog.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">By {blog.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <Calendar size={12} className="text-slate-400"/>
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{formatDate(blog.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingBlog(blog); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(blog.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const GroupManager = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Partial<CommunityGroup> | null>(null);

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

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup?.name) return alert("Group name is required.");

    setLoading(true);
    const groupData = {
      name: editingGroup.name,
      description: editingGroup.description || '',
    };

    try {
      if (editingGroup.id) {
        await supabase.from('community_groups').update(groupData).eq('id', editingGroup.id);
      } else {
        await supabase.from('community_groups').insert([groupData]);
      }
      setIsFormOpen(false);
      setEditingGroup(null);
      fetchGroups();
    } catch (err: any) {
      alert("Error saving group: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group? All posts and memberships will be removed.")) return;
    try {
      await supabase.from('community_groups').delete().eq('id', id);
      fetchGroups();
    } catch (err: any) {
      alert("Error deleting group: " + err.message);
    }
  };

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
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Community Groups</h3>
          <p className="text-sm text-slate-500">Manage church groups and moderate memberships.</p>
        </div>
        <button 
          onClick={() => { setEditingGroup({ name: '', description: '' }); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={16}/> Create Group
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border dark:border-slate-700">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-black dark:text-white uppercase tracking-tighter">{editingGroup?.id ? 'Edit Group' : 'New Community Group'}</h4>
              <button onClick={() => { setIsFormOpen(false); setEditingGroup(null); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveGroup} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Group Name</label>
                <input 
                  required
                  value={editingGroup?.name || ''}
                  onChange={e => setEditingGroup(prev => ({...prev, name: e.target.value}))}
                  placeholder="Youth Ministry..." 
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
                <textarea 
                  rows={4}
                  value={editingGroup?.description || ''}
                  onChange={e => setEditingGroup(prev => ({...prev, description: e.target.value}))}
                  placeholder="Tell us about this community..." 
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none p-4 rounded-2xl text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="pt-6 border-t dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingGroup(null); }} className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#0c2d58] text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
                  {editingGroup?.id ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(g => (
          <div key={g.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm relative group">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingGroup(g); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Group"><Edit size={16}/></button>
              <button onClick={() => handleDeleteGroup(g.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete Group"><Trash2 size={16}/></button>
            </div>
            
            <h4 className="font-black dark:text-white text-lg mb-1 pr-16">{g.name}</h4>
            <p className="text-xs text-slate-500 mb-6 line-clamp-2 pr-4">{g.description}</p>
            
            <div className="flex justify-between items-center mt-auto">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Users size={12}/> {g.membersCount || 0} Members
              </span>
              <button 
                onClick={() => { setSelectedGroup(g.id); fetchGroupMembers(g.id); setShowMembers(true); }}
                className="text-[10px] font-black uppercase bg-[#0c2d58] text-white px-4 py-2 rounded-full hover:bg-blue-900 transition-colors shadow-md active:scale-95"
              >
                Manage Members
              </button>
            </div>
          </div>
        ))}
      </div>

      {showMembers && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh]">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h4 className="font-black dark:text-white uppercase tracking-tighter">Member Access Control</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Moderate participation for {groups.find(g => g.id === selectedGroup)?.name}</p>
              </div>
              <button onClick={() => setShowMembers(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {members.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed rounded-[2rem] border-slate-100 dark:border-slate-700">No members or requests found</div>
              ) : members.map(m => (
                <div key={m.user_id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 group hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600 border dark:border-blue-800">
                      {m.profiles?.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white leading-tight">{m.profiles?.first_name} {m.profiles?.last_name}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{m.profiles?.email}</p>
                      <p className={`text-[9px] font-black uppercase mt-1 tracking-widest ${m.status === 'pending' ? 'text-orange-500' : 'text-green-600'}`}>
                        {m.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {m.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleMemberAction(m.user_id, m.group_id, 'Approve')} 
                          className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <Check size={14}/> Approve
                        </button>
                        <button 
                          onClick={() => handleMemberAction(m.user_id, m.group_id, 'Decline')} 
                          className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <X size={14}/> Decline
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleMemberAction(m.user_id, m.group_id, 'Remove')} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                        title="Remove Member"
                      >
                        <Trash2 size={18}/>
                      </button>
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
        ) : activeTab === 'blogs' ? (
          <BlogManager />
        ) : activeTab === 'sermons' ? (
          <SermonManager />
        ) : activeTab === 'events' ? (
          <EventManager />
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