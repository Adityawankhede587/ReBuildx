import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { Bookmark, PackageOpen, ArrowRight, Loader2 } from 'lucide-react';

const Wishlist = () => {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/wishlist');
        if (res.data.success) {
          setSavedItems(res.data.wishlist || []);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Bookmark size={26} color="#15803d" />
              <span>My Saved Materials</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Track bookmarked surplus materials for your upcoming construction projects.
            </p>
          </div>

          <Link to="/" className="btn-outline">
            Browse More Materials <ArrowRight size={16} />
          </Link>
        </div>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <Bookmark size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Login to View Saved Materials</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Sign in with your ReBuildX account to bookmark and manage surplus materials.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn-primary">Log in</Link>
              <Link to="/signup" className="btn-outline">Sign up</Link>
            </div>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader2 size={36} className="animate-spin" color="#15803d" />
            <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>Loading saved materials...</p>
          </div>
        ) : savedItems.length > 0 ? (
          <div className="cards-grid">
            {savedItems.map((item) => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <PackageOpen size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              You haven't bookmarked any surplus construction materials yet. Click the heart icon on any card to save it here.
            </p>
            <Link to="/" className="btn-primary">
              Explore Available Surplus
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
