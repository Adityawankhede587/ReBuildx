import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ListingCard = ({ listing }) => {
  const { isSaved, toggleWishlist } = useAuth();
  const saved = isSaved(listing._id);

  const originalPrice = listing.originalPrice || 0;
  const price = listing.price || 0;
  const discountPercent =
    originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing._id);
  };

  const imageUrl =
    listing.image?.url ||
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60';

  return (
    <div className="material-card">
      <Link to={`/listing/${listing._id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Image Box */}
        <div className="card-img-wrapper">
          <img
            src={imageUrl}
            alt={listing.title}
            className="card-img"
            loading="lazy"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60';
            }}
          />

          {/* Condition Tag */}
          <span className="condition-pill">
            <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
            {listing.condition || 'Surplus'}
          </span>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="discount-tag">
              {discountPercent}% OFF
            </span>
          )}

          {/* Wishlist Heart Button */}
          <button
            onClick={handleHeartClick}
            className={`btn-wishlist-heart ${saved ? 'saved' : ''}`}
            title={saved ? 'Remove from Saved' : 'Save Material'}
          >
            <Heart size={16} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : '#64748b'} />
          </button>
        </div>

        {/* Content Body */}
        <div className="card-body">
          <span className="card-category">{listing.category || 'General Surplus'}</span>
          <h3 className="card-title">{listing.title}</h3>

          <div className="card-location">
            <MapPin size={14} color="#ef4444" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {listing.location}, {listing.country || 'India'}
            </span>
          </div>

          <div className="card-pricing-row">
            <div>
              <span className="price-main">₹{price.toLocaleString('en-IN')}</span>
              <span className="price-unit"> / {listing.unit || 'Unit'}</span>
            </div>
            {originalPrice > price && (
              <span className="price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
