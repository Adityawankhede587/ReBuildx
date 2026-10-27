import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  ShieldCheck,
  PackageOpen,
  DollarSign,
  Layers,
  ArrowRight,
  Loader2
} from 'lucide-react';

const MyListings = () => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyListings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/my-listings');
      if (res.data.success) {
        setMyListings(res.data.listings || []);
      }
    } catch (err) {
      console.error('Error fetching my listings:', err);
      toast.error('Could not load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await api.delete(`/listings/${id}`);
      if (res.data.success) {
        toast.success('Listing deleted successfully.');
        setMyListings((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate total inventory value
  const totalValue = myListings.reduce(
    (acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1),
    0
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Package size={26} color="#15803d" />
              <span>My Surplus Listings</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Manage, edit, or remove surplus construction materials you have posted on ReBuildX.
            </p>
          </div>

          <Link to="/listing/new" className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <PlusCircle size={18} />
            <span>Post New Material</span>
          </Link>
        </div>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <Package size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Login to View Your Listings</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Please log in to manage your active surplus materials.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn-primary">Log in</Link>
              <Link to="/signup" className="btn-outline">Sign up</Link>
            </div>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader2 size={36} className="animate-spin" color="#15803d" />
            <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>Loading your materials...</p>
          </div>
        ) : myListings.length > 0 ? (
          <div>
            {/* Seller Inventory Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Listings</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{myListings.length} Materials</p>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Estimated Lot Value</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem' }}>₹{totalValue.toLocaleString('en-IN')}</p>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Seller Role</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.45rem' }}>
                  <ShieldCheck size={16} color="#15803d" style={{ display: 'inline', marginRight: '4px' }} />
                  {user.role || 'Contractor'}
                </p>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="cards-grid">
              {myListings.map((item) => {
                const imageUrl =
                  item.image?.url ||
                  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60';
                const lotTotal = (item.price || 0) * (item.quantity || 1);

                return (
                  <div
                    key={item._id}
                    className="material-card"
                    style={{ border: '1px solid #e2e8f0', background: 'white' }}
                  >
                    {/* Image */}
                    <div className="card-img-wrapper" style={{ height: '180px' }}>
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="card-img"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60';
                        }}
                      />
                      <span className="condition-pill" style={{ top: '0.5rem', left: '0.5rem', fontSize: '0.7rem' }}>
                        {item.condition || 'Surplus'}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="card-body" style={{ padding: '1rem' }}>
                      <span className="card-category">{item.category}</span>
                      <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                        {item.title}
                      </h3>

                      <div className="card-location" style={{ fontSize: '0.8rem', marginBottom: '0.65rem' }}>
                        <MapPin size={13} color="#ef4444" />
                        <span>{item.location}</span>
                      </div>

                      {/* Quantity & Unit price */}
                      <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.85rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Quantity:</span>
                          <strong style={{ color: '#0f172a' }}>{item.quantity} {item.unit}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '0.2rem' }}>
                          <span>Rate:</span>
                          <strong style={{ color: '#15803d' }}>₹{item.price?.toLocaleString('en-IN')}/{item.unit}</strong>
                        </div>
                      </div>

                      {/* Management Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto' }}>
                        <Link
                          to={`/listing/${item._id}/edit`}
                          className="btn-outline"
                          style={{ padding: '0.45rem', justifyContent: 'center', fontSize: '0.8rem' }}
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => handleDelete(item._id, item.title)}
                          disabled={deletingId === item._id}
                          className="btn-outline"
                          style={{
                            padding: '0.45rem',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: '#dc2626',
                            borderColor: '#fca5a5',
                            background: '#fff5f5'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>{deletingId === item._id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>

                      <Link
                        to={`/listing/${item._id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          fontSize: '0.78rem',
                          color: '#64748b',
                          marginTop: '0.6rem',
                          textDecoration: 'underline'
                        }}
                      >
                        <ExternalLink size={12} /> View live marketplace listing
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <PackageOpen size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>You Haven't Listed Any Surplus Materials Yet</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Turn your unused cement, steel, bricks, tiles, or plumbing into cash while reducing construction waste.
            </p>
            <Link to="/listing/new" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <PlusCircle size={18} />
              <span>Post Your First Surplus Material</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyListings;
