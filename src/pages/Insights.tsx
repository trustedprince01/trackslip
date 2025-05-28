
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart3, AlertCircle, Target } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const Insights = () => {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const handleBack = () => {
    navigate("/dashboard");
  };

  const insightCards = [
    {
      id: 1,
      title: "Monthly Spending Trend",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      value: "12% decrease",
      description: "Your spending decreased compared to last month",
      trend: "positive",
      detail: "You saved an average of ₦15,000 this month by reducing dining out expenses."
    },
    {
      id: 2,
      title: "Top Spending Category",
      icon: <PieChart className="h-5 w-5 text-blue-500" />,
      value: "Food & Dining",
      description: "45% of total expenses",
      trend: "neutral",
      detail: "Consider setting a budget limit for dining expenses to optimize your spending."
    },
    {
      id: 3,
      title: "Budget Alert",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      value: "85% used",
      description: "Transportation budget almost exceeded",
      trend: "negative",
      detail: "You've used 85% of your transportation budget with 10 days remaining this month."
    },
    {
      id: 4,
      title: "Savings Goal",
      icon: <Target className="h-5 w-5 text-purple-500" />,
      value: "68% complete",
      description: "Monthly savings target progress",
      trend: "positive",
      detail: "You're on track to meet your savings goal of ₦50,000 this month."
    },
    {
      id: 5,
      title: "Weekly Average",
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
      value: `${currency}8,750`,
      description: "Average weekly spending",
      trend: "neutral",
      detail: "Your weekly spending is consistent with your monthly budget plan."
    },
    {
      id: 6,
      title: "Best Saving Day",
      icon: <Calendar className="h-5 w-5 text-teal-500" />,
      value: "Sundays",
      description: "Lowest spending day of the week",
      trend: "positive",
      detail: "You tend to spend 60% less on Sundays compared to other days."
    }
  ];

  const recommendations = [
    {
      title: "Optimize Food Spending",
      description: "Consider meal planning to reduce dining out expenses by 20%",
      impact: "Potential savings: ₦12,000/month",
      priority: "high"
    },
    {
      title: "Set Transportation Budget",
      description: "Create a monthly limit for transportation to avoid overspending",
      impact: "Better budget control",
      priority: "medium"
    },
    {
      title: "Increase Savings Rate",
      description: "You could increase savings by 15% by reducing entertainment expenses",
      impact: "Additional savings: ₦7,500/month",
      priority: "low"
    }
  ];

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
                    <p className="text-2xl font-bold">{currency}45,280</p>
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
                    <p className="text-2xl font-bold">{currency}15,720</p>
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
                      <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
    </div>
  );
};

export default Insights;
