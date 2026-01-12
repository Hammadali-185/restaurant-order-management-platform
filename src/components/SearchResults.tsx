import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Navigation from './Navigation';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // All menu items across all categories
  const allMenuItems = [
    // Burgers
    { id: 'chicken-burger', name: 'Chicken Burger', category: 'Burgers', price: 299, description: 'Juicy grilled chicken breast with fresh lettuce, tomato, and our signature sauce' },
    { id: 'zinger-burger', name: 'Zinger Burger', category: 'Burgers', price: 349, description: 'Spicy crispy chicken with jalapeños, cheese, and hot sauce' },
    { id: 'double-decker', name: 'Double Decker', category: 'Burgers', price: 449, description: 'Two beef patties, double cheese, bacon, and all the fixings' },
    { id: 'doner-burger', name: 'Doner Burger', category: 'Burgers', price: 399, description: 'Turkish-style doner meat with fresh vegetables and garlic sauce' },
    
    // Shawarma
    { id: 'grilled-shawarma', name: 'Grilled Shawarma', category: 'Shawarma', price: 249, description: 'Tender grilled chicken with fresh vegetables and garlic sauce' },
    { id: 'zinger-shawarma', name: 'Zinger Shawarma', category: 'Shawarma', price: 299, description: 'Spicy crispy chicken with hot sauce and fresh crunch' },
    { id: 'open-shawarma', name: 'Open Shawarma', category: 'Shawarma', price: 349, description: 'Layered shawarma with extra toppings and premium sauces' },
    { id: 'beef-shawarma', name: 'Beef Shawarma', category: 'Shawarma', price: 399, description: 'Premium beef with traditional spices and fresh herbs' },
    
    // Fries
    { id: 'small-fries', name: 'Small Fries', category: 'Fries', price: 99, description: 'Crispy golden fries, perfectly seasoned' },
    { id: 'large-fries', name: 'Large Fries', category: 'Fries', price: 149, description: 'Extra large portion of our signature crispy fries' },
    { id: 'loaded-fries', name: 'Loaded Fries', category: 'Fries', price: 249, description: 'Fries loaded with cheese, bacon, and jalapeños' },
    { id: 'zinger-fries', name: 'Zinger Fries', category: 'Fries', price: 199, description: 'Spicy seasoned fries with a kick of heat' },
    
    // Beverages
    { id: 'pepsi', name: 'Pepsi', category: 'Beverages', price: 49, description: 'Classic refreshing cola drink' },
    { id: 'mirinda', name: 'Mirinda', category: 'Beverages', price: 49, description: 'Orange flavored fizzy drink' },
    { id: 'sprite', name: 'Sprite', category: 'Beverages', price: 49, description: 'Lemon-lime soda, crisp and refreshing' },
    { id: 'coca-cola', name: 'Coca Cola', category: 'Beverages', price: 49, description: 'The original cola taste' },
    { id: 'mountain-dew', name: 'Mountain Dew', category: 'Beverages', price: 49, description: 'Citrus flavored energy drink' },
    { id: 'water', name: 'Mineral Water', category: 'Beverages', price: 29, description: 'Pure, clean mineral water' }
  ];

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    
    if (query.trim()) {
      const results = allMenuItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Burgers': return 'text-red-600';
      case 'Shawarma': return 'text-orange-600';
      case 'Fries': return 'text-yellow-600';
      case 'Beverages': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Burgers': return '🍔';
      case 'Shawarma': return '🌯';
      case 'Fries': return '🍟';
      case 'Beverages': return '🥤';
      default: return '🍽️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-white">
      <Navigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-16 px-4 text-center"
      >
        <h1
          className="text-4xl md:text-6xl lg:text-7xl mb-4"
          style={{
            fontFamily: 'Dancing Script, cursive',
            fontWeight: '800',
            textShadow: '3px 3px 0px #FFD700'
          }}
        >
          SEARCH RESULTS
        </h1>
        <p
          className="text-xl md:text-2xl mb-6"
          style={{
            fontFamily: 'Dancing Script, cursive',
            fontWeight: '500'
          }}
        >
          {searchQuery ? `Results for "${searchQuery}"` : 'Search our menu'}
        </p>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white text-lg"
            />
          </div>
        </form>
        
        <div className="border-t-4 border-white w-24 mx-auto mt-4 animate-pulse"></div>
      </motion.div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {searchQuery ? (
          <>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">
                        {getCategoryEmoji(item.category)}
                      </div>
                      <h3
                        className="text-2xl md:text-3xl mb-2"
                        style={{
                          fontFamily: 'Dancing Script, cursive',
                          color: '#FF0000',
                          fontWeight: '800'
                        }}
                      >
                        {item.name.toUpperCase()}
                      </h3>
                      <p className={`text-sm font-bold mb-2 ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        {item.description}
                      </p>
                      <div
                        className="text-2xl font-bold"
                        style={{
                          fontFamily: 'Dancing Script, cursive',
                          color: '#FF6B35'
                        }}
                      >
                        Rs {item.price}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2
                  className="text-3xl md:text-4xl mb-4"
                  style={{
                    fontFamily: 'Dancing Script, cursive',
                    color: '#FF0000',
                    fontWeight: '800'
                  }}
                >
                  No Results Found
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Sorry, we couldn't find any items matching "{searchQuery}"
                </p>
                <p className="text-gray-500">
                  Try searching for: burger, shawarma, fries, pepsi, water, etc.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'Dancing Script, cursive',
                color: '#FF0000',
                fontWeight: '800'
              }}
            >
              Search Our Menu
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Find your favorite items by searching above
            </p>
          </div>
        )}
      </div>

      {/* Back to Menu Button */}
      <div className="text-center pb-12">
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default SearchResults;







