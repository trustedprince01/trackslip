import { useState, useEffect, useCallback } from 'react';
import { Receipt, ReceiptInsert, ReceiptUpdate, ReceiptItem } from '@/types/receipt';
import receiptService from '@/service/ReceiptService';
import receiptProcessingService from '@/service/ReceiptProcessingService';
import { useAuth } from '@/contexts/AuthContext';

export const useReceipts = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const userId = user?.id;

  // Fetch all receipts
  const fetchReceipts = useCallback(async () => {
    if (!userId) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await receiptService.getReceipts(userId);
      setReceipts(data);
      return data;
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch receipts'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Process and add a new receipt from an image
  const addReceiptFromImage = async (file: File): Promise<Receipt> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      // Process the receipt image
      const { receipt, imageUrl } = await receiptProcessingService.processReceipt(file, userId);
      
      // Create the receipt object
      const newReceipt: ReceiptInsert = {
        user_id: userId,
        store_name: receipt.store_name || 'Unknown Store',
        date: receipt.date || new Date().toISOString(),
        total_amount: receipt.total_amount || 0,
        subtotal: receipt.subtotal || receipt.total_amount || 0, // Use subtotal if available, otherwise use total_amount
        tax_amount: receipt.tax_amount || 0,
        discount_amount: receipt.discount_amount || 0,
        items: receipt.items || [],
        image_url: imageUrl,
      };

      // Save the receipt
      const savedReceipt = await receiptService.addReceipt(newReceipt);
      
      // Update local state
      setReceipts(prev => [savedReceipt, ...prev]);
      
      return savedReceipt;
    } catch (err) {
      console.error('Error adding receipt from image:', err);
      setError(err instanceof Error ? err : new Error('Failed to process receipt image'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a new receipt
  const addReceipt = async (receipt: Omit<ReceiptInsert, 'user_id'>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const newReceipt: ReceiptInsert = {
        ...receipt,
        user_id: userId,
        // Ensure all required fields have default values
        subtotal: receipt.subtotal || receipt.total_amount || 0,
        tax_amount: receipt.tax_amount || 0,
        discount_amount: receipt.discount_amount || 0,
      };

      const savedReceipt = await receiptService.addReceipt(newReceipt);
      setReceipts(prev => [savedReceipt, ...prev]);
      return savedReceipt;
    } catch (err) {
      console.error('Error adding receipt:', err);
      setError(err instanceof Error ? err : new Error('Failed to add receipt'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a receipt
  const updateReceipt = async (id: string, updates: Partial<ReceiptUpdate>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedReceipt = await receiptService.updateReceipt(
        { ...updates, id },
        userId
      );

      setReceipts(prev =>
        prev.map(r => (r.id === id ? { ...r, ...updatedReceipt } : r))
      );

      return updatedReceipt;
    } catch (err) {
      console.error('Error updating receipt:', err);
      setError(err instanceof Error ? err : new Error('Failed to update receipt'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single receipt by ID
  const getReceiptById = async (id: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const receipt = await receiptService.getReceiptById(id, userId);
      if (!receipt) {
        throw new Error('Receipt not found');
      }
      // Update local state if needed
      setReceipts(prev => {
        const existing = prev.find(r => r.id === id);
        if (existing) {
          return prev.map(r => r.id === id ? { ...r, ...receipt } : r);
        }
        return [receipt, ...prev];
      });
      return receipt;
    } catch (err) {
      console.error('Error fetching receipt:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch receipt'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a receipt
  const deleteReceipt = async (id: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      await receiptService.deleteReceipt(id, userId);
      setReceipts(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting receipt:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete receipt'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch receipts on mount and when userId changes
  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
    getReceiptById,
    addReceipt,
    addReceiptFromImage,
    updateReceipt,
    deleteReceipt,
    refreshReceipts: fetchReceipts,
  };
};

export default useReceipts;
