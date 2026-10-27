import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
  Lock,
  Save,
  Package,
  Bookmark,
  PlusCircle,
  Calendar,
  KeyRound,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const ROLES_LIST = [
  { value: 'Contractor', label: 'Contractor / Subcontractor' },
  { value: 'Builder', label: 'Builder / Real Estate Developer' },
  { value: 'Homeowner', label: 'Homeowner / Individual' },
  { value: 'Supplier', label: 'Material Supplier / Demolition Vendor' },
  { value: 'Recycler', label: 'Recycler / Scrap Processor' },
  { value: 'Other', label: 'Other Construction Professional' }
];

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'security'
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'Contractor'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    listingsCount: 0,
    wishlistCount: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success && res.data.user) {
          const u = res.data.user;
          setProfileData({
            username: u.username || '',
            email: u.email || '',
            phone: u.phone || '',
            role: u.role || 'Contractor'
          });
          setStats(res.data.stats || { listingsCount: 0, wishlistCount: 0 });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters.');
    }

    setSubmittingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Login Required</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please sign in to view and edit your profile.</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn-primary">Log in</Link>
            <Link to="/signup" className="btn-outline">Create Account</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={40} className="animate-spin" color="#15803d" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, padding: '2rem 1.25rem 4rem' }}>
        {/* Profile Card Container */}
        <div className="form-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
          {/* Header with Avatar & Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #15803d, #10b981)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)'
              }}
            >
              {profileData.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {profileData.username}
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ShieldCheck size={16} />
                <span>{profileData.role}</span>
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>• Member since {new Date(user.createdAt || Date.now()).getFullYear()}</span>
              </p>
            </div>
          </div>

          {/* Activity Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.75rem'
            }}
          >
            <Link to="/my-listings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
                <Package size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>My Listed Materials</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.listingsCount} Posted</p>
              </div>
            </Link>

            <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
                <Bookmark size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Saved in Wishlist</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.wishlistCount} Items</p>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.75rem', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('general')}
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: activeTab === 'general' ? '#15803d' : '#64748b',
                borderBottom: activeTab === 'general' ? '2px solid #15803d' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              Account Details
            </button>

            <button
              onClick={() => setActiveTab('security')}
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: activeTab === 'security' ? '#15803d' : '#64748b',
                borderBottom: activeTab === 'security' ? '2px solid #15803d' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              Security & Password
            </button>
          </div>

          {/* Tab 1: General Profile Info */}
          {activeTab === 'general' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Username / Organization Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp / Phone Number (Used for Material Inquiries)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 98220 77889"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Role in Construction *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="role"
                    value={profileData.role}
                    onChange={handleProfileChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <Briefcase size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingProfile}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1rem' }}
              >
                <Save size={18} />
                <span>{submittingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          )}

          {/* Tab 2: Security & Password */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Min 6 characters) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1rem' }}
              >
                <Lock size={18} />
                <span>{submittingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
