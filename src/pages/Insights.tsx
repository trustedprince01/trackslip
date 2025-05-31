import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  PieChart, 
  BarChart3, 
  AlertCircle, 
  Target,
  ShoppingBag,
  Tag,
  Percent,
  Clock,
  CalendarDays,
  CreditCard,
  Home,
  History,
  Settings
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useReceipts } from "@/hooks/useReceipts";
import { categorizeItem } from "@/utils/categoryUtils";
import { format, subMonths, isThisMonth, isThisWeek, subWeeks, isAfter, isBefore } from "date-fns";
import SmartRecommendationModal from "@/components/SmartRecommendationModal";

// Define a type for the processed receipt data
interface ProcessedReceipt {
  id: string;
  store_name?: string;
  date: Date;
  total_amount: number;
  items?: Array<{
    id?: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

const Insights = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { receipts, loading } = useReceipts();
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleApplyRecommendation = (recommendation: any) => {
    // Filter receipts for the selected category
    const categoryReceipts = receipts.filter(
      receipt => receipt.category === recommendation.category
    );
    
    // Calculate total amount for the category
    const totalAmount = categoryReceipts.reduce(
      (sum, receipt) => sum + (receipt.total_amount || 0), 0
    );

    // Calculate total spent across all receipts
    const totalSpent = receipts.reduce(
      (sum, receipt) => sum + (receipt.total_amount || 0), 0
    );

    setSelectedRecommendation({
      ...recommendation,
      amount: totalAmount,
      percentage: totalSpent > 0 ? (totalAmount / totalSpent) * 100 : 0
    });
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecommendation(null);
  };

  // Process receipt data for insights
  const { recommendations: insightsRecommendations, ...insights } = useMemo(() => {
    console.log('Receipts data:', receipts);
    if (!receipts || !receipts.length) {
      console.log('No receipts data available');
      return {
        monthlyTrend: 0,
        weeklyTrend: 0,
        topCategory: null,
        topStore: null,
        subscriptionCosts: { count: 0, total: 0 },
        averageDailySpend: 0,
        currentMonthSpending: 0,
        paymentMethods: {},
        timeOfDaySpending: {},
        recommendations: [{
          title: 'No Receipts Found',
          description: 'Start by adding some receipts to see AI-powered insights',
          impact: '',
          priority: 'neutral'
        }]
      };
    }

    // Ensure dates are properly parsed and typed
    const processedReceipts: ProcessedReceipt[] = receipts.map(receipt => {
      const processed: ProcessedReceipt = {
        id: receipt.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        store_name: receipt.store_name,
        date: receipt.date instanceof Date ? receipt.date : new Date(receipt.date),
        total_amount: receipt.total_amount || 0,
        items: receipt.items || [],
        created_at: receipt.created_at instanceof Date 
          ? receipt.created_at 
          : new Date(receipt.created_at || Date()),
        updated_at: receipt.updated_at instanceof Date 
          ? receipt.updated_at 
          : new Date(receipt.updated_at || Date()),
        ...receipt // Spread the rest of the properties to maintain compatibility
      };
      return processed;
    });

    // Calculate monthly spending
    const monthlySpending = processedReceipts.reduce((acc, receipt) => {
      if (!receipt.date) return acc;
      const month = new Date(receipt.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + (receipt.total_amount || 0);
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate monthly trend (comparing current month to previous month)
    const months = Object.keys(monthlySpending).sort();
    let monthlyTrend = 0;
    if (months.length >= 2) {
      const currentMonth = months[months.length - 1];
      const prevMonth = months[months.length - 2];
      const currentTotal = monthlySpending[currentMonth];
      const prevTotal = monthlySpending[prevMonth];
      monthlyTrend = prevTotal ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : 0;
    }
    
    // Get current date for calculations
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'short' });
    const currentMonthSpending = monthlySpending[currentMonthName] || 0;

    // Calculate weekly spending trend
    const thisWeekSpending = processedReceipts
      .filter(receipt => {
        try {
          return isThisWeek(receipt.date);
        } catch (e) {
          console.error('Error processing this week date:', e);
          return false;
        }
      })
      .reduce((sum, receipt) => sum + receipt.total_amount, 0);
      
    const lastWeekStart = subWeeks(new Date(), 1);
    const lastWeekEnd = new Date();
    const lastWeekSpending = processedReceipts
      .filter(receipt => {
        try {
          return receipt.date >= lastWeekStart && receipt.date <= lastWeekEnd;
        } catch (e) {
          console.error('Error filtering last week:', e);
          return false;
        }
      })
      .reduce((sum, receipt) => sum + receipt.total_amount, 0);
      
    const weeklyTrend = lastWeekSpending > 0
      ? Math.round(((thisWeekSpending - lastWeekSpending) / lastWeekSpending) * 100)
      : 0;

    // Calculate category totals and payment methods
    const categoryTotals: Record<string, number> = {};
    
    processedReceipts.forEach(receipt => {
      // First try to get the category from the receipt itself
      // If not available, try to determine it from items
      let category = receipt.category;
      
      if (!category && receipt.items && receipt.items.length > 0) {
        // Try to get category from items if not set at receipt level
        const itemCategories = new Set<string>();
        receipt.items.forEach(item => {
          const itemCategory = item.category || categorizeItem(item.name);
          if (itemCategory) {
            itemCategories.add(itemCategory);
          }
        });
        
        // If all items have the same category, use that
        if (itemCategories.size === 1) {
          category = Array.from(itemCategories)[0];
        }
      }
      
      // Default to 'Others' if no category could be determined
      const finalCategory = category || 'Others';
      
      // Use the receipt's total_amount for the category total
      categoryTotals[finalCategory] = (categoryTotals[finalCategory] || 0) + (receipt.total_amount || 0);
    });
    
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];
    
    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const topCategoryPercentage = totalSpent > 0 ? Math.round((topCategory?.[1] / totalSpent) * 100) : 0;
    
    // Calculate payment method breakdown
    const paymentMethods = processedReceipts.reduce<Record<string, number>>((acc, receipt) => {
      const method = receipt.payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + (receipt.total_amount || 0);
      return acc;
    }, {});
    
    // Calculate time of day spending
    const timeOfDaySpending = processedReceipts.reduce<Record<string, number>>((acc, receipt) => {
      if (!receipt.time) return acc;
      
      try {
        const hour = parseInt(receipt.time.split(':')[0]);
        let timeOfDay = 'Evening';
        
        if (hour < 12) timeOfDay = 'Morning';
        else if (hour < 17) timeOfDay = 'Afternoon';
        
        acc[timeOfDay] = (acc[timeOfDay] || 0) + (receipt.total_amount || 0);
      } catch (e) {
        console.error('Error processing time:', receipt.time, e);
      }
      
      return acc;
    }, {});

    // Calculate top store
    const storeTotals = processedReceipts.reduce<Record<string, number>>((acc, receipt) => {
      const storeName = receipt.store_name || 'Unknown Store';
      acc[storeName] = (acc[storeName] || 0) + receipt.total_amount;
      return acc;
    }, {});
    
    const topStore = Object.entries(storeTotals)
      .sort((a, b) => b[1] - a[1])[0];
    
    const topStoreVisitCount = processedReceipts
      .filter(receipt => receipt.store_name === topStore?.[0])
      .length;

    // Calculate subscription costs
    const subscriptions = processedReceipts.filter(receipt => {
      const storeName = (receipt.store_name || '').toLowerCase();
      return (
        storeName.includes('netflix') || 
        storeName.includes('spotify') ||
        storeName.includes('premium') ||
        storeName.includes('subscription') ||
        (receipt.items?.some(item => 
          (item.category || '').toLowerCase() === 'subscription'
        ))
      );
    });
    
    const subscriptionCosts = {
      count: new Set(subscriptions.map(sub => sub.store_name)).size,
      total: subscriptions.reduce((sum, sub) => sum + sub.total_amount, 0)
    };

    // Calculate daily average
    const daysInMonth = new Date(
      currentDate.getFullYear(), 
      currentDate.getMonth() + 1, 
      0
    ).getDate();
    const averageDailySpend = currentMonthSpending / daysInMonth;

    // Generate recommendations
    const recommendations = [];
    
    if (topCategory && topCategory[1] > (totalSpent * 0.4)) {
      // Calculate potential savings as 15% of the top category spending
      const potentialSavings = topCategory[1] * 0.15;
      recommendations.push({
        title: `Reduce ${topCategory[0]} Spending`,
        description: `Your ${topCategory[0].toLowerCase()} spending is ${topCategoryPercentage}% of total expenses`,
        impact: `Potential savings: ${formatCurrency(potentialSavings)}/month`,
        priority: "high",
        category: topCategory[0],
        amount: topCategory[1],
        percentage: topCategoryPercentage,
        potentialSavings: potentialSavings
      });
    }
    
    if (subscriptionCosts.count > 0) {
      recommendations.push({
        title: "Review Subscriptions",
        description: `You have ${subscriptionCosts.count} active subscriptions`,
        impact: `Monthly cost: ${formatCurrency(subscriptionCosts.total)}`,
        priority: "medium"
      });
    }
    
    if (monthlyTrend > 10) {
      recommendations.push({
        title: "Spending Alert",
        description: `Your spending is up ${monthlyTrend}% from last month`,
        impact: "Consider reviewing your budget",
        priority: "high"
      });
    } else if (monthlyTrend < -5) {
      recommendations.push({
        title: "Great Job!",
        description: `You've reduced spending by ${Math.abs(monthlyTrend)}% from last month`,
        impact: "Keep up the good work!",
        priority: "low"
      });
    }

    return {
      monthlyTrend,
      weeklyTrend,
      topCategory: topCategory ? {
        name: topCategory[0],
        amount: topCategory[1],
        percentage: topCategoryPercentage
      } : null,
      topStore: topStore ? {
        name: topStore[0],
        amount: topStore[1],
        count: topStoreVisitCount
      } : null,
      subscriptionCosts,
      averageDailySpend,
      currentMonthSpending,
      paymentMethods,
      timeOfDaySpending,
      recommendations: recommendations.length > 0 
        ? recommendations 
        : [{
            title: "No Recommendations",
            description: "Your spending patterns look good!",
            impact: "Check back later for more insights",
            priority: "neutral"
          }]
    };
  }, [receipts]);

  const isTrendPositive = (value: number) => value >= 0;
  const getTrendColor = (value: number) => 
    isTrendPositive(value) ? "text-green-500" : "text-red-500";
  const getTrendIcon = (value: number) =>
    isTrendPositive(value) ? 
      <TrendingUp className="h-5 w-5 text-green-500" /> : 
      <TrendingDown className="h-5 w-5 text-red-500" />;

  const insightCards = [
    {
      id: 1,
      title: "Monthly Spending Trend",
      icon: getTrendIcon(insights?.monthlyTrend || 0),
      value: `${Math.abs(insights?.monthlyTrend || 0)}%`,
      description: insights?.monthlyTrend !== undefined 
        ? `${isTrendPositive(insights.monthlyTrend) ? 'Increase' : 'Decrease'} from last month` 
        : "No data",
      trend: isTrendPositive(insights?.monthlyTrend || 0) ? "positive" : "negative",
      detail: insights?.monthlyTrend !== undefined
        ? `Your spending ${isTrendPositive(insights.monthlyTrend) ? 'increased' : 'decreased'} by ${Math.abs(insights.monthlyTrend)}% compared to last month.`
        : "Not enough data to calculate monthly trend."
    },
    {
      id: 2,
      title: "Top Spending Category",
      icon: <Tag className="h-5 w-5 text-blue-500" />,
      value: insights?.topCategory?.name || "N/A",
      description: insights?.topCategory 
        ? `${insights.topCategory.percentage}% of total` 
        : "No category data",
      trend: "neutral",
      detail: insights?.topCategory
        ? `You've spent ${formatCurrency(insights.topCategory.amount)} on ${insights.topCategory.name.toLowerCase()} this month.`
        : "No category data available."
    },
    {
      id: 3,
      title: "Top Payment Method",
      icon: <CreditCard className="h-5 w-5 text-purple-500" />,
      value: insights?.paymentMethods ? Object.entries(insights.paymentMethods)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A" : "N/A",
      description: insights?.paymentMethods ? `${Object.keys(insights.paymentMethods).length} methods used` : "No data",
      trend: "neutral",
      detail: insights?.paymentMethods 
        ? `Your most used payment method is ${Object.entries(insights.paymentMethods)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'}.`
        : "No payment method data available."
    },
    {
      id: 4,
      title: "Peak Spending Time",
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      value: insights?.timeOfDaySpending ? Object.entries(insights.timeOfDaySpending)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A" : "N/A",
      description: insights?.timeOfDaySpending ? `Out of ${Object.keys(insights.timeOfDaySpending).length} time periods` : "No data",
      trend: "neutral",
      detail: insights?.timeOfDaySpending && Object.keys(insights.timeOfDaySpending).length > 0
        ? `You spend the most during ${Object.entries(insights.timeOfDaySpending)
            .sort((a, b) => b[1] - a[1])[0]?.[0]?.toLowerCase()} hours.`
        : "Not enough data to determine peak spending time."
    },
    {
      id: 5,
      title: "Total Monthly Spend",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      value: insights?.currentMonthSpending ? formatCurrency(insights.currentMonthSpending) : "N/A",
      description: "Current month's total spending",
      trend: "neutral",
      detail: insights?.currentMonthSpending !== undefined
        ? `You've spent a total of ${formatCurrency(insights.currentMonthSpending)} this month.`
        : "No spending data available for this month."
    },
    {
      id: 6,
      title: "Daily Average",
      icon: <Calendar className="h-5 w-5 text-pink-500" />,
      value: insights?.averageDailySpend ? formatCurrency(insights.averageDailySpend) : "N/A",
      description: "Average daily spending this month",
      trend: "neutral",
      detail: insights?.averageDailySpend !== undefined
        ? `You spend an average of ${formatCurrency(insights.averageDailySpend)} per day.`
        : "Not enough data to calculate daily average."
    },
    {
      id: 7,
      title: "Top Store",
      icon: <ShoppingBag className="h-5 w-5 text-teal-500" />,
      value: insights?.topStore?.name || "N/A",
      description: insights?.topStore ? `${insights.topStore.count} visits` : "No store data",
      trend: "neutral",
      detail: insights?.topStore
        ? `You've spent ${formatCurrency(insights.topStore.amount)} across ${insights.topStore.count} visits.`
        : "No store data available."
    },
    {
      id: 8,
      title: "Payment Methods",
      icon: <CreditCard className="h-5 w-5 text-indigo-500" />,
      value: insights?.paymentMethods ? `${Object.keys(insights.paymentMethods).length} used` : "N/A",
      description: insights?.paymentMethods 
        ? `Total spent: ${formatCurrency(Object.values(insights.paymentMethods).reduce((a, b) => a + b, 0))}`
        : "No payment data",
      trend: "neutral",
      detail: insights?.paymentMethods
        ? `You've used ${Object.keys(insights.paymentMethods).length} different payment methods.`
        : "No payment method data available."
    },
    {
      id: 9,
      title: "Subscriptions",
      icon: <CalendarDays className="h-5 w-5 text-yellow-500" />,
      value: insights?.subscriptionCosts ? `${insights.subscriptionCosts.count} active` : "N/A",
      description: insights?.subscriptionCosts 
        ? `Total: ${formatCurrency(insights.subscriptionCosts.total)}` 
        : "No subscription data",
      trend: "neutral",
      detail: insights?.subscriptionCosts
        ? `You have ${insights.subscriptionCosts.count} active subscriptions costing ${formatCurrency(insights.subscriptionCosts.total)} in total.`
        : "No subscription data available."
    }
  ];

  // Generate AI-powered recommendations
  const recommendations = useMemo(() => {
    if (!insights.topCategory) {
      return [{
        title: "Analyzing your spending...",
        description: "We're processing your receipts to provide personalized recommendations",
        impact: "",
        priority: "neutral"
      }];
    }

    return [
      {
        title: `Optimize ${insights.topCategory.name} Spending`,
        description: `You've spent ${formatCurrency(insights.topCategory.amount)} on ${insights.topCategory.name.toLowerCase()} this month`,
        impact: "",
        priority: "high",
        category: insights.topCategory.name,
        amount: insights.topCategory.amount,
        percentage: insights.topCategory.percentage
      },      ...(insights.subscriptionCosts.count > 0 ? [{
        title: "Review Subscriptions",
        description: `You have ${insights.subscriptionCosts.count} active subscriptions`,
        impact: `Monthly cost: ${formatCurrency(insights.subscriptionCosts.total)}`,
        priority: "medium",
        category: "Subscriptions"
      }] : []),
      {
        title: "Weekly Spending Trend",
        description: insights.weeklyTrend > 0 
          ? `Your spending is up ${insights.weeklyTrend}% this week` 
          : `Your spending is down ${Math.abs(insights.weeklyTrend)}% this week`,
        impact: insights.weeklyTrend > 0 ? "Consider reviewing your budget" : "Great job!",
        priority: insights.weeklyTrend > 10 ? "high" : "low",
        category: "Overall Spending"
      }
    ];
  }, [insights]);

  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black transition-colors duration-300">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header Section */}
        <header className="flex items-center p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10 p-0" 
            onClick={handleBack}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Insights
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-20 pt-6 overflow-y-auto scrollbar-none space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">This Month</p>
                    <p className="text-2xl font-bold">{formatCurrency(insights?.currentMonthSpending || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Saved</p>
                    <p className="text-2xl font-bold">{formatCurrency(insights?.subscriptionCosts?.total ? (insights.currentMonthSpending - insights.subscriptionCosts.total) : 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Financial Insights
            </h2>
            <div className="space-y-4">
              {insightCards.map((insight) => (
                <Card key={insight.id} className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {insight.title}
                          </h3>
                          <span className={`text-sm font-semibold ${
                            insight.trend === 'positive' ? 'text-green-600 dark:text-green-400' :
                            insight.trend === 'negative' ? 'text-red-600 dark:text-red-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`}>
                            {insight.value}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {insight.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {insight.detail}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Smart Recommendations */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Smart Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={index} className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {rec.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rec.description}
                        </p>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2">
                          {rec.impact}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => handleApplyRecommendation(rec)}
                        disabled={loading}
                      >
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendation Modal */}
      <SmartRecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={selectedRecommendation}
        receipts={receipts}
      />
      
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
            className="h-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl flex-1 mx-1"
            onClick={() => navigate('/history')}
          >
            <History size={20} />
            <span className="text-xs mt-1">History</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="h-12 flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 rounded-xl flex-1 mx-1"
          >
            <BarChart3 size={20} />
            <span className="text-xs mt-1">Insights</span>
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
  );
};

export default Insights;
