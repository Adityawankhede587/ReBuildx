import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  UploadCloud,
  PlusCircle,
  ArrowLeft,
  DollarSign,
  MapPin,
  FileText,
  Tag,
  Phone,
  Mail,
  Percent
} from 'lucide-react';

const CATEGORIES_LIST = [
  'Cement',
  'Steel & Iron',
  'Bricks & Blocks',
  'Tiles & Marble',
  'Doors & Windows',
  'Pipes & Plumbing',
  'Electrical',
  'Paints & Finishes',
  'Wood & Timber',
  'Other'
];

const UNITS_LIST = ['Bags', 'Pieces', 'Sq. Ft.', 'Tonnes', 'Kg', 'Meters', 'Liters', 'Units', 'Lots'];

const CONDITIONS_LIST = [
  'Brand New / Surplus',
  'Like New / Unused',
  'Gently Used / Salvaged',
  'Scrap / Recyclable'
];

const NewListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cement',
    condition: 'Brand New / Surplus',
    quantity: 1,
    unit: 'Bags',
    price: '',
    originalPrice: '',
    location: '',
    country: 'India',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Login Required</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>
            Please log in or create an account to list surplus construction materials on ReBuildX.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn-primary">Log in to Post</Link>
            <Link to="/signup" className="btn-outline">Register Account</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const priceNum = Number(formData.price) || 0;
  const origPriceNum = Number(formData.originalPrice) || 0;
  const discountPercent =
    origPriceNum > priceNum && origPriceNum > 0
      ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast.warn('Please enter material title.');
    if (!formData.description.trim()) return toast.warn('Please enter description.');
    if (!formData.price || priceNum <= 0) return toast.warn('Please enter a valid offer price.');
    if (!formData.location.trim()) return toast.warn('Please enter pickup location.');

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('quantity', formData.quantity);
      data.append('unit', formData.unit);
      data.append('price', formData.price);
      data.append('originalPrice', formData.originalPrice || '0');
      data.append('location', formData.location.trim());
      data.append('country', formData.country.trim() || 'India');
      data.append('contactPhone', formData.contactPhone.trim());
      data.append('contactEmail', formData.contactEmail.trim());

      if (imageFile) {
        data.append('image', imageFile);
      } else if (formData.imageUrl.trim()) {
        data.append('imageUrl', formData.imageUrl.trim());
      }

      const res = await api.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Surplus material listed successfully on ReBuildX!');
        navigate(`/listing/${res.data.listing._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, padding: '2rem 1.25rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Cancel & Return to Marketplace
        </Link>

        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
              <PlusCircle size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                List Surplus Construction Material
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Connect directly with nearby contractors and builders to prevent material waste.
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' }} />

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Material Title / Product Name *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Grade 53 UltraTech OPC Cement Bags (40 Bags) or 10mm TMT Rebars (1.5 Tonnes)"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Category & Condition Row */}
            <div className="form-row form-group">
              <div>
                <label className="form-label">Material Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Stock Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="form-control"
                >
                  {CONDITIONS_LIST.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity & Unit Row */}
            <div className="form-row form-group">
              <div>
                <label className="form-label">Quantity Available *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label className="form-label">Unit of Measure *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-control"
                >
                  {UNITS_LIST.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Row */}
            <div className="form-row form-group">
              <div>
                <label className="form-label">Offer / Surplus Price (₹ per unit) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g. 320"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label className="form-label">Original Retail MRP (₹ per unit)</label>
                <input
                  type="number"
                  name="originalPrice"
                  placeholder="e.g. 420 (Optional)"
                  min="0"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Live Discount Calculator Preview */}
            {discountPercent > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontSize: '0.85rem' }}>
                <Percent size={16} />
                <span>
                  Buyers will see a <strong>{discountPercent}% OFF</strong> badge comparing your ₹{priceNum} offer against the ₹{origPriceNum} retail price.
                </span>
              </div>
            )}

            {/* Location & Country Row */}
            <div className="form-row form-group">
              <div>
                <label className="form-label">Pickup Location (Area / City) *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Kothrud Industrial Area, Pune"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Detailed Description & Condition Notes *</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Mention storage conditions (indoor/pallet), manufacturer brand, reason for surplus, packaging state, and pickup loading assistance..."
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Contact Details */}
            <div className="form-row form-group">
              <div>
                <label className="form-label">WhatsApp / Contact Phone Number</label>
                <input
                  type="text"
                  name="contactPhone"
                  placeholder="e.g. +91 98220 77889"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">Inquiry Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  placeholder="e.g. surplus.contractor@gmail.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Image Upload Box */}
            <div className="form-group">
              <label className="form-label">Material Photo (Cloudinary Upload or Web URL)</label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  position: 'relative'
                }}
              >
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: '180px', borderRadius: '0.5rem', margin: '0 auto 0.75rem', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={32} color="#64748b" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Drag and drop image file here, or click below:
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Or paste an image URL:</span>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="form-control"
                  style={{ marginTop: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
              >
                <PlusCircle size={18} />
                <span>{submitting ? 'Publishing Surplus Material...' : 'Publish Surplus Material'}</span>
              </button>
              <Link to="/" className="btn-outline" style={{ padding: '0.85rem 1.25rem' }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewListing;
