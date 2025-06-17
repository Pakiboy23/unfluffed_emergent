import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send to your email service
    console.log('Email submitted:', email);
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <span className="text-white font-bold text-xl">unfluffed</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#kits" className="text-gray-300 hover:text-neon-green transition-colors">Kits</a>
              <a href="#about" className="text-gray-300 hover:text-neon-green transition-colors">Why Us</a>
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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            No influencer sh*t.
            <br />
            <span className="text-neon-green">Just stuff that works.</span>
          </h1>
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
              Why Trust Us?
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
            <div className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group border border-gray-700 hover:border-neon-green">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1661788902947-19ff0d8f50ea" 
                  alt="Park Day Kit"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-neon-green text-black px-3 py-1 rounded-full text-sm font-semibold">
                  TESTED
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Park Day Kit</h3>
                <p className="text-gray-400 mb-6">
                  Everything you need for a day outside that won't break, leak, or make you look like a tourist. 
                  I've tested this stuff through rain, shine, and questionable picnic choices.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-neon-green font-semibold">
                    <span className="text-2xl">★★★★★</span>
                    <span className="ml-2 text-sm">Real reviews</span>
                  </div>
                  <a 
                    href="https://www.amazon.com/shop/haarisshariff-20/list/park-day-kit" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neon-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-all transform hover:scale-105"
                  >
                    Get Kit →
                  </a>
                </div>
              </div>
            </div>

            {/* Desk Setup Kit */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group border border-gray-700 hover:border-neon-green">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1586202690666-e1f32e218afe" 
                  alt="Desk Setup Kit"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-neon-green text-black px-3 py-1 rounded-full text-sm font-semibold">
                  TESTED
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Desk Setup Kit</h3>
                <p className="text-gray-400 mb-6">
                  Productivity gear that actually makes you productive. No RGB nonsense, 
                  no "aesthetic" crap that breaks in a week. Trust me, I've broken plenty.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-neon-green font-semibold">
                    <span className="text-2xl">★★★★★</span>
                    <span className="ml-2 text-sm">Real reviews</span>
                  </div>
                  <a 
                    href="https://www.amazon.com/shop/haarisshariff-20/list/desk-setup-kit" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neon-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-all transform hover:scale-105"
                  >
                    Get Kit →
                  </a>
                </div>
              </div>
            </div>

            {/* Smart Home Setup Kit */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group border border-gray-700 hover:border-neon-green">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1525004351186-bdc426f3efaa" 
                  alt="Smart Home Setup Kit"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-neon-green text-black px-3 py-1 rounded-full text-sm font-semibold">
                  TESTED
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Smart Home Setup</h3>
                <p className="text-gray-400 mb-6">
                  Home automation that doesn't require a computer science degree. 
                  I've survived the setup hell so you don't have to. You're welcome.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-neon-green font-semibold">
                    <span className="text-2xl">★★★★★</span>
                    <span className="ml-2 text-sm">Real reviews</span>
                  </div>
                  <a 
                    href="https://www.amazon.com/shop/haarisshariff-20/list/smart-home-setup" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neon-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-all transform hover:scale-105"
                  >
                    Get Kit →
                  </a>
                </div>
              </div>
            </div>

            {/* Skin Care Essentials Kit */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group border border-gray-700 hover:border-neon-green">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1633793566189-8e9fe6f817fc" 
                  alt="Skin Care Essentials Kit"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-neon-green text-black px-3 py-1 rounded-full text-sm font-semibold">
                  TESTED
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Skin Care Essentials</h3>
                <p className="text-gray-400 mb-6">
                  The skincare routine that actually works without breaking the bank or your bathroom counter. 
                  No 47-step routines, just results.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-neon-green font-semibold">
                    <span className="text-2xl">★★★★★</span>
                    <span className="ml-2 text-sm">Real reviews</span>
                  </div>
                  <a 
                    href="https://www.amazon.com/shop/haarisshariff-20/list/skincare-essentials" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neon-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-all transform hover:scale-105"
                  >
                    Get Kit →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-neon-green/30 transition-colors">
                <span className="text-neon-green text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Actually Tested</h3>
              <p className="text-gray-400">
                I buy it, use it, break it, then recommend it. Or don't. 
                Revolutionary concept, I know.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-neon-green/30 transition-colors">
                <span className="text-neon-green text-2xl">🚫</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">No Sponsored BS</h3>
              <p className="text-gray-400">
                I'm not getting paid to say nice things. If it sucks, I'll tell you. 
                If it's great, I'll tell you that too.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-neon-green/30 transition-colors">
                <span className="text-neon-green text-2xl">💯</span>
              </div>
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
              Real reviews from real people. Shocking, we know.
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
                The desk kit actually improved my workflow."
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get <span className="text-neon-green">Unfluffed</span> Updates
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            New kits, honest reviews, zero spam. I hate inbox clutter as much as you do.
          </p>
          
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
            No spam. Unsubscribe anytime. We're not monsters.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">S</span>
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
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-neon-green transition-colors">Our Process</a></li>
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
              © 2025 unfluffed. All rights reserved. | Amazon Associate Disclaimer: We earn from qualifying purchases.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;