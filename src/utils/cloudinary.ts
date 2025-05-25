import { v4 as uuidv4 } from 'uuid';

// Extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  if (!url) return null;
  const matches = url.match(/upload\/.*\/v\d+\/([^\/]+)/);
  return matches ? matches[1].split('.')[0] : null;
};

// Delete an image from Cloudinary
export const deleteImageFromCloudinary = async (url: string): Promise<void> => {
  const publicId = extractPublicId(url);
  if (!publicId) return;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  
  // For client-side, we can only delete using the upload preset
  // For production, consider moving this to a server-side endpoint
  console.log(`Would delete image with public_id: ${publicId}`);
  
  // Note: Client-side deletion requires a server-side endpoint with the API secret
  // This is a placeholder to show where the deletion would happen
  try {
    console.log(`[Cloudinary] Deleting old avatar: ${publicId}`);
    // In a real implementation, you would make an API call to your backend here
    // which would then use the admin SDK to delete the image
  } catch (error) {
    console.error('Error deleting old avatar:', error);
    // Don't throw here, as we don't want to block the new upload
  }
};

export const uploadImageToCloudinary = async (file: File, oldUrl?: string): Promise<string> => {
  // Delete the old avatar if it exists and is from Cloudinary
  if (oldUrl && oldUrl.includes('cloudinary')) {
    try {
      await deleteImageFromCloudinary(oldUrl);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
      // Continue with upload even if deletion fails
    }
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const uploadPreset = 'trackslip_avatars';

  if (!cloudName || !apiKey) {
    throw new Error('Missing Cloudinary configuration. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);
  formData.append('api_key', apiKey);
  formData.append('public_id', `avatars/${uuidv4()}`);
  formData.append('folder', 'trackslip_avatars');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Cloudinary upload error:', data);
      throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
    }

    if (!data.secure_url) {
      throw new Error('No image URL returned from Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error in uploadImageToCloudinary:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
