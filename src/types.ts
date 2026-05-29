export type OrderStatus = 'Menunggu Pembayaran' | 'Sedang Diproses/Dicetak' | 'Selesai' | 'Dibatalkan';

export interface SublimationProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  minOrder: number;
  estimatedTime: string;
  description: string;
  iconName: string; // Used to select Lucide icon dynamically
  badgeColor: string;
}

export interface DesignUpload {
  id: string;
  fileName: string;
  previewUrl: string; // Base64 or ObjectURL for mock display
  notes: string; // Custom instruction for this specific design
}

export interface SublimationOrder {
  id: string;
  waNumber: string; // Tracks user's order
  product: SublimationProduct;
  quantity: number;
  designs: DesignUpload[];
  totalPrice: number;
  notes: string; // General order notes
  orderDate: string;
  status: OrderStatus;
  paymentMethod: string;
}
