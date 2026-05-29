import { SublimationProduct, SublimationOrder } from './types';

export const SUBLIMATION_PRODUCTS: SublimationProduct[] = [
  {
    id: 'mug-custom',
    name: 'Mug Custom',
    price: 25000,
    unit: 'pcs',
    minOrder: 1,
    estimatedTime: '1-2 Hari',
    description: 'Mug keramik premium tahan panas, coating sublimasi kinclong, print full color.',
    iconName: 'CupSoda',
    badgeColor: 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30',
  },
  {
    id: 'ganci-akrilik',
    name: 'Gantungan Kunci Akrilik',
    price: 12000,
    unit: 'pcs',
    minOrder: 5,
    estimatedTime: '2-3 Hari',
    description: 'Akrilik tebal 3mm, potong presisi laser, cetak 2 sisi awet tidak gampang baret.',
    iconName: 'KeyRound',
    badgeColor: 'bg-indigo-500/25 text-indigo-400 border border-indigo-500/30',
  },
  {
    id: 'sticker-diecut',
    name: 'Sticker Die Cut',
    price: 1500,
    unit: 'lembar',
    minOrder: 10,
    estimatedTime: '1 Hari',
    description: 'Sticker vinyl dengan potongan mengikuti bentuk luar desain (Die Cut), anti air & laminasi.',
    iconName: 'Sparkles',
    badgeColor: 'bg-amber-500/25 text-amber-400 border border-amber-500/30',
  },
  {
    id: 'sticker-kisscut',
    name: 'Sticker Kiss Cut',
    price: 8000,
    unit: 'lembar A4',
    minOrder: 2,
    estimatedTime: '1 Hari',
    description: 'Sticker lembaran A4 setengah terpotong, gampang dikelupas. Kualitas cetak ultra-high resolution.',
    iconName: 'Layers',
    badgeColor: 'bg-rose-500/25 text-rose-400 border border-rose-500/30',
  },
  {
    id: 'pin-custom',
    name: 'Pin Custom',
    price: 5000,
    unit: 'pcs',
    minOrder: 10,
    estimatedTime: '1-2 Hari',
    description: 'Pin peniti ukuran 44mm atau 58mm dengan laminasi glossy/doff, anti karat.',
    iconName: 'Disc',
    badgeColor: 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/30',
  },
  {
    id: 'lanyard-custom',
    name: 'Lanyard Custom',
    price: 15000,
    unit: 'pcs',
    minOrder: 5,
    estimatedTime: '2-3 Hari',
    description: 'Tali ID Card lebar 2cm print 2 sisi sublime full color, bahan tisu premium plus paku & stopper.',
    iconName: 'IdCard',
    badgeColor: 'bg-violet-500/25 text-violet-400 border border-violet-500/30',
  },
  {
    id: 'tshirt-sublim',
    name: 'T-Shirt Sublim',
    price: 85000,
    unit: 'pcs',
    minOrder: 1,
    estimatedTime: '3-4 Hari',
    description: 'Kaos polyester premium, sublimasi full-print melingkar tajam, tidak luntur, adem di kulit.',
    iconName: 'Shirt',
    badgeColor: 'bg-teal-500/25 text-teal-400 border border-teal-500/30',
  },
  {
    id: 'mousepad-custom',
    name: 'Mousepad Custom',
    price: 35000,
    unit: 'pcs',
    minOrder: 1,
    estimatedTime: '2 Hari',
    description: 'Mousepad bahan karet alam bertekstur speed, cetak sublimasi warna cemerlang berkualitas gamers.',
    iconName: 'RectangleEllipsis',
    badgeColor: 'bg-pink-500/25 text-pink-400 border border-pink-500/30',
  },
  {
    id: 'totebag-custom',
    name: 'Totebag Custom',
    price: 30000,
    unit: 'pcs',
    minOrder: 2,
    estimatedTime: '2-3 Hari',
    description: 'Totebag bahan Canvas dengan strap kuat, sublimasi cetak tajam sisi depan.',
    iconName: 'ShoppingBag',
    badgeColor: 'bg-blue-500/25 text-blue-400 border border-blue-500/30',
  },
  {
    id: 'nametag-idcard',
    name: 'ID Card / Name Tag',
    price: 10000,
    unit: 'pcs',
    minOrder: 3,
    estimatedTime: '1-2 Hari',
    description: 'ID Card bahan PVC standard ATM, cetak sublimasi anti pudar berkilau anti gores.',
    iconName: 'WalletCards',
    badgeColor: 'bg-lime-500/25 text-lime-400 border border-lime-500/30',
  },
];

export const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS (Gopay/OVO/Dana/LinkAja/ShopeePay)', fee: 0, icon: 'QrCode' },
  { id: 'bca', name: 'Transfer Bank BCA (Manual)', fee: 0, icon: 'Building' },
  { id: 'mandiri', name: 'Transfer Bank Mandiri (Manual)', fee: 0, icon: 'Building' },
  { id: 'virtual_account', name: 'Virtual Account Bank Mandiri/BCA/BRI (Otomatis)', fee: 2000, icon: 'CreditCard' },
];

export const INITIAL_ORDERS: SublimationOrder[] = [
  {
    id: 'BLM-30582',
    waNumber: '081234567890',
    product: SUBLIMATION_PRODUCTS[0], // Mug Custom
    quantity: 4,
    designs: [
      {
        id: 'img1',
        fileName: 'char_logo_raw.png',
        previewUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=200',
        notes: 'Logo ditaruh di tengah mug, beri background putih polos.',
      },
      {
        id: 'img2',
        fileName: 'typo_slogan.jpg',
        previewUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=200',
        notes: 'Slogan ditaruh di sisi sebaliknya (belakang logo).',
      },
    ],
    totalPrice: 100000,
    notes: 'Kirim pakai pelindung bubble wrap tebal ya min.',
    orderDate: '2026-05-28 14:22',
    status: 'Sedang Diproses/Dicetak',
    paymentMethod: 'qris',
  },
  {
    id: 'BLM-76121',
    waNumber: '089876543210',
    product: SUBLIMATION_PRODUCTS[2], // Sticker Die Cut
    quantity: 50,
    designs: [
      {
        id: 'ganci1',
        fileName: 'sticker_vibe.jpg',
        previewUrl: 'https://images.unsplash.com/photo-1572375995501-4b0894dbe054?auto=format&fit=crop&q=80&w=200',
        notes: 'Potong presisi mengikuti bentuk karakter cibi ini.',
      }
    ],
    totalPrice: 75000,
    notes: 'Bahan vinyl laminasi doff.',
    orderDate: '2026-05-29 08:15',
    status: 'Menunggu Pembayaran',
    paymentMethod: 'qris',
  },
  {
    id: 'BLM-11204',
    waNumber: '081234567890',
    product: SUBLIMATION_PRODUCTS[5], // Lanyard
    quantity: 10,
    designs: [
      {
        id: 'lany1',
        fileName: 'lanyard_corporate_pattern.png',
        previewUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=200',
        notes: 'Print bolak-balik dengan striping putih abu-abu di tepi.',
      }
    ],
    totalPrice: 152000, // + admin fee Virtual Account
    notes: 'ID Card name tag custom juga nanti dicolok kesini.',
    orderDate: '2026-05-29 09:30',
    status: 'Selesai',
    paymentMethod: 'virtual_account',
  }
];
