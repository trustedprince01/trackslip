
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, History, Settings, LogOut, Plus, Search, ArrowDown, ArrowUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { InsightCard } from "@/components/InsightCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleAddExpense = () => {
    navigate("/new-expense");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark text-white overflow-hidden">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header Section */}
        <header className="flex justify-between items-center p-6">
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue bg-clip-text text-transparent">SpendSmart</h1>
            <p className="text-gray-400 text-sm">Welcome back, Prince 👋</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-9 w-9 p-0" 
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-20 pt-2 overflow-y-auto scrollbar-none">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search store, item, amount..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-trackslip-blue"
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs">Actual Spent</span>
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-trackslip-blue" />
                  </div>
                </div>
                <p className="text-xl font-semibold bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue bg-clip-text text-transparent">₦45,000</p>
                <p className="text-xs text-gray-500 mt-1">3 receipts</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs">Savings</span>
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-green-500">₦3,890</p>
                <p className="text-xs text-gray-500 mt-1">from receipts</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs">Tax Paid</span>
                  <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-500 text-xs font-bold">₦</span>
                  </div>
                </div>
                <p className="text-xl font-semibold text-yellow-500">₦920</p>
                <p className="text-xs text-gray-500 mt-1">last month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs">Receipts</span>
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-500 text-xs font-bold">30</span>
                  </div>
                </div>
                <p className="text-xl font-semibold text-purple-500">30</p>
                <p className="text-xs text-gray-500 mt-1">this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Spending Chart */}
          <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-300">Monthly Spending</h3>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-400 hover:text-white p-0">
                  View All
                </Button>
              </div>
              <div className="h-48">
                <SpendingChart />
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-300">Spending Breakdown</h3>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-400 hover:text-white p-0">
                  Details
                </Button>
              </div>
              <div className="h-48">
                <CategoryBreakdown />
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <InsightCard />

          {/* Recent Expenses */}
          <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-300">Recent Expenses</h3>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-400 hover:text-white p-0">
                  View All
                </Button>
              </div>
              <ExpenseList />
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <Button 
          className="absolute bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue hover:opacity-90 shadow-lg"
          onClick={handleAddExpense}
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Add Expense Modal */}
        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Expense</DialogTitle>
            </DialogHeader>
            <AddExpenseForm onClose={() => setIsExpenseModalOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[430px] h-16 flex justify-around items-center bg-gray-900 border-t border-gray-800 px-6">
            <Button variant="ghost" className="h-12 flex flex-col items-center justify-center text-trackslip-blue rounded-xl flex-1 mx-1">
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Button>
            
            <Button variant="ghost" className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1">
              <History size={20} />
              <span className="text-xs mt-1">History</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1"
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
