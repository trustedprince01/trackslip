import { Receipt } from '@/types/receipt';

class LocalStorageService {
  private static instance: LocalStorageService;
  private readonly receiptsKey = 'local_receipts';

  private constructor() {}

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // Save receipts to localStorage
  public saveReceipts(receipts: Receipt[]): void {
    try {
      const serializedReceipts = JSON.stringify(receipts, (key, value) => {
        if (key === 'date' && value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      
      localStorage.setItem(this.receiptsKey, serializedReceipts);
      console.log('✅ Receipts saved to local storage successfully!');
    } catch (error) {
      console.error('❌ Error saving receipts to local storage:', error);
    }
  }

  // Get all receipts from localStorage
  public getReceipts(): Receipt[] {
    try {
      const serializedReceipts = localStorage.getItem(this.receiptsKey);
      if (!serializedReceipts) return [];

      const parsedReceipts = JSON.parse(serializedReceipts, (key, value) => {
        if (key === 'date') {
          return new Date(value);
        }
        return value;
      });

      return parsedReceipts as Receipt[];
    } catch (error) {
      console.error('❌ Error retrieving receipts from local storage:', error);
      return [];
    }
  }

  // Add a new receipt
  public addReceipt(receipt: Receipt): void {
    const receipts = this.getReceipts();
    // Ensure the receipt has an ID
    if (!receipt.id) {
      receipt.id = this.generateId();
    }
    receipts.push(receipt);
    this.saveReceipts(receipts);
  }

  // Update an existing receipt
  public updateReceipt(updatedReceipt: Receipt): boolean {
    const receipts = this.getReceipts();
    const index = receipts.findIndex(r => r.id === updatedReceipt.id);
    
    if (index !== -1) {
      receipts[index] = updatedReceipt;
      this.saveReceipts(receipts);
      return true;
    }
    return false;
  }

  // Delete a receipt by ID
  public deleteReceipt(id: string): boolean {
    const receipts = this.getReceipts();
    const initialLength = receipts.length;
    const filteredReceipts = receipts.filter(receipt => receipt.id !== id);
    
    if (filteredReceipts.length < initialLength) {
      this.saveReceipts(filteredReceipts);
      return true;
    }
    return false;
  }

  // Get a receipt by ID
  public getReceiptById(id: string): Receipt | undefined {
    const receipts = this.getReceipts();
    return receipts.find(receipt => receipt.id === id);
  }

  // Clear all receipts
  public clearAllReceipts(): void {
    try {
      localStorage.removeItem(this.receiptsKey);
      console.log('✅ All receipts cleared from local storage');
    } catch (error) {
      console.error('❌ Error clearing receipts from local storage:', error);
    }
  }

  // Generate a unique ID for new receipts
  private generateId(): string {
    return 'receipt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export default LocalStorageService.getInstance();
