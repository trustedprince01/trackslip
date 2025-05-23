import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, Trash2, Edit, Share2, Printer } from "lucide-react";
import { format } from "date-fns";
import { useReceipts } from "@/hooks/useReceipts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ReceiptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReceiptById, deleteReceipt } = useReceipts();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        if (id) {
          const data = await getReceiptById(id);
          setReceipt(data);
        }
      } catch (error) {
        console.error('Error loading receipt:', error);
        toast.error('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [id, getReceiptById]);

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
      <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark text-white">
        <div className="w-full max-w-[430px] p-4 space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-trackslip-deepdark text-white">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Receipt Not Found</h2>
          <p className="text-gray-400 mb-6">The requested receipt could not be found.</p>
          <Button onClick={() => navigate('/receipts')}>Back to Receipts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark text-white">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header */}
        <header className="p-4 border-b border-trackslip-border flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Receipt Details</h1>
          <div className="w-10"></div> {/* For balance */}
        </header>

        {/* Receipt Content */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <Card className="bg-trackslip-dark border-trackslip-border">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{receipt.store_name || 'Unknown Store'}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {format(new Date(receipt.date), 'MMMM d, yyyy • h:mm a')}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(receipt.total_amount || 0)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {receipt.payment_method || 'Payment method not specified'}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Receipt Items */}
              <div className="border-t border-trackslip-border pt-4">
                <h3 className="font-medium mb-3">Items</h3>
                <div className="space-y-3">
                  {receipt.items?.length > 0 ? (
                    receipt.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-400">
                              {item.quantity} × {formatCurrency(item.price || 0)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p>{formatCurrency((item.price || 0) * (item.quantity || 1))}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No items found</p>
                  )}
                </div>
              </div>

              {/* Receipt Image */}
              {receipt.image_url && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Receipt Image</h3>
                  <div className="rounded-lg overflow-hidden border border-trackslip-border">
                    <img 
                      src={receipt.image_url} 
                      alt="Receipt" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="mt-6 space-y-2 text-sm">
                {receipt.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span>{formatCurrency(receipt.tax_amount)}</span>
                  </div>
                )}
                {receipt.tip_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tip</span>
                    <span>{formatCurrency(receipt.tip_amount)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-4 gap-3">
            <Button variant="outline" className="flex flex-col h-auto py-3">
              <Download className="h-5 w-5 mb-1" />
              <span className="text-xs">PDF</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-3">
              <Share2 className="h-5 w-5 mb-1" />
              <span className="text-xs">Share</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-3">
              <Printer className="h-5 w-5 mb-1" />
              <span className="text-xs">Print</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-3 text-red-500 hover:text-red-400 hover:border-red-400"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-5 w-5 mb-1" />
              <span className="text-xs">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetail;
