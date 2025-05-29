
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  DollarSign, 
  RefreshCw, 
  BarChart3, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Clock,
  AlertCircle
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SmartRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: {
    title: string;
    description: string;
    impact: string;
    priority: string;
    category?: string;
  } | null;
}

export const SmartRecommendationModal: React.FC<SmartRecommendationModalProps> = ({
  isOpen,
  onClose,
  recommendation
}) => {
  const { formatCurrency } = useCurrency();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!recommendation) return null;

  // Mock data based on the recommendation category
  const getCategoryData = (title: string) => {
    const categoryName = title.includes("Food") ? "Food & Dining" :
                        title.includes("Transportation") ? "Transportation" :
                        title.includes("Subscription") ? "Subscriptions" :
                        title.includes("Spending") ? "General Spending" : "General";

    const mockData = {
      "Food & Dining": {
        currentSpending: 28400,
        percentage: 35,
        comparison: "25% higher than similar users",
        trend: "up",
        subcategories: [
          { name: "Restaurants", amount: 15200, percentage: 54, trend: "up" },
          { name: "Groceries", amount: 8900, percentage: 31, trend: "down" },
          { name: "Delivery", amount: 4300, percentage: 15, trend: "up" }
        ],
        suggestions: [
          "Cook at home 3 more days per week to save ₦8,000/month",
          "Your delivery orders peak on weekends - try meal prep",
          "Switch to local markets for groceries to save 20%"
        ]
      },
      "Transportation": {
        currentSpending: 22100,
        percentage: 28,
        comparison: "15% higher than average",
        trend: "up",
        subcategories: [
          { name: "Ride-hailing", amount: 12500, percentage: 57, trend: "up" },
          { name: "Fuel", amount: 6800, percentage: 31, trend: "down" },
          { name: "Public Transport", amount: 2800, percentage: 12, trend: "stable" }
        ],
        suggestions: [
          "Use public transport 2x/week to save ₦3,500/month",
          "Your Uber rides peak on Fridays - consider carpooling",
          "Plan trips to reduce fuel consumption by 15%"
        ]
      },
      "Subscriptions": {
        currentSpending: 12000,
        percentage: 15,
        comparison: "Similar to average users",
        trend: "stable",
        subcategories: [
          { name: "Streaming", amount: 4500, percentage: 38, trend: "stable" },
          { name: "Software", amount: 4200, percentage: 35, trend: "up" },
          { name: "Other", amount: 3300, percentage: 27, trend: "down" }
        ],
        suggestions: [
          "Review unused subscriptions - potential ₦2,000/month savings",
          "Bundle streaming services for better rates",
          "Cancel duplicate services you're not using"
        ]
      },
      "General Spending": {
        currentSpending: 78500,
        percentage: 100,
        comparison: "Budget on track",
        trend: "up",
        subcategories: [
          { name: "Essential", amount: 45000, percentage: 57, trend: "stable" },
          { name: "Discretionary", amount: 23500, percentage: 30, trend: "up" },
          { name: "Savings", amount: 10000, percentage: 13, trend: "down" }
        ],
        suggestions: [
          "Increase savings rate to 20% of income",
          "Review discretionary spending for optimization",
          "Set up automatic transfers to savings"
        ]
      }
    };

    return mockData[categoryName as keyof typeof mockData] || mockData["General Spending"];
  };

  const data = getCategoryData(recommendation.title);
  const categoryName = recommendation.title.includes("Food") ? "Food & Dining" :
                      recommendation.title.includes("Transportation") ? "Transportation" :
                      recommendation.title.includes("Subscription") ? "Subscriptions" : "General Spending";

  const actionCards = [
    {
      id: "budget",
      title: "Set Budget",
      icon: <DollarSign className="h-5 w-5" />,
      description: "Create spending limit",
      color: "bg-blue-500"
    },
    {
      id: "alternatives",
      title: "Find Alternatives",
      icon: <RefreshCw className="h-5 w-5" />,
      description: "Discover cheaper options",
      color: "bg-green-500"
    },
    {
      id: "breakdown",
      title: "View Breakdown",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Detailed analysis",
      color: "bg-purple-500"
    },
    {
      id: "goal",
      title: "Set Goal",
      icon: <Target className="h-5 w-5" />,
      description: "Define savings target",
      color: "bg-orange-500"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Smart Spending Plan: {categoryName}
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Here's how you can optimize your {categoryName.toLowerCase()} spending
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Spending Overview */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm opacity-90">Current Monthly Spending</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.currentSpending)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-90">% of Total Expenses</p>
                  <p className="text-2xl font-bold">{data.percentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-90">vs. Average Users</p>
                  <div className="flex items-center justify-center space-x-2">
                    {data.trend === "up" ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <p className="text-lg font-semibold">{data.comparison}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actionCards.map((action) => (
                  <Card
                    key={action.id}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedAction === action.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedAction(action.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`${action.color} text-white rounded-lg p-3 w-fit mx-auto mb-2`}>
                        {action.icon}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Spending Breakdown
              </h3>
              <div className="space-y-3">
                {data.subcategories.map((sub, index) => (
                  <Card key={index} className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {sub.name}
                          </h4>
                          {sub.trend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
                          {sub.trend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(sub.amount)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sub.percentage}% of total
                          </p>
                        </div>
                      </div>
                      <Progress value={sub.percentage} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Smart Suggestions */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Smart Suggestions
                </h3>
                <Info className="h-4 w-4 text-blue-500" />
              </div>
              <div className="space-y-3">
                {data.suggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-l-4 border-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-500 text-white rounded-full p-1 mt-1">
                          <Clock className="h-3 w-3" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {suggestion}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              Set Budget for {categoryName}
            </Button>
            <Button variant="outline" className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              Remind Me Later
            </Button>
            <Button variant="ghost" className="flex-1 text-gray-600 dark:text-gray-400">
              <AlertCircle className="h-4 w-4 mr-2" />
              Not Helpful
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
