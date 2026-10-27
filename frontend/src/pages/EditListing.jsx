import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Edit,
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  UploadCloud,
  Loader2
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

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    contactPhone: '',
    contactEmail: '',
    imageUrl: ''
  });

  const [currentImage, setCurrentImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        if (res.data.success) {
          const l = res.data.listing;
          setFormData({
            title: l.title || '',
            description: l.description || '',
            category: l.category || 'Cement',
            condition: l.condition || 'Brand New / Surplus',
            quantity: l.quantity || 1,
            unit: l.unit || 'Bags',
            price: l.price || '',
            originalPrice: l.originalPrice || '',
            location: l.location || '',
            country: l.country || 'India',
            contactPhone: l.contactPhone || '',
            contactEmail: l.contactEmail || '',
            imageUrl: ''
          });
          setCurrentImage(l.image?.url || '');
        }
      } catch (err) {
        toast.error('Could not load listing for editing.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const res = await api.put(`/listings/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Listing updated successfully!');
        navigate(`/listing/${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this surplus material listing?')) {
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

      <main className="container" style={{ flex: 1, padding: '2rem 1.25rem' }}>
        <Link to={`/listing/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Cancel & Return to Material Details
        </Link>

        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
              <Edit size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit Material Listing
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Update quantities, pricing, location, or contact info.
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' }} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Material Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-row form-group">
              <div>
                <label className="form-label">Category *</label>
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

            <div className="form-row form-group">
              <div>
                <label className="form-label">Surplus Offer Price (₹ per unit) *</label>
                <input
                  type="number"
                  name="price"
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
                  min="0"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row form-group">
              <div>
                <label className="form-label">Pickup Location *</label>
                <input
                  type="text"
                  name="location"
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

            <div className="form-group">
              <label className="form-label">Material Description & Notes *</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-row form-group">
              <div>
                <label className="form-label">Contact Phone / WhatsApp</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Photo replacement */}
            <div className="form-group">
              <label className="form-label">Update Material Photo (Optional)</label>
              {currentImage && !imagePreview && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Current Photo:</span>
                  <img src={currentImage} alt="Current" style={{ maxHeight: '120px', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                </div>
              )}

              {imagePreview && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'block', marginBottom: '0.25rem', fontWeight: 700 }}>New Photo Preview:</span>
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: '120px', borderRadius: '0.5rem', border: '1px solid #10b981' }} />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
              >
                <Save size={18} />
                <span>{submitting ? 'Saving Changes...' : 'Save & Update Material'}</span>
              </button>
              <Link to={`/listing/${id}`} className="btn-outline" style={{ padding: '0.85rem 1.25rem' }}>
                Cancel
              </Link>
            </div>
          </form>

          {/* Danger Zone */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid #fee2e2', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c', fontWeight: 800, fontSize: '0.95rem' }}>
                  <AlertTriangle size={18} />
                  <span>Danger Zone</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Permanently remove this surplus material from the marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-outline"
                style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fff5f5' }}
              >
                <Trash2 size={16} />
                <span>{deleting ? 'Deleting...' : 'Delete Material'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;
