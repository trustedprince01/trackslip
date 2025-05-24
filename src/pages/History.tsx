
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, ArrowUpDown, Calendar, Trash2, Home, History as HistoryIcon, Settings, Loader2, Receipt, TrendingUp, Store } from "lucide-react";
import { format } from "date-fns";
import { useReceipts } from "@/hooks/useReceipts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getCachedStoreLogo } from "@/utils/storeLogo";

interface StoreLogoCache {
  [key: string]: string | null;
}

const History = () => {
  const navigate = useNavigate();
  const { receipts, loading, deleteReceipt } = useReceipts();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date-newest");
  const [logoCache, setLogoCache] = useState<StoreLogoCache>({});
  const [loadingLogos, setLoadingLogos] = useState<{[key: string]: boolean}>({});

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

  // Load store logos
  useEffect(() => {
    const loadLogos = async () => {
      const uniqueStoreNames = Array.from(new Set(receipts.map(r => r.store_name).filter(Boolean)));
      
      for (const storeName of uniqueStoreNames) {
        if (!storeName || logoCache[storeName] !== undefined) continue;
        
        setLoadingLogos(prev => ({ ...prev, [storeName]: true }));
        try {
          const logo = await getCachedStoreLogo(storeName);
          setLogoCache(prev => ({ ...prev, [storeName]: logo }));
        } catch (error) {
          console.error(`Error loading logo for ${storeName}:`, error);
          setLogoCache(prev => ({ ...prev, [storeName]: null }));
        } finally {
          setLoadingLogos(prev => ({ ...prev, [storeName]: false }));
        }
      }
    };

    if (receipts.length > 0) {
      loadLogos();
    }
  }, [receipts]);

  const getStoreColors = (storeName: string) => {
    const colors = [
      { bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20", accent: "bg-blue-500" },
      { bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20", accent: "bg-emerald-500" },
      { bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/20", accent: "bg-purple-500" },
      { bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20", accent: "bg-orange-500" },
      { bg: "from-pink-500/10 to-pink-600/5", border: "border-pink-500/20", accent: "bg-pink-500" },
    ];
    const hash = storeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="w-full max-w-[430px] p-4 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <div className="w-8" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header */}
        <header className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Receipt History</h1>
            <div className="w-10"></div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search store, item, amount..."
              className="pl-12 h-12 bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort and Filter */}
          <div className="flex items-center justify-between gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const sortOptions = [
                  { value: "date-newest", label: "Newest" },
                  { value: "date-oldest", label: "Oldest" },
                  { value: "amount-high", label: "Highest" },
                  { value: "amount-low", label: "Lowest" },
                  { value: "store-az", label: "A-Z" },
                  { value: "store-za", label: "Z-A" }
                ];
                const currentIndex = sortOptions.findIndex(opt => opt.value === sortBy);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortBy(sortOptions[nextIndex].value);
              }}
              className="flex-1 bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/30 rounded-xl border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Date filters coming soon</span>
              </div>
            </div>
          )}
        </header>

        {/* Receipt List */}
        <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-none pb-24 space-y-4">
          {filteredAndSortedReceipts.length > 0 ? (
            filteredAndSortedReceipts.map((receipt, index) => {
              const storeColors = getStoreColors(receipt.store_name || '');
              return (
                <Card 
                  key={receipt.id} 
                  className={`bg-gradient-to-r ${storeColors.bg} backdrop-blur-sm border ${storeColors.border} hover:scale-[1.02] transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl rounded-2xl overflow-hidden`}
                  onClick={() => navigate(`/receipts/${receipt.id}`)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeIn 0.6s ease-out forwards'
                  }}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`h-16 w-16 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 flex items-center justify-center overflow-hidden`}>
                            {loadingLogos[receipt.store_name || ''] ? (
                              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            ) : logoCache[receipt.store_name || ''] ? (
                              <>
                                <img 
                                  src={logoCache[receipt.store_name || ''] || ''} 
                                  alt={receipt.store_name || 'Store'}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.classList.remove('hidden');
                                    }
                                  }}
                                />
                                <div className="hidden h-16 w-16 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl items-center justify-center">
                                  <Store className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                </div>
                              </>
                            ) : (
                              <Store className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                            )}
                            <div className="h-16 w-16 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl hidden items-center justify-center">
                              <Store className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${storeColors.accent} rounded-full flex items-center justify-center`}>
                            <Receipt className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate" title={receipt.store_name || 'Unknown Store'}>
                            {receipt.store_name || 'Unknown Store'}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(receipt.date), 'MMM d, yyyy')}</span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span>{receipt.items?.length || 0} items</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 dark:border-gray-700/20">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(receipt.total_amount || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    {receipt.items && receipt.items.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wide uppercase">Items</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{receipt.items.length} total</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {receipt.items.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 dark:border-gray-700/20">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${storeColors.accent}`}></div>
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(item.price || 0)}</span>
                              </div>
                            </div>
                          ))}
                          {receipt.items.length > 3 && (
                            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10 dark:border-gray-700/10">
                              <span className="text-xs text-gray-600 dark:text-gray-400">+{receipt.items.length - 3} more</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Tracked & Analyzed</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReceipt(receipt.id, receipt.store_name || 'this store');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/20">
                <HistoryIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No receipts found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Try a different search term' : 'Start by adding your first receipt'}
                </p>
                <Button 
                  onClick={() => navigate('/new-expense')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-xl"
                >
                  Add Your First Receipt
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[430px] h-16 flex justify-around items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-800/20 px-6">
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl flex-1 mx-1"
              onClick={() => navigate('/dashboard')}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 rounded-xl flex-1 mx-1"
            >
              <HistoryIcon size={20} />
              <span className="text-xs mt-1">History</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl flex-1 mx-1"
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
