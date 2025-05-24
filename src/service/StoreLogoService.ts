import { supabase } from '@/lib/supabase';
import { StorageService } from '@/service/StorageService';
import { v4 as uuidv4 } from 'uuid';

interface StoreLogo {
  id: string;
  store_name: string;
  logo_url: string;
  created_at: string;
}

class StoreLogoService {
  private static _instance: StoreLogoService | null = null;
  private readonly bucketName = 'store-logos';
  private readonly cache = new Map<string, string>();

  private constructor() {}

  public static getInstance(): StoreLogoService {
    if (!StoreLogoService._instance) {
      StoreLogoService._instance = new StoreLogoService();
    }
    return StoreLogoService._instance;
  }

  // Get store logo from cache or Supabase
  public async getStoreLogo(storeName: string): Promise<string | null> {
    const normalizedStoreName = storeName.toLowerCase().trim();

    // Check cache first
    if (this.cache.has(normalizedStoreName)) {
      return this.cache.get(normalizedStoreName) || null;
    }

    try {
      // Try to get from Supabase storage
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(`${normalizedStoreName}.png`);

      if (data?.publicUrl) {
        this.cache.set(normalizedStoreName, data.publicUrl);
        return data.publicUrl;
      }

      // If not found, generate a fallback SVG
      const fallbackLogo = await this.generateFallbackLogo(normalizedStoreName);
      this.cache.set(normalizedStoreName, fallbackLogo);
      return fallbackLogo;

    } catch (error) {
      console.error('Error in getStoreLogo:', error);
      return null;
    }
  }

  // Generate a fallback SVG logo with store initials
  private async generateFallbackLogo(storeName: string): Promise<string> {
    const initials = storeName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="16" fill="#3b82f6" />
        <text x="50%" y="50%" font-family="Arial" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${initials}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Upload a new store logo
  public async uploadStoreLogo(storeName: string, file: File): Promise<string | null> {
    try {
      const normalizedStoreName = storeName.toLowerCase().trim();
      const fileName = `${normalizedStoreName}.png`;
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/png'
        });

      if (error) throw error;

      // Get the public URL
      const { data } = await supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        this.cache.set(normalizedStoreName, data.publicUrl);
        return data.publicUrl;
      }

      return null;
    } catch (error) {
      console.error('Error uploading store logo:', error);
      return null;
    }
  }
}

export { StoreLogoService };
