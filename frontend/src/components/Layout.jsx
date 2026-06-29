import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  SquareCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Calendar as CalendarIcon
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    const theme = nextMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
  };
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: SquareCheck },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Mobile Header */}
      <header className="d-lg-none glass-card m-2 p-3 d-flex justify-content-between align-items-center">
        <h4 className="m-0 fw-bold text-primary">TaskFlow</h4>
        <div className="d-flex gap-2">
          <button className="btn text-light" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} className="text-dark" />}
          </button>
          <button className="btn text-light" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="d-flex min-vh-100 p-2 gap-2">
        {/* Sidebar */}
        <aside className={`glass-card sidebar ${isSidebarOpen ? 'show' : 'hide'} d-flex flex-column p-3`}>
          <div className="d-none d-lg-block mb-4 text-center">
            <h3 className="fw-bold text-primary">TaskFlow</h3>
            <p className="text-muted small">Smart Management</p>
          </div>

          <nav className="flex-grow-1">
            <ul className="list-unstyled">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path} className="mb-2">
                    <Link
                      to={item.path}
                      className={`nav-link-custom d-flex align-items-center gap-3 p-3 rounded-3 transition-all ${location.pathname === item.path ? 'active' : ''
                        }`}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto pt-4 border-top border-secondary">
            <button
              onClick={toggleTheme}
              className="btn btn-outline-secondary w-100 mb-3 d-flex align-items-center justify-content-center gap-2 border-0"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className="d-flex align-items-center gap-3 mb-4 px-2">
              <div className="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="m-0 fw-bold text-truncate">{user?.fullName}</p>
                <p className="m-0 text-muted small text-truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1 overflow-auto p-3 glass-card">
          <Outlet />
        </main>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar {
          width: 280px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }
        .nav-link-custom {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
        }
        .nav-link-custom:hover {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-color);
        }
        .nav-link-custom.active {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        @media (max-width: 991.98px) {
          .sidebar {
            position: fixed;
            left: ${isSidebarOpen ? '8px' : '-300px'};
            top: 70px;
            bottom: 8px;
            z-index: 1000;
            width: calc(100% - 16px);
          }
        }
        .avatar {
          color: white;
          font-weight: bold;
        }
      `}} />
    </div>
  );
};

export default Layout;
