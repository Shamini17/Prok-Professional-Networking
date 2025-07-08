import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    capital: false,
    small: false,
    number: false,
    special: false
  });

  // Password validation function
  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      small: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Signup successful! You can now log in.");
        setError(null);
        // If your backend returns a token on signup, you can store it:
        // if (data.access_token) localStorage.setItem("token", data.access_token);
        // Optionally redirect to login page here
      } else {
        setError(data.error || data.msg || "Signup failed");
        setSuccess(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow mt-16 mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign Up</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              className="mt-1 w-full border rounded px-3 py-2"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            {username && (
              <div className="mt-1 text-xs text-gray-600">
                Only letters, numbers, and underscores allowed
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full border rounded px-3 py-2"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              required
            />
            {/* Password validation feedback */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className={`text-xs ${passwordValidation.length ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ At least 8 characters long
                </div>
                <div className={`text-xs ${passwordValidation.capital ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ At least one capital letter (A-Z)
                </div>
                <div className={`text-xs ${passwordValidation.small ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ At least one small letter (a-z)
                </div>
                <div className={`text-xs ${passwordValidation.number ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ At least one number (0-9)
                </div>
                <div className={`text-xs ${passwordValidation.special ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                </div>
              </div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 