import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Receipt, Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useReceipts } from "@/hooks/useReceipts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";

const ReceiptsPage = () => {
  const navigate = useNavigate();
  const { receipts, loading, error } = useReceipts();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter receipts based on search term
  const filteredReceipts = receipts.filter(receipt => {
    const searchLower = searchTerm.toLowerCase();
    return (
      receipt.store_name?.toLowerCase().includes(searchLower) ||
      receipt.items?.some(item => 
        item.name.toLowerCase().includes(searchLower)
      )
    );
  });

  // Format currency is now provided by the CurrencyContext

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-trackslip-deepdark text-white">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Receipts</h2>
          <p className="text-gray-400 mb-6">There was a problem loading your receipts. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
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
          <h1 className="text-xl font-semibold">My Receipts</h1>
          <div className="w-10"></div> {/* For balance */}
        </header>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search receipts..."
              className="pl-10 bg-trackslip-dark border-trackslip-border text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Receipts List */}
        <div className="flex-1 px-4 pb-24 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg bg-trackslip-border/50" />
              ))}
            </div>
          ) : filteredReceipts.length > 0 ? (
            <div className="space-y-3">
              {filteredReceipts.map((receipt) => (
                <Card 
                  key={receipt.id} 
                  className="bg-trackslip-dark border-trackslip-border hover:bg-trackslip-border/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/receipts/${receipt.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{receipt.store_name || 'Unknown Store'}</h3>
                        <p className="text-sm text-gray-400">
                          {format(new Date(receipt.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {receipt.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(receipt.total_amount || 0)}</p>
                        <div className="mt-1 text-xs text-gray-400">
                          {receipt.payment_method || 'Unknown payment'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Receipt className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-1">No receipts found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try a different search term' : 'Start by adding your first receipt'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/new-expense')}>
                  <Plus className="h-4 w-4 mr-2" /> Add Receipt
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-4">
          <Button 
            size="lg" 
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => navigate('/new-expense')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptsPage;
