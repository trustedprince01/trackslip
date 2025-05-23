import { GoogleGenerativeAI } from '@google/generative-ai';

type ValidationResponse = {
  isValid: boolean;
  message: string;
  confidence?: number;
  missingElements?: string[];
};

type TextDetectionResult = {
  hasText: boolean;
  textBlocks: number;
};

class ReceiptValidationService {
  private static instance: ReceiptValidationService;
  private geminiAPIKey: string;
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    // Get API key from environment variables
    this.geminiAPIKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (this.geminiAPIKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiAPIKey);
    }
  }


  public static getInstance(): ReceiptValidationService {
    if (!ReceiptValidationService.instance) {
      ReceiptValidationService.instance = new ReceiptValidationService();
    }
    return ReceiptValidationService.instance;
  }

  /**
   * Validates if an image contains a valid receipt
   * @param imageFile The image file to validate (File object)
   * @returns A promise that resolves to a validation response
   */
  public async validateReceiptImage(imageFile: File): Promise<ValidationResponse> {
    // First try the AI-based validation if API key is available
    if (this.genAI) {
      try {
        const systemPrompt = `You are a receipt validation system. Your task is to determine if an image contains a valid receipt.

A valid receipt should have most of these elements:
1. Store/merchant name
2. Date of purchase
3. List of items purchased with prices
4. Total amount
5. Payment information

Respond with a JSON object containing:
1. "isValid": boolean (true if it's a valid receipt, false otherwise)
2. "confidence": number between 0 and 1 (how confident you are in your assessment)
3. "message": string (explanation of why it is or isn't a valid receipt)
4. "missingElements": array of strings (what elements are missing if it's not valid)

Be strict in your validation. If the image is blurry, doesn't contain clear text, or is not a receipt at all (e.g., a random photo, screenshot, etc.), mark it as invalid.`;

        const model = this.genAI.getGenerativeModel({
          model: 'gemini-pro-vision',
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          },
          systemInstruction: systemPrompt,
        });

        // Convert File to GoogleGenerativeAI.Part
        const imagePart = await this.fileToGenerativePart(imageFile);
        
        const prompt = "Analyze this image and determine if it contains a valid receipt. Respond with the JSON format specified in your instructions.";
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        if (text) {
          return this.parseValidationResponse(text);
        }
      } catch (error) {
        console.error("Error validating receipt with AI:", error);
        // Fall through to the fallback method
      }
    }

    // Fallback to basic image validation if AI validation fails or API key is invalid
    return this.fallbackValidateReceiptImage(imageFile);
  }

  /**
   * Fallback method to validate receipt images using basic image processing
   */
  private async fallbackValidateReceiptImage(imageFile: File): Promise<ValidationResponse> {
    // Check if the image has a reasonable aspect ratio for a receipt
    const image = await this.createImageFromFile(imageFile);
    const aspectRatio = image.width / image.height;
    
    if (aspectRatio > 2.0 || aspectRatio < 0.3) {
      return {
        isValid: false,
        message: "The image doesn't have the typical dimensions of a receipt. Please capture a clearer photo of your receipt."
      };
    }

    // Check if the image has enough text content to be a receipt
    const textDetectionResult = await this.detectTextInImage(image);
    if (!textDetectionResult.hasText) {
      return {
        isValid: false,
        message: "No text was detected in the image. Please capture a clearer photo of your receipt."
      };
    }

    // If we have a reasonable amount of text and the image has receipt-like dimensions, consider it valid
    if (textDetectionResult.textBlocks > 5) {
      return { isValid: true, message: "Receipt validated successfully" };
    } else {
      return {
        isValid: false,
        message: "The image doesn't appear to contain enough text to be a receipt. Please capture a clearer photo showing all receipt details."
      };
    }
  }

  /**
   * Detects text in an image using the browser's OCR capabilities
   */
  private async detectTextInImage(image: HTMLImageElement): Promise<TextDetectionResult> {
    // Note: Browser-based text detection is limited compared to native Vision framework
    // This is a simplified implementation that checks for text using canvas
    
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { hasText: false, textBlocks: 0 };
    }
    
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    // Get image data to analyze
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple check for non-white pixels as a proxy for text
    // This is a very basic check and not as accurate as native OCR
    let textLikePixels = 0;
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Check if pixel is not white (assuming white background)
      if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
        textLikePixels++;
      }
    }
    
    // If more than 5% of pixels are not white, consider it as having text
    const hasText = textLikePixels > (data.length / 4 * 0.05);
    // Estimate text blocks based on non-white pixel density
    const textBlocksEstimate = Math.floor(textLikePixels / 1000);
    
    return {
      hasText,
      textBlocks: hasText ? Math.max(1, textBlocksEstimate) : 0
    };
  }

  /**
   * Validates multiple receipt images
   */
  public async validateReceiptImages(imageFiles: File[]): Promise<ValidationResponse> {
    if (imageFiles.length === 0) {
      return { isValid: false, message: "No images provided" };
    }

    // For efficiency, we'll only validate the first image in detail
    // In a production app, you might want to validate all images
    return this.validateReceiptImage(imageFiles[0]);
  }

  /**
   * Parses the validation response from the AI
   */
  private parseValidationResponse(jsonString: string): ValidationResponse {
    try {
      // Try to extract JSON from markdown code block if present
      const jsonMatch = jsonString.match(/```(?:json)?\n([\s\S]*?)\n```/);
      const jsonToParse = jsonMatch ? jsonMatch[1] : jsonString;
      
      const response = JSON.parse(jsonToParse);
      
      return {
        isValid: response.isValid === true,
        message: response.message || "",
        confidence: response.confidence,
        missingElements: response.missingElements || []
      };
    } catch (error) {
      console.error("Error parsing validation response:", error);
      return {
        isValid: false,
        message: "Error processing validation response"
      };
    }
  }

  /**
   * Converts a File object to a format suitable for Google's Generative AI
   */
  private async fileToGenerativePart(file: File): Promise<any> {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });

    const base64EncodedData = await base64EncodedDataPromise;
    
    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type
      }
    };
  }

  /**
   * Creates an HTMLImageElement from a File object
   */
  private createImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}

export default ReceiptValidationService.getInstance();
