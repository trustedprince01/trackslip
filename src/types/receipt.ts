export interface BaseReceipt {
  id: string;
  user_id: string;
  store_name: string;
  date: string | Date;
  total_amount: number;
  subtotal?: number; // Amount before tax and discounts
  tax_amount?: number; // Total tax paid
  discount_amount?: number; // Total discount received
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
  price: number;
  quantity: number;
  category?: Category; // Categorized item type
  // Add any other item properties you need
  [key: string]: any; // For additional dynamic properties
}
