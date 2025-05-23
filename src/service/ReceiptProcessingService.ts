import { GoogleGenerativeAI } from '@google/generative-ai';
import { Receipt, ReceiptItem } from '@/types/receipt';
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
      {
        "storeName": "Name of the store",
        "totalAmount": 0.00,
        "subtotal": 0.00,  // Amount before tax and discounts
        "taxAmount": 0.00,  // Total tax amount
        "discountAmount": 0.00,  // Total discount/savings amount
        "date": "YYYY-MM-DD",
        "items": [
          {
            "name": "Item name",
            "price": 0.00,
            "quantity": 1
          }
        ]
      }
      
      Important Rules:
      - Calculate subtotal as: subtotal = totalAmount + discountAmount - taxAmount
      - If tax or discount cannot be determined, set to 0
      - Return ONLY the JSON object, without any markdown code blocks or additional text
      - If a field cannot be determined, set it to null
      - For the date, use the format YYYY-MM-DD
      - For amounts, ensure they are numbers (not strings)
      - If the receipt is not in English, translate the store and item names to English
      - If the receipt is not a valid receipt, return: {"error": "Not a valid receipt"}
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
        return this.validateAndTransformReceiptData(jsonData);
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

  private validateAndTransformReceiptData(data: any): Partial<Receipt> {
    // Basic validation
    if (data.error) {
      throw new Error(data.error);
    }

    // Calculate subtotal if not provided
    let subtotal = data.subtotal ? Number(data.subtotal) : null;
    const taxAmount = data.taxAmount ? Number(data.taxAmount) : 0;
    const discountAmount = data.discountAmount ? Number(data.discountAmount) : 0;
    
    // If subtotal is not provided, try to calculate it
    if (subtotal === null && data.totalAmount) {
      const total = Number(data.totalAmount);
      subtotal = total + discountAmount - taxAmount;
    }

    // Transform the data to match our Receipt type
    return {
      store_name: data.storeName || 'Unknown Store',
      total_amount: data.totalAmount ? Number(data.totalAmount) : 0,
      subtotal: subtotal || 0,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      date: data.date || new Date().toISOString().split('T')[0], // Ensure it's a string in YYYY-MM-DD format
      items: Array.isArray(data.items) 
        ? data.items.map((item: any) => ({
            name: item.name || 'Unknown Item',
            price: item.price ? Number(item.price) : 0,
            quantity: item.quantity ? Number(item.quantity) : 1,
          }))
        : [],
    };
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
