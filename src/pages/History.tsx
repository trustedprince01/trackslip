
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, ArrowUpDown, Calendar, Trash2, Home, History as HistoryIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { useReceipts } from "@/hooks/useReceipts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";

const History = () => {
  const navigate = useNavigate();
  const { receipts, loading, deleteReceipt } = useReceipts();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date-newest");

  // Filter and sort receipts
  const filteredAndSortedReceipts = receipts
    .filter(receipt => {
      const searchLower = searchTerm.toLowerCase();
      return (
        receipt.store_name?.toLowerCase().includes(searchLower) ||
        receipt.items?.some(item => 
          item.name.toLowerCase().includes(searchLower)
        ) ||
        receipt.total_amount?.toString().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-high":
          return (b.total_amount || 0) - (a.total_amount || 0);
        case "amount-low":
          return (a.total_amount || 0) - (b.total_amount || 0);
        case "store-az":
          return (a.store_name || "").localeCompare(b.store_name || "");
        case "store-za":
          return (b.store_name || "").localeCompare(a.store_name || "");
        default:
          return 0;
      }
    });

  const handleDeleteReceipt = async (id: string, storeName: string) => {
    if (window.confirm(`Are you sure you want to delete the receipt from ${storeName}?`)) {
      try {
        await deleteReceipt(id);
      } catch (error) {
        console.error('Error deleting receipt:', error);
      }
    }
  };

  const getStoreColors = (storeName: string) => {
    const colors = [
      { bg: "from-blue-600/20 to-blue-800/20", border: "border-blue-600/30", text: "text-blue-400" },
      { bg: "from-red-600/20 to-red-800/20", border: "border-red-600/30", text: "text-red-400" },
      { bg: "from-green-600/20 to-green-800/20", border: "border-green-600/30", text: "text-green-400" },
      { bg: "from-purple-600/20 to-purple-800/20", border: "border-purple-600/30", text: "text-purple-400" },
      { bg: "from-orange-600/20 to-orange-800/20", border: "border-orange-600/30", text: "text-orange-400" },
    ];
    const hash = storeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark">
        <div className="w-full max-w-[430px] p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header */}
        <header className="p-4 border-b border-gray-800 bg-trackslip-deepdark">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-white">History</h1>
            <div className="w-10"></div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search store, item, amount..."
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort and Filter */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const sortOptions = [
                  { value: "date-newest", label: "Date (Newest)" },
                  { value: "date-oldest", label: "Date (Oldest)" },
                  { value: "amount-high", label: "Amount (High)" },
                  { value: "amount-low", label: "Amount (Low)" },
                  { value: "store-az", label: "Store (A-Z)" },
                  { value: "store-za", label: "Store (Z-A)" }
                ];
                const currentIndex = sortOptions.findIndex(opt => opt.value === sortBy);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortBy(sortOptions[nextIndex].value);
              }}
              className="bg-gray-800 border-gray-700 text-trackslip-blue hover:bg-gray-700"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 border-gray-700 text-trackslip-blue hover:bg-gray-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Date filters coming soon</span>
              </div>
            </div>
          )}
        </header>

        {/* Receipt List */}
        <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-none pb-24">
          {filteredAndSortedReceipts.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedReceipts.map((receipt) => {
                const storeColors = getStoreColors(receipt.store_name || '');
                return (
                  <Card 
                    key={receipt.id} 
                    className={`bg-gradient-to-r ${storeColors.bg} border ${storeColors.border} hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
                    onClick={() => navigate(`/receipts/${receipt.id}`)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${storeColors.bg} border ${storeColors.border} flex items-center justify-center`}>
                            <span className={`text-xl font-bold ${storeColors.text}`}>
                              {(receipt.store_name || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {receipt.store_name || 'Unknown Store'}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {receipt.items?.length ? `${receipt.items.length} items` : 'Take Out'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full bg-gray-800/70 ${storeColors.text} font-semibold`}>
                            {formatCurrency(receipt.total_amount || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-gray-400 text-sm mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(receipt.date), 'MMM d, yyyy')}
                      </div>

                      {/* Items Preview */}
                      {receipt.items && receipt.items.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold tracking-wide">ITEMS</span>
                            <span className="text-xs text-gray-400">{receipt.items.length} items</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {receipt.items.slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-1">
                                <div className={`w-2 h-2 rounded-full ${storeColors.text.replace('text-', 'bg-')}`}></div>
                                <span className="text-xs text-gray-300">{item.name}</span>
                                <span className="text-xs text-gray-400">{formatCurrency(item.price || 0)}</span>
                              </div>
                            ))}
                            {receipt.items.length > 2 && (
                              <div className="bg-gray-800/50 rounded-lg px-3 py-1">
                                <span className="text-xs text-gray-400">+{receipt.items.length - 2} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delete Button */}
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReceipt(receipt.id, receipt.store_name || 'this store');
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <HistoryIcon className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No receipts found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try a different search term' : 'Start by adding your first receipt'}
              </p>
              <Button 
                onClick={() => navigate('/new-expense')}
                className="bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue hover:opacity-90"
              >
                Add Your First Receipt
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[430px] h-16 flex justify-around items-center bg-gray-900 border-t border-gray-800 px-6">
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1"
              onClick={() => navigate('/dashboard')}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-trackslip-blue rounded-xl flex-1 mx-1"
            >
              <HistoryIcon size={20} />
              <span className="text-xs mt-1">History</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1"
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
              <span className="text-xs mt-1">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
