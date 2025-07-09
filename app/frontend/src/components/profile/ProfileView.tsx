import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from './api';
import type { ProfileData, EducationData, CertificationData, SocialLinksData } from './api';
import ReactModal from 'react-modal';
ReactModal.setAppElement('#root');

// Add a cover/banner image URL (could be dynamic in the future)
const COVER_IMAGE = '/default-profile.png'; // Use your own banner or a default

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [education, setEducation] = useState<EducationData | null>(null);
  const [certifications, setCertifications] = useState<CertificationData | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Add at the top of the component
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Banner image upload handler (now uploads to backend)
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerUploading(true);
      setBannerError(null);
      try {
        const res = await profileApi.uploadBanner(file);
        setBannerImage(res.banner_url);
        setSuccess('Banner uploaded successfully!');
      } catch (err: any) {
        setBannerError(err.message || 'Failed to upload banner');
      } finally {
        setBannerUploading(false);
      }
    }
  };

  // Remove banner (local only, or add backend call if needed)
  const removeBanner = () => setBannerImage(null);

  // Profile image preview/removal (local preview only)
  const removeProfileImage = () => setProfileImage(null);

  // Copy to clipboard utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Social icon utility
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return (
          <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z"/></svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.63 0-12 5.37-12 12 0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.018.005 2.046.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576 4.765-1.587 8.2-6.086 8.2-11.384 0-6.63-5.373-12-12-12z"/></svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 00-8.384 4.482c-4.086-.205-7.713-2.164-10.141-5.144a4.822 4.822 0 00-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 01-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 007.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.025 10.025 0 0024 4.557z"/></svg>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 13.41a2 2 0 002.83 0l7.07-7.07a2 2 0 00-2.83-2.83l-7.07 7.07a2 2 0 000 2.83zm-1.42 1.42l-7.07 7.07a2 2 0 002.83 2.83l7.07-7.07a2 2 0 00-2.83-2.83z"/></svg>
        );
    }
  };

  // Navigation bar
  const handleNav = (path: string) => {
    if (path === '/profile') {
      // Reload the profile page
      navigate(0);
    } else {
      navigate(path);
    }
  };

  // Form state for editing
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    company: '',
    job_title: '',
    industry: '',
    experience_years: 0,
    skills: [] as string[],
    education: [] as EducationData['education'],
    certifications: [] as CertificationData['certifications'],
    social_links: {} as SocialLinksData['social_links']
  });

  // Image upload state
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Skill state
  const [newSkill, setNewSkill] = useState('');
  const [addSkillError, setAddSkillError] = useState<string | null>(null);

  // Skills state
  const [skills, setSkills] = useState<string[]>([]);

  // Add state for modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [contactForm, setContactForm] = useState({ phone: profile?.phone || '', website: profile?.website || '' });
  const [socialForm, setSocialForm] = useState(socialLinks?.social_links || {});

  // Add state for new platform
  const [newPlatform, setNewPlatform] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');

  // Add state for banner upload
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
      const [profileData, skillsData, educationData, certificationsData, socialLinksData] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getSkills(),
        profileApi.getEducation(),
        profileApi.getCertifications(),
        profileApi.getSocialLinks()
      ]);
      
      setProfile(profileData);
      setEducation(educationData);
      setCertifications(certificationsData);
      setSocialLinks(socialLinksData);
      setImageUrl(profileData.image_url || '');
      setSkills(skillsData.skills || []);
      setBannerImage(profileData.banner_url || null);
      // Debug: Log image URL
      console.log('Profile image URL:', profileData.image_url);
      console.log('Processed image URL:', getImageUrl(profileData.image_url || ''));
      // Initialize form data
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        company: profileData.company || '',
        job_title: profileData.job_title || '',
        industry: profileData.industry || '',
        experience_years: profileData.experience_years || 0,
        skills: skillsData.skills || [],
        education: educationData.education,
        certifications: certificationsData.certifications,
        social_links: socialLinksData.social_links
      });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsString = e.target.value;
    const skillsArray = skillsString.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: new Date().getFullYear() }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: new Date().getFullYear() }]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value }
    }));
  };

  // Image upload handlers
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageError(null);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setImageError('Invalid file type. Only PNG, JPG, JPEG, GIF allowed');
        return;
      }
      
      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setImageError('File too large. Maximum size is 5MB');
        return;
      }
      
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      return;
    }
    setError(null);
    setSuccess(null);
    setImageError(null);
    setImageUploading(true);
    
    try {
      const res = await profileApi.uploadImage(image);
      
      setSuccess('Image uploaded successfully!');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh profile data to get updated image URL
      await fetchProfileData();
      setImageUrl(getImageUrl(res.image_url || '', true));
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageUrl('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update profile data
      const profileUpdateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        website: formData.website,
        company: formData.company,
        job_title: formData.job_title,
        industry: formData.industry,
        experience_years: formData.experience_years
      };

      // Update all sections
      await Promise.all([
        profileApi.updateProfile(profileUpdateData),
        profileApi.updateSkills(formData.skills),
        profileApi.updateEducation(formData.education),
        profileApi.updateCertifications(formData.certifications),
        profileApi.updateSocialLinks(formData.social_links)
      ]);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh data
      await fetchProfileData();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string, cacheBust = false) => {
    if (!imagePath) {
      return '';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Only add cache busting if requested (after upload)
    if (cacheBust) {
      const separator = imagePath.includes('?') ? '&' : '?';
      return `${imagePath}${separator}t=${Date.now()}`;
    }
    return imagePath;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">Error Loading Profile</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 py-8">
      {/* Add a persistent dashboard bar above the banner image */}
      <div className="sticky top-0 z-40 w-full flex justify-center py-3 mb-2 animate-fadein-fast">
        <div className="w-full max-w-4xl mx-auto flex flex-wrap gap-4 items-center justify-center rounded-b-2xl border border-purple-200 shadow-lg bg-gradient-to-r from-blue-200/80 via-purple-100/80 to-pink-200/80 backdrop-blur-md bg-opacity-70">
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl shadow hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-300 transition font-semibold text-base flex items-center gap-2 backdrop-blur-sm"
            onClick={() => navigate('/profile')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Profile
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-pink-300 transition font-semibold text-base flex items-center gap-2 backdrop-blur-sm"
            onClick={() => navigate('/posts/create')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create a Post
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl shadow hover:from-blue-500 hover:to-purple-500 focus:ring-2 focus:ring-blue-300 transition font-semibold text-base flex items-center gap-2 backdrop-blur-sm"
            onClick={() => navigate('/posts')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Posts
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-400 text-white rounded-xl shadow hover:from-teal-500 hover:to-blue-500 focus:ring-2 focus:ring-teal-300 transition font-semibold text-base flex items-center gap-2 backdrop-blur-sm"
            onClick={() => navigate('/messages')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m-2 8a9 9 0 100-18 9 9 0 000 18z" /></svg>
            Messages
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl shadow hover:from-orange-500 hover:to-pink-500 focus:ring-2 focus:ring-orange-300 transition font-semibold text-base flex items-center gap-2 backdrop-blur-sm"
            onClick={() => navigate('/jobs')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4M4 7h16" /></svg>
            Jobs
          </button>
        </div>
      </div>
      {/* Cover/Banner Image */}
      <div className="max-w-4xl mx-auto mb-[-72px] relative group">
        <img
          src={bannerImage || COVER_IMAGE}
          alt="Banner"
          className="w-full h-72 object-cover rounded-3xl shadow-lg transition-all duration-300 group-hover:brightness-95 group-hover:blur-[1px]"
          style={{ filter: 'blur(0.5px) brightness(0.95)' }}
        />
        {/* Add the options row as an overlay at the top of the banner image */}
        {/* Remove the options overlay bar from the banner image */}
        {/* Options right */}
        <div className="absolute inset-0 flex items-center px-8 z-20">
          {/* Profile image left */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-2 shadow-xl animate-pulse-slow relative">
              <img
                src={profileImage || getImageUrl(profile?.image_url || '')}
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-gray-100 border-4 border-white shadow-md profile-fadein"
                onError={(e) => (e.currentTarget.src = '/default-profile.png')}
                style={{ transition: 'box-shadow 0.3s, transform 0.3s' }}
              />
              {/* Camera icon overlay for image upload */}
              <label htmlFor="profile-image-upload" className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow cursor-pointer hover:bg-opacity-100 transition-opacity flex items-center justify-center" style={{ width: 36, height: 36 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/gif"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {profileImage && (
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="absolute bottom-2 left-2 bg-red-500 text-white rounded-full px-3 py-1 text-xs shadow hover:bg-red-600 transition"
                >
                  Remove
                </button>
              )}
              {image && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={imageUploading}
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-full px-3 py-1 text-xs shadow hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {imageUploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
              {imageError && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs rounded px-2 py-1 shadow">
                  {imageError}
                </div>
              )}
            </div>
          </div>
          {/* Options right */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-end gap-4 ml-8">
            {/* The options row is now in the banner image overlay */}
          </div>
        </div>
        <label htmlFor="banner-upload" className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 shadow cursor-pointer hover:bg-opacity-100 transition-opacity flex items-center justify-center" title="Change Banner" style={{ width: 40, height: 40 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <input
            id="banner-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif"
            className="hidden"
            onChange={handleBannerChange}
          />
        </label>
        {bannerImage && (
          <button
            type="button"
            onClick={removeBanner}
            className="absolute top-4 left-4 bg-red-500 text-white rounded-full px-3 py-1 text-xs shadow hover:bg-red-600 transition"
          >
            Remove Banner
          </button>
        )}
        {bannerUploading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs rounded px-2 py-1 shadow">Uploading...</div>
        )}
        {bannerError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs rounded px-2 py-1 shadow">{bannerError}</div>
        )}
      </div>
      {/* Glassmorphism Card */}
      <div className="max-w-4xl mx-auto mt-[-60px] mb-8 rounded-3xl shadow-2xl bg-white bg-opacity-80 backdrop-blur-lg border border-gray-200 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-20 animate-fadein">
        <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              {profile?.first_name || profile?.last_name
                ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                : (profile?.username || <span className="text-gray-400">No Name Set</span>)}
              {profile?.is_complete && <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-bounce">Verified</span>}
            </h1>
            {profile?.job_title && (
              <span className="ml-0 md:ml-4 text-lg text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full shadow-sm">{profile.job_title}</span>
            )}
          </div>
          {profile?.company && (
            <div className="text-gray-700 text-md flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4M4 7h16" /></svg>
              {profile.company}
            </div>
          )}
          {profile?.location && (
            <div className="text-gray-500 text-md flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0c-4.418 0-8 2.239-8 5v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.761-3.582-5-8-5z" /></svg>
              {profile.location}
            </div>
          )}
          {/* Profile Completion Bar */}
          {typeof profile.profile_completion === 'number' && (
            <div className="w-full mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">Profile Completion</span>
                <span className="text-xs text-blue-700 font-bold">{profile.profile_completion}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700" style={{ width: `${profile.profile_completion}%` }}></div>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              className="px-5 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition font-semibold text-lg"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            {!isEditing && (
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition font-semibold text-lg"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Main Content: Two Columns */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left Column: Details */}
        <div className="flex-1 space-y-6">
          {/* About */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow p-6 border border-gray-100 animate-fadein">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2"><svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.5A8.5 8.5 0 103.5 12a8.5 8.5 0 008.5 8.5z" /></svg>About</h2>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-600 leading-relaxed text-lg">{profile?.bio || 'No bio available'}</p>
            )}
          </div>
          {/* Skills */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow p-6 border border-gray-100 animate-fadein">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2"><svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.631c.969 0 1.371 1.24.588 1.81l-5.37 3.905a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.37-3.905a1 1 0 00-1.176 0l-5.37 3.905c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.342 11.717c-.783-.57-.38-1.81.588-1.81h6.631a1 1 0 00.95-.69l2.036-6.29z" /></svg>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? formData.skills : skills).map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 text-blue-900 font-semibold shadow hover:scale-105 transition-transform cursor-pointer">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
                  {skill}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newSkill.trim()) {
                      e.preventDefault();
                      if (!formData.skills.includes(newSkill.trim())) {
                        setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                      }
                      setNewSkill('');
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type a skill and press Enter"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={() => {
                    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
                      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                      setNewSkill('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
          {/* Education */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow p-6 border border-gray-100 animate-fadein">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2"><svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>Education</h2>
            {isEditing ? (
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="University name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="number"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(index, 'year', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field || ''}
                          onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeEducation(index)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Education
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {education && education.education.length > 0 ? (
                  education.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-medium text-gray-800">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                      {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No education listed</p>
                )}
              </div>
            )}
          </div>
          {/* Certifications */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow p-6 border border-gray-100 animate-fadein">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2"><svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>Certifications</h2>
            {isEditing ? (
              <div className="space-y-4">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Amazon Web Services"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year Obtained</label>
                        <input
                          type="number"
                          value={cert.year}
                          onChange={(e) => handleCertificationChange(index, 'year', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={cert.expiry_date || ''}
                          onChange={(e) => handleCertificationChange(index, 'expiry_date', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeCertification(index)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCertification}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Certification
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {certifications && certifications.certifications.length > 0 ? (
                  certifications.certifications.map((cert, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-medium text-gray-800">{cert.name}</h3>
                      <p className="text-gray-600">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">{cert.year}</p>
                      {cert.expiry_date && <p className="text-sm text-gray-500">Expires: {cert.expiry_date}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No certifications listed</p>
                )}
              </div>
            )}
          </div>
          {/* Save/Cancel Buttons in Edit Mode */}
          {isEditing && (
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {/* Right Column: Contact & Social */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          {/* Contact Info */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow p-6 border border-gray-100 animate-fadein">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" />
                </svg>
              Contact
              <button onClick={() => { setContactForm({ phone: profile?.phone || '', website: profile?.website || '' }); setShowContactModal(true); }} className="ml-auto p-1 hover:bg-gray-100 rounded-full" title="Edit Contact">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" />
                </svg>
              </button>
            </h3>
            <div className="space-y-2 text-sm">
              {profile?.email && (
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 text-blue-600 hover:underline focus:outline-none"
                    onClick={() => profile.email && copyToClipboard(profile.email)}
                    title="Copy Email"
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span>{profile.email}</span>
                  </button>
                  {copied && <span className="text-green-500 ml-2">Copied!</span>}
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" /></svg>
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
          {/* Social Links */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow p-6 border border-gray-100 animate-fadein">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7H4v-7a6 6 0 016-6z" /></svg>
              Social Links
              <button onClick={() => { setSocialForm(socialLinks?.social_links || {}); setShowSocialModal(true); }} className="ml-auto p-1 hover:bg-gray-100 rounded-full" title="Edit Social Links">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
              </button>
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks?.social_links || {}).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 text-blue-900 font-semibold shadow hover:scale-105 transition-transform cursor-pointer"
                  title={`Visit ${platform}`}
                >
                  {getSocialIcon(platform)}
                  <span className="hidden md:inline">{platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Contact Edit Modal */}
      {showContactModal && (
        <ReactModal isOpen={showContactModal} onRequestClose={() => setShowContactModal(false)} className="modal" overlayClassName="modal-overlay">
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Edit Contact Info</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await profileApi.updateProfile({ phone: contactForm.phone, website: contactForm.website }); setShowContactModal(false); fetchProfileData(); }} className="space-y-4">
              <div><label>Phone</label><input type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} className="input" /></div>
              <div><label>Website</label><input type="url" value={contactForm.website} onChange={e => setContactForm(f => ({ ...f, website: e.target.value }))} className="input" /></div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowContactModal(false)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </button>
                <button type="submit" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Save
                </button>
              </div>
            </form>
          </div>
        </ReactModal>
      )}
      {/* Social Links Edit Modal */}
      {showSocialModal && (
        <ReactModal isOpen={showSocialModal} onRequestClose={() => setShowSocialModal(false)} className="modal" overlayClassName="modal-overlay">
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Edit Social Links</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await profileApi.updateSocialLinks(socialForm); setShowSocialModal(false); fetchProfileData(); }} className="space-y-4">
              {Object.keys(socialForm).map(platform => (
                <div key={platform} className="flex items-center gap-2">
                  <input type="text" value={platform} disabled className="input w-24 bg-gray-100" />
                  <input type="url" value={socialForm[platform]} onChange={e => setSocialForm(f => ({ ...f, [platform]: e.target.value }))} className="input flex-1" />
                  <button type="button" onClick={() => { const updated = { ...socialForm }; delete updated[platform]; setSocialForm(updated); }} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input type="text" placeholder="Platform" value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="input w-24" />
                <input type="url" placeholder="URL" value={newPlatformUrl} onChange={e => setNewPlatformUrl(e.target.value)} className="input flex-1" />
                <button type="button" onClick={() => { if (newPlatform && newPlatformUrl) { setSocialForm(f => ({ ...f, [newPlatform]: newPlatformUrl })); setNewPlatform(''); setNewPlatformUrl(''); } }} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-md transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add
                </button>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowSocialModal(false)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </button>
                <button type="submit" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Save
                </button>
              </div>
            </form>
          </div>
        </ReactModal>
      )}
    </div>
  );
};

export default ProfileView; 