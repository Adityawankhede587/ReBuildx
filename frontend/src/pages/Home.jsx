import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import ListingCard from '../components/ListingCard';
import Footer from '../components/Footer';
import {
  Sparkles,
  SlidersHorizontal,
  PackageOpen,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Loader2
} from 'lucide-react';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || 'All';
  const activeCondition = searchParams.get('condition') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const sortOption = searchParams.get('sort') || 'newest';

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'All') params.append('category', activeCategory);
      if (activeCondition && activeCondition !== 'All') params.append('condition', activeCondition);
      if (searchTerm) params.append('search', searchTerm);
      if (sortOption) params.append('sort', sortOption);

      const res = await api.get(`/listings?${params.toString()}`);
      if (res.data.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeCategory, activeCondition, searchTerm, sortOption]);

  const handleCategorySelect = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  const handleConditionSelect = (cond) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cond === 'All') {
      nextParams.delete('condition');
    } else {
      nextParams.set('condition', cond);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (e) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', e.target.value);
    setSearchParams(nextParams);
  };

  const handleNavbarSearch = (term) => {
    const nextParams = new URLSearchParams(searchParams);
    if (term.trim()) {
      nextParams.set('search', term.trim());
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onSearch={handleNavbarSearch} />
      <CategoryBar activeCategory={activeCategory} onSelectCategory={handleCategorySelect} />

      <main className="container" style={{ flex: 1 }}>
        {/* Hero Section */}
        {activeCategory === 'All' && !searchTerm && (
          <div className="hero-banner">
            <div className="hero-content">
              <div className="hero-tag">
                <Sparkles size={14} />
                <span>Circular Construction Marketplace</span>
              </div>
              <h1 className="hero-title">
                Build More. <span>Waste Less.</span>
              </h1>
              <p className="hero-subtitle">
                Buy and sell surplus construction materials — steel, cement, bricks, tiles, electrical, plumbing — directly from verified builders and contractors at up to 50% discount.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/listing/new" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                  Post Your Surplus Material <ArrowRight size={18} />
                </Link>
                <a href="#marketplace-grid" className="btn-outline" style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Explore {listings.length}+ Materials
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Sorting Header */}
        <div id="marketplace-grid" style={{ paddingTop: '1rem' }}>
          <div className="filter-bar">
            {/* Left side: Heading & Item Count */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activeCategory !== 'All' ? activeCategory : 'All Available Surplus Materials'}
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                  {listings.length} items
                </span>
              </h2>
              {searchTerm && (
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Search results for "<strong style={{ color: '#0f172a' }}>{searchTerm}</strong>" —{' '}
                  <button onClick={() => handleNavbarSearch('')} style={{ color: '#15803d', fontWeight: 600, textDecoration: 'underline' }}>
                    Clear Search
                  </button>
                </p>
              )}
            </div>

            {/* Right side: Sort and Condition filter */}
            <div className="filter-group">
              {/* Condition Filter */}
              <select
                value={activeCondition}
                onChange={(e) => handleConditionSelect(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Conditions</option>
                <option value="Brand New / Surplus">Brand New / Surplus</option>
                <option value="Like New / Unused">Like New / Unused</option>
                <option value="Gently Used / Salvaged">Gently Used / Salvaged</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="filter-select"
              >
                <option value="newest">Sort: Newly Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
            </div>
          </div>

          {/* Cards Grid or Loader */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
              <Loader2 size={40} className="animate-spin" color="#15803d" />
              <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading available materials...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="cards-grid">
              {listings.map((item) => (
                <ListingCard key={item._id} listing={item} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', margin: '2rem 0' }}>
              <div style={{ background: '#f1f5f9', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#64748b' }}>
                <PackageOpen size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No Surplus Materials Found</h3>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                We couldn't find any materials matching your filter or query. Try resetting your search or category filter.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setSearchParams({})}
                  className="btn-primary"
                >
                  Browse All Materials
                </button>
                <Link to="/listing/new" className="btn-outline">
                  Post Surplus Material
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
