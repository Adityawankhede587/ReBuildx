import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Tag,
  Phone,
  MessageCircle,
  Mail,
  Heart,
  Edit,
  Trash2,
  Star,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSaved, toggleWishlist } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/listings/${id}`);
      if (res.data.success) {
        setListing(res.data.listing);
        setDiscountPercent(res.data.discountPercent || 0);
        setIsOwner(res.data.isOwner || false);
      }
    } catch (err) {
      toast.error('Could not load material details.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id, user]);

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this material listing? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      const res = await api.delete(`/listings/${id}`);
      if (res.data.success) {
        toast.success('Listing deleted successfully.');
        navigate('/');
      }
    } catch (err) {
      toast.error('Failed to delete listing.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warn('Please log in to leave a review.');
      return;
    }
    if (!comment.trim()) {
      toast.warn('Please enter a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/listings/${id}/reviews`, { rating, comment });
      if (res.data.success) {
        toast.success('Review submitted successfully!');
        setComment('');
        setRating(5);
        fetchListing(); // reload reviews
      }
    } catch (err) {
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await api.delete(`/listings/${id}/reviews/${reviewId}`);
      if (res.data.success) {
        toast.info('Review deleted.');
        fetchListing();
      }
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

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

  if (!listing) return null;

  const saved = isSaved(listing._id);
  const totalLotPrice = (listing.price || 0) * (listing.quantity || 1);
  const rawPhone = listing.contactPhone || listing.owner?.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const sellerEmail = listing.contactEmail || listing.owner?.email || 'seller@rebuildx.in';

  const waMessage = encodeURIComponent(
    `Hello! I saw your surplus listing for "${listing.title}" on ReBuildX (Rate: ₹${listing.price}/${listing.unit}, Qty: ${listing.quantity} ${listing.unit}). Is this lot still available for site pickup?`
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* Breadcrumb & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
            <ArrowLeft size={16} /> Back to All Materials
          </Link>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Category: <strong style={{ color: '#15803d' }}>{listing.category}</strong>
          </div>
        </div>

        {/* Main Grid: Left Details & Right Seller Hub */}
        <div className="detail-grid">
          {/* Left Column: Media & Specifications */}
          <div>
            {/* Title & Metadata */}
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.5rem' }}>
              {listing.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={15} color="#ef4444" />
                {listing.location}, {listing.country || 'India'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={15} />
                Listed {new Date(listing.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* High-Res Image Card */}
            <div className="detail-img-box">
              <img
                src={listing.image?.url || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60'}
                alt={listing.title}
                className="detail-img"
              />
              <span className="condition-pill" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {listing.condition || 'Surplus'}
              </span>
              {discountPercent > 0 && (
                <span className="discount-tag" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                  {discountPercent}% OFF RETAIL
                </span>
              )}
            </div>

            {/* Specifications Card */}
            <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Material Specifications
              </h3>

              <table className="spec-table">
                <tbody>
                  <tr>
                    <td className="label">Available Quantity:</td>
                    <td className="value">{listing.quantity} {listing.unit}</td>
                  </tr>
                  <tr>
                    <td className="label">Unit Offer Price:</td>
                    <td className="value" style={{ color: '#15803d', fontSize: '1.1rem' }}>
                      ₹{listing.price?.toLocaleString('en-IN')} / {listing.unit}
                    </td>
                  </tr>
                  {listing.originalPrice > listing.price && (
                    <tr>
                      <td className="label">Original Retail Price:</td>
                      <td className="value" style={{ color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{listing.originalPrice?.toLocaleString('en-IN')} / {listing.unit}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="label">Estimated Total Lot:</td>
                    <td className="value">₹{totalLotPrice.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="label">Pickup Location:</td>
                    <td className="value">{listing.location}, {listing.country || 'India'}</td>
                  </tr>
                  <tr>
                    <td className="label">Material Quality:</td>
                    <td className="value">
                      <span style={{ color: '#15803d', fontWeight: 700 }}>
                        ✓ Inspected Unused Surplus Stock
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Material Description & Condition Notes:
                </h4>
                <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Owner Controls (If logged-in user is seller) */}
            {isOwner && (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '1rem', padding: '1.25rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>You are the seller of this material</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Manage your surplus listing details or remove it once sold.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/listing/${listing._id}/edit`} className="btn-outline">
                    <Edit size={16} /> Edit Material
                  </Link>
                  <button onClick={handleDeleteListing} disabled={deleting} className="btn-outline" style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
                    <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Seller Communication Hub & Reviews */}
          <div>
            {/* Seller Contact Card */}
            <div className="seller-hub-card">
              <div className="seller-hub-header">
                <div className="seller-avatar">
                  {listing.owner?.username?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {listing.owner?.username || 'Verified Surplus Seller'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                    <ShieldCheck size={13} style={{ display: 'inline', marginRight: '3px' }} />
                    {listing.owner?.role || 'Contractor'} • Verified Seller
                  </p>
                </div>
              </div>

              {/* Price summary badge */}
              <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Surplus Lot Price:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{listing.price?.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}> / {listing.unit}</span>
                {discountPercent > 0 && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <a
                href={`https://wa.me/${waPhone}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-action"
              >
                <MessageCircle size={20} />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="btn-call-action"
                style={{ marginBottom: '0.75rem' }}
              >
                <Phone size={18} />
                <span>Call Seller ({rawPhone})</span>
              </a>

              <a
                href={`mailto:${sellerEmail}?subject=${encodeURIComponent('ReBuildX Material Inquiry: ' + listing.title)}&body=${waMessage}`}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
              >
                <Mail size={16} />
                <span>Email Seller</span>
              </a>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(listing._id)}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', borderColor: saved ? '#ef4444' : '#e2e8f0', color: saved ? '#ef4444' : '#334155' }}
              >
                <Heart size={16} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : 'currentColor'} />
                <span>{saved ? 'Saved to Wishlist' : 'Bookmark Material'}</span>
              </button>
            </div>

            {/* Reviews Section */}
            <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Seller & Material Reviews ({listing.reviews?.length || 0})
              </h3>

              {/* Leave Review Form */}
              {user ? (
                <form onSubmit={handleReviewSubmit} style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Rate Material Quality:
                  </label>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ color: star <= rating ? '#f59e0b' : '#cbd5e1', padding: '2px' }}
                      >
                        <Star size={20} fill={star <= rating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Share details about material condition, pickup experience, and packaging..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-control"
                    style={{ marginBottom: '0.75rem' }}
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', textAlign: 'center' }}>
                  <Link to="/login" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'underline' }}>Log in</Link> to leave a review for this seller.
                </div>
              )}

              {/* Review Cards List */}
              {listing.reviews && listing.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {listing.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        padding: '0.85rem',
                        background: '#f8fafc',
                        borderRadius: '0.65rem',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                            @{rev.author?.username || 'Contractor'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ({rev.author?.role || 'Member'})
                          </span>
                        </div>
                        {user && rev.author?._id === user._id && (
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            style={{ color: '#ef4444', fontSize: '0.75rem' }}
                            title="Delete review"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '2px', marginBottom: '0.4rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            fill={s <= rev.rating ? '#f59e0b' : 'none'}
                            color={s <= rev.rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>
                  No reviews yet for this material. Be the first to leave feedback!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetail;
