import { GoogleGenerativeAI } from '@google/generative-ai';
import { Receipt, ReceiptItem, Category } from '@/types/receipt';
import storageService from './StorageService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Gemini API key is not set. Receipt processing will not work.');
}

class ReceiptProcessingService {
  private static instance: ReceiptProcessingService;
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  public static getInstance(): ReceiptProcessingService {
    if (!ReceiptProcessingService.instance) {
      ReceiptProcessingService.instance = new ReceiptProcessingService();
    }
    return ReceiptProcessingService.instance;
  }

  private async processWithGemini(file: File): Promise<Partial<Receipt>> {
    console.log('Starting Gemini processing for file:', file.name);
    
    if (!this.genAI) {
      const error = new Error('Gemini API is not configured');
      console.error(error);
      throw error;
    }

    try {
      console.log('Initializing Gemini model...');
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });

      console.log('Model initialized, creating prompt...');
      const prompt = `
      Analyze this receipt image and extract the following information in valid JSON format (without markdown code blocks):

      IMPORTANT DATE RULES:
    - If the receipt date is missing or unclear, use today's full date (YYYY-MM-DD).
    - If the receipt year is before the current year, use the current year.
    - If the receipt month is greater than the current month, use the current month. Otherwise, keep the month from the receipt.
    - For the day: If the receipt day is greater than today's day, use today's day. Otherwise, keep the day from the receipt.
    - Always ensure the returned date is not in the future.

    Examples:
    - If the receipt says 2020-05-30 and today is 2025-06-26, set the date to 2025-05-26.
    - If the receipt says 2025-07-11 and today is 2025-06-21, set the date to 2025-06-11.
    - If the receipt says 2025-06-25 and today is 2025-06-21, set the date to 2025-06-21.
    - If the receipt says 2025-05-30 and today is 2025-06-27, set the date to 2025-05-27.

     {
        "storeName": "Exact name of the store/business",
        "totalAmount": 0.00, // Total amount paid (including tax and after discounts)
        "subtotal": 0.00,     // Amount before tax and after discounts
        "taxAmount": 0.00,    // Total tax amount (e.g., VAT, GST, HST, etc.)
        "discountAmount": 0.00, // Any discounts, coupons, or savings applied
        "paymentMethod": "Credit Card", // e.g., Cash, Credit Card, Debit, Mobile Pay, etc.
        "receiptNumber": "12345", // Receipt/transaction ID if available
        "date": "YYYY-MM-DD", // Purchase date in YYYY-MM-DD format
        "time": "HH:MM",      // Purchase time if available
        "items": [
          {
            "name": "Item name (specific and detailed)",
            "price": 0.00,     // Total price for this line item
            "unitPrice": 0.00, // Price per unit if available
            "quantity": 1,     // Number of units
            "category": "Food", // Must be one of: Food, Utilities, Shopping, Transportation, Entertainment, Healthcare, or Others
            "description": "Additional details about this item" // Any extra info (size, color, etc.)
          }
        ]
      }
      CRITICAL RULES:
      1. Always return a valid JSON object with all fields, even if some are null
      2. For monetary values:
         - Always use numbers (not strings)
         - Ensure decimal places are correct (usually 2)
         - If a value is 0, use 0 (not null or empty)
      
      3. For dates and times:
         - Date format: YYYY-MM-DD (e.g., 2025-05-28)
         - Time format: HH:MM in 24-hour format (e.g., 14:30)
      
      4. For items:
         - Include ALL items from the receipt
         - Be specific with item names (e.g., "Organic Bananas" not just "Bananas")
         - Include quantity even if it's 1
         - Calculate unitPrice if not explicitly shown (price / quantity)
      
      5. For categories, use these exact values:
         - Food: Any edible items, groceries, restaurants, takeout, beverages
         - Utilities: Electricity, water, gas, internet, phone bills
         - Shopping: Clothing, electronics, home goods, personal items
         - Transportation: Gas, public transport, taxis, parking, car maintenance
         - Entertainment: Movies, games, events, subscriptions, hobbies
         - Healthcare: Medicine, doctor visits, pharmacy purchases
         - Others: Anything that doesn't fit the above categories
      
      6. If any information is missing or unclear:
         - Make reasonable estimates where possible
         - If completely unknown, use null
         - For amounts that can't be determined, use 0
      
      Return ONLY the JSON object, without any markdown code blocks or additional text.
      If the receipt is not valid or cannot be processed, return: {"error": "Not a valid receipt"}
      `;

      console.log('Converting file to base64...');
      const base64Data = await this.fileToBase64(file);
      
      if (!base64Data) {
        throw new Error('Failed to convert file to base64');
      }

      console.log('Sending request to Gemini API...');
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      
      if (!response) {
        throw new Error('No response from Gemini API');
      }
      
      const text = response.text();
      console.log('Received response from Gemini:', text);

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      try {
        // Try to parse directly first
        const jsonData = this.parseGeminiResponse(text);
        const receipt = await this.validateAndTransformReceiptData(jsonData);
        return receipt;
      } catch (error) {
        console.error('Error in processWithGemini:', error);
        throw new Error(`Failed to process receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in processWithGemini:', error);
      throw new Error(`Failed to process receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseGeminiResponse(text: string): any {
    try {
      // First try to parse directly
      return JSON.parse(text.trim());
    } catch (e) {
      // If direct parse fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
      // If no code block found, try to parse the whole text as JSON one more time
      return JSON.parse(text);
    }
  }

  
  private getSpecificCategory(itemName: string, storeName: string): Category {
    const lowerItem = itemName.toLowerCase();
    const lowerStore = storeName.toLowerCase();

    // Store-specific overrides
    if (lowerStore.includes('fuel station') || lowerStore.includes('gas station')) {
      // Only categorize fuel/gas items as Transportation
      if (lowerItem.includes('fuel') || lowerItem.includes('gas') || 
          lowerItem.includes('petrol') || lowerItem.includes('diesel')) {
        return 'Transportation';
      }
      // Common convenience store items
      if (lowerItem.includes('snack') || lowerItem.includes('drink') || 
          lowerItem.includes('food') || lowerItem.includes('water') ||
          lowerItem.includes('chips') || lowerItem.includes('soda') ||
          lowerItem.includes('candy') || lowerItem.includes('chocolate')) {
        return 'Groceries';
      }
    }

    // Define category mappings
    const categoryMappings = [
      // Groceries
      {
        keywords: ['grocery', 'supermarket', 'market', 'food mart', 'convenience store', 
                  'deli', 'butcher', 'bakery', 'produce', 'food', 'snack', 'drink', 'beverage'],
        category: 'Groceries' as const
      },
      // Dining
      {
        keywords: ['restaurant', 'cafe', 'bistro', 'eatery', 'grill', 'pizzeria', 'sushi', 
                  'bar & grill', 'diner', 'steakhouse', 'tavern', 'pub', 'bar', 
                  'coffee shop', 'breakfast', 'brunch', 'lunch', 'dinner', 'food court', 
                  'fast food', 'takeout', 'delivery'],
        category: 'Dining' as const
      },
      // Transportation
      {
        keywords: ['fuel', 'gas', 'petrol', 'diesel', 'charging', 'public transport', 
                  'bus', 'train', 'subway', 'metro', 'taxi', 'uber', 'lyft', 'parking', 
                  'toll', 'car wash', 'auto repair', 'tire', 'oil change', 'maintenance'],
        category: 'Transportation' as const,
        condition: (item: string, store: string) => {
          const lowerStore = store.toLowerCase();
          // Don't categorize as transportation if it's clearly a grocery item from a gas station
          const groceryKeywords = ['grocery', 'market', 'convenience', 'food', 'snack', 'drink'];
          return !groceryKeywords.some(keyword => lowerItem.includes(keyword));
        }
      },
      // Shopping
      {
        keywords: ['store', 'shop', 'boutique', 'outlet', 'mall', 'department', 
                  'clothing', 'apparel', 'footwear', 'electronics', 'gadget', 
                  'appliance', 'home goods', 'furniture', 'decor', 'hardware', 'diy'],
        category: 'Shopping' as const
      },
      // Bills & Utilities
      {
        keywords: ['bill', 'payment', 'utility', 'electric', 'water', 'gas bill', 
                  'internet', 'phone', 'mobile', 'cable', 'tv', 'streaming', 
                  'subscription', 'membership', 'insurance', 'mortgage', 'rent', 'loan'],
        category: 'Bills' as const
      },
      // Health
      {
        keywords: ['pharmacy', 'drugstore', 'medical', 'dental', 'doctor', 'hospital', 
                  'clinic', 'healthcare', 'wellness', 'fitness', 'gym', 'vitamin', 
                  'supplement', 'optical', 'hearing', 'medicine', 'prescription'],
        category: 'Health' as const
      },
      // Entertainment
      {
        keywords: ['movie', 'cinema', 'theater', 'concert', 'event', 'ticket', 'game', 
                  'hobby', 'sport', 'fitness', 'music', 'book', 'magazine', 'newspaper', 
                  'streaming', 'gaming', 'arcade', 'amusement', 'park', 'museum'],
        category: 'Entertainment' as const
      },
      // Personal Care
      {
        keywords: ['salon', 'barber', 'spa', 'massage', 'beauty', 'hair', 'nails', 
                  'skincare', 'cosmetic', 'grooming', 'wellness', 'tattoo', 'piercing',
                  'toiletries', 'hygiene'],
        category: 'Personal Care' as const
      },
      // Education
      {
        keywords: ['school', 'university', 'college', 'course', 'class', 'training', 
                  'workshop', 'seminar', 'bookstore', 'stationery', 'supplies', 'tuition',
                  'textbook', 'education'],
        category: 'Education' as const
      },
      // Gifts & Donations
      {
        keywords: ['gift', 'present', 'donation', 'charity', 'fundraiser', 'nonprofit', 
                  'ngo', 'church', 'temple', 'mosque', 'synagogue', 'place of worship'],
        category: 'Gifts' as const
      },
      // Home
      {
        keywords: ['home', 'garden', 'furniture', 'appliance', 'renovation', 'repair', 
                  'maintenance', 'cleaning', 'lawn', 'landscaping', 'pest control', 
                  'security', 'houseware', 'kitchen', 'bath', 'bedding'],
        category: 'Home' as const
      }
    ];

    // Check each category mapping
    for (const { keywords, category, condition } of categoryMappings) {
      const matchesKeyword = keywords.some(keyword => 
        lowerItem.includes(keyword) || 
        lowerStore.includes(keyword)
      );
      
      const conditionPasses = condition ? condition(itemName, storeName) : true;
      
      if (matchesKeyword && conditionPasses) {
        return category;
      }
    }

    return 'Others';
  }

 

  private async validateAndTransformReceiptData(data: any): Promise<Partial<Receipt>> {
  // Basic validation
  if (data.error) {
    throw new Error(data.error);
  }

  // All valid categories from the Receipt type
  const validCategories: Category[] = [
    'Food', 'Groceries', 'Dining', 'Transportation', 'Shopping', 'Bills',
    'Health', 'Entertainment', 'Travel', 'Education', 'Home',
    'Personal Care', 'Gifts', 'Others'
  ];
  
  // Calculate subtotal if not provided
  const totalAmount = typeof data.totalAmount === 'number' ? data.totalAmount : 0;
  const taxAmount = typeof data.taxAmount === 'number' ? data.taxAmount : 0;
  const discountAmount = typeof data.discountAmount === 'number' ? data.discountAmount : 0;

  // --- CORRECTED Date normalization logic ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
  const currentDay = now.getDate();
  
  let receiptDate: Date | null = null;
  let useCurrentDate = false;

  if (data.date) {
    const [year, month, day] = data.date.split('-').map(Number);
    
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Apply the prompt rules independently:
      
      // Rule 1: If receipt year is before current year, use current year
      const useYear = year < currentYear ? currentYear : year;
      
      // Rule 2: If receipt month is greater than current month, use current month. Otherwise, keep receipt month.
      const useMonth = month > currentMonth ? currentMonth : month;
      
      // Rule 3: If receipt day is greater than today's day, use today's day. Otherwise, keep receipt day.
      const useDay = day > currentDay ? currentDay : day;
      
      // Create the date (month needs to be 0-based for Date constructor)
      receiptDate = new Date(useYear, useMonth - 1, useDay);
      
      // Final safety check: Ensure the date is not in the future
      if (receiptDate > now) {
        receiptDate = new Date(currentYear, now.getMonth(), currentDay);
      }
      
      console.log(`Date transformation: ${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} → ${useYear}-${useMonth.toString().padStart(2, '0')}-${useDay.toString().padStart(2, '0')}`);
      
    } else {
      console.log('Invalid date format, using current date');
      useCurrentDate = true;
    }
  } else {
    console.log('No date provided, using current date');
    useCurrentDate = true;
  }

  if (useCurrentDate || !receiptDate) {
    receiptDate = now;
  }

  // Format as YYYY-MM-DD
  const formattedDate = receiptDate.toISOString().split('T')[0];

  // Format time
  const receiptTime = data.time || null;

  // Transform the data to match our Receipt type
  const receipt: Partial<Receipt> = {
    store_name: data.storeName?.trim() || 'Unknown Store',
    total_amount: totalAmount,
    subtotal: data.subtotal || (totalAmount - taxAmount + discountAmount),
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    payment_method: data.paymentMethod?.trim(),
    receipt_number: data.receiptNumber?.toString(),
    date: formattedDate,
    time: receiptTime,
    items: (data.items || []).map((item: any) => {
      // First, try to use the provided category if it's valid
      let category: Category = 'Others';
      if (item.category) {
        const normalizedCategory = item.category.trim();
        if (validCategories.includes(normalizedCategory as Category)) {
          category = normalizedCategory as Category;
        } else {
          // Try to match the beginning of the category name
          const matchedCategory = validCategories.find(cat => 
            normalizedCategory.toLowerCase().startsWith(cat.toLowerCase())
          );
          if (matchedCategory) {
            category = matchedCategory;
          } else {
            // If the provided category isn't valid, try to determine a better one
            category = this.getSpecificCategory(item.name || '', data.storeName || '');
          }
        }
      } else {
        // If no category is provided, determine it based on item name and store
        category = this.getSpecificCategory(item.name || '', data.storeName || '');
      }
      
      // Calculate unit price if not provided
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Number(item.price) || 0;
      const unitPrice = typeof item.unitPrice === 'number' 
        ? item.unitPrice 
        : price / quantity;
      
      return {
        name: item.name?.trim() || 'Unknown Item',
        price: price,
        unit_price: unitPrice,
        quantity: quantity,
        category: category,
        description: item.description?.trim()
      };
    }),
  };

  // If no items have categories, try to categorize them based on names
  if (receipt.items && receipt.items.every(item => !item.category)) {
    const { categorizeItems } = await import('@/utils/categoryUtils');
    const categorizedItems = categorizeItems(receipt.items);
    receipt.items = categorizedItems;
  }

  return receipt;
}

  private fileToBase64(file: File): Promise<string> {
    console.log('Starting file to base64 conversion for file:', file.name);
    
    return new Promise((resolve, reject) => {
      if (!file) {
        const error = new Error('No file provided for base64 conversion');
        console.error(error);
        reject(error);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          if (!reader.result) {
            throw new Error('FileReader returned no result');
          }
          
          const result = reader.result as string;
          console.log('File read successfully, length:', result.length);
          
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64String = result.split(',')[1];
          
          if (!base64String) {
            throw new Error('Failed to extract base64 data from file');
          }
          
          console.log('Base64 conversion successful');
          resolve(base64String);
          
        } catch (error) {
          console.error('Error in file reader onload:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error(`Failed to read file: ${error}`));
      };
      
      reader.onabort = () => {
        const error = new Error('File reading was aborted');
        console.error(error);
        reject(error);
      };
      
      try {
        console.log('Starting file read as data URL...');
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error reading file:', error);
        reject(error);
      }
    });
  }

  public async processReceipt(
    file: File,
    userId: string
  ): Promise<{ receipt: Partial<Receipt>; imageUrl: string }> {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      console.log('Starting receipt processing for file:', file.name);
      
      // 1. Upload the image to storage
      console.log('Uploading file to storage...');
      const uploadResult = await storageService.uploadFile(file, userId);
      const imageUrl = uploadResult.url;
      
      if (!imageUrl) {
        throw new Error('Failed to upload image: No URL returned');
      }
      
      console.log('File uploaded successfully. URL:', imageUrl);
      
      // 2. Process the receipt with Gemini
      console.log('Processing receipt with Gemini...');
      const receiptData = await this.processWithGemini(file);
      
      if (!receiptData) {
        throw new Error('Failed to process receipt: No data returned from Gemini');
      }
      
      console.log('Receipt processed successfully:', receiptData);
      
      return {
        receipt: {
          ...receiptData,
          image_url: imageUrl,
        },
        imageUrl,
      };
    } catch (error) {
      console.error('Error in processReceipt:', error);
      throw new Error(`Failed to process receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default ReceiptProcessingService.getInstance();
