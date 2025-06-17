import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const SCRUFF_IMAGES = {
  parkDay: '/images/scruff/kit-active.png',
  deskSetup: '/images/scruff/kit-desk.png',
  smartHome: '/images/scruff/kit-tech.png',
  skincare: '/images/scruff/kit-lifestyle.png',
  trust: '/images/scruff/trust.png',
  tested: '/images/scruff/tested.png',
  noSponsored: '/images/scruff/no-sponsored.png'
};

const App = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCountry, setSearchCountry] = useState('US');
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Advanced search states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    category: '',
    sortBy: 'relevance'
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isUsingAdvancedSearch, setIsUsingAdvancedSearch] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Load categories on component mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/categories`);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const handleProductSearch = async (useAdvanced = false) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setIsUsingAdvancedSearch(useAdvanced);
    
    try {
      let response;
      if (useAdvanced) {
        // Advanced search with filters
        response = await axios.post(`${BACKEND_URL}/api/products/advanced-search`, {
          query: searchQuery,
          country: searchCountry,
          min_price: searchFilters.minPrice ? parseFloat(searchFilters.minPrice) : null,
          max_price: searchFilters.maxPrice ? parseFloat(searchFilters.maxPrice) : null,
          min_rating: searchFilters.minRating ? parseFloat(searchFilters.minRating) : null,
          category: searchFilters.category || null,
          sort_by: searchFilters.sortBy,
          include_suggestions: true
        });
        setSearchResults(response.data.products || []);
        setTotalResults(response.data.total_count || 0);
        setSearchSuggestions(response.data.suggestions || []);
      } else {
        // Basic search
        response = await axios.post(`${BACKEND_URL}/api/products/search`, {
          query: searchQuery,
          country: searchCountry
        });
        setSearchResults(response.data.products || []);
        setTotalResults(response.data.products?.length || 0);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Get search suggestions
    if (value.length >= 2) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/search-suggestions?q=${encodeURIComponent(value)}`);
        setSearchSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Auto-search when suggestion is clicked
    setTimeout(() => {
      if (isUsingAdvancedSearch) {
        handleProductSearch(true);
      } else {
        handleProductSearch();
      }
    }, 100);
  };

  const handleFilterChange = (filterName, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      category: '',
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = () => {
    return searchFilters.minPrice || searchFilters.maxPrice || searchFilters.minRating || 
           searchFilters.category || searchFilters.sortBy !== 'relevance';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    closeMobileMenu();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const KitCard = ({ title, description, imageUrl, affiliateUrl, scruffImage, price }) => (
    <div className="kit-card">
      <div style={{ position: 'relative' }}>
        <img src={imageUrl} alt={title} className="kit-card-image" />
        <div className="kit-card-badge">
          <img src={scruffImage} alt="Scruff tested" />
        </div>
      </div>
      <div className="kit-card-content">
        <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
        <p className="text-sm text-secondary mb-4">{description}</p>
        {price && (
          <div className="text-sm text-accent mb-4 font-medium">{price}</div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-accent">★★★★★</span>
            <span className="text-xs text-muted">Tested</span>
          </div>
          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            View Kit
          </a>
        </div>
      </div>
    </div>
  );

  const FeatureCard = ({ icon, title, description, scruffImage }) => (
    <div className="card text-center">
      <div className="flex justify-center mb-4">
        <div style={{ 
          width: '24px', 
          height: '24px', 
          background: 'rgba(57, 255, 20, 0.1)', 
          border: '1px solid rgba(57, 255, 20, 0.2)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src={scruffImage} alt={title} style={{ width: '16px', height: '16px' }} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-sm text-secondary">{description}</p>
    </div>
  );

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="#" className="logo">
              <div className="logo-icon">U</div>
              unfluffed
            </a>
            <nav className="nav">
              <a href="#kits" className="nav-link" onClick={(e) => handleNavClick(e, 'kits')}>Kits</a>
              <a href="#search" className="nav-link" onClick={(e) => handleNavClick(e, 'search')}>Search</a>
              <a href="#about" className="nav-link" onClick={(e) => handleNavClick(e, 'about')}>About</a>
            </nav>
            <button className="mobile-nav-toggle" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-nav-links">
            <a href="#kits" className="mobile-nav-link" onClick={(e) => handleNavClick(e, 'kits')}>Kits</a>
            <a href="#search" className="mobile-nav-link" onClick={(e) => handleNavClick(e, 'search')}>Search</a>
            <a href="#about" className="mobile-nav-link" onClick={(e) => handleNavClick(e, 'about')}>About</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-icon">U</div>
              No influencer nonsense
            </div>
            <h1 className="hero-title">
              Gear that actually works,<br />
              <span className="text-accent">unfluffed.</span>
            </h1>
            <p className="hero-subtitle">
              Giving you the real no-BS truth you've grown to love, hate, and desperately need. 
              Curated gear that actually works, unfluffed.
            </p>
            <div className="hero-actions">
              <a href="#kits" className="btn btn-primary">View Kits</a>
              <a href="#about" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* Kits */}
      <section id="kits" className="section bg-secondary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tested Kits</h2>
            <p className="section-subtitle">Four carefully curated collections that actually work.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            <KitCard
              title="Park Day Kit"
              description="Everything for outdoor adventures that won't break, leak, or disappoint you when it matters most."
              imageUrl="https://images.unsplash.com/photo-1661788902947-19ff0d8f50ea"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff/list/19LAI2JMPGQJT?ref_=cm_sw_r_cp_ud_aipsflist_98SGZHEKTX8E14ATJT8G"
              scruffImage={SCRUFF_IMAGES.parkDay}
            />
            <KitCard
              title="Desk Setup Kit"
              description="Productivity gear that actually makes you productive. No RGB nonsense, no aesthetic fluff."
              imageUrl="https://images.unsplash.com/photo-1586202690666-e1f32e218afe"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff/list/11EQI7H7IWUUE?ref_=cm_sw_r_cp_ud_aipsflist_B1BYSGN6MNZJ2NCVXXDY"
              scruffImage={SCRUFF_IMAGES.deskSetup}
            />
            <KitCard
              title="Smart Home Setup"
              description="Home automation without the computer science degree requirement or endless troubleshooting."
              imageUrl="https://images.unsplash.com/photo-1525004351186-bdc426f3efaa"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff/list/2JU1WTBQMG48Y?ref_=cm_sw_r_cp_ud_aipsflist_ZJHC3V6WN24NBENSHV11"
              scruffImage={SCRUFF_IMAGES.smartHome}
            />
            <KitCard
              title="Skin Care Essentials"
              description="The routine that works without 47 steps, expensive serums, or breaking the bank."
              imageUrl="https://images.unsplash.com/photo-1633793566189-8e9fe6f817fc"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff/list/RZDP1I7G8U93?ref_=cm_sw_r_cp_ud_aipsflist_72HZKVVF944MHTJQ7WN6"
              scruffImage={SCRUFF_IMAGES.skincare}
            />
          </div>
        </div>
      </section>

      {/* Search */}
      <section id="search" className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Find Products</h2>
            <p className="section-subtitle">
              Advanced search with filters and sorting. Every link goes through my affiliate program to support the site.
            </p>
          </div>
          
          {/* Main Search Form */}
          <div className="search-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="search-form">
              <select 
                value={searchCountry} 
                onChange={(e) => setSearchCountry(e.target.value)}
                className="search-select"
              >
                <option value="US">US</option>
                <option value="UK">UK</option>
                <option value="CA">CA</option>
              </select>
              
              <div className="search-input-container" style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search for anything..."
                  className="search-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleProductSearch(isUsingAdvancedSearch)}
                  onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="search-suggestions">
                    {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div 
                        key={index}
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        🔍 {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => handleProductSearch(isUsingAdvancedSearch)} 
                disabled={isSearching}
                className="btn btn-primary"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="text-center" style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="btn-filter-toggle"
              >
                {showAdvancedFilters ? '📋 Hide Filters' : '⚙️ Advanced Filters'} 
                {hasActiveFilters() && <span className="filter-indicator">●</span>}
              </button>
            </div>
            
            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="advanced-filters">
                <div className="filter-grid">
                  {/* Price Range */}
                  <div className="filter-group">
                    <label className="filter-label">Price Range</label>
                    <div className="price-inputs">
                      <input
                        type="number"
                        placeholder="Min $"
                        value={searchFilters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="filter-input"
                      />
                      <span className="price-separator">to</span>
                      <input
                        type="number"
                        placeholder="Max $"
                        value={searchFilters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="filter-input"
                      />
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="filter-group">
                    <label className="filter-label">Minimum Rating</label>
                    <select
                      value={searchFilters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="5">5 Stars Only</option>
                    </select>
                  </div>
                  
                  {/* Category */}
                  <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <select
                      value={searchFilters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.name} ({cat.count})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort By */}
                  <div className="filter-group">
                    <label className="filter-label">Sort By</label>
                    <select
                      value={searchFilters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="filter-select"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="review_count">Most Reviews</option>
                    </select>
                  </div>
                </div>
                
                <div className="filter-actions">
                  <button 
                    onClick={() => {
                      handleProductSearch(true);
                      setIsUsingAdvancedSearch(true);
                    }}
                    className="btn btn-primary"
                    disabled={isSearching}
                  >
                    Apply Filters
                  </button>
                  {hasActiveFilters() && (
                    <button 
                      onClick={clearFilters}
                      className="btn btn-ghost"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              {/* Results Header */}
              <div className="results-header">
                <p className="results-count">
                  Found {totalResults} results{searchQuery && ` for "${searchQuery}"`}
                  {hasActiveFilters() && ' (filtered)'}
                </p>
                {hasActiveFilters() && (
                  <div className="active-filters">
                    {searchFilters.minPrice && <span className="filter-tag">Min: ${searchFilters.minPrice}</span>}
                    {searchFilters.maxPrice && <span className="filter-tag">Max: ${searchFilters.maxPrice}</span>}
                    {searchFilters.minRating && <span className="filter-tag">{searchFilters.minRating}+ Stars</span>}
                    {searchFilters.category && <span className="filter-tag">{searchFilters.category}</span>}
                    {searchFilters.sortBy !== 'relevance' && <span className="filter-tag">Sorted by {searchFilters.sortBy.replace('_', ' ')}</span>}
                  </div>
                )}
                <p className="affiliate-disclaimer">
                  These are Amazon results with my affiliate links. The ones in my kits above are what I've actually tested.
                </p>
              </div>
              
              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map(product => (
                  <div key={product.asin} className="product-card">
                    <div className="product-image-container">
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="product-image"
                      />
                      {product.category && (
                        <div className="product-category-badge">
                          {product.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="product-content">
                      <h4 className="product-title">{product.title}</h4>
                      
                      <div className="product-meta">
                        {product.price && (
                          <span className="product-price">
                            {product.price.currency} ${product.price.amount}
                          </span>
                        )}
                        {product.rating && (
                          <div className="product-rating">
                            <span className="stars">★</span>
                            <span>{product.rating}</span>
                            {product.review_count && (
                              <span className="review-count">({product.review_count})</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <a 
                        href={product.affiliate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-ghost w-full"
                      >
                        View on Amazon
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="section bg-secondary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Trust Me?</h2>
            <p className="section-subtitle">Because I'm not trying to sell you a lifestyle or build a personal brand.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Actually Tested"
              description="I buy it, use it, break it, then recommend it. Revolutionary concept in today's world."
              scruffImage={SCRUFF_IMAGES.tested}
            />
            <FeatureCard
              title="No Sponsored BS"
              description="Not getting paid to say nice things. If something sucks, I'll tell you exactly why."
              scruffImage={SCRUFF_IMAGES.noSponsored}
            />
            <FeatureCard
              title="Your True Bestie"
              description="Giving you honest opinions without the sugar-coating or ulterior motives."
              scruffImage={SCRUFF_IMAGES.trust}
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Stay Updated</h2>
            <p className="section-subtitle">New kits, honest reviews, zero spam. I hate inbox clutter as much as you do.</p>
          </div>
          
          <form onSubmit={handleEmailSubmit} className="flex gap-4 justify-center items-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="form-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
          
          {isSubscribed && (
            <div className="text-accent text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
              ✓ Subscribed! Check your email.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="section-sm bg-secondary" style={{ borderTop: '1px solid #262626' }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="logo-icon">U</div>
                <span className="font-semibold">unfluffed</span>
              </div>
              <p className="text-xs text-muted">Curated gear that actually works.</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-4">Kits</h4>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-secondary hover:text-accent">Park Day Kit</a>
                <a href="#" className="block text-xs text-secondary hover:text-accent">Desk Setup Kit</a>
                <a href="#" className="block text-xs text-secondary hover:text-accent">Smart Home Setup</a>
                <a href="#" className="block text-xs text-secondary hover:text-accent">Skin Care Essentials</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-4">About</h4>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-secondary hover:text-accent">Process</a>
                <a href="#" className="block text-xs text-secondary hover:text-accent">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-secondary hover:text-accent">Privacy</a>
                <a href="#" className="block text-xs text-secondary hover:text-accent">Terms</a>
                <a href="#" className="block text-xs text-secondary hover:text-accent">FTC Disclosure</a>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #262626', textAlign: 'center' }}>
            <p className="text-xs text-muted">
              © 2025 unfluffed. Amazon Associate - I earn from qualifying purchases.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;