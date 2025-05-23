import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type UploadOptions = {
  path?: string;
  upsert?: boolean;
  contentType?: string;
};

export class StorageService {
  private static instance: StorageService;
  private readonly bucketName = 'receipts';

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private getFileExtension(filename: string): string {
    return filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);
  }

  private generateUniqueFilename(userId: string, originalFilename: string): string {
    const extension = this.getFileExtension(originalFilename);
    return `${userId}/${uuidv4()}.${extension}`;
  }

  public async uploadFile(
    file: File,
    userId: string,
    options: UploadOptions = {}
  ): Promise<{ path: string; url: string }> {
    try {
      const fileExt = this.getFileExtension(file.name);
      const fileName = options.path || this.generateUniqueFilename(userId, file.name);
      const filePath = `${fileName}`;

      // First, upload the file
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: options.upsert || false,
          contentType: options.contentType || file.type,
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw new Error(error.message);
      }

      // Update the file's metadata to ensure it's publicly accessible
      await supabase.storage
        .from(this.bucketName)
        .update(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: options.contentType || file.type,
        });

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('File uploaded successfully. Public URL:', publicUrl);
      
      return {
        path: filePath,
        url: publicUrl,
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteFile:', error);
      throw error;
    }
  }

  public getFileUrl(filePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  }

  public async downloadFile(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filePath);

      if (error) {
        console.error('Error downloading file:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data received when downloading file');
      }

      return data;
    } catch (error) {
      console.error('Error in downloadFile:', error);
      throw error;
    }
  }
}

export default StorageService.getInstance();
