
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Bell, Moon, Sun, User, CreditCard, Lock, HelpCircle, LogOut, Home, History, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState(true);
  const [receiptScanning, setReceiptScanning] = React.useState(true);
  const { currency, setCurrency } = useCurrency();
  const { isDarkMode, toggleTheme } = useTheme();

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
            Settings
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-20 pt-6 overflow-y-auto scrollbar-none space-y-6">
          {/* Profile Section */}
          <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    P
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Prince</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">prince@example.com</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  <User size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <div>
            <h2 className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold mb-3 px-1">Appearance</h2>
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/30 dark:border-gray-700/30">
                  <div className="flex items-center">
                    {isDarkMode ? (
                      <Moon size={18} className="text-blue-500 mr-3" />
                    ) : (
                      <Sun size={18} className="text-orange-500 mr-3" />
                    )}
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">Dark Mode</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <Switch 
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center">
                    <Bell size={18} className="text-green-500 mr-3" />
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">Notifications</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Receive app notifications</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold mb-3 px-1">Preferences</h2>
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/30 dark:border-gray-700/30">
                  <div className="flex items-center">
                    <CreditCard size={18} className="text-purple-500 mr-3" />
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">Currency</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Default currency for expenses</p>
                    </div>
                  </div>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-white/80 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 backdrop-blur-sm"
                  >
                    <option value="₦">₦ (Naira)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (Euro)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center">
                    <CreditCard size={18} className="text-orange-500 mr-3" />
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">Auto Scan Receipts</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Automatically process uploaded receipts</p>
                    </div>
                  </div>
                  <Switch 
                    checked={receiptScanning}
                    onCheckedChange={setReceiptScanning}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold mb-3 px-1">Security</h2>
            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
              <CardContent className="p-0">
                <button className="w-full p-6 border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock size={18} className="text-red-500 mr-3" />
                      <div className="text-left">
                        <span className="text-gray-900 dark:text-white font-medium">Change Password</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Update your account password</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                  </div>
                </button>
                <button className="w-full p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HelpCircle size={18} className="text-blue-500 mr-3" />
                      <div className="text-left">
                        <span className="text-gray-900 dark:text-white font-medium">Help & Support</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Get help and contact support</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>

            <Button 
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-xl shadow-lg"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

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
