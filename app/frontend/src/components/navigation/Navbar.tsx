import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-6 items-center">
            <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition">Profile</Link>
            <Link to="/feed" className="text-gray-700 hover:text-blue-600 font-medium transition">Feed</Link>
            <Link to="/posts/create" className="text-gray-700 hover:text-blue-600 font-medium transition">Posts</Link>
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition">Jobs</Link>
            <Link to="/message" className="text-gray-700 hover:text-blue-600 font-medium transition">Message</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 