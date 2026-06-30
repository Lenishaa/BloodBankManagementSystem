import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { logout, manager } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="app-layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo">
              <span className="logo-icon">🩸</span>
              <span className="logo-text">Blood Bank Management</span>
            </Link>
          </div>
          <div className="header-right">
            <span className="user-info">
              {manager?.bloodBankName} - {manager?.fullName}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <nav className="nav">
            <Link
              to="/"
              className={`nav-link ${isActive('/') && !isActive('/blood-stocks') && !isActive('/donors') && !isActive('/reports') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </Link>
            <Link
              to="/blood-stocks"
              className={`nav-link ${isActive('/blood-stocks') ? 'active' : ''}`}
            >
              <span className="nav-icon">🩸</span>
              <span className="nav-text">Blood Stocks</span>
            </Link>
            <Link
              to="/donors"
              className={`nav-link ${isActive('/donors') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Donors</span>
            </Link>
            <Link
              to="/reports"
              className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Reports</span>
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;