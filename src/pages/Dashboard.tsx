
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, History, Settings, LogOut, Camera } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-[rgb(111,104,215)] to-[rgb(42,33,156)]">
      <div className="w-full max-w-[430px] flex flex-col h-screen">
        {/* Header Section */}
        <header className="flex justify-between items-center p-5">
          <h1 className="text-white text-xl font-medium">Welcome back, Prince! 👋</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/10" 
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-t-3xl p-5 overflow-y-auto">
          {/* Main Summary Card */}
          <Card className="bg-white shadow-md border-none mb-5">
            <CardContent className="p-6">
              <p className="text-gray-600 font-medium">Total Spent</p>
              <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue bg-clip-text text-transparent">
                ₦45,000
              </h2>
            </CardContent>
          </Card>

          {/* Statistical Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <Card className="bg-white shadow-sm border-none">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">This Week</p>
                <p className="text-lg font-semibold mt-1">₦12,500</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-none">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-lg font-semibold mt-1">₦32,800</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-none">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">All Time</p>
                <p className="text-lg font-semibold mt-1">₦89,200</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Expenses List */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Recent Expenses</h3>
              <Button variant="ghost" size="sm" className="text-trackslip-blue hover:bg-blue-50 font-medium text-sm p-0">
                See all
              </Button>
            </div>

            <div className="space-y-3">
              {[
                { date: "May 20", merchant: "Supermart", amount: "₦4,500" },
                { date: "May 19", merchant: "Coffee Shop", amount: "₦1,200" },
                { date: "May 18", merchant: "Gas Station", amount: "₦8,000" },
                { date: "May 17", merchant: "Restaurant", amount: "₦3,500" },
              ].map((expense, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                    <p className="font-medium">{expense.merchant}</p>
                  </div>
                  <p className="font-semibold">{expense.amount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Receipt Button */}
          <Button 
            className="w-full py-6 text-base font-medium bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue hover:opacity-90 transition-opacity shadow-md mb-20"
          >
            <Camera className="mr-2" size={20} />
            Upload New Receipt 📸
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[430px] h-16 flex justify-around items-center bg-white border-t border-gray-200 px-6">
            <Button variant="ghost" className="h-12 flex flex-col items-center justify-center bg-blue-50 text-trackslip-blue rounded-xl flex-1 mx-1">
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Button>
            
            <Button variant="ghost" className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1">
              <History size={20} />
              <span className="text-xs mt-1">History</span>
            </Button>
            
            <Button variant="ghost" className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1">
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
