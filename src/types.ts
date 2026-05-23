export interface UserProfile {
  username: string;
  email: string;
  avatar: string; // Avatar seed or model name
  xp: number;
  coins: number;
  streak: number;
  rank: number; // Global rank index
  league: 'Bronze' | 'Silver' | 'Gold' | 'Titan' | 'Legend';
  premiumTier: 'FREE' | 'NEXA_PLUS' | 'NEXA_PRO' | 'NEXA_LEGEND';
  unlockedThemes: string[];
  activeTheme: string;
  cosmetics: string[];
  hp?: number;
  friends?: string[];
  friendRequestsSent?: string[];
  friendRequestsReceived?: string[];
  reputation?: number;
  premiumExpiry?: number;
  premiumDailyClaimedAt?: string;
}

export interface Question {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  questionText: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  xpReward: number;
  coinReward: number;
}

export interface FeedPost {
  id: string;
  username: string;
  avatar: string;
  timeAgo: string;
  content: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'pdf';
  tag?: string;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timeAgo: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  reactions: Record<string, number>;
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf';
}

export interface ChatSession {
  id: string;
  recipientName: string;
  recipientAvatar: string;
  online: boolean;
  lastSeen?: string;
  messages: ChatMessage[];
  typing?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  membersCount: number;
  leaderboard: { username: string; xp: number }[];
  sharedNotesCount: number;
  activeVoiceRooms: number;
}

export interface StudyReel {
  id: string;
  videoUrl: string;
  creator: string;
  creatorAvatar: string;
  caption: string;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
  tags: string[];
  dislikes?: number;
  disliked?: boolean;
  commentsList?: Comment[];
  views?: number;
  audioUrl?: string;
  audioName?: string;
  audioVolume?: number;
  originalVolume?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'theme' | 'avatar_frame' | 'avatar_border' | 'username_glow' | 'voice_pack' | 'sticker';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  unlockedContent: string; // CSS style or ID details
}

export interface RoadmapNode {
  title: string;
  duration: string;
  skills: string[];
  description: string;
}

export interface CareerRoadmap {
  career: string;
  salary: string;
  collegeSuggestions: string[];
  roadmap: RoadmapNode[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert' | 'friend_request';
}
