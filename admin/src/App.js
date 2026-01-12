import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Bell } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🟢 Connected to backend');
      newSocket.emit('join-admin-room');
    });

    newSocket.on('new-order', (order) => {
      console.log('📦 New order received:', order);
      setOrders(prevOrders => [order, ...prevOrders]);
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Order!', {
          body: `Order from ${order.customerName} - Rs ${order.total?.toFixed(2)}`,
          icon: '/favicon.ico'
        });
      }
    });

    newSocket.on('order-updated', (updatedOrder) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      console.log('Orders response:', response.data);
      
      // Backend returns { success: true, orders: [...], pagination: {...} }
      if (response.data.success && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Ensure orders is always an array
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      // The WebSocket will handle the real-time update
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const createTestOrder = async () => {
    try {
      const testOrder = {
        items: ['JUSH Burger', 'French Fries', 'Coca Cola'],
        total: 15.99,
        customerName: 'Test Customer',
        phone: '123-456-7890',
        address: '123 Test Street, Test City',
        paymentMethod: 'cash',
        status: 'Pending'
      };

      await axios.post(`${API_URL}/orders`, testOrder);
      console.log('Test order created successfully');
    } catch (error) {
      console.error('Error creating test order:', error);
      alert('Failed to create test order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Ready': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'In Progress': return <Package className="h-4 w-4" />;
      case 'Ready': return <CheckCircle className="h-4 w-4" />;
      case 'Delivered': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('Current orders state:', orders);
  console.log('Orders type:', typeof orders);
  console.log('Is array:', Array.isArray(orders));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">JUSH Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {orders.length} Total Orders
              </div>
              <button
                onClick={createTestOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Create Test Order
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Orders will appear here when customers place them.</p>
            </div>
          ) : (
            Array.isArray(orders) && orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.customerName} • {order.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{order.status}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      Rs {order.total?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items?.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {typeof item === 'string' ? item : `${item.quantity}x ${item.name} - Rs ${item.price}`}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Address:</strong> {order.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Payment:</strong> {order.paymentMethod}
                  </p>
                </div>

                {/* Status Update Buttons */}
                <div className="flex space-x-2">
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'In Progress')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'In Progress' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'Ready')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'Delivered')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
