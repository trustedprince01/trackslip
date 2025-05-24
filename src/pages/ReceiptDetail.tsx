import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Trash2, Share2, Printer, Calendar, MapPin, Receipt, Store } from "lucide-react";
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
          // Fetch store logo when receipt data is loaded
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
    
    if (window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await deleteReceipt(id);
        toast.success('Receipt deleted successfully');
        navigate('/receipts');
      } catch (error) {
        console.error('Error deleting receipt:', error);
        toast.error('Failed to delete receipt');
      } finally {
        setDeleting(false);
      }
    }
  };

  const { formatCurrency } = useCurrency();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark">
        <div className="w-full max-w-[430px] p-4 space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
          <Skeleton className="h-6 w-48 mb-6 bg-gray-800" />
          <Skeleton className="h-80 w-full rounded-lg bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-trackslip-deepdark">
        <div className="text-center p-6 max-w-md">
          <Receipt className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-white">Receipt Not Found</h2>
          <p className="text-gray-400 mb-6">The requested receipt could not be found.</p>
          <Button onClick={() => navigate('/receipts')} className="bg-trackslip-blue hover:bg-trackslip-blue/90">
            Back to Receipts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header */}
        <header className="p-4 border-b border-gray-800 flex items-center justify-between bg-trackslip-deepdark">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-white">Receipt Details</h1>
          <div className="w-10"></div>
        </header>

        {/* Receipt Content */}
        <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-none">
          {/* Store Header Card */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden bg-white/5">
                    {logoLoading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-trackslip-blue animate-spin"></div>
                      </div>
                    ) : storeLogo ? (
                      <img 
                        src={storeLogo} 
                        alt={receipt.store_name || 'Store logo'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback to default icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gradient-to-br from-trackslip-blue to-trackslip-lightBlue rounded-xl flex items-center justify-center">
                        <Store className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="h-16 w-16 bg-gradient-to-br from-trackslip-blue to-trackslip-lightBlue rounded-xl hidden items-center justify-center">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{receipt.store_name || 'Unknown Store'}</CardTitle>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(receipt.date), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Amount Summary Card */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(receipt.total_amount || 0)}
                </div>
                <div className="text-gray-400 text-sm">
                  {receipt.payment_method || 'Payment method not specified'}
                </div>
                
                {/* Breakdown */}
                <div className="mt-4 space-y-2">
                  {receipt.subtotal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatCurrency(receipt.subtotal)}</span>
                    </div>
                  )}
                  {receipt.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax</span>
                      <span className="text-white">{formatCurrency(receipt.tax_amount)}</span>
                    </div>
                  )}
                  {receipt.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount</span>
                      <span className="text-green-400">-{formatCurrency(receipt.discount_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Items
                <span className="text-sm text-gray-400 font-normal">
                  {receipt.items?.length || 0} items
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {receipt.items?.length > 0 ? (
                  receipt.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.name}</p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-400">
                            Qty: {item.quantity} × {formatCurrency(item.price || 0)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No items found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Receipt Image */}
          {receipt.image_url && (
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Receipt Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border border-gray-700">
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
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="outline" className="flex items-center justify-center h-12 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex items-center justify-center h-12 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex items-center justify-center h-12 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-12 bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/30"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetail;
