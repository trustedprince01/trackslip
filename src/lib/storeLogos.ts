import { StoreLogoService } from '@/service/StoreLogoService';

export const getCachedStoreLogo = async (storeName: string): Promise<string | null> => {
  return await StoreLogoService.getInstance().getStoreLogo(storeName);
};
