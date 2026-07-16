import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { ApiError } from '../../api/client';
import { friendlyError } from '../../api/errorMessages';

// swagger rule -> 3-100 chars, only letters, digits, underscore, dash
const USERNAME_RULE = /^[a-zA-Z0-9_-]{3,100}$/;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // client-side checks -> catch obvious mistakes before hitting the api
    if (!USERNAME_RULE.test(username)) {
      setError('Username must be at least 3 characters (letters, digits, _ or - only).');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({ email, username, password });
      navigate('/market');
    } catch (err) {
      if (err instanceof ApiError) setError(friendlyError(err.code, err.message));
      else setError('Unexpected error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-950 px-4">
      <div className="w-full max-w-sm bg-red-600 rounded-none p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-black mb-1 uppercase tracking-wide">
          LumpaCrypto
        </h1>
        <p className="text-red-100 text-sm mb-6">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-none bg-red-900 text-white placeholder-red-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-none bg-red-900 text-white placeholder-red-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            required
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-none bg-red-900 text-white placeholder-red-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
          />

          {error && (
            <p className="text-white text-sm bg-red-950 rounded-none px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-medium py-2.5 transition"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-red-100 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-black font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}