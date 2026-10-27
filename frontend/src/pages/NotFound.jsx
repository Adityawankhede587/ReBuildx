import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.25rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ background: '#fee2e2', color: '#dc2626', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertCircle size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Page Not Found</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            The material or page you requested does not exist or has been moved.
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem' }}>
            <ArrowLeft size={18} /> Back to Surplus Materials
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
