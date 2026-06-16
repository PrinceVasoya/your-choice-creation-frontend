import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import BackButton from '../components/BackButton';
import usePageTitle from '../hooks/usePageTitle';

export default function OrderSuccess() {
  usePageTitle('Order Success');
  const location = useLocation();
  const navigate = useNavigate();
  
  const paid = location.state?.paid;
  const orderId = location.state?.orderId;
  const orderNumber = location.state?.orderNumber;
  const estimatedDeliveryDate = location.state?.estimatedDeliveryDate;

  useEffect(() => {
    if (!paid) {
      navigate('/cart', { replace: true });
    }
  }, [paid, navigate]);

  if (!paid) return null;

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-24 sm:py-24 text-center space-y-8 select-none animate-fade-in">
      <BackButton label="Home" to="/" />
      
      {/* Success Animated Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="w-20 h-20 bg-green-150 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-green-200/50"
      >
        <CheckCircle2 size={48} />
      </motion.div>

      <div className="space-y-3">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Order Placed Successfully!</h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Thank you for shopping with us! Your personalized creation order has been confirmed and sent to our design studio.
        </p>
      </div>

      {/* Order Reference Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-2xs text-left space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles size={16} className="text-primary animate-pulse flex-shrink-0" />
          <h3 className="font-serif font-bold text-sm text-gray-900">Order Confirmation Details</h3>
        </div>
        
        <div className="divide-y divide-gray-50 text-xs font-semibold text-gray-650">
          <div className="py-2.5 flex justify-between">
            <span className="text-gray-400 uppercase tracking-wider">Order Reference ID</span>
            <span className="text-gray-900 font-bold">{orderNumber || orderId}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} />
              Estimated Delivery
            </span>
            <span className="text-primary font-bold">{estimatedDeliveryDate || '5-7 business days'}</span>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <Link 
          to="/" 
          className="flex-grow sm:flex-none inline-flex items-center justify-center bg-gray-50 text-gray-700 hover:bg-gray-100 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-gray-200 active:scale-95 shadow-2xs"
        >
          Back to Homepage
        </Link>
        <Link 
          to="/profile" 
          className="flex-grow sm:flex-none inline-flex items-center justify-center bg-primary text-white hover:bg-opacity-95 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md gap-1.5"
        >
          <ShoppingBag size={14} />
          <span>View Order Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
