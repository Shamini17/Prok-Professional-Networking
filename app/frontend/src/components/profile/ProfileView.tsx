import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from './api';
import type { ProfileData, EducationData, CertificationData, SocialLinksData } from './api';
import Modal from 'react-modal';

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
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [addSkillError, setAddSkillError] = useState<string | null>(null);

  // Skills state
  const [skills, setSkills] = useState<string[]>([]);

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
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      return '';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // For relative paths, use them as-is since Vite proxy handles /static routes
    // Add cache busting parameter to prevent browser caching issues
    const separator = imagePath.includes('?') ? '&' : '?';
    return `${imagePath}${separator}t=${Date.now()}`;
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
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
                {/* Show profile image if available */}
                {profile.image_url && (
                <img 
                    src={getImageUrl(profile.image_url)} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  style={{ display: 'block' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show initials fallback
                      const fallback = target.parentElement?.querySelector('.initials-fallback');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                    onLoad={(e) => {
                      // Hide initials fallback
                      const target = e.target as HTMLImageElement;
                      const fallback = target.parentElement?.querySelector('.initials-fallback');
                      if (fallback) {
                        fallback.classList.add('hidden');
                      }
                    }}
                  />
                )}
                
                {/* Show preview image if uploading */}
                {imageUrl && !profile.image_url && (
                  <img 
                    src={imageUrl} 
                    alt="Profile Preview" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                )}
                
                {/* Fallback initials - show when no image or image failed to load */}
                <div className={`w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg initials-fallback ${(imageUrl || profile.image_url) ? 'hidden' : ''}`}>
                  <span className="text-2xl font-bold">
                    {profile.first_name?.[0] || profile.username?.[0] || 'U'}
                  </span>
                </div>
                
                {/* Image upload overlay when editing */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <label htmlFor="image-upload" className="text-white text-xs cursor-pointer">
                      Change Photo
                    </label>
                    <input
                      id="image-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.username || 'User'
                }
              </h1>
              {profile.job_title && (
                <p className="text-xl opacity-90 mt-1">{profile.job_title}</p>
              )}
              {profile.company && (
                <p className="text-lg opacity-80 mt-1">{profile.company}</p>
              )}
            </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit Profile
                </button>
              ) : (
                <>
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
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded m-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
            {error}
          </div>
        )}
        




        {/* Image Upload Controls - Always Visible */}
        <div className="bg-blue-50 border-t border-blue-200 p-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              {!profile?.image_url ? '📸 Upload Profile Image' : '📸 Change Profile Image'}
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {image && (
                <>
                  <button
                    onClick={handleImageUpload}
                    disabled={imageUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {imageUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button
                    onClick={removeImage}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            {imageError && (
              <div className="mt-2 text-red-600 text-sm">{imageError}</div>
            )}
            <div className="mt-2 text-sm text-blue-600">
              <strong>Supported formats:</strong> PNG, JPG, JPEG, GIF (max 5MB)
            </div>
            {!profile?.image_url && (
              <div className="mt-2 text-sm text-blue-600">
                <strong>💡 Tip:</strong> Upload an image to see it in your profile header!
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
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
                  <p className="text-gray-600 leading-relaxed">
                    {profile.bio || 'No bio available'}
                  </p>
                )}
                </div>

              {/* Skills */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter skills separated by commas..."
                  />
                ) : (
                  <>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed</p>
                    )}
                  </div>
                  <button
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    onClick={() => { setShowAddSkill(true); setAddSkillError(null); setNewSkill(''); }}
                  >
                    + Add Skill
                  </button>
                  <Modal
                    isOpen={showAddSkill}
                    onRequestClose={() => setShowAddSkill(false)}
                    className="fixed inset-0 flex items-center justify-center z-50"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
                    ariaHideApp={false}
                  >
                    <div className="bg-white p-6 rounded shadow-lg w-80">
                      <h3 className="text-lg font-semibold mb-4">Add a Skill</h3>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                        placeholder="Enter new skill"
                      />
                      {addSkillError && <div className="text-red-600 text-sm mb-2">{addSkillError}</div>}
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={() => setShowAddSkill(false)}
                        >Cancel</button>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={async () => {
                            const trimmed = newSkill.trim();
                            if (!trimmed) {
                              setAddSkillError('Skill cannot be empty');
                              return;
                            }
                            if (skills.includes(trimmed)) {
                              setAddSkillError('Skill already exists');
                              return;
                            }
                            // Add skill to backend
                            try {
                              const updatedSkills = [...skills, trimmed];
                              await profileApi.updateSkills(updatedSkills);
                              setShowAddSkill(false);
                              setNewSkill('');
                              setAddSkillError(null);
                              await fetchProfileData();
                            } catch (err: any) {
                              setAddSkillError(err.message || 'Failed to add skill');
                            }
                          }}
                        >Add</button>
                      </div>
                    </div>
                  </Modal>
                  </>
                )}
                </div>

              {/* Experience */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Experience</h2>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Technology, Healthcare..."
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    {profile.experience_years !== undefined && profile.experience_years > 0 
                      ? `${profile.experience_years} year${profile.experience_years !== 1 ? 's' : ''} of experience`
                      : 'No experience listed'
                    }
                    {profile.industry && ` in ${profile.industry}`}
                  </p>
                )}
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Education</h2>
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
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Certifications</h2>
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                ) : (
                <div className="space-y-2 text-sm">
                    {profile.first_name && profile.last_name && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Name:</span>
                        <span className="text-gray-700">{profile.first_name} {profile.last_name}</span>
                      </div>
                    )}
                  {profile.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-700">{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-700">{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Website:</span>
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Professional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional</h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Senior Developer"
                      />
                    </div>
                  </div>
                ) : (
                <div className="space-y-2 text-sm">
                  {profile.company && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Company:</span>
                      <span className="text-gray-700">{profile.company}</span>
                    </div>
                  )}
                  {profile.job_title && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Title:</span>
                      <span className="text-gray-700">{profile.job_title}</span>
                    </div>
                  )}
                  {profile.industry && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Industry:</span>
                      <span className="text-gray-700">{profile.industry}</span>
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Social Links */}
                <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Links</h3>
                {isEditing ? (
                  <div className="space-y-3">
                    {['LinkedIn', 'GitHub', 'Twitter', 'Facebook', 'Instagram'].map(platform => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{platform}</label>
                        <input
                          type="url"
                          value={formData.social_links[platform.toLowerCase()] || ''}
                          onChange={(e) => handleSocialLinkChange(platform.toLowerCase(), e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder={`${platform} profile URL`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {socialLinks && Object.keys(socialLinks.social_links).length > 0 ? (
                      Object.entries(socialLinks.social_links).map(([platform, url]) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <span className="text-gray-500 capitalize">{platform}:</span>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {platform}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No social links</p>
                    )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 