

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
  category: string;
  excerpt: string;
  content: string;
  likes: number;
  comments: number;
  image_url: string;
  video_url?: string; 
  created_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date_preached: string;
  duration: string;
  video_url: string; 
  thumbnail_url?: string;
  created_at: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  image?: string;
  membersCount: number;
  isMember: boolean;
  // Fixed: Updated to lowercase to match database values and usage in UserViews.tsx
  status?: 'approved' | 'pending' | 'none';
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
  rsvpStatus?: 'Yes' | 'No' | 'Maybe' | 'None';
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: string;
  type: 'MUSIC' | 'PODCAST';
}

export interface Playlist {
  id: string;
  title: string; 
  user_id: string;
  tracks: MusicTrack[];
}

export interface Reel {
  id: string;
  title: string;
  description: string;
  video_url: string; 
  created_at: string;
}

export interface ReadingPlanDay {
  day: number;
  reading: string;
  completed?: boolean;
}