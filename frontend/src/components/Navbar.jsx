import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Recycle,
  Search,
  PlusCircle,
  Bookmark,
  Package,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onSearch }) => {
  const { user, logout, wishlistCount } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon-box">
              <Recycle size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span>ReBuild<span style={{ color: '#15803d' }}>X</span></span>
              <span className="brand-subtext" style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginTop: '-4px' }}>
                Reuse Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form className="nav-search-bar" onSubmit={handleSearchSubmit}>
            <Search size={18} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search cement, steel rebars, tiles, bricks, pipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="nav-search-input"
            />
          </form>

          {/* Right Action Items */}
          <div className="nav-actions">
            {/* Post Surplus CTA */}
            <Link to="/listing/new" className="btn-primary nav-post-btn" title="Post Surplus Material">
              <PlusCircle size={18} />
              <span className="nav-btn-text">Post Surplus</span>
            </Link>

            {/* Saved Wishlist Button */}
            <Link to="/wishlist" className="btn-saved-badge" title="My Saved Materials">
              <Bookmark size={20} />
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </Link>

            {/* User Auth Controls */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn-outline nav-user-btn"
                  style={{ gap: '0.6rem' }}
                >
                  <div
                    style={{
                      width: '1.8rem',
                      height: '1.8rem',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="nav-user-name" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.username}</span>
                  <ChevronDown size={14} color="#64748b" className="nav-user-chevron" />
                </button>

                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 0.5rem)',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      width: '200px',
                      padding: '0.5rem',
                      zIndex: 100
                    }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.25rem' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user.username}</p>
                      <p style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                        <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {user.role || 'Member'}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#334155',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <User size={16} color="#15803d" />
                      <span>Edit Profile</span>
                    </Link>

                    <Link
                      to="/my-listings"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#334155',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <Package size={16} color="#15803d" />
                      <span>My Listings</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#334155',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <Bookmark size={16} />
                      Saved Materials
                    </Link>

                    <Link
                      to="/listing/new"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#334155',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <PlusCircle size={16} />
                      List Material
                    </Link>

                    <button
                      onClick={logout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#ef4444',
                        borderRadius: '0.5rem',
                        borderTop: '1px solid #f1f5f9',
                        marginTop: '0.25rem'
                      }}
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth-btns" style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn-outline">
                  <LogIn size={16} />
                  <span className="nav-btn-text">Log in</span>
                </Link>
                <Link to="/signup" className="btn-primary" style={{ padding: '0.55rem 1rem' }}>
                  <UserPlus size={16} />
                  <span className="nav-btn-text">Sign up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
