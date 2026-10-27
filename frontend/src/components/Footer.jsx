import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Leaf, Shield, Truck, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand" style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#15803d', color: 'white', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex' }}>
                <Recycle size={20} />
              </div>
              <h4 style={{ margin: 0 }}>ReBuild<span style={{ color: '#22c55e' }}>X</span></h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
              “Build More. Waste Less.” — India's surplus construction material reuse marketplace connecting builders, contractors, and homeowners.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: '9999px', color: '#34d399' }}>
                <Leaf size={12} /> Carbon Saved
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: '9999px', color: '#60a5fa' }}>
                <Shield size={12} /> Verified Surplus
              </span>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="footer-col">
            <h5>Popular Materials</h5>
            <ul>
              <li><Link to="/?category=Cement">Cement Bags (OPC / PPC)</Link></li>
              <li><Link to="/?category=Steel%20%26%20Iron">TMT Steel Rebars & Beams</Link></li>
              <li><Link to="/?category=Bricks%20%26%20Blocks">Kiln-Fired Red Bricks & AAC</Link></li>
              <li><Link to="/?category=Tiles%20%26%20Marble">Vitrified Floor Tiles & Marble</Link></li>
              <li><Link to="/?category=Pipes%20%26%20Plumbing">uPVC & CPVC Pipes & Fittings</Link></li>
            </ul>
          </div>

          {/* Platform & Quick Links */}
          <div className="footer-col">
            <h5>ReBuildX Platform</h5>
            <ul>
              <li><Link to="/">Explore All Surplus</Link></li>
              <li><Link to="/listing/new">List Your Surplus Material</Link></li>
              <li><Link to="/wishlist">Saved Materials / Wishlist</Link></li>
              <li><Link to="/login">Contractor & Builder Login</Link></li>
              <li><Link to="/signup">Register as Seller / Buyer</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="footer-col">
            <h5>Marketplace Support</h5>
            <ul>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="#22c55e" />
                <span>support@rebuildx.in</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} color="#22c55e" />
                <span>+91 98765 43210</span>
              </li>
              <li style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                Empowering green construction across India (Mumbai, Pune, Bengaluru, Delhi NCR, Ahmedabad, Hyderabad).
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} ReBuildX Technologies. Empowering circular construction.</span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#terms">Terms of Service</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#sustainability">Circular Impact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
