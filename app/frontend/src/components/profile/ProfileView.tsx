import React, { useState, useEffect } from 'react';
import { getProfile } from './api';
import type { ProfileData } from './api';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
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
      <div className="max-w-4xl mx-auto p-4">
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
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">No profile data available</p>
        </div>
      </div>
    );
  }

  const skills = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(s => s) : [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profile.image_url ? (
                <img 
                  src={profile.image_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-2xl font-bold">
                    {profile.first_name?.[0] || profile.username?.[0] || 'U'}
                  </span>
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
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              {profile.bio && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
                  <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {profile.experience_years !== undefined && profile.experience_years > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Experience</h2>
                  <p className="text-gray-600">
                    {profile.experience_years} year{profile.experience_years !== 1 ? 's' : ''} of experience
                    {profile.industry && ` in ${profile.industry}`}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
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
              </div>

              {/* Professional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional</h3>
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
              </div>

              {/* Member Since */}
              {profile.created_at && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Member Since</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 