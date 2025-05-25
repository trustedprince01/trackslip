
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";

interface InsightCardProps {
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
  weeklySpendingTrend?: number;
  averageDailySpend?: number;
  subscriptionCosts?: {
    count: number;
    total: number;
  };
  loading?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  topCategory,
  topStore,
  totalDiscount,
  spendingTrend,
  weeklySpendingTrend = 0,
  averageDailySpend = 0,
  subscriptionCosts = { count: 0, total: 0 },
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-trackslip-blue/20 to-trackslip-lightBlue/10 border-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
        <CardContent className="p-4 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-trackslip-blue/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h3 className="text-sm font-medium text-gray-300 mb-4">Insights</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-gray-800/50" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = [];

  // Add spending trend insight
  if (spendingTrend !== 0) {
    const trendText = spendingTrend > 0 
      ? `${Math.abs(spendingTrend)}% increase` 
      : `${Math.abs(spendingTrend)}% decrease`;
    
    insights.push(
      <div key="trend" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          <span className={spendingTrend > 0 ? 'text-red-400' : 'text-green-400'}>
            {trendText}
          </span> in spending compared to last month
        </p>
      </div>
    );
  }

  // Add top category insight
  if (topCategory) {
    insights.push(
      <div key="category" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          Your top spending category is <span className="text-trackslip-lightBlue">{topCategory.name}</span> 
          with {topCategory.percentage}% of total expenses
        </p>
      </div>
    );
  }

  // Add top store insight
  if (topStore) {
    insights.push(
      <div key="store" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          You spend the most at <span className="text-trackslip-lightBlue">{topStore.name}</span> 
          with {topStore.count} receipt {topStore.count !== 1 ? 's' : ''} totaling ${topStore.amount.toFixed(2)}
        </p>
      </div>
    );
  }

  // Add average daily spend insight
  if (averageDailySpend > 0) {
    insights.push(
      <div key="daily-spend" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          You're spending an average of <span className="text-trackslip-lightBlue">${averageDailySpend.toFixed(2)}</span> per day this month
        </p>
      </div>
    );
  }

  // Add weekly trend insight
  if (weeklySpendingTrend !== 0) {
    const trendText = weeklySpendingTrend > 0 
      ? `${Math.abs(weeklySpendingTrend)}% higher` 
      : `${Math.abs(weeklySpendingTrend)}% lower`;
    
    insights.push(
      <div key="weekly-trend" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          This week's spending is <span className={weeklySpendingTrend > 0 ? 'text-red-400' : 'text-green-400'}>
            {trendText}
          </span> than last week
        </p>
      </div>
    );
  }

  // Add subscription insights
  if (subscriptionCosts.count > 0) {
    insights.push(
      <div key="subscriptions" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          You have {subscriptionCosts.count} active subscription{subscriptionCosts.count !== 1 ? 's' : ''} 
          costing <span className="text-trackslip-lightBlue">${subscriptionCosts.total.toFixed(2)}</span> this month
        </p>
      </div>
    );
  }

  // Add savings insight if there are any discounts
  if (totalDiscount > 0) {
    insights.push(
      <div key="savings" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          You saved <span className="text-green-400">${totalDiscount.toFixed(2)}</span> from discounts and promotions
        </p>
      </div>
    );
  }

  // If no insights available
  if (insights.length === 0) {
    insights.push(
      <div key="no-data" className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-300">
          Add more receipts to see personalized spending insights
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-trackslip-blue/20 to-trackslip-lightBlue/10 border-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
      <CardContent className="p-4 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-trackslip-blue/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-300">Insights</h3>
          {insights.length > 0 && (
            <span className="text-xs text-gray-500 flex items-center">
              <span className="hidden sm:inline">Swipe to see more</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
        <div className="relative">
          <div className="flex space-x-3 pb-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className="flex-shrink-0 w-64 snap-start">
                  <div className="h-full bg-gray-800/50 hover:bg-gray-800/70 transition-colors rounded-lg p-3">
                    {insight}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-3 w-full">
                <p className="text-xs text-gray-300">
                  Add more receipts to see personalized spending insights
                </p>
              </div>
            )}
          </div>
          {/* Gradient fade effect on the right side */}
          {insights.length > 0 && (
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-trackslip-blue/30 to-transparent pointer-events-none"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
