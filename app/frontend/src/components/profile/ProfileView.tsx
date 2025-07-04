import React, { useEffect, useState, useCallback } from 'react';
import ProfileHeader from './ProfileHeader';
// import { profileApi } from './api';
// import { feedApi } from '../feed/api';
import type { Profile, Post } from '../../types';

interface SocialLink {
  platform: string;
  url: string;
}

// Mock Data
const mockProfile: Profile = {
  id: 1,
  user_id: 1,
  bio: 'Jane Doe is a passionate software engineer with 5 years of experience.',
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Node.js', 'UI/UX'],
  experience: [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      start_date: '2019-01',
      end_date: '2021-12',
      description: 'Worked on building scalable web applications.'
    },
    {
      id: 2,
      title: 'UI Engineer',
      company: 'Designify',
      start_date: '2022-01',
      end_date: 'Present',
      description: 'Leading UI/UX initiatives.'
    }
  ],
  education: [
    {
      id: 1,
      school: 'State University',
      degree: 'BSc',
      field: 'Computer Science',
      start_date: '2015',
      end_date: '2019'
    }
  ]
};

const mockPosts: Post[] = [
  {
    id: 1,
    user_id: 1,
    content: 'Excited to share my new project on GitHub!',
    created_at: new Date().toISOString(),
    likes: 12,
    comments: []
  },
  {
    id: 2,
    user_id: 1,
    content: 'Attended a great React conference last week.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes: 8,
    comments: []
  }
];

const mockSocialLinks: SocialLink[] = [
  { platform: 'linkedin', url: 'https://linkedin.com/in/janedoe' },
  { platform: 'github', url: 'https://github.com/janedoe' },
];

const mockContactInfo = {
  email: 'jane.doe@example.com',
  phone: '+1 555 123 4567',
};

const mockConnections = {
  count: 120,
  mutual: 8,
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button
        className="w-full flex justify-between items-center py-2 px-4 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-lg">{title}</span>
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && <div className="p-4 bg-white border rounded-b shadow-sm">{children}</div>}
    </div>
  );
};

const mockApi = {
  getProfile: () => new Promise<Profile>((res) => setTimeout(() => res(mockProfile), 500)),
  getPosts: () => new Promise<Post[]>((res) => setTimeout(() => res(mockPosts), 500)),
};

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false); // For mock, no more pages

  useEffect(() => {
    setLoadingProfile(true);
    mockApi.getProfile()
      .then((data) => { setProfile(data); setLoadingProfile(false); })
      .catch(() => { setError('Failed to load profile'); setLoadingProfile(false); });
  }, []);

  useEffect(() => {
    setLoadingPosts(true);
    mockApi.getPosts()
      .then((data) => { setPosts(data); setLoadingPosts(false); })
      .catch(() => { setError('Failed to load posts'); setLoadingPosts(false); });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {loadingProfile ? (
        <div className="text-center">Loading profile...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : profile && (
        <>
          <ProfileHeader
            avatarUrl={undefined}
            name={profile.bio.split(' ')[0]}
            title={profile.bio}
            location={profile.location}
            socialLinks={mockSocialLinks}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <CollapsibleSection title="Bio & Skills">
                <div>{profile.bio}</div>
                <div className="mt-2">
                  <span className="font-semibold">Skills:</span>
                  <ul className="list-disc list-inside">
                    {profile.skills.length
                      ? profile.skills.map((skill) => <li key={skill}>{skill}</li>)
                      : <li>No skills listed.</li>}
                  </ul>
                </div>
              </CollapsibleSection>
              <CollapsibleSection title="Work Experience">
                {profile.experience.length ? (
                  <ul className="space-y-2">
                    {profile.experience.map((exp) => (
                      <li key={exp.id}>
                        <div className="font-semibold">{exp.title} @ {exp.company}</div>
                        <div className="text-sm text-gray-500">{exp.start_date} - {exp.end_date}</div>
                        <div>{exp.description}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No experience listed.</div>
                )}
              </CollapsibleSection>
              <CollapsibleSection title="Education">
                {profile.education.length ? (
                  <ul className="space-y-2">
                    {profile.education.map((edu) => (
                      <li key={edu.id}>
                        <div className="font-semibold">{edu.degree} in {edu.field}</div>
                        <div className="text-sm text-gray-500">{edu.school} ({edu.start_date} - {edu.end_date})</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No education listed.</div>
                )}
              </CollapsibleSection>
              <CollapsibleSection title="Contact Information">
                <div>Email: {mockContactInfo.email}</div>
                <div>Phone: {mockContactInfo.phone}</div>
              </CollapsibleSection>
            </div>
            <div>
              <div className="mb-4 p-4 bg-white rounded shadow flex flex-col items-center">
                <div className="text-lg font-semibold">Connections</div>
                <div className="text-2xl font-bold">{mockConnections.count}</div>
                <div className="text-sm text-gray-500">{mockConnections.mutual} mutual connections</div>
              </div>
              <CollapsibleSection title="Activity Timeline">
                {loadingPosts ? (
                  <div>Loading activity...</div>
                ) : (
                  <ul className="space-y-4">
                    {posts.length ? posts.map((post) => (
                      <li key={post.id} className="border-b pb-2">
                        <div className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
                        <div>{post.content}</div>
                        <div className="text-xs text-gray-400">Likes: {post.likes}</div>
                      </li>
                    )) : (
                      <li>No recent activity.</li>
                    )}
                  </ul>
                )}
              </CollapsibleSection>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileView; 