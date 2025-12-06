
export enum UserRole {
  GUEST = 'GUEST',
  MEMBER = 'MEMBER',
  MODERATOR = 'MODERATOR',
  AUTHOR = 'AUTHOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender?: string;
  role: UserRole;
  avatar?: string;
  joinedDate: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: 'Faith' | 'Testimony' | 'Teaching' | 'Devotional';
  excerpt: string;
  content: string;
  likes: number;
  comments: number;
  image: string;
  videoUrl?: string; 
  views?: number;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  duration: string;
  videoUrl?: string; 
  audioUrl?: string;
  thumbnail: string;
  views: number;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  image?: string;
  membersCount: number;
  isMember: boolean;
  status?: 'Joined' | 'Pending' | 'None' | 'Approved';
}

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  group_post_likes?: { user_id: string }[];
}

export interface BibleVerse {
  reference: string;
  text: string;
  version: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'EVENT' | 'ANNOUNCEMENT';
  rsvpCount?: number;
  image?: string;
  videoUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'EVENT' | 'ANNOUNCEMENT' | 'COMMENT';
  created_at: string;
  isRead: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  date: string;
  duration: string;
  url: string;
  isOffline: boolean;
  type: 'MUSIC' | 'PODCAST';
}

export interface Playlist {
  id: string;
  title: string; // Database field is title
  name?: string; // Mapped for UI
  user_id?: string;
  tracks: MusicTrack[];
}

export interface Reel {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  likes: number;
}

export interface BibleStudy {
  id: string;
  title: string;
  description: string;
  pdfUrl?: string;
  videoUrl?: string;
  date: string;
}

export interface ReadingPlan {
  id: string;
  month: string;
  year: number;
  content: string;
}
