
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Settings, Plus, Target, TrendingUp, DollarSign, Utensils, Car, ShoppingBag, Home, Gamepad2, Heart, Brain, Zap, ArrowRight } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const SmartBudgeting = () => {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const handleBack = () => {
    navigate("/dashboard");
  };

  // Budget data
  const totalBudget = 120000;
  const totalSpent = 78500;
  const remaining = totalBudget - totalSpent;
  const budgetHealth = Math.round(((totalBudget - totalSpent) / totalBudget) * 100);

  const categories = [
    { 
      id: 1, 
      name: "Food & Dining", 
      icon: <Utensils className="h-5 w-5" />, 
      budget: 35000, 
      spent: 28400, 
      color: "bg-orange-500" 
    },
    { 
      id: 2, 
      name: "Transportation", 
      icon: <Car className="h-5 w-5" />, 
      budget: 25000, 
      spent: 22100, 
      color: "bg-blue-500" 
    },
    { 
      id: 3, 
      name: "Shopping", 
      icon: <ShoppingBag className="h-5 w-5" />, 
      budget: 20000, 
      spent: 15200, 
      color: "bg-purple-500" 
    },
    { 
      id: 4, 
      name: "Housing", 
      icon: <Home className="h-5 w-5" />, 
      budget: 30000, 
      spent: 10800, 
      color: "bg-green-500" 
    },
    { 
      id: 5, 
      name: "Entertainment", 
      icon: <Gamepad2 className="h-5 w-5" />, 
      budget: 10000, 
      spent: 2000, 
      color: "bg-pink-500" 
    }
  ];

  const recommendations = [
    {
      title: "Optimize Food Budget",
      description: "You could save ₦8,000 by meal planning and cooking at home 3 more days per week",
      impact: "₦8,000/month savings",
      action: "Set up meal planning"
    },
    {
      title: "Transportation Efficiency", 
      description: "Consider carpooling or public transport 2 days a week to reduce costs",
      impact: "₦3,500/month savings",
      action: "Plan commute options"
    },
    {
      title: "Entertainment Budget",
      description: "You have unused budget in entertainment. Consider allocating to savings",
      impact: "₦8,000 reallocation",
      action: "Adjust budget"
    }
  ];

  const goals = [
    { name: "Emergency Fund", target: 200000, current: 125000, color: "bg-blue-500" },
    { name: "Vacation Savings", target: 80000, current: 45000, color: "bg-green-500" },
    { name: "Investment Fund", target: 150000, current: 67000, color: "bg-purple-500" }
  ];

  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black transition-colors duration-300">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header Section */}
        <header className="flex items-center justify-between p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10 p-0" 
              onClick={handleBack}
            >
              <ChevronLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Smart Budgeting
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered financial planning
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10 p-0"
          >
            <Settings size={20} />
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-20 pt-6 overflow-y-auto scrollbar-none space-y-6">
          {/* Budget Overview Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(budgetHealth / 100) * 314} 314`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{budgetHealth}%</div>
                      <div className="text-xs opacity-90">Budget Health</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm opacity-90">Total Budget</p>
                    <p className="text-lg font-bold">{currency}{totalBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Spent</p>
                    <p className="text-lg font-bold">{currency}{totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Remaining</p>
                    <p className="text-lg font-bold">{currency}{remaining.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category Breakdown
            </h2>
            <div className="horizontal-scroll flex space-x-4 overflow-x-auto pb-2">
              {categories.map((category) => {
                const progress = (category.spent / category.budget) * 100;
                const remaining = category.budget - category.spent;
                
                return (
                  <Card key={category.id} className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg flex-shrink-0 w-64 hover:scale-105 transition-transform duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${category.color} text-white`}>
                            {category.icon}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {category.name}
                          </h3>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Spent</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {currency}{category.spent.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                          <span className={`font-medium ${remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {currency}{remaining.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Smart Recommendations */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Smart Recommendations
              </h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={index} className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                          {rec.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {rec.description}
                        </p>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                          {rec.impact}
                        </p>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white ml-3">
                        <Zap className="h-3 w-3 mr-1" />
                        {rec.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Budget Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Budget Goals
                </h2>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                <Plus className="h-4 w-4 mr-1" />
                Add Goal
              </Button>
            </div>
            <div className="space-y-3">
              {goals.map((goal, index) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <Card key={index} className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {goal.name}
                        </h3>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {currency}{goal.current.toLocaleString()} of {currency}{goal.target.toLocaleString()}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {currency}{(goal.target - goal.current).toLocaleString()} to go
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-12 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Adjust Budget
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
                <ArrowRight className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBudgeting;
