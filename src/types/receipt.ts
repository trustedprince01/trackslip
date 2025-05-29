export interface BaseReceipt {
  id: string;
  user_id: string;
  store_name: string;
  date: string | Date;
  time?: string; // Time of purchase in HH:MM format
  total_amount: number;
  subtotal?: number; // Amount before tax and discounts
  tax_amount?: number; // Total tax paid
  discount_amount?: number; // Total discount received
  payment_method?: string; // e.g., 'Credit Card', 'Cash', 'Mobile Pay'
  receipt_number?: string; // Original receipt/transaction ID
  items: ReceiptItem[];
  image_url?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: any; // For additional dynamic properties
}

export interface Receipt extends Omit<BaseReceipt, 'created_at' | 'updated_at'> {
  created_at: Date;
  updated_at: Date;
}

export interface ReceiptInsert extends Omit<BaseReceipt, 'id' | 'created_at' | 'updated_at'> {
  // For creating new receipts
}

export interface ReceiptUpdate extends Partial<Omit<BaseReceipt, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  // For updating existing receipts
  id: string;
}

export type Category = 'Food' | 'Utilities' | 'Shopping' | 'Transportation' | 'Entertainment' | 'Healthcare' | 'Others';

export interface ReceiptItem {
  id?: string;
  name: string;
  price: number; // Total price for the line item (price * quantity)
  unit_price?: number; // Price per unit
  quantity: number;
  category?: Category; // Categorized item type
  description?: string; // Additional item details (size, color, etc.)
  [key: string]: any; // For additional dynamic properties
}
