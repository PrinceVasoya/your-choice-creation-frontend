import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCookie, deleteCookie } from '../utils/cookies';
import usePageTitle from '../hooks/usePageTitle';

/**
 * Guard against open-redirect attacks.
 * Only allows same-origin relative paths (must start with '/').
 * Rejects: protocol-relative (//evil.com), absolute URLs (http://...), empty values.
 */
function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return '/';
  // Reject protocol-relative and absolute URLs
  if (value.startsWith('//') || /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value)) return '/';
  // Ensure it's a relative path starting with /
  if (!value.startsWith('/')) return `/${value}`;
  return value;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  usePageTitle(isLogin ? 'Login' : 'Create Account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Touched and validation error states [V6]
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<{ show: boolean; message: string; isError: boolean }>({
    show: false,
    message: '',
    isError: false,
  });

  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();
  const { restoreCart } = useCart();
  const isAdmin = isAuthenticated && user?.roles?.some(r => r.toLowerCase() === 'admin');

  const triggerToast = (message: string, isError: boolean) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const searchParams = new URLSearchParams(window.location.search);
      const queryRedirect = searchParams.get('redirect');
      const localRedirect = localStorage.getItem("redirectAfterLogin");
      const redirectTo = safeRedirectPath(localRedirect || queryRedirect);
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectTo, { replace: true });
    }
  }, [navigate]);

  // Keyboard scroll helper [M9]
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Validation rules [V6]
  const validateField = (field: string, value: string) => {
    let err = '';
    switch (field) {
      case 'name':
        if (!value.trim()) err = 'Full name is required';
        else if (value.trim().length < 3) err = 'Name must be at least 3 characters';
        break;
      case 'email':
        if (!value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          err = 'Enter valid email address';
        }
        break;
      case 'password':
        if (!value || value.length < 8) {
          err = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (value !== password) {
          err = 'Passwords do not match';
        }
        break;
      case 'phone':
        if (!value.trim() || !/^\d{10}$/.test(value.trim())) {
          err = 'Enter valid 10-digit mobile number';
        }
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

  const handleRedirectLogic = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryRedirect = searchParams.get('redirect');
    const localRedirect = localStorage.getItem('redirectAfterLogin');
    const cookieRedirect = getCookie('redirectAfterLogin');
    const cartDataStr = getCookie('cartData');

    // Validate all redirect sources — reject anything that isn't a safe relative path
    const redirect = safeRedirectPath(localRedirect || queryRedirect || cookieRedirect);

    if (redirect.startsWith('/cart') || redirect.startsWith('/checkout')) {
      if (cartDataStr) {
        try {
          const restoredItems = JSON.parse(cartDataStr);
          restoreCart(restoredItems);
        } catch (e) {
          // Ignore malformed cart cookie
        }
        deleteCookie('cartData');
      }
    }

    localStorage.removeItem('redirectAfterLogin');
    deleteCookie('redirectAfterLogin');

    setTimeout(() => {
      navigate(redirect, { replace: true });
    }, 500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Trigger validations
    const fields = isLogin ? ['email', 'password'] : ['name', 'email', 'phone', 'password', 'confirmPassword'];
    const values = { name, email, phone, password, confirmPassword };
    
    let hasError = false;
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const err = validateField(field, (values as any)[field]);
      if (err) hasError = true;
    });

    setTouched(newTouched);

    if (hasError) {
      triggerToast('Please resolve validation errors first.', true);
      return;
    }

    setIsLoading(true);

    let res = { success: false, error: '' };
    if (isLogin) {
      const loginRes = await login(email, password);
      res = { success: loginRes.success, error: loginRes.error || 'Invalid credentials.' };
    } else {
      const registerRes = await register(name, email, password);
      res = { success: registerRes.success, error: registerRes.error || 'Registration failed.' };
    }

    setIsLoading(false);

    if (res.success) {
      triggerToast(isLogin ? 'Login Successful! Welcome back' : 'Registration Successful! Welcome back', false);
      handleRedirectLogic();
    } else {
      triggerToast(res.error, true);
    }
  };

  // Note: Google OAuth removed (was a fake simulation with hardcoded credentials).
  // To add real Google login, integrate @react-oauth/google with a proper OAuth flow.

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6 py-20 relative select-none">
      
      {/* Toast Notification Container (top-center [M12]) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`toast-top-center fixed z-50 flex items-center space-x-3 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl ${
              toast.isError ? 'bg-red-600 border border-red-500' : 'bg-emerald-600 border border-emerald-500'
            }`}
          >
            {toast.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered full width card on mobile [M9] */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl sm:rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-150"
      >
        <div className="p-6 sm:p-10">
          <div className="text-center mb-8 space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider leading-none pt-1">
              {isLogin ? 'Sign in to access your gifts' : 'Join YourChoice gift community'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {/* Full Name (Sign Up only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-1.5 leading-none">
                    <User size={12} className="text-primary" />
                    <span>Full Name</span>
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (touched.name) validateField('name', e.target.value); }}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="John Doe" 
                    className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-base font-semibold ${
                      touched.name ? (errors.name ? 'border-red-300 focus:ring-red-100' : 'border-green-300 focus:ring-green-100') : 'border-transparent focus:ring-primary/10'
                    }`} 
                    style={{ fontSize: '16px' }} // Prevent iOS Zoom
                  />
                  {errors.name && touched.name && <p className="text-[10px] font-bold text-red-500 ml-1 leading-none pt-0.5">{errors.name}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-1.5 leading-none">
                <Mail size={12} className="text-primary" />
                <span>Email Address</span>
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (touched.email) validateField('email', e.target.value); }}
                onBlur={(e) => handleBlur('email', e.target.value)}
                onFocus={handleFocus}
                placeholder="hello@example.com" 
                className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-base font-semibold ${
                  touched.email ? (errors.email ? 'border-red-300 focus:ring-red-100 bg-red-50/10' : 'border-green-300 focus:ring-green-100 bg-green-50/5') : 'border-transparent focus:ring-primary/10'
                }`} 
                style={{ fontSize: '16px' }}
              />
              {errors.email && touched.email && <p className="text-[10px] font-bold text-red-500 ml-1 leading-none pt-0.5">{errors.email}</p>}
            </div>

            <AnimatePresence mode="popLayout">
              {/* Phone (Sign Up only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-1.5 leading-none">
                    <Phone size={12} className="text-primary" />
                    <span>Phone Number</span>
                  </label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); if (touched.phone) validateField('phone', e.target.value); }}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="9876543210" 
                    maxLength={10}
                    className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-base font-semibold ${
                      touched.phone ? (errors.phone ? 'border-red-300 focus:ring-red-100' : 'border-green-300 focus:ring-green-100') : 'border-transparent focus:ring-primary/10'
                    }`} 
                    style={{ fontSize: '16px' }}
                  />
                  {errors.phone && touched.phone && <p className="text-[10px] font-bold text-red-500 ml-1 leading-none pt-0.5">{errors.phone}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-1.5 leading-none">
                <Lock size={12} className="text-primary" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (touched.password) validateField('password', e.target.value); }}
                  onBlur={(e) => handleBlur('password', e.target.value)}
                  onFocus={handleFocus}
                  placeholder="••••••••" 
                  className={`w-full h-12 pl-4 pr-12 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-base font-semibold ${
                    touched.password ? (errors.password ? 'border-red-300 focus:ring-red-100' : 'border-green-300 focus:ring-green-100') : 'border-transparent focus:ring-primary/10'
                  }`} 
                  style={{ fontSize: '16px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none text-[10px] font-bold uppercase tracking-wider p-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && touched.password && <p className="text-[10px] font-bold text-red-500 ml-1 leading-none pt-0.5">{errors.password}</p>}
            </div>

            <AnimatePresence mode="popLayout">
              {/* Confirm Password (Sign Up only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-1.5 leading-none">
                    <Lock size={12} className="text-primary" />
                    <span>Confirm Password</span>
                  </label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => { 
                      setConfirmPassword(e.target.value); 
                      // Real-time check as user types
                      if (e.target.value !== password) {
                        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                      } else {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="••••••••" 
                    className={`w-full h-12 px-4 rounded-xl bg-gray-50 border focus:outline-none focus:ring-2 text-base font-semibold ${
                      touched.confirmPassword ? (errors.confirmPassword ? 'border-red-300 focus:ring-red-100' : 'border-green-300 focus:ring-green-100') : 'border-transparent focus:ring-primary/10'
                    }`} 
                    style={{ fontSize: '16px' }}
                  />
                  {errors.confirmPassword && touched.confirmPassword && <p className="text-[10px] font-bold text-red-500 ml-1 leading-none pt-0.5">{errors.confirmPassword}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex justify-end pt-1">
                <button type="button" className="text-2xs font-extrabold text-primary uppercase tracking-widest hover:underline">Forgot Password?</button>
              </div>
            )}

            {/* CTA action button exactly 48px / h-12 high */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white h-12 rounded-xl font-bold shadow-md hover:bg-opacity-95 transition-all flex items-center justify-center space-x-2 group cursor-pointer disabled:opacity-50 mt-4 active:scale-95"
            >
              <span>{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>


        </div>

        {/* Tab triggers toggling isLogin */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100 flex flex-col space-y-3">
           <button 
            onClick={() => { setIsLogin(!isLogin); setErrors({}); setTouched({}); }}
            className="text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer"
           >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
           </button>
           {isAdmin && (
             <Link 
              to="/admin"
              className="text-[9px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-[0.25em]"
             >
              Staff Login
             </Link>
           )}
        </div>
      </motion.div>
    </div>
  );
}
