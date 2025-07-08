import { apiClient } from '../../services/api';

// Using relative URLs since Vite proxy handles the backend routing
const API_URL = '';

export interface ProfileData {
  id: number;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  bio: string;
  location: string;
  phone?: string;
  website: string;
  company: string;
  job_title: string;
  industry: string;
  experience_years: number;
  skills: string;
  education: string;
  certifications: string;
  social_links: string;
  image_url: string;
  thumbnail_url: string;
  is_public: boolean;
  show_email: boolean;
  show_phone: boolean;
  created_at?: string;
  updated_at?: string;
  full_name?: string;
  profile_completion?: number;
  is_complete?: boolean;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
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
  is_public?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
}

export interface SkillsData {
  skills: string[];
}

export interface EducationData {
  education: Array<{
    degree: string;
    school: string;
    year: number;
    field?: string;
    gpa?: number;
  }>;
}

export interface CertificationData {
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
    expiry_date?: string;
    credential_id?: string;
  }>;
}

export interface SocialLinksData {
  social_links: {
    [key: string]: string;
  };
}

export interface ProfileCompletionData {
  percentage: number;
  is_complete: boolean;
  full_name: string;
  missing_fields: string[];
}

export interface ImageUploadResponse {
  image_url: string;
  thumbnail_url: string;
  message: string;
  filename: string;
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

// Profile Management API
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<ProfileData> => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<ProfileData> => {
    const response = await apiClient.put('/api/profile', data);
    return response.data;
  },

  // Upload profile image
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  
    const response = await apiClient.post('/api/profile/image', formData, {
    headers: {
        // Don't set Content-Type for FormData - let browser set it automatically
      },
    });
    return response.data;
  },

  // Get profile completion status
  getProfileCompletion: async (): Promise<ProfileCompletionData> => {
    const response = await apiClient.get('/api/profile/completion');
    return response.data;
  },

  // Skills Management
  getSkills: async (): Promise<SkillsData> => {
    const response = await apiClient.get('/api/profile/skills');
    return response.data;
  },

  updateSkills: async (skills: string[]): Promise<SkillsData> => {
    const response = await apiClient.put('/api/profile/skills', { skills });
    return response.data;
  },

  // Education Management
  getEducation: async (): Promise<EducationData> => {
    const response = await apiClient.get('/api/profile/education');
    return response.data;
  },

  updateEducation: async (education: EducationData['education']): Promise<EducationData> => {
    const response = await apiClient.put('/api/profile/education', { education });
    return response.data;
  },

  // Certifications Management
  getCertifications: async (): Promise<CertificationData> => {
    const response = await apiClient.get('/api/profile/certifications');
    return response.data;
  },

  updateCertifications: async (certifications: CertificationData['certifications']): Promise<CertificationData> => {
    const response = await apiClient.put('/api/profile/certifications', { certifications });
    return response.data;
  },

  // Social Links Management
  getSocialLinks: async (): Promise<SocialLinksData> => {
    const response = await apiClient.get('/api/profile/social-links');
    return response.data;
  },

  updateSocialLinks: async (socialLinks: SocialLinksData['social_links']): Promise<SocialLinksData> => {
    const response = await apiClient.put('/api/profile/social-links', { social_links: socialLinks });
    return response.data;
  },
};

// Profile validation utilities
export const profileValidation = {
  validateName: (name: string): string | null => {
    if (!name.trim()) return 'Name is required';
    if (name.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return null;
  },

  validateBio: (bio: string): string | null => {
    if (bio.length > 1000) return 'Bio must be less than 1000 characters';
    return null;
  },

  validateLocation: (location: string): string | null => {
    if (location.length > 120) return 'Location must be less than 120 characters';
    return null;
  },

  validatePhone: (phone: string): string | null => {
    if (!phone) return null; // Phone is optional
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone)) {
      return 'Invalid phone number format';
    }
    return null;
  },

  validateWebsite: (website: string): string | null => {
    if (!website) return null; // Website is optional
    if (!/^https?:\/\/.+/.test(website)) {
      return 'Website must start with http:// or https://';
    }
    if (website.length > 255) return 'Website URL too long';
    return null;
  },

  validateCompany: (company: string): string | null => {
    if (company.length > 100) return 'Company name must be less than 100 characters';
    return null;
  },

  validateJobTitle: (jobTitle: string): string | null => {
    if (jobTitle.length > 100) return 'Job title must be less than 100 characters';
    return null;
  },

  validateIndustry: (industry: string): string | null => {
    if (industry.length > 100) return 'Industry must be less than 100 characters';
    return null;
  },

  validateExperienceYears: (years: number): string | null => {
    if (years < 0 || years > 50) return 'Experience years must be between 0 and 50';
    return null;
  },

  validateSkills: (skills: string[]): string | null => {
    if (skills.length > 20) return 'Maximum 20 skills allowed';
    for (const skill of skills) {
      if (skill.length > 50) return 'Skill name too long (max 50 characters)';
    }
    return null;
  },

  validateImage: (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only PNG, JPG, JPEG, GIF allowed';
    }

    if (file.size > maxSize) {
      return 'File too large. Maximum size is 5MB';
    }

    return null;
  },

  validateEducation: (education: EducationData['education']): string | null => {
    for (const edu of education) {
      if (!edu.degree?.trim()) return 'Degree is required for each education entry';
      if (!edu.school?.trim()) return 'School is required for each education entry';
      if (!edu.year || edu.year < 1900 || edu.year > new Date().getFullYear()) {
        return 'Valid year is required for each education entry';
      }
    }
    return null;
  },

  validateCertifications: (certifications: CertificationData['certifications']): string | null => {
    for (const cert of certifications) {
      if (!cert.name?.trim()) return 'Certification name is required for each entry';
      if (!cert.issuer?.trim()) return 'Issuer is required for each certification entry';
      if (!cert.year || cert.year < 1900 || cert.year > new Date().getFullYear()) {
        return 'Valid year is required for each certification entry';
      }
    }
    return null;
  },

  validateSocialLinks: (socialLinks: SocialLinksData['social_links']): string | null => {
    for (const [platform, url] of Object.entries(socialLinks)) {
      if (!url?.trim()) continue; // Skip empty URLs
      if (!/^https?:\/\/.+/.test(url)) {
        return `Invalid URL format for ${platform}`;
      }
    }
    return null;
  },
};

// Profile data transformation utilities
export const profileUtils = {
  // Parse skills string to array
  parseSkills: (skills: string): string[] => {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill);
  },

  // Convert skills array to string
  stringifySkills: (skills: string[]): string => {
    return skills.join(', ');
  },

  // Parse JSON fields safely
  parseJsonField: (field: string): any => {
    if (!field) return null;
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  },

  // Stringify JSON fields safely
  stringifyJsonField: (data: any): string => {
    if (!data) return '';
    try {
      return JSON.stringify(data);
    } catch {
      return '';
    }
  },

  // Get full name from profile data
  getFullName: (profile: ProfileData): string => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.first_name || profile.last_name || profile.username;
  },

  // Format phone number for display
  formatPhone: (phone: string): string => {
    if (!phone) return '';
    // Basic formatting - can be enhanced
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  },

  // Get profile completion percentage
  getCompletionPercentage: (profile: ProfileData): number => {
    const fields = [
      'first_name', 'last_name', 'bio', 'location', 'phone', 
      'website', 'company', 'job_title', 'industry', 
      'experience_years', 'skills', 'image_url'
    ];
    
    const completed = fields.filter(field => {
      const value = profile[field as keyof ProfileData];
      return value && (typeof value === 'string' ? value.trim() : value);
    }).length;
    
    return Math.round((completed / fields.length) * 100);
  },

  // Check if profile is complete
  isProfileComplete: (profile: ProfileData): boolean => {
    const requiredFields = ['first_name', 'last_name', 'bio', 'company', 'job_title'];
    return requiredFields.every(field => {
      const value = profile[field as keyof ProfileData];
      return value && (typeof value === 'string' ? value.trim() : value);
    });
  },
}; 