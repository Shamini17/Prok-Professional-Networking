export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  bio: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  media_url?: string;
  created_at: string;
  likes_count: number;
  views_count: number;
  comments_count: number;
  visibility?: string;
  category?: string;
  tags?: string[];
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

export interface Comment {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read: boolean;
} 