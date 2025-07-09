import type { Post } from '../../types';

const API_URL = 'http://localhost:5000';

export interface PostFilters {
  search?: string;
  category?: string;
  visibility?: string;
  tags?: string;
  sort_by?: 'created_at' | 'likes_count' | 'views_count' | 'comments_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PostResponse {
  posts: Post[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface PopularTag {
  name: string;
  count: number;
}

export const postsApi = {
  createPost: async (content: string, media?: File | null, visibility?: string, category?: string) => {
    let body: any;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    if (media) {
      body = new FormData();
      body.append('content', content);
      body.append('media', media);
      if (visibility) body.append('visibility', visibility);
      if (category) body.append('category', category);
      // Do NOT set Content-Type for FormData
    } else {
      body = JSON.stringify({ content, visibility, category });
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers,
      body,
    });
    return response.json();
  },

  getPosts: async (filters: PostFilters = {}): Promise<PostResponse> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.visibility) params.append('visibility', filters.visibility);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const response = await fetch(`${API_URL}/api/posts?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return response.json();
  },

  getCategories: async (): Promise<{ categories: Category[] }> => {
    const response = await fetch(`${API_URL}/api/posts/categories`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return response.json();
  },

  getPopularTags: async (): Promise<{ tags: PopularTag[] }> => {
    const response = await fetch(`${API_URL}/api/posts/popular-tags`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch popular tags');
    }
    
    return response.json();
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  deletePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    return response.json();
  },
}; 