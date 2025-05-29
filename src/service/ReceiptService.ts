import { v4 as uuidv4 } from 'uuid';
import { Receipt, ReceiptInsert, ReceiptUpdate } from '@/types/receipt';
import { supabase, handleSupabaseError } from '@/lib/supabase';

class ReceiptService {
  private static instance: ReceiptService;
  private readonly localStorageKey = 'local_receipts';
  private isOnline = typeof window !== 'undefined' ? window.navigator.onLine : true;

  private constructor() {
    // Set up online/offline detection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true));
      window.addEventListener('offline', () => this.handleConnectionChange(false));
    }
  }

  public static getInstance(): ReceiptService {
    if (!ReceiptService.instance) {
      ReceiptService.instance = new ReceiptService();
    }
    return ReceiptService.instance;
  }

  private handleConnectionChange(online: boolean) {
    this.isOnline = online;
    if (online) {
      this.syncLocalReceipts();
    }
  }

  // Get all receipts (both synced and local)
  public async getReceipts(userId: string): Promise<Receipt[]> {
    console.log('[ReceiptService] Getting receipts for user:', userId);
    console.log('[ReceiptService] Online status:', this.isOnline);
    
    try {
      if (this.isOnline) {
        console.log('[ReceiptService] Fetching from Supabase...');
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.error('[ReceiptService] Supabase error:', error);
          throw error;
        }
        
        console.log(`[ReceiptService] Received ${data?.length || 0} receipts from Supabase`);
        
        // Convert to Receipt type
        const receipts = data ? data.map(d => this.mapToReceipt(d)) : [];
        
        // Save to local storage as backup
        if (data) {
          console.log('[ReceiptService] Saving receipts to local storage');
          localStorage.setItem(
            `${this.localStorageKey}_${userId}`, 
            JSON.stringify(receipts.map(r => ({
              ...r,
              date: r.date.toISOString(),
              created_at: r.created_at.toISOString(),
              updated_at: r.updated_at.toISOString()
            })))
          );
        }
        
        return receipts;
      }
      
      console.log('[ReceiptService] Offline - falling back to local storage');
      // Fall back to local storage
      return this.getLocalReceipts(userId);
    } catch (error) {
      console.error('[ReceiptService] Error in getReceipts:', error);
      console.log('[ReceiptService] Attempting to use local storage as fallback');
      // Fall back to local storage
      return this.getLocalReceipts(userId);
    }
  }

  // Get a single receipt by ID
  public async getReceiptById(id: string, userId: string): Promise<Receipt | null> {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return this.mapToReceipt(data);
        }
      }
      
      // Fall back to local storage
      const localReceipts = this.getLocalReceipts(userId);
      return localReceipts.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      return null;
    }
  }

  // Helper method to convert database receipt to our Receipt type
  private mapToReceipt(dbReceipt: any): Receipt {
    return {
      ...dbReceipt,
      date: new Date(dbReceipt.date),
      created_at: new Date(dbReceipt.created_at),
      updated_at: new Date(dbReceipt.updated_at),
      // Ensure items is always an array
      items: Array.isArray(dbReceipt.items) ? dbReceipt.items : []
    };
  }

  // Add a new receipt
  public async addReceipt(receipt: ReceiptInsert): Promise<Receipt> {
    const userId = receipt.user_id;
    const now = new Date();
    const receiptId = this.generateId();
    
    // Create a properly typed receipt
    const newReceipt: Receipt = {
      ...receipt,
      id: receiptId,
      created_at: now,
      updated_at: now,
      // Ensure items is always an array
      items: Array.isArray(receipt.items) ? receipt.items : []
    };

    try {
      if (this.isOnline) {
        // Convert to database format (ensure dates are strings)
        const dbReceipt = {
          ...newReceipt,
          // If date is already a string, use it as is, otherwise convert to ISO string
          date: typeof newReceipt.date === 'string' 
            ? newReceipt.date 
            : new Date(newReceipt.date).toISOString(),
          // Ensure timestamps are strings
          created_at: newReceipt.created_at instanceof Date 
            ? newReceipt.created_at.toISOString() 
            : newReceipt.created_at,
          updated_at: newReceipt.updated_at instanceof Date 
            ? newReceipt.updated_at.toISOString() 
            : newReceipt.updated_at
        };
        
        const { data, error } = await supabase
          .from('receipts')
          .insert(dbReceipt)
          .select()
          .single();

        if (error) throw error;
        
        // Map back to our Receipt type
        return this.mapToReceipt(data);
      }
      
      // Save locally if offline
      this.saveLocalReceipt(newReceipt);
      return newReceipt;
      
    } catch (error) {
      console.error('Error saving receipt:', error);
      // Save locally if there's an error
      this.saveLocalReceipt(newReceipt);
      return newReceipt;
    }
  }

  // Update an existing receipt
  public async updateReceipt(receipt: ReceiptUpdate, userId: string): Promise<Receipt> {
    const updatedReceipt = {
      ...receipt,
      updated_at: new Date().toISOString(),
    };

    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('receipts')
          .update(updatedReceipt)
          .eq('id', receipt.id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return this.mapToReceipt(data);
      } else {
        // Update locally if offline
        this.updateLocalReceipt(updatedReceipt, userId);
        // Create a properly typed receipt with the updated_at as a Date
        const localReceipts = this.getLocalReceipts(userId);
        const existing = localReceipts.find(r => r.id === receipt.id);
        const now = new Date();
        
        return {
          ...existing,
          ...updatedReceipt,
          updated_at: now,
          created_at: existing?.created_at || now,
          items: existing?.items || []
        } as Receipt;
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      // Update locally if there's an error
      this.updateLocalReceipt(updatedReceipt, userId);
      
      // Get the latest local version to ensure we have all required fields
      const localReceipts = this.getLocalReceipts(userId);
      const existing = localReceipts.find(r => r.id === receipt.id);
      const now = new Date();
      
      // Return a properly typed Receipt with all required fields
      return {
        ...existing,
        ...updatedReceipt,
        id: receipt.id,
        user_id: userId,
        store_name: existing?.store_name || '',
        date: existing?.date || now,
        total_amount: existing?.total_amount || 0,
        items: existing?.items || [],
        created_at: existing?.created_at || now,
        updated_at: now
      };
    }
  }

  // Delete a receipt
  public async deleteReceipt(id: string, userId: string): Promise<void> {
    try {
      if (this.isOnline) {
        const { error } = await supabase
          .from('receipts')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Mark for deletion locally
        this.markLocalReceiptForDeletion(id, userId);
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      // Mark for deletion locally if there's an error
      this.markLocalReceiptForDeletion(id, userId);
    }
  }

  // Local storage methods
  private getLocalReceipts(userId: string): Receipt[] {
    if (typeof window === 'undefined') return [];
    
    const localData = localStorage.getItem(`${this.localStorageKey}_${userId}`);
    if (!localData) return [];
    
    try {
      const parsed = JSON.parse(localData);
      return Array.isArray(parsed) 
        ? parsed.map(item => this.mapToReceipt({
            ...item,
            // Ensure dates are properly handled
            date: item.date,
            created_at: item.created_at,
            updated_at: item.updated_at
          }))
        : [];
    } catch (error) {
      console.error('Error parsing local receipts:', error);
      return [];
    }
  }

  private saveLocalReceipt(receipt: Receipt): void {
    if (typeof window === 'undefined') return;
    
    const userId = receipt.user_id;
    const localReceipts = this.getLocalReceipts(userId);
    const existingIndex = localReceipts.findIndex(r => r.id === receipt.id);
    
    // Create a new array with the updated receipt
    const updatedReceipts = [...localReceipts];
    
    if (existingIndex >= 0) {
      updatedReceipts[existingIndex] = receipt;
    } else {
      updatedReceipts.push(receipt);
    }
    
    // Convert to database format for storage
    const receiptsForStorage = updatedReceipts.map(r => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString() : r.date,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at
    }));
    
    localStorage.setItem(
      `${this.localStorageKey}_${userId}`,
      JSON.stringify(receiptsForStorage)
    );
  }

  private updateLocalReceipt(update: ReceiptUpdate, userId: string): void {
    if (typeof window === 'undefined') return;
    
    const localReceipts = this.getLocalReceipts(userId);
    const existingIndex = localReceipts.findIndex(r => r.id === update.id);
    
    if (existingIndex >= 0) {
      const updatedReceipt = {
        ...localReceipts[existingIndex],
        ...update,
        updated_at: new Date()
      };
      
      this.saveLocalReceipt(updatedReceipt);
    }
  }

  private markLocalReceiptForDeletion(id: string, userId: string): void {
    if (typeof window === 'undefined') return;
    
    const localReceipts = this.getLocalReceipts(userId);
    const updatedReceipts = localReceipts.filter(r => r.id !== id);
    
    // Convert to database format for storage
    const receiptsForStorage = updatedReceipts.map(r => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString() : r.date,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at
    }));
    
    localStorage.setItem(
      `${this.localStorageKey}_${userId}`, 
      JSON.stringify(receiptsForStorage)
    );
    
    // Store IDs of receipts to delete when online
    const pendingDeletions = JSON.parse(
      localStorage.getItem('pending_deletions') || '[]'
    );
    
    if (!pendingDeletions.includes(id)) {
      pendingDeletions.push(id);
      localStorage.setItem('pending_deletions', JSON.stringify(pendingDeletions));
    }
  }

  // Sync local changes with the server when back online
  private async syncLocalReceipts(): Promise<void> {
    if (typeof window === 'undefined' || !this.isOnline) return;
    
    try {
      // Process pending deletions
      const pendingDeletions = JSON.parse(
        localStorage.getItem('pending_deletions') || '[]'
      ) as string[];
      
      for (const id of pendingDeletions) {
        try {
          await supabase
            .from('receipts')
            .delete()
            .eq('id', id);
        } catch (error) {
          console.error(`Error deleting receipt ${id}:`, error);
        }
      }
      
      if (pendingDeletions.length > 0) {
        localStorage.removeItem('pending_deletions');
      }
      
      // Process local receipts (upsert)
      const userIds = new Set<string>();
      
      // Get all user IDs with local data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.localStorageKey}_`)) {
          const userId = key.replace(`${this.localStorageKey}_`, '');
          if (userId) userIds.add(userId);
        }
      }
      
      // Sync receipts for each user
      for (const userId of userIds) {
        const localReceipts = this.getLocalReceipts(userId);
        
        for (const receipt of localReceipts) {
          try {
            // Convert to database format
            const dbReceipt = {
              ...receipt,
              date: receipt.date instanceof Date ? receipt.date.toISOString() : receipt.date,
              created_at: receipt.created_at instanceof Date ? receipt.created_at.toISOString() : receipt.created_at,
              updated_at: receipt.updated_at instanceof Date ? receipt.updated_at.toISOString() : receipt.updated_at
            };
            
            const { error } = await supabase
              .from('receipts')
              .upsert(dbReceipt);
              
            if (!error) {
              // Remove from local storage if successfully synced
              this.markLocalReceiptForDeletion(receipt.id, userId);
            }
          } catch (error) {
            console.error(`Error syncing receipt ${receipt.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing local receipts:', error);
    }
  }

  private generateId(): string {
    // Generate a proper UUID v4 using the uuid package
    return uuidv4();
  }
}

export default ReceiptService.getInstance();
