import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit2, X, Check, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary } from "@/utils/cloudinary";
import { useToast } from "@/hooks/use-toast";

interface ProfileCardProps {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  editData: {
    username: string;
    full_name: string;
    phone: string;
  };
  setEditData: React.Dispatch<React.SetStateAction<{
    username: string;
    full_name: string;
    phone: string;
  }>>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  isEditing,
  setIsEditing,
  editData,
  setEditData
}) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const avatarUrl = await uploadImageToCloudinary(file, user?.user_metadata?.avatar_url);
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
      if (!editData.full_name.trim()) {
        throw new Error('Full name is required');
      }
      
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(editData.username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }
      
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/;
      if (editData.phone && !phoneRegex.test(editData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      await updateProfile({ 
        username: editData.username,
        full_name: editData.full_name,
        phone: editData.phone 
      });
      await refreshProfile();
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
    if (profile) {
      setEditData({
        username: profile.username || user?.email?.split('@')[0] || '',
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
    return profile?.username || user?.email?.split('@')[0] || 'user';
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar Section */}
          <div className="relative group flex-shrink-0">
            <Avatar className="h-12 w-12 text-lg font-bold shadow-lg">
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
              className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
              title="Change profile picture"
            >
              {isUploading ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                <Upload className="h-2.5 w-2.5" />
              )}
            </button>
          </div>

          {/* Profile Info Section */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Username</label>
                  <Input
                    value={editData.username}
                    onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                    className="h-8 text-sm"
                    placeholder="Enter username"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Full Name</label>
                    <Input
                      value={editData.full_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Phone</label>
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Enter phone"
                      type="tel"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-700 rounded border">
                    {user?.email || 'No email available'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Username</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    @{getDisplayUsername()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {profile?.phone || 'Not provided'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user?.email || 'No email available'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-1 flex-shrink-0">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveProfile}
                  disabled={!editData.full_name.trim() || isUploading}
                  className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  title="Save changes"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEdit}
                  className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  title="Cancel editing"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                title="Edit profile"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
