const API_URL = 'http://localhost:5000';

export const postsApi = {
  createPost: async (content: string, media?: File | null) => {
    let body: any;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    if (media) {
      body = new FormData();
      body.append('content', content);
      body.append('media', media);
      // Do NOT set Content-Type for FormData
    } else {
      body = JSON.stringify({ content });
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers,
      body,
    });
    return response.json();
  },

  getPosts: async () => {
    const response = await fetch(`${API_URL}/posts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
}; 