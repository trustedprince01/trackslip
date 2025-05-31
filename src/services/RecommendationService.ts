import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveRecommendation, getRecommendation, convertToAIRecommendation } from "./RecommendationDBService";

type FormatCurrencyFunction = (amount: number) => string;

// Fallback recommendations when API is not available
const generateFallbackRecommendation = (
  category: string,
  spendingData: {
    amount: number;
    percentage: number;
    transactionCount: number;
  }
): AIRecommendation => {
  const baseAmount = spendingData.amount || 0;
  const percentage = spendingData.percentage || 0;
  
  return {
    analysis: `You've spent $${baseAmount.toFixed(2)} on ${category} (${percentage.toFixed(1)}% of your total expenses).`,
    recommendations: [
      `Consider setting a monthly budget for ${category}`,
      `Look for discounts or coupons when shopping for ${category}`,
      `Review if all ${category} expenses are necessary`
    ],
    potentialSavings: `Potential savings: $${(baseAmount * 0.15).toFixed(2)}/month by optimizing ${category} spending`,
    suggestedBudget: `Suggested budget: $${(baseAmount * 0.85).toFixed(2)} (15% less than current spending)`,
    confidence: 'medium',
    categoryInsights: [
      `This is a significant portion (${percentage.toFixed(1)}%) of your total spending`,
      `You've made ${spendingData.transactionCount} transactions in this category`
    ]
  };
};

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Using fallback recommendations.');
}

// Initialize with just the API key for now
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Simple in-memory cache
const recommendationCache = new Map();

const generateCacheKey = (category: string, amount: number) => {
  return `${category}-${amount.toFixed(2)}`;
};

export interface AIRecommendation {
  analysis: string;
  recommendations: string[];
  potentialSavings: string;
  suggestedBudget: string;
  confidence?: 'high' | 'medium' | 'low';
  categoryInsights?: string[];
  error?: string; // Add error property for error handling
}

export const getAIRecommendation = async (
  receipts: any[],
  category: string,
  spendingData: {
    amount: number;
    percentage: number;
    transactionCount: number;
  },
  formatCurrency: FormatCurrencyFunction = (amount) => `₦${amount.toFixed(2)}`,
  forceRefresh = false
): Promise<AIRecommendation | null> => {
  // Check for existing recommendation in DB first if not forcing a refresh
  if (!forceRefresh) {
    const existingRec = await getRecommendation(category);
    if (existingRec) {
      return convertToAIRecommendation(existingRec);
    }
  }

  const cacheKey = generateCacheKey(category, spendingData.amount);
  
  // Return cached result if available
  if (recommendationCache.has(cacheKey)) {
    return recommendationCache.get(cacheKey);
  }

  // If no API key or no receipts, return a fallback response
  if (!genAI) {
    console.warn('No Gemini API key found. Using fallback recommendations.');
    const fallback = generateFallbackRecommendation(category, spendingData);
    // Save fallback to DB
    await saveRecommendation(category, fallback);
    return fallback;
  }

  // Check if we have any receipts
  if (!receipts || receipts.length === 0) {
    console.warn('No receipts provided for analysis');
    return {
      analysis: 'No receipt data available for analysis.',
      recommendations: [
        'Start by adding some receipts to get personalized recommendations',
        'Make sure your receipts include item details for better insights'
      ],
      potentialSavings: 'Potential savings: ₦0.00',
      suggestedBudget: 'Suggested budget: Not enough data',
      confidence: 'low'
    };
  }

  // Extract and process receipt items for analysis
  const transactions = receipts
    .filter(receipt => !category || receipt.category === category || receipt.items?.some((item: any) => item.category === category))
    .flatMap(receipt => {
      if (!receipt.items || !Array.isArray(receipt.items)) {
        return [];
      }
      
      return receipt.items.map((item: any) => {
        const unitPrice = item.unit_price || item.price || 0;
        const quantity = item.quantity || 1;
        
        return {
          date: receipt.date,
          store: receipt.store_name || 'Unknown Store',
          item: item.name || 'Unnamed Item',
          amount: unitPrice * quantity,
          unitPrice,
          quantity,
          unit: item.unit || 'unit',
          category: item.category || receipt.category || 'Uncategorized'
        };
      });
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20); // Limit to 20 most recent items for analysis

  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const averagePerItem = transactions.length > 0 ? totalSpent / transactions.length : 0;

  // Define store data type
  interface StoreData {
    count: number;
    total: number;
    items: Set<string>;
    categories: Set<string>;
  }

  // Group items by store for store-specific analysis
  const stores = transactions.reduce<Record<string, StoreData>>((acc, tx) => {
    if (!acc[tx.store]) {
      acc[tx.store] = {
        count: 0,
        total: 0,
        items: new Set<string>(),
        categories: new Set<string>()
      };
    }
    const storeData = acc[tx.store];
    storeData.count++;
    storeData.total += tx.amount;
    storeData.items.add(tx.item);
    storeData.categories.add(tx.category);
    return acc;
  }, {});

  // Find most frequent items and categories
  const itemFrequency = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.item] = (acc[tx.item] || 0) + 1;
    return acc;
  }, {});

  const mostFrequentItems = Object.entries(itemFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([item, count]) => ({ item, count }));

  // Try multiple model options in order of preference
  const modelOptions = [
    "gemini-1.5-flash",     // Most reliable current model
    "gemini-1.5-pro",       // Backup option
    "gemini-1.0-pro",       // Legacy fallback
  ];


  let model;
  let lastError;
  let successfulModel = '';

  // Try each model until one works, with delay between attempts
  for (const [index, modelName] of modelOptions.entries()) {
    try {
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Trying fallback model: ${modelName}...`);
      }
      
      model = genAI.getGenerativeModel({ model: modelName });
      successfulModel = modelName;
      console.log(`✅ Successfully initialized model: ${modelName}`);
      break;
    } catch (error) {
      console.warn(`❌ Failed to initialize model ${modelName}:`, error.message);
      lastError = error;
    }
  }

  if (!model) {
    console.error('All model initialization attempts failed:', lastError);
    return generateFallbackRecommendation(category, spendingData);
  }
  
  const prompt = `You are an expert financial advisor with deep knowledge in expense optimization and smart shopping strategies. 
Analyze the following spending in the **${category}** category and provide specific, actionable recommendations.

### SPENDING SUMMARY
- **Total spent:** ${formatCurrency(totalSpent)}
- **Average per item:** ${formatCurrency(averagePerItem)}
- **Items analyzed:** ${transactions.length}

### STORE BREAKDOWN
${Object.entries(stores).map(([store, data]) => 
  `- **${store}**: ${data.count} items (${formatCurrency(data.total)})`
).join('\n')}

### MOST FREQUENT ITEMS
${mostFrequentItems.map(({item, count}) => 
  `- **${item}** (purchased ${count} ${count === 1 ? 'time' : 'times'})`
).join('\n')}

### RECENT TRANSACTIONS (up to 20 most recent):
${transactions.slice(0, 20).map(tx => 
  `- **${tx.date}**: ${tx.quantity} ${tx.unit} of **${tx.item}** at **${tx.store}** - ${formatCurrency(tx.amount)}`
).join('\n')}

YOUR TASK:
1. Analyze the spending patterns and item details
2. Provide specific, actionable recommendations
3. Consider bulk purchase opportunities, alternative stores, and potential savings
4. Be specific about items and amounts

RESPONSE FORMAT (strict JSON only, no markdown or backticks):
{
  "analysis": "2-3 sentence analysis of specific spending patterns and opportunities",
  "recommendations": [
    "Specific recommendation based on items (e.g., 'Buy 5L of milk instead of 1L to save 15% per liter')",
    "Store-specific advice (e.g., 'Prices at [Store] are 10% lower for [items]')",
    "Timing or bulk purchase suggestion (e.g., 'Stock up on [items] during [time period] when prices drop')"
  ],
  "potentialSavings": {
    "amount": estimated_monthly_savings,
    "reasoning": "Based on your spending patterns and item details"
   
  },
  "suggestedBudget": {
    "amount": suggested_monthly_budget,
    "reasoning": "Based on your spending patterns and item details"
    
  },
  "confidence": "high/medium/low"
}

IMPORTANT: Focus on specific items and exact amounts where possible. Avoid generic advice.`;

  let text = '';
  try {
    console.log('Sending prompt to AI model:', { category, transactionCount: transactions.length });
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
      
      // Try to parse the response as JSON first
      try {
        // Clean the response to extract just the JSON part
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON object found in response');
        
        const aiResponse = JSON.parse(jsonMatch[0]);
        
        // Format the response to match the AIRecommendation interface
        const aiRecommendation: AIRecommendation = {
          analysis: aiResponse.analysis || `Analysis of your spending in ${category} shows opportunities for optimization.`,
          recommendations: Array.isArray(aiResponse.recommendations) && aiResponse.recommendations.length > 0 
            ? aiResponse.recommendations 
            : [
                `Consider setting a monthly budget for ${category}`,
                `Look for discounts or coupons when shopping for ${category}`,
                `Review if all ${category} expenses are necessary`
              ],
          potentialSavings: typeof aiResponse.potentialSavings === 'string' 
            ? aiResponse.potentialSavings 
            : aiResponse.potentialSavings?.reasoning 
              ? `Potential savings: ${formatCurrency(aiResponse.potentialSavings.amount || 0)}. ${aiResponse.potentialSavings.reasoning}`
              : `Potential savings of ${formatCurrency(spendingData.amount * 0.15)} per month.`,
          suggestedBudget: typeof aiResponse.suggestedBudget === 'string'
            ? aiResponse.suggestedBudget
            : aiResponse.suggestedBudget?.reasoning
              ? `Suggested budget: ${formatCurrency(aiResponse.suggestedBudget.amount || spendingData.amount * 0.85)}. ${aiResponse.suggestedBudget.reasoning}`
              : `Suggested budget: ${formatCurrency(spendingData.amount * 0.85)}`,
          confidence: ['high', 'medium', 'low'].includes(aiResponse.confidence?.toLowerCase())
            ? aiResponse.confidence.toLowerCase() as 'high' | 'medium' | 'low'
            : 'medium',
          categoryInsights: Array.isArray(aiResponse.categoryInsights) && aiResponse.categoryInsights.length > 0
            ? aiResponse.categoryInsights
            : [
                `You've spent ${formatCurrency(spendingData.amount)} in this category`,
                `This represents ${spendingData.percentage.toFixed(1)}% of your total spending`,
                `You've made ${spendingData.transactionCount} transactions in this category`
              ]
        };
        
        console.log('Successfully parsed AI response:', aiRecommendation);
        
        // Save the recommendation to the database
        await saveRecommendation(category, aiRecommendation);
        
        // Update the cache
        recommendationCache.set(cacheKey, aiRecommendation);
        
        return aiRecommendation;
      } catch (jsonError) {
        console.warn('Failed to parse JSON response, falling back to regex parsing:', jsonError);
        
        // Fallback to regex parsing if JSON parsing fails
        const analysis = text.match(/## Analysis([\s\S]*?)(?=## |$)/i)?.[1]?.trim() || 
                       `Analysis of your spending in ${category} shows opportunities for optimization.`;
        
        const recommendations = Array.from(
          text.matchAll(/\*\*(.*?)\*\*/g),
          (match) => match[1]
        ).filter(rec => rec.trim().length > 0);
        
        const potentialSavings = text.match(/Potential Savings:([^\n]+)/i)?.[1]?.trim() || 
                             `Potential savings of ${formatCurrency(spendingData.amount * 0.15)} per month.`;
        
        const suggestedBudget = text.match(/Suggested Budget:([^\n]+)/i)?.[1]?.trim() || 
                            `Suggested budget: ${formatCurrency(spendingData.amount * 0.85)}`;
        
        const confidenceMatch = text.match(/Confidence: ([^\n]+)/i);
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        if (confidenceMatch) {
          const confText = confidenceMatch[1].toLowerCase().trim();
          if (confText.includes('high')) confidence = 'high';
          else if (confText.includes('low')) confidence = 'low';
        }
        
        const categoryInsights = Array.from(
          text.matchAll(/- (.*?)(?=\n|$)/g),
          (match) => match[1]
        ).filter(insight => 
          insight && 
          !insight.includes('**') && 
          !insight.includes('Potential Savings:') && 
          !insight.includes('Suggested Budget:') &&
          !insight.includes('Confidence:')
        );

        const aiRecommendation: AIRecommendation = {
          analysis,
          recommendations: recommendations.length > 0 ? recommendations : [
            `Consider setting a monthly budget for ${category}`,
            `Look for discounts or coupons when shopping for ${category}`,
            `Review if all ${category} expenses are necessary`
          ],
          potentialSavings,
          suggestedBudget,
          confidence,
          categoryInsights: categoryInsights.length > 0 ? categoryInsights : [
            `You've spent ${formatCurrency(spendingData.amount)} in this category`,
            `This represents ${spendingData.percentage.toFixed(1)}% of your total spending`,
            `You've made ${spendingData.transactionCount} transactions in this category`
          ]
        };
        
        console.log('Successfully parsed AI response with fallback parsing:', aiRecommendation);
        recommendationCache.set(cacheKey, aiRecommendation);
        return aiRecommendation;
      }

      // This code is unreachable due to the return statements in the try-catch blocks above
      // Keeping it as a fallback with a default recommendation
      const fallbackRecommendation = generateFallbackRecommendation(category, spendingData);
      await saveRecommendation(category, fallbackRecommendation);
      return fallbackRecommendation;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response text:', text || 'No response text available');
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    
    // Log detailed error information
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      if ('status' in error) {
        errorMessage += ` (Status: ${error.status})`;
      }
      if ('statusText' in error) {
        errorMessage += ` - ${error.statusText}`;
      }
    }
    
    console.error('Detailed error:', {
      message: errorMessage,
      error: JSON.stringify(error, null, 2),
      apiKey: API_KEY ? 'API key is set' : 'API key is missing',
      triedModels: modelOptions,
      successfulModel: successfulModel || 'None'
    });
    
    // Return a fallback response with more detailed error info
    return {
      analysis: `Unable to generate analysis at this time. ${errorMessage}`,
      recommendations: [
        "Review your recent transactions in this category",
        "Compare with previous months' spending",
        "Consider setting a budget for this category"
      ],
      potentialSavings: "Review your transactions to identify potential savings",
      suggestedBudget: `Consider setting a budget around ${Math.round(spendingData.amount * 0.9)} for next month`,
      error: errorMessage
    };
  }
};