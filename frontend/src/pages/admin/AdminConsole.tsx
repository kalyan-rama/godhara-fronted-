import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, Order, CustomerHistory, DashboardStats } from '../../types';
import Logo from '../../components/layout/Logo';
import API_URL from '../../api';
import { 
  Building, 
  ShoppingBag, 
  Truck, 
  Users, 
  Settings, 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle,
  FileText,
  AlertTriangle,
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  Search, 
  X,
  Download,
  Printer,
  Tag,
  Mail,
  Check,
  RefreshCw,
  Gift,
  Trophy,
  Package,
  Calendar,
  DollarSign,
  Upload
} from 'lucide-react';

interface AdminConsoleProps {
  setView: (v: string) => void;
  products: Product[];
  refreshProducts: () => void;
}

export default function AdminConsole({ setView, products, refreshProducts }: AdminConsoleProps) {
  const { apiFetch, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'offers' | 'orders' | 'labels' | 'customers' | 'settings'>('stats');
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerHistory[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  // Products Management States
  const [searchProduct, setSearchProduct] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterActiveStatus, setFilterActiveStatus] = useState('ALL');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategory, setProdCategory] = useState('Dairy Products');
  const [prodWeight, setProdWeight] = useState('250');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImagePublicIds, setProdImagePublicIds] = useState<string[]>([]);
  const [prodTags, setProdTags] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>(['Dairy Products', 'Personal Care', 'Spiritual', 'Ayurvedic Remedies']);

  // Local storage manual image uploads & library catalog
  const [localSavedImages, setLocalSavedImages] = useState<{ id: string; name: string; dataUrl: string; timestamp: string }[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Inline Quick Stock Edit state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [quickStockValue, setQuickStockValue] = useState('');

  // Orders Management Filters
  const [searchOrder, setSearchOrder] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('ALL');
  const [filterOrderDate, setFilterOrderDate] = useState('ALL'); // ALL, TODAY, WEEK, MONTH
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PAID');

  // Shipping Labels lists
  const [searchLabel, setSearchLabel] = useState('');
  const [filterLabelStatus, setFilterLabelStatus] = useState('ALL');
  const [printedLabels, setPrintedLabels] = useState<Record<string, boolean>>({});

  // Offer Coupon form drawer
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('PERCENTAGE'); // PERCENTAGE, FLAT
  const [couponValue, setCouponValue] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('');
  const [couponMaxUses, setCouponMaxUses] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponActive, setCouponActive] = useState(true);

  // Settings states
  const [storeName, setStoreName] = useState('Godhara');
  const [storePhone, setStorePhone] = useState('+91 8978038932');
  const [storeEmail, setStoreEmail] = useState('godhara.2026@gmail.com');
  const [storeAddress, setStoreAddress] = useState('Pocharam Apartment, Banswada, Telangana 503187');
  const [freeShippingLimit, setFreeShippingLimit] = useState(1000);
  const [flatShippingCost, setFlatShippingCost] = useState(50);
  const [announcementBanner, setAnnouncementBanner] = useState('Shop ₹1000 to Get Free Shipping');
  const [lowStockAlertLimit, setLowStockAlertLimit] = useState(10);

  // Delivery settings
  const [deliveryChargeTelangana, setDeliveryChargeTelangana] = useState(70);
  const [deliveryChargeAP, setDeliveryChargeAP] = useState(80);
  const [deliveryChargeOther, setDeliveryChargeOther] = useState(100);
  const [freeDeliveryPincodes, setFreeDeliveryPincodes] = useState('');
  const [storeServicePincodes, setStoreServicePincodes] = useState('');
  const [storeLocations, setStoreLocations] = useState('');

  // Custom label view mode toggle
  const [labelsViewMode, setLabelsViewMode] = useState<'grid' | 'table'>('grid');
  
  // Custom brand states
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [founderImageUrl, setFounderImageUrl] = useState('');
  const [founderName, setFounderName] = useState('Kalyan V., Founder of Godhara');
  const [founderQuote, setFounderQuote] = useState('');
  
  // Customer Edit Details Modal
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custStreet, setCustStreet] = useState('');
  const [custCity, setCustCity] = useState('');
  const [custState, setCustState] = useState('Telangana');
  const [custPincode, setCustPincode] = useState('');

  // CUSTOM USER MANAGEMENT STATES
  const [memberList, setMemberList] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('ALL');
  const [memberStatusFilter, setMemberStatusFilter] = useState('ALL');
  const [memberProviderFilter, setMemberProviderFilter] = useState('ALL');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  // Member drawer / logs states
  const [selectedMemberLogs, setSelectedMemberLogs] = useState<any[]>([]);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<any | null>(null);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  
  // Bulk email modal status
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailMessage, setBulkEmailMessage] = useState('');

  // Custom visual feedback notifications replacing window.alert
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadAllAdminData();
    try {
      const raw = localStorage.getItem('gdh_local_images');
      if (raw) {
        setLocalSavedImages(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load local storage uploads:', e);
    }
  }, [activeTab, products, memberSearch, memberRoleFilter, memberStatusFilter, memberProviderFilter]);

  // Helper to compress and read uploaded files manually
  const handleImageFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    
    let processedCount = 0;
    const newServerUrls: string[] = [];
    const newPublicIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        triggerNotification('File must be an image', 'error');
        continue;
      }

      try {
        const compressedBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800; // crisper images
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(event.target?.result as string);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              // Compressed webp/jpeg to keep storage footprint small but clean
              const finalBase64 = canvas.toDataURL('image/jpeg', 0.82);
              resolve(finalBase64);
            };
            img.onerror = (err) => reject(err);
            img.src = event.target?.result as string;
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        // Save this image permanently in our local uploads folder via backend API
        console.log('[Image Upload] Sending compressed image block to backend...', file.name);
        const uploadRes = await apiFetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: compressedBase64, filename: file.name })
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload API returned status ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        const serverUrl = uploadData.url || uploadData.imageUrl;
        const publicId = uploadData.publicId || null;
        console.log('[Image Upload] Stored to Cloudinary:', serverUrl, 'publicId:', publicId);

        newServerUrls.push(serverUrl);
        if (publicId) {
          newPublicIds.push(publicId);
        }

        // Save image metadata/URL locally in localStorage configuration catalog
        try {
          const raw = localStorage.getItem('gdh_local_images');
          let currentList: any[] = raw ? JSON.parse(raw) : [];
          // Skip if already exists in local storage list with same URL
          currentList = currentList.filter(item => item.dataUrl !== serverUrl);
          currentList.unshift({
            id: 'local_img_' + Date.now() + '_' + i,
            name: file.name,
            dataUrl: serverUrl, // holds /uploads/... instead of massive Base64
            timestamp: new Date().toISOString()
          });
          // Bound lists at 12 records limits to maintain browser local storage size
          if (currentList.length > 12) {
            currentList = currentList.slice(0, 12);
          }
          localStorage.setItem('gdh_local_images', JSON.stringify(currentList));
          setLocalSavedImages(currentList);
        } catch (storageErr) {
          console.warn('LocalStorage limit exceeded, skipping save block', storageErr);
        }

        processedCount++;
      } catch (err: any) {
        console.error('File compilation compression/upload error:', err);
        triggerNotification(`Error uploading "${file.name}": ${err.message || err}`, 'error');
      }
    }

    if (newServerUrls.length > 0) {
      setProdImages(prev => [...prev, ...newServerUrls]);
      if (newPublicIds.length > 0) {
        setProdImagePublicIds(prev => [...prev, ...newPublicIds]);
      }
      triggerNotification(`✓ Successfully uploaded ${processedCount} image(s) to Cloudinary!`);
    } else {
      triggerNotification('No images processed successfully', 'error');
    }
    setIsUploadingImage(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileUpload(e.dataTransfer.files);
    }
  };

  const deleteRecentLocalImage = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updated = localSavedImages.filter(img => img.id !== id);
      localStorage.setItem('gdh_local_images', JSON.stringify(updated));
      setLocalSavedImages(updated);
      triggerNotification('Removed image from upload history.');
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllLocalImages = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm('Clear all manually uploaded local storage images from history?');
    if (confirmed) {
      localStorage.removeItem('gdh_local_images');
      setLocalSavedImages([]);
      triggerNotification('Cleared your local storage image gallery.');
    }
  };

  const loadAllAdminData = async () => {
    try {
      // 1. Loader Stats
      const statsRes = await apiFetch('/api/admin/dashboard/stats');
      if (statsRes.ok) {
        setStatsData(await statsRes.json());
      }

      // 2. Load Orders
      const ordsRes = await apiFetch('/api/admin/orders');
      if (ordsRes.ok) {
        const oList = await ordsRes.json();
        oList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(oList);
      }

      // 3. Load Customers
      const custRes = await apiFetch('/api/admin/customers');
      if (custRes.ok) {
        setCustomers(await custRes.json());
      }

      // 3b. Load Authenticated User Members
      const usrRes = await apiFetch(`/api/admin/users?limit=150&search=${encodeURIComponent(memberSearch)}&role=${memberRoleFilter}&status=${memberStatusFilter}&authProvider=${memberProviderFilter}`);
      if (usrRes.ok) {
        const usrData = await usrRes.json();
        setMemberList(usrData.users || []);
      }

      // 4. Load Coupons
      const coupRes = await apiFetch('/api/admin/coupons');
      if (coupRes.ok) {
        setCoupons(await coupRes.json());
      }

      // 5. Load Public Settings
      const setRes = await fetch(`${API_URL}/api/settings`);
      if (setRes.ok) {
        const sets = await setRes.json();
        setStoreName(sets.storeName || 'Godhara');
        setStorePhone(sets.phone || '+91 8978038932');
        setStoreEmail(sets.contactEmail || 'godhara.2026@gmail.com');
        setStoreAddress(sets.address || 'Pocharam Apartment, Banswada, Telangana 503187');
        setFreeShippingLimit(sets.freeShippingThreshold !== undefined ? sets.freeShippingThreshold : 1000);
        setFlatShippingCost(sets.flatShippingCharge !== undefined ? sets.flatShippingCharge : 50);
        setAnnouncementBanner(sets.announcementText || 'Shop ₹1000 to Get Free Shipping');
        setLowStockAlertLimit(sets.lowStockThreshold || 10);
        
        // Delivery settings
        setDeliveryChargeTelangana(sets.deliveryChargeTelangana !== undefined ? sets.deliveryChargeTelangana : 70);
        setDeliveryChargeAP(sets.deliveryChargeAP !== undefined ? sets.deliveryChargeAP : 80);
        setDeliveryChargeOther(sets.deliveryChargeOther !== undefined ? sets.deliveryChargeOther : 100);
        setFreeDeliveryPincodes(Array.isArray(sets.freeDeliveryPincodes) ? sets.freeDeliveryPincodes.join(', ') : (sets.freeDeliveryPincodes || ''));
        setStoreServicePincodes(Array.isArray(sets.storeServicePincodes) ? sets.storeServicePincodes.join(', ') : (sets.storeServicePincodes || ''));
        setStoreLocations(Array.isArray(sets.storeLocations) ? sets.storeLocations.join('\n') : (sets.storeLocations || ''));

        // Brand identity fields
        setLogoUrl(sets.logoUrl || '/logo.png');
        setFounderImageUrl(sets.founderImageUrl || '');
        setFounderName(sets.founderName || 'Kalyan V., Founder of Godhara');
        setFounderQuote(sets.founderQuote || '');
      }

      // Load Category List from DB
      const catRes = await fetch(`${API_URL}/api/categories`);
      if (catRes.ok) {
        const catList = await catRes.json();
        if (catList && catList.length > 0) {
          setCategoriesList(catList);
        }
      }
    } catch (err) {
      console.error('Failed compiling administrative database records:', err);
    }
  };

  // Auto-slug generations when name edits
  const handleNameChangeForSlug = (val: string) => {
    setProdName(val);
    if (!editingProduct) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setProdSlug(generated);
    }
  };

  // --- ACTIONS: PRODUCTS CRUD ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSlug('');
    setProdDesc('');
    setProdPrice('');
    setProdDiscount('');
    setProdStock('');
    setProdCategory('Dairy Products');
    setProdWeight('250');
    setProdImages([]);
    setProdImagePublicIds([]);
    setProdTags('natural, pure, ayurvedic, desi gau');
    setProdFeatured(false);
    setProdActive(true);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdSlug(p.slug);
    setProdDesc(p.description);
    setProdPrice(p.price.toString());
    setProdDiscount(p.discountPrice?.toString() || '');
    setProdStock(p.stock.toString());
    setProdCategory(p.category);
    setProdWeight(p.weight.toString());
    setProdImages(p.images || []);
    setProdImagePublicIds((p as any).imagePublicIds || []);
    setProdTags('ayurvedic, organic, traditional');
    setProdFeatured(p.isFeatured);
    setProdActive(p.isActive !== false);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock || !prodCategory) {
      triggerNotification('Please provide mandatory fields (*)', 'error');
      return;
    }

    if (prodImages.length === 0) {
      triggerNotification('Please upload or select at least one local image.', 'error');
      return;
    }

    const payload = {
      name: prodName,
      slug: prodSlug || prodName.toLowerCase().replace(/\s+/g, '-'),
      description: prodDesc,
      price: parseFloat(prodPrice),
      discountPrice: prodDiscount ? parseFloat(prodDiscount) : null,
      stock: parseInt(prodStock),
      category: prodCategory,
      weight: parseInt(prodWeight),
      images: prodImages,
      imagePublicIds: prodImagePublicIds,
      isFeatured: prodFeatured,
      isActive: prodActive
    };

    try {
      let res;
      if (editingProduct) {
        res = await apiFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setShowProductModal(false);
        setProdImagePublicIds([]);
        refreshProducts();
        triggerNotification(editingProduct ? '✓ Product updated inside traditional logs!' : '✓ Sacred product entry logged successfully!');
      } else {
        const errorData = await res.json();
        triggerNotification(errorData.message || 'Workflow exception writing product info', 'error');
      }
    } catch (err) {
      triggerNotification('Failed communicating with server catalog databases', 'error');
    }
  };

  const handleToggleProductFeature = async (product: Product) => {
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured })
      });
      if (res.ok) {
        refreshProducts();
        triggerNotification(`✓ Featured state changed for ${product.name}!`);
      }
    } catch (e) {
      triggerNotification('Error switching featured state', 'error');
    }
  };

  const handleToggleProductActive = async (product: Product) => {
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive })
      });
      if (res.ok) {
        refreshProducts();
        triggerNotification(`✓ Product active state changed!`);
      }
    } catch (e) {
      triggerNotification('Error toggling product active', 'error');
    }
  };

  const handleInlineStockEdit = (p: Product) => {
    setEditingStockId(p.id);
    setQuickStockValue(p.stock.toString());
  };

  const handleSaveInlineStock = async (id: string) => {
    const parsedStock = parseInt(quickStockValue);
    if (isNaN(parsedStock)) {
      setEditingStockId(null);
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parsedStock })
      });
      if (res.ok) {
        refreshProducts();
        setEditingStockId(null);
        triggerNotification('✓ Stock inventory updated instantly!');
      }
    } catch (e) {
      triggerNotification('Failed updating inline stock count', 'error');
    }
  };

  const handleAddCategoryInline = () => {
    if (!newCategoryName.trim()) return;
    if (categoriesList.includes(newCategoryName.trim())) {
      setProdCategory(newCategoryName.trim());
      setShowCategoryInput(false);
      setNewCategoryName('');
      return;
    }
    const updatedCategories = [...categoriesList, newCategoryName.trim()];
    setCategoriesList(updatedCategories);
    setProdCategory(newCategoryName.trim());
    setShowCategoryInput(false);
    setNewCategoryName('');
    triggerNotification(`✓ Category "${newCategoryName.trim()}" added to local selection!`);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you absolutely sure you want to delete ${name}?`);
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        refreshProducts();
        triggerNotification('✓ Selected product archived/removed from active ledger.');
      }
    } catch (err) {
      triggerNotification('Archive/deletion failure.', 'error');
    }
  };

  // BULK OPERATIONS FOR PRODUCTS
  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, id]);
    } else {
      setSelectedProductIds(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmed = window.confirm(`Archive all ${selectedProductIds.length} selected items?`);
    if (!confirmed) return;

    let successCount = 0;
    for (const id of selectedProductIds) {
      try {
        const res = await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        if (res.ok) successCount++;
      } catch (e) {}
    }
    refreshProducts();
    setSelectedProductIds([]);
    triggerNotification(`✓ Sucessfully archived ${successCount} products!`);
  };

  const handleBulkActivate = async (active: boolean) => {
    if (selectedProductIds.length === 0) return;
    let successCount = 0;
    for (const id of selectedProductIds) {
      try {
        const res = await apiFetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: active })
        });
        if (res.ok) successCount++;
      } catch (e) {}
    }
    refreshProducts();
    setSelectedProductIds([]);
    triggerNotification(`✓ Updated active status of ${successCount} items!`);
  };

  const handleExportProductsCSV = () => {
    const headers = ['ID', 'Name', 'Slug', 'Category', 'Price', 'Discount Price', 'Stock', 'Weight (g)', 'Featured', 'Active'];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.slug,
      p.category,
      p.price,
      p.discountPrice || '',
      p.stock,
      p.weight,
      p.isFeatured ? 'YES' : 'NO',
      p.isActive ? 'YES' : 'NO'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `godhara_products_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('✓ Exported products table spreadsheet!');
  };

  // --- ACTIONS: ORDERS ---
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadAllAdminData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
        }
        triggerNotification(`✓ Order shifted to ${status}`);
      }
    } catch (err) {
      triggerNotification('Failed updating state.', 'error');
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await apiFetch(`/api/admin/orders/${selectedOrder.id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingInput })
      });
      if (res.ok) {
        loadAllAdminData();
        setSelectedOrder(prev => prev ? { ...prev, trackingNumber: trackingInput } : null);
        triggerNotification('✓ Tracking reference updated on database!');
      }
    } catch (e) {
      triggerNotification('Failed updating tracking information', 'error');
    }
  };

  const handlePaymentStatusUpdate = async (status: 'PENDING' | 'PAID' | 'FAILED') => {
    if (!selectedOrder) return;
    try {
      const res = await apiFetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
      if (res.ok) {
        loadAllAdminData();
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: status } : null);
        triggerNotification(`✓ Payment status changed to ${status}`);
      }
    } catch (e) {
      triggerNotification('Failed changing payment ledger status', 'error');
    }
  };

  const handleExportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Date', 'Subtotal', 'Delivery Cost', 'Total Paid', 'Order Status', 'Payment Status', 'Tracking #', 'Address'];
    const rows = orders.map(o => [
      o.id,
      `"${o.shippingAddress.name.replace(/"/g, '""')}"`,
      o.shippingAddress.email,
      new Date(o.createdAt).toLocaleDateString(),
      o.subtotal,
      o.shippingCharge,
      o.total,
      o.status,
      o.paymentStatus,
      o.trackingNumber || '',
      `"${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.pincode}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `godhara_orders_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('✓ Orders ledger spreadsheet downloaded!');
  };

  // --- ACTIONS: VEDIC COUPONS ---
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponCode('');
    setCouponType('PERCENTAGE');
    setCouponValue('');
    setCouponMinOrder('500');
    setCouponMaxUses('100');
    setCouponExpiry('2027-12-31');
    setCouponActive(true);
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (c: any) => {
    setEditingCoupon(c);
    setCouponCode(c.code);
    setCouponType(c.type);
    setCouponValue(c.value.toString());
    setCouponMinOrder(c.minOrderValue ? c.minOrderValue.toString() : '');
    setCouponMaxUses(c.maxUses ? c.maxUses.toString() : '');
    setCouponExpiry(c.expiryDate || '');
    setCouponActive(c.isActive !== false);
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || couponValue === undefined) {
      triggerNotification('Coupon Code and discount Value are required!', 'error');
      return;
    }

    const payload = {
      code: couponCode.toUpperCase().trim(),
      type: couponType,
      value: parseFloat(couponValue),
      minOrderValue: couponMinOrder ? parseFloat(couponMinOrder) : 0,
      maxUses: couponMaxUses ? parseInt(couponMaxUses) : 100,
      expiryDate: couponExpiry,
      isActive: couponActive
    };

    try {
      let res;
      if (editingCoupon) {
        res = await apiFetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setShowCouponModal(false);
        loadAllAdminData();
        triggerNotification(editingCoupon ? '✓ Coupon updated!' : '✓ Sacred Coupon added successfully!');
      } else {
        const errVal = await res.json();
        triggerNotification(errVal.message || 'Operation failed', 'error');
      }
    } catch (e) {
      triggerNotification('Failed communicating with coupons API', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    const confirmed = window.confirm(`Delete promotion code "${code}"?`);
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAllAdminData();
        triggerNotification('✓ Coupon successfully removed');
      }
    } catch (e) {
      triggerNotification('Failed deleting coupon', 'error');
    }
  };

  // --- ACTIONS: CUSTOMER MANAGEMENT ---
  const handleOpenEditCustomer = (cust: CustomerHistory) => {
    // Look up in database/customers list and extract address line mapping if any
    setEditingCustomer(cust);
    setCustName(cust.name);
    setCustPhone(cust.phone || '');
    
    // Parse detailed address
    const originalUser = customers.find(u => u.id === cust.id);
    setCustStreet(originalUser && (originalUser as any).address?.street ? (originalUser as any).address.street : '');
    setCustCity(originalUser && (originalUser as any).address?.city ? (originalUser as any).address.city : '');
    setCustState(originalUser && (originalUser as any).address?.state ? (originalUser as any).address.state : 'Telangana');
    setCustPincode(originalUser && (originalUser as any).address?.pincode ? (originalUser as any).address.pincode : '');
  };

  const handleSaveCustomerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const payload = {
      name: custName,
      phone: custPhone,
      address: {
        street: custStreet,
        city: custCity,
        state: custState,
        pincode: custPincode
      }
    };

    try {
      const res = await apiFetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingCustomer(null);
        loadAllAdminData();
        triggerNotification('✓ Customer database records updated!');
      }
    } catch (e) {
      triggerNotification('Database write failure', 'error');
    }
  };

  // --- ACTIONS: SYSTEM CONFIGS SAVE ---
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      triggerNotification('Please upload an image file only.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
        triggerNotification('✓ Store logo file staged.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFounderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      triggerNotification('Please upload an image file only.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFounderImageUrl(event.target.result as string);
        triggerNotification('✓ Founder portrait photo staged.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.role === 'VIEWER' || user?.role === 'MODERATOR') {
      triggerNotification('Operation Denied: Mod/Viewer roles do not possess administrative write privileges.', 'error');
      return;
    }
    
    const payload = {
      storeName,
      contactEmail: storeEmail,
      phone: storePhone,
      address: storeAddress,
      freeShippingThreshold: freeShippingLimit,
      flatShippingCharge: flatShippingCost,
      announcementText: announcementBanner,
      lowStockThreshold: lowStockAlertLimit,
      
      // Delivery settings
      deliveryChargeTelangana,
      deliveryChargeAP,
      deliveryChargeOther,
      freeDeliveryPincodes: freeDeliveryPincodes.split(',').map(p => p.trim()).filter(Boolean),
      storeServicePincodes: storeServicePincodes.split(',').map(p => p.trim()).filter(Boolean),
      storeLocations: storeLocations.split('\n').map(l => l.trim()).filter(Boolean),
      
      // Brand parameters
      logoUrl,
      founderImageUrl,
      founderName,
      founderQuote
    };

    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Sync browser local storage instant preview helpers
        localStorage.setItem('gdh_brand_logo', logoUrl);
        localStorage.setItem('gdh_founder_image', founderImageUrl);
        localStorage.setItem('gdh_founder_name', founderName);
        localStorage.setItem('gdh_founder_quote', founderQuote);
        
        // Broadcast updates to logo components
        window.dispatchEvent(new Event('gdh_logo_updated'));
        
        loadAllAdminData();
        triggerNotification('✓ Store configurations & Brand assets saved successfully!');
      }
    } catch (e) {
      triggerNotification('Failed writing store configuration.', 'error');
    }
  };

  // ==========================================
  // SEGMENT: SECURE MEMBERS REGISTRY OPERATIONS
  // ==========================================
  const handleBanUser = async (uId: string) => {
    if (user?.role === 'VIEWER') {
      triggerNotification('Operation Denied: VIEWER role cannot perform state changes.', 'error');
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users/${uId}/ban`, { method: 'POST' });
      if (res.ok) {
        loadAllAdminData();
        triggerNotification('✓ Customer membership successfully suspended.');
      } else {
        triggerNotification('Failed to suspend user.', 'error');
      }
    } catch (err) {
      triggerNotification('Network communications error', 'error');
    }
  };

  const handleUnbanUser = async (uId: string) => {
    if (user?.role === 'VIEWER') {
      triggerNotification('Operation Denied: VIEWER role cannot perform state changes.', 'error');
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users/${uId}/unban`, { method: 'POST' });
      if (res.ok) {
        loadAllAdminData();
        triggerNotification('✓ Membership privileges restored.');
      } else {
        triggerNotification('Failed to clear user suspension.', 'error');
      }
    } catch (err) {
      triggerNotification('Network communications error', 'error');
    }
  };

  const handleForcePasswordReset = async (uId: string) => {
    if (user?.role === 'VIEWER') {
      triggerNotification('Operation Denied: VIEWER role cannot generate password link dispatch.', 'error');
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users/${uId}/force-reset`, { method: 'POST' });
      if (res.ok) {
        triggerNotification('✓ Forced re-verification link queued & dispatched successfully!');
      } else {
        triggerNotification('Failed to execute forced password reset.', 'error');
      }
    } catch (err) {
      triggerNotification('Network communications error', 'error');
    }
  };

  const handleSoftDeleteUser = async (uId: string) => {
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
      triggerNotification('Operation Denied: Only SUPER_ADMIN can trigger account deletion.', 'error');
      return;
    }
    const confirm = window.confirm('Are you absolutely certain you want to soft-delete this user? All authentications will block immediately.');
    if (!confirm) return;
    try {
      const res = await apiFetch(`/api/admin/users/${uId}`, { method: 'DELETE' });
      if (res.ok) {
        loadAllAdminData();
        triggerNotification('✓ User account soft-deleted/archived.');
      } else {
        triggerNotification('Failed to archive user account.', 'error');
      }
    } catch (err) {
      triggerNotification('Network communications error', 'error');
    }
  };

  const handleViewLogs = async (targetedUser: any) => {
    setSelectedMemberDetail(targetedUser);
    setShowLogsDrawer(true);
    setSelectedMemberLogs([]);
    try {
      const res = await apiFetch(`/api/admin/users/${targetedUser.id}/logs`);
      if (res.ok) {
        setSelectedMemberLogs(await res.json());
      }
    } catch (err) {
      triggerNotification('Could not retrieve audit logs.', 'error');
    }
  };

  const handleBulkBanUsers = async () => {
    if (user?.role === 'VIEWER') {
      triggerNotification('Operation Denied: VIEWER role cannot perform state changes.', 'error');
      return;
    }
    if (selectedMemberIds.length === 0) return;
    const confirm = window.confirm(`Ban all ${selectedMemberIds.length} checked accounts?`);
    if (!confirm) return;
    try {
      const res = await apiFetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedMemberIds, action: 'BAN' })
      });
      if (res.ok) {
        setSelectedMemberIds([]);
        loadAllAdminData();
        triggerNotification('✓ Selected accounts suspended.');
      } else {
        triggerNotification('Failed to complete bulk suspension.', 'error');
      }
    } catch (err) {
      triggerNotification('Network communications error', 'error');
    }
  };

  const handleSendBulkEmail = async () => {
    if (user?.role === 'VIEWER') {
      triggerNotification('Operation Denied: VIEWER role cannot dispatch mass emails.', 'error');
      return;
    }
    if (!bulkEmailSubject || !bulkEmailMessage) {
      triggerNotification('Please specify both Subject and message text.', 'error');
      return;
    }
    try {
      const res = await apiFetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedMemberIds.length > 0 ? selectedMemberIds : memberList.map(m => m.id),
          action: 'EMAIL',
          subject: bulkEmailSubject,
          message: bulkEmailMessage
        })
      });
      if (res.ok) {
        setShowBulkEmailModal(false);
        setBulkEmailSubject('');
        setBulkEmailMessage('');
        triggerNotification('📨 Vedic Mass Announcement broadcasted to mail queue successfully!');
      } else {
        triggerNotification('Failed to cue email broadcast.', 'error');
      }
    } catch (err) {
      triggerNotification('Network communications error', 'error');
    }
  };

  // --- STATS GRAPHS GENERATORS (Pure SVG/CSS) ---
  const getOrdersDailyData = () => {
    // Build array of last 10 days count
    const dataList: Record<string, number> = {};
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dataList[key] = 0;
    }

    orders.forEach(o => {
      const dateKey = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dataList[dateKey] !== undefined) {
        dataList[dateKey] += 1;
      }
    });

    return Object.entries(dataList);
  };

  // FILTERS FOR PRODUCTS SYSTEM
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
    const matchesActive = filterActiveStatus === 'ALL' || 
                          (filterActiveStatus === 'ACTIVE' && p.isActive !== false) ||
                          (filterActiveStatus === 'INACTIVE' && p.isActive === false);
    return matchesSearch && matchesCategory && matchesActive;
  });

  // FILTERS FOR ORDERS SYSTEM
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
                          o.shippingAddress.name.toLowerCase().includes(searchOrder.toLowerCase()) ||
                          o.shippingAddress.email.toLowerCase().includes(searchOrder.toLowerCase());
    const matchesStatus = filterOrderStatus === 'ALL' || o.status === filterOrderStatus;
    
    // Date filter comparison
    let matchesDate = true;
    if (filterOrderDate !== 'ALL') {
      const oDate = new Date(o.createdAt);
      const now = new Date();
      if (filterOrderDate === 'TODAY') {
        matchesDate = oDate.toDateString() === now.toDateString();
      } else if (filterOrderDate === 'WEEK') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = oDate >= sevenDaysAgo;
      } else if (filterOrderDate === 'MONTH') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = oDate >= thirtyDaysAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // FILTERS FOR SHIPPING LABELS
  const filteredLabels = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchLabel.toLowerCase()) ||
                          o.shippingAddress.name.toLowerCase().includes(searchLabel.toLowerCase()) ||
                          o.shippingAddress.pincode.includes(searchLabel);
    // Labels are typically generated for Confirmed or Shipped items
    const matchesStatus = filterLabelStatus === 'ALL' || o.status === filterLabelStatus;
    return matchesSearch && matchesStatus && (o.status === 'CONFIRMED' || o.status === 'SHIPPED' || o.status === 'PENDING');
  });

  // STATS VALUE CALCS
  const lowStockCount = products.filter(p => p.stock < lowStockAlertLimit).length;
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen flex flex-col md:flex-row select-none">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#6B2D0E] text-white p-6 flex flex-col justify-between shrink-0 border-r border-[#7C3E1F] font-sans shadow-md">
        <div>
          <div className="flex items-center gap-3 border-b border-[#7C3E1F] pb-6 mb-6">
            <Logo size={42} tinted={true} />
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold leading-none text-white">Godhara</span>
              <span className="text-[9px] text-amber-200/50 uppercase font-bold tracking-widest mt-1">ADMIN CONSOLE</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider">
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'stats' ? 'bg-[#E8820C] text-white shadow' : 'hover:bg-[#52220A] text-stone-200'
              }`}
            >
              <TrendingUp size={14} />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'products' ? 'bg-[#E8820C] text-white shadow' : 'hover:bg-[#52220A] text-stone-200'
              }`}
            >
              <ShoppingBag size={14} />
              Products
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'offers' ? 'bg-[#E8820C] text-white shadow' : 'hover:bg-[#52220A] text-stone-200'
              }`}
            >
              <Tag size={14} />
              Offers & Coupons
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#E8820C] text-white shadow' : 'hover:bg-[#52220A] text-stone-200'
              }`}
            >
              <Truck size={14} />
              Orders
            </button>

            <button
              onClick={() => setActiveTab('labels')}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'labels' ? 'bg-[#E8820C] text-white shadow' : 'hover:bg-[#52220A] text-stone-200'
              }`}
            >
              <Printer size={14} />
              Shipping Labels
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'customers' ? 'bg-[#E8820C] text-white shadow' : 'hover:bg-[#52220A] text-stone-200'
              }`}
            >
              <Users size={14} />
              Customers
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-[#E8820C] text-white shadow' : 'hover:bg-[#52220A] text-stone-200'
              }`}
            >
              <Settings size={14} />
              Settings
            </button>

          </nav>
        </div>

        <div className="border-t border-[#7C3E1F] pt-6 mt-8">
          <button
            onClick={() => setView('home')}
            className="w-full bg-[#52220A] hover:bg-stone-900 border border-white/5 font-semibold text-xs text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            Exit to Store
          </button>
        </div>
      </aside>

      {/* 2. CORE DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 overflow-x-hidden">
        
        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'stats' && statsData && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center bg-white border border-[#D4B896]/30 p-6 rounded-2xl shadow-sm">
              <div>
                <span className="text-[10px] text-orange-600 font-extrabold uppercase tracking-widest">传统传统 Traditional Indian Gaushala Portal</span>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#6B2D0E] mt-1">Gau-Based Business Dashboard</h1>
                <p className="text-xs text-stone-500 mt-0.5">Real-time compilation of sacred products sales and accounting receipts</p>
              </div>
              <button 
                onClick={loadAllAdminData}
                className="bg-stone-100 hover:bg-[#6B2D0E] hover:text-white p-2.5 rounded-lg border border-stone-200 duration-150 transition-all cursor-pointer text-[#2C1810]"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Metrics cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
              <div className="bg-white border border-[#D4B896]/50 rounded-xl p-5 shadow-sm">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Today's Revenue</p>
                <p className="text-2xl font-black text-[#6B2D0E] mt-1">₹{statsData?.stats?.revenueToday.toLocaleString()}</p>
                <p className="text-[10px] text-green-600 font-bold mt-1">▲ Instantly authorised receipts</p>
              </div>

              <div className="bg-white border border-[#D4B896]/50 rounded-xl p-5 shadow-sm">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">All-Time Revenue</p>
                <p className="text-2xl font-black text-green-700 mt-1">₹{statsData?.stats?.revenueAllTime.toLocaleString()}</p>
                <p className="text-[10px] text-green-600 font-bold mt-1">▲ Accumulate book values</p>
              </div>

              <div className="bg-white border border-[#D4B896]/50 rounded-xl p-5 shadow-sm">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Customers</p>
                <p className="text-2xl font-black text-[#2C1810] mt-1">{statsData?.stats?.newCustomersCount} Vedic Souls</p>
                <p className="text-[10px] text-blue-600 font-bold mt-1">Registered patron accounts</p>
              </div>

              <div className="bg-white border border-[#D4B896]/50 rounded-xl p-5 shadow-sm">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Low Stock Products</p>
                <p className="text-2xl font-black text-red-600 mt-1">{lowStockCount} items</p>
                <p className="text-[10px] text-red-500 font-bold mt-1">Below alert threshold of {lowStockAlertLimit}</p>
              </div>
            </div>

            {/* High fidelity inline SVG Sales Growth Chart & Status breakdown charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Daily Sales Bar Chart */}
              <div className="lg:col-span-8 bg-white border border-[#D4B896]/30 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-base font-bold text-[#6B2D0E] mb-6 flex items-center gap-1.5 border-b border-stone-100 pb-2">
                  <TrendingUp size={15} className="text-[#E8820C]" />
                  Orders Flow Trend (Last 10 Days)
                </h3>
                
                {/* SVG Visual Bars */}
                <div className="relative h-64 border-b border-l border-stone-200 flex items-end justify-around pb-1.5 px-4">
                  {getOrdersDailyData().map(([day, val]) => (
                    <div key={day} className="flex flex-col items-center group relative w-1/12">
                      {/* Bar fill */}
                      <div 
                        style={{ height: `${Math.max(8, val * 40)}px` }} 
                        className={`w-full rounded-t-md transition-all duration-300 relative cursor-pointer ${
                          val > 0 ? 'bg-[#E8820C] hover:bg-[#6B2D0E]' : 'bg-stone-100'
                        }`}
                      >
                        {/* Hover Popup */}
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] px-2 py-1 rounded font-bold transition-opacity whitespace-nowrap z-10 shadow">
                          {val} orders
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-stone-400 mt-2 rotate-12 origin-top-left transform">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Pie Breakdown */}
              <div className="lg:col-span-4 bg-white border border-[#D4B896]/30 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-base font-bold text-[#6B2D0E] mb-6 flex items-center gap-1.5 border-b border-stone-100 pb-2 bg-gradient">
                  <Package size={15} className="text-[#E8820C]" />
                  Orders Breakdown
                </h3>
                
                <div className="flex flex-col gap-3 text-xs text-stone-600">
                  <div className="flex justify-between items-center bg-amber-50 rounded-xl p-2.5 border border-amber-100">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span> PENDING:
                    </span>
                    <span className="font-black text-amber-800 bg-white h-5 w-5 rounded-full flex items-center justify-center border border-amber-200">{statsData?.orderBreakdown?.PENDING}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 rounded-xl p-2.5 border border-blue-100">
                    <span className="font-bold text-blue-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span> CONFIRMED:
                    </span>
                    <span className="font-black text-blue-800 bg-white h-5 w-5 rounded-full flex items-center justify-center border border-blue-200">{statsData?.orderBreakdown?.CONFIRMED}</span>
                  </div>
                  <div className="flex justify-between items-center bg-purple-50 rounded-xl p-2.5 border border-purple-100">
                    <span className="font-bold text-purple-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span> SHIPPED:
                    </span>
                    <span className="font-black text-purple-800 bg-white h-5 w-5 rounded-full flex items-center justify-center border border-purple-200">{statsData?.orderBreakdown?.SHIPPED}</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-50 rounded-xl p-2.5 border border-green-100">
                    <span className="font-bold text-green-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span> DELIVERED:
                    </span>
                    <span className="font-black text-green-800 bg-white h-5 w-5 rounded-full flex items-center justify-center border border-green-200">{statsData?.orderBreakdown?.DELIVERED}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Low stock table & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Inventory Alert / Inline Stock edit */}
              <div className="bg-white border border-[#D4B896]/30 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-base font-bold text-red-700 mb-4 border-b border-stone-100 pb-2 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-red-600 animate-pulse" />
                  Quick Inventory Alert (Stock &lt; {lowStockAlertLimit})
                </h3>
                
                <div className="flex flex-col gap-3.5 max-h-80 overflow-y-auto">
                  {products.filter(p => p.stock < lowStockAlertLimit).length === 0 ? (
                    <p className="text-stone-400 text-xs italic py-8 text-center">Perfect. All traditional stocks are abundant!</p>
                  ) : (
                    products.filter(p => p.stock < lowStockAlertLimit).map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-stone-50 border border-stone-100 rounded-xl p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || '/logo.png'} alt="" className="h-8 w-8 rounded object-cover" />
                          <div>
                            <p className="font-bold text-[#2C1810]">{p.name}</p>
                            <p className="text-[10px] text-stone-400">{p.category}</p>
                          </div>
                        </div>

                        {/* Stock Quick Edit panel */}
                        <div className="flex items-center gap-2">
                          {editingStockId === p.id ? (
                            <div className="flex gap-1 items-center">
                              <input 
                                type="number" 
                                value={quickStockValue}
                                onChange={(e) => setQuickStockValue(e.target.value)}
                                className="w-16 bg-white border border-[#D4B896] p-1 text-center rounded text-xs focus:ring-1 focus:ring-[#E8820C]"
                              />
                              <button 
                                onClick={() => handleSaveInlineStock(p.id)}
                                className="bg-[#6B2D0E] text-white p-1 rounded hover:bg-[#E8820C] cursor-pointer"
                              >
                                <Save size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                {p.stock} units
                              </span>
                              <button 
                                onClick={() => handleInlineStockEdit(p)}
                                className="text-[#6B2D0E] hover:text-[#E8820C] font-semibold underline text-[10px] cursor-pointer"
                              >
                                Edit Stock
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="bg-white border border-[#D4B896]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#6B2D0E] mb-4 border-b border-stone-100 pb-2 flex items-center gap-1.5">
                    <FileText size={15} className="text-[#E8820C]" />
                    Latest Sacred Orders (Last 10 Days)
                  </h3>
                  
                  <div className="flex flex-col gap-3 max-h-84 overflow-y-auto">
                    {recentOrders.length === 0 ? (
                      <p className="text-stone-400 text-xs italic py-10 text-center">No orders registered yet. Share the store link!</p>
                    ) : (
                      recentOrders.map(o => (
                        <div key={o.id} className="flex justify-between items-center border-b border-stone-50 pb-2.5 text-xs">
                          <div>
                            <span className="font-bold text-[#6B2D0E]">{o.id}</span>
                            <p className="text-[10px] text-stone-400 mt-0.5">{o.shippingAddress.name} | {new Date(o.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-[#2C1810]">₹{o.total.toLocaleString()}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              o.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                              o.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('orders')} 
                  className="w-full text-center bg-stone-50 hover:bg-[#F5EFE6] border border-stone-200 text-[#6B2D0E] text-[11px] font-bold py-2.5 rounded-xl uppercase tracking-wider mt-4 cursor-pointer"
                >
                  Manage All Orders Ledger
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS LEDGER */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#D4B896]/30 shadow-sm">
              <div>
                <h1 className="text-2xl font-serif font-black text-[#6B2D0E]">Sacred Product Vault</h1>
                <p className="text-xs text-stone-500 mt-0.5">Control live stock visibility, pricing strategies and features</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportProductsCSV} 
                  className="bg-white hover:bg-stone-50 text-[#6B2D0E] px-4 py-3 rounded-full border border-[#D4B896] text-xs font-bold transition-all uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download size={13} /> Export Excel
                </button>
                <button 
                  onClick={handleOpenAddProduct}
                  className="bg-[#6B2D0E] hover:bg-[#E8820C] text-white px-5 py-3 rounded-full text-xs font-bold transition-all uppercase flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus size={14} /> Add Product Entry
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-[#D4B896]/30">
              <div className="sm:col-span-6 relative">
                <input 
                  type="text"
                  placeholder="Seach by name or category..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 pl-9 text-xs focus:outline-none"
                />
                <Search size={14} className="absolute left-3 top-3.5 text-stone-400" />
              </div>

              <div className="sm:col-span-3">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">ALL CATEGORIES</option>
                  {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select 
                  value={filterActiveStatus}
                  onChange={(e) => setFilterActiveStatus(e.target.value)}
                  className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">ALL VISIBILITY</option>
                  <option value="ACTIVE">ACTIVE ONLY</option>
                  <option value="INACTIVE">HIDDEN ONLY</option>
                </select>
              </div>
            </div>

            {/* Products Interactive Table */}
            <div className="bg-white rounded-2xl border border-[#D4B896]/30 shadow-sm overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#6B2D0E] text-white text-[10px] uppercase font-bold tracking-widest border-b border-[#D4B896]">
                      <th className="p-4 w-12 text-center">
                        <input 
                          type="checkbox"
                          checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={(e) => handleSelectAllProducts(e.target.checked)}
                          className="h-3.5 w-3.5 rounded accent-[#E8820C] cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Traditional Icon</th>
                      <th className="p-4">Name & Slug URL</th>
                      <th className="p-4">Weight</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Selling Price</th>
                      <th className="p-4 text-center">In Stock</th>
                      <th className="p-4 text-center">Feat.</th>
                      <th className="p-4 text-center">Live</th>
                      <th className="p-4 text-center">Ledger Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedProductIds.includes(p.id)}
                            onChange={(e) => handleSelectProduct(p.id, e.target.checked)}
                            className="h-3.5 w-3.5 rounded accent-[#E8820C] cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <img src={p.images?.[0] || '/logo.png'} alt="" className="h-10 w-10 rounded-lg object-cover border border-[#D4B896]/30" />
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-[#2C1810]" onClick={() => handleOpenEditProduct(p)}>{p.name}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5 font-mono">/products/{p.slug}</p>
                        </td>
                        <td className="p-4 text-stone-500 font-mono">
                          {p.weight}g
                        </td>
                        <td className="p-4">
                          <span className="bg-stone-100 text-[#6B2D0E] font-semibold px-2.5 py-1 rounded-full text-[10px] border border-stone-200">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-extrabold text-[#2C1810]">
                          {p.discountPrice ? (
                            <div className="flex flex-col text-right">
                              <span>₹{p.discountPrice.toLocaleString()}</span>
                              <span className="text-[9px] text-stone-300 line-through">₹{p.price.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span>₹{p.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold">
                          {editingStockId === p.id ? (
                            <div className="flex gap-1 items-center justify-center">
                              <input 
                                type="number" 
                                value={quickStockValue}
                                onChange={(e) => setQuickStockValue(e.target.value)}
                                className="w-12 bg-white border border-[#D4B896] p-0.5 text-center text-[10px]"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineStock(p.id)}
                              />
                              <button onClick={() => handleSaveInlineStock(p.id)} className="bg-[#6B2D0E] text-white p-0.5 rounded cursor-pointer"><Check size={10} /></button>
                            </div>
                          ) : (
                            <span 
                              onClick={() => handleInlineStockEdit(p)}
                              title="Click to quickly modify inventory"
                              className={`cursor-pointer border-b border-dashed border-[#6B2D0E] px-2 py-0.5 ${
                                p.stock < lowStockAlertLimit ? 'text-red-700 bg-red-50' : 'text-stone-700'
                              }`}
                            >
                              {p.stock}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleToggleProductFeature(p)}
                            className={`p-1 rounded cursor-pointer ${p.isFeatured ? 'text-[#E8820C]' : 'text-stone-300 hover:text-[#E8820C]'}`}
                          >
                            ★
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleToggleProductActive(p)}
                            className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full cursor-pointer ${
                              p.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            {p.isActive !== false ? 'Active' : 'Hidden'}
                          </button>
                        </td>
                        <td className="p-4 text-center flex justify-center gap-2 mt-1">
                          <button 
                            onClick={() => handleOpenEditProduct(p)} 
                            className="text-blue-700 hover:text-white hover:bg-blue-600 p-1.5 rounded duration-150 cursor-pointer border border-blue-200"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id, p.name)} 
                            className="text-red-700 hover:text-white hover:bg-red-600 p-1.5 rounded duration-150 cursor-pointer border border-red-200"
                            title="Archive"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-stone-400 italic">No products matching the selected catalog filters...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Floating bulk action bar at page bottom */}
              {selectedProductIds.length > 0 && (
                <div className="bg-[#F5EFE6] border-t border-[#D4B896] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase select-none font-sans">
                  <span className="text-[#6B2D0E]">{selectedProductIds.length} Selected items for bulk action:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBulkActivate(true)}
                      className="bg-green-600 text-white hover:bg-green-700 px-3.5 py-2 rounded-full cursor-pointer"
                    >
                      ✓ Activate Selected
                    </button>
                    <button 
                      onClick={() => handleBulkActivate(false)}
                      className="bg-stone-500 text-white hover:bg-stone-600 px-3.5 py-2 rounded-full cursor-pointer"
                    >
                      ⚠ Hide Selected
                    </button>
                    <button 
                      onClick={handleBulkDelete}
                      className="bg-red-700 text-white hover:bg-red-800 px-3.5 py-2 rounded-full cursor-pointer"
                    >
                      ☠ Move to Archive (Delete)
                    </button>
                    <button 
                      onClick={() => setSelectedProductIds([])}
                      className="bg-white text-stone-600 px-4 py-2 rounded-full border border-stone-300 cursor-pointer"
                    >
                      Clear Select
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OFFERS & COUPONS */}
        {activeTab === 'offers' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#D4B896]/30 shadow-sm">
              <div>
                <h1 className="text-2xl font-serif font-black text-[#6B2D0E]">Promotional & Coupon Ledger</h1>
                <p className="text-xs text-stone-500 mt-0.5">Define cart percentages discount codes and announcement systems</p>
              </div>
              <button 
                onClick={handleOpenAddCoupon}
                className="bg-[#6B2D0E] hover:bg-[#E8820C] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Log Promotion Coupon
              </button>
            </div>

            {/* Quick Banner Announcements */}
            <div className="bg-white border border-[#D4B896]/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-[#6B2D0E] border-b border-stone-100 pb-2 mb-4">Sitewide Banner Settings</h3>
              <form onSubmit={handleSaveStoreSettings} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 flex flex-col gap-1.5 text-xs">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Announcement Bar Text Description</label>
                  <input 
                    type="text"
                    value={announcementBanner}
                    onChange={(e) => setAnnouncementBanner(e.target.value)}
                    placeholder="e.g. Free Delivery above ₹1000 orders! Traditional cow milk soap bundles..."
                    className="bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 font-semibold text-stone-700 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-4 self-end">
                  <button 
                    type="submit"
                    className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white text-xs font-bold py-3.5 rounded-full transition-all duration-150 cursor-pointer uppercase"
                  >
                    Commit Banner Broadcast
                  </button>
                </div>
              </form>
            </div>

            {/* Coupons Active Table */}
            <div className="bg-white rounded-2xl border border-[#D4B896]/30 shadow-sm overflow-hidden text-xs">
              <h3 className="font-serif text-base font-bold text-[#6B2D0E] p-6 border-b border-stone-100 pb-4">Active Coupon Codes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-[10px] uppercase font-bold border-b border-stone-100">
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Reward Type</th>
                      <th className="p-4 text-center">Value</th>
                      <th className="p-4 text-center">Min Order Threshold</th>
                      <th className="p-4 text-center">Remaining Uses</th>
                      <th className="p-4">Expiry date</th>
                      <th className="p-4 text-center">Visibility</th>
                      <th className="p-4 text-center">Ledger Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {coupons.map((c: any) => (
                      <tr key={c.id} className="hover:bg-stone-50/50">
                        <td className="p-4 font-bold text-[#6B2D0E] font-mono select-all uppercase">
                          {c.code}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            c.type === 'PERCENTAGE' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-800'
                          }`}>
                            {c.type === 'PERCENTAGE' ? 'PERCENT DISCOUNT' : 'FLAT VALUE'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-extrabold text-[#2C1810]">
                          {c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`}
                        </td>
                        <td className="p-4 text-center font-semibold">
                          ₹{c.minOrderValue || 0}
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-mono text-stone-500 bg-stone-100 text-[10px] px-2 py-0.5 rounded">
                            {c.usageCount || 0} / {c.maxUses || 'Unlimited'}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-stone-500">
                          {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-500'
                          }`}>
                            {c.isActive ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="p-4 text-center flex justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEditCoupon(c)}
                            className="text-[#6B2D0E] hover:text-[#E8820C] p-1.5 border border-[#D4B896]/50 rounded cursor-pointer"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="text-red-700 hover:text-white hover:bg-red-600 p-1.5 border border-red-100 rounded cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-400 italic">No promotional coupons configured. Click "Log Promotion Coupon" to start.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS CONTROL PANEL */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#D4B896]/30 shadow-sm">
              <div>
                <h1 className="text-2xl font-serif font-black text-[#6B2D0E]">Vedic Orders Registry</h1>
                <p className="text-xs text-stone-500 mt-0.5">Dispatch control, packing slips generated and live courier tracking logs</p>
              </div>
              <button 
                onClick={handleExportOrdersCSV}
                className="bg-white hover:bg-stone-50 text-[#6B2D0E] border border-[#D4B896] px-4 py-3 rounded-full text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={13} /> Export Ledger CSV
              </button>
            </div>

            {/* Filter orders */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-[#D4B896]/30 select-none">
              <div className="sm:col-span-5 relative">
                <input 
                  type="text"
                  placeholder="Search by Order ID, client name..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 pl-9 text-xs focus:outline-none"
                />
                <Search size={14} className="absolute left-3 top-3.5 text-stone-400" />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={filterOrderStatus}
                  onChange={(e) => setFilterOrderStatus(e.target.value)}
                  className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="PENDING">PENDING SEVA</option>
                  <option value="CONFIRMED">CONFIRMED DISPATCH</option>
                  <option value="SHIPPED">IN COURIER TRANSIT</option>
                  <option value="DELIVERED">DELIVERED SEVA</option>
                  <option value="CANCELLED">CANCELLED/RETURNED</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={filterOrderDate}
                  onChange={(e) => setFilterOrderDate(e.target.value)}
                  className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">ALL RECORD DATES</option>
                  <option value="TODAY">TODAY'S PURCHASES</option>
                  <option value="WEEK">LAST 7 DAYS</option>
                  <option value="MONTH">LAST 30 DAYS</option>
                </select>
              </div>
            </div>

            {/* Split Screen Grid (60% Orders List Table, 40% Detail Display Drawer) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column table list of orders */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D4B896]/30 shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-[#2C1810] font-bold text-[10px] uppercase border-b border-stone-100">
                        <th className="p-4">OrderID</th>
                        <th className="p-4">Recipient</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Sum Fee</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredOrders.map(o => (
                        <tr 
                          key={o.id} 
                          onClick={() => {
                            setSelectedOrder(o);
                            setTrackingInput(o.trackingNumber || '');
                            setEditingPaymentStatus(o.paymentStatus || 'PAID');
                          }}
                          className={`hover:bg-amber-50/50 cursor-pointer ${
                            selectedOrder?.id === o.id ? 'bg-[#F2E0CD]' : ''
                          }`}
                        >
                          <td className="p-4 font-bold text-[#6B2D0E] font-mono select-all">
                            {o.id}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-[#2C1810]">{o.shippingAddress.name}</p>
                            <p className="text-[10px] text-stone-400 mt-0.5">{o.shippingAddress.phone}</p>
                          </td>
                          <td className="p-4 text-stone-500 font-mono">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right font-black text-[#2C1810]">
                            ₹{o.total.toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                              o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              o.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                              o.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-stone-400 italic">No order entries matching ledger parameters...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: High Fidelity Details Drawer */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {selectedOrder ? (
                  <div className="bg-white rounded-2xl border border-[#D4B896] shadow-md p-6 flex flex-col gap-5 text-xs">
                    <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider font-mono">Book ID:</span>
                        <h2 className="text-base font-serif font-black text-[#6B2D0E] font-mono leading-none mt-1 select-all">{selectedOrder.id}</h2>
                        <span className="text-[10px] text-stone-400 block mt-1">{new Date(selectedOrder.createdAt).toLocaleDateString()} | {new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(null)}
                        className="p-1 rounded bg-stone-50 border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-[#F5EFE6]/50 rounded-xl border border-[#D4B896]/40 p-3 flex flex-col gap-1.5">
                      <p className="font-extrabold text-[#6B2D0E] uppercase text-[9px] tracking-widest border-b border-dotted border-[#D4B896]/60 pb-1">Destination Credentials</p>
                      <p className="font-bold text-[#2C1810] text-[13px]">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-stone-500 font-medium">Contact: {selectedOrder.shippingAddress.email} | {selectedOrder.shippingAddress.phone}</p>
                      <p className="text-[#2C1810]/85 leading-normal mt-1">
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - <strong className="font-mono text-[13px] text-[#6B2D0E] font-black">{selectedOrder.shippingAddress.pincode}</strong>
                      </p>
                    </div>

                    {/* Ledger Breakdowns */}
                    <div className="flex flex-col gap-2">
                      <p className="font-extrabold text-[#6B2D0E] uppercase text-[9px] tracking-widest border-b border-dotted border-stone-200 pb-1 mb-1">Traditional Box Contents</p>
                      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border-b border-dashed border-stone-100 pb-2">
                        {selectedOrder.items.map(it => (
                          <div key={it.productId} className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-700 font-medium">{it.name} <strong className="text-stone-400 ml-1">x {it.qty}</strong></span>
                            <span className="font-bold text-[#2C1810]">₹{(it.unitPrice * it.qty).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between font-semibold mt-1">
                        <span>Items Total:</span>
                        <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Vedic Shipping Fee:</span>
                        <span>{selectedOrder.shippingCharge === 0 ? 'FREE' : `₹${selectedOrder.shippingCharge.toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-serif font-black text-[#6B2D0E] border-t border-dotted border-stone-200 pt-2.5">
                        <span>Total Receipts:</span>
                        <span>₹{selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Status Modifiers Form */}
                    <div className="flex flex-col gap-3.5 border-t border-stone-100 pt-4 bg-stone-50 -mx-6 p-6 -mb-6 rounded-b-2xl">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 text-[11px] font-bold text-stone-500 uppercase">
                          <label>Work Status</label>
                          <select 
                            value={selectedOrder.status}
                            onChange={(e) => handleOrderStatusUpdate(selectedOrder.id, e.target.value)}
                            className="bg-white border border-[#D4B896]/60 p-2 rounded focus:outline-none cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 text-[11px] font-bold text-stone-500 uppercase">
                          <label>Payment State</label>
                          <select 
                            value={editingPaymentStatus}
                            onChange={(e) => {
                              const v = e.target.value as any;
                              setEditingPaymentStatus(v);
                              handlePaymentStatusUpdate(v);
                            }}
                            className="bg-white border border-[#D4B896]/60 p-2 rounded focus:outline-none cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </div>
                      </div>

                      <form onSubmit={handleSaveTracking} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-stone-500">Dispatch tracking number</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="e.g. SHIP-7890-IND"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className="flex-grow bg-white border border-[#D4B896]/60 p-2 rounded text-xs focus:outline-none"
                          />
                          <button 
                            type="submit"
                            className="bg-[#6B2D0E] hover:bg-[#E8820C] text-white px-4 py-2 rounded text-xs font-bold uppercase cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </form>

                      {/* PDF printable anchor points - compliant with no-window-open rules */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <a 
                          href={`${API_URL}/api/orders/${selectedOrder.id}/invoice`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-stone-100 text-[#6B2D0E] font-bold py-2.5 rounded border border-[#D4B896]/60 text-center flex items-center justify-center gap-1 cursor-pointer select-none"
                        >
                          <FileText size={12} /> View Invoice PDF
                        </a>
                        <a 
                          href={`${API_URL}/api/orders/${selectedOrder.id}/label`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#E8820C] hover:bg-[#6B2D0E] text-white font-bold py-2.5 rounded text-center flex items-center justify-center gap-1 cursor-pointer select-none"
                        >
                          <Printer size={12} /> View Label PDF
                        </a>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-[#D4B896] p-10 text-center text-stone-400 italic font-medium">
                    Please select an order from the list on the left to reveal packing controls and invoices...
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SHIPPING LABELS PORTAL */}
        {activeTab === 'labels' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#D4B896]/30 shadow-sm">
              <div>
                <h1 className="text-2xl font-serif font-black text-[#6B2D0E]">A6 Shipping Label Queue</h1>
                <p className="text-xs text-stone-500 mt-0.5">Vedic parcel address layouts optimized for 1/4 A4 (105mm × 148.5mm) printing</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    alert('Preparing print spooler queue for all selected address plates...');
                  }}
                  className="bg-[#6B2D0E] hover:bg-[#E8820C] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Printer size={14} /> Batch Print Selected
                </button>
              </div>
            </div>

            {/* Filters & View Selectors Bar */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-[#D4B896]/30 select-none">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 relative">
                  <input 
                    type="text"
                    placeholder="Filter by Order ID, dispatch recipient, PIN pincode..."
                    value={searchLabel}
                    onChange={(e) => setSearchLabel(e.target.value)}
                    className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 pl-9 text-xs focus:outline-none"
                  />
                  <Search size={14} className="absolute left-3 top-3.5 text-stone-400" />
                </div>

                <div className="sm:col-span-4">
                  <select 
                    value={filterLabelStatus}
                    onChange={(e) => setFilterLabelStatus(e.target.value)}
                    className="w-full bg-stone-50 border border-[#D4B896]/70 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">ALL DISPATCH ITEMS</option>
                    <option value="PENDING">PENDING STATUS</option>
                    <option value="CONFIRMED">CONFIRMED DISPATCH</option>
                    <option value="SHIPPED">SHIPPED IN TRANSIT</option>
                  </select>
                </div>
              </div>

              {/* Responsive layout view toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Display Mode</span>
                <div className="flex bg-stone-100 p-1 rounded-lg gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLabelsViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${
                      labelsViewMode === 'grid' 
                        ? 'bg-[#6B2D0E] text-white shadow' 
                        : 'text-stone-500 hover:text-[#6B2D0E]'
                    }`}
                  >
                    Sticker Cards (A6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelsViewMode('table')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${
                      labelsViewMode === 'table' 
                        ? 'bg-[#6B2D0E] text-white shadow' 
                        : 'text-stone-500 hover:text-[#6B2D0E]'
                    }`}
                  >
                    List Table
                  </button>
                </div>
              </div>
            </div>

            {/* Labels View Main Switcher */}
            {labelsViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLabels.map(o => {
                  const calculatedWeight = o.items.reduce((acc, current) => acc + (current.weight || 250) * current.qty, 0);
                  const calculatedQty = o.items.reduce((acc, current) => acc + current.qty, 0);
                  
                  return (
                    <div 
                      key={o.id}
                      className="bg-white border-2 border-[#D4B896]/60 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative max-w-full"
                      style={{ minHeight: '430px' }}
                    >
                      {/* Label metadata and checkboxes */}
                      <div className="p-4 bg-stone-50 border-b border-[#D4B896]/30 flex justify-between items-center">
                        <span className="bg-[#6B2D0E] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                          1/4 A4 format (105x148mm)
                        </span>
                        
                        <div className="flex items-center gap-1.5 bg-[#52220A]/10 px-2 const-select-plate py-0.5 rounded-full border border-[#D4B896]/30">
                          <input 
                            type="checkbox"
                            checked={!!printedLabels[o.id]}
                            onChange={(e) => {
                              setPrintedLabels(prev => ({ ...prev, [o.id]: e.target.checked }));
                              triggerNotification(`✓ Print state updated for ${o.id}`);
                            }}
                            className="h-3.5 w-3.5 rounded text-[#6B2D0E] accent-[#E8820C] cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-[#6B2D0E] uppercase select-none">Staged</span>
                        </div>
                      </div>

                      {/* PHYSICAL PRINT PREVIEW ENVELOPE (1:1.414 aspect ratio mockup, but fully responsive fluid) */}
                      <div className="p-4 flex-1 flex flex-col gap-3 font-sans text-stone-800">
                        {/* Sender info header */}
                        <div className="flex items-center gap-3 pb-2.5 border-b border-[#D4B896]/30">
                          {/* Left: Company Logo */}
                          <div className="w-9 h-9 rounded-full bg-[#6B2D0E]/10 border border-[#D4B896] flex items-center justify-center shrink-0 shadow-sm">
                            <span className="font-serif font-bold text-sm text-[#6B2D0E]">G</span>
                          </div>
                          {/* Right: Company name & address */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#6B2D0E] block leading-tight truncate">GODHARA PRODUCTS</span>
                            <span className="text-[8px] text-stone-500 block leading-tight mt-0.5 truncate">Pocharam Apartment, Banswada, Telangana 503187</span>
                            <span className="text-[8px] text-stone-400 block leading-tight mt-0.5 truncate">Ph: +91 8978038932 | support@godhara.com</span>
                          </div>
                        </div>

                        {/* Recipient SHIP TO info */}
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-stone-400 block">SHIP TO:</span>
                          <h2 className="text-[#2C1810] text-sm font-bold leading-tight tracking-tight truncate">
                            {o.shippingAddress.name}
                          </h2>
                          <p className="text-stone-600 text-[11px] leading-relaxed block h-auto max-h-[36px] overflow-hidden break-words text-ellipsis">
                            {o.shippingAddress.street}
                          </p>
                          <p className="text-[#6B2D0E] font-bold text-xs">
                            {o.shippingAddress.city}, {o.shippingAddress.state}
                          </p>
                        </div>

                        {/* Large Pincode Box */}
                        <div className="bg-[#F5EFE6] border border-[#D4B896]/60 rounded-xl p-3 flex flex-row items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[8px] text-stone-500 uppercase font-bold tracking-wider block">Postal Area Pincode</span>
                            <span className="font-mono text-sm sm:text-base font-black text-[#6B2D0E] select-all leading-none">
                              PIN {o.shippingAddress.pincode}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[8px] text-stone-500 uppercase font-bold tracking-wider block">Recipient Contact</span>
                            <span className="font-mono text-xs font-bold text-[#2C1810] select-all leading-none block mt-0.5">
                              {o.shippingAddress.phone}
                            </span>
                          </div>
                        </div>

                        {/* Weight, Item Qty, and Tracking details bar */}
                        <div className="grid grid-cols-2 gap-3 text-left py-2.5 border-t border-b border-stone-100 text-[10px]">
                          <div className="space-y-1 min-w-0 border-r border-[#D4B896]/20 pr-2">
                            <div className="flex justify-between">
                              <span className="text-stone-400 font-medium">Date:</span>
                              <span className="font-semibold text-stone-700 truncate">{new Date(o.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400 font-medium">Weight:</span>
                              <span className="font-semibold font-mono text-[#E8820C]">{(calculatedWeight / 1000).toFixed(2)} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400 font-medium">Pieces:</span>
                              <span className="font-bold text-[#6B2D0E]">{calculatedQty} pcs</span>
                            </div>
                          </div>
                          <div className="space-y-1 min-w-0 pl-1 text-right">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#6B2D0E] block select-none">TRACKING NUMBER</span>
                            <span className="font-mono font-bold text-stone-800 text-[10px] block truncate select-all">{o.trackingNumber || `TRK-GDH-${o.id.slice(0, 8).toUpperCase()}`}</span>
                            <div className="flex justify-between text-[9px] mt-0.5">
                              <span className="text-stone-400">Pay:</span>
                              <span className="font-bold text-stone-600 truncate">{o.paymentStatus || 'PAID'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pure CSS simulated barcode representing Order ID */}
                        <div className="border border-stone-200 bg-stone-50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-xs">
                          <div className="w-full h-8 flex items-stretch gap-[1.5px] opacity-90 select-none">
                            {Array.from({ length: 44 }).map((_, i) => {
                              const widths = ['w-[1px]', 'w-[2px]', 'w-[3px]', 'w-[1.5px]'];
                              const chosenWidth = widths[(i * 13 + 5) % 4];
                              const isLine = (i % 6 !== 2);
                              return (
                                <div key={i} className={`h-full ${chosenWidth} ${isLine ? 'bg-stone-950' : 'bg-transparent'} grow`} />
                              );
                            })}
                          </div>
                          <div className="flex justify-between w-full font-mono text-[9px] text-stone-700 px-1">
                            <span className="font-medium">REF:</span>
                            <span className="font-black select-all tracking-wider">{o.id}</span>
                          </div>
                        </div>

                        {/* Packet items breakdown list */}
                        <div className="bg-[#FAF8F5]/80 border border-[#D4B896]/30 rounded-xl p-3">
                          <span className="text-[9px] uppercase tracking-widest font-black text-[#6B2D0E] block mb-2">Itemized Packet Contents</span>
                          <div className="flex flex-col gap-1.5">
                            {o.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[10px] pb-1 border-b border-dashed border-stone-100 last:border-0 last:pb-0">
                                <span className="text-stone-700 font-medium truncate max-w-[180px]">{item.weight ? `${item.name} (${item.weight}g)` : item.name}</span>
                                <span className="font-mono font-bold text-[#6B2D0E] shrink-0">Qty: {item.qty}</span>
                              </div>
                            ))}
                            {o.items.length > 3 && (
                              <p className="text-[9px] text-[#E8820C] italic font-bold">
                                + {o.items.length - 3} additional items in packing list
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Download print trigger action */}
                      <div className="p-3 bg-stone-50 border-t border-[#D4B896]/30 flex gap-2">
                        <a 
                          href={`${API_URL}/api/orders/${o.id}/label`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setPrintedLabels(prev => ({ ...prev, [o.id]: true }));
                          }}
                          className="w-full text-center text-xs bg-white hover:bg-stone-100 text-[#6B2D0E] active:scale-[0.98] font-bold py-2.5 rounded-xl border border-[#D4B896] hover:border-[#E8820C] transition-all flex items-center justify-center gap-1.5 select-none"
                        >
                          <Printer size={13} /> Print 1/4 A4 Sheet Label
                        </a>
                      </div>
                    </div>
                  );
                })}
                {filteredLabels.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white border border-[#D4B896]/30 rounded-2xl italic text-stone-400">
                    No active dispatches found mapping search criteria...
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#D4B896]/30 shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 text-[10px] uppercase font-bold border-b border-stone-100">
                        <th className="p-4 w-12 text-center">Print Status</th>
                        <th className="p-4">Delivery Order ID</th>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4 font-bold text-stone-600">PINCODE Destination</th>
                        <th className="p-4 text-center">Lox Weighing (g)</th>
                        <th className="p-4 text-center">Pieces</th>
                        <th className="p-4 text-center">A6 Documents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredLabels.map(o => {
                        const calculatedWeight = o.items.reduce((acc, current) => acc + (current.weight || 250) * current.qty, 0);
                        const calculatedQty = o.items.reduce((acc, current) => acc + current.qty, 0);
                        
                        return (
                          <tr key={o.id} className="hover:bg-stone-50/50">
                            <td className="p-4 text-center">
                              <input 
                                type="checkbox"
                                checked={!!printedLabels[o.id]}
                                onChange={(e) => {
                                  setPrintedLabels(prev => ({ ...prev, [o.id]: e.target.checked }));
                                  triggerNotification(`✓ Print check state updated for ${o.id}`);
                                }}
                                className="h-4 w-4 rounded text-[#6B2D0E] accent-[#E8820C] cursor-pointer"
                              />
                            </td>
                            <td className="p-4 font-bold text-[#6B2D0E] font-mono select-all">
                              {o.id}
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-[#2C1810]">{o.shippingAddress.name}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5">{o.shippingAddress.street}</p>
                            </td>
                            <td className="p-4 font-sans">
                              <span className="text-stone-700 font-semibold">{o.shippingAddress.city}, {o.shippingAddress.state}</span>
                              <span className="block font-mono text-sm text-[#E8820C] font-black mt-0.5 select-all">
                                PIN: {o.shippingAddress.pincode}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono font-medium">
                              {calculatedWeight} g
                            </td>
                            <td className="p-4 text-center font-bold">
                              {calculatedQty} items
                            </td>
                            <td className="p-4 text-center font-bold">
                              <a 
                                href={`${API_URL}/api/orders/${o.id}/label`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => {
                                  setPrintedLabels(prev => ({ ...prev, [o.id]: true }));
                                }}
                                className="bg-white hover:bg-stone-100 text-[#6B2D0E] font-bold border border-[#D4B896] px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1 inline-flex cursor-pointer select-none"
                              >
                                <Printer size={12} /> Print 1/4 A4 Label
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredLabels.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-stone-400 italic">No labels mapping criteria. Confirm order status to generate dispatches...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CUSTOMERS DATABASE */}
        {activeTab === 'customers' && (
          <div className="flex flex-col gap-6 font-sans text-xs">
            
            {/* Header section with tools */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-[#D4B896]/30 shadow-sm">
              <div>
                <h1 className="text-2xl font-serif font-black text-[#6B2D0E] flex items-center gap-2">
                  <Logo size={32} /> Secure Members Registry
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">Automated Role-Based Access Control and audit trails dashboard</p>
              </div>

              {/* General action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkEmailModal(true)}
                  className="bg-stone-50 text-stone-700 hover:bg-[#6B2D0E] hover:text-white border border-stone-200 hover:border-[#6B2D0E] font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 duration-100 cursor-pointer select-none"
                >
                  <Mail size={13} /> Broadcase Mass Email
                </button>
                <a
                  href={`${API_URL}/api/admin/users/export`}
                  download="godhara_users_export.csv"
                  className="bg-stone-50 text-stone-700 hover:bg-emerald-600 hover:text-white border border-stone-200 hover:border-emerald-600 font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 duration-100 cursor-pointer select-none"
                >
                  <Download size={13} /> Export Members (CSV)
                </a>
              </div>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-xl border border-[#D4B896]/30 shadow-sm flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Query by Name, Email address or Pincode..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 p-2 pl-8 pr-3 text-xs font-semibold text-[#2C1810] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                />
                <Search size={14} className="absolute left-2.5 top-3 text-stone-400" />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={memberRoleFilter}
                  onChange={(e) => setMemberRoleFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-xs font-bold p-2.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                  <option value="ADMIN">Admins</option>
                  <option value="MODERATOR">Moderators</option>
                  <option value="VIEWER">Viewers</option>
                  <option value="CUSTOMER">Customers</option>
                </select>

                <select
                  value={memberStatusFilter}
                  onChange={(e) => setMemberStatusFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-xs font-bold p-2.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="BANNED">Banned accounts</option>
                  <option value="VERIFIED">Verified email only</option>
                  <option value="UNVERIFIED">Pending verification</option>
                </select>

                <select
                  value={memberProviderFilter}
                  onChange={(e) => setMemberProviderFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-xs font-bold p-2.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Providers</option>
                  <option value="EMAIL">Email</option>
                  <option value="GOOGLE">Google</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>

            {/* Bulk Action Panel wrapper */}
            {selectedMemberIds.length > 0 && (
              <div className="bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl flex items-center justify-between text-xs text-[#6B2D0E] font-bold">
                <span className="flex items-center gap-2">
                  🛡️ Selected ({selectedMemberIds.length}) records ready for security operations
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkEmailModal(true)}
                    className="bg-stone-950 hover:bg-stone-850 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase font-sans cursor-pointer select-none"
                  >
                    Send Email Announcement ({selectedMemberIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkBanUsers}
                    className="bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase font-sans cursor-pointer select-none"
                  >
                    Group Suspension (Ban)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberIds([])}
                    className="text-stone-400 hover:text-stone-600 text-[10px] uppercase font-bold px-1"
                  >
                    Clear Selects
                  </button>
                </div>
              </div>
            )}

            {/* User List grid */}
            <div className="bg-white rounded-2xl border border-[#D4B896]/30 shadow-sm overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-[10px] uppercase font-bold border-b border-stone-100">
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={memberList.length > 0 && selectedMemberIds.length === memberList.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMemberIds(memberList.map(m => m.id));
                            } else {
                              setSelectedMemberIds([]);
                            }
                          }}
                          className="rounded border-[#D4B896] text-[#6B2D0E] focus:ring-[#E8820C] h-3.5 w-3.5 cursor-pointer"
                        />
                      </th>
                      <th className="p-4 w-1/4">Soul Profile Info</th>
                      <th className="p-4">Authorization Role</th>
                      <th className="p-4 text-center">Verification Status</th>
                      <th className="p-4 text-center">Account Sanction</th>
                      <th className="p-4 text-center">Joined Date</th>
                      <th className="p-4 text-center">Record Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {memberList.map(member => {
                      const isSelected = selectedMemberIds.includes(member.id);
                      const isSuperOrAdmin = member.role === 'SUPER_ADMIN' || member.role === 'ADMIN';

                      return (
                        <tr key={member.id} className={`hover:bg-amber-50/10 ${member.isBanned ? 'bg-red-50/20' : ''}`}>
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMemberIds(prev => [...prev, member.id]);
                                } else {
                                  setSelectedMemberIds(prev => prev.filter(pId => pId !== member.id));
                                }
                              }}
                              className="rounded border-[#D4B896] text-[#6B2D0E] focus:ring-[#E8820C] h-3.5 w-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#2C1810] text-[13px] flex items-center gap-1.5 flex-wrap">
                                {member.name}
                                {member.isBanned && (
                                  <span className="bg-red-100 text-red-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">BANNED</span>
                                )}
                                {member.authProvider && (
                                  <span className={`inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    member.authProvider.toLowerCase() === 'google' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    member.authProvider.toLowerCase() === 'both' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                    'bg-stone-50 text-stone-500 border border-stone-200'
                                  }`}>
                                    {member.authProvider.toLowerCase() === 'google' && (
                                      <svg className="h-2 w-2 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                      </svg>
                                    )}
                                    {member.authProvider}
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-stone-400 tracking-tight">{member.email}</span>
                              <span className="text-[10px] text-[#6B2D0E] font-medium leading-none mt-1">{member.phone || 'Phone unlinked'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase select-all ${
                              member.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                              member.role === 'ADMIN' ? 'bg-orange-100 text-orange-800' :
                              member.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800' :
                              member.role === 'VIEWER' ? 'bg-purple-100 text-purple-800' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {member.role || 'CUSTOMER'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-bold ${member.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {member.isVerified ? '✅ VERIFIED' : '⏳ PENDING'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-bold ${member.isBanned ? 'text-red-700' : 'text-green-700'}`}>
                              {member.isBanned ? '🚫 SUSPENDED' : '🟢 ACTIVE LIFE'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-stone-400">
                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Audit trail trigger */}
                              <button
                                type="button"
                                onClick={() => handleViewLogs(member)}
                                title="Inspect User Logs"
                                className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-1.5 rounded-lg border border-stone-250 cursor-pointer"
                              >
                                <Eye size={12} />
                              </button>

                              {/* Toggle suspension */}
                              {member.isBanned ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnbanUser(member.id)}
                                  className="bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white px-2 py-1 rounded text-[9px] font-black border border-emerald-200 uppercase cursor-pointer"
                                >
                                  Unban
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isSuperOrAdmin && user?.role !== 'SUPER_ADMIN'}
                                  onClick={() => handleBanUser(member.id)}
                                  className={`px-2 py-1 rounded text-[9px] font-black uppercase border cursor-pointer ${
                                    isSuperOrAdmin && user?.role !== 'SUPER_ADMIN'
                                      ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                                      : 'bg-red-50 hover:bg-red-600 text-red-800 hover:text-white border-red-200'
                                  }`}
                                >
                                  Ban
                                </button>
                              )}

                              {/* Force password reset */}
                              <button
                                type="button"
                                onClick={() => handleForcePasswordReset(member.id)}
                                title="Force Password Reset via Email Link"
                                className="bg-stone-50 hover:bg-[#6B2D0E] hover:text-white text-stone-700 border border-stone-200/80 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wide cursor-pointer"
                              >
                                Reset Link
                              </button>

                              {/* Delete option */}
                              <button
                                type="button"
                                disabled={user?.role !== 'SUPER_ADMIN'}
                                onClick={() => handleSoftDeleteUser(member.id)}
                                className={`p-1.5 rounded-lg border cursor-pointer ${
                                  user?.role === 'SUPER_ADMIN'
                                    ? 'bg-stone-50 hover:bg-red-100 text-red-700 border-stone-250'
                                    : 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
                                }`}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {memberList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-stone-400 italic">
                          No authenticatable members mathing the selected search queries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUDIT LOG TIMELINE DRAWER */}
            {showLogsDrawer && selectedMemberDetail && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50">
                <div className="w-full max-w-lg bg-white h-screen p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Drawer header */}
                    <div className="flex justify-between items-start border-b border-stone-100 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] text-amber-600 font-extrabold uppercase font-mono tracking-wider">MEMBER AUDIT REPORT</span>
                        <h2 className="text-xl font-serif font-black text-[#6B2D0E] mt-0.5">{selectedMemberDetail.name}</h2>
                        <p className="text-[10px] text-stone-400 mt-0.5">{selectedMemberDetail.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLogsDrawer(false);
                          setSelectedMemberDetail(null);
                        }}
                        className="bg-stone-100 hover:bg-[#6B2D0E] p-1.5 rounded-lg hover:text-white transition-all cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Timeline lists */}
                    <div className="flex-1 overflow-y-auto max-h-[70vh] flex flex-col gap-3 font-sans pr-1">
                      <p className="text-[10px] font-black uppercase text-stone-400 mb-1">CONSECUTIVE ACTIVITY LOGS ({selectedMemberLogs.length})</p>
                      {selectedMemberLogs.map((log) => (
                        <div key={log.id} className="bg-stone-50 border border-stone-100 p-3 rounded-lg flex flex-col gap-1.5 leading-normal">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-[#6B2D0E] font-mono">{log.action}</span>
                            <span className="text-stone-400">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] text-stone-500 font-medium grid grid-cols-2 gap-1 bg-white p-1.5 border border-stone-100 rounded">
                            <span><strong>IP Address:</strong> {log.ip || 'Local Network'}</span>
                            <span className="text-right truncate" title={log.userAgent}><strong>Agent:</strong> {log.userAgent || 'Applet Client'}</span>
                          </div>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="text-[9px] text-[#E8820C] font-semibold bg-amber-50/50 p-2 border border-amber-100/50 rounded leading-snug">
                              <strong>Log Context Parameters:</strong> {JSON.stringify(log.metadata)}
                            </div>
                          )}
                        </div>
                      ))}
                      {selectedMemberLogs.length === 0 && (
                        <div className="text-stone-400 italic text-[11px] py-12 text-center">
                          Pristine session state. No system activities recorded for this member.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-4 mt-4 flex justify-between items-center text-[10px] text-stone-400 font-bold">
                    <span>Audit compliance signed securely</span>
                    <span>GODHARA INTEGRITY</span>
                  </div>
                </div>
              </div>
            )}

            {/* MASS BULK EMAIL SENDING MODAL */}
            {showBulkEmailModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white border border-[#D4B896] p-6 rounded-2xl shadow-xl w-full max-w-md">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
                    <h3 className="font-serif text-lg font-black text-[#6B2D0E] flex items-center gap-1.5">
                      <Mail size={16} /> Grid Announcement Broadcaster
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowBulkEmailModal(false)}
                      className="bg-stone-50 hover:bg-stone-200 p-1 rounded-lg cursor-pointer text-stone-500"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-150 mb-4 font-sans text-[10px] text-[#6B2D0E] font-medium leading-relaxed">
                    This message will dispatch secure transactional emails to {selectedMemberIds.length > 0 ? selectedMemberIds.length : 'All registered'} users of the Godhara traditional circle.
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendBulkEmail();
                    }}
                    className="flex flex-col gap-3 font-sans"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Announcement Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Traditional Dhoop Festival Offerings"
                        value={bulkEmailSubject}
                        onChange={(e) => setBulkEmailSubject(e.target.value)}
                        className="bg-stone-50 border border-stone-200 text-xs font-semibold p-2 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Email Message Content (HTML formatted) *</label>
                      <textarea
                        required
                        rows={6}
                        placeholder="Specify announcement text..."
                        value={bulkEmailMessage}
                        onChange={(e) => setBulkEmailMessage(e.target.value)}
                        className="bg-stone-50 border border-stone-200 text-xs font-medium p-2 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] leading-relaxed resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkEmailModal(false)}
                        className="border border-stone-200 hover:bg-stone-50 font-bold px-4 py-2 rounded-lg text-[10px] uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold px-4 py-2 rounded-lg text-[10px] uppercase cursor-pointer"
                      >
                        Broadcast Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 7: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-[#D4B896]/30 p-6 sm:p-8 shadow-sm text-xs">
            <h1 className="text-2xl font-serif font-black text-[#6B2D0E] border-b border-stone-100 pb-3 mb-6">Store Variables Settings</h1>
            
            <form onSubmit={handleSaveStoreSettings} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Store Front Name</label>
                  <input 
                    type="text" 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Gau Contact Phone</label>
                  <input 
                    type="text" 
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Escalation Email Desk</label>
                  <input 
                    type="email" 
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Packaging Dispatch Center Address</label>
                  <input 
                    type="text" 
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Free Traditional Shipping Threshold Value (₹)</label>
                  <input 
                    type="number" 
                    value={freeShippingLimit}
                    onChange={(e) => setFreeShippingLimit(parseInt(e.target.value))}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Standard Pack Delivery Charge (₹)</label>
                  <input 
                    type="number" 
                    value={flatShippingCost}
                    onChange={(e) => setFlatShippingCost(parseInt(e.target.value))}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Inventory Alert Threshold Level (Qty)</label>
                  <input 
                    type="number" 
                    value={lowStockAlertLimit}
                    onChange={(e) => setLowStockAlertLimit(parseInt(e.target.value))}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono font-bold w-1/3"
                  />
                </div>

                {/* DELIVERY CONFIGURATION SECTION */}
                <div className="col-span-1 sm:col-span-2 border-t border-[#D4B896]/30 pt-6 mt-4">
                  <h3 className="text-sm font-serif font-black text-[#6B2D0E] mb-1">Dynamic Delivery Configuration</h3>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-4">State-based charges, free delivery pincodes, and offline store service areas</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Telangana Delivery Charge (₹)</label>
                      <input
                        type="number"
                        value={deliveryChargeTelangana}
                        onChange={(e) => setDeliveryChargeTelangana(parseInt(e.target.value))}
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Andhra Pradesh Charge (₹)</label>
                      <input
                        type="number"
                        value={deliveryChargeAP}
                        onChange={(e) => setDeliveryChargeAP(parseInt(e.target.value))}
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Other States Charge (₹)</label>
                      <input
                        type="number"
                        value={deliveryChargeOther}
                        onChange={(e) => setDeliveryChargeOther(parseInt(e.target.value))}
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Free Delivery Pincodes</label>
                      <p className="text-[9px] text-stone-400">Comma-separated pincodes that always get free delivery (e.g. 500001, 503187)</p>
                      <input
                        type="text"
                        value={freeDeliveryPincodes}
                        onChange={(e) => setFreeDeliveryPincodes(e.target.value)}
                        placeholder="500001, 503187, 508001"
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Store Service Area Pincodes</label>
                      <p className="text-[9px] text-stone-400">Pincodes covered by offline store pickup/delivery (always ₹0)</p>
                      <input
                        type="text"
                        value={storeServicePincodes}
                        onChange={(e) => setStoreServicePincodes(e.target.value)}
                        placeholder="503187, 503001"
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Offline Store Locations</label>
                      <p className="text-[9px] text-stone-400">One location per line (displayed on storefront for customer reference)</p>
                      <textarea
                        value={storeLocations}
                        onChange={(e) => setStoreLocations(e.target.value)}
                        rows={3}
                        placeholder={"Godhara Store — Banswada, Telangana 503187\nGodhara Outlet — Hyderabad, Telangana 500001"}
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-mono text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* BRAND ASSETS SECTION */}
                <div className="col-span-1 sm:col-span-2 border-t border-[#D4B896]/30 pt-6 mt-4">
                  <h3 className="text-sm font-serif font-black text-[#6B2D0E] mb-1">Brand Identity Assets</h3>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-4">Overwrite the default brand logo and founder presentation details</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Brand Logo Upload Dropzone */}
                    <div className="bg-stone-50 border border-dashed border-[#D4B896] p-4 rounded flex flex-col items-center justify-center gap-3 text-center">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Circular Store Logo</span>
                      <div className="w-20 h-20 bg-white border border-[#D4B896] rounded-full overflow-hidden flex items-center justify-center shadow-inner relative group">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Store Logo Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-stone-300 font-bold">No SVG</span>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-opacity">
                          Upload
                          <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[9px] text-stone-400">Upload a square emblem (PNG, JPG, or SVG to replace default vector cow illustration)</p>
                    </div>

                    {/* Founder Photo Upload Dropzone */}
                    <div className="bg-stone-50 border border-dashed border-[#D4B896] p-4 rounded flex flex-col items-center justify-center gap-3 text-center">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Founder's Portrait Image</span>
                      <div className="w-16 h-20 bg-white border border-[#D4B896] rounded overflow-hidden flex items-center justify-center shadow-inner relative group">
                        {founderImageUrl ? (
                          <img src={founderImageUrl} alt="Founder Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="p-2 text-stone-300 text-center font-bold text-[8px] uppercase">No Portrait</div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-opacity">
                          Change
                          <input type="file" accept="image/*" onChange={handleFounderFileChange} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[9px] text-stone-400">Perfect aspect ratio for presentation is 3:4 or 1:1 portrait</p>
                    </div>

                    {/* Founder Name */}
                    <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Founder Signature Name / Title</label>
                      <input 
                        type="text" 
                        value={founderName}
                        onChange={(e) => setFounderName(e.target.value)}
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C] font-semibold"
                        placeholder="e.g. Ketan S., Founder of Godhara"
                      />
                    </div>

                    {/* Founder Quote */}
                    <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-stone-400">Founder's Personal Legacy Quote / Vision</label>
                      <textarea 
                        rows={3}
                        value={founderQuote}
                        onChange={(e) => setFounderQuote(e.target.value)}
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                        placeholder="Write dynamic legacy introduction here..."
                      />
                    </div>

                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-4"
              >
                Save Server Configurations
              </button>

            </form>
          </div>
        )}

      </main>

      {/* PRODUCT ADD/EDIT DRAWER MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4B896] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 text-xs animate-scale-up">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#6B2D0E]">{editingProduct ? 'Edit Vedic Product' : 'Log New Vedic Product'}</h2>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Catalog Registration Panel</span>
              </div>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-full bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desi Ghee (Traditional A2)"
                    value={prodName}
                    onChange={(e) => handleNameChangeForSlug(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Slug URL Endpoint (Auto-calculated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. desi-ghee-traditional-a2"
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Traditional Category *</label>
                  <div className="flex gap-2 relative">
                    {showCategoryInput ? (
                      <div className="flex-grow flex gap-1 items-center">
                        <input 
                          type="text"
                          placeholder="Category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-full bg-stone-50 border border-[#D4B896]/70 p-2 rounded text-xs focus:outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={handleAddCategoryInline}
                          className="bg-[#6B2D0E] text-white p-2 rounded cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none w-full cursor-pointer"
                      >
                        {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    )}
                    <button 
                      type="button"
                      onClick={() => setShowCategoryInput(!showCategoryInput)}
                      className="bg-stone-100 border border-stone-200 text-stone-600 px-2.5 py-2.5 rounded hover:bg-stone-200 cursor-pointer"
                    >
                      {showCategoryInput ? 'Cancel' : '+ New'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Standard Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 799"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Discount Price Option (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 699"
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Physical Weight (grams) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 250"
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Available Stock Inventory *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-6 col-span-1 sm:col-span-2 py-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={prodFeatured}
                      onChange={(e) => setProdFeatured(e.target.checked)}
                      className="h-4 w-4 rounded text-[#6B2D0E] accent-[#E8820C] cursor-pointer"
                    />
                    <label className="text-[10px] font-bold uppercase text-stone-500">Feature on Home Slider</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={prodActive}
                      onChange={(e) => setProdActive(e.target.checked)}
                      className="h-4 w-4 rounded text-[#6B2D0E] accent-[#E8820C] cursor-pointer"
                    />
                    <label className="text-[10px] font-bold uppercase text-stone-500">Active Live Visibility</label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                  <div className="flex justify-between items-center bg-[#52220A]/10 border border-[#D4B896]/40 p-2.5 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-[#6B2D0E]">Attached Local Images</span>
                    <span className="text-[10px] bg-[#6B2D0E] text-white px-2 py-0.5 rounded font-mono font-bold">
                      {prodImages.length} Linked
                    </span>
                  </div>

                  {/* High quality local thumbnail list */}
                  <div className="flex flex-wrap gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg min-h-[50px] items-center">
                    {prodImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded border border-[#D4B896] overflow-hidden group shadow-sm shrink-0">
                        <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => {
                            setProdImages(prev => prev.filter((_, i) => i !== idx));
                            setProdImagePublicIds(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center text-[8px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {prodImages.length === 0 && (
                      <span className="text-[11px] text-stone-400 italic">No images currently selected. Upload or drag-and-drop local files below.</span>
                    )}
                  </div>
                  
                  {/* MANUAL FILE UPLOAD INTEGRATION WITH LOCAL STORAGE */}
                  <div className="mt-2 border border-dashed border-[#D4B896]/30 bg-amber-50/10 p-3.5 rounded-xl flex flex-col items-center justify-center transition-all">
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`w-full py-4 px-2 text-center flex flex-col items-center justify-center cursor-pointer transition-colors rounded-lg border border-dashed ${
                        dragActive ? "border-[#E8820C] bg-[#F5EFE6]" : "border-stone-200 hover:border-[#D4B896] bg-stone-50/40"
                      }`}
                      onClick={() => document.getElementById('manual-image-uploader')?.click()}
                    >
                      <input 
                        type="file" 
                        id="manual-image-uploader" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageFileUpload(e.target.files)}
                      />
                      <Upload size={20} className="text-[#6B2D0E] mb-2" />
                      <p className="text-xs font-semibold text-[#6B2D0E]">
                        {isUploadingImage ? "Processing image file..." : "Drag & Drop Image or Click to Browse"}
                      </p>
                      <span className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider">JPG, PNG, WEBP (Auto-compressed for local storage)</span>
                    </div>

                    {/* RECENT LOCAL STORAGE VAULT ITEMS */}
                    {localSavedImages.length > 0 && (
                      <div className="w-full mt-3 pt-3 border-t border-stone-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] uppercase font-black tracking-widest text-[#6B2D0E]">Recently Uploaded (Click to Toggle Select)</span>
                          <button 
                            type="button"
                            onClick={clearAllLocalImages} 
                            className="text-[9px] text-red-600 hover:text-red-800 font-bold hover:underline"
                          >
                            Clear Gallery
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-[#F5EFE6]/30 rounded-lg">
                          {localSavedImages.map((img) => {
                            const isSelected = prodImages.includes(img.dataUrl);
                            return (
                              <div 
                                key={img.id} 
                                className={`relative group aspect-square rounded overflow-hidden border cursor-pointer transition-all hover:scale-105 ${
                                  isSelected ? "border-amber-600 ring-2 ring-amber-500" : "border-stone-200"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (isSelected) {
                                    // Remove from prodImages
                                    setProdImages(prev => prev.filter(p => p !== img.dataUrl));
                                  } else {
                                    // Add to prodImages
                                    setProdImages(prev => [...prev, img.dataUrl]);
                                  }
                                }}
                              >
                                <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={(e) => deleteRecentLocalImage(img.id, e)}
                                    className="p-1 bg-red-600 hover:bg-red-800 rounded-full text-white cursor-pointer duration-150 transition-colors"
                                    title="Delete from local uploads history"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-0.5 right-0.5 bg-amber-600 text-white rounded-full p-0.5">
                                    <Check size={8} className="stroke-[3]" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Vedic SEO Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. pure, traditional cow घी, organic"
                    value={prodTags}
                    onChange={(e) => setProdTags(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Product Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe traditional ingredients, benefits of handchurned Vedic processing..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/70 p-2.5 rounded focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold py-3.5 rounded-full shadow transition-all duration-150 uppercase tracking-wider text-xs cursor-pointer mt-4"
              >
                Save Catalog Records
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OFFERS / COUPON DRAWER MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4B896] rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 text-xs animate-scale-up">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-serif font-black text-[#6B2D0E]">{editingCoupon ? 'Edit Discount Code' : 'Log New Discount Coupon'}</h2>
                <span className="text-[9px] text-stone-400 uppercase tracking-widest font-black">PROMOTIONS ENGINE</span>
              </div>
              <button onClick={() => setShowCouponModal(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer"><X size={14} /></button>
            </div>

            <form onSubmit={handleSaveCoupon} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Sacred Coupon Code *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. GODHARA10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-mono font-bold select-all uppercase"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Reward Reward Type</label>
                <select 
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none cursor-pointer"
                >
                  <option value="PERCENTAGE">PERCENTAGE RATE DISCOUNTS (%)</option>
                  <option value="FLAT">FLAT REDUCTION MONEY (₹)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Discount absolute Value *</label>
                <input 
                  type="number"
                  required
                  placeholder={couponType === 'PERCENTAGE' ? 'e.g. 10 (%)' : 'e.g. 100 (₹)'}
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-mono font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Min Cart total Required (₹)</label>
                <input 
                  type="number"
                  placeholder="e.g. 500"
                  value={couponMinOrder}
                  onChange={(e) => setCouponMinOrder(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Max limit uses allowed</label>
                <input 
                  type="number"
                  placeholder="e.g. 100"
                  value={couponMaxUses}
                  onChange={(e) => setCouponMaxUses(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Expiry Threshold Date</label>
                <input 
                  type="date"
                  value={couponExpiry}
                  onChange={(e) => setCouponExpiry(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox"
                  checked={couponActive}
                  onChange={(e) => setCouponActive(e.target.checked)}
                  className="h-4 w-4 rounded text-[#6B2D0E] accent-[#E8820C]"
                />
                <label className="text-[10px] font-bold uppercase text-stone-500">Active live Promotion</label>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white py-3 rounded-full text-xs font-bold uppercase cursor-pointer transition-colors mt-2"
              >
                Commit Coupon Promotion
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4B896] rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 text-xs animate-scale-up">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-serif font-black text-[#6B2D0E]">Edit Traditional Profile</h2>
                <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">CLIENT LOG AMENDMENTS</span>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer"><X size={14} /></button>
            </div>

            <form onSubmit={handleSaveCustomerDetails} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Recipient / Client Name *</label>
                <input 
                  type="text"
                  required
                  placeholder=""
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-semibold text-[#2C1810]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Contact Number Phone *</label>
                <input 
                  type="text"
                  required
                  placeholder=""
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-sans font-semibold text-stone-600"
                />
              </div>

              <p className="border-b border-dotted border-stone-100 pb-0.5 mt-2 font-bold text-stone-400 uppercase text-[9px]">Mailing Destination</p>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Street Name & landmarks *</label>
                <input 
                  type="text"
                  required
                  placeholder=""
                  value={custStreet}
                  onChange={(e) => setCustStreet(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none text-stone-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400">City *</label>
                  <input 
                    type="text"
                    required
                    placeholder=""
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none text-stone-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400">State *</label>
                  <input 
                    type="text"
                    required
                    placeholder=""
                    value={custState}
                    onChange={(e) => setCustState(e.target.value)}
                    className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none text-stone-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Pincode *</label>
                <input 
                  type="text"
                  required
                  placeholder=""
                  value={custPincode}
                  onChange={(e) => setCustPincode(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/60 p-2.5 rounded focus:outline-none font-mono font-bold text-[#6B2D0E]"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white py-3 rounded-full text-xs font-bold uppercase cursor-pointer transition-colors mt-2"
              >
                Commit Profile log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM STATUS TOASTS */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[100] p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-bounce ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

    </div>
  );
}
