import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { IconMenu, IconHome, IconPlus, IconLogout } from '../../components/icons';

// Each sidebar item declares where it links and whether the match must be exact.
// `end: true` on Overview means it's only "active" at exactly /dashboard,
// not when the user is at /dashboard/payments/new.
const NAV_ITEMS = [
  { label: 'Overview', to: '/dashboard', end: true, icon: <IconHome /> },
  { label: 'New Payment', to: '/dashboard/payments/new', end: false, icon: <IconPlus /> },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/* transition-all animates the width change when open/closed */}
      <aside
        className={`flex flex-col border-r border-white/10 bg-[#1a1a1a] transition-all duration-300 ${open ? 'w-60' : 'w-16'
          }`}
      >
        {/* Header row — always visible, holds the toggle button */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          {open && (
            <span className="text-sm font-semibold text-white">Freelancer</span>
          )}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="text-white/50 hover:text-white transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            <IconMenu />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon}
              {/* Label only visible when sidebar is open */}
              {open && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout — pinned to bottom */}
        <div className="border-t border-white/10 p-4">
          {open && (
            <p className="mb-3 truncate text-xs text-white/40">{user?.email}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-white/50 hover:text-red-400 transition-colors w-full"
          >
            <IconLogout />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─z content ─────────────────────────────────────────────────── */}
      {/* <Outlet /> is replaced by the matching child route component */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

