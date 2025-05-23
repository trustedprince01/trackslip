// This function tries to get a store's logo using logo.dev API
export const getStoreLogo = async (storeName: string): Promise<string | null> => {
  if (!storeName) return null;
  
  // Clean up the store name to use as a domain
  const cleanDomain = storeName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '') // Remove special characters except dots
    .replace(/^\.+|\.+$/g, ''); // Remove leading/trailing dots

  try {
    // First check if we have a direct mapping for common stores
    const directLogo = getDirectStoreLogo(cleanDomain);
    if (directLogo) return directLogo;
    
    // Get the API key from environment variables
    const apiKey = import.meta.env.VITE_LOGO_DEV_API_KEY;
    
    if (!apiKey) {
      console.warn('Logo.dev API key not found. Using fallback logo.');
      return getFallbackLogo(storeName);
    }
    
    // Try different domain variations
    const domainVariations = [
      `${cleanDomain}.com`,
      `www.${cleanDomain}.com`,
      cleanDomain.includes('.') ? cleanDomain.split('.')[0] + '.com' : ''
    ].filter(Boolean);
    
    for (const domain of domainVariations) {
      try {
        const logoUrl = `https://img.logo.dev/${domain}?token=${apiKey}&size=128&format=png`;
        const response = await fetch(logoUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Don't block on CORS
        });
        
        if (response.ok || response.type === 'opaque') {
          // If the request doesn't throw and we get a response, assume the logo exists
          return logoUrl;
        }
      } catch (e) {
        console.debug(`Failed to check logo for ${domain}`, e);
      }
    }
    
    // Fallback to Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain + '.com')}&sz=128`;
  } catch (error) {
    console.error('Error fetching store logo:', error);
    return getFallbackLogo(storeName);
  }
};

// Direct mapping for common stores
const getDirectStoreLogo = (storeName: string): string | null => {
  const commonStores: Record<string, string> = {
    'amazon': 'https://www.amazon.com/favicon.ico',
    'walmart': 'https://www.walmart.com/favicon.ico',
    'target': 'https://www.target.com/favicon.ico',
    'starbucks': 'https://www.starbucks.com/favicon.ico',
    'mcdonalds': 'https://www.mcdonalds.com/favicon.ico',
    'bestbuy': 'https://www.bestbuy.com/favicon.ico',
    'homedepot': 'https://www.homedepot.com/favicon.ico',
    'costco': 'https://www.costco.com/favicon.ico',
    'kroger': 'https://www.kroger.com/favicon.ico',
    'walgreens': 'https://www.walgreens.com/favicon.ico',
    'cvs': 'https://www.cvs.com/favicon.ico',
    'macys': 'https://www.macys.com/favicon.ico',
    'nordstrom': 'https://www.nordstrom.com/favicon.ico',
    'h-m': 'https://www2.hm.com/favicon.ico',
    'zara': 'https://www.zara.com/favicon.ico',
    'gap': 'https://www.gap.com/favicon.ico',
    'oldnavy': 'https://oldnavy.gap.com/favicon.ico',
    'bananarepublic': 'https://bananarepublic.gap.com/favicon.ico',
    'uniqlo': 'https://www.uniqlo.com/favicon.ico',
    'hm': 'https://www2.hm.com/favicon.ico',
    'forever21': 'https://www.forever21.com/favicon.ico',
    'asos': 'https://www.asos.com/favicon.ico',
    'nike': 'https://www.nike.com/favicon.ico',
    'adidas': 'https://www.adidas.com/favicon.ico',
    'puma': 'https://us.puma.com/favicon.ico',
    'underarmour': 'https://www.underarmour.com/favicon.ico',
    'lululemon': 'https://shop.lululemon.com/favicon.ico',
    'footlocker': 'https://www.footlocker.com/favicon.ico',
    'finishline': 'https://www.finishline.com/favicon.ico',
    'dickssportinggoods': 'https://www.dickssportinggoods.com/favicon.ico',
    'rei': 'https://www.rei.com/favicon.ico',
    'basspro': 'https://www.basspro.com/favicon.ico',
    'cabelas': 'https://www.cabelas.com/favicon.ico',
    'sportsauthority': 'https://www.sportsauthority.com/favicon.ico',
    'academy': 'https://www.academy.com/favicon.ico',
    'dsw': 'https://www.dsw.com/favicon.ico',
    'payless': 'https://www.payless.com/favicon.ico',
    'famousfootwear': 'https://www.famousfootwear.com/favicon.ico',
    'shoecarnival': 'https://www.shoecarnival.com/favicon.ico',
    'journeys': 'https://www.journeys.com/favicon.ico',
    'footaction': 'https://www.footaction.com/favicon.ico',
    'champs': 'https://www.champssports.com/favicon.ico',
    'eastbay': 'https://www.eastbay.com/favicon.ico',
    'jimmyjazz': 'https://www.jimmyjazz.com/favicon.ico',
    'bait': 'https://www.baitme.com/favicon.ico',
    'kith': 'https://kith.com/favicon.ico',
    'undefeated': 'https://undefeated.com/favicon.ico',
    'bodega': 'https://shop.bdgastore.com/favicon.ico',
    'sneakerpolitics': 'https://sneakerpolitics.com/favicon.ico',
    'a-ma-maniere': 'https://www.a-ma-maniere.com/favicon.ico',
    'socialstatus': 'https://www.socialstatuspgh.com/favicon.ico',
    'atmos': 'https://www.atmos-tokyo.com/favicon.ico',
    'bstn': 'https://www.bstn.com/favicon.ico',
    'sneakers76': 'https://www.sneakers76.com/favicon.ico',
    'sneakerstudio': 'https://www.sneakerstudio.com/favicon.ico',
    'sneakerworld': 'https://www.sneakerworld.com/favicon.ico',
  };

  const lowerName = storeName.toLowerCase();
  
  // Check for exact matches first
  if (commonStores[lowerName]) {
    return commonStores[lowerName];
  }
  
  // Check for partial matches
  for (const [key, logoUrl] of Object.entries(commonStores)) {
    if (lowerName.includes(key)) {
      return logoUrl;
    }
  }
  
  return null;
};

// Fallback to using a colored circle with the first letter of the store name
const getFallbackLogo = (storeName: string): string => {
  if (!storeName) return '';
  
  // Get the first letter of the store name
  const firstLetter = storeName.charAt(0).toUpperCase();
  
  // Generate a consistent color based on the store name
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const colorIndex = storeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  // Return a data URL for a simple circular logo with the first letter
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect width="40" height="40" rx="20" fill="%23${colors[colorIndex].split('-')[1]}" />
    <text x="50%" y="55%" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${firstLetter}</text>
  </svg>`;
};

// Cache for storing fetched logos to avoid repeated API calls
const logoCache: Record<string, string> = {};

// Get a cached store logo or fetch a new one
export const getCachedStoreLogo = async (storeName: string): Promise<string> => {
  if (!storeName) return getFallbackLogo('');
  
  // Check if we have a cached logo
  const cacheKey = storeName.toLowerCase().trim();
  if (logoCache[cacheKey]) {
    return logoCache[cacheKey];
  }
  
  try {
    // Try to get the logo
    const logo = await getStoreLogo(storeName);
    
    // Cache the result (whether successful or not)
    const result = logo || getFallbackLogo(storeName);
    logoCache[cacheKey] = result;
    
    // If we have a valid logo URL, preload it
    if (logo && !logo.startsWith('data:')) {
      const img = new Image();
      img.src = logo;
    }
    
    return result;
  } catch (error) {
    console.error('Error getting store logo:', error);
    const fallback = getFallbackLogo(storeName);
    logoCache[cacheKey] = fallback;
    return fallback;
  }
};
