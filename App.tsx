
import React, { useState, useEffect } from 'react';
import { Auth } from './views/Auth';
import { AdminPanel } from './views/AdminPanel';
import { Layout } from './components/Layout';
import { HomeView, BibleView, BlogView, MusicView, SermonsView, CommunityView, EventsView, ProfileView, NotificationsView, ContactView } from './views/UserViews';
import { User, UserRole } from './types';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  // 'auth', 'admin', 'user'
  const [appState, setAppState] = useState<'auth' | 'admin' | 'user'>('auth');
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Supabase Auth Session
  useEffect(() => {
    const fetchProfile = async (userId: string, email?: string) => {
       try {
         // Special Check for Admin Email (Hardcoded for Demo security bypass)
         if (email === 'admin@icc.com') {
             setAppState('admin');
             setLoading(false);
             return;
         }

         const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

         if (data) {
             const userProfile: User = {
                 id: data.id,
                 firstName: data.first_name || '',
                 lastName: data.last_name || '',
                 email: data.email || email || '',
                 phone: data.phone || '',
                 dob: data.dob || '',
                 gender: data.gender || 'Female',
                 role: (data.role as UserRole) || UserRole.MEMBER,
                 joinedDate: data.created_at || new Date().toISOString()
             };
             setUser(userProfile);
             setAppState(data.role === 'ADMIN' ? 'admin' : 'user');
         } else {
             // Fallback if profile doesn't exist yet (should be handled by trigger)
             console.warn("Profile not found in DB");
             setAppState('user');
         }
       } catch (error) {
         console.error("Error fetching profile:", error);
       } finally {
         setLoading(false);
       }
    };

    // Check Active Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
          fetchProfile(session.user.id, session.user.email);
      } else {
          setLoading(false);
          setAppState('auth');
      }
    });

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            fetchProfile(session.user.id, session.user.email);
        } else {
            setUser(null);
            setAppState('auth');
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (user) {
        // Update Local State
        const newUser = { ...user, ...updatedData };
        setUser(newUser);

        // Update Supabase
        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: updatedData.firstName,
                last_name: updatedData.lastName,
                phone: updatedData.phone,
                dob: updatedData.dob,
                gender: updatedData.gender
            })
            .eq('id', user.id);
        
        if (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save changes.");
        }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAppState('auth');
    setActiveTab('home');
    setUser(null);
  };

  const renderUserView = () => {
    switch (activeTab) {
      case 'home': return <HomeView onNavigate={setActiveTab} />;
      case 'bible': return <BibleView />;
      case 'blogs': return <BlogView />;
      case 'events': return <EventsView onBack={() => setActiveTab('profile')} />;
      case 'media': return <MusicView />; 
      case 'sermons': return <SermonsView />; 
      case 'community': return <CommunityView />;
      case 'notifications': return <NotificationsView />;
      case 'contact': return <ContactView onBack={() => setActiveTab('profile')} />;
      case 'profile': return <ProfileView user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={isDarkMode} onNavigate={setActiveTab} />;
      default: return <HomeView onNavigate={setActiveTab} />;
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  if (appState === 'auth') {
    return <Auth onLogin={() => {}} />; // Handler is now managed by Supabase state change
  }

  if (appState === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  // User App State
  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout}
      toggleTheme={toggleTheme}
      isDarkMode={isDarkMode}
      userName={user?.firstName}
    >
      {renderUserView()}
    </Layout>
  );
};

export default App;
