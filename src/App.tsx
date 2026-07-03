/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminPanel from './pages/Admin';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import FAQ from './pages/FAQ';
import Shipping from './pages/Shipping';
import OrderSuccess from './pages/OrderSuccess';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import ScrollToTop from './components/ScrollToTop';

import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <Layout>{children}</Layout>
);

const AppRoutes = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = isAuthenticated && user?.roles?.includes('Admin');

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Auth />} />
        <Route 
          path="/admin/*" 
          element={
            isAdmin 
            ? <AdminPanel onLogout={logout} /> 
            : <Navigate to="/login?redirect=admin" replace />
          } 
        />

        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <PublicLayout>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<ProtectedRoute><ErrorBoundary><Checkout /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/shipping" element={<Shipping />} />
              </Routes>
            </PublicLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}
