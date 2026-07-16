import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { ApiError } from '../../api/client';
import { friendlyError } from '../../api/errorMessages';
import { Spinner } from '../../components/Spinner';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-red-950/40 px-4">
      <div className="w-full max-w-sm bg-neutral-900/80 border border-red-900/30 rounded-none p-8 shadow-lg shadow-red-950/40">
        <h1 className="text-3xl font-bold text-white mb-1 uppercase tracking-wide">
          Lumpa<span className="text-red-600">Crypto</span>
        </h1>
        <p className="text-neutral-400 text-sm mb-6">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-none bg-neutral-800 text-white placeholder-neutral-500 px-4 py-2.5 outline-none border border-transparent focus:border-red-700 transition"
          />
          <input
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-none bg-neutral-800 text-white placeholder-neutral-500 px-4 py-2.5 outline-none border border-transparent focus:border-red-700 transition"
          />
          <input
            type="password"
            required
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-none bg-neutral-800 text-white placeholder-neutral-500 px-4 py-2.5 outline-none border border-transparent focus:border-red-700 transition"
          />

          {error && (
            <p className="text-red-300 text-sm bg-red-950/60 border border-red-900/40 rounded-none px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-medium py-2.5 transition shadow-md shadow-red-950/50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Creating account...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="text-neutral-400 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-red-500 hover:text-red-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}