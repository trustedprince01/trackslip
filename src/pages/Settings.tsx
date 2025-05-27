import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Bell, Moon, Sun, User, CreditCard, Lock, HelpCircle, LogOut, Home, History, Settings as SettingsIcon, ChevronRight, Edit2, X, Check, Upload, Loader2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary } from "@/utils/cloudinary";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, updateProfile, signOut } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [receiptScanning, setReceiptScanning] = React.useState(true);
  const { currency, setCurrency } = useCurrency();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [editData, setEditData] = React.useState({
    username: '',
    full_name: '',
    phone: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting file upload...');
      
      // Pass the old avatar URL to be deleted
      const avatarUrl = await uploadImageToCloudinary(file, user?.user_metadata?.avatar_url);
      console.log('Upload successful, updating profile...', { avatarUrl });
      
      await updateProfile({ avatar_url: avatarUrl });
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      console.error('Error in handleAvatarUpload:', error);
      
      let errorMessage = 'Failed to update profile picture';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ 
        full_name: editData.full_name,
        phone: editData.phone 
      });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    if (profile) {
      setEditData({
        username: profile.full_name?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0] || '',
        full_name: profile.full_name || user?.email?.split('@')[0] || '',
        phone: profile.phone || ''
      });
    }
  };

  const getInitials = () => {
    if (!profile?.full_name) return user?.email?.[0]?.toUpperCase() || 'U';
    return profile.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getDisplayUsername = () => {
    return profile?.full_name?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0] || 'user';
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    try {
      // Sign out using the auth context
      const { error } = await signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // The signOut function will handle the redirect
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
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar Section */}
                  <div className="relative group">
                    <Avatar className="h-16 w-16 text-xl font-bold shadow-lg">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors"
                      title="Change profile picture"
                    >
                      {isUploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Profile Info Section */}
                  <div className="flex-1 space-y-3">
                    {isEditing ? (
                      <>
                        {/* Username Field */}
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Username</label>
                          <Input
                            value={editData.username}
                            onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                            className="h-8 text-sm"
                            placeholder="Enter username"
                          />
                        </div>
                        
                        {/* Full Name Field */}
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Full Name</label>
                          <Input
                            value={editData.full_name}
                            onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                            className="h-8 text-sm"
                            placeholder="Enter full name"
                          />
                        </div>

                        {/* Phone Field */}
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Phone</label>
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-8 text-sm"
                            placeholder="Enter phone number"
                            type="tel"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Display Mode */}
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username</div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            @{getDisplayUsername()}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {profile?.phone || 'Not provided'}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Email (always visible) */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.email || 'No email available'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveProfile}
                        disabled={!editData.full_name.trim() || isUploading}
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Save changes"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        title="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Edit profile"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
