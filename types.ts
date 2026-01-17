
export interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  avatar?: string; // For private chats
  membersCount?: number;
  lastMessage?: string;
  isPrivate: boolean;
  recipientId?: string;
}

export interface VideoPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: number;
}

export enum AppTab {
  CHATS = 'chats',
  FEED = 'feed',
  PROFILE = 'profile',
  DISCOVER = 'discover'
}
