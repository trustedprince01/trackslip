import React from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target, 
  ChevronRight, 
  ShoppingBag,
  Tag,
  Percent,
  Clock,
  CalendarDays,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

type InsightCardProps = {
  topCategory?: {
    name: string;
    amount: number;
    percentage: number;
  } | null;
  topStore?: {
    name: string;
    amount: number;
    count: number;
  } | null;
  totalDiscount: number;
  spendingTrend: number;
  weeklySpendingTrend: number;
  averageDailySpend: number;
  subscriptionCosts?: {
    count: number;
    total: number;
  };
  loading: boolean;
};

export const InsightCard: React.FC<InsightCardProps> = ({
  topCategory,
  topStore,
  totalDiscount,
  spendingTrend,
  weeklySpendingTrend,
  averageDailySpend,
  subscriptionCosts = { count: 0, total: 0 },
  loading
}) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  
  const isTrendPositive = (value: number) => value >= 0;
  
  const insightCards = [
    {
      id: 1,
      title: "Monthly Spending Trend",
      icon: isTrendPositive(spendingTrend) ? (
        <TrendingUpIcon className="h-5 w-5 text-green-500" />
      ) : (
        <TrendingDownIcon className="h-5 w-5 text-red-500" />
      ),
      value: `${Math.abs(spendingTrend)}% ${isTrendPositive(spendingTrend) ? 'increase' : 'decrease'}`,
      description: "Compared to last month",
      trend: isTrendPositive(spendingTrend) ? "positive" : "negative",
      detail: `Your spending ${isTrendPositive(spendingTrend) ? 'increased' : 'decreased'} by ${Math.abs(spendingTrend)}% compared to last month.`
    },
    {
      id: 2,
      title: "Top Spending Category",
      icon: <Tag className="h-5 w-5 text-blue-500" />,
      value: topCategory?.name || "N/A",
      description: topCategory ? `${topCategory.percentage}% of total` : "No category data",
      trend: "neutral",
      detail: topCategory 
        ? `You've spent ${formatCurrency(topCategory.amount)} on ${topCategory.name.toLowerCase()} this month.`
        : "No category data available."
    },
    {
      id: 3,
      title: "Top Store",
      icon: <ShoppingBag className="h-5 w-5 text-purple-500" />,
      value: topStore?.name || "N/A",
      description: topStore ? `${topStore.count} visits` : "No store data",
      trend: "neutral",
      detail: topStore 
        ? `You've spent ${formatCurrency(topStore.amount)} across ${topStore.count} visits.`
        : "No store data available."
    },
    {
      id: 4,
      title: "Total Savings",
      icon: <Percent className="h-5 w-5 text-green-500" />,
      value: formatCurrency(totalDiscount),
      description: "Saved from discounts",
      trend: "positive",
      detail: `You've saved a total of ${formatCurrency(totalDiscount)} from discounts and promotions.`
    },
    {
      id: 5,
      title: "Daily Average",
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      value: formatCurrency(averageDailySpend),
      description: "Average daily spending",
      trend: "neutral",
      detail: `You spend an average of ${formatCurrency(averageDailySpend)} per day.`
    },
    {
      id: 6,
      title: "Weekly Trend",
      icon: isTrendPositive(weeklySpendingTrend) ? (
        <TrendingUpIcon className="h-5 w-5 text-green-500" />
      ) : (
        <TrendingDownIcon className="h-5 w-5 text-red-500" />
      ),
      value: `${Math.abs(weeklySpendingTrend)}% ${isTrendPositive(weeklySpendingTrend) ? 'increase' : 'decrease'}`,
      description: "Compared to last week",
      trend: isTrendPositive(weeklySpendingTrend) ? "positive" : "negative",
      detail: `Your spending this week is ${Math.abs(weeklySpendingTrend)}% ${isTrendPositive(weeklySpendingTrend) ? 'higher' : 'lower'} than last week.`
    },
    {
      id: 7,
      title: "Subscriptions",
      icon: <CalendarDays className="h-5 w-5 text-indigo-500" />,
      value: `${subscriptionCosts.count} active`,
      description: `Total: ${formatCurrency(subscriptionCosts.total)}`,
      trend: "neutral",
      detail: "Your subscription costs are being tracked"
    },
    {
      id: 2,
      title: "Top Spending Category",
      icon: <DollarSign className="h-5 w-5 text-blue-500" />,
      value: topCategory?.name || "N/A",
      description: `${topCategory?.percentage || 0}% of total expenses`,
      trend: "neutral",
      detail: `Consider setting a budget limit for ${topCategory?.name || "your top category"} expenses to optimize your spending.`
    },
    {
      id: 3,
      title: "Budget Alert",
      icon: <Target className="h-5 w-5 text-purple-500" />,
      value: `${Math.round(averageDailySpend)} daily average`,
      description: "Average daily spending",
      trend: "neutral",
      detail: `You're spending an average of ${Math.round(averageDailySpend)} daily. Track your daily expenses to stay on budget.`
    },
    {
      id: 4,
      title: "Savings Goal",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      value: `${subscriptionCosts?.count || 0} subscriptions`,
      description: "Monthly subscription costs",
      trend: "positive",
      detail: `You have ${subscriptionCosts?.count || 0} active subscriptions${subscriptionCosts?.total ? ` costing $${Math.round(subscriptionCosts.total)} monthly` : ''}. Review them for potential savings.`
    }
  ];

  const visibleInsights = loading ? Array(4).fill({}) : insightCards.slice(0, 4);

  return (
    <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-lg mb-6">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Spending Insights</h3>
          <button 
            onClick={() => navigate('/insights')}
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {visibleInsights.map((insight, index) => (
            <div 
              key={insight.id || `loading-${index}`}
              className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors cursor-pointer"
              onClick={() => !loading && navigate('/insights')}
              title={insight.detail}
            >
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">{insight.title}</h4>
                    <div className={
                      insight.trend === 'positive' ? 'text-green-500' : 
                      insight.trend === 'negative' ? 'text-red-500' : 
                      'text-blue-500'
                    }>
                      {insight.icon}
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{insight.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {insight.description}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
