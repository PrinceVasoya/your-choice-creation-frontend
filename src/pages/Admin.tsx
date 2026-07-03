import { 
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, DollarSign, 
  PackagePlus, Eye, Edit, Trash2, Search, Bell, Menu as MenuIcon, X, 
  CheckCircle2, AlertCircle, Sparkles, FolderOpen, ToggleLeft, ToggleRight,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, FormEvent } from 'react';
import { Link, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mapApiProductToFrontend } from '../utils/api';
import Modal from '../components/Modal';
import BackButton from '../components/BackButton';
import usePageTitle from '../hooks/usePageTitle';
import { AppConfig } from '../config/appConfig';

// Helper to parse description
export const parseProductDescription = (desc: string) => {
  if (!desc) return { description: '', variants: [], isCustomizationAvailable: false, customizationTypes: [], customizationInstructions: '', images: [] };
  const marker = '__CUSTOM_PRODUCT_DATA__:';
  const index = desc.indexOf(marker);
  if (index !== -1) {
    const rawDesc = desc.substring(0, index).trim();
    const jsonStr = desc.substring(index + marker.length).trim();
    try {
      const data = JSON.parse(jsonStr);
      return {
        description: rawDesc,
        variants: data.variants || [],
        isCustomizationAvailable: data.isCustomizationAvailable || false,
        customizationTypes: data.customizationTypes || [],
        customizationInstructions: data.customizationInstructions || '',
        images: data.images || []
      };
    } catch (e) {
                                                           
    }
  }
  return { description: desc, variants: [], isCustomizationAvailable: false, customizationTypes: [], customizationInstructions: '', images: [] };
};

// Helper to stringify description
export const buildProductDescription = (desc: string, variants: any[], isCustomizationAvailable: boolean, customizationTypes: string[], customizationInstructions: string, images: string[]) => {
  const marker = '__CUSTOM_PRODUCT_DATA__:';
  const cleanDesc = desc.split(marker)[0].trim();
  const data = {
    variants,
    isCustomizationAvailable,
    customizationTypes,
    customizationInstructions,
    images
  };
  return `${cleanDesc} ${marker}${JSON.stringify(data)}`;
};

// --- Sidebar Link Component ---
const SidebarLink = ({ to, icon: Icon, label, active, onClick }: { to: string, icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <Link to={to} onClick={onClick} className={`flex items-center space-x-3 px-6 py-4 transition-all border-r-4 ${active ? 'bg-primary/5 text-primary border-primary' : 'text-gray-500 border-transparent hover:bg-gray-50'}`}>
    <Icon size={20} />
    <span className="font-bold text-sm tracking-wide uppercase">{label}</span>
  </Link>
);

// --- Header Component ---
const AdminHeader = ({ title, onMenuClick }: { title: string, onMenuClick: () => void }) => {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b border-gray-100 py-6 px-4 sm:px-10 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-primary transition-colors"
        >
          <MenuIcon size={24} />
        </button>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4 sm:space-x-6">
        <button className="p-2 text-gray-400 hover:text-primary relative group">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-gray-100 pl-4 sm:pl-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-sm uppercase">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-gray-900 leading-none">{user?.name || 'Admin User'}</p>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Store Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Formatted Currency Helper ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// --- Formatted Date Helper ---
const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

// --- Customization Note Helper Parser ---
const getCustomizationDetails = (item: any) => {
  const baseUrl = AppConfig.API_BASE_URL;
  if (!item) return null;
  if (item.customization) {
    let img = item.customization.imageUrl || item.customization.image || null;
    if (img && img.startsWith('/uploads')) {
      img = `${baseUrl}${img}`;
    }
    return {
      text: item.customization.text || item.customization.note || null,
      imageUrl: img
    };
  }
  
  const note = item.customizationNote || item.customizationText || item.customizationImage || item.note;
  if (!note) return null;
  if (typeof note === 'object') {
    let img = note.imageUrl || note.image || null;
    if (img && img.startsWith('/uploads')) {
      img = `${baseUrl}${img}`;
    }
    return {
      text: note.text || note.note || null,
      imageUrl: img
    };
  }

  if (typeof note === 'string') {
    const trimmed = note.trim();
    if (!trimmed) return null;
    
    // Check if it's a JSON string
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        let img = parsed.imageUrl || parsed.image || parsed.customImage || null;
        if (img && img.startsWith('/uploads')) {
          img = `${baseUrl}${img}`;
        }
        return {
          text: parsed.text || parsed.note || parsed.customText || null,
          imageUrl: img
        };
      } catch (e) {
        // Fall through
      }
    }

    // Check if it is a URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return {
        text: null,
        imageUrl: trimmed
      };
    }

    if (trimmed.startsWith('/uploads')) {
      return {
        text: null,
        imageUrl: `${baseUrl}${trimmed}`
      };
    }

    return {
      text: trimmed,
      imageUrl: null
    };
  }

  return null;
};

// --- Customization Design Components ---
const CustomDownloadButton = ({ imageUrl, orderId, itemIndex }: { imageUrl: string, orderId: string | number, itemIndex: number }) => {
  const [btnText, setBtnText] = useState('⬇ Download Design Image');
  const [disabled, setDisabled] = useState(false);

  const handleDownload = async () => {
    try {
      setBtnText('Downloading...');
      setDisabled(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-design-${orderId}-${itemIndex}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBtnText('✓ Downloaded!');
      setTimeout(() => {
        setBtnText('⬇ Download Design Image');
        setDisabled(false);
      }, 2000);
    } catch {
      setBtnText('Download failed. Try again');
      setDisabled(false);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleDownload}
      className="w-full h-11 sm:h-11 h-12 mt-3 bg-[#667eea] hover:bg-[#5a6fd6] active:translate-y-0 disabled:bg-[#a0b0e8] disabled:cursor-not-allowed text-white border-none rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)]"
    >
      {btnText}
    </button>
  );
};

const CustomImagePreview = ({ imageUrl, orderId, itemIndex }: { imageUrl: string, orderId: string | number, itemIndex: number }) => {
  const [hasError, setHasError] = useState(false);

  const handleClickZoom = () => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="flex flex-col">
      <div className="text-xs text-gray-600 font-bold mb-2 flex items-center gap-1.5">
        <span>🖼️ Custom Design Image (Click to Zoom)</span>
      </div>
      <div className="flex items-start gap-4">
        {hasError ? (
          <div className="bg-[#f5f5f5] border-2 border-dashed border-[#d0d0d0] rounded-xl overflow-hidden w-[120px] h-[120px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center p-2 text-gray-400 gap-1">
              <span className="text-xl">📷</span>
              <p className="text-[10px] font-bold">No image</p>
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Custom design"
            onError={() => setHasError(true)}
            onClick={handleClickZoom}
            className="custom-uploaded-image"
            title="Click to view full image in a new tab"
          />
        )}
        {!hasError && (
          <div className="flex-1 self-center">
            <CustomDownloadButton imageUrl={imageUrl} orderId={orderId} itemIndex={itemIndex} />
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminPanel({ onLogout }: { onLogout?: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const getAdminPageName = () => {
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') return 'Dashboard';
    if (currentPath === '/admin/categories') return 'Categories';
    if (currentPath === '/admin/products') return 'Products';
    if (currentPath === '/admin/orders') return 'Orders';
    if (currentPath === '/admin/customers') return 'Customers';
    return 'Admin';
  };
  const adminPageName = getAdminPageName();
  usePageTitle(`${adminPageName} — Your Choice Creation Admin`);

  // Global Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; isError: boolean }>({
    show: false,
    message: '',
    isError: false
  });

  const triggerToast = (message: string, isError: boolean) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- Sub-Pages State Loading & Fetching ---
  const [dashboardData, setDashboardData] = useState<{
    revenue: number;
    thisYearRevenue: number;
    thisMonthRevenue: number;
    ordersCount: number;
    productsCount: number;
    customersCount: number;
    categoriesCount: number;
    recentOrders: any[];
  }>({
    revenue: 0,
    thisYearRevenue: 0,
    thisMonthRevenue: 0,
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0,
    categoriesCount: 0,
    recentOrders: []
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Order Details Modal states
  const [productImages, setProductImages] = useState<Record<number, string>>({});
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);
  const [isLoadingOrderDetail, setIsLoadingOrderDetail] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState<string | null>(null);

  // Modal Controllers
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryStatus, setCategoryStatus] = useState(true);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Premium Modals & states ---
  const [isProductViewModalOpen, setIsProductViewModalOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<any | null>(null);
  
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [isAdminProductDescExpanded, setIsAdminProductDescExpanded] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDiscountPrice, setProductDiscountPrice] = useState('');
  const [productStock, setProductStock] = useState('100');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagesList, setProductImagesList] = useState<{ url: string; isUploading?: boolean }[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  
  const [productVariants, setProductVariants] = useState<{type: string, values: string[]}[]>([]);
  const [isCustomizationAvailable, setIsCustomizationAvailable] = useState(false);
  const [customizationTypes, setCustomizationTypes] = useState<string[]>([]); // 'image', 'text'
  const [customizationInstructions, setCustomizationInstructions] = useState('');

  // Temp states for variants builder in Modal Form
  const [newVarType, setNewVarType] = useState('Size');
  const [newCustomVarType, setNewCustomVarType] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [tempVarValues, setTempVarValues] = useState<string[]>([]);
  
  // Custom Warn Dialog Modal (Replaces window.confirm)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'category' | 'product'>('product');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');

  // Fetch Category List
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        if ((json.success || json.succeeded) && json.data) {
          setCategories(json.data);
        }
      }
    } catch (err) {
                        
    }
  };

  // Fetch Product List
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?pageSize=100');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setProducts(json.data);
          const mapping: Record<number, string> = {};
          json.data.forEach((p: any) => {
            if (p.id && p.imageUrl) {
              mapping[p.id] = p.imageUrl;
            }
          });
          setProductImages(mapping);
        }
      }
    } catch (err) {
                        
    }
  };

  // Fetch Customer List
  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/users/admin/all', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if ((json.success || json.succeeded) && json.data) {
          setCustomers(json.data);
        }
      }
    } catch (err) {
                        
    }
  };

  // Fetch Order List
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/admin/all?pageSize=100', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setOrders(json.data);
        }
      }
    } catch (err) {
                        
    }
  };

  // Aggregated Dashboard stats
  const aggregateDashboard = async () => {
    setIsLoading(true);
    try {
      const catRes = await fetch('/api/categories');
      const prodRes = await fetch('/api/products?pageSize=100');
      const custRes = await fetch('/api/users/admin/all', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const ordRes = await fetch('/api/orders/admin/all?pageSize=100', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });

      let revenue = 0;
      let thisYearRevenue = 0;
      let thisMonthRevenue = 0;
      let recentOrders: any[] = [];
      let catsCount = 0;
      let prodsCount = 0;
      let custsCount = 0;
      let ordsCount = 0;

      if (catRes.ok) {
        const catJson = await catRes.json();
        if (catJson.data) catsCount = catJson.data.length;
      }
      if (prodRes.ok) {
        const prodJson = await prodRes.json();
        if (prodJson.data) prodsCount = prodJson.data.length;
      }
      if (custRes.ok) {
        const custJson = await custRes.json();
        if (custJson.data) custsCount = custJson.data.length;
      }
      if (ordRes.ok) {
        const ordJson = await ordRes.json();
        if (ordJson.data) {
          ordsCount = ordJson.data.length;
          recentOrders = ordJson.data.slice(0, 5);
          
          const nonCancelledRefunded = ordJson.data.filter((o: any) => {
            const status = String(o.status || '').toLowerCase();
            return status !== 'cancelled' && status !== 'refunded';
          });

          revenue = nonCancelledRefunded.reduce((sum: number, o: any) => {
            return sum + Number(o.grandTotal || 0);
          }, 0);

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();

          thisYearRevenue = nonCancelledRefunded
            .filter((o: any) => {
              const orderDate = new Date(o.createdAt);
              return orderDate.getFullYear() === currentYear;
            })
            .reduce((sum: number, o: any) => {
              return sum + Number(o.grandTotal || 0);
            }, 0);

          thisMonthRevenue = nonCancelledRefunded
            .filter((o: any) => {
              const orderDate = new Date(o.createdAt);
              return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
            })
            .reduce((sum: number, o: any) => {
              return sum + Number(o.grandTotal || 0);
            }, 0);
        }
      }

      setDashboardData({
        revenue,
        thisYearRevenue,
        thisMonthRevenue,
        ordersCount: ordsCount,
        productsCount: prodsCount,
        customersCount: custsCount,
        categoriesCount: catsCount,
        recentOrders
      });
    } catch (err) {
      triggerToast('Failed to load dashboard data', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      if (currentPath === '/admin' || currentPath === '/admin/dashboard') aggregateDashboard();
      if (currentPath === '/admin/categories') fetchCategories();
      if (currentPath === '/admin/products') {
        fetchProducts();
        fetchCategories();
      }
      if (currentPath === '/admin/orders') fetchOrders();
      if (currentPath === '/admin/customers') fetchCustomers();
    }
  }, [currentPath, user]);

  const getTitle = () => {
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') return 'Dashboard';
    if (currentPath === '/admin/categories') return 'Category CRUD';
    if (currentPath === '/admin/products') return 'Inventory';
    if (currentPath === '/admin/add-product') return 'Listing';
    if (currentPath === '/admin/orders') return 'Orders Management';
    if (currentPath === '/admin/customers') return 'Customers Control';
    return 'Admin Control';
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

  // --- Category CRUD Actions ---
  const handleOpenCategoryCreate = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryStatus(true);
    setCategoryImage(null);
    setCategoryError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryEdit = (cat: any) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setCategoryStatus(cat.isActive ?? true);
    setCategoryImage(null);
    setCategoryError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      triggerToast('Category Name is required.', true);
      setCategoryError('Category Name is required.');
      return;
    }

    setIsSubmitting(true);
    setCategoryError('');
    const formData = new FormData();
    formData.append('Name', categoryName);
    formData.append('Description', categoryDescription);
    formData.append('IsActive', String(categoryStatus));
    if (categoryImage) {
      formData.append('Image', categoryImage);
    }

    try {
      const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories';
      const method = editingCategoryId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && (result.success || result.succeeded)) {
        triggerToast(editingCategoryId ? 'Category updated successfully!' : 'Category created successfully!', false);
        setIsCategoryModalOpen(false);
        fetchCategories();
      } else {
        const errorMsg = result.errors && result.errors.length > 0 
          ? result.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
          : (result.message || 'Failed to save category.');
        triggerToast(errorMsg, true);
        setCategoryError(errorMsg);
      }
    } catch (err) {
      triggerToast('Failed to save category.', true);
      setCategoryError('Connection error. Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteCategory = (cat: any) => {
    setDeleteType('category');
    setDeleteId(cat.id);
    setDeleteName(cat.name);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteProduct = (prod: any) => {
    setDeleteType('product');
    setDeleteId(Number(prod.id));
    setDeleteName(prod.name);
    setIsDeleteConfirmOpen(true);
  };

  const executeDeleteAction = async () => {
    if (!deleteId) return;
    setIsDeleteConfirmOpen(false);
    
    if (deleteType === 'category') {
      try {
        const response = await fetch(`/api/categories/${deleteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const result = await response.json();

        if (response.ok && (result.success || result.succeeded)) {
          triggerToast('Category deleted successfully!', false);
          fetchCategories();
        } else {
          triggerToast(result.message || 'Remove all products first before deleting this category', true);
        }
      } catch (err) {
        triggerToast('Failed to delete category.', true);
      }
    } else {
      try {
        const response = await fetch(`/api/products/${deleteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const result = await response.json();

        if (response.ok && (result.success || result.succeeded)) {
          triggerToast('Product deleted successfully!', false);
          fetchProducts();
        } else {
          triggerToast(result.message || 'Failed to delete product.', true);
        }
      } catch (err) {
        triggerToast('Connection error. Failed to delete product.', true);
      }
    }
  };

  // --- Product CRUD Actions ---
  const handleOpenProductCreate = () => {
    setEditingProductId(null);
    setProductName('');
    setProductPrice('');
    setProductDiscountPrice('');
    setProductStock('100');
    setProductCategoryId('');
    setProductDescription('');
    setProductImageFile(null);
    setProductImagesList([]);
    
    setProductVariants([]);
    setIsCustomizationAvailable(false);
    setCustomizationTypes([]);
    setCustomizationInstructions('');
    setNewVarType('Size');
    setNewCustomVarType('');
    setNewVarValue('');
    setTempVarValues([]);
    
    setProductFormError('');
    setIsAdminProductDescExpanded(false);
    setIsProductFormModalOpen(true);
  };

  const handleOpenProductEdit = (prod: any) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductPrice(String(prod.price));
    setProductDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setProductStock(String(prod.stock));
    setProductCategoryId(String(prod.categoryId));
    
    const parsed = parseProductDescription(prod.description || '');
    setProductDescription(parsed.description);
    setProductVariants(parsed.variants);
    setIsCustomizationAvailable(parsed.isCustomizationAvailable);
    setCustomizationTypes(parsed.customizationTypes);
    setCustomizationInstructions(parsed.customizationInstructions);
    
    if (parsed.images && parsed.images.length > 0) {
      setProductImagesList(parsed.images.map((img: string) => ({ url: img })));
    } else if (prod.imageUrl) {
      setProductImagesList([{ url: prod.imageUrl }]);
    } else {
      setProductImagesList([]);
    }

    setNewVarType('Size');
    setNewCustomVarType('');
    setNewVarValue('');
    setTempVarValues([]);
    
    setProductImageFile(null);
    setProductFormError('');
    setIsAdminProductDescExpanded(false);
    setIsProductFormModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!productName.trim() || productName.length < 5) {
      triggerToast('Product Name must be at least 5 characters.', true);
      setProductFormError('Product Name must be at least 5 characters.');
      return;
    }
    if (!productPrice || Number(productPrice) <= 0) {
      triggerToast('Price must be greater than 0.', true);
      setProductFormError('Price must be greater than 0.');
      return;
    }
    if (productDiscountPrice && Number(productDiscountPrice) >= Number(productPrice)) {
      triggerToast('Discount Price must be less than original Price.', true);
      setProductFormError('Discount Price must be less than original Price.');
      return;
    }
    if (productDiscountPrice && Number(productDiscountPrice) < 0) {
      triggerToast('Discount Price cannot be negative.', true);
      setProductFormError('Discount Price cannot be negative.');
      return;
    }
    if (!productStock || Number(productStock) < 0 || productStock.includes('.')) {
      triggerToast('Stock must be a non-negative whole integer.', true);
      setProductFormError('Stock must be a non-negative whole integer.');
      return;
    }
    if (!productCategoryId) {
      triggerToast('Category is required. Select from dropdown.', true);
      setProductFormError('Category is required. Select from dropdown.');
      return;
    }
    if (productImagesList.length < 2) {
      triggerToast('Please upload at least 2 product images', true);
      setProductFormError('Please upload at least 2 product images');
      return;
    }
    if (productImagesList.length > 2) {
      triggerToast('Maximum 2 product images allowed', true);
      setProductFormError('Maximum 2 product images allowed');
      return;
    }
    if (productImagesList.some(img => img.isUploading)) {
      triggerToast('Please wait for all images to finish uploading', true);
      setProductFormError('Please wait for all images to finish uploading');
      return;
    }

    if (isCustomizationAvailable && customizationTypes.length === 0) {
      triggerToast('Please select at least one customization type (Upload Image, Add Text, or Both) when customization is enabled.', true);
      setProductFormError('Please select at least one customization type (Upload Image, Add Text, or Both) when customization is enabled.');
      return;
    }

    const imageUrls = productImagesList.map(img => img.url);
    const finalDescription = buildProductDescription(
      productDescription,
      productVariants,
      isCustomizationAvailable,
      customizationTypes,
      customizationInstructions,
      imageUrls
    );

    setIsSubmitting(true);
    setProductFormError('');
    const formData = new FormData();
    formData.append('Name', productName);
    formData.append('Price', productPrice);
    if (productDiscountPrice) {
      formData.append('DiscountPrice', productDiscountPrice);
    } else {
      formData.append('DiscountPrice', '');
    }
    formData.append('Description', finalDescription);
    formData.append('Stock', productStock);
    formData.append('CategoryId', productCategoryId);
    formData.append('IsActive', 'true');
    formData.append('IsCustomizable', isCustomizationAvailable ? 'true' : 'false');
    formData.append('ImageUrl', imageUrls[0] || '');

    try {
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && (result.success || result.succeeded)) {
        triggerToast(editingProductId ? 'Product updated successfully!' : 'Product listed successfully!', false);
        setIsProductFormModalOpen(false);
        fetchProducts();
      } else {
        const errorMsg = result.errors && result.errors.length > 0 
          ? result.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
          : (result.message || 'Failed to save product.');
        triggerToast(errorMsg, true);
        setProductFormError(errorMsg);
      }
    } catch (err) {
      triggerToast('Failed to save product.', true);
      setProductFormError('Connection error. Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Order Status Actions ---
  const downloadCustomizationImage = async (imageUrl: string, orderId: string | number, itemId: string | number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-image-${orderId}-${itemId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // If CORS blocks direct fetch, open in new tab as fallback
      window.open(imageUrl, '_blank');
    }
  };

  const downloadCustomImage = async (imageUrl: string, orderId: string | number, itemIndex: number) => {
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `custom-${orderId}-item${itemIndex}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(imageUrl, '_blank'); // fallback
    }
  };

  const handleOpenOrderDetail = async (order: any) => {
    setIsLoadingOrderDetail(true);
    setIsOrderDetailModalOpen(true);
    setSelectedOrderDetail(order);
    setTrackingUrl(order.trackingUrl || '');
    setOrderDetailError(null);
    try {
      const url = `/api/orders/admin/${order.id}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });

      if (res.ok) {
        const json = await res.json();
        const fetchedOrder = json.data || json;
        setSelectedOrderDetail(fetchedOrder);
        setTrackingUrl(fetchedOrder.trackingUrl || '');
      } else {
        const resUser = await fetch(`/api/orders/${order.id}`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (resUser.ok) {
          const jsonUser = await resUser.json();
          const fetchedUserOrder = jsonUser.data || jsonUser;
          setSelectedOrderDetail(fetchedUserOrder);
          setTrackingUrl(fetchedUserOrder.trackingUrl || '');
        } else {
          setOrderDetailError('Showing saved order data. Click Retry to refresh.');
        }
      }
    } catch (err) {
      setOrderDetailError('Showing saved order data. Click Retry to refresh.');
    } finally {
      setIsLoadingOrderDetail(false);
    }
  };

  const handleOpenOrderManage = (order: any) => {
    setActiveOrder(order);
    setNewOrderStatus(order.status);
    setTrackingUrl(order.trackingUrl || '');
    setIsOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async () => {
    if (newOrderStatus === activeOrder.status && trackingUrl === (activeOrder.trackingUrl || '')) {
      triggerToast('Order details are unchanged', true);
      return;
    }

    const statuses = ['Pending', 'Confirmed', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
    const currentIdx = statuses.indexOf(activeOrder.status);
    const newIdx = statuses.indexOf(newOrderStatus);

    if (newIdx < currentIdx && newOrderStatus !== 'Cancelled' && newOrderStatus !== 'Refunded') {
      triggerToast('Cannot change status backward.', true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/admin/${activeOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newOrderStatus, trackingUrl: trackingUrl })
      });

      const result = await response.json();

      if (response.ok && (result.success || result.succeeded)) {
        triggerToast(`Order status updated to '${newOrderStatus}'`, false);
        setIsOrderModalOpen(false);
        fetchOrders();
      } else {
        triggerToast(result.message || 'Failed to update order status.', true);
      }
    } catch (err) {
      triggerToast('Failed to update status.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Customer Status Actions ---
  const handleToggleCustomerStatus = async (customer: any) => {
    if (customer.roles && customer.roles.includes('Admin')) {
      triggerToast('Cannot block admin accounts', true);
      return;
    }

    try {
      const response = await fetch(`/api/users/admin/${customer.id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const result = await response.json();

      if (response.ok && (result.success || result.succeeded)) {
        triggerToast(result.message || 'Customer status updated.', false);
        fetchCustomers();
      } else {
        triggerToast(result.message || 'Failed to update customer status.', true);
      }
    } catch (err) {
      triggerToast('Failed to toggle customer status.', true);
    }
  };

  // --- Sidebar Links ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-10 flex flex-col items-center">
          <span className="text-3xl font-serif font-bold text-primary tracking-tighter leading-none">
            YourChoice
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">
            Admin Panel
          </span>
      </div>
      
      <nav className="flex-grow py-6">
        <SidebarLink to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" active={currentPath === '/admin' || currentPath === '/admin/dashboard'} onClick={() => setIsSidebarOpen(false)} />
        <SidebarLink to="/admin/categories" icon={FolderOpen} label="Categories" active={currentPath === '/admin/categories'} onClick={() => setIsSidebarOpen(false)} />
        <SidebarLink to="/admin/products" icon={Package} label="Products" active={currentPath === '/admin/products'} onClick={() => setIsSidebarOpen(false)} />
        <SidebarLink to="/admin/orders" icon={ShoppingCart} label="Orders" active={currentPath === '/admin/orders'} onClick={() => setIsSidebarOpen(false)} />
        <SidebarLink to="/admin/customers" icon={Users} label="Customers" active={currentPath === '/admin/customers'} onClick={() => setIsSidebarOpen(false)} />
      </nav>

      <div className="p-8 space-y-4">
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-colors cursor-pointer"
          >
            <span>Logout</span>
          </button>
        )}
        <div className="bg-gray-900 text-white p-6 rounded-2xl space-y-4 shadow-2xl">
           <div className="flex items-center space-x-2 text-accent">
              <TrendingUp size={16} />
              <span className="text-[10px] uppercase font-bold tracking-widest">Premium</span>
           </div>
           <p className="text-[10px] text-gray-400 italic">"Scaling your business, one gift at a time."</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-secondary/10 relative">
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`fixed top-6 right-6 z-[9999] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm ${
              toast.isError ? 'bg-red-600 border border-red-500' : 'bg-emerald-600 border border-emerald-500'
            }`}
          >
            {toast.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 border-r border-gray-100 flex flex-col sticky top-0 h-screen bg-white">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[120] lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[130] lg:hidden"
            >
              <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:text-primary transition-colors">
                  <X size={24} />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0">
        <AdminHeader title={getTitle()} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow overflow-x-hidden">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={
              isLoading ? (
                <div className="p-10 space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-gray-200 rounded-3xl" />)}
                  </div>
                </div>
              ) : (
                <div className="space-y-10 p-6 sm:p-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                    {[
                      { label: 'Total Revenue', value: formatCurrency(dashboardData.revenue), icon: <DollarSign />, color: 'bg-[#2e7d32]' },
                      { label: 'This Year Revenue', value: formatCurrency(dashboardData.thisYearRevenue), icon: <DollarSign />, color: 'bg-[#388e3c]' },
                      { label: 'This Month Revenue', value: formatCurrency(dashboardData.thisMonthRevenue), icon: <DollarSign />, color: 'bg-[#4caf50]' },
                      { label: 'Total Orders', value: String(dashboardData.ordersCount), icon: <ShoppingCart />, color: 'bg-[#1565c0]' },
                      { label: 'Total Products', value: String(dashboardData.productsCount), icon: <Package />, color: 'bg-primary' },
                      { label: 'Total Customers', value: String(dashboardData.customersCount), icon: <Users />, color: 'bg-[#6a1b9a]' },
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_2px_8px_rgba(131,39,41,0.04)] border border-gray-100 flex flex-row items-center gap-3 sm:gap-4 hover:shadow-[0_8px_20px_rgba(131,39,41,0.08)] hover:border-primary/20 transition-all duration-300 select-none"
                      >
                        <div className={`w-10 h-10 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                          {stat.icon}
                        </div>
                        <div className="flex flex-col gap-0.5 justify-center min-w-0">
                          <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">{stat.label}</p>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-none">{stat.value}</h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-serif font-bold text-gray-900">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">View All</Link>
                      </div>
                      <div className="overflow-x-auto -mx-6 sm:mx-0">
                        <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                          <table className="min-w-full text-left">
                            <thead>
                              <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold border-b border-gray-100">
                                <th className="pb-4">Order ID</th>
                                <th className="pb-4">Customer</th>
                                <th className="pb-4">Total</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4">Status</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {dashboardData.recentOrders.map((o) => (
                                <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30">
                                  <td className="py-4 font-bold text-gray-900">{o.orderNumber}</td>
                                  <td className="py-4 text-gray-600">{o.shippingAddress?.fullName || 'Customer'}</td>
                                  <td className="py-4 font-bold text-gray-900">{formatCurrency(o.totalAmount)}</td>
                                  <td className="py-4 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                                  <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                      o.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                                      o.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {dashboardData.recentOrders.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-sm text-gray-400">No orders placed yet.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-8 relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      <div className="space-y-2 relative z-10">
                        <h3 className="text-xl font-serif font-bold text-accent">Store Performance</h3>
                        <p className="text-white/60 text-sm">Dashboard displays real-time aggregated metrics from the SQL Server database.</p>
                      </div>
                      <div className="space-y-6 relative z-10">
                        {[
                          { label: 'Conversion Rate', val: '4.8%', width: 'w-4/5' },
                          { label: 'Repeat Customers', val: '32%', width: 'w-1/3' },
                          { label: 'System Status', val: 'Online', width: 'w-full' },
                        ].map((p, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest"><span>{p.label}</span><span>{p.val}</span></div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full bg-accent ${p.width}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            } />

            {/* --- Category CRUD Section --- */}
            <Route path="categories" element={
              <div className="p-6 sm:p-10 space-y-10">
                <BackButton adminMode label="Dashboard" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Categories CRUD</h2>
                    <p className="text-gray-400 text-sm">Create, edit, and delete store categories.</p>
                  </div>
                  <button 
                    onClick={handleOpenCategoryCreate}
                    className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-opacity-90 transition-all active:scale-95 text-sm cursor-pointer"
                  >
                    <FolderOpen size={18} />
                    <span>Create Category</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                  <div className="min-w-[800px]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                          <th className="px-8 py-5">Image</th>
                          <th className="px-8 py-5">Category Name</th>
                          <th className="px-8 py-5">Slug</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                            <td className="px-8 py-5">
                              <img src={cat.imageUrl || 'https://picsum.photos/seed/cat/100/100'} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                            </td>
                            <td className="px-8 py-5 font-bold text-gray-900">{cat.name}</td>
                            <td className="px-8 py-5 text-gray-400 font-mono text-xs">
                              {cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                cat.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {cat.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end space-x-2">
                                <button onClick={() => handleOpenCategoryEdit(cat)} className="p-2 text-gray-400 hover:text-primary transition-colors cursor-pointer"><Edit size={16} /></button>
                                <button onClick={() => handleConfirmDeleteCategory(cat)} className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {categories.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-8 py-10 text-center text-gray-400">No categories found in the database.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Create/Edit Category Modal */}
                <Modal
                  isOpen={isCategoryModalOpen}
                  onClose={() => setIsCategoryModalOpen(false)}
                  title={editingCategoryId ? 'Edit Category' : 'Create Category'}
                >
                  <form onSubmit={handleSaveCategorySubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
                      <input 
                        type="text" 
                        required
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="e.g. Magic Mugs"
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Slug (Auto-generated)</label>
                      <input 
                        type="text" 
                        disabled
                        value={categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                        className="w-full px-5 py-3 rounded-xl bg-gray-100 border-none text-xs font-mono text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                      <textarea 
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="Brief description..."
                        rows={3}
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Image File</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        onClick={() => setCategoryStatus(!categoryStatus)}
                        className="text-primary focus:outline-none"
                      >
                        {categoryStatus ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-300" />}
                      </button>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status: {categoryStatus ? 'Active' : 'Inactive'}</span>
                    </div>

                    {categoryError && (
                      <div className="modal-inline-error">
                        <span>⚠️ {categoryError}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-xl hover:bg-opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Category'}
                    </button>
                  </form>
                </Modal>
              </div>
            } />

            {/* --- Inventory Products List Section --- */}
            <Route path="products" element={
              <div className="p-6 sm:p-10 space-y-10">
                <BackButton adminMode label="Dashboard" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Inventory Product List</h2>
                    <p className="text-gray-400 text-sm">Managing catalog products in your store.</p>
                  </div>
                  <button 
                    onClick={handleOpenProductCreate}
                    className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-opacity-90 transition-all active:scale-95 text-sm cursor-pointer"
                  >
                    <PackagePlus size={18} />
                    <span>Add New Product</span>
                  </button>
                </div>
 
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                  <div className="min-w-[800px]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                          <th className="px-8 py-5">Product Info</th>
                          <th className="px-8 py-5">Category</th>
                          <th className="px-8 py-5">Price</th>
                          <th className="px-8 py-5">Stock</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map((p) => {
                          const mapped = mapApiProductToFrontend(p);
                          return (
                            <tr key={mapped.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                              <td className="px-8 py-5">
                                <div className="flex items-center space-x-4">
                                  <img src={mapped.image} alt={mapped.name} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                                  <div>
                                    <p className="font-bold text-gray-900">{mapped.name}</p>
                                    <p className="text-[10px] text-gray-400 italic">SKU ID: {mapped.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="text-xs font-medium text-gray-600">{mapped.category}</span>
                              </td>
                              <td className="px-8 py-5 font-bold text-gray-900">{formatCurrency(mapped.price)}</td>
                              <td className="px-8 py-5 text-gray-500 font-medium">{p.stock} units</td>
                              <td className="px-8 py-5">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                  p.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button onClick={() => { setSelectedProductForView(p); setIsProductViewModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"><Eye size={16} /></button>
                                  <button onClick={() => handleOpenProductEdit(p)} className="p-2 text-gray-400 hover:text-primary transition-colors cursor-pointer"><Edit size={16} /></button>
                                  <button onClick={() => handleConfirmDeleteProduct(p)} className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-8 py-10 text-center text-gray-400">No products found in the database.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />

            {/* --- Add Product Component --- */}
            <Route path="add-product" element={<AddProductForm triggerToast={triggerToast} />} />

            {/* --- Manage Orders Section --- */}
            <Route path="orders" element={
              <div className="p-6 sm:p-10 space-y-10">
                <BackButton adminMode label="Dashboard" />
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Orders Management</h2>
                  <p className="text-gray-400 text-sm">Fulfill, trace, and manage customer orders.</p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                  <div className="min-w-[800px]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                          <th className="px-8 py-5">Order ID</th>
                          <th className="px-8 py-5">Customer</th>
                          <th className="px-8 py-5">Total Amount</th>
                          <th className="px-8 py-5">Order Status</th>
                          <th className="px-8 py-5 text-center w-[140px]" style={{ width: '140px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                            <td className="px-8 py-5 font-bold text-gray-900">
                              <button 
                                onClick={() => handleOpenOrderDetail(o)} 
                                className="font-bold text-gray-900 hover:text-primary hover:underline transition-colors text-left focus:outline-none cursor-pointer"
                              >
                                {o.orderNumber}
                              </button>
                            </td>
                            <td className="px-8 py-5 text-gray-600 font-medium">{o.shippingAddress?.fullName || 'Customer'}</td>
                            <td className="px-8 py-5 font-bold text-gray-900">{formatCurrency(o.totalAmount)}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusBadgeClass(o.status)}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-center" style={{ width: '140px' }}>
                              <div className="flex flex-col items-center justify-center mx-auto space-y-1.5" style={{ width: '120px' }}>
                                <button 
                                  onClick={() => handleOpenOrderDetail(o)} 
                                  className="w-full px-[14px] py-[6px] border-[1.5px] rounded-lg text-[13px] font-medium transition-all cursor-pointer text-center"
                                  style={{
                                    border: '1.5px solid #2563eb',
                                    color: '#2563eb',
                                    backgroundColor: 'white'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                    e.currentTarget.style.color = 'white';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = '#2563eb';
                                  }}
                                >
                                  View Details
                                </button>
                                <button 
                                  onClick={() => handleOpenOrderManage(o)} 
                                  className="w-full px-[14px] py-[6px] rounded-lg text-[13px] font-medium border-none transition-all cursor-pointer text-center"
                                  style={{
                                    backgroundColor: '#1e293b',
                                    color: 'white'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#334155';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1e293b';
                                  }}
                                >
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-8 py-10 text-center text-gray-400">No orders placed yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Details Modal/Popup */}
              <Modal
                isOpen={isOrderDetailModalOpen}
                onClose={() => setIsOrderDetailModalOpen(false)}
                title={selectedOrderDetail ? `Order Details: ${selectedOrderDetail.orderNumber || selectedOrderDetail.orderId || selectedOrderDetail.id}` : 'Order Details'}
                maxWidthClass="max-w-700"
              >
                {isLoadingOrderDetail ? (
                  <div className="space-y-6 animate-pulse p-2">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-24 bg-gray-100 rounded-2xl"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="space-y-3">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedOrderDetail ? (
                  <div className="space-y-6">
                    {orderDetailError && (
                      <div className="p-4 rounded-2xl text-xs flex justify-between items-center gap-3 border shadow-3xs" style={{ backgroundColor: '#fef9c3', borderColor: '#fde047', color: '#854d0e' }}>
                        <span className="font-medium">Showing saved order data. Click Retry to refresh.</span>
                        <button
                          onClick={() => handleOpenOrderDetail(selectedOrderDetail)}
                          className="px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all border border-[#fde047] hover:bg-[#fef08a]"
                          style={{ backgroundColor: '#fef08a', color: '#713f12' }}
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* 1. ORDER INFO SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 text-xs">
                      <div className="space-y-1.5">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Order Information</p>
                        <p className="text-gray-800 font-bold">Order ID: <span className="font-extrabold text-gray-900">{selectedOrderDetail.orderNumber || selectedOrderDetail.orderId || selectedOrderDetail.id}</span></p>
                        <p className="text-gray-650 font-medium">Date & Time: <span className="text-gray-850 font-bold">{formatDate(selectedOrderDetail.createdAt)}</span></p>
                        <p className="text-gray-650 font-medium">Payment Method: <span className="text-gray-850 font-bold">{selectedOrderDetail.payment?.method === 'CashOnDelivery' ? 'Cash on Delivery' : (selectedOrderDetail.payment?.method || 'N/A')}</span></p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                            (selectedOrderDetail.payment?.status || selectedOrderDetail.paymentStatus || 'Pending').toLowerCase() === 'success' 
                              ? 'bg-green-50 text-green-600 border border-green-200' 
                              : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                          }`}>
                            {selectedOrderDetail.payment?.method === 'CashOnDelivery' && (selectedOrderDetail.payment?.status || selectedOrderDetail.paymentStatus || 'Pending').toLowerCase() === 'pending'
                              ? 'Pay on Delivery (Pending)'
                              : (selectedOrderDetail.payment?.status || selectedOrderDetail.paymentStatus || 'Pending')
                            }
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${getStatusBadgeClass(selectedOrderDetail.status)}`}>
                            {selectedOrderDetail.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5 md:border-l md:border-gray-200 md:pl-4">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Customer Profile</p>
                        <p className="text-gray-850 font-semibold"><span className="text-gray-400 font-normal">Name:</span> {selectedOrderDetail.customer?.name || selectedOrderDetail.shippingAddress?.fullName || 'Customer'}</p>
                        <p className="text-gray-850 font-semibold"><span className="text-gray-400 font-normal">Email:</span> {selectedOrderDetail.customer?.email || selectedOrderDetail.user?.email || 'N/A'}</p>
                        <p className="text-gray-850 font-semibold"><span className="text-gray-400 font-normal">Phone:</span> {selectedOrderDetail.customer?.phone || selectedOrderDetail.shippingAddress?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* 2. SHIPPING ADDRESS SECTION */}
                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 text-xs space-y-2">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Shipping Address</p>
                      {selectedOrderDetail.shippingAddress ? (
                        <div className="text-gray-700 font-medium space-y-1">
                          <p className="font-bold text-gray-900">{selectedOrderDetail.shippingAddress.fullName}</p>
                          <p>{selectedOrderDetail.shippingAddress.line1 || selectedOrderDetail.shippingAddress.addressLine1}</p>
                          {(selectedOrderDetail.shippingAddress.line2 || selectedOrderDetail.shippingAddress.addressLine2) && (
                            <p>{selectedOrderDetail.shippingAddress.line2 || selectedOrderDetail.shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {selectedOrderDetail.shippingAddress.city}, {selectedOrderDetail.shippingAddress.state} - {selectedOrderDetail.shippingAddress.pincode || selectedOrderDetail.shippingAddress.postalCode}
                          </p>
                          <p className="font-bold text-gray-900 pt-1">Phone: {selectedOrderDetail.shippingAddress.phone}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No shipping details provided.</p>
                      )}
                    </div>

                    {/* 3. ORDER ITEMS SECTION (MOST IMPORTANT) */}
                    <div className="space-y-3">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] ml-1">Order Items List</p>
                      
                      <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4 divide-y divide-gray-100 border border-gray-100 rounded-2xl p-4 bg-white shadow-2xs">
                        {(() => {
                          const items = selectedOrderDetail.items || selectedOrderDetail.orderItems || selectedOrderDetail.products || selectedOrderDetail.cart || selectedOrderDetail.lineItems;
                          if (items === undefined) {
                                                                                                       
                            return <p className="text-gray-400 italic text-center py-6 text-xs font-bold">Could not load items</p>;
                          }
                          if (!Array.isArray(items) || items.length === 0) {
                            return <p className="text-gray-400 italic text-center py-6 text-xs">No items found in this order.</p>;
                          }

                          return items.map((item: any, index: number) => {
                            const productName = item?.name || item?.productName || item?.product?.name || item?.productId?.name || item?.title || 'Unknown Product';
                            const productImage = item?.productImageUrl || item?.product?.images?.[0] || item?.product?.image || item?.image || item?.productImage || item?.productId?.image || productImages[item?.productId] || null;
                            const quantity = item?.quantity || item?.qty || 1;
                            let size = item?.size || item?.selectedSize || item?.variantInfo || null;
                            if (!size && item?.customizationNote) {
                              try {
                                const parsed = JSON.parse(item.customizationNote);
                                if (parsed && parsed.size) {
                                  size = parsed.size;
                                }
                              } catch (e) {}
                            }
                            const price = item?.price || item?.unitPrice || item?.product?.price || 0;
                            const subtotal = item?.subtotal || item?.totalPrice || (price * quantity);
                            
                            const customization = getCustomizationDetails(item);
                            const customText = customization?.text || item?.customization?.text || item?.customText || null;
                            const customImage = customization?.imageUrl || item?.customization?.imageUrl || item?.customImage || null;

                            return (
                              <div key={item.id || index} className={`${index > 0 ? 'pt-4' : ''} space-y-3`}>
                                <div className="flex gap-4 items-center justify-between">
                                  <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs relative">
                                      {productImage ? (
                                        <img
                                          src={productImage}
                                          alt={productName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <ShoppingCart size={24} className="text-gray-300" />
                                      )}
                                    </div>
                                    
                                    <div className="space-y-1 text-xs">
                                      <h4 className="font-bold text-gray-900 text-sm hover:text-primary transition-colors">{productName}</h4>
                                      <p className="text-gray-500 font-medium">
                                        {size ? `Size: ${size}  |  ` : ''}Qty: {quantity}
                                      </p>
                                      <p className="text-gray-500 font-medium">
                                        Price: {formatCurrency(price)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right text-sm font-bold text-gray-900">
                                    {formatCurrency(subtotal)}
                                  </div>
                                </div>

                                {/* Professional Customization Details Section */}
                                {(customText || customImage) && (
                                  <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] my-4 text-xs">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] px-5 py-3.5 flex items-center justify-between text-white border-b border-[#e8e8e8]">
                                      <div className="flex items-center gap-2">
                                        <span className="text-base">✨</span>
                                        <span className="font-bold text-sm tracking-wide text-white uppercase">
                                          Customization Details
                                        </span>
                                      </div>
                                      <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                                        Custom Order
                                      </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex flex-col gap-4">
                                      {/* Text Customization */}
                                      {customText && (
                                        <div className="bg-[#f8f7ff] border border-[#e8e4ff] rounded-xl p-3.5 flex items-center gap-3">
                                          <div className="w-9 h-9 min-w-9 bg-[#667eea] rounded-lg flex items-center justify-center text-white font-extrabold text-base">
                                            T
                                          </div>
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                              Personalization Text
                                            </span>
                                            <span className="text-base text-gray-800 font-extrabold">
                                              {customText}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Image Customization */}
                                      {customImage && (
                                        <CustomImagePreview
                                          imageUrl={customImage}
                                          orderId={selectedOrderDetail.orderNumber || selectedOrderDetail.id}
                                          itemIndex={index}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* 4. PRICE SUMMARY SECTION */}
                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-3 text-xs">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Price Summary</p>
                      <div className="space-y-2 font-medium">
                        <div className="flex justify-between text-gray-650">
                          <span>Subtotal</span>
                          <span className="text-gray-800 font-semibold">{formatCurrency(selectedOrderDetail.subtotal || selectedOrderDetail.subTotal || selectedOrderDetail.totalAmount)}</span>
                        </div>
                        {(selectedOrderDetail.discount > 0 || selectedOrderDetail.discountAmount > 0) && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount / Coupon</span>
                            <span className="font-semibold">-{formatCurrency(selectedOrderDetail.discount || selectedOrderDetail.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-650">
                          <span>Delivery charge</span>
                          <span className="text-gray-800 font-semibold">
                            {(selectedOrderDetail.deliveryCharge || selectedOrderDetail.shippingCost) === 0 ? 'FREE' : formatCurrency(selectedOrderDetail.deliveryCharge || selectedOrderDetail.shippingCost || 0)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200/60 pt-3 flex justify-between font-bold text-gray-900 text-base">
                          <span>Total Amount</span>
                          <span className="text-primary text-xl font-extrabold">{formatCurrency(selectedOrderDetail.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Logistical Status Timeline */}
                    <div className="border-t border-gray-150 pt-5 space-y-4">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">Order Status Timeline</p>
                      <div className="grid grid-cols-5 text-center text-[8px] font-bold uppercase tracking-widest gap-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                          const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
                          const currentIdx = statuses.indexOf(selectedOrderDetail.status);
                          const isCompleted = currentIdx >= i;
                          return (
                            <div key={step} className="space-y-2">
                              <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] transition-all duration-300 ${
                                isCompleted ? 'bg-green-500 text-white shadow-sm font-bold scale-105' : 'bg-gray-100 text-gray-400'
                              }`}>
                                ✓
                              </div>
                              <span className={isCompleted ? 'text-green-600 font-bold' : 'text-gray-400'}>{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 5. ACTIONS INSIDE MODAL */}
                    <div className="space-y-3 border-t border-gray-150 pt-5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fulfill Status</label>
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          <select 
                            value={newOrderStatus || selectedOrderDetail.status} 
                            onChange={(e) => setNewOrderStatus(e.target.value)}
                            className="flex-grow px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 focus:border-primary focus:outline-none"
                          >
                            {['Pending', 'Confirmed', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button 
                            onClick={async () => {
                              const activeStatus = newOrderStatus || selectedOrderDetail.status;
                              if (activeStatus === selectedOrderDetail.status && trackingUrl === (selectedOrderDetail.trackingUrl || '')) {
                                triggerToast('Order details are unchanged', true);
                                return;
                              }
                              
                              const statuses = ['Pending', 'Confirmed', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
                              const currentIdx = statuses.indexOf(selectedOrderDetail.status);
                              const newIdx = statuses.indexOf(activeStatus);

                              if (newIdx < currentIdx && activeStatus !== 'Cancelled' && activeStatus !== 'Refunded') {
                                triggerToast('Cannot change status backward.', true);
                                return;
                              }

                              setIsSubmitting(true);
                              try {
                                const response = await fetch(`/api/orders/admin/${selectedOrderDetail.id}/status`, {
                                  method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${user?.token}`
                                    },
                                    body: JSON.stringify({ status: activeStatus, trackingUrl: trackingUrl })
                                  });

                                  const result = await response.json();

                                  if (response.ok && (result.success || result.succeeded)) {
                                    triggerToast(`Order status updated to '${activeStatus}'`, false);
                                    setSelectedOrderDetail((prev: any) => prev ? { ...prev, status: activeStatus, trackingUrl: trackingUrl } : prev);
                                    setIsOrderDetailModalOpen(false);
                                    fetchOrders();
                                  } else {
                                    triggerToast(result.message || 'Failed to update order status.', true);
                                  }
                                } catch (err) {
                                  triggerToast('Failed to update status.', true);
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              disabled={isSubmitting}
                              className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md hover:bg-opacity-95 disabled:opacity-50 cursor-pointer"
                            >
                              Save Status
                            </button>
                          </div>
                          {['Shipped', 'Delivered', 'Paid'].includes(newOrderStatus || selectedOrderDetail.status) && (
                            <div className="w-full space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tracking URL</label>
                              <input 
                                type="text" 
                                value={trackingUrl} 
                                onChange={(e) => setTrackingUrl(e.target.value)} 
                                placeholder="Paste shipment tracking URL..." 
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 focus:border-primary focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 italic">No details available.</div>
                  )}
                </Modal>

                {/* Manage Order Modal */}
                {isOrderModalOpen && activeOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                      <button onClick={() => setIsOrderModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary"><X size={20} /></button>
                      
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Detail</span>
                          <h3 className="text-2xl font-serif font-bold text-gray-900">{activeOrder.orderNumber}</h3>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-secondary/40 p-5 rounded-2xl border border-gray-100 text-xs space-y-2">
                          <p className="text-gray-700 font-bold uppercase tracking-wider">Customer Details</p>
                          <p className="text-gray-600 font-semibold"><span className="text-gray-400 font-normal">Name:</span> {activeOrder.shippingAddress?.fullName}</p>
                          <p className="text-gray-600 font-semibold"><span className="text-gray-400 font-normal">Phone:</span> {activeOrder.shippingAddress?.phone}</p>
                          <p className="text-gray-600 font-semibold"><span className="text-gray-400 font-normal">Address:</span> {activeOrder.shippingAddress?.addressLine1}, {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state} - {activeOrder.shippingAddress?.postalCode}</p>
                        </div>

                        {/* Products List */}
                        <div className="space-y-2">
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Items Ordered</p>
                          <div className="space-y-3">
                            {activeOrder.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-xs">
                                <p className="font-bold text-gray-800">{item.productName} <span className="text-gray-400 font-normal">x {item.quantity}</span></p>
                                <span className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Timeline step status bar */}
                        <div className="border-t border-gray-50 pt-4 space-y-4">
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Flipkart status Timeline</p>
                          <div className="grid grid-cols-5 text-center text-[8px] font-bold uppercase tracking-widest gap-1">
                            {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                              const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
                              const currentIdx = statuses.indexOf(activeOrder.status);
                              const isCompleted = currentIdx >= i;
                              return (
                                <div key={step} className="space-y-2">
                                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] ${
                                    isCompleted ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    ✓
                                  </div>
                                  <span className={isCompleted ? 'text-green-600 font-bold' : 'text-gray-400'}>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Update Status Dropdown */}
                        <div className="space-y-3 border-t border-gray-55 pt-4">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fulfill Status</label>
                          <div className="space-y-3">
                            <div className="flex gap-4">
                              <select 
                                value={newOrderStatus} 
                                onChange={(e) => setNewOrderStatus(e.target.value)}
                                className="flex-grow px-5 py-3 rounded-xl bg-gray-50 border-none text-sm font-bold text-gray-800"
                              >
                                {['Pending', 'Confirmed', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                              <button 
                                onClick={handleUpdateOrderStatus}
                                disabled={isSubmitting}
                                className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
                              >
                                Update Status
                              </button>
                            </div>
                            {['Shipped', 'Delivered', 'Paid'].includes(newOrderStatus) && (
                              <div className="w-full space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tracking URL</label>
                                <input 
                                  type="text" 
                                  value={trackingUrl} 
                                  onChange={(e) => setTrackingUrl(e.target.value)} 
                                  placeholder="Paste shipment tracking URL..." 
                                  className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            } />

            {/* --- Manage Customers Section --- */}
            <Route path="customers" element={
              <div className="p-6 sm:p-10 space-y-10">
                <BackButton adminMode label="Dashboard" />
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Customer Base Controls</h2>
                  <p className="text-gray-400 text-sm">Managing register users and block controls.</p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                  <div className="min-w-[800px]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                          <th className="px-8 py-5">Customer Name</th>
                          <th className="px-8 py-5">Email</th>
                          <th className="px-8 py-5">Joined Date</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {customers.map((c, i) => (
                          <tr key={c.id || i} className="hover:bg-gray-50/50 transition-colors text-sm">
                            <td className="px-8 py-5">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                  {c.firstName ? c.firstName[0] : 'U'}
                                </div>
                                <span className="font-bold text-gray-900">{c.firstName} {c.lastName}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-gray-500 font-semibold">{c.email}</td>
                            <td className="px-8 py-5 text-gray-400 text-xs">{formatDate(c.createdAt || new Date().toISOString())}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                c.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {c.isActive ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button 
                                onClick={() => handleToggleCustomerStatus(c)}
                                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                                  c.isActive ? 'border-red-100 text-red-500 hover:bg-red-50' : 'border-green-100 text-green-500 hover:bg-green-50'
                                }`}
                              >
                                {c.isActive ? 'Block' : 'Unblock'}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {customers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-8 py-10 text-center text-gray-400">No customers found in database.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>

      {/* --- Custom Warning Delete Dialog (FEATURE 4) --- */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative border border-gray-100 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-gray-900">Are you sure?</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  You are about to delete <span className="font-bold text-gray-700">"{deleteName}"</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={executeDeleteAction}
                  className="flex-grow bg-red-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-grow border border-gray-100 py-3.5 rounded-xl font-bold text-xs text-gray-400 uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Product View Modal (FEATURE 1) --- */}
      <AnimatePresence>
        {isProductViewModalOpen && selectedProductForView && (() => {
          const mapped = mapApiProductToFrontend(selectedProductForView);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 sm:p-10 shadow-2xl relative overflow-y-auto max-h-[90vh] border border-gray-100 space-y-8"
              >
                <button 
                  onClick={() => {
                    setIsProductViewModalOpen(false);
                    setIsAdminProductDescExpanded(false);
                  }} 
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <img 
                    src={mapped.image} 
                    alt={mapped.name} 
                    className="w-full aspect-square rounded-3xl object-cover bg-secondary border border-gray-50 shadow-md"
                  />
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">{mapped.category}</span>
                      <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">{mapped.name}</h3>
                      <p className="text-[10px] text-gray-400 font-mono">SKU ID: {mapped.id}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Catalog Pricing</p>
                      <div className="flex items-baseline space-x-3">
                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(mapped.price)}</span>
                        {mapped.originalPrice && (
                          <span className="text-sm font-semibold text-gray-400 line-through">{formatCurrency(mapped.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory Stock</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          selectedProductForView.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {selectedProductForView.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{selectedProductForView.stock} units remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 border-t border-gray-50 pt-6">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Description Details</p>
                  <div className="product-description bg-secondary/35 p-6 rounded-2xl border border-gray-50">
                    <p className="desc-text text-sm text-gray-600 leading-relaxed">
                      {selectedProductForView.description
                        ? (selectedProductForView.description.length > 180 && !isAdminProductDescExpanded
                          ? selectedProductForView.description.substring(0, 180) + '...'
                          : selectedProductForView.description)
                        : 'No description provided.'
                      }
                    </p>
                    {selectedProductForView.description && selectedProductForView.description.length > 180 && (
                      <button
                        type="button"
                        onClick={() => setIsAdminProductDescExpanded(!isAdminProductDescExpanded)}
                        className="desc-toggle-btn text-primary font-bold text-xs mt-2 focus:outline-none"
                      >
                        {isAdminProductDescExpanded ? 'Show Less ▲' : 'Read More ▼'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* --- Add/Edit Product Modal Form (FEATURE 2 & 3) --- */}
      <Modal
        isOpen={isProductFormModalOpen}
        onClose={() => setIsProductFormModalOpen(false)}
        title={editingProductId ? 'Edit Product' : 'Add New Product'}
      >
        <div className="text-center mb-6">
          <p className="text-gray-400 text-xs mt-1">
            {editingProductId ? 'Update catalog details in real-time' : 'Fill in to list a new catalog item'}
          </p>
        </div>
        
        <form onSubmit={handleSaveProductSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
              <Package size={12} className="text-primary" />
              <span>Product Name</span>
            </label>
            <input 
              type="text" 
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Magic Color Changing Mug" 
              className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
                <FolderOpen size={12} className="text-primary" />
                <span>Category</span>
              </label>
              <select 
                required
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold text-gray-700"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
                <Package size={12} className="text-primary" />
                <span>Stock Quantity</span>
              </label>
              <input 
                type="number" 
                required
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                placeholder="100" 
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
                <DollarSign size={12} className="text-primary" />
                <span>REAL PRICE (₹)</span>
              </label>
              <input 
                type="number" 
                required
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="399" 
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
                <DollarSign size={12} className="text-primary" />
                <span>FAKE PRICE (₹)</span>
              </label>
              <input 
                type="number" 
                value={productDiscountPrice}
                onChange={(e) => setProductDiscountPrice(e.target.value)}
                placeholder="299" 
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" 
              />
            </div>
          </div>

          <div className="space-y-2 border border-gray-150 p-5 rounded-2xl bg-gray-50/30">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
                <FolderOpen size={12} className="text-primary" />
                <span>Product Images ({productImagesList.length}/2)</span>
              </label>
              <span className="text-[9px] font-bold text-gray-400 uppercase">MIN 2 REQUIRED</span>
            </div>
            
            <div 
              className="flex flex-row overflow-x-auto gap-[10px] py-1"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {productImagesList.map((img, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 relative"
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '2px solid #e2e8f0'
                  }}
                >
                  {img.isUploading ? (
                    <div className="w-full h-full bg-gray-100 relative">
                      <img src={img.url} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] text-white font-bold bg-black/40">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                        Uploading
                      </div>
                    </div>
                  ) : (
                    <>
                      <img 
                        src={img.url} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => setProductImagesList(prev => prev.filter((_, idx) => idx !== index))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[11px] font-bold border-none cursor-pointer flex items-center justify-center hover:bg-black/80 transition-all active:scale-90"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                          Main
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {productImagesList.length < 2 && (
                <label 
                  className="flex-shrink-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors border-2 border-dashed border-[#94a3b8] bg-[#f8fafc]"
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '10px'
                  }}
                >
                  <span className="text-xl text-[#94a3b8] leading-none font-bold">+</span>
                  <span className="text-[9px] text-[#94a3b8] font-bold uppercase mt-1">Add Photo</span>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const list = Array.from(files);
                      setImageUploadError(null);

                                                                       
                                                                       
                                                 
                      
                      if (productImagesList.length + list.length > 2) {
                        const errMsg = "Maximum 2 images allowed.";
                        setImageUploadError(errMsg);
                        triggerToast(errMsg, true);
                        return;
                      }

                      for (const file of list) {
                                                                 
                                                            
                                                            

                        if (file.size > 5 * 1024 * 1024) {
                          const errMsg = `"${file.name}" is too large. Max 5MB per image.`;
                          setImageUploadError(errMsg);
                          triggerToast(errMsg, true);
                          continue;
                        }
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
                          const errMsg = `"${file.name}" has invalid format. JPG, JPEG, PNG, WEBP only.`;
                          setImageUploadError(errMsg);
                          triggerToast(errMsg, true);
                          continue;
                        }

                        const localPreview = URL.createObjectURL(file);
                        setProductImagesList(prev => [...prev, { url: localPreview, isUploading: true }]);

                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                                                                                 
                          const res = await fetch('/api/products/upload-image', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${user?.token}` },
                            body: formData
                          });
                                                                            
                                                                    
                          if (res.ok) {
                            const json = await res.json();
                                                                     
                            if ((json.success || json.succeeded) && json.data?.url) {
                              setProductImagesList(prev => prev.map(item => item.url === localPreview ? { url: json.data.url } : item));
                              setImageUploadError(null);
                            } else {
                              setProductImagesList(prev => prev.filter(item => item.url !== localPreview));
                              const errMsg = "Failed to upload image.";
                              setImageUploadError(errMsg);
                              triggerToast(errMsg, true);
                            }
                          } else {
                            setProductImagesList(prev => prev.filter(item => item.url !== localPreview));
                            const errMsg = "Failed to upload image.";
                            setImageUploadError(errMsg);
                            triggerToast(errMsg, true);
                          }
                        } catch (err: any) {
                                                                    
                                                                       
                          setProductImagesList(prev => prev.filter(item => item.url !== localPreview));
                          const errMsg = "Connection error while uploading image.";
                          setImageUploadError(errMsg);
                          triggerToast(errMsg, true);
                        }
                      }
                    }}
                  />
                </label>
              )}
            </div>
            
            {productImagesList.length === 2 && (
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider text-center mt-1">Maximum 2 images reached</p>
            )}
            
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {productImagesList.length}/2 IMAGES UPLOADED
            </p>

            {imageUploadError && (
              <div style={{
                color: '#dc2626',
                fontSize: '13px',
                marginTop: '6px',
                padding: '8px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }} className="font-sans">
                ⚠ {imageUploadError}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
              <span className="text-primary font-serif italic text-base">i</span>
              <span>Description</span>
            </label>
            <textarea 
              rows={3} 
              required
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Tell customers about the product..." 
              className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-xs font-medium resize-none"
            />
          </div>

          {/* --- Variants Builder --- */}
          <div className="space-y-4 border border-gray-150 p-5 rounded-2xl bg-gray-50/30">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
                  <PackagePlus size={12} className="text-primary" />
                  <span>Product Variants (Optional) ({productVariants.length}/5)</span>
                </label>
                {productVariants.length >= 5 && (
                  <span className="text-[9px] font-bold text-amber-500 uppercase">Limit Reached</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Add size, color or other options if applicable</p>
            </div>

            {/* Added Variants List */}
            {productVariants.length > 0 && (
              <div className="space-y-2">
                {productVariants.map((v, i) => (
                  <div key={i} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-gray-700">{v.type}:</span>{' '}
                      <span className="text-gray-550">{v.values.join(', ')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductVariants(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700 font-bold transition-all text-[10px] uppercase cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Variant Controls */}
            {productVariants.length < 5 && (
              <div className="space-y-3 p-4 bg-white border border-gray-100 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Variant Type</label>
                    <select
                      value={newVarType}
                      onChange={(e) => {
                        setNewVarType(e.target.value);
                        setTempVarValues([]);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 text-xs font-bold text-gray-700 border-none outline-none"
                    >
                      <option value="Size">Size</option>
                      <option value="Color">Color</option>
                      <option value="Material">Material</option>
                      <option value="Weight">Weight</option>
                      <option value="Pack Size">Pack Size</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {newVarType === 'Custom' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Custom Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Frame Size"
                        value={newCustomVarType}
                        onChange={(e) => setNewCustomVarType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 text-xs font-medium border-none outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Pill builder */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Values (Press Enter to add)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a value and press Enter"
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newVarValue.trim();
                          if (val && !tempVarValues.includes(val)) {
                            setTempVarValues(prev => [...prev, val]);
                            setNewVarValue('');
                          }
                        }
                      }}
                      className="flex-grow px-3 py-2 rounded-lg bg-gray-50 text-xs font-medium border-none outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newVarValue.trim();
                        if (val && !tempVarValues.includes(val)) {
                          setTempVarValues(prev => [...prev, val]);
                          setNewVarValue('');
                        }
                      }}
                      className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Temp Value Chips */}
                  {tempVarValues.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {tempVarValues.map((v, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-250 text-gray-700 rounded-full text-[10px] font-semibold border border-gray-200 transition-all">
                          {v}
                          <button
                            type="button"
                            onClick={() => setTempVarValues(prev => prev.filter(x => x !== v))}
                            className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const finalType = newVarType === 'Custom' ? newCustomVarType.trim() : newVarType;
                    if (!finalType) {
                      triggerToast('Please provide a Variant Type name.', true);
                      return;
                    }
                    if (productVariants.some(v => v.type.toLowerCase() === finalType.toLowerCase())) {
                      triggerToast(`Variant type "${finalType}" already exists.`, true);
                      return;
                    }
                    if (tempVarValues.length === 0) {
                      triggerToast('Please add at least one value for the variant.', true);
                      return;
                    }

                    setProductVariants(prev => [...prev, { type: finalType, values: tempVarValues }]);
                    setNewCustomVarType('');
                    setTempVarValues([]);
                    setNewVarValue('');
                  }}
                  className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Add Variant to Product
                </button>
              </div>
            )}
          </div>

          {/* --- Customizations Box --- */}
          <div className="space-y-4 border border-gray-150 p-5 rounded-2xl bg-gray-50/30">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 ml-1">
                <Sparkles size={12} className="text-primary" />
                <span>Product Customizations</span>
              </label>
            </div>

            {/* Toggle Box */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsCustomizationAvailable(false);
                  setCustomizationTypes([]);
                  setCustomizationInstructions('');
                }}
                className={`flex-1 py-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  !isCustomizationAvailable
                    ? 'bg-gray-250 border-gray-300 text-gray-700 shadow-3xs'
                    : 'bg-white border-gray-150 text-gray-400 hover:bg-gray-50'
                }`}
              >
                No Customization
              </button>
              <button
                type="button"
                onClick={() => setIsCustomizationAvailable(true)}
                className={`flex-1 py-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  isCustomizationAvailable
                    ? 'bg-green-50 border-green-300 text-green-700 shadow-3xs font-bold'
                    : 'bg-white border-gray-150 text-gray-400 hover:bg-gray-50'
                }`}
              >
                Yes, Customizable
              </button>
            </div>

            {/* Conditional Sub-settings */}
            {isCustomizationAvailable && (
              <div className="space-y-3 p-4 bg-white border border-gray-100 rounded-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Customization Types (Select at least one)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomizationTypes(prev =>
                          prev.includes('image')
                            ? prev.filter(x => x !== 'image')
                            : [...prev, 'image']
                        );
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                        customizationTypes.includes('image')
                          ? 'bg-blue-50 border-blue-300 text-blue-600 font-bold'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      🖼 Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomizationTypes(prev =>
                          prev.includes('text')
                            ? prev.filter(x => x !== 'text')
                            : [...prev, 'text']
                        );
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                        customizationTypes.includes('text')
                          ? 'bg-blue-50 border-blue-300 text-blue-600 font-bold'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      📝 Add Text
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Instructions for Customer</label>
                  <textarea
                    rows={2}
                    value={customizationInstructions}
                    onChange={(e) => setCustomizationInstructions(e.target.value)}
                    placeholder="e.g. Upload a photo or enter the name you want printed on the product."
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 text-xs font-medium resize-none border border-transparent focus:border-primary/20 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {productFormError && (
            <div className="modal-inline-error">
              <span>⚠️ {productFormError}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-xl hover:bg-opacity-90 transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
          >
            {isSubmitting ? 'Processing...' : (editingProductId ? 'Update Product' : 'Add Product')}
          </button>
        </form>
      </Modal>
    </div>
  );
}

// --- Inner Form component for Add Product CRUD ---
const AddProductForm = ({ triggerToast }: { triggerToast: (msg: string, isError: boolean) => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('100');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productImagesList, setProductImagesList] = useState<{ url: string; isUploading?: boolean }[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const [variants, setVariants] = useState<{type: string, values: string[]}[]>([]);
  const [isCustomizationAvailable, setIsCustomizationAvailable] = useState(false);
  const [customizationTypes, setCustomizationTypes] = useState<string[]>([]); // 'image', 'text'
  const [customizationInstructions, setCustomizationInstructions] = useState('');

  // Temp states for variants builder
  const [newVarType, setNewVarType] = useState('Size');
  const [newCustomVarType, setNewCustomVarType] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [tempVarValues, setTempVarValues] = useState<string[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const json = await res.json();
          if ((json.success || json.succeeded) && json.data) {
            setCategories(json.data);
          }
        }
      } catch (err) {
                          
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.length < 5) {
      triggerToast('Product Name must be at least 5 characters.', true);
      return;
    }
    if (!price || Number(price) <= 0) {
      triggerToast('Price must be greater than 0.', true);
      return;
    }
    if (discountPrice && Number(discountPrice) >= Number(price)) {
      triggerToast('Discount Price must be less than original Price.', true);
      return;
    }
    if (discountPrice && Number(discountPrice) < 0) {
      triggerToast('Discount Price cannot be negative.', true);
      return;
    }
    if (!stock || Number(stock) < 0 || stock.includes('.')) {
      triggerToast('Stock must be a non-negative whole integer.', true);
      return;
    }
    if (!selectedCatId) {
      triggerToast('Category is required. Select from dropdown.', true);
      return;
    }
    if (productImagesList.length < 2) {
      triggerToast('Please upload at least 2 product images', true);
      return;
    }
    if (productImagesList.length > 2) {
      triggerToast('Maximum 2 product images allowed', true);
      return;
    }
    if (productImagesList.some(img => img.isUploading)) {
      triggerToast('Please wait for all images to finish uploading', true);
      return;
    }

    if (isCustomizationAvailable && customizationTypes.length === 0) {
      triggerToast('Please select at least one customization type (Upload Image, Add Text, or Both) when customization is enabled.', true);
      return;
    }

    const imageUrls = productImagesList.map(img => img.url);
    const finalDescription = buildProductDescription(
      description,
      variants,
      isCustomizationAvailable,
      customizationTypes,
      customizationInstructions,
      imageUrls
    );

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Price', price);
    if (discountPrice) formData.append('DiscountPrice', discountPrice);
    formData.append('Description', finalDescription);
    formData.append('Stock', stock);
    formData.append('CategoryId', selectedCatId);
    formData.append('IsActive', 'true');
    formData.append('IsCustomizable', isCustomizationAvailable ? 'true' : 'false');
    formData.append('ImageUrl', imageUrls[0] || '');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && (result.success || result.succeeded)) {
        setIsSaved(true);
        triggerToast('Product listed successfully!', false);
        setTimeout(() => {
          setIsSaved(false);
          navigate('/admin/products');
        }, 2000);
      } else {
        const errorMsg = result.errors && result.errors.length > 0 
          ? result.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
          : (result.message || 'Failed to list product.');
        triggerToast(errorMsg, true);
      }
    } catch (err) {
      triggerToast('Failed to save product.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-4xl mx-auto">
      <BackButton adminMode label="Dashboard" />
      <div className="space-y-1 text-center">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Add New Product</h2>
        <p className="text-gray-400 text-sm">Fill in the details to list a new database catalog item.</p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 sm:space-y-10 relative overflow-hidden">
        <AnimatePresence>
          {isSaved && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Product Saved!</h3>
              <p className="text-gray-500 mb-8">Item added to your database catalog successfully.</p>
              <p className="text-xs text-gray-400">Redirecting to product list...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
              <Package size={12} className="text-primary" />
              <span>Product Name</span>
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Magic Color Changing Mug" 
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
              <FolderOpen size={12} className="text-primary" />
              <span>Category Dropdown</span>
            </label>
            <select 
              required
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm text-gray-700"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
              <DollarSign size={12} className="text-primary" />
              <span>REAL PRICE (₹)</span>
            </label>
            <input 
              type="number" 
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="399" 
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
              <DollarSign size={12} className="text-primary" />
              <span>FAKE PRICE (₹)</span>
            </label>
            <input 
              type="number" 
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              placeholder="299" 
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
              <Package size={12} className="text-primary" />
              <span>Stock Quantity</span>
            </label>
            <input 
              type="number" 
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="100" 
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" 
            />
          </div>

          <div className="space-y-2 border border-gray-150 p-5 rounded-2xl bg-gray-50/30">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
                <FolderOpen size={12} className="text-primary" />
                <span>Product Images ({productImagesList.length}/2)</span>
              </label>
              <span className="text-[9px] font-bold text-gray-400 uppercase">MIN 2 REQUIRED</span>
            </div>
            
            <div 
              className="flex flex-row overflow-x-auto gap-[10px] py-1"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {productImagesList.map((img, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 relative"
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '2px solid #e2e8f0'
                  }}
                >
                  {img.isUploading ? (
                    <div className="w-full h-full bg-gray-100 relative">
                      <img src={img.url} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] text-white font-bold bg-black/40">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                        Uploading
                      </div>
                    </div>
                  ) : (
                    <>
                      <img 
                        src={img.url} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => setProductImagesList(prev => prev.filter((_, idx) => idx !== index))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[11px] font-bold border-none cursor-pointer flex items-center justify-center hover:bg-black/80 transition-all active:scale-90"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                          Main
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {productImagesList.length < 2 && (
                <label 
                  className="flex-shrink-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors border-2 border-dashed border-[#94a3b8] bg-[#f8fafc]"
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '10px'
                  }}
                >
                  <span className="text-xl text-[#94a3b8] leading-none font-bold">+</span>
                  <span className="text-[9px] text-[#94a3b8] font-bold uppercase mt-1">Add Photo</span>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const list = Array.from(files);
                      setImageUploadError(null);

                                                                          
                                                                       
                                                 
                      
                      if (productImagesList.length + list.length > 2) {
                        const errMsg = "Maximum 2 images allowed.";
                        setImageUploadError(errMsg);
                        triggerToast(errMsg, true);
                        return;
                      }

                      for (const file of list) {
                                                                 
                                                            
                                                            

                        if (file.size > 5 * 1024 * 1024) {
                          const errMsg = `"${file.name}" is too large. Max 5MB per image.`;
                          setImageUploadError(errMsg);
                          triggerToast(errMsg, true);
                          continue;
                        }
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
                          const errMsg = `"${file.name}" has invalid format. JPG, JPEG, PNG, WEBP only.`;
                          setImageUploadError(errMsg);
                          triggerToast(errMsg, true);
                          continue;
                        }

                        const localPreview = URL.createObjectURL(file);
                        setProductImagesList(prev => [...prev, { url: localPreview, isUploading: true }]);

                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                                                                                 
                          const res = await fetch('/api/products/upload-image', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${user?.token}` },
                            body: formData
                          });
                                                                            
                                                                    
                          if (res.ok) {
                            const json = await res.json();
                                                                     
                            if ((json.success || json.succeeded) && json.data?.url) {
                              setProductImagesList(prev => prev.map(item => item.url === localPreview ? { url: json.data.url } : item));
                              setImageUploadError(null);
                            } else {
                              setProductImagesList(prev => prev.filter(item => item.url !== localPreview));
                              const errMsg = "Failed to upload image.";
                              setImageUploadError(errMsg);
                              triggerToast(errMsg, true);
                            }
                          } else {
                            setProductImagesList(prev => prev.filter(item => item.url !== localPreview));
                            const errMsg = "Failed to upload image.";
                            setImageUploadError(errMsg);
                            triggerToast(errMsg, true);
                          }
                        } catch (err: any) {
                                                                    
                                                                       
                          setProductImagesList(prev => prev.filter(item => item.url !== localPreview));
                          const errMsg = "Connection error while uploading image.";
                          setImageUploadError(errMsg);
                          triggerToast(errMsg, true);
                        }
                      }
                    }}
                  />
                </label>
              )}
            </div>
            
            {productImagesList.length === 2 && (
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider text-center mt-1">Maximum 2 images reached</p>
            )}
            
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {productImagesList.length}/2 IMAGES UPLOADED
            </p>

            {imageUploadError && (
              <div style={{
                color: '#dc2626',
                fontSize: '13px',
                marginTop: '6px',
                padding: '8px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }} className="font-sans">
                ⚠ {imageUploadError}
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
              <span className="text-primary font-serif italic text-base">i</span>
              <span>Description Details</span>
            </label>
            <textarea 
              rows={4} 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about the customization options..." 
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none"
            />
          </div>

          <div className="space-y-4 border border-gray-150 p-6 rounded-2xl bg-gray-50/30 md:col-span-2">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
                  <PackagePlus size={12} className="text-primary" />
                  <span>Product Variants (Optional) ({variants.length}/5)</span>
                </label>
                {variants.length >= 5 && (
                  <span className="text-[9px] font-bold text-amber-500 uppercase">Limit Reached</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Add size, color or other options if applicable</p>
            </div>

            {/* Added Variants List */}
            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-sm">
                    <div>
                      <span className="font-bold text-gray-700">{v.type}:</span>{' '}
                      <span className="text-gray-550">{v.values.join(', ')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-750 font-bold transition-all text-[10px] uppercase cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Variant Controls */}
            {variants.length < 5 && (
              <div className="space-y-3 p-4 bg-white border border-gray-100 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Variant Type</label>
                    <select
                      value={newVarType}
                      onChange={(e) => {
                        setNewVarType(e.target.value);
                        setTempVarValues([]);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-xs font-bold text-gray-700 border-none outline-none"
                    >
                      <option value="Size">Size</option>
                      <option value="Color">Color</option>
                      <option value="Material">Material</option>
                      <option value="Weight">Weight</option>
                      <option value="Pack Size">Pack Size</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {newVarType === 'Custom' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Custom Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Frame Size"
                        value={newCustomVarType}
                        onChange={(e) => setNewCustomVarType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-xs font-medium border-none outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Pill builder */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Values (Press Enter to add)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a value and press Enter"
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newVarValue.trim();
                          if (val && !tempVarValues.includes(val)) {
                            setTempVarValues(prev => [...prev, val]);
                            setNewVarValue('');
                          }
                        }
                      }}
                      className="flex-grow px-4 py-2.5 rounded-lg bg-gray-50 text-xs font-medium border-none outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newVarValue.trim();
                        if (val && !tempVarValues.includes(val)) {
                          setTempVarValues(prev => [...prev, val]);
                          setNewVarValue('');
                        }
                      }}
                      className="bg-primary/10 text-primary px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Temp Value Chips */}
                  {tempVarValues.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {tempVarValues.map((v, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-250 text-gray-700 rounded-full text-[10px] font-semibold border border-gray-200 transition-all">
                          {v}
                          <button
                            type="button"
                            onClick={() => setTempVarValues(prev => prev.filter(x => x !== v))}
                            className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const finalType = newVarType === 'Custom' ? newCustomVarType.trim() : newVarType;
                    if (!finalType) {
                      triggerToast('Please provide a Variant Type name.', true);
                      return;
                    }
                    if (variants.some(v => v.type.toLowerCase() === finalType.toLowerCase())) {
                      triggerToast(`Variant type "${finalType}" already exists.`, true);
                      return;
                    }
                    if (tempVarValues.length === 0) {
                      triggerToast('Please add at least one value for the variant.', true);
                      return;
                    }

                    setVariants(prev => [...prev, { type: finalType, values: tempVarValues }]);
                    setNewCustomVarType('');
                    setTempVarValues([]);
                    setNewVarValue('');
                  }}
                  className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Add Variant to Product
                </button>
              </div>
            )}
          </div>

          {/* --- Customizations Box --- */}
          <div className="space-y-4 border border-gray-150 p-6 rounded-2xl bg-gray-50/30 md:col-span-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2 ml-1">
                <Sparkles size={12} className="text-primary" />
                <span>Product Customizations</span>
              </label>
            </div>

            {/* Toggle Box */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsCustomizationAvailable(false);
                  setCustomizationTypes([]);
                  setCustomizationInstructions('');
                }}
                className={`flex-1 py-3.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  !isCustomizationAvailable
                    ? 'bg-gray-250 border-gray-300 text-gray-700 shadow-3xs'
                    : 'bg-white border-gray-150 text-gray-400 hover:bg-gray-50'
                }`}
              >
                No Customization
              </button>
              <button
                type="button"
                onClick={() => setIsCustomizationAvailable(true)}
                className={`flex-1 py-3.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  isCustomizationAvailable
                    ? 'bg-green-50 border-green-300 text-green-700 shadow-3xs font-bold'
                    : 'bg-white border-gray-150 text-gray-400 hover:bg-gray-50'
                }`}
              >
                Yes, Customizable
              </button>
            </div>

            {/* Conditional Sub-settings */}
            {isCustomizationAvailable && (
              <div className="space-y-3 p-4 bg-white border border-gray-100 rounded-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Customization Types (Select at least one)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomizationTypes(prev =>
                          prev.includes('image')
                            ? prev.filter(x => x !== 'image')
                            : [...prev, 'image']
                        );
                      }}
                      className={`flex-1 py-3 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                        customizationTypes.includes('image')
                          ? 'bg-blue-50 border-blue-300 text-blue-600 font-bold'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      🖼 Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomizationTypes(prev =>
                          prev.includes('text')
                            ? prev.filter(x => x !== 'text')
                            : [...prev, 'text']
                        );
                      }}
                      className={`flex-1 py-3 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                        customizationTypes.includes('text')
                          ? 'bg-blue-50 border-blue-300 text-blue-600 font-bold'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      📝 Add Text
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Instructions for Customer</label>
                  <textarea
                    rows={2}
                    value={customizationInstructions}
                    onChange={(e) => setCustomizationInstructions(e.target.value)}
                    placeholder="e.g. Upload a photo or enter the name you want printed on the product."
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-xs font-medium resize-none border border-transparent focus:border-primary/20 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:col-span-2 mt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white py-4 rounded-xl font-bold shadow-xl hover:bg-opacity-90 transition-all active:scale-95 sm:flex-grow cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Fulfilling Listing...' : 'Save Catalog Product'}
            </button>
            <button type="button" onClick={() => navigate('/admin/products')} className="py-4 border border-gray-100 font-bold rounded-xl text-gray-400 hover:bg-gray-50 transition-all sm:px-10 cursor-pointer">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
