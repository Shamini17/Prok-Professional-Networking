import React from 'react';

interface SocialLink {
  platform: string;
  url: string;
}

interface ProfileHeaderProps {
  avatarUrl?: string;
  name: string;
  title?: string;
  location?: string;
  socialLinks?: SocialLink[];
}

const platformIcons: Record<string, string> = {
  twitter: 'fab fa-twitter',
  linkedin: 'fab fa-linkedin',
  github: 'fab fa-github',
  facebook: 'fab fa-facebook',
  // Add more as needed
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  name,
  title,
  location,
  socialLinks = [],
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 bg-white rounded-lg shadow">
      <img
        src={avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name)}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
      />
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-bold">{name}</h2>
        {title && <div className="text-gray-600 text-lg">{title}</div>}
        {location && <div className="text-gray-500 text-sm">{location}</div>}
        {socialLinks.length > 0 && (
          <div className="flex justify-center md:justify-start gap-4 mt-2">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 text-xl"
              >
                <i className={platformIcons[link.platform] || 'fas fa-link'}></i>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader; 