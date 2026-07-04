import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Package, Heart, LogOut, Settings, CreditCard, ChevronRight, 
  Edit2, ShieldCheck, ArrowLeft, Calendar, FileText, CheckCircle2, 
  XCircle, RefreshCw, Star, MessageSquare, AlertCircle, ShoppingBag, 
  HelpCircle, Sparkles, MapPin, Truck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import usePageTitle from '../hooks/usePageTitle';
import { AppConfig } from '../config/appConfig';

const getCustomizationDetails = (item: any) => {
  const baseUrl = AppConfig.API_BASE_URL;
  if (item.customization) {
    try {
      const data = typeof item.customization === 'string' ? JSON.parse(item.customization) : item.customization;
      let img = data.imageUrl || data.image || null;
      if (img && img.startsWith('/uploads')) {
        img = `${baseUrl}${img}`;
      }
      return {
        text: data.text || data.note || null,
        imageUrl: img
      };
    } catch (e) {}
  }
  const note = item.customizationNote || item.customizationText || item.customizationImage || item.note;
  if (note) {
    try {
      const data = JSON.parse(note);
      let img = data.imageUrl || data.image || null;
      if (img && img.startsWith('/uploads')) {
        img = `${baseUrl}${img}`;
      }
      return {
        text: data.text || data.note || null,
        imageUrl: img
      };
    } catch (e) {
      if (note.startsWith('http')) {
        return { text: null, imageUrl: note };
      }
      if (note.startsWith('/uploads')) {
        return { text: null, imageUrl: `${baseUrl}${note}` };
      }
      return { text: note, imageUrl: null };
    }
  }
  return null;
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = isAuthenticated && user?.roles?.some(r => r.toLowerCase() === 'admin');



  // Order history state
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Order detail state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Product images mapping
  const [productImages, setProductImages] = useState<Record<number, string>>({});
  usePageTitle(selectedOrder ? 'Order Details' : 'My Orders');

  // Dialog & Form states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');

  // Review states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCommentTouched, setReviewCommentTouched] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; isError: boolean }>({
    show: false,
    message: '',
    isError: false,
  });

  const triggerToast = (message: string, isError: boolean) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'unauthorized') {
      triggerToast('Access Denied: You do not have permissions to access the admin area.', true);
      navigate('/profile', { replace: true });
    }
  }, [location, navigate]);

  // Helper formatting functions
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Confirmed':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'Processing':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Shipped':
        return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'Delivered':
        return 'bg-green-50 text-green-600 border border-green-100';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 border border-red-100';
      case 'Refunded':
        return 'bg-gray-100 text-gray-600 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-500 border border-gray-100';
    }
  };

  // Fetch product images for mapping
  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        const res = await fetch('/api/products?pageSize=100');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const mapping: Record<number, string> = {};
            json.data.forEach((p: any) => {
              mapping[p.id] = p.imageUrl;
            });
            setProductImages(mapping);
          }
        }
      } catch (err) {
                                                           
      }
    };
    fetchProductImages();
  }, []);

  // Fetch customer orders list
  const fetchOrders = async () => {
    if (!user?.token) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?page=${page}&pageSize=5`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setOrders(json.data);
        }
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
        }
      }
    } catch (err) {
                                                  
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && !selectedOrder) {
      fetchOrders();
    }
  }, [page, activeTab, selectedOrder, user]);

  // Fetch specific order details
  const fetchOrderDetails = async (orderId: number) => {
    if (!user?.token) return;
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success || json.succeeded) {
          setSelectedOrder(json.data);
        } else {
          triggerToast(json.message || 'Failed to load order details.', true);
        }
      } else {
        triggerToast('Failed to load order details from backend.', true);
      }
    } catch (err) {
      triggerToast('Connection error. Failed to load order details.', true);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // User details fallback parsing
  const nameParts = user?.name ? user.name.split(' ') : ['John', 'Doe'];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const email = user?.email || 'john.doe@example.com';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JD';

  // Order timeline configuration
  const STATUS_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const getStepIndex = (status: string) => {
    if (status === 'Paid') return 1; // Map Paid to Confirmed step index
    return STATUS_STEPS.indexOf(status);
  };

  // Perform Cancel Order Action
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const result = await res.json();

      if (res.ok && (result.success || result.succeeded)) {
        triggerToast('Order cancelled successfully.', false);
        setIsCancelModalOpen(false);
        // Refresh detail view
        await fetchOrderDetails(selectedOrder.id);
      } else {
        triggerToast(result.message || 'Failed to cancel the order.', true);
      }
    } catch (err) {
      triggerToast('Connection error. Failed to cancel order.', true);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Perform Return Order Action
  const handleReturnOrder = async () => {
    if (!selectedOrder) return;
    if (!returnReason) {
      triggerToast('Please select a reason for your return request.', true);
      return;
    }
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const result = await res.json();

      if (res.ok && (result.success || result.succeeded)) {
        triggerToast('Order return request approved. Refund initiated.', false);
        setIsReturnModalOpen(false);
        setReturnReason('');
        setReturnDetails('');
        // Refresh detail view
        await fetchOrderDetails(selectedOrder.id);
      } else {
        triggerToast(result.message || 'Failed to process return request.', true);
      }
    } catch (err) {
      triggerToast('Connection error. Failed to process return request.', true);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Review Blur Validation
  const validateReview = (value: string) => {
    if (!value.trim()) {
      setReviewError('Review comment is required');
      return false;
    } else if (value.trim().length < 10) {
      setReviewError('Review must be at least 10 characters long');
      return false;
    }
    setReviewError('');
    return true;
  };

  const handleReviewBlur = () => {
    setReviewCommentTouched(true);
    validateReview(reviewComment);
  };

  // Submit Review (Simulated Front-end flow)
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewCommentTouched(true);

    if (reviewRating === 0) {
      triggerToast('Please select a star rating.', true);
      return;
    }

    if (!validateReview(reviewComment)) {
      triggerToast('Please fix the validation error in comments.', true);
      return;
    }

    setIsSubmittingAction(true);
    setTimeout(() => {
      triggerToast('Thank you! Your product review has been submitted successfully.', false);
      setIsReviewModalOpen(false);
      setReviewProduct(null);
      setReviewRating(0);
      setReviewComment('');
      setReviewCommentTouched(false);
      setIsSubmittingAction(false);
    }, 1200);
  };

  return (
    <div className="bg-secondary min-h-screen py-6 sm:py-20 relative">
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-sm font-bold backdrop-blur-md ${
              toast.isError
                ? 'bg-red-50/90 border-red-100 text-red-600'
                : 'bg-green-50/90 border-green-100 text-green-600'
            }`}
          >
            {toast.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className={`lg:w-80 space-y-8 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary text-white rounded-3xl flex items-center justify-center text-3xl font-serif font-bold mx-auto shadow-lg group-hover:scale-105 transition-transform">
                  {initials}
                </div>
                <button className="absolute bottom-0 right-1/2 translate-x-8 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-500 hover:text-primary">
                  <Edit2 size={14} />
                </button>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">{user?.name || 'John Doe'}</h2>
              <p className="text-gray-400 text-xs mt-1 font-medium italic">{user?.email || 'john.doe@example.com'}</p>
            </div>

            <nav className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden py-4">
              {[
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'profile', label: 'Profile Info', icon: User },
                { id: 'cards', label: 'Saved Cards', icon: CreditCard },
                { id: 'settings', label: 'Account Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedOrder(null); // Clear details view
                    setMobileMenuOpen(false); // Hide menu on mobile
                    window.scrollTo({ top: 0, behavior: 'instant' }); // Case B: scroll to top of content
                  }}
                  className={`w-full flex items-center space-x-4 px-8 py-5 transition-all text-sm font-bold border-r-4 ${
                    activeTab === item.id 
                    ? 'bg-primary/5 text-primary border-primary' 
                    : 'text-gray-500 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-50 px-8">
                {isAdmin && (
                  <Link to="/admin" className="w-full flex items-center space-x-4 py-5 text-[10px] font-bold text-gray-300 hover:text-primary transition-colors cursor-pointer uppercase tracking-widest">
                    <ShieldCheck size={18} />
                    <span>Staff Login</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-4 py-5 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Dashboard Panel */}
          <main className={`flex-grow ${mobileMenuOpen ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-5 sm:p-10 min-h-[600px]">
              {/* Mobile Back to Menu button */}
              {!mobileMenuOpen && (
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex items-center space-x-2 text-primary hover:underline font-bold text-xs uppercase tracking-wider mb-8 lg:hidden"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Profile Menu</span>
                </button>
              )}
              
              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-10">
                  
                  {/* --- CASE A: Selected Specific Order Detail View --- */}
                  {selectedOrder ? (
                    <div className="space-y-8">
                      {/* Back button */}
                      <BackButton onClick={() => setSelectedOrder(null)} label="Back to Orders" />

                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-serif font-bold text-gray-900">
                            Order {selectedOrder.orderNumber}
                          </h2>
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1 font-bold">
                              <Calendar size={12} />
                              Placed on {formatDate(selectedOrder.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="font-bold">Total: {formatCurrency(selectedOrder.totalAmount)}</span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${getStatusBadgeClass(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                      </div>

                      {/* --- FLIPKART PROGRESS STEP TIMELINE --- */}
                      <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-8 shadow-inner space-y-8">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Delivery Timeline</h3>
                        
                        {selectedOrder.status === 'Cancelled' ? (
                          <div className="flex items-center gap-4 text-red-500 bg-red-50 border border-red-100 p-6 rounded-2xl">
                            <XCircle size={24} className="flex-shrink-0 animate-pulse" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm">Order Cancelled</h4>
                              <p className="text-xs text-red-400">This order was cancelled and will not be processed further. If payment was made, your refund is processing.</p>
                            </div>
                          </div>
                        ) : selectedOrder.status === 'Refunded' ? (
                          <div className="flex items-center gap-4 text-gray-500 bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                            <RefreshCw size={24} className="flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm">Returned & Refunded</h4>
                              <p className="text-xs text-gray-400">The return request was approved, the item has been picked up, and your original payment has been fully refunded.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            {/* Connector line behind circles */}
                            <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded-full z-0 hidden md:block" />
                            {/* Vertical Connector line behind circles on Mobile */}
                            <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gray-200 z-0 md:hidden" />
                            <div 
                              className="absolute top-4 left-4 h-1 bg-primary rounded-full z-0 transition-all duration-700 hidden md:block"
                              style={{ 
                                width: `${(Math.max(0, getStepIndex(selectedOrder.status)) / (STATUS_STEPS.length - 1)) * 100}%` 
                              }}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
                              {STATUS_STEPS.map((stepName, idx) => {
                                const isCompleted = idx <= getStepIndex(selectedOrder.status);
                                const isActive = stepName === selectedOrder.status || (stepName === 'Confirmed' && selectedOrder.status === 'Paid');

                                return (
                                  <div key={stepName} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                                    {/* Circle Step */}
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                                      isActive 
                                        ? 'bg-primary text-white scale-110 ring-4 ring-primary/20 ring-offset-2' 
                                        : isCompleted 
                                          ? 'bg-primary text-white' 
                                          : 'bg-white text-gray-300 border-2 border-gray-200'
                                    }`}>
                                      {isCompleted ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                                    </div>

                                    {/* Text Title */}
                                    <div className="space-y-0.5">
                                      <h4 className={`text-xs font-bold ${
                                        isActive ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                      }`}>
                                        {stepName}
                                      </h4>
                                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                                        {isActive ? 'Current Stage' : isCompleted ? 'Completed' : 'Upcoming'}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {selectedOrder.trackingUrl && (
                          <div className="mt-6 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Shipment Tracking Link</span>
                              <a 
                                href={selectedOrder.trackingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs font-bold text-primary hover:underline break-all"
                              >
                                {selectedOrder.trackingUrl}
                              </a>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedOrder.trackingUrl).then(() => {
                                  triggerToast('Copied!', false);
                                }).catch(() => {
                                  triggerToast('Failed to copy', true);
                                });
                              }}
                              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 flex-shrink-0"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Split view: Shipping Details & Pricing Summary */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Shipping Address */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                            <MapPin size={14} className="text-primary" />
                            Shipping Details
                          </h3>
                          {selectedOrder.shippingAddress ? (
                            <div className="text-sm space-y-2 text-gray-600 font-medium">
                              <p className="font-bold text-gray-900 text-base">{selectedOrder.shippingAddress.fullName}</p>
                              <p>{selectedOrder.shippingAddress.addressLine1}</p>
                              {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                              <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                              <p className="pt-2 text-xs font-bold text-gray-900">Phone: {selectedOrder.shippingAddress.phone}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No shipping address recorded.</p>
                          )}
                        </div>

                        {/* Order Pricing Breakdown */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                            <FileText size={14} className="text-primary" />
                            Payment Receipt
                          </h3>
                          <div className="space-y-3 text-sm font-medium">
                            <div className="flex justify-between text-gray-500">
                              <span>Subtotal</span>
                              <span>{formatCurrency(selectedOrder.subTotal || selectedOrder.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Shipping Cost</span>
                              <span>{selectedOrder.shippingCost === 0 ? 'FREE' : formatCurrency(selectedOrder.shippingCost || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Tax Amount</span>
                              <span>{formatCurrency(selectedOrder.taxAmount || 0)}</span>
                            </div>
                            <div className="border-t border-gray-50 pt-3 flex justify-between font-bold text-gray-900 text-base">
                              <span>Grand Total</span>
                              <span className="text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                            </div>
                            {selectedOrder.payment && (
                              <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex items-center justify-between text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-wider">
                                  Method: {selectedOrder.payment.method === 'CashOnDelivery' ? 'Cash on Delivery' : selectedOrder.payment.method}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                  selectedOrder.payment.status?.toLowerCase() === 'success' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {selectedOrder.payment.method === 'CashOnDelivery' && selectedOrder.payment.status?.toLowerCase() === 'pending'
                                    ? 'Pay on Delivery'
                                    : `Payment ${selectedOrder.payment.status}`
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* --- ORDER ITEMS LIST & ACTIONS --- */}
                      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                          <ShoppingBag size={14} className="text-primary" />
                          Order Items
                        </h3>

                        <div className="divide-y divide-gray-50">
                          {selectedOrder.items?.map((item: any) => (
                            <div key={item.id} className="py-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
                              {/* Left details */}
                              <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                                  {productImages[item.productId] ? (
                                    <img 
                                      src={productImages[item.productId]} 
                                      alt={item.productName} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ShoppingBag size={24} className="text-gray-300" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-bold text-gray-900 text-sm hover:text-primary transition-colors cursor-pointer">
                                    {item.productName}
                                  </h4>
                                  <p className="text-xs text-gray-400">
                                    Qty: <span className="font-bold text-gray-700">{item.quantity}</span> • Unit Price: <span className="font-bold text-gray-700">{formatCurrency(item.unitPrice)}</span>
                                  </p>
                                  {item.variantInfo && (
                                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                      {item.variantInfo}
                                    </span>
                                  )}
                                  
                                  {/* Customization Details inside customer side Order Details page */}
                                  {(() => {
                                    const customization = getCustomizationDetails(item);
                                    const customText = customization?.text || item?.customization?.text || item?.customText || null;
                                    const customImage = customization?.imageUrl || item?.customization?.imageUrl || item?.customImage || null;
                                    if (!customText && !customImage) return null;
                                    return (
                                      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                                        {customText && (
                                          <p className="text-xs text-indigo-650 font-semibold bg-indigo-50/50 px-3 py-1 rounded-lg w-max flex items-center gap-1">
                                            ✏️ Text: "{customText}"
                                          </p>
                                        )}
                                        {customImage && (
                                          <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Custom design image:</p>
                                            <img
                                              src={customImage}
                                              className="custom-uploaded-image"
                                              onClick={() => window.open(customImage, '_blank')}
                                              title="Click to view full size"
                                              alt="Custom upload"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Right details & review button */}
                              <div className="flex items-center gap-4">
                                <span className="text-base font-bold text-gray-900">{formatCurrency(item.totalPrice)}</span>
                                
                                {/* Write Review Button (Delivered status only) */}
                                {selectedOrder.status === 'Delivered' && (
                                  <button
                                    onClick={() => {
                                      setReviewProduct(item);
                                      setReviewRating(0);
                                      setReviewComment('');
                                      setReviewCommentTouched(false);
                                      setReviewError('');
                                      setIsReviewModalOpen(true);
                                    }}
                                    className="flex items-center space-x-1.5 px-4 py-2 bg-primary/5 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all border border-primary/10"
                                  >
                                    <Star size={12} />
                                    <span>Write Review</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* --- ACTIONS BUTTON CONTAINER (CANCEL / RETURN) --- */}
                      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                        {/* Cancel order button */}
                        {(selectedOrder.status === 'Pending' || selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Processing') && (
                          <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="w-full sm:w-auto px-8 py-4 border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest shadow-sm"
                          >
                            Cancel Entire Order
                          </button>
                        )}

                        {/* Return order button */}
                        {selectedOrder.status === 'Delivered' && (
                          <button
                            onClick={() => setIsReturnModalOpen(true)}
                            className="w-full sm:w-auto px-8 py-4 border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest shadow-sm"
                          >
                            Return Items & Refund
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    
                    /* --- CASE B: Paginated Order List View --- */
                    <div className="space-y-10">
                      <BackButton />
                      <div className="space-y-1">
                        <h2 className="text-3xl font-serif font-bold text-gray-900">Order History</h2>
                        <p className="text-gray-400 text-sm">Track and manage your recent purchases.</p>
                      </div>

                      {isLoadingOrders ? (
                        /* Skeleton Loading Cards */
                        <div className="space-y-6">
                          {[1, 2, 3].map(n => (
                            <div key={n} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between gap-6 animate-pulse">
                              <div className="space-y-3 flex-grow">
                                <div className="h-4 bg-gray-200 rounded-full w-1/4" />
                                <div className="h-6 bg-gray-200 rounded-full w-2/3" />
                                <div className="h-4 bg-gray-200 rounded-full w-1/3" />
                              </div>
                              <div className="w-24 h-10 bg-gray-200 rounded-xl" />
                            </div>
                          ))}
                        </div>
                      ) : orders.length === 0 ? (
                        /* Empty State Container */
                        <div className="text-center py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-[2.5rem] p-8 space-y-6">
                          <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <ShoppingBag size={32} />
                          </div>
                          <div className="space-y-2 max-w-sm mx-auto">
                            <h3 className="text-2xl font-serif font-bold text-gray-900">No orders yet</h3>
                            <p className="text-gray-400 text-sm">You haven't placed any orders yet. Explore our handcrafted gifts and treasures to start your collection!</p>
                          </div>
                          <Link 
                            to="/products" 
                            className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-95 shadow-lg transition-all text-xs uppercase tracking-widest"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        /* Live Orders List */
                        <div className="space-y-6">
                          {orders.map((order, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={order.id}
                              className="group p-5 sm:p-8 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-gray-250 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-2.5 flex-grow">
                                <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {formatDate(order.createdAt)}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(order.status)}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-none">{order.orderNumber}</h4>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider leading-none">
                                  {order.items?.length || 1} {order.items?.length === 1 ? 'Item' : 'Items'} • <span className="font-extrabold text-primary">{formatCurrency(order.totalAmount)}</span>
                                </p>
                                
                                {/* Product images row: w-12 h-12 (48x48px) thumbnails [M10] */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="w-12 h-12 bg-white border border-gray-150 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
                                      {productImages[item.productId] ? (
                                        <img 
                                          src={productImages[item.productId]} 
                                          alt={item.productName} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <ShoppingBag size={16} className="text-gray-300" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button 
                                onClick={() => fetchOrderDetails(order.id)}
                                className="w-full sm:w-auto h-11 flex items-center justify-center space-x-1 px-5 bg-white text-gray-950 rounded-xl text-xs font-bold shadow-2xs border border-gray-100 hover:bg-primary hover:text-white transition-all cursor-pointer select-none active:scale-[0.98]"
                              >
                                <span>View Details</span>
                                <ChevronRight size={12} />
                              </button>
                            </motion.div>
                          ))}

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-6">
                              <button
                                onClick={() => {
                                  setPage(p => Math.max(1, p - 1));
                                  window.scrollTo({ top: 0, behavior: 'smooth' }); // Case C: scroll on page change
                                }}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all cursor-pointer"
                              >
                                Previous
                              </button>
                              <span className="text-xs font-bold text-gray-500 font-serif">
                                Page {page} of {totalPages}
                              </span>
                              <button
                                onClick={() => {
                                  setPage(p => Math.min(totalPages, p + 1));
                                  window.scrollTo({ top: 0, behavior: 'smooth' }); // Case C: scroll on page change
                                }}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all cursor-pointer"
                              >
                                Next
                              </button>
                            </div>
                          )}
                         </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                 <div className="space-y-10">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-serif font-bold text-gray-900">Personal Information</h2>
                      <p className="text-gray-400 text-sm">Update your account details and contact information.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                         { label: 'First Name', val: firstName, icon: User },
                         { label: 'Last Name', val: lastName, icon: User },
                         { label: 'Email Address', val: email, icon: User },
                         { label: 'Phone Number', val: '+91 98765 43210', icon: User },
                       ].map((field, i) => (
                         <div key={i} className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                           <input 
                            type="text" 
                            defaultValue={field.val}
                            className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" 
                           />
                         </div>
                       ))}
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Default Shipping Address</label>
                          <textarea 
                            rows={3}
                            className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none"
                            defaultValue="123, Luxury Heights, Marine Drive, Mumbai - 400001"
                          />
                       </div>
                    </div>
                    <button 
                      onClick={() => triggerToast('Personal profile saved successfully!', false)}
                      className="bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:bg-opacity-90 transition-all uppercase tracking-widest text-xs cursor-pointer"
                    >
                       Save Changes
                    </button>
                 </div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === 'wishlist' && (
                 <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                       <Heart size={32} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-serif font-bold text-gray-900">Your Wishlist is Empty</h3>
                       <p className="text-gray-400 max-w-xs mx-auto text-sm">Save items you love and keep track of them here.</p>
                    </div>
                    <Link 
                      to="/products" 
                      className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-95 shadow-md text-xs uppercase tracking-widest"
                    >
                      Start Shopping
                    </Link>
                 </div>
              )}

              {/* FALLBACK TABS */}
              {activeTab !== 'orders' && activeTab !== 'profile' && activeTab !== 'wishlist' && (
                <div className="text-center py-20 text-gray-400 font-serif italic text-2xl">
                  Section is under development...
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 💥 CANCEL CONFIRMATION DIALOG (GLASSMORPHISM STYLE) 💥 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isCancelModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 max-w-md w-full p-10 space-y-6 shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <AlertCircle size={28} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-gray-900">Cancel Your Order?</h3>
                <p className="text-gray-400 text-sm">Are you sure you want to cancel order <strong>{selectedOrder.orderNumber}</strong>? This operation cannot be reversed.</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isSubmittingAction}
                  className="flex-grow py-4 border-2 border-gray-100 hover:bg-gray-50 text-gray-500 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  No, Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isSubmittingAction}
                  className="flex-grow py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingAction ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <span>Yes, Cancel</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 💥 RETURN CONFIRMATION DIALOG (GLASSMORPHISM STYLE) 💥 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isReturnModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 max-w-md w-full p-10 space-y-6 shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <RefreshCw size={28} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-gray-900">Return Request</h3>
                <p className="text-gray-400 text-sm">Please let us know the reason for returning order <strong>{selectedOrder.orderNumber}</strong> to initiate the refund.</p>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reason for Return</label>
                  <select 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-gray-800"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Damaged Item">Damaged during shipping</option>
                    <option value="Defective Product">Defective or broken product</option>
                    <option value="Wrong Item">Received wrong item</option>
                    <option value="Quality Issues">Quality did not match expectations</option>
                    <option value="Changed Mind">No longer needed / Changed mind</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Additional Comments (Optional)</label>
                  <textarea 
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    rows={2}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none"
                    placeholder="Provide details about the issue..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setIsReturnModalOpen(false)}
                  disabled={isSubmittingAction}
                  className="flex-grow py-4 border-2 border-gray-100 hover:bg-gray-50 text-gray-500 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnOrder}
                  disabled={isSubmittingAction || !returnReason}
                  className="flex-grow py-4 bg-primary hover:bg-opacity-90 text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAction ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <span>Submit Return</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 💥 PRODUCT REVIEW DIALOG (GLASSMORPHISM STYLE) 💥 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isReviewModalOpen && reviewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 max-w-md w-full p-10 space-y-6 shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Sparkles size={28} />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-gray-900">Write Product Review</h3>
                <p className="text-gray-400 text-xs font-medium">Your feedback helps thousands of buyers decide. Tell us about your experience with:</p>
                <p className="font-bold text-sm text-primary">{reviewProduct.productName}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                
                {/* INTERACTIVE STARS RATING */}
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Your Rating</label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star 
                          size={28} 
                          className={`transition-colors ${
                            star <= reviewRating 
                              ? 'fill-primary text-primary filter drop-shadow-md' 
                              : 'text-gray-200 hover:text-primary/40'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEXTAREA COMMENT */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Comments</label>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-semibold">Min 10 Chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => {
                      setReviewComment(e.target.value);
                      if (reviewCommentTouched) validateReview(e.target.value);
                    }}
                    onBlur={handleReviewBlur}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none ${
                      reviewCommentTouched && reviewError 
                        ? 'border-red-300 ring-2 ring-red-100 bg-red-50/10' 
                        : reviewCommentTouched && !reviewError && reviewComment.trim().length >= 10
                          ? 'border-green-300 ring-2 ring-green-100 bg-green-50/10' 
                          : 'border-transparent'
                    }`}
                    placeholder="Describe product quality, shipping experience, custom craftsmanship details..."
                  />
                  {reviewCommentTouched && reviewError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1"
                    >
                      <AlertCircle size={10} />
                      {reviewError}
                    </motion.p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={isSubmittingAction}
                    className="flex-grow py-4 border-2 border-gray-100 hover:bg-gray-50 text-gray-500 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction || reviewRating === 0 || !reviewComment.trim() || reviewComment.trim().length < 10}
                    className="flex-grow py-4 bg-primary hover:bg-opacity-90 text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingAction ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
