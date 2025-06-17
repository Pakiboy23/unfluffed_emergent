import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Scruff image paths - now loaded from GitHub!
const SCRUFF_IMAGES = {
  logo: '/images/scruff/logo.png',
  hero: '/images/scruff/hero.png', 
  parkDay: '/images/scruff/park-day.png',
  deskSetup: '/images/scruff/desk-setup.png',
  smartHome: '/images/scruff/smart-home.png',
  skincare: '/images/scruff/skincare.png',
  trust: '/images/scruff/trust.png',
  tested: '/images/scruff/tested.png',
  noSponsored: '/images/scruff/no-sponsored.png',
  search: '/images/scruff/search.png',
  email: '/images/scruff/email.png'
};

// Scruff Image Component with fallback
const ScruffImage = ({ imagePath, alt, className, fallbackEmoji = "🦝" }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (imageError) {
    return (
      <div className={className} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: className.includes('scruff-hero') ? '48px' : 
                className.includes('scruff-email') ? '40px' :
                className.includes('scruff-section') ? '32px' :
                className.includes('scruff-search') ? '32px' :
                className.includes('scruff-kit') ? '24px' : '18px'
      }}>
        {fallbackEmoji}
      </div>
    );
  }
  
  return (
    <img 
      src={imagePath}
      alt={alt}
      className={className + " scruff-actual-image"}
      onError={handleImageError}
    />
  );
}

const App = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCountry, setSearchCountry] = useState('US');
  const [isSearching, setIsSearching] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const handleProductSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/products/search`, {
        query: searchQuery,
        country: searchCountry
      });
      setSearchResults(response.data.products || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Enhanced Kit Card Component with API integration
  const EnhancedKitCard = ({ title, description, imageUrl, affiliateUrl, searchKeywords, scruffImage, scruffAlt }) => {
    const [livePrice, setLivePrice] = useState(null);
    const [availability, setAvailability] = useState('Check Amazon');
    const [isLoading, setIsLoading] = useState(false);

    const fetchLiveData = async () => {
      if (!searchKeywords) return;
      
      setIsLoading(true);
      try {
        const response = await axios.post(`${BACKEND_URL}/api/products/search`, {
          query: searchKeywords,
          country: 'US'
        });
        
        if (response.data.products && response.data.products.length > 0) {
          const product = response.data.products[0];
          if (product.price) {
            setLivePrice(product.price);
          }
          setAvailability('In Stock');
        }
      } catch (error) {
        console.error('Failed to fetch live data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchLiveData();
      // Refresh every 5 minutes
      const interval = setInterval(fetchLiveData, 300000);
      return () => clearInterval(interval);
    }, [searchKeywords]);

    return (
      <div className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group border border-gray-700 hover:border-neon-green relative">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Scruff Mascot in corner */}
          <div className="absolute top-4 left-4">
            <ScruffImage 
              imagePath={scruffImage}
              alt={scruffAlt}
              className="scruff-kit-badge"
            />
          </div>
          
          <div className="absolute top-4 right-4 bg-neon-green text-black px-3 py-1 rounded-full text-sm font-semibold">
            SCRUFF TESTED
          </div>
          
          {livePrice && (
            <div className="absolute bottom-4 left-4 bg-black/80 text-neon-green px-3 py-1 rounded-full text-sm font-semibold">
              {livePrice.currency} ${livePrice.amount}
            </div>
          )}
        </div>
        <div className="p-8">
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400 mb-6">{description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-neon-green font-semibold">
              <span className="text-2xl">★★★★★</span>
              <span className="ml-2 text-sm">Scruff approved</span>
            </div>
            {isLoading && (
              <div className="text-neon-green text-sm">
                <span className="loading-spinner inline-block mr-2"></span>
                Loading...
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-400">
              Availability: <span className="text-neon-green">{availability}</span>
            </div>
            
            <a 
              href={affiliateUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-neon-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-all transform hover:scale-105 text-center"
            >
              Get Kit →
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Product Search Component with Scruff
  const ProductSearchSection = () => (
    <section id="search" className="py-20 bg-gray-800 relative">
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 gap-4 h-full">
          {[...Array(64)].map((_, i) => (
            <div key={i} className="border border-neon-green"></div>
          ))}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <ScruffImage 
              imagePath={SCRUFF_IMAGES.search}
              alt="Scruff with search tools"
              className="scruff-search mr-4"
            />
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Find <span className="text-neon-green">Real</span> Products
              </h2>
              <p className="text-lg text-gray-400">
                Scruff's Amazon search engine - tested by your gay bestie
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select 
              value={searchCountry} 
              onChange={(e) => setSearchCountry(e.target.value)}
              className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-neon-green"
            >
              <option value="US">🇺🇸 United States</option>
              <option value="UK">🇬🇧 United Kingdom</option>
              <option value="CA">🇨🇦 Canada</option>
            </select>
            
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Amazon products..."
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green"
              onKeyPress={(e) => e.key === 'Enter' && handleProductSearch()}
            />
            
            <button 
              onClick={handleProductSearch} 
              disabled={isSearching}
              className="bg-neon-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center"
            >
              {isSearching ? (
                <>
                  <span className="loading-spinner mr-2"></span>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(product => (
                <div key={product.asin} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-neon-green transition-colors">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="text-white font-semibold text-sm mb-2 line-clamp-2">{product.title}</h4>
                  
                  <div className="flex items-center justify-between mb-3">
                    {product.price && (
                      <span className="text-neon-green font-semibold">
                        {product.price.currency} ${product.price.amount}
                      </span>
                    )}
                    {product.rating && (
                      <div className="text-yellow-400 text-sm">
                        ★ {product.rating} ({product.review_count})
                      </div>
                    )}
                  </div>
                  
                  <a 
                    href={product.affiliate_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-neon-green text-black px-4 py-2 rounded-lg font-semibold text-center text-sm hover:bg-neon-green/90 transition-all"
                  >
                    View on Amazon
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <ScruffImage 
                imagePath={SCRUFF_IMAGES.logo}
                alt="Scruff logo"
                className="scruff-logo"
              />
              <span className="text-white font-bold text-xl">unfluffed</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#kits" className="text-gray-300 hover:text-neon-green transition-colors">Kits</a>
              <a href="#search" className="text-gray-300 hover:text-neon-green transition-colors">Search</a>
              <a href="#about" className="text-gray-300 hover:text-neon-green transition-colors">Why Me</a>
              <a href="#reviews" className="text-gray-300 hover:text-neon-green transition-colors">Reviews</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555209183-8facf96a4349')`,
          }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <ScruffImage 
              imagePath={SCRUFF_IMAGES.hero}
              alt="Scruff with tech background"
              className="scruff-hero mr-6"
            />
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 leading-tight">
                No influencer sh*t.
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-neon-green">
                Just stuff that works.
              </h2>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            I'm your gay bestie giving you the real no-BS truth you've grown to love, hate, and desperately need. 
            Curated gear that actually works - no sponsored nonsense.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#kits" 
              className="bg-neon-green text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-neon-green/90 transition-all transform hover:scale-105"
            >
              Show Me The Goods
            </a>
            <a 
              href="#about" 
              className="border-2 border-neon-green text-neon-green px-8 py-4 rounded-lg font-semibold text-lg hover:bg-neon-green hover:text-black transition-all"
            >
              Why Trust Me?
            </a>
          </div>
        </div>
      </section>

      {/* Featured Kits Section */}
      <section id="kits" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              My <span className="text-neon-green">Actually Useful</span> Kits
            </h2>
            <p className="text-xl text-gray-400">
              Four kits. Tested by me. Zero fluff. Maximum results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Park Day Kit */}
            <EnhancedKitCard
              title="Park Day Kit"
              description="Everything you need for a day outside that won't break, leak, or make you look like a tourist. I've tested this stuff through rain, shine, and questionable picnic choices."
              imageUrl="https://images.unsplash.com/photo-1661788902947-19ff0d8f50ea"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff-20/list/park-day-kit"
              searchKeywords="outdoor picnic gear"
              scruffImage={SCRUFF_IMAGES.parkDay}
              scruffAlt="Scruff hiking outdoors"
            />

            {/* Desk Setup Kit */}
            <EnhancedKitCard
              title="Desk Setup Kit"
              description="Productivity gear that actually makes you productive. No RGB nonsense, no 'aesthetic' crap that breaks in a week. Trust me, I've broken plenty."
              imageUrl="https://images.unsplash.com/photo-1586202690666-e1f32e218afe"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff-20/list/desk-setup-kit"
              searchKeywords="desk setup accessories"
              scruffImage={SCRUFF_IMAGES.deskSetup}
              scruffAlt="Scruff digital drawing"
            />

            {/* Smart Home Setup Kit */}
            <EnhancedKitCard
              title="Smart Home Setup"
              description="Home automation that doesn't require a computer science degree. I've survived the setup hell so you don't have to. You're welcome."
              imageUrl="https://images.unsplash.com/photo-1525004351186-bdc426f3efaa"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff-20/list/smart-home-setup"
              searchKeywords="smart home devices"
              scruffImage={SCRUFF_IMAGES.smartHome}
              scruffAlt="Scruff with developer kit"
            />

            {/* Skin Care Essentials Kit */}
            <EnhancedKitCard
              title="Skin Care Essentials"
              description="The skincare routine that actually works without breaking the bank or your bathroom counter. No 47-step routines, just results."
              imageUrl="https://images.unsplash.com/photo-1633793566189-8e9fe6f817fc"
              affiliateUrl="https://www.amazon.com/shop/haarisshariff-20/list/skincare-essentials"
              searchKeywords="skincare essentials"
              scruffImage={SCRUFF_IMAGES.skincare}
              scruffAlt="Scruff winking with thumbs up"
            />
          </div>
        </div>
      </section>

      {/* Product Search Section */}
      <ProductSearchSection />

      {/* Why Section */}
      <section id="about" className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why <span className="text-neon-green">Trust</span> Me?
            </h2>
            <p className="text-xl text-gray-400">
              Because I'm not trying to sell you a lifestyle. Just good stuff that works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <ScruffImage 
                imagePath={SCRUFF_IMAGES.tested}
                alt="Scruff testing products"
                className="scruff-section mx-auto mb-6 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-xl font-bold text-white mb-4">Actually Tested</h3>
              <p className="text-gray-400">
                I buy it, use it, break it, then recommend it. Or don't. 
                Revolutionary concept, I know.
              </p>
            </div>

            <div className="text-center group">
              <ScruffImage 
                imagePath={SCRUFF_IMAGES.noSponsored}
                alt="Scruff rejecting sponsored content"
                className="scruff-section mx-auto mb-6 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-xl font-bold text-white mb-4">No Sponsored BS</h3>
              <p className="text-gray-400">
                I'm not getting paid to say nice things. If it sucks, I'll tell you. 
                If it's great, I'll tell you that too.
              </p>
            </div>

            <div className="text-center group">
              <ScruffImage 
                imagePath={SCRUFF_IMAGES.trust}
                alt="Scruff as your gay bestie"
                className="scruff-section mx-auto mb-6 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-xl font-bold text-white mb-4">Your Gay Bestie</h3>
              <p className="text-gray-400">
                I'm giving you the real truth you've grown to love, hate, and desperately need. 
                No sugar-coating, just honest opinions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-gray-900 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1641903806973-17eaf2d2634f')`,
          }}
        ></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What People <span className="text-neon-green">Actually</span> Say
            </h2>
            <p className="text-xl text-gray-400">
              Real reviews from real people. Shocking, I know.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-neon-green transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">M</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-white font-semibold">Mike</h4>
                  <div className="text-neon-green text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-400">
                "Finally, someone who doesn't try to sell me overpriced garbage. 
                The desk kit actually improved my workflow. This guy knows his stuff."
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-neon-green transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">S</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-white font-semibold">Sarah</h4>
                  <div className="text-neon-green text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-400">
                "Used the park kit for three months straight. Everything still works. 
                Unlike the influencer crap I bought before."
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-neon-green transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">D</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-white font-semibold">David</h4>
                  <div className="text-neon-green text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-400">
                "No fluff, no fake enthusiasm. Just honest recommendations. 
                Refreshing in a world of fake reviews."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1708939582011-ddbd2ff61b40')`,
          }}
        ></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <ScruffImage 
              imagePath={SCRUFF_IMAGES.email}
              alt="Scruff encouraging newsletter signup"
              className="scruff-email mr-6"
            />
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Get <span className="text-neon-green">Unfluffed</span> Updates
              </h2>
              <p className="text-xl text-gray-400">
                New kits, honest reviews, zero spam. I hate inbox clutter as much as you do.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green"
            />
            <button
              type="submit"
              className="bg-neon-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-all transform hover:scale-105"
            >
              Subscribe
            </button>
          </form>
          
          {isSubscribed && (
            <div className="mt-4 text-neon-green font-semibold">
              ✓ Subscribed! Check your email.
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-4">
            No spam. Unsubscribe anytime. I'm not a monster.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="scruff-logo">
                  🦝
                </div>
                <span className="text-white font-bold text-xl">unfluffed</span>
              </div>
              <p className="text-gray-400 text-sm">
                Curated gear that actually works. No influencer nonsense. Made by your gay bestie.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Kits</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Park Day Kit</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Desk Setup Kit</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Smart Home Setup</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Skin Care Essentials</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">My Process</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">FTC Disclosure</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 unfluffed. All rights reserved. | Amazon Associate Disclaimer: I earn from qualifying purchases.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;