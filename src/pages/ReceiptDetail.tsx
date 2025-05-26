
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Trash2, Share2, Printer, Calendar, Receipt, Store, TrendingUp, Sparkles, Eye } from "lucide-react";
import { format } from "date-fns";
import { useReceipts } from "@/hooks/useReceipts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getCachedStoreLogo } from "@/utils/storeLogo";

const ReceiptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReceiptById, deleteReceipt } = useReceipts();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchStoreLogo = useCallback(async (storeName: string) => {
    if (!storeName) return;
    
    try {
      setLogoLoading(true);
      const logo = await getCachedStoreLogo(storeName);
      setStoreLogo(logo);
    } catch (error) {
      console.error('Error fetching store logo:', error);
    } finally {
      setLogoLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        if (id) {
          const data = await getReceiptById(id);
          setReceipt(data);
          if (data?.store_name) {
            await fetchStoreLogo(data.store_name);
          }
        }
      } catch (error) {
        console.error('Error loading receipt:', error);
        toast.error('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [id, getReceiptById, fetchStoreLogo]);

  const handleDelete = async () => {
    if (!id) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await deleteReceipt(id);
      toast.success('Receipt deleted successfully');
      navigate('/history');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const { formatCurrency } = useCurrency();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="w-full max-w-[430px] p-4 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <div className="w-8" />
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="text-center p-8 max-w-md">
          <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/30 dark:border-gray-700/30">
            <Receipt className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Receipt Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The requested receipt could not be found.</p>
            <Button 
              onClick={() => navigate('/history')} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Back to History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header */}
        <header className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Receipt Details</h1>
          <div className="w-10"></div>
        </header>

        {/* Receipt Content */}
        <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-none space-y-6">
          {/* Store Header Card */}
          <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg overflow-hidden">
            <CardHeader className="pb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 dark:from-blue-500/5 dark:to-purple-600/5"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 flex items-center justify-center overflow-hidden shadow-lg">
                      {logoLoading ? (
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
                        </div>
                      ) : storeLogo ? (
                        <img 
                          src={storeLogo} 
                          alt={receipt.store_name || 'Store logo'}
                          className="h-full w-full object-cover rounded-2xl"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const nextSibling = target.nextElementSibling as HTMLElement;
                            if (nextSibling) {
                              nextSibling.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : (
                        <Store className="h-10 w-10 text-gray-600 dark:text-gray-400" />
                      )}
                      <div className="h-20 w-20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl hidden items-center justify-center">
                        <Store className="h-10 w-10 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white font-bold">
                      {receipt.store_name || 'Unknown Store'}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-2 space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(receipt.date), 'MMM d, yyyy • h:mm a')}</span>
                    </div>
                    <div className="flex items-center text-green-600 dark:text-green-400 text-xs mt-1 space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Verified & Processed</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Amount Summary Card */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 dark:from-blue-500/5 dark:to-purple-600/5 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 rounded-2xl shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {formatCurrency(receipt.total_amount || 0)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {receipt.payment_method || 'Payment method not specified'}
                </div>
                
                {/* Breakdown */}
                <div className="space-y-3">
                  {receipt.subtotal && (
                    <div className="flex justify-between items-center py-2 px-4 bg-white/30 dark:bg-gray-800/30 rounded-xl backdrop-blur-sm">
                      <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(receipt.subtotal)}</span>
                    </div>
                  )}
                  {receipt.tax_amount > 0 && (
                    <div className="flex justify-between items-center py-2 px-4 bg-orange-100/30 dark:bg-orange-800/20 rounded-xl backdrop-blur-sm">
                      <span className="text-orange-700 dark:text-orange-400">Tax</span>
                      <span className="text-orange-900 dark:text-orange-300 font-semibold">{formatCurrency(receipt.tax_amount)}</span>
                    </div>
                  )}
                  {receipt.discount_amount > 0 && (
                    <div className="flex justify-between items-center py-2 px-4 bg-green-100/30 dark:bg-green-800/20 rounded-xl backdrop-blur-sm">
                      <span className="text-green-700 dark:text-green-400">Discount</span>
                      <span className="text-green-900 dark:text-green-300 font-semibold">-{formatCurrency(receipt.discount_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-blue-500" />
                  Items
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-normal bg-gray-100/50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                  {receipt.items?.length || 0} items
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {receipt.items?.length > 0 ? (
                  receipt.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20 hover:scale-[1.02] transition-all duration-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Qty: {item.quantity} × {formatCurrency(item.price || 0)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No items found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Receipt Image */}
          {receipt.image_url && (
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-green-500" />
                  Receipt Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border border-gray-200/30 dark:border-gray-700/30 shadow-lg">
                  <img 
                    src={receipt.image_url} 
                    alt="Receipt" 
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-14 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-14 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-14 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-14 bg-red-50/60 dark:bg-red-900/20 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-900/30 rounded-xl font-medium"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Receipt</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this receipt? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptDetail;
