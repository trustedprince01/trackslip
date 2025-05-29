export interface InsightCardProps {
  topCategory?: {
    name: string;
    amount: number;
    percentage: number;
  };
  topStore?: {
    name: string;
    amount: number;
    count: number;
  };
  totalDiscount: number;
  spendingTrend: number;
  weeklySpendingTrend: number;
  averageDailySpend: number;
  subscriptionCosts: {
    count: number;
    total: number;
  };
  loading: boolean;
}
