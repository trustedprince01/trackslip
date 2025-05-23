
import React, { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Bell, Moon, User, CreditCard, Lock, HelpCircle, LogOut, Home, History, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [receiptScanning, setReceiptScanning] = useState(true);
  const { currency, setCurrency } = useCurrency();

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/login");
  };

  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully",
    });
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark overflow-hidden">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header Section */}
        <header className="flex items-center p-6 border-b border-gray-800">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-10 w-10 p-0" 
            onClick={handleBack}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-semibold text-white">
            Settings
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-20 pt-6 overflow-y-auto scrollbar-none">
          {/* Profile Section */}
          <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue flex items-center justify-center text-xl font-bold text-white">
                    P
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg text-white">Prince</h3>
                    <p className="text-gray-400 text-sm">prince@example.com</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                >
                  <User size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <h2 className="text-gray-400 text-xs uppercase font-semibold mb-3 px-1">Appearance</h2>
          <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg mb-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center">
                  <Moon size={18} className="text-trackslip-blue mr-3" />
                  <span className="text-white">Dark Mode</span>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-trackslip-blue"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <Bell size={18} className="text-trackslip-blue mr-3" />
                  <span className="text-white">Notifications</span>
                </div>
                <Switch 
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  className="data-[state=checked]:bg-trackslip-blue"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <h2 className="text-gray-400 text-xs uppercase font-semibold mb-3 px-1">Preferences</h2>
          <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg mb-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center">
                  <CreditCard size={18} className="text-trackslip-blue mr-3" />
                  <span className="text-white">Currency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-trackslip-blue focus:border-transparent"
                  >
                    <option value="₦">₦ (Naira)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (Euro)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <CreditCard size={18} className="text-trackslip-blue mr-3" />
                  <span className="text-white">Auto Scan Receipts</span>
                </div>
                <Switch 
                  checked={receiptScanning}
                  onCheckedChange={setReceiptScanning}
                  className="data-[state=checked]:bg-trackslip-blue"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <h2 className="text-gray-400 text-xs uppercase font-semibold mb-3 px-1">Security</h2>
          <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg mb-6">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock size={18} className="text-trackslip-blue mr-3" />
                    <span className="text-white">Change Password</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HelpCircle size={18} className="text-trackslip-blue mr-3" />
                    <span className="text-white">Help & Support</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            className="w-full bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue hover:opacity-90 mb-4 text-white"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>

          {/* Logout Button */}
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 mb-6 text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[430px] h-16 flex justify-around items-center bg-gray-900 border-t border-gray-800 px-6">
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1"
              onClick={() => navigate('/dashboard')}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-gray-500 rounded-xl flex-1 mx-1"
              onClick={() => navigate('/history')}
            >
              <History size={20} />
              <span className="text-xs mt-1">History</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 flex flex-col items-center justify-center text-trackslip-blue rounded-xl flex-1 mx-1"
            >
              <SettingsIcon size={20} />
              <span className="text-xs mt-1">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
