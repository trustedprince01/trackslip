
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Bell, Moon, Sun, CreditCard, Lock, HelpCircle, LogOut, Home, History, Settings as SettingsIcon, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { SettingsSection } from "@/components/settings/SettingsSection";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [receiptScanning, setReceiptScanning] = React.useState(true);
  const { currency, setCurrency } = useCurrency();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({
    username: '',
    full_name: '',
    phone: ''
  });
  
  // Initialize edit data when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditData({
        username: profile.full_name?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0] || '',
        full_name: profile.full_name || user?.email?.split('@')[0] || '',
        phone: profile.phone || ''
      });
    } else if (user?.email) {
      const defaultUsername = user.email.split('@')[0];
      setEditData({
        username: defaultUsername,
        full_name: defaultUsername,
        phone: ''
      });
    }
  }, [profile, user]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully",
    });
  };

  const appearanceSettings = [
    {
      icon: isDarkMode ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-orange-500" />,
      title: "Dark Mode",
      description: "Toggle between light and dark themes",
      type: 'switch' as const,
      value: isDarkMode,
      onChange: toggleTheme
    },
    {
      icon: <Bell size={18} className="text-green-500" />,
      title: "Notifications",
      description: "Receive app notifications",
      type: 'switch' as const,
      value: notifications,
      onChange: setNotifications
    }
  ];

  const preferenceSettings = [
    {
      icon: <CreditCard size={18} className="text-purple-500" />,
      title: "Currency",
      description: "Default currency for expenses",
      type: 'select' as const,
      value: currency,
      options: [
        { value: "₦", label: "₦ (Naira)" },
        { value: "$", label: "$ (USD)" },
        { value: "€", label: "€ (Euro)" },
        { value: "£", label: "£ (GBP)" }
      ],
      onChange: setCurrency
    },
    {
      icon: <CreditCard size={18} className="text-orange-500" />,
      title: "Auto Scan Receipts",
      description: "Automatically process uploaded receipts",
      type: 'switch' as const,
      value: receiptScanning,
      onChange: setReceiptScanning
    }
  ];

  const securitySettings = [
    {
      icon: <Lock size={18} className="text-red-500" />,
      title: "Change Password",
      description: "Update your account password",
      type: 'button' as const,
      onClick: () => console.log('Change password clicked')
    },
    {
      icon: <HelpCircle size={18} className="text-blue-500" />,
      title: "Help & Support",
      description: "Get help and contact support",
      type: 'button' as const,
      onClick: () => console.log('Help clicked')
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
            Settings
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-20 pt-6 overflow-y-auto scrollbar-none space-y-6">
          {/* Profile Section */}
          <ProfileCard 
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editData={editData}
            setEditData={setEditData}
          />

          {/* Settings Sections */}
          <SettingsSection title="Appearance" items={appearanceSettings} />
          <SettingsSection title="Preferences" items={preferenceSettings} />
          <SettingsSection title="Security" items={securitySettings} />

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
              className="h-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl flex-1 mx-1"
              onClick={() => navigate('/insights')}
            >
              <BarChart size={20} />
              <span className="text-xs mt-1">Insights</span>
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
