import React, { useState, useEffect, useRef } from 'react';
import {
  CupSoda,
  KeyRound,
  Sparkles,
  Layers,
  Disc,
  IdCard,
  Shirt,
  RectangleEllipsis,
  ShoppingBag,
  WalletCards,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Lock,
  Plus,
  Trash2,
  Upload,
  CreditCard,
  Building,
  QrCode,
  ArrowRight,
  Info,
  Clock,
  Calendar,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Check,
  RefreshCw,
  AlertCircle,
  Smartphone
} from 'lucide-react';

import { SUBLIMATION_PRODUCTS, PAYMENT_METHODS, INITIAL_ORDERS } from './data';
import { SublimationProduct, SublimationOrder, DesignUpload, OrderStatus, CartItem } from './types';

export default function App() {
  // State management with localStorage persistence for rich prototype experience
  const [orders, setOrders] = useState<SublimationOrder[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SublimationProduct | null>(null);
  const [waNumber, setWaNumber] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [designs, setDesigns] = useState<DesignUpload[]>([]);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('qris');
  
  // App views
  const [currentTab, setCurrentTab] = useState<'checkout' | 'cek-pesanan' | 'admin'>('checkout');
  
  // Tracking search state
  const [searchWa, setSearchWa] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SublimationOrder[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [trackingLoading, setTrackingLoading] = useState<boolean>(false);

  // Admin access state
  const [isAdminLogged, setIsAdminLogged] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<string>('');
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('Semua');
  const [adminSearchTerm, setAdminSearchTerm] = useState<string>('');
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<SublimationOrder | null>(null);

  // Image upload loading indicator
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);
  
  // Success order card state
  const [recentOrderSuccess, setRecentOrderSuccess] = useState<SublimationOrder | null>(null);

  // Auto-scroll target references
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  // Load and sync orders database in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('blimcast_orders');
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        setOrders(INITIAL_ORDERS);
      }
    } else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('blimcast_orders', JSON.stringify(INITIAL_ORDERS));
    }
  }, []);

  const saveOrdersToLocalStorage = (updatedOrders: SublimationOrder[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('blimcast_orders', JSON.stringify(updatedOrders));
  };

  // Dynamically map icon names to Lucide icons
  const renderProductIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'CupSoda': return <CupSoda className={className} />;
      case 'KeyRound': return <KeyRound className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Disc': return <Disc className={className} />;
      case 'IdCard': return <IdCard className={className} />;
      case 'Shirt': return <Shirt className={className} />;
      case 'RectangleEllipsis': return <RectangleEllipsis className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'WalletCards': return <WalletCards className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Helper payment icon switch
  const renderPaymentIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'QrCode': return <QrCode className={className} />;
      case 'Building': return <Building className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      default: return <CreditCard className={className} />;
    }
  };

  // Auto scroll helpers
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Form handle upload image (Base64 conversion for prototype storage)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    const uploadedList: DesignUpload[] = [...designs];
    let loadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onloadend = () => {
        uploadedList.push({
          id: 'img-' + Math.random().toString(36).substring(2, 9),
          fileName: file.name,
          previewUrl: reader.result as string, // Real local thumbnail
          notes: '' // Individual notes for this image
        });

        loadedCount++;
        if (loadedCount === files.length) {
          setDesigns(uploadedList);
          setUploadLoading(false);
          // Highlight transition to quantities if we have designs
          if (quantity === 0 && selectedProduct) {
            setQuantity(selectedProduct.minOrder);
          }
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // NEW: Cart-based handlers
  const handleProductSelect = (product: SublimationProduct) => {
    setSelectedProduct(product);
    setCart(prev => {
      const match = prev.find(item => item.product.id === product.id);
      if (match) return prev; // already selected/in cart
      return [...prev, {
        id: product.id,
        product,
        quantity: product.minOrder,
        designs: []
      }];
    });
    scrollTo(step2Ref);
  };

  const adjustCartItemQuantity = (productId: string, val: number) => {
    setCart(prev => {
      const match = prev.find(item => item.product.id === productId);
      if (!match) return prev;
      const nextVal = match.quantity + val;
      if (nextVal <= 0 || (val < 0 && match.quantity === match.product.minOrder)) {
        // Remove from cart if reduced below minOrder
        return prev.filter(item => item.product.id !== productId);
      }
      return prev.map(item => item.product.id === productId ? { ...item, quantity: nextVal } : item);
    });
  };

  const handleImageChangeForCartItem = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    const readerPromises = Array.from(files).map((rawFile) => {
      const file = rawFile as File;
      return new Promise<DesignUpload>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: 'img-' + Math.random().toString(36).substring(2, 9),
            fileName: file.name,
            previewUrl: reader.result as string,
            notes: ''
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readerPromises).then((newDesigns) => {
      setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, designs: [...item.designs, ...newDesigns] };
        }
        return item;
      }));
      setUploadLoading(false);
    });
  };

  const removeDesignFromCartItem = (productId: string, designId: string) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, designs: item.designs.filter(d => d.id !== designId) };
      }
      return item;
    }));
  };

  const updateDesignNoteForCartItem = (productId: string, designId: string, notes: string) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          designs: item.designs.map(d => d.id === designId ? { ...d, notes } : d)
        };
      }
      return item;
    }));
  };

  // Calculations based on full multi-product cart
  const calculatedSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  const getDiscountForQty = (qty: number) => {
    return qty >= 100 ? 0.15 : qty >= 50 ? 0.10 : qty >= 20 ? 0.05 : 0;
  };

  const discountAmount = cart.reduce((acc, item) => {
    const sub = item.product.price * item.quantity;
    const rate = getDiscountForQty(item.quantity);
    return acc + Math.round(sub * rate);
  }, 0);

  const paymentFee = PAYMENT_METHODS.find(p => p.id === selectedPayment)?.fee || 0;
  const finalTotalPrice = Math.max(0, calculatedSubtotal - discountAmount + paymentFee);

  // Handle Order Submit
  // Handle Order Submit
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Keranjang belanja Anda kosong. Silakan pilih produk terlebih dahulu.');
      return;
    }

    if (!waNumber || waNumber.trim().length < 9) {
      alert('Harap masukkan nomor WhatsApp yang valid (minimal 9 digit).');
      return;
    }

    // Ensure all items in the cart have at least 1 design uploaded
    const missingDesign = cart.find(item => item.designs.length === 0);
    if (missingDesign) {
      alert(`Harap unggah minimal 1 file gambar desain untuk produk: ${missingDesign.product.name}`);
      return;
    }

    setOrderSubmitting(true);

    // Format WhatsApp number to standard Indonesian layout
    let formattedWa = waNumber.trim().replace(/[^0-9]/g, '');
    if (formattedWa.startsWith('62')) {
      formattedWa = '0' + formattedWa.slice(2);
    } else if (formattedWa.startsWith('+62')) {
      formattedWa = '0' + formattedWa.slice(3);
    }

    const newOrderId = 'BLM-' + Math.floor(10000 + Math.random() * 90000).toString();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: SublimationOrder = {
      id: newOrderId,
      waNumber: formattedWa,
      items: cart,
      totalPrice: finalTotalPrice,
      notes: generalNotes,
      orderDate: formattedDate,
      status: 'Menunggu Pembayaran',
      paymentMethod: selectedPayment,
      
      // Fallback fields for legacy compatibility
      product: cart[0].product,
      quantity: cart[0].quantity,
      designs: cart[0].designs
    };

    setTimeout(() => {
      const updatedList = [newOrder, ...orders];
      saveOrdersToLocalStorage(updatedList);
      
      // Save current order success to show screen
      setRecentOrderSuccess(newOrder);
      setOrderSubmitting(false);

      // Reset fields for next orders
      setCart([]);
      setSelectedProduct(null);
      setQuantity(0);
      setDesigns([]);
      setGeneralNotes('');
      
      // Automatically scroll to very top success window
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  // Handle Track Orders (WA Check)
  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWa || searchWa.trim().length < 8) {
      alert('Harap masukkan nomor WhatsApp yang terdaftar.');
      return;
    }

    setTrackingLoading(true);
    let target = searchWa.trim().replace(/[^0-9]/g, '');
    if (target.startsWith('62')) {
      target = '0' + target.slice(2);
    }

    setTimeout(() => {
      const found = orders.filter(o => {
        const orderWaClean = o.waNumber.replace(/[^0-9]/g, '');
        return orderWaClean.includes(target) || target.includes(orderWaClean);
      });
      setSearchResults(found);
      setHasSearched(true);
      setTrackingLoading(false);
    }, 800);
  };

  // Simple Admin Login PIN Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // PIN hardcoded as MVP credential
    if (adminPinInput === '1234') {
      setIsAdminLogged(true);
      setAdminPinError('');
    } else {
      setAdminPinError('PIN salah! Gunakan PIN demo "1234".');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLogged(false);
    setAdminPinInput('');
    setSelectedAdminOrder(null);
  };

  // Admin update order status
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    saveOrdersToLocalStorage(updated);
    if (selectedAdminOrder && selectedAdminOrder.id === orderId) {
      setSelectedAdminOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    
    // Auto sync search tracker results if same order was inspected
    if (hasSearched) {
      setSearchResults(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  // Simulated DB seeding
  const handleResetDemoData = () => {
    saveOrdersToLocalStorage(INITIAL_ORDERS);
    setSelectedAdminOrder(null);
    alert('Database prototipe berhasil di-reset ke data bawaan!');
  };

  // Helper to compose dynamic WA API message links
  const getWhatsAppMessageLink = (order: SublimationOrder) => {
    let itemsText = '';
    if (order.items && order.items.length > 0) {
      itemsText = order.items.map((item, index) => 
        `- *Item #${index + 1}:* ${item.product.name} (${item.quantity} ${item.product.unit}) / ${item.designs.length} Desain`
      ).join('\n');
    } else {
      const prodName = order.product?.name || 'Produk';
      const prodUnit = order.product?.unit || 'unit';
      const designCount = order.designs?.length || 0;
      itemsText = `- *Item:* ${prodName} (${order.quantity} ${prodUnit}) / ${designCount} Desain`;
    }

    const text = `Halo Admin Blimcast, saya mau konfirmasi pesanan kustom sublimasi saya.
    
📌 *ID PESANAN:* ${order.id}
${itemsText}
💵 *TOTAL TAGIHAN:* Rp ${order.totalPrice.toLocaleString('id-ID')}
📱 *NOMOR WA:* ${order.waNumber}
💳 *METODE:* ${PAYMENT_METHODS.find(p => p.id === order.paymentMethod)?.name || order.paymentMethod}
📦 *STATUS:* ${order.status}

Saya sudah mengunggah desain lewat platform Blimcast, mohon bantu cek file desain & instruksinya untuk segera dicetak. Terimakasih!`;

    return `https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(text)}`;
  };

  // Filter and search orders in Admin Dashboard
  const filteredOrders = orders.filter(order => {
    const matchesStatus = adminFilterStatus === 'Semua' || order.status === adminFilterStatus;
    
    const itemMatchesKeyword = order.items?.some(item => 
      item.product.name.toLowerCase().includes(adminSearchTerm.toLowerCase())
    ) || false;

    const legacyMatchesKeyword = order.product?.name?.toLowerCase().includes(adminSearchTerm.toLowerCase()) || false;

    const matchesKeyword = 
      order.waNumber.includes(adminSearchTerm) || 
      order.id.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      itemMatchesKeyword ||
      legacyMatchesKeyword;

    return matchesStatus && matchesKeyword;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* GLOW DECORATIONS IN TOP-UP PORTAL STYLE */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentTab('checkout'); setRecentOrderSuccess(null); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400 text-xl tracking-wider">
                B
              </div>
            </div>
            <div>
              <h1 id="logo-title" className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-rose-300 bg-clip-text text-transparent">
                BLIMCAST
              </h1>
              <p className="text-[10px] text-indigo-400/80 font-mono tracking-widest uppercase">Sublimasi Instant</p>
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav className="flex items-center gap-1 md:gap-2">
            <button
              id="nav-checkout"
              onClick={() => { setCurrentTab('checkout'); setRecentOrderSuccess(null); }}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                currentTab === 'checkout'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pesan</span>
            </button>

            <button
              id="nav-cek-pesanan"
              onClick={() => { setCurrentTab('cek-pesanan'); setRecentOrderSuccess(null); }}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                currentTab === 'cek-pesanan'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek Pesanan</span>
            </button>

            <button
              id="nav-admin"
              onClick={() => { setCurrentTab('admin'); setRecentOrderSuccess(null); }}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Hero Announcement & Fast Stats for Game Top-up site feeling */}
      {currentTab === 'checkout' && !recentOrderSuccess && (
        <section className="bg-slate-900 border-b border-slate-800/60 py-8 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="max-w-xl text-center md:text-left">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 text-indigo-300 text-[11px] font-mono font-bold tracking-wider uppercase rounded-full border border-indigo-500/25">
                ⚡ Pembuatan Kilat & Tanpa Login Muter-Muter
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-4 tracking-tight leading-tight">
                Cetak Produk Sublimasi <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-rose-300">
                  Desain Kustom Sesamamu!
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg">
                Pilih produk sublim terbaik, unggah gambar dari galeri HP, bayar otomatis via QRIS. Status pesanan dapat dipantau real-time cukup dengan nomor WhatsApp.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-md border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Produksi Aktif</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-md border border-slate-800">
                  <span>⚡ Respon & Setup Kilat</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-md border border-slate-800">
                  <span>✨ Min. Order Rendah</span>
                </div>
              </div>
            </div>

            {/* Simulated Fast Promo Card */}
            <div className="w-full md:w-80 bg-gradient-to-b from-indigo-950/60 to-slate-950/80 p-5 rounded-2xl border border-indigo-500/25 relative flex flex-col justify-between shadow-2xl">
              <div className="absolute top-2 right-2 bg-rose-500 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Grosir Promo
              </div>
              <div>
                <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase">Diskon Spesial Hari Ini</p>
                <h3 className="text-lg font-bold text-slate-100 mt-1">Sublimasi Hemat Meriah</h3>
                <p className="text-xs text-slate-400 mt-2">Dapatkan potongan otomatis hingga <span className="text-indigo-300 font-bold">15% OFF</span> untuk pemesanan diatas 100 pcs untuk semua menu merchandise.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Grosir 20 pcs+:</span>
                <span className="text-rose-400 font-semibold bg-rose-950/50 px-2 py-0.5 rounded">Diskon 5%</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Grosir 50 pcs+:</span>
                <span className="text-rose-400 font-semibold bg-rose-950/50 px-2 py-0.5 rounded">Diskon 10%</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CORE WRAPPER */}
      <main className="max-w-6xl mx-auto px-4 mt-8">

        {/* ========================================================= */}
        {/* VIEW 1: RECENT ORDER SUCCESS (SINGLE PAGE SUCCESS WINDOW) */}
        {/* ========================================================= */}
        {recentOrderSuccess && (
          <div className="max-w-2xl mx-auto bg-slate-900 rounded-3xl border-2 border-emerald-500/40 p-6 md:p-8 relative overflow-hidden shadow-2xl animate-fade-in">
            {/* Success sparkles decor */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">PESANAN BERHASIL DIBUAT!</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Silakan lakukan pembayaran dan hubungi Admin lewat WhatsApp untuk segera diproses cetak.
              </p>
            </div>

            {/* Invoice card content */}
            <div className="mt-8 bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
                <div>
                  <span className="text-xs text-slate-500 font-mono uppercase">ID Pesanan</span>
                  <p className="text-base font-mono font-bold text-indigo-400">{recentOrderSuccess.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-mono uppercase">Tanggal</span>
                  <p className="text-xs text-slate-300 font-mono">{recentOrderSuccess.orderDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Status Pembayaran:</span>
                  <span className="px-2 py-1 rounded-md font-bold text-[10px] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    {recentOrderSuccess.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Nomor Pelacakan (WA):</span>
                  <span className="font-mono font-semibold text-slate-300">{recentOrderSuccess.waNumber}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-850 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Produk:</span>
                  <span className="text-white font-medium">{recentOrderSuccess.product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah / Kuantitas:</span>
                  <span className="text-white font-semibold font-mono">{recentOrderSuccess.quantity} {recentOrderSuccess.product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unggahan Gambar:</span>
                  <span className="text-indigo-400 font-semibold font-mono">{recentOrderSuccess.designs.length} Desain</span>
                </div>
                <div className="flex justify-between pt-1 font-mono">
                  <span className="text-slate-400">Biaya Administrasi:</span>
                  <span className="text-slate-300">
                    Rp {(PAYMENT_METHODS.find(p => p.id === recentOrderSuccess.paymentMethod)?.fee || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-slate-800 text-base font-bold">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300">Total Pembayaran:</span>
                  <span className="text-indigo-400 font-mono">Rp {recentOrderSuccess.totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* MOCK QRIS GENERATOR IF TARGETED PAYMENT IS QRIS */}
            {recentOrderSuccess.paymentMethod === 'qris' ? (
              <div className="mt-6 bg-white p-5 rounded-2xl flex flex-col items-center justify-center text-slate-950 space-y-2 shadow-xl border border-slate-300">
                <div className="text-center font-bold font-mono tracking-wider text-sm mb-1 uppercase text-slate-800">
                  SCAN QRIS BLIMCAST
                </div>
                {/* Dynamically Styled Vector Simulated QRIS layout */}
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center p-2 relative border-4 border-slate-800">
                  <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center text-white relative">
                    <QrCode className="w-36 h-36 text-white" />
                    <span className="absolute bottom-1 right-1 text-[7px] text-emerald-400 font-mono font-bold uppercase">SECURE-DEV</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 text-center font-mono max-w-sm mt-1">
                  Pindai QRIS di atas memakai dompet digital pilihan Anda (Gopay, OVO, Dana, Shopee, LinkAja, atau m-Banking).
                  Selesai bayar? Simpan bukti transfer & kirim ke WhatsApp Admin berikut!
                </div>
              </div>
            ) : (
              <div className="mt-6 bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
                <p className="text-xs font-mono text-indigo-300 uppercase tracking-widest font-bold">REKENING TRANSFER BANK</p>
                
                {recentOrderSuccess.paymentMethod === 'bca' && (
                  <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-800/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500">BANK BCA (MANUAL)</p>
                      <p className="text-base font-mono font-black text-white">88021-9988-12</p>
                      <p className="text-xs text-slate-400 mt-1">A/N CV BLIMCAST SUBLIMASI INDONESIA</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-500/15 px-2 py-1 rounded">BCA</span>
                  </div>
                )}

                {recentOrderSuccess.paymentMethod === 'mandiri' && (
                  <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-800/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500">BANK MANDIRI (MANUAL)</p>
                      <p className="text-base font-mono font-black text-white">13700-12003-456</p>
                      <p className="text-xs text-slate-400 mt-1">A/N CV BLIMCAST SUBLIMASI INDONESIA</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-500/15 px-2 py-1 rounded">MANDIRI</span>
                  </div>
                )}

                {recentOrderSuccess.paymentMethod === 'virtual_account' && (
                  <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-800/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500">VIRTUAL ACCOUNT (OTOMATIS)</p>
                      <p className="text-base font-mono font-black text-rose-400">9088-0812-3456-7890</p>
                      <p className="text-xs text-slate-400 mt-1">Sisa Waktu Pembayaran: <span className="text-rose-400 font-bold font-mono">23:59:50</span></p>
                    </div>
                    <span className="text-xs text-rose-400 font-mono font-bold bg-rose-500/15 px-2 py-1 rounded">V.A</span>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 font-mono text-center">
                  Harap transfer sesuai dengan total nominal <span className="text-indigo-400 font-bold">Rp {recentOrderSuccess.totalPrice.toLocaleString('id-ID')}</span> agar sistem dapat memvalidasi cepat.
                </p>
              </div>
            )}

            {/* CALL ACTION FOR WHATSAPP INTEGRATION - CRITICAL OUTSIDE INTEGRATION COMMENTED ACCORDINGLY */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={getWhatsAppMessageLink(recentOrderSuccess)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-bold transition-all flex items-center justify-center gap-2 text-center text-sm cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-white/20" />
                <span>Kirim Bukti Pembayaran Ke WA</span>
              </a>
              <button
                onClick={() => {
                  setRecentOrderSuccess(null);
                  setCurrentTab('cek-pesanan');
                  setSearchWa(recentOrderSuccess.waNumber);
                  setSearchResults([recentOrderSuccess]);
                  setHasSearched(true);
                }}
                className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all text-xs md:text-sm text-center"
              >
                Pantau Status Pesanan Ini
              </button>
            </div>

            {/* Developer Backend Suggestion Box */}
            <div className="mt-8 p-3 bg-slate-950/80 rounded-xl border border-dashed border-slate-800 text-[11px] text-slate-500 leading-relaxed font-mono">
              <span className="text-indigo-400 font-bold">💻 Note Integrasi Backend:</span> Di atas adalah data simulasi formulir sukses. Di backend asli, letakkan Webhook API Telegram atau Jasa WhatsApp API (seperti Wablas / Fonnte) untuk mengirimkan notifikasi instan berupa QRIS & rekap orderan langsung ke nomor WhatsApp pembeli sesaat setelah klik tombol pesan.
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SINGLE-PAGE CHECKOUT FLOW (MAIN Tab) */}
        {/* ========================================================= */}
        {currentTab === 'checkout' && !recentOrderSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: THE STEP STEPPERS (8 COLS FOR RICH CHECKOUT) */}
            <div className="space-y-8 lg:col-span-8">
              
              {/* STEP 1: CUSTOMER WA IDENTIFICATION */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden relative shadow-xl">
                
                {/* Visual Step Banner Indicator */}
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-6 py-4 border-b border-slate-800/60 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-500/70 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shadow-inner">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm tracking-wide uppercase">Langkah 1: Hubungi Via WhatsApp</h3>
                    <p className="text-xs text-slate-400">Gunakan nomor WhatsApp aktif Anda sebagai ID pelacakan pesanan tanpa akun.</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono uppercase tracking-wider">
                      Nomor WhatsApp Anda <span className="text-rose-500 text-sm">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400 font-bold font-mono text-sm border-r border-slate-800 pr-3">
                        +62 (ID)
                      </div>
                      <input
                        type="text"
                        value={waNumber}
                        onChange={(e) => setWaNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="contoh: 81234567890 (Tanpa angka 0 atau +62 di depan)"
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-4 pl-28 pr-4 text-sm font-mono tracking-widest placeholder-slate-600 transition-all outline-none"
                        required
                      />
                    </div>
                    
                    {/* Prompt notification message below WA */}
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Sistem otomatis melacak status pesanan Anda. Pastikan nomor benar agar admin bisa konfirmasi hasil desain.</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* STEP 2: SELECT CUSTOM PRODUCTS */}
              <div id="step-products" className="bg-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden relative shadow-xl">
                
                {/* Visual Step Banner Indicator */}
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-6 py-4 border-b border-slate-800/60 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-500/70 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shadow-inner">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-white text-sm tracking-wide uppercase">Langkah 2: Pilih Produk Sublimasi</h3>
                    <p className="text-xs text-slate-400">Tentukan jenis merchandise kustom yang akan diproduksi.</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Grid 10 Products Ala Portal Top-up */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {SUBLIMATION_PRODUCTS.map((product, idx) => {
                      const cartItem = cart.find(item => item.product.id === product.id);
                      const isSelected = !!cartItem;
                      
                      return (
                        <div
                          id={`product-${product.id}`}
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className={`group cursor-pointer rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                              : 'bg-slate-950/80 border-slate-850 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          {/* Selected marker glow badge */}
                          {isSelected && (
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white px-2 py-0.5 rounded-bl-xl text-[9px] font-mono font-black animate-pulse z-10">
                              TERPILIH
                            </div>
                          )}

                          {/* Beautiful full-width product mockup image scaling on hover */}
                          <div className="w-full h-32 overflow-hidden rounded-xl bg-slate-950 mb-3 border border-slate-900 relative group-hover:border-indigo-500/40 transition-all">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {/* Floating numbering badge */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[9px] text-indigo-400 font-mono font-bold border border-slate-800/80">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                          </div>

                          {/* Quantity selectors directly under the image card */}
                          {isSelected && cartItem && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="my-2 bg-slate-900/80 rounded-xl p-1.5 border border-indigo-500/40 flex items-center justify-between"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adjustCartItemQuantity(product.id, -1);
                                }}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs flex items-center justify-center transition-all select-none"
                              >
                                -
                              </button>
                              <div className="font-mono font-bold text-white text-[11px] flex-1 text-center">
                                {cartItem.quantity} <span className="text-[8px] text-slate-500 uppercase">{product.unit}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adjustCartItemQuantity(product.id, 1);
                                }}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs flex items-center justify-center transition-all select-none"
                              >
                                +
                              </button>
                            </div>
                          )}

                          <div className="mt-2 text-center md:text-left">
                            <h4 className="text-sm font-black text-slate-100 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium font-mono mt-1">
                              Mulai Rp {product.price.toLocaleString('id-ID')} <span className="text-[9px] text-slate-500">/{product.unit}</span>
                            </p>
                          </div>

                          {/* Info Badge */}
                          <div className="mt-3 flex items-center justify-between text-[9px]">
                            <span className={`px-1.5 py-0.5 rounded font-mono ${product.badgeColor}`}>
                              ⏱️ {product.estimatedTime}
                            </span>
                            <span className="text-slate-500">Min: {product.minOrder} {product.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Informational Card showing selected product description */}
                  {selectedProduct && (
                    <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-3 animate-fade-in">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{selectedProduct.name}</span>
                          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                            Rp {selectedProduct.price.toLocaleString('id-ID')}/{selectedProduct.unit}
                          </span>
                        </h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {selectedProduct.description}
                        </p>
                        <p className="text-[10px] text-rose-400 mt-1 font-mono font-bold uppercase tracking-wider">
                          ⚠️ Batas Minimal Pemesanan: {selectedProduct.minOrder} {selectedProduct.unit}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* STEP 3: DATA DESIGN UPLOADS (REFS STACK) */}
              <div ref={step2Ref} className="bg-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden relative shadow-xl">
                
                {/* Visual Step Banner Indicator */}
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-6 py-4 border-b border-slate-800/60 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-500/70 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shadow-inner">
                    3
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm tracking-wide uppercase">Langkah 3: Unggah Desain & Catatan Detil</h3>
                    <p className="text-xs text-slate-400">Mendukung multi-file upload & anotasi instruksi cetak per item kustom.</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {cart.length > 0 ? (
                    <div className="space-y-6">
                      {cart.map((cartItem, itemIdx) => (
                        <div key={cartItem.product.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                          
                          {/* Cart item title bar */}
                          <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-900">
                              <img src={cartItem.product.imageUrl} alt={cartItem.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono font-bold uppercase tracking-wide">Produk #{itemIdx + 1}</span>
                              <h4 className="text-xs font-black text-white uppercase tracking-wider mt-0.5">{cartItem.product.name}</h4>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-indigo-400 font-mono">{cartItem.quantity} <span className="text-[10px] text-slate-500">{cartItem.product.unit}</span></p>
                              <span className="text-[9px] text-slate-500 font-mono">Batas Min: {cartItem.product.minOrder}</span>
                            </div>
                          </div>

                          {/* Upload element for this specific cart product */}
                          <div className="border-2 border-dashed border-slate-900 hover:border-indigo-500/40 bg-slate-900/40 rounded-xl p-5 text-center relative transition-all group">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleImageChangeForCartItem(cartItem.product.id, e)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            
                            <div className="flex flex-col items-center justify-center space-y-2 z-0 relative">
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                {uploadLoading ? (
                                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Upload className="w-5 h-5" />
                                )}
                              </div>
                              
                              <div>
                                <p className="text-xs font-bold text-slate-300">
                                  Pilih Gambar Desain Cetak {cartItem.product.name}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Format png, jpg, jpeg. Bisa upload banyak desain.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Previews for this cart item */}
                          {cartItem.designs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                              {cartItem.designs.map((design, dIdx) => (
                                <div key={design.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 flex flex-col space-y-2">
                                  <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                                      <img src={design.previewUrl} alt={design.fileName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-bold text-slate-300 truncate font-mono">{design.fileName}</p>
                                      <p className="text-[9px] text-slate-500">Slot Gambar #{dIdx + 1}</p>
                                      <button
                                        type="button"
                                        onClick={() => removeDesignFromCartItem(cartItem.product.id, design.id)}
                                        className="text-[9px] text-rose-500 hover:text-rose-400 font-mono mt-0.5 flex items-center gap-1 cursor-pointer"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" /> Hapus File
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold text-indigo-400 uppercase font-mono tracking-wider mb-1">Catatan instruksi khusus cetak:</label>
                                    <textarea
                                      value={design.notes}
                                      onChange={(e) => updateDesignNoteForCartItem(cartItem.product.id, design.id, e.target.value)}
                                      placeholder="misal: Taruh logo di sisi depan-belakang gelas."
                                      rows={2}
                                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 text-slate-200 text-[11px] rounded p-1.5 outline-none resize-none font-sans"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-500/5 text-amber-400 border border-amber-500/10 rounded-xl text-[10px] text-center font-mono">
                              ⚠️ Belum ada file desain kustom terunggah untuk produk ini.
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-950/50 rounded-2xl border border-slate-850 text-center text-xs text-slate-500 space-y-2">
                      <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto animate-bounce" />
                      <div>
                        <p className="text-sm font-bold text-slate-300">Harap Pilih Produk Terlebih Dahulu</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Silakan ketuk produk sublimasi pada Langkah 2 untuk menambahkannya ke keranjang checkout.</p>
                      </div>
                    </div>
                  )}

                  {/* General Order Notes Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2">
                      Catatan Tambahan Untuk Admin (Opsional)
                    </label>
                    <textarea
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder="Tuliskan jika ada permintaan ukuran khusus, paket pelindung ekspedisi atau catatan finishing."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl p-3 text-xs outline-none transition-all"
                    />
                  </div>

                  {/* Cloud Storage integration notice comment box */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px] text-slate-500 font-mono">
                    <span className="text-rose-400 font-bold">📂 Tip Deployment:</span> Di sistem backend ril, input upload di atas akan mengirimkan blob ke endpoint server, yang mana selanjutnya diunggah otomatis ke Cloud Storage (seperti AWS S3 atau Google Cloud Storage buckets). Url CDN publik yang didapatkan lalu disimpan ke database.
                  </div>

                </div>

              </div>

              {/* STEP 4: PAYMENT OPTIONS SELECT */}
              <div ref={step3Ref} className="bg-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden relative shadow-xl">
                
                {/* Visual Step Banner Indicator */}
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-6 py-4 border-b border-slate-800/60 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-500/70 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shadow-inner">
                    4
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm tracking-wide uppercase">Langkah 4: Pilih Metode Pembayaran</h3>
                    <p className="text-xs text-slate-400">Selesaikan transaksi menggunakan metode pembayaran langsung terpilih.</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedPayment === method.id;
                      
                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-950/80 to-slate-950/80 border-indigo-500 text-white shadow-lg'
                              : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500'
                            }`}>
                              {renderPaymentIcon(method.icon, "w-5 h-5")}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-100">{method.name}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Biaya Admin: {method.fee === 0 ? 'Gratis' : `Rp ${method.fee.toLocaleString('id-ID')}`}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: SINGLE-PAGE ESTIMATION & ACTIONS CHECKOUT PANEL */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              
              <div className="bg-slate-900 rounded-3xl border border-slate-800/80 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-sm font-extrabold tracking-wider text-indigo-400 font-mono uppercase border-b border-indigo-950 pb-3">
                  🛒 DETAIL PEMESANAN KAMU
                </h3>

                {cart.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {/* List Cart Items */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block mb-1">PRODUK DI KERANJANG</span>
                      {cart.map((item, idx) => {
                        const itemSub = item.product.price * item.quantity;
                        const discRate = getDiscountForQty(item.quantity);
                        
                        return (
                          <div key={item.product.id || idx} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-start gap-2 justify-between">
                            <div className="flex gap-2">
                              <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-slate-800 bg-slate-900 mt-0.5">
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white leading-tight">{item.product.name}</h4>
                                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">
                                  {item.quantity} {item.product.unit} (Rp {item.product.price.toLocaleString('id-ID')})
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-mono px-1 rounded">
                                    {item.designs.length} Desain
                                  </span>
                                  {discRate > 0 && (
                                    <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/15 font-mono font-bold px-1 rounded">
                                      Diskon Grosir {Math.round(discRate * 100)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-xs font-mono font-bold text-slate-200">Rp {itemSub.toLocaleString('id-ID')}</p>
                              <button
                                type="button"
                                onClick={() => adjustCartItemQuantity(item.product.id, -999999)}
                                className="text-[10px] text-rose-500 hover:text-rose-400 font-mono mt-2 cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-850 text-xs text-slate-400">
                      <span>Total Item Unik:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {cart.length} Jenis Produk
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Total Jumlah Kuantitas:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} pcs
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-3">
                      <span className="text-slate-400">Total File Desain Terunggah:</span>
                      <span className="font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/25">
                        {cart.reduce((sum, item) => sum + item.designs.length, 0)} Desain
                      </span>
                    </div>

                    {/* Cost Breakdown Summary list */}
                    <div className="pt-4 border-t border-slate-850 space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Harga Satuan x Qty:</span>
                        <span>Rp {calculatedSubtotal.toLocaleString('id-ID')}</span>
                      </div>
                      
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-rose-400">
                          <span>Diskon Grosir:</span>
                          <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-400">
                        <span>Biaya Administrasi:</span>
                        <span>Rp {paymentFee.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-dashed border-slate-800 text-sm font-bold">
                        <span className="text-slate-200">Total Pembayaran:</span>
                        <span className="text-indigo-400 font-black text-base">Rp {finalTotalPrice.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Checkout Order placement button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        onClick={handlePlaceOrder}
                        disabled={orderSubmitting}
                        className={`w-full py-4 text-center text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:brightness-110 h-14 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer ${
                          orderSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                        }`}
                      >
                        {orderSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sedang Memproses...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCartIcon className="w-5 h-5" />
                            <span>Pesan Sekarang via Blimcast</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="mt-6 text-center text-slate-500 space-y-4 py-8">
                    <ShoppingBag className="w-12 h-12 stroke-[1] text-slate-700 mx-auto animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-slate-300">Belum Ada Produk Terpilih</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto">Silakan pilih salah satu dari 10 menu sublimasi disamping.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* HELP & CUSTOMER SERVICE DESK */}
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl text-xs space-y-2 text-slate-400">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider mb-2">
                  <HelpCircle className="w-4.5 h-4.5" />
                  <span>BUTUH BANTUAN CETAK?</span>
                </div>
                <p>Ada kendala dengan format file gambar desain Anda? Bingung menentukan ukuran sublimasi?</p>
                <p className="text-indigo-300 font-semibold">Tanya CS kami (Senin-Minggu, 08.00-21.00 WIB)</p>
                <div className="pt-2">
                  <a
                    href="https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Admin%20Blimcast%20mau%20bertanya%20mengenai%20format%20desain%20kustom"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-200 transition-colors rounded-xl font-bold font-mono tracking-wider"
                  >
                    💬 WA KONSULTASI DESAIN (FREE)
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: CHECK TRACK STATUS ("CEK PESANAN" TAB) */}
        {/* ========================================================= */}
        {currentTab === 'cek-pesanan' && (
          <div className="max-w-2xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <span className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">CEK STATUS PESANAN</h2>
              <p className="text-xs text-slate-400 mt-1">
                Masukkan nomor WhatsApp terdaftar Anda untuk melihat proses pencetakan sublimasi terkini.
              </p>
            </div>

            {/* Input Inquiry Form */}
            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
                  Masukkan Nomor WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400 font-bold font-mono text-sm pr-3 border-r border-slate-800">
                    +62
                  </div>
                  <input
                    type="text"
                    value={searchWa}
                    onChange={(e) => setSearchWa(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="contoh: 81234567890"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 text-white rounded-xl py-4 pl-16 pr-4 text-sm font-mono tracking-widest placeholder-slate-600 transition-colors outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={trackingLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {trackingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mencari Riwayat Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>Cek Riwayat Belanja</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Tracking Search Result Area */}
            {hasSearched ? (
              <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
                <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest">
                  Hasil Penelusuran ({searchResults.length} Pesanan Diproses)
                </h3>

                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((order) => (
                      <div key={order.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 relative hover:border-slate-800 transition-colors">
                        
                        {/* Dynamic colorful border indicator based on status */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-2xl ${
                          order.status === 'Menunggu Pembayaran' ? 'bg-amber-500' :
                          order.status === 'Sedang Diproses/Dicetak' ? 'bg-indigo-500' :
                          order.status === 'Selesai' ? 'bg-emerald-500' : 'bg-slate-700'
                        }`} />

                        <div className="flex items-center justify-between flex-wrap gap-2 pl-2">
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono block">ID PESANAN</span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-sm font-bold font-mono text-white">
                                {order.id}
                              </span>
                              {order.items && order.items.length > 0 ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {order.items.map((item, idx) => (
                                    <span key={idx} className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-bold text-indigo-400 font-sans">
                                      {item.product.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                order.product && (
                                  <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-bold text-slate-400 font-sans">
                                    {order.product.name}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-mono block">STATUS</span>
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.status === 'Menunggu Pembayaran' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                              order.status === 'Sedang Diproses/Dicetak' ? 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' :
                              order.status === 'Selesai' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                              'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Timeline Visual Flow */}
                        <div className="pl-2 pt-1">
                          <div className="grid grid-cols-4 text-center text-[10px] text-slate-400 font-mono relative">
                            {/* Line spacer background */}
                            <div className="absolute top-2 left-6 right-6 h-0.5 bg-slate-800 z-0" />

                            <div className="relative z-10 flex flex-col items-center">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-mono font-bold ${
                                ['Menunggu Pembayaran', 'Sedang Diproses/Dicetak', 'Selesai'].includes(order.status)
                                  ? 'bg-amber-500 border-amber-400 text-slate-950'
                                  : 'bg-slate-900 border-slate-700'
                              }`}>1</span>
                              <span className="mt-1.5 text-[9px] font-sans truncate max-w-[80px]">Dipesan</span>
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-mono font-bold ${
                                ['Sedang Diproses/Dicetak', 'Selesai'].includes(order.status)
                                  ? 'bg-indigo-500 border-indigo-400 text-white'
                                  : 'bg-slate-900 border-slate-700'
                              }`}>2</span>
                              <span className="mt-1.5 text-[9px] font-sans truncate max-w-[80px]">Disiapkan</span>
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-mono font-bold ${
                                order.status === 'Sedang Diproses/Dicetak'
                                  ? 'bg-purple-500 border-purple-400 text-white animate-pulse'
                                  : order.status === 'Selesai'
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'bg-slate-900 border-slate-700'
                              }`}>3</span>
                              <span className="mt-1.5 text-[9px] font-sans truncate max-w-[80px]">Dicetak</span>
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-mono font-bold ${
                                order.status === 'Selesai'
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                  : 'bg-slate-900 border-slate-700'
                              }`}>4</span>
                              <span className="mt-1.5 text-[9px] font-sans truncate max-w-[80px]">Selesai</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Detail Information inside Track order page */}
                        <div className="pl-2 pt-2 border-t border-slate-900 text-xs text-slate-400 space-y-2">
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Rincian Belanja</span>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/40 p-2 rounded-xl border border-slate-850/60">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <span className="text-slate-200 font-bold font-sans block text-[11px] leading-tight">{item.product.name}</span>
                                      <span className="text-[9px] text-indigo-400 font-mono block leading-none mt-0.5">
                                        {item.designs.length} desain
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-slate-300 font-bold font-mono text-[11px]">
                                    {item.quantity} {item.product.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            order.product && (
                              <div className="flex justify-between">
                                <span>Kuantitas x Produk:</span>
                                <span className="text-white font-semibold font-mono">{order.quantity} {order.product.unit}</span>
                              </div>
                            )
                          )}
                          
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-900/50">
                            <span>Total Pembayaran:</span>
                            <span className="text-indigo-400 font-extrabold font-mono text-sm">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
                          </div>

                          <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 mt-1">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span>
                                {order.items && order.items.length > 0
                                  ? order.items.reduce((sum, item) => sum + item.designs.length, 0)
                                  : order.designs?.length || 0} Berkas Mockup
                              </span>
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">Invoice Date: {order.orderDate}</span>
                          </div>
                        </div>

                        {/* Customer support shortcut directly inside target row tracking details */}
                        <div className="pl-2 pt-1">
                          <a
                            href={getWhatsAppMessageLink(order)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl border border-slate-800 text-[11px] font-bold text-center block transition-colors"
                          >
                            Hubungi Admin WA / Ajukan Revisi Mockup
                          </a>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-850 p-8 rounded-2xl text-center text-slate-500">
                    <Info className="w-10 h-10 stroke-[1] text-indigo-500/50 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">Harap Maaf, Pesanan Tidak Ketemu</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tidak ditemukan pesanan aktif di bawah nomor WA tersebut. Silakan lakukan transaksi terlebih dahulu pada formulir pemesanan.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 bg-slate-950 border border-slate-850 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-400">
                <Smartphone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <span className="text-white font-bold block mb-0.5">Demopage Guide:</span> Gunakan nomor demo <span className="text-indigo-400 font-mono font-bold font-sans">081234567890</span> untuk memperlihatkan bagaimana sistem menampilkan aneka status transaksi kustom dari daftar simulasi awal orderan kami.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: ADMIN DASHBOARD (ADMIN PASSWORD PROTECTED VIEW) */}
        {/* ========================================================= */}
        {currentTab === 'admin' && (
          <div className="space-y-6">
            
            {/* ADMIN ACCESS VERIFICATION BAR */}
            {!isAdminLogged ? (
              <div className="max-w-md mx-auto bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 text-center shadow-2xl">
                <span className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                  <Lock className="w-6 h-6" />
                </span>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Kredensial Otorisasi Admin</h2>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  Harap masukkan PIN Admin Blimcast untuk mengelola status pesanan pelanggan.
                </p>

                <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
                      Masukkan PIN Demo Admin:
                    </label>
                    <input
                      type="password"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="Masukkan PIN (Gunakan: 1234)"
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-rose-500 text-white rounded-xl py-3.5 px-4 text-center font-mono tracking-widest placeholder-slate-700 outline-none transition-colors"
                      maxLength={8}
                      required
                    />
                    
                    {adminPinError && (
                      <p className="text-[11px] text-rose-400 mt-2 text-center font-mono font-medium">
                        ❌ {adminPinError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg"
                  >
                    Buka Dashboard Admin
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-850 text-[11px] text-slate-500">
                  ⚠️ <span className="font-bold text-slate-300 font-mono">Demo PIN:</span> Masukkan angka <span className="text-rose-400 font-bold font-mono">1234</span> untuk login secara instan dalam masa pengujian prototipe.
                </div>
              </div>
            ) : (
              
              /* RENDER MAIN ADMIN WORKSTATION BOARD */
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
                
                {/* ADMIN WORKSTATION HEADER */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold font-mono uppercase rounded border border-rose-500/25">
                      🔒 Otorisasi Terbuka - Developer Mode
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1.5 flex items-center gap-2">
                      <span>PANEL KASIR & DRIP-FEED CETAK</span>
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Database Seeder Button */}
                    <button
                      onClick={handleResetDemoData}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 font-mono hover:text-white transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Seeder data</span>
                    </button>

                    <button
                      onClick={handleAdminLogout}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>

                {/* FILTERING AND METRICS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Total Metrics Grid Item 1 */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Total Masuk</span>
                    <span className="text-2xl font-black text-white font-mono">{orders.length}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Pesanan Terdaftar</span>
                  </div>
                  
                  {/* Total Metrics Grid Item 2 */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Diproses</span>
                    <span className="text-2xl font-black text-indigo-400 font-mono">
                      {orders.filter(o => o.status === 'Sedang Diproses/Dicetak').length}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Butuh Dicetak Segera</span>
                  </div>

                  {/* Total Metrics Grid Item 3 */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Menunggu Bayar</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {orders.filter(o => o.status === 'Menunggu Pembayaran').length}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Menunggu Review QRIS</span>
                  </div>

                  {/* Total Metrics Grid Item 4 */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Selesai</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {orders.filter(o => o.status === 'Selesai').length}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Sudah Diambil/Kirim</span>
                  </div>
                </div>

                {/* SEARCH INPUT BAR */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari berdasarkan No. WA, ID, atau nama produk..."
                      value={adminSearchTerm}
                      onChange={(e) => setAdminSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 pl-10 pr-4 py-3 text-xs rounded-xl outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Status Categorizer Selector */}
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-2.5 rounded-xl">
                      <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
                      <select
                        value={adminFilterStatus}
                        onChange={(e) => setAdminFilterStatus(e.target.value)}
                        className="w-full bg-transparent text-slate-300 py-3 text-xs outline-none border-none focus:ring-0 rounded-xl"
                      >
                        <option value="Semua" className="bg-slate-950">Status: Semua</option>
                        <option value="Menunggu Pembayaran" className="bg-slate-950">Status: Menunggu Bayar</option>
                        <option value="Sedang Diproses/Dicetak" className="bg-slate-950">Status: Sedang Diproses</option>
                        <option value="Selesai" className="bg-slate-950">Status: Selesai</option>
                        <option value="Dibatalkan" className="bg-slate-950">Status: Dibatalkan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TABLE LIST TABLE - HIGHLY MOBILE FRIENDLY GRID AND DESKTOP COMPLIANT */}
                <div className="overflow-x-auto rounded-xl border border-slate-850">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                        <th className="p-4">ID / Invoice</th>
                        <th className="p-4">Pelanggan (WA)</th>
                        <th className="p-4">Dipesan</th>
                        <th className="p-4 text-right">Biaya Akhir</th>
                        <th className="p-4">Bahan Pengunggah</th>
                        <th className="p-4">Aksi / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-950/40 transition-colors">
                            <td className="p-4">
                              <span className="font-mono font-bold text-white block">{order.id}</span>
                              <span className="text-[10px] text-slate-500 font-mono block">{order.orderDate}</span>
                            </td>
                            
                            <td className="p-4">
                              <div className="font-semibold text-slate-300">{order.waNumber}</div>
                              <span className="text-[10px] text-slate-500">No. WA Track</span>
                            </td>

                            <td className="p-4">
                              {order.items && order.items.length > 0 ? (
                                <div className="space-y-1.5 animate-fade-in">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-850 max-w-[200px]">
                                      <span className="font-black text-slate-100 text-[11px] block truncate" title={item.product.name}>
                                        {item.product.name}
                                      </span>
                                      <span className="text-[10px] text-indigo-400 font-mono font-semibold block">
                                        {item.quantity} {item.product.unit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-slate-950/60 p-2 rounded border border-slate-850 max-w-[200px]">
                                  <span className="font-black text-slate-100 text-[11px] block truncate">{order.product?.name || 'Produk'}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">{order.quantity} {order.product?.unit || 'pcs'}</span>
                                </div>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <span className="font-mono font-bold text-indigo-400 block">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
                              <span className="text-[9px] text-slate-500 font-mono tracking-tight uppercase">
                                {PAYMENT_METHODS.find(p => p.id === order.paymentMethod)?.id || order.paymentMethod}
                              </span>
                            </td>

                            <td className="p-4">
                              {/* Open detail review trigger */}
                              {(() => {
                                const totalDesigns = order.items && order.items.length > 0
                                  ? order.items.reduce((sum, item) => sum + item.designs.length, 0)
                                  : order.designs?.length || 0;
                                return (
                                  <button
                                    onClick={() => setSelectedAdminOrder(order)}
                                    className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-md font-mono text-[10px] flex items-center justify-center gap-1 cursor-pointer w-full text-center font-bold"
                                  >
                                    <span>Lihat {totalDesigns} Desain</span>
                                    <ChevronRight className="w-3 h-3 text-indigo-400" />
                                  </button>
                                );
                              })()}
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                  className={`px-2 py-1 text-[10px] rounded font-bold uppercase cursor-pointer border ${
                                    order.status === 'Menunggu Pembayaran' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                                    order.status === 'Sedang Diproses/Dicetak' ? 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20' :
                                    order.status === 'Selesai' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                                    'bg-rose-400/10 text-rose-400 border-rose-400/20'
                                  }`}
                                >
                                  <option value="Menunggu Pembayaran" className="bg-slate-950 font-sans text-xs">Menunggu Bayar</option>
                                  <option value="Sedang Diproses/Dicetak" className="bg-slate-950 font-sans text-xs">Diproses/Dicetak</option>
                                  <option value="Selesai" className="bg-slate-950 font-sans text-xs">Selesai</option>
                                  <option value="Dibatalkan" className="bg-slate-950 font-sans text-xs">Dibatalkan</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                            Tidak ditemukan hasil pencocokan pesanan terdaftar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MODAL / BOTTOM EXPANDER FOR ADMIN FILE AND NOTES INSPECTOR */}
                {selectedAdminOrder && (
                  <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-3xl animate-fade-in space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                          Inspektur Berkas Mockup: Pesanan {selectedAdminOrder.id}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Pelanggan: <span className="font-mono text-indigo-400 font-bold">{selectedAdminOrder.waNumber}</span> — {selectedAdminOrder.items && selectedAdminOrder.items.length > 0 ? (
                            <span className="text-indigo-300 font-bold">{selectedAdminOrder.items.map(it => `${it.product.name} (${it.quantity} ${it.product.unit})`).join(', ')}</span>
                          ) : (
                            <span className="text-indigo-300 font-bold">{selectedAdminOrder.product?.name || 'Produk'}</span>
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedAdminOrder(null)}
                        className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-1 rounded text-slate-400 cursor-pointer"
                      >
                        Tutup Editor
                      </button>
                    </div>

                    {selectedAdminOrder.items && selectedAdminOrder.items.length > 0 ? (
                      <div className="space-y-6">
                        {selectedAdminOrder.items.map((cartItem, itemIdx) => (
                          <div key={cartItem.product.id || itemIdx} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                              <div className="w-6 h-6 rounded overflow-hidden border border-slate-705 bg-slate-900 shrink-0">
                                <img src={cartItem.product.imageUrl} alt={cartItem.product.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider">
                                {cartItem.product.name} ({cartItem.quantity} {cartItem.product.unit})
                              </span>
                            </div>
                            
                            {cartItem.designs && cartItem.designs.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {cartItem.designs.map((design, dIdx) => (
                                  <div key={design.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1.5">
                                    <div className="aspect-square w-full rounded-lg bg-slate-900 overflow-hidden relative border border-slate-800">
                                      <img
                                        src={design.previewUrl}
                                        alt={design.fileName}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                      <a
                                        href={design.previewUrl}
                                        download={`Blimcast-${selectedAdminOrder.id}-${cartItem.product.id}-Design${dIdx + 1}.${design.fileName.split('.').pop()}`}
                                        className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/95 text-white hover:bg-indigo-600 rounded text-[9px] font-mono tracking-tighter uppercase transition-colors"
                                      >
                                        Unduh File Asli
                                      </a>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-indigo-300 font-mono font-bold uppercase truncate" title={design.fileName}>
                                        FILE #{dIdx + 1}: {design.fileName.length > 15 ? `${design.fileName.substring(0, 15)}...` : design.fileName}
                                      </p>
                                      <div className="p-2 bg-slate-900 rounded-lg text-xs leading-relaxed text-slate-300 border border-slate-850 min-h-[45px]">
                                        <span className="text-[9px] text-indigo-400 uppercase font-mono block">Instruksi Cetak:</span>
                                        {design.notes || <span className="text-slate-600 italic">"Tidak ada catatan tertulis khusus."</span>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-amber-400 italic pl-2">⚠️ Tidak ada file desain kustom diunggah untuk item ini.</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedAdminOrder.designs && selectedAdminOrder.designs.length > 0 ? (
                          selectedAdminOrder.designs.map((design, dIdx) => (
                            <div key={design.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                              <div className="aspect-square w-full rounded-lg bg-slate-950 overflow-hidden relative border border-slate-800">
                                <img
                                  src={design.previewUrl}
                                  alt={design.fileName}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                
                                <a
                                  href={design.previewUrl}
                                  download={`Blimcast-${selectedAdminOrder.id}-Design${dIdx + 1}.${design.fileName.split('.').pop()}`}
                                  className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/90 text-white hover:bg-indigo-600 rounded text-[9px] font-mono tracking-tighter uppercase transition-colors"
                                >
                                  Unduh File Asli
                                </a>
                              </div>

                              <div className="space-y-1">
                                <p className="text-[10px] text-indigo-300 font-mono font-bold uppercase truncate" title={design.fileName}>
                                  FILE #{dIdx + 1}: {design.fileName.substring(0, 15)}...
                                </p>
                                <div className="p-2.5 bg-slate-950 rounded-lg text-xs leading-relaxed text-slate-300 border border-slate-850 min-h-[50px]">
                                  <span className="text-[9px] text-indigo-400 uppercase font-mono block">Instruksi Cetak:</span>
                                  {design.notes || <span className="text-slate-600 italic">"Tidak ada catatan tertulis khusus."</span>}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-slate-500 italic col-span-full">Tidak ada desain diunggah.</div>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-850 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="text-xs">
                        <span className="text-[9px] text-slate-500 uppercase block font-mono">Catatan Umum Pembeli:</span>
                        <p className="text-slate-300 italic">
                          "{selectedAdminOrder.notes || 'Tidak ada catatan umum.'}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Ubah Status Cepat:</span>
                        <div className="flex gap-2">
                          {['Sedang Diproses/Dicetak', 'Selesai'].map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => handleUpdateStatus(selectedAdminOrder.id, statusOption as OrderStatus)}
                              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-transform hover:scale-105 cursor-pointer ${
                                selectedAdminOrder.status === statusOption
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-900 text-slate-300 border border-slate-800'
                              }`}
                            >
                              {statusOption.replace('Sedang ', '').replace('/Dicetak', '')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER BLOCK CREDENTIALS DISPLAYING EXCELLENT COMPOSURE */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-center md:text-left">
            <p className="font-bold text-slate-500">© 2026 Blimcast Indonesia. All Rights Reserved.</p>
            <p className="text-[10px] text-slate-600 mt-1">Platform Pemesanan Sublimasi Kustom Linear Halaman Tunggal.</p>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-emerald-500/80">• Kecepatan Respon 100%</span>
            <span>Syarat & Ketentuan</span>
            <span>Kebijakan Privasi</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

// Simulated simple shopping cart icon for custom rendering
function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
