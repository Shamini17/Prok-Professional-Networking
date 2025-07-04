import React, { useState, useRef } from 'react';
// import { profileApi } from './api';
import type { Profile } from '../../types';

// Mock Data
const mockProfile: Partial<Profile> = {
  bio: 'Jane Doe is a passionate software engineer with 5 years of experience.',
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Node.js', 'UI/UX'],
};

const mockApi = {
  updateProfile: (data: any) => new Promise((res) => setTimeout(() => res({ success: true }), 1000)),
};

// Reusable Input Component
const InputField = ({ label, value, onChange, type = 'text', error, ...props }: any) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1">{label}</label>
    <input
      type={type}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${error ? 'border-red-500' : 'border-gray-300'}`}
      value={value}
      onChange={onChange}
      {...props}
    />
    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
  </div>
);

const TextAreaField = ({ label, value, onChange, error, ...props }: any) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1">{label}</label>
    <textarea
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${error ? 'border-red-500' : 'border-gray-300'}`}
      value={value}
      onChange={onChange}
      {...props}
    />
    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
  </div>
);

const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const validateRequired = (val: string) => val.trim().length > 0;

const ProfileEdit: React.FC = () => {
  // State management
  const [email, setEmail] = useState('rbabyshamini5@gmail.com');
  const [username, setUsername] = useState('Baby');
  const [bio, setBio] = useState(mockProfile.bio || '');
  const [location, setLocation] = useState(mockProfile.location || '');
  const [skills, setSkills] = useState((mockProfile.skills || []).join(', '));
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time validation
  const validate = () => {
    const errs: any = {};
    if (!validateRequired(username)) errs.username = 'Username is required.';
    if (!validateEmail(email)) errs.email = 'Invalid email address.';
    if (!validateRequired(bio)) errs.bio = 'Bio is required.';
    if (!validateRequired(location)) errs.location = 'Location is required.';
    return errs;
  };

  // Handle image upload (mocked)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setUploadProgress(0);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 200);
    }
  };

  // Drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 200);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await mockApi.updateProfile({ username, email, bio, location, skills });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setSubmitError('Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        {/* Image Upload */}
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer mb-4 relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover mb-2" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <span className="text-gray-400">Upload Avatar</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          {uploadProgress === 100 && <div className="text-green-500 text-sm mt-1">Upload complete!</div>}
        </div>
        {/* Form Fields */}
        <InputField
          label="Username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          error={errors.username}
        />
        <InputField
          label="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextAreaField
          label="Bio"
          value={bio}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
          error={errors.bio}
        />
        <InputField
          label="Location"
          value={location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
          error={errors.location}
        />
        <InputField
          label="Skills (comma separated)"
          value={skills}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
        />
        {/* Add more fields for experience, education, etc. as needed */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
        {success && <div className="text-green-500 text-center mt-2">{success}</div>}
        {submitError && <div className="text-red-500 text-center mt-2">{submitError}</div>}
      </form>
    </div>
  );
};

export default ProfileEdit; 