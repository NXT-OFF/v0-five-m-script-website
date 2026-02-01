export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'moderator';
  created_at: Date;
  updated_at: Date;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  download_url: string;
  file_size: string | null;
  version: string | null;
  author_id: number;
  author_username?: string;
  views: number;
  downloads: number;
  is_new: boolean;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: number;
  resource_id: number;
  user_id: number;
  username?: string;
  avatar_url?: string;
  content: string;
  created_at: Date;
}

export interface Review {
  id: number;
  resource_id: number;
  user_id: number;
  username?: string;
  avatar_url?: string;
  rating: number;
  content: string;
  created_at: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Scripts', icon: 'Home' },
  { id: 'scripts', name: 'Scripts', icon: 'Code' },
  { id: 'mlo', name: 'MLO', icon: 'Building' },
  { id: 'vehicles', name: 'Vehicles', icon: 'Car' },
  { id: 'clothes', name: 'Clothes', icon: 'Shirt' },
  { id: 'weapons', name: 'Weapons', icon: 'Crosshair' },
  { id: 'maps', name: 'Maps', icon: 'Map' },
  { id: 'tools', name: 'Tools', icon: 'Wrench' },
  { id: 'eup', name: 'EUP', icon: 'Users' },
  { id: 'hud', name: 'HUD', icon: 'Monitor' },
  { id: 'sounds', name: 'Sounds', icon: 'Volume2' },
  { id: 'dumps', name: 'Dumps', icon: 'Database' },
];
