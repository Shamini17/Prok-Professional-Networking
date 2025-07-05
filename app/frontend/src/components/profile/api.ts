// Using relative URLs since Vite proxy handles the backend routing
const API_URL = '';

export interface ProfileData {
  id?: number;
  username?: string;
  email?: string;
  bio?: string;
  location?: string;
  image_url?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  website?: string;
  company?: string;
  job_title?: string;
  industry?: string;
  experience_years?: number;
  skills?: string;
  education?: string;
  certifications?: string;
  social_links?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SkillsData {
  skills: string[];
}

export interface ImageUploadResponse {
  image_url: string;
  message: string;
  filename?: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const getProfile = async (): Promise<ProfileData> => {
  const response = await fetch(`${API_URL}/api/profile`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  return handleApiResponse(response);
};

export const updateProfile = async (profileData: Partial<ProfileData>): Promise<ProfileData> => {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(profileData),
  });
  
  return handleApiResponse(response);
};

export const uploadProfileImage = async (file: File): Promise<ImageUploadResponse> => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG, JPG, JPEG, GIF allowed');
  }
  
  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB');
  }
  
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_URL}/api/profile/image`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  
  return handleApiResponse(response);
};

export const getSkills = async (): Promise<SkillsData> => {
  const response = await fetch(`${API_URL}/api/profile/skills`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  return handleApiResponse(response);
};

export const updateSkills = async (skills: string[]): Promise<SkillsData> => {
  // Validate skills data
  if (!Array.isArray(skills)) {
    throw new Error('Skills must be an array');
  }
  
  // Filter out empty skills and trim whitespace
  const validSkills = skills
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
  
  const response = await fetch(`${API_URL}/api/profile/skills`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ skills: validSkills }),
  });
  
  return handleApiResponse(response);
}; 