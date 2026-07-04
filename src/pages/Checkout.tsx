import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, User, Phone, MapPin, Sparkles, AlertTriangle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import usePageTitle from '../hooks/usePageTitle';

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export default function Checkout() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, discount, promoCode, isLoading: cartLoading } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    console.log("Checkout page mounted");
  }, []);

  // Wizard Step State: 2 = Address Selection/Form, 3 = Order Summary
  const [activeStep, setActiveStep] = useState(2);

  const [addressId, setAddressId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; isError: boolean }>({
    show: false,
    message: '',
    isError: false,
  });

  const triggerToast = (message: string, isError: boolean) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Shipping Form States [V4]
  const [fullName, setFullName] = useState(() => user?.name || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [pincode, setPincode] = useState('');

  // Saved addresses from database
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Validation States (Touched & Errors)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Personalization customization inputs at checkout (Fix 5)
  const [checkoutCustomizations, setCheckoutCustomizations] = useState<Record<string, { text: string; imageUrl: string }>>({});
  const [customizationErrors, setCustomizationErrors] = useState<Record<string, { text?: boolean; image?: boolean }>>({});

  // Cart Calculations
  const shipping = cartTotal > 999 ? 0 : (cartTotal === 0 ? 0 : 99);
  const total = cartTotal - discount + shipping;

  const customizableItems = useMemo(() => {
    return cart.filter(item =>
      !!(item.hasCustomization || item.customizationAvailable || item.allowCustomImage || (item.personalizationType && item.personalizationType !== 'none'))
    );
  }, [cart]);

  // Fetch saved addresses from backend database
  const fetchAddresses = async () => {
    if (!user?.token) return;
    console.log("Fetching addresses...");
    setIsLoadingAddresses(true);
    try {
      const response = await fetch('/api/users/addresses', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success || result.succeeded) {
          const list = result.data || [];
          setSavedAddresses(list);
          if (list.length > 0) {
            // Pre-select default address, or the first one
            const defaultAddr = list.find((a: any) => a.isDefault) || list[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressId(defaultAddr.id);
            setShowAddressForm(false);
          } else {
            setShowAddressForm(true);
          }
        } else {
          setSavedAddresses([]);
          setShowAddressForm(true);
        }
      } else {
        setSavedAddresses([]);
        setShowAddressForm(true);
      }
    } catch (e) {
      console.error(e);
      setSavedAddresses([]);
      setShowAddressForm(true);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

  // Synchronize fullName and email when user details load (Fix 6)
  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user, fullName, email]);

  // Find currently selected address object
  const selectedAddress = useMemo(() => {
    return savedAddresses.find(a => a.id === selectedAddressId);
  }, [savedAddresses, selectedAddressId]);

  // Live Field Validation Logic [V4]
  const validateField = (field: string, value: string) => {
    let err = '';
    switch (field) {
      case 'fullName':
        if (!value.trim()) err = 'Please enter your full name';
        else if (value.trim().length < 3) err = 'Please enter your full name';
        break;
      case 'phone':
        if (!value.trim() || !/^\d{10}$/.test(value.trim())) err = 'Enter valid 10-digit number';
        break;
      case 'address':
        if (!value.trim() || value.trim().length < 10) err = 'Enter complete address';
        break;
      case 'city':
        if (!value.trim()) err = 'Enter city name';
        break;
      case 'pincode':
        if (!value.trim() || !/^\d{6}$/.test(value.trim())) err = 'Enter valid 6-digit PIN code';
        break;
      case 'state':
        if (!value) err = 'Please select your state';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  // Submit and Save address to Database
  const handleSaveAddress = async () => {
    const fields = ['fullName', 'phone', 'address', 'city', 'pincode', 'state'];
    const values = { fullName, phone, address, city, pincode, state: selectedState };

    let hasError = false;
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const err = validateField(field, (values as any)[field]);
      if (err) hasError = true;
    });

    setTouched(newTouched);

    if (hasError) {
      triggerToast('Please complete shipping details correctly.', true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone,
          addressLine1: address,
          addressLine2: addressLine2 || '',
          city: city,
          state: selectedState,
          postalCode: pincode,
          country: 'India',
          isDefault: savedAddresses.length === 0
        })
      });

      if (response.status === 401) {
        logout();
        triggerToast('Session expired. Please log in again.', true);
        navigate('/auth?redirect=checkout');
        return;
      }

      const result = await response.json();

      if (response.ok && (result.success || result.succeeded) && result.data) {
        const newAddress = result.data;
        triggerToast('Address saved successfully!', false);
        await fetchAddresses();
        setSelectedAddressId(newAddress.id);
        setAddressId(newAddress.id);
        setActiveStep(3); // Go to Order Summary
      } else {
        const errorMsg = result.errors && result.errors.length > 0
          ? result.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
          : (result.message || 'Failed to save address.');
        triggerToast(errorMsg, true);
      }
    } catch (err) {
      triggerToast('Connection error. Failed to save address.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSelectedAddress = () => {
    if (!selectedAddressId) {
      triggerToast('Please select a shipping address.', true);
      return;
    }
    setAddressId(selectedAddressId);
    setActiveStep(3); // Go to Order Summary
  };

  // Submit Order Placement and open Razorpay Payment
  const handlePlaceOrder = async () => {
    if (!addressId) {
      triggerToast('Shipping address is missing. Please select or add an address.', true);
      return;
    }

    // Customization details validation (Engraving and Custom Design check)
    let hasErrors = false;
    const errorsMap: Record<string, { text?: boolean; image?: boolean }> = {};

    for (const item of customizableItems) {
      const isTextRequired = !!(item.hasCustomization || item.personalizationType === 'text' || item.personalizationType === 'both');
      const isImageRequired = !!(item.allowCustomImage || item.personalizationType === 'photo' || item.personalizationType === 'both');

      const data = checkoutCustomizations[item.id] || { text: '', imageUrl: '' };
      const itemErrors: { text?: boolean; image?: boolean } = {};

      if (isTextRequired && !data.text.trim()) {
        itemErrors.text = true;
        hasErrors = true;
        triggerToast(`Please enter personalization text for '${item.name}'`, true);
      } else if (isTextRequired && data.text.length > 100) {
        itemErrors.text = true;
        hasErrors = true;
        triggerToast(`Custom text for '${item.name}' exceeds the 100-character limit.`, true);
      }

      if (isImageRequired && !data.imageUrl) {
        itemErrors.image = true;
        hasErrors = true;
        triggerToast(`Please upload custom design image for '${item.name}'`, true);
      }

      if (Object.keys(itemErrors).length > 0) {
        errorsMap[item.id] = itemErrors;
      }
    }

    if (hasErrors) {
      setCustomizationErrors(errorsMap);
      const elem = document.getElementById('customization-details-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setCustomizationErrors({});
    setIsSubmitting(true);

    try {
      // Synchronize cart items to database cart first
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });

        for (const item of cart) {
          const cleanId = item.id.startsWith('p') ? Number(item.id.replace('p', '')) : Number(item.id);
          const customData = checkoutCustomizations[item.id];
          const customizationNote = customData
            ? JSON.stringify({
              text: customData.text || '',
              imageUrl: customData.imageUrl || '',
              customizationText: customData.text || '',
              customizationImage: customData.imageUrl || '',
              size: item.size
            })
            : item.size || null;

          await fetch('/api/cart/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.token}`
            },
            body: JSON.stringify({
              productId: cleanId,
              quantity: item.quantity,
              productVariantId: null,
              customizationNote: customizationNote
            })
          });
        }
      } catch (syncErr) {
        console.error('Cart sync failed, proceeding anyway:', syncErr);
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          shippingAddressId: addressId,
          notes: 'Delivered with care',
          paymentMethod: 'Razorpay'
        })
      });

      if (response.status === 401) {
        logout();
        triggerToast('Session expired. Please log in again.', true);
        navigate('/auth?redirect=checkout');
        return;
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('Failed to parse order response:', e);
        throw new Error('Server returned an invalid response.');
      }

      if (response.ok && (result.success || result.succeeded) && result.data) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          triggerToast('Failed to load Razorpay payment SDK. Are you online?', true);
          setIsSubmitting(false);
          return;
        }

        const apiOrderId = result.data.id;
        const rpOrderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            amount: total,
            receipt: result.data.orderNumber,
            orderId: apiOrderId
          })
        });

        const rpOrderJson = await rpOrderRes.json();
        if (!rpOrderRes.ok || !rpOrderJson.orderId) {
          triggerToast('Failed to initiate online payment.', true);
          setIsSubmitting(false);
          return;
        }

        const options: any = {
          key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || '',
          amount: rpOrderJson.amount,
          currency: "INR",
          name: "Your Choice Creation",
          description: "Gifts Order Payment",
          handler: async function (paymentResponse: any) {
            setIsSubmitting(true);
            try {
              const verify = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id || rpOrderJson.orderId,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  orderId: apiOrderId
                }),
              });
              const verifyResult = await verify.json();
              if (verifyResult.success || verifyResult.succeeded) {
                clearCart();
                triggerToast('Payment & Order completed successfully!', false);

                const deliveryDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                navigate("/order-success", {
                  state: {
                    paid: true,
                    orderId: apiOrderId,
                    orderNumber: result.data.orderNumber,
                    estimatedDeliveryDate: deliveryDate
                  }
                });
              } else {
                alert("Payment verification failed! Please contact support.");
              }
            } catch (verifyErr) {
              alert("Payment verification failed!");
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: user?.name || fullName,
            email: user?.email || email,
            contact: phone,
          },
          theme: { color: "#8B1C1C" },
          modal: {
            ondismiss: () => {
              alert("Payment cancelled. Please try again.");
            }
          }
        };

        if (rpOrderJson.orderId && !rpOrderJson.orderId.startsWith('order_mock_')) {
          options.order_id = rpOrderJson.orderId;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        if (result.stockErrors && result.stockErrors.length > 0) {
          result.stockErrors.forEach((err: any) => {
            triggerToast(`⚠️ Stock Issue: ${err.name} - ${err.error}`, true);
          });
          setTimeout(() => {
            navigate('/cart');
          }, 2500);
          return;
        }

        const errorMsg = result.errors && result.errors.length > 0
          ? result.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
          : (result.message || 'Failed to place order.');
        triggerToast(errorMsg, true);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      triggerToast('A network error occurred. Please check your connection and try again.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-550 uppercase tracking-widest animate-pulse">Loading Cart...</p>
      </div>
    );
  }

  // Empty Cart validation [V3]
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center select-none">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertTriangle size={36} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Cart is empty</h2>
        <p className="text-gray-500 text-xs mb-8">Add customized products and cakes to start making memories.</p>
        <Link to="/products" className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-opacity-95 shadow-md transition-all active:scale-95">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 min-h-screen py-10 sm:py-16 pb-24 lg:pb-16 select-none relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-6">
          {/* Flipkart-style 3-Step Wizard Column */}
          <div className="lg:col-span-2 space-y-4">

            {/* STEP 1: LOGIN DETAILS (Read-only/done, managed by ProtectedRoute) */}
            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-2xs p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                <div>
                  <span className="font-serif font-bold text-gray-400 uppercase tracking-wider text-[9px] block">1. LOGIN STATUS</span>
                  <p className="text-sm font-bold text-gray-900">{user?.name} <span className="text-gray-400 font-normal">({user?.email})</span></p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 uppercase tracking-widest leading-none">Authenticated</span>
            </div>

            {/* STEP 2: DELIVERY ADDRESS */}
            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-2xs">

              {/* Address Step Header */}
              {activeStep > 2 ? (
                // Collapsed completed header
                <div className="px-5 py-4 flex items-center justify-between bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <div>
                      <span className="font-serif font-bold text-gray-400 uppercase tracking-wider text-[9px] block">2. DELIVERY ADDRESS</span>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {selectedAddress ? `${selectedAddress.fullName} — ${selectedAddress.phone}` : 'Address selected'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedAddress ? `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 ? selectedAddress.addressLine2 + ', ' : ''}${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postalCode}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-[10px] font-bold text-primary hover:underline border border-primary/25 px-3.5 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors uppercase tracking-widest"
                  >
                    Change
                  </button>
                </div>
              ) : (
                // Expanded active header
                <div className="px-5 py-4 flex items-center bg-gray-50 border-b border-gray-100 space-x-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">2</div>
                  <span className="font-serif font-bold text-sm sm:text-base text-gray-900">DELIVERY ADDRESS</span>
                </div>
              )}

              {/* Address Step Body */}
              <AnimatePresence initial={false}>
                {activeStep === 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 space-y-6 overflow-hidden"
                  >
                    {isLoadingAddresses ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-2">
                        <div className="w-8 h-8 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-450 uppercase tracking-widest">Loading addresses...</p>
                      </div>
                    ) : (
                      <>
                        {/* 1. Saved Addresses List (Show only if addresses exist and not forcing form) */}
                        {savedAddresses.length > 0 && !showAddressForm && (
                          <div className="space-y-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Shipping Address:</p>
                            <div className="grid grid-cols-1 gap-4">
                              {savedAddresses.map((addr) => {
                                const isSel = addr.id === selectedAddressId;
                                return (
                                  <label
                                    key={addr.id}
                                    className={`flex items-start p-4 rounded-xl border-2 transition-all cursor-pointer relative ${isSel
                                        ? 'border-primary bg-primary/5 shadow-2xs'
                                        : 'border-gray-150 hover:bg-gray-50/50'
                                      }`}
                                  >
                                    <input
                                      type="radio"
                                      name="saved_address"
                                      checked={isSel}
                                      onChange={() => setSelectedAddressId(addr.id)}
                                      className="mt-1 mr-3 accent-primary w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex-grow space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-serif font-bold text-sm text-gray-900">{addr.fullName}</span>
                                        {addr.isDefault && (
                                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Default</span>
                                        )}
                                      </div>
                                      <p className="text-xs font-semibold text-gray-650">{addr.addressLine1}</p>
                                      {addr.addressLine2 && <p className="text-xs font-semibold text-gray-650">{addr.addressLine2}</p>}
                                      <p className="text-xs text-gray-650">{addr.city}, {addr.state} - <span className="font-sans font-bold">{addr.postalCode}</span></p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-1 flex items-center gap-1">
                                        <Phone size={10} className="text-gray-400" />
                                        <span>Phone: {addr.phone}</span>
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <button
                                onClick={handleUseSelectedAddress}
                                className="flex-grow bg-primary text-white h-12 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-opacity-95 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                              >
                                <span>Deliver to Selected Address</span>
                                <ArrowRight size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  // Clear form fields
                                  setFullName(user?.name || '');
                                  setPhone('');
                                  setAddress('');
                                  setAddressLine2('');
                                  setCity('');
                                  setSelectedState('');
                                  setPincode('');
                                  setTouched({});
                                  setErrors({});
                                  setShowAddressForm(true);
                                }}
                                className="sm:px-6 h-12 bg-white text-gray-600 hover:bg-gray-50 border border-gray-250 rounded-xl font-bold text-xs uppercase tracking-widest shadow-2xs transition-all active:scale-95 flex items-center justify-center"
                              >
                                Add New Address
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. New Address Entry Form */}
                        {(savedAddresses.length === 0 || showAddressForm) && (
                          <div className="space-y-5">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add a New Delivery Address:</p>
                              {savedAddresses.length > 0 && (
                                <button
                                  onClick={() => setShowAddressForm(false)}
                                  className="text-[10px] font-extrabold text-primary uppercase tracking-widest hover:underline"
                                >
                                  Cancel & Go Back
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              {/* Full Name */}
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                  type="text"
                                  value={fullName}
                                  onChange={(e) => { setFullName(e.target.value); if (touched.fullName) validateField('fullName', e.target.value); }}
                                  onBlur={(e) => handleBlur('fullName', e.target.value)}
                                  placeholder="John Doe"
                                  className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-sm font-medium ${touched.fullName ? (errors.fullName ? 'border-red-300 focus:ring-red-100 bg-red-50/10' : 'border-green-300 focus:ring-green-100 bg-green-50/5') : 'border-transparent focus:ring-primary/10'
                                    }`}
                                  style={{ fontSize: '16px' }}
                                />
                                {errors.fullName && touched.fullName && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.fullName}</p>}
                              </div>

                              {/* Phone Number */}
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number (10 digits)</label>
                                <input
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); if (touched.phone) validateField('phone', e.target.value); }}
                                  onBlur={(e) => handleBlur('phone', e.target.value)}
                                  placeholder="9876543210"
                                  maxLength={10}
                                  className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-sm font-medium ${touched.phone ? (errors.phone ? 'border-red-300 focus:ring-red-100 bg-red-50/10' : 'border-green-300 focus:ring-green-100 bg-green-50/5') : 'border-transparent focus:ring-primary/10'
                                    }`}
                                  style={{ fontSize: '16px' }}
                                />
                                {errors.phone && touched.phone && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.phone}</p>}
                              </div>

                              {/* Address Line 1 */}
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address Line 1 (Area & Street)</label>
                                <textarea
                                  value={address}
                                  onChange={(e) => { setAddress(e.target.value); if (touched.address) validateField('address', e.target.value); }}
                                  onBlur={(e) => handleBlur('address', e.target.value)}
                                  placeholder="Flat/House No., Building Name, Street Name"
                                  rows={2}
                                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-sm font-medium resize-none ${touched.address ? (errors.address ? 'border-red-300 focus:ring-red-100 bg-red-50/10' : 'border-green-300 focus:ring-green-100 bg-green-50/5') : 'border-transparent focus:ring-primary/10'
                                    }`}
                                  style={{ fontSize: '16px' }}
                                />
                                {errors.address && touched.address && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.address}</p>}
                              </div>

                              {/* Address Line 2 */}
                              <div className="space-y-1.5 sm:col-span-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address Line 2</label>
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mr-1">Optional</span>
                                </div>
                                <input
                                  type="text"
                                  value={addressLine2}
                                  onChange={(e) => setAddressLine2(e.target.value)}
                                  placeholder="Landmark, Suite, Apartment etc. (optional)"
                                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-transparent focus:ring-primary/10 focus:outline-none focus:ring-2 text-sm font-medium"
                                  style={{ fontSize: '16px' }}
                                />
                              </div>

                              {/* City */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                                <input
                                  type="text"
                                  value={city}
                                  onChange={(e) => { setCity(e.target.value); if (touched.city) validateField('city', e.target.value); }}
                                  onBlur={(e) => handleBlur('city', e.target.value)}
                                  placeholder="Mumbai"
                                  className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-sm font-medium ${touched.city ? (errors.city ? 'border-red-300 focus:ring-red-100 bg-red-50/10' : 'border-green-300 focus:ring-green-100 bg-green-50/5') : 'border-transparent focus:ring-primary/10'
                                    }`}
                                  style={{ fontSize: '16px' }}
                                />
                                {errors.city && touched.city && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.city}</p>}
                              </div>

                              {/* State */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">State</label>
                                <select
                                  value={selectedState}
                                  onChange={(e) => { setSelectedState(e.target.value); validateField('state', e.target.value); }}
                                  onBlur={(e) => handleBlur('state', e.target.value)}
                                  className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-sm font-medium ${touched.state ? (errors.state ? 'border-red-300 focus:ring-red-100 bg-red-50/10' : 'border-green-300 focus:ring-green-100 bg-green-50/5') : 'border-transparent focus:ring-primary/10'
                                    }`}
                                  style={{ fontSize: '16px' }}
                                >
                                  <option value="">Select State</option>
                                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors.state && touched.state && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.state}</p>}
                              </div>

                              {/* Pincode */}
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pincode (6 digits)</label>
                                <input
                                  type="tel"
                                  value={pincode}
                                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); if (touched.pincode) validateField('pincode', e.target.value); }}
                                  onBlur={(e) => handleBlur('pincode', e.target.value)}
                                  placeholder="400001"
                                  maxLength={6}
                                  className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-sm font-medium ${touched.pincode ? (errors.pincode ? 'border-red-300 focus:ring-red-100 bg-red-50/10' : 'border-green-300 focus:ring-green-100 bg-green-50/5') : 'border-transparent focus:ring-primary/10'
                                    }`}
                                  style={{ fontSize: '16px' }}
                                />
                                {errors.pincode && touched.pincode && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.pincode}</p>}
                              </div>
                            </div>

                            <button
                              onClick={handleSaveAddress}
                              disabled={isSubmitting}
                              className="w-full bg-primary text-white h-12 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-opacity-95 transition-all flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50 mt-4"
                            >
                              <span>Save and Continue</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 3: ORDER SUMMARY & PAYMENT */}
            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-2xs">

              {/* Summary Step Header */}
              {activeStep < 3 ? (
                // Collapsed locked header
                <div className="px-5 py-4 flex items-center bg-gray-50/50 border-b border-gray-100 opacity-55 space-x-3">
                  <div className="w-7 h-7 rounded-full bg-gray-250 text-gray-400 flex items-center justify-center font-bold text-xs">3</div>
                  <span className="font-serif font-bold text-sm sm:text-base text-gray-500">ORDER SUMMARY</span>
                </div>
              ) : (
                // Expanded active header
                <div className="px-5 py-4 flex items-center bg-gray-50 border-b border-gray-100 space-x-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">3</div>
                  <span className="font-serif font-bold text-sm sm:text-base text-gray-900">ORDER SUMMARY</span>
                </div>
              )}

              {/* Summary Step Body */}
              <AnimatePresence initial={false}>
                {activeStep === 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 space-y-6 overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Delivery Address chosen info card */}
                      <div className="p-4 bg-gray-50 rounded-xl space-y-1.5 text-xs font-semibold text-gray-600 border border-gray-100">
                        <p className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">Shipping Delivery To:</p>
                        <p className="text-gray-900 font-bold">{selectedAddress?.fullName} ({selectedAddress?.phone})</p>
                        <p className="text-gray-700">{selectedAddress?.addressLine1}, {selectedAddress?.addressLine2 ? selectedAddress?.addressLine2 + ', ' : ''}{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.postalCode}</p>
                      </div>

                      {/* Customization Engravings Form (If items are customisable) */}
                      {customizableItems.length > 0 && (
                        <div id="customization-details-section" className="space-y-5 pt-3 pb-3 border-t border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <Sparkles size={15} className="text-primary animate-pulse flex-shrink-0" />
                            <h4 className="font-serif font-bold text-sm text-gray-900">Customization Details</h4>
                          </div>
                          <div className="space-y-4">
                            {customizableItems.map((item) => {
                              const isTextRequired = !!(item.hasCustomization || item.personalizationType === 'text' || item.personalizationType === 'both');
                              const isImageRequired = !!(item.allowCustomImage || item.personalizationType === 'photo' || item.personalizationType === 'both');

                              const customData = checkoutCustomizations[item.id] || { text: '', imageUrl: '' };
                              const itemErrors = customizationErrors[item.id] || {};

                              return (
                                <div key={item.id} className="p-4 rounded-xl bg-amber-50/25 border border-amber-200/40 space-y-3">
                                  <div className="flex items-center gap-3">
                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shadow-sm bg-white" />
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-sans font-bold text-xs text-gray-900 leading-tight truncate">{item.name}</h5>
                                      <span className="text-[8px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5 inline-block">
                                        Personalization Required
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {/* Text Input */}
                                    {isTextRequired && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                          <label className={`text-[9px] font-bold uppercase tracking-widest ${itemErrors.text ? 'text-red-500 font-extrabold' : 'text-gray-400'}`}>
                                            Custom Text/Name {itemErrors.text && '(Required)'}
                                          </label>
                                          <span className="text-[9px] text-gray-400 font-bold">{100 - customData.text.length} left</span>
                                        </div>
                                        <input
                                          type="text"
                                          value={customData.text}
                                          onChange={(e) => {
                                            const textVal = e.target.value.slice(0, 100);
                                            setCheckoutCustomizations(prev => ({
                                              ...prev,
                                              [item.id]: { ...(prev[item.id] || { text: '', imageUrl: '' }), text: textVal }
                                            }));
                                            setCustomizationErrors(prev => {
                                              const next = { ...prev };
                                              if (next[item.id]) {
                                                const updatedItem = { ...next[item.id] };
                                                delete updatedItem.text;
                                                if (Object.keys(updatedItem).length === 0) delete next[item.id];
                                                else next[item.id] = updatedItem;
                                              }
                                              return next;
                                            });
                                          }}
                                          placeholder="Engraving text (eg: 'Happy Birthday John')"
                                          className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold shadow-2xs ${itemErrors.text ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                      </div>
                                    )}

                                    {/* Image Upload */}
                                    {isImageRequired && (
                                      <div className="space-y-1 pt-1">
                                        <label className={`text-[9px] font-bold uppercase tracking-widest block ${itemErrors.image ? 'text-red-500 font-extrabold' : 'text-gray-400'}`}>
                                          Design Photo {itemErrors.image && '(Required)'}
                                        </label>
                                        <div className="flex items-center gap-3">
                                          <label className={`cursor-pointer px-3.5 py-2 bg-white border rounded-xl shadow-2xs hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 ${itemErrors.image ? 'border-red-500' : 'border-gray-200'
                                            }`}>
                                            <ImageIcon size={14} className="text-gray-400" />
                                            <span>{customData.imageUrl ? 'Change Image' : 'Choose File (JPG/PNG/WEBP)'}</span>
                                            <input
                                              type="file"
                                              accept="image/jpeg,image/png,image/webp"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                                                if (!validTypes.includes(file.type)) {
                                                  triggerToast('Invalid file format. Please upload JPG, PNG, or WEBP only.', true);
                                                  return;
                                                }

                                                if (file.size > 5 * 1024 * 1024) {
                                                  triggerToast('File is too large. Maximum size allowed is 5MB.', true);
                                                  return;
                                                }

                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  setCheckoutCustomizations(prev => ({
                                                    ...prev,
                                                    [item.id]: { ...(prev[item.id] || { text: '', imageUrl: '' }), imageUrl: reader.result as string }
                                                  }));
                                                  setCustomizationErrors(prev => {
                                                    const next = { ...prev };
                                                    if (next[item.id]) {
                                                      const updatedItem = { ...next[item.id] };
                                                      delete updatedItem.image;
                                                      if (Object.keys(updatedItem).length === 0) delete next[item.id];
                                                      else next[item.id] = updatedItem;
                                                    }
                                                    return next;
                                                  });
                                                };
                                                reader.readAsDataURL(file);
                                              }}
                                            />
                                          </label>

                                          {customData.imageUrl && (
                                            <div className="flex items-center gap-2">
                                              <img src={customData.imageUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover shadow-sm border border-white bg-white" />
                                              <p className="text-[9px] text-green-600 font-bold uppercase tracking-wider">✓ Attached</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Items lists summary */}
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Items:</p>
                        <div className="divide-y divide-gray-100 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          {cart.map((item) => (
                            <div key={item.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center space-x-3">
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shadow-inner bg-white" />
                                <div>
                                  <h4 className="font-bold text-gray-900 truncate max-w-[180px] sm:max-w-[300px]">{item.name}</h4>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Confirmation Note */}
                      <p className="text-2xs font-semibold text-gray-400 italic text-center">
                        An order confirmation and receipt summary will be automatically sent to **{user?.email}** upon completion.
                      </p>

                      {/* Pay CTA */}
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white h-13 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Initiating Payment...</span>
                          </span>
                        ) : (
                          <>
                            <CreditCard size={15} />
                            <span>Place Order & Pay ₹{total.toLocaleString('en-IN')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Summary Sidebar (Right column) */}
          <div className="lg:sticky lg:top-32 h-fit space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-150 shadow-2xs">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900 mb-6">Price Details</h2>

              <div className="space-y-4 pt-2 text-xs font-semibold text-gray-400">
                <div className="flex justify-between uppercase tracking-wider">
                  <span>Price ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent font-bold">
                    <span>Discount ({promoCode})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between uppercase tracking-wider border-b border-dashed border-gray-100 pb-4">
                  <span>Delivery Charges</span>
                  <span className={shipping === 0 ? "text-green-600 font-bold" : "text-gray-900 font-bold"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-serif font-bold text-gray-900 pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs flex items-start gap-3.5">
              <ShieldCheck className="text-green-600 w-8 h-8 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-xs text-gray-900">100% Safe and Secure</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-semibold uppercase tracking-wider">Razorpay trusted network encryption secures all payment data integrations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`toast-top-center fixed z-50 flex items-center space-x-3 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl ${toast.isError ? 'bg-red-600 border border-red-500' : 'bg-emerald-600 border border-emerald-500'
              }`}
          >
            {toast.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
