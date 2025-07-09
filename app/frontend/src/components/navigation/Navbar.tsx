import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return null; // Don't show navbar for unauthenticated users
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo/Brand */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Prok</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/feed" 
                className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>Feed</span>
              </Link>
              
              <Link 
                to="/posts" 
                className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Posts</span>
              </Link>
              
              <Link 
                to="/posts/create" 
                className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Post</span>
              </Link>
              
              <Link 
                to="/jobs" 
                className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <span>Jobs</span>
              </Link>
              
              <Link 
                to="/messages" 
                className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Messages</span>
              </Link>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Profile Link */}
            <Link 
              to="/profile" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition duration-200"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <span className="hidden md:block font-medium">
                {user?.first_name || user?.username || 'User'}
              </span>
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium transition duration-200 px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
          <Link to="/feed" className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">Feed</Link>
          <Link to="/posts" className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">Posts</Link>
          <Link to="/posts/create" className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">Create Post</Link>
          <Link to="/jobs" className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">Jobs</Link>
          <Link to="/messages" className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">Messages</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 