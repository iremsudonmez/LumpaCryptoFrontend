import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

// shared shell -> header + nav tabs, pages render into <Outlet />
export function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-1.5 text-sm font-medium rounded-none transition border-b-2 ${
      isActive
        ? 'border-red-600 text-white'
        : 'border-transparent text-neutral-400 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-red-950/95 text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-black border-b border-red-900/40">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold uppercase tracking-wide">
            Lumpa<span className="text-red-600">Crypto</span>
          </h1>
          <nav className="flex gap-1">
            <NavLink to="/market" className={tabClass}>
              Market
            </NavLink>
            <NavLink to="/portfolio" className={tabClass}>
              Portfolio
            </NavLink>
            <NavLink to="/ai" className={tabClass}>
              AI
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-neutral-400">{user.username}</span>}
          <button
            onClick={handleLogout}
            className="rounded-none bg-neutral-800 hover:bg-red-700 px-4 py-1.5 text-sm font-medium transition border border-red-900/40"
          >
            Logout
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}