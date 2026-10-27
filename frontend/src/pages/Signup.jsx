import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { UserPlus, Recycle, User, Mail, Phone, Lock, Briefcase } from 'lucide-react';

const ROLES_LIST = [
  { value: 'Contractor', label: 'Contractor / Subcontractor' },
  { value: 'Builder', label: 'Builder / Real Estate Developer' },
  { value: 'Homeowner', label: 'Homeowner / Individual' },
  { value: 'Supplier', label: 'Material Supplier / Demolition Vendor' },
];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'Contractor',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await signup(formData);
    setSubmitting(false);
    if (result?.success) {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.25rem' }}>
        <div className="form-card" style={{ maxWidth: '480px', width: '100%', margin: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: '#dcfce7', color: '#15803d', width: '3rem', height: '3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Recycle size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Join ReBuildX</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Trade surplus construction materials. Reduce waste and save costs.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username / Organization Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. PuneContractors or aditya"
                  value={formData.username}
                  onChange={handleChange}
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
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp / Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98220 77889"
                  value={formData.phone}
                  onChange={handleChange}
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
                  value={formData.role}
                  onChange={handleChange}
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

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1rem' }}
            >
              <UserPlus size={18} />
              <span>{submitting ? 'Creating Account...' : 'Create ReBuildX Account'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#15803d', fontWeight: 700 }}>
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;
