import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Eventify</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={isActive('/') ? 'navbar-item-active' : 'navbar-item'}>
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/events"
                  className={
                    isActive('/events') ? 'navbar-item-active' : 'navbar-item'
                  }>
                  Events
                </Link>
                <Link
                  to="/add-event"
                  className={
                    isActive('/add-event')
                      ? 'navbar-item-active'
                      : 'navbar-item'
                  }>
                  Add Event
                </Link>
                <Link
                  to="/my-events"
                  className={
                    isActive('/my-events')
                      ? 'navbar-item-active'
                      : 'navbar-item'
                  }>
                  My Events
                </Link>
              </>
            ) : null}
          </div>

          {/* User Profile / Auth */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden border-t border-gray-200 pt-2 pb-3">
            <div className="flex flex-col space-y-1">
              <Link
                to="/events"
                className={
                  isActive('/events') ? 'navbar-item-active' : 'navbar-item'
                }>
                Events
              </Link>
              <Link
                to="/add-event"
                className={
                  isActive('/add-event') ? 'navbar-item-active' : 'navbar-item'
                }>
                Add Event
              </Link>
              <Link
                to="/my-events"
                className={
                  isActive('/my-events') ? 'navbar-item-active' : 'navbar-item'
                }>
                My Events
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
