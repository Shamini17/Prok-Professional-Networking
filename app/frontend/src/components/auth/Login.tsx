import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination from location state
  // const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const success = await login(usernameOrEmail, password);
      if (success) {
        setSuccess("Login successful! Redirecting...");
        setError('');
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 1500); // 1.5 seconds delay
      } else {
        setError("Invalid username/email or password");
        setTimeout(() => {
          navigate('/signup');
        }, 1500);
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3a2d7d] via-[#1a1832] to-[#2d1a4d] transition-colors duration-700">
      <div className="w-full max-w-sm p-8 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col gap-6 animate-fadein">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Log in</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} placeholder="Email" className="px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition w-full pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-purple-300 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402 3.221-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0-1.657-.402-3.221-1.125-4.575m-1.875 2.25A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575" /></svg>
              )}
            </button>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300">Log in</button>
        </form>
        <div className="flex justify-between items-center mt-4">
          <span className="text-white/70 text-sm">Don’t have an account?</span>
          <button type="button" onClick={() => navigate('/signup')} className="text-purple-300 hover:text-purple-400 font-semibold transition">Sign up</button>
        </div>
      </div>
    </div>
  );
};

export default Login; 