export type OrderStatus = 'Menunggu Pembayaran' | 'Sedang Diproses/Dicetak' | 'Selesai' | 'Dibatalkan';

export interface SublimationProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  minOrder: number;
  estimatedTime: string;
  description: string;
  imageUrl: string; // Product photo URL that spans card width
  iconName: string; // Kept for accessory usage if needed
  badgeColor: string;
}

export interface DesignUpload {
  id: string;
  fileName: string;
  previewUrl: string; // Base64 or ObjectURL for mock display
  notes: string; // Custom instruction for this specific design
}

export interface CartItem {
  id: string; // Unique ID for this cart line item (usually product.id)
  product: SublimationProduct;
  quantity: number;
  designs: DesignUpload[];
}

export interface SublimationOrder {
  id: string;
  waNumber: string; // Tracks user's order
  items: CartItem[]; // Support multiple items inside one order
  totalPrice: number;
  notes: string; // General order notes
  orderDate: string;
  status: OrderStatus;
  paymentMethod: string;
  
  // Legacy fields kept optional for backward compatibility
  product?: SublimationProduct;
  quantity?: number;
  designs?: DesignUpload[];
}
