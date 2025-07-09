import { createBrowserRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Dashboard from '../components/Dashboard';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import Layout from '../components/navigation/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import { RouterProvider } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />, 
    children: [
      // Always show login page first
      { index: true, element: <Login /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      // Protected routes (authentication required)
      { 
        path: '', 
        element: <Layout />, 
        children: [
          { 
            path: 'profile',
            element: (
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'dashboard', 
            element: (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'profile/edit', 
            element: (
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'posts/create', 
            element: (
              <ProtectedRoute>
                <PostCreate />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'posts', 
            element: (
              <ProtectedRoute>
                <PostList />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'jobs', 
            element: (
              <ProtectedRoute>
                <JobList />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'messages', 
            element: (
              <ProtectedRoute>
                <MessageList />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'feed', 
            element: (
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            ) 
          },
          { 
            path: 'message', 
            element: (
              <ProtectedRoute>
                <MessageList />
              </ProtectedRoute>
            ) 
          },
        ]
      }
    ]
  }
]); 