import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Prok Professional Network</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username || 'User'}!</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Management</h2>
            <div className="space-y-3">
              <Link
                to="/profile"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700"
              >
                View Profile
              </Link>
              <Link
                to="/profile/edit"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Posts</h2>
            <div className="space-y-3">
              <Link
                to="/posts"
                className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700"
              >
                View Posts
              </Link>
              <Link
                to="/posts/create"
                className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Create Post
              </Link>
            </div>
          </div>

          {/* Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Board</h2>
            <div className="space-y-3">
              <Link
                to="/jobs"
                className="block w-full bg-orange-600 text-white text-center py-2 px-4 rounded-md hover:bg-orange-700"
              >
                Browse Jobs
              </Link>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Messaging</h2>
            <div className="space-y-3">
              <Link
                to="/messages"
                className="block w-full bg-teal-600 text-white text-center py-2 px-4 rounded-md hover:bg-teal-700"
              >
                View Messages
              </Link>
            </div>
          </div>

          {/* Feed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Feed</h2>
            <div className="space-y-3">
              <Link
                to="/feed"
                className="block w-full bg-pink-600 text-white text-center py-2 px-4 rounded-md hover:bg-pink-700"
              >
                View Feed
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-2 text-gray-600">
              <p>Profile Completion: 75%</p>
              <p>Posts Created: 3</p>
              <p>Connections: 12</p>
              <p>Messages: 5</p>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Prok!</h2>
          <p className="text-gray-600 mb-4">
            This is your professional networking dashboard. Here you can manage your profile, 
            create posts, browse jobs, and connect with other professionals.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Complete your profile to increase visibility</li>
              <li>• Create your first post to share your expertise</li>
              <li>• Browse the job board for opportunities</li>
              <li>• Connect with other professionals</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 