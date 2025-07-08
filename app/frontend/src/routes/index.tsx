import { createBrowserRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import Dashboard from '../components/Dashboard';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import Layout from '../components/navigation/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // Layout with Navbar
    children: [
      { path: '/', element: <Login /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/profile', element: <ProfileView /> },
      { path: '/profile/edit', element: <ProfileEdit /> },
      { path: '/posts/create', element: <PostCreate /> },
      { path: '/posts', element: <PostList /> },
      { path: '/jobs', element: <JobList /> },
      { path: '/messages', element: <MessageList /> },
      { path: '/feed', element: <Feed /> },
      { path: '/message', element: <MessageList /> },
    ]
  }
]); 