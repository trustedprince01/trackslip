import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Home, History, Settings, Plus, Search, ArrowDown, Receipt, ShoppingBag, PieChart as PieChartIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpendingChart } from "@/components/SpendingChart";
import { PieChart } from "@/components/PieChart";
import type { PieChartData } from "@/components/PieChart";
import { InsightCard } from "@/components/InsightCard";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { useReceipts } from "@/hooks/useReceipts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCachedStoreLogo } from "@/utils/storeLogo";
import { categorizeItems, getCategorySpending, Category } from "@/utils/categoryUtils";

type Receipt = {
  id: string;
  store_name: string;
  total_amount: number;
  date: string;
  items?: Array<{ id: string; name: string; price: number; quantity: number }>;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [storeLogos, setStoreLogos] = useState<Record<string, string>>({});
  const { receipts, loading, error, fetchReceipts } = useReceipts();
  const { formatCurrency } = useCurrency();
  const { user, profile, signOut } = useAuth();

  const { totalTax, totalDiscount, categoryData } = useMemo(() => {
    if (!receipts.length) return { 
      totalTax: 0, 
      totalDiscount: 0, 
      categoryData: [] as PieChartData[] 
    };
    
    // Extract all items from receipts
    const allItems = receipts.flatMap(receipt => 
      (receipt.items || []).map(item => ({
        ...item,
        receiptDate: receipt.date // Add receipt date for time-based analysis if needed
      }))
    );

    // Categorize all items
    const categorizedItems = categorizeItems(allItems);
    
    // Get spending by category
    const categorySpending = getCategorySpending(categorizedItems);
    
    // Calculate tax and discount totals
    const { tax, discount } = receipts.reduce((acc, receipt) => {
      acc.tax += receipt.tax_amount || 0;
      acc.discount += receipt.discount_amount || 0;
      return acc;
    }, { tax: 0, discount: 0 });
    
    // Map to PieChartData format with consistent colors
    const categoryData = categorySpending.map(({ category, amount }, index) => ({
      name: category,
      value: parseFloat(amount.toFixed(2)),
      color: {
        'Food': '#10b981',        // emerald-500
        'Utilities': '#3b82f6',   // blue-500
        'Shopping': '#8b5cf6',    // violet-500
        'Transportation': '#f59e0b', // amber-500
        'Entertainment': '#ec4899', // pink-500
        'Healthcare': '#6366f1',   // indigo-500
        'Others': '#6b7280'        // gray-500
      }[category] || '#9ca3af'     // gray-400 as fallback
    }));
      
    return {
      totalTax: Math.round(tax * 100) / 100, // Round to 2 decimal places
      totalDiscount: Math.round(discount * 100) / 100,
      categoryData
    };
  }, [receipts]);
  
  // Calculate summary stats and insights
  const { 
    totalSpent, 
    receiptCount, 
    averageSpend,
    topCategory,
    monthlySpending,
    spendingTrend,
    topStore,
    averageDailySpend,
    weeklySpendingTrend,
    subscriptionCosts
  } = useMemo(() => {
    if (!receipts.length) return { 
      totalSpent: 0, 
      receiptCount: 0, 
      averageSpend: 0,
      topCategory: null,
      monthlySpending: {},
      spendingTrend: 0,
      topStore: null
    };
    
    // Basic stats
    const total = receipts.reduce((sum, receipt) => sum + (receipt.total_amount || 0), 0);
    const count = receipts.length;
    const average = count > 0 ? total / count : 0;
    
    // Calculate top category
    const categoryTotals = receipts.reduce((acc, receipt) => {
      const category = receipt.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (receipt.total_amount || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry ? {
      name: topCategoryEntry[0],
      amount: topCategoryEntry[1],
      percentage: Math.round((topCategoryEntry[1] / total) * 100)
    } : null;
    
    // Calculate monthly spending
    const monthlySpending = receipts.reduce((acc, receipt) => {
      if (!receipt.date) return acc;
      const month = new Date(receipt.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + (receipt.total_amount || 0);
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate spending trend (comparing current month to previous month)
    const months = Object.keys(monthlySpending).sort();
    let trend = 0;
    if (months.length >= 2) {
      const currentMonth = months[months.length - 1];
      const prevMonth = months[months.length - 2];
      const currentTotal = monthlySpending[currentMonth];
      const prevTotal = monthlySpending[prevMonth];
      trend = prevTotal ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : 0;
    }
    
    // Find top store by total spent
    const storeTotals = receipts.reduce((acc, receipt) => {
      if (!receipt.store_name) return acc;
      acc[receipt.store_name] = (acc[receipt.store_name] || 0) + (receipt.total_amount || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const topStoreEntry = Object.entries(storeTotals).sort((a, b) => b[1] - a[1])[0];
    const topStore = topStoreEntry ? {
      name: topStoreEntry[0],
      amount: topStoreEntry[1],
      count: receipts.filter(r => r.store_name === topStoreEntry[0]).length
    } : null;

    // Calculate average daily spend
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysInMonth = Math.floor((today.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const averageDailySpend = total / Math.max(1, daysInMonth);

    // Calculate weekly spending trend
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const lastWeekSpend = receipts
      .filter(r => new Date(r.date) < oneWeekAgo)
      .reduce((sum, r) => sum + (r.total_amount || 0), 0);
      
    const thisWeekSpend = receipts
      .filter(r => new Date(r.date) >= oneWeekAgo)
      .reduce((sum, r) => sum + (r.total_amount || 0), 0);
      
    const weeklySpendingTrend = lastWeekSpend > 0 
      ? Math.round(((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100) 
      : 0;

    // Calculate subscription costs (assuming subscriptions have a 'subscription' category or similar)
    const subscriptions = receipts.filter(r => 
      (r.store_name?.toLowerCase().includes('netflix') || 
       r.store_name?.toLowerCase().includes('spotify') ||
       r.store_name?.toLowerCase().includes('premium') ||
       r.category?.toLowerCase() === 'subscription')
    );
    
    const subscriptionCosts = {
      count: new Set(subscriptions.map(s => s.store_name)).size,
      total: subscriptions.reduce((sum, s) => sum + (s.total_amount || 0), 0)
    };
    
    return {
      totalSpent: total,
      receiptCount: count,
      averageSpend: average,
      topCategory,
      monthlySpending,
      spendingTrend: trend,
      topStore,
      averageDailySpend,
      weeklySpendingTrend,
      subscriptionCosts
    };
  }, [receipts]);
  
  // Fetch receipts on component mount
  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);
  
  // Load store logos in useEffect since it has side effects
  useEffect(() => {
    // Load store logos
    const loadStoreLogos = async () => {
      const logos: Record<string, string> = {};
      const uniqueStores = [...new Set(receipts.map(r => r.store_name))];
      
      for (const store of uniqueStores) {
        if (store) {
          const logo = await getCachedStoreLogo(store);
          if (logo) {
            logos[store] = logo;
          }
        }
      }
      
      setStoreLogos(prev => ({
        ...prev,
        ...logos
      }));
    };
    
    if (receipts.length > 0) {
      loadStoreLogos();
    }
  }, [receipts, setStoreLogos]);
  
  // Get recent receipts (last 5)
  const recentReceipts = useMemo(() => {
    return [...receipts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [receipts]);

  const handleAddExpense = () => {
    navigate("/new-expense");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleHistoryClick = () => {
    navigate("/history");
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header Section */}
        <header className="flex justify-between items-center p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20">
          <div>
            <Link to="/" className="cursor-pointer" onClick={async (e) => {
              e.preventDefault();
              // Sign out and then navigate to home
              await signOut();
              navigate('/');
            }}>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">TrackSlip</h1>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'} 👋</p>
          </div>
          <Avatar 
            className="h-12 w-12 ring-2 ring-blue-500/20 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 cursor-pointer"
            onClick={handleSettingsClick}
          >
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email || 'User'} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              {profile?.full_name 
                ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                : user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 px-5 pb-20 pt-2 overflow-y-auto scrollbar-none">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search store, item, amount..."
              className="w-full bg-white/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 backdrop-blur-sm"
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Actual Spent</span>
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {loading ? (
                    <Skeleton className="h-6 w-24 bg-gray-200 dark:bg-gray-700" />
                  ) : (
                    formatCurrency(totalSpent)
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {receiptCount} receipt{receiptCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Total Savings</span>
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-green-500">
                  {loading ? (
                    <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700" />
                  ) : (
                    formatCurrency(totalDiscount)
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">from discounts</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Tax Paid</span>
                  <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-500 text-xs font-bold">₦</span>
                  </div>
                </div>
                <p className="text-xl font-semibold text-yellow-500">
                  {loading ? (
                    <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700" />
                  ) : (
                    formatCurrency(totalTax)
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">this month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Receipts</span>
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-purple-500">
                  {loading ? (
                    <Skeleton className="h-6 w-6 bg-gray-200 dark:bg-gray-700" />
                  ) : (
                    receiptCount
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Spending */}
          <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Spending</h3>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-0">
                  View All
                </Button>
              </div>
              <div className="h-48">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : receipts.length > 0 ? (
                  <SpendingChart receipts={receipts} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <ShoppingBag className="h-8 w-8 mb-2" />
                    <p className="text-sm">No receipt data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <PieChartIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Spending by Category</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-0"
                  onClick={() => navigate('/categories')}
                >
                  View All
                </Button>
              </div>
              <div className="h-64">
                <PieChart 
                  data={categoryData} 
                  loading={loading} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <InsightCard 
            topCategory={topCategory}
            topStore={topStore}
            totalDiscount={totalDiscount}
            spendingTrend={spendingTrend}
            weeklySpendingTrend={weeklySpendingTrend}
            averageDailySpend={averageDailySpend}
            subscriptionCosts={subscriptionCosts}
            loading={loading}
          />

          {/* Recent Expenses */}
          <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Expenses</h3>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-0">
                  View All
                </Button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg bg-gray-200/50 dark:bg-gray-700/50" />
                  ))}
                </div>
              ) : recentReceipts.length > 0 ? (
                <div className="space-y-3">
                  {recentReceipts.map((receipt) => (
                    <div 
                      key={receipt.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors backdrop-blur-sm border border-gray-200/20 dark:border-gray-600/20"
                      onClick={() => navigate(`/receipts/${receipt.id}`)}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-white/50 dark:bg-gray-600/50 flex items-center justify-center overflow-hidden mr-3 border border-gray-200/30 dark:border-gray-600/30">
                          {storeLogos[receipt.store_name] ? (
                            <img 
                              src={storeLogos[receipt.store_name]} 
                              alt={receipt.store_name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // If image fails to load, show fallback
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                                  <rect width="40" height="40" rx="20" fill="%233b82f6" />
                                  <text x="50%" y="55%" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
                                    ${receipt.store_name ? receipt.store_name.charAt(0).toUpperCase() : 'S'}
                                  </text>
                                </svg>`;
                              }}
                            />
                          ) : (
                            <Receipt className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">{receipt.store_name || 'Unknown Store'}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(receipt.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{formatCurrency(receipt.total_amount || 0)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {receipt.items?.length || 0} item{receipt.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShoppingBag className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No receipts yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/new-expense')}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Receipt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <Button 
          className="absolute bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={handleAddExpense}
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Add Expense Modal */}
        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Add New Expense</DialogTitle>
            </DialogHeader>
            <AddExpenseForm onClose={() => setIsExpenseModalOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[430px] h-16 flex justify-around items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-800/20 px-6">
            <Button variant="ghost" className="h-12 flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 rounded-xl flex-1 mx-1">
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl flex-1 mx-1"
              onClick={handleHistoryClick}
            >
              <History size={20} />
              <span className="text-xs mt-1">History</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl flex-1 mx-1"
              onClick={handleSettingsClick}
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

export default Dashboard;
