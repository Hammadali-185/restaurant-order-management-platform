import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Minus, ShoppingCart, CreditCard, MapPin, Phone, Check, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CartPage: React.FC = () => {
  const { state, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Show toast when items are added
  useEffect(() => {
    if (state.itemCount > 0) {
      setShowToast(true);
      setToastMessage(`${state.itemCount} item${state.itemCount !== 1 ? 's' : ''} in cart`);
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.itemCount]);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cash'
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (state.items.length === 0) return;
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Send order to backend API
      const orderData = {
        items: state.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'food',
          image: item.image || ''
        })),
        subtotal: state.total,
        total: state.total,
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        paymentMethod: customerInfo.paymentMethod
      };

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/orders`, orderData);
      
      if (response.status === 201) {
        alert(`Order placed successfully! Order ID: ${response.data.order.orderId}\nTotal: Rs ${state.total.toFixed(2)}`);
        clearCart();
        setShowCheckout(false);
        setCustomerInfo({ name: '', phone: '', address: '', paymentMethod: 'cash' });
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to place order: ${errorMessage}`);
    }
  };

  const formatPrice = (price: number) => {
    return `Rs ${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-ui-surface-dark shadow-sm border-b border-ui-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="flex items-center space-x-2 text-ui-gray-medium hover:text-primary-red transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Menu</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-primary-red" />
              <h1 className="text-2xl font-bold text-primary-white">Your Cart</h1>
              {state.itemCount > 0 && (
                <span className="bg-primary-red text-primary-white text-xs px-2 py-1 rounded-full">
                  {state.itemCount}
                </span>
              )}
            </div>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2"
          >
            <Check className="h-5 w-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showCheckout ? (
          <>
            {/* Cart Items */}
            <div className="bg-ui-surface-dark rounded-lg shadow-lg overflow-hidden border border-ui-gray-dark">
              {state.items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="h-24 w-24 text-ui-gray-medium mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-ui-gray-medium mb-2">Your cart is empty</h2>
                  <p className="text-ui-gray-medium mb-8">Add some delicious items to get started!</p>
                  <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-primary-red text-primary-white font-semibold rounded-lg hover:bg-primary-red-dark transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-ui-gray-dark bg-ui-gray-dark">
                    <h2 className="text-lg font-semibold text-primary-white">
                      {state.items.length} item{state.items.length !== 1 ? 's' : ''} in your cart
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-ui-gray-dark">
                    {state.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 flex items-center space-x-6"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/96x96?text=No+Image';
                          }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-primary-white mb-1">{item.name}</h3>
                          <p className="text-sm text-ui-gray-medium mb-2">{item.category}</p>
                          <p className="text-lg font-semibold text-primary-red">{formatPrice(item.price)} each</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-ui-gray-dark rounded-full transition-colors border border-ui-gray-medium"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4 text-ui-gray-medium" />
                            </button>
                            <span className="w-12 text-center font-semibold text-lg bg-ui-gray-dark border border-ui-gray-medium rounded py-2 text-primary-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-ui-gray-dark rounded-full transition-colors border border-ui-gray-medium"
                            >
                              <Plus className="h-4 w-4 text-ui-gray-medium" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-white">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-primary-red hover:bg-primary-red/10 rounded-full transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Cart Summary */}
                  <div className="px-6 py-6 bg-ui-gray-dark border-t border-ui-gray-medium">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl font-bold text-primary-white">Total:</span>
                      <span className="text-3xl font-bold text-primary-red">
                        {formatPrice(state.total)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={handleCheckout}
                        className="flex-1 bg-primary-red text-primary-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-red-dark transition-colors flex items-center justify-center space-x-2"
                      >
                        <CreditCard className="h-6 w-6" />
                        <span>Proceed to Checkout</span>
                      </button>
                      
                      <button
                        onClick={clearCart}
                        className="px-6 py-4 border border-ui-gray-medium text-ui-gray-medium rounded-lg font-semibold hover:bg-ui-gray-dark transition-colors"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-ui-surface-dark rounded-lg shadow-lg p-6 border border-ui-gray-dark">
              <h3 className="text-xl font-semibold text-primary-white mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-ui-gray-dark">
                    <div>
                      <span className="font-medium text-primary-white">{item.name}</span>
                      <span className="text-ui-gray-medium ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-primary-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold text-primary-white">
                  <span>Total:</span>
                  <span className="text-primary-red">{formatPrice(state.total)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-ui-surface-dark rounded-lg shadow-lg p-6 border border-ui-gray-dark">
              <h3 className="text-xl font-semibold text-primary-white mb-6">Customer Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-white mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full px-4 py-3 border border-ui-gray-medium rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent bg-ui-gray-dark text-primary-white placeholder-ui-gray-medium"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-white mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-ui-gray-medium" />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jushhh-red focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-white mb-2">
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-ui-gray-medium" />
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jushhh-red focus:border-transparent"
                      rows={4}
                      placeholder="Enter your delivery address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-white mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-ui-gray-medium rounded-lg cursor-pointer hover:bg-ui-gray-dark text-primary-white">
                      <input
                        type="radio"
                        value="cash"
                        checked={customerInfo.paymentMethod === 'cash'}
                        onChange={(e) => setCustomerInfo({...customerInfo, paymentMethod: e.target.value})}
                        className="mr-3"
                      />
                      <span className="font-medium text-primary-white">Cash on Delivery</span>
                    </label>
                    <label className="flex items-center p-3 border border-ui-gray-medium rounded-lg cursor-pointer hover:bg-ui-gray-dark text-primary-white">
                      <input
                        type="radio"
                        value="card"
                        checked={customerInfo.paymentMethod === 'card'}
                        onChange={(e) => setCustomerInfo({...customerInfo, paymentMethod: e.target.value})}
                        className="mr-3"
                      />
                      <span className="font-medium text-primary-white">Credit/Debit Card</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-primary-red text-primary-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-red-dark transition-colors"
                >
                  Place Order - {formatPrice(state.total)}
                </button>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full bg-ui-gray-medium text-primary-white py-3 px-6 rounded-lg font-semibold hover:bg-ui-gray-dark transition-colors"
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
