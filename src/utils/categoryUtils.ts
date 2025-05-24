export type Category = 'Food' | 'Utilities' | 'Shopping' | 'Transportation' | 'Entertainment' | 'Healthcare' | 'Others';

export interface CategorizedItem {
  name: string;
  price: number;
  quantity: number;
  category: Category;
}

export const itemCategories: { [key: string]: Category } = {
  // Food & Groceries
  'banana': 'Food',
  'apple': 'Food',
  'milk': 'Food',
  'bread': 'Food',
  'eggs': 'Food',
  'meat': 'Food',
  'chicken': 'Food',
  'fish': 'Food',
  'rice': 'Food',
  'pasta': 'Food',
  'vegetables': 'Food',
  'fruits': 'Food',
  'snacks': 'Food',
  'beverages': 'Food',
  'coffee': 'Food',
  'tea': 'Food',
  'restaurant': 'Food',
  'takeout': 'Food',
  'delivery': 'Food',
  
  // Utilities
  'electricity': 'Utilities',
  'water': 'Utilities',
  'gas': 'Utilities',
  'internet': 'Utilities',
  'phone': 'Utilities',
  'mobile': 'Utilities',
  'cable': 'Utilities',
  'tv': 'Utilities',
  'streaming': 'Utilities',
  
  // Shopping
  'clothing': 'Shopping',
  'shoes': 'Shopping',
  'electronics': 'Shopping',
  'appliances': 'Shopping',
  'furniture': 'Shopping',
  'home': 'Shopping',
  'decor': 'Shopping',
  'beauty': 'Shopping',
  'cosmetics': 'Shopping',
  'accessories': 'Shopping',
  
  // Transportation
  'gasoline': 'Transportation',
  'fuel': 'Transportation',
  'public transport': 'Transportation',
  'taxi': 'Transportation',
  'uber': 'Transportation',
  'lyft': 'Transportation',
  'parking': 'Transportation',
  'maintenance': 'Transportation',
  'car wash': 'Transportation',
  
  // Entertainment
  'movie': 'Entertainment',
  'cinema': 'Entertainment',
  'game': 'Entertainment',
  'concert': 'Entertainment',
  'event': 'Entertainment',
  'hobby': 'Entertainment',
  'sports': 'Entertainment',
  'gym': 'Entertainment',
  'subscription': 'Entertainment',
  
  // Healthcare
  'pharmacy': 'Healthcare',
  'medicine': 'Healthcare',
  'doctor': 'Healthcare',
  'hospital': 'Healthcare',
  'dental': 'Healthcare',
  'vision': 'Healthcare',
  'insurance': 'Healthcare',
};

export function categorizeItem(itemName: string): Category {
  const lowerName = itemName.toLowerCase();
  
  // Check for exact matches first
  for (const [keyword, category] of Object.entries(itemCategories)) {
    if (lowerName.includes(keyword)) {
      return category;
    }
  }
  
  return 'Others';
}

export function categorizeItems(items: Array<{ name: string; price: number; quantity: number }>): CategorizedItem[] {
  return items.map(item => ({
    ...item,
    category: categorizeItem(item.name)
  }));
}

export function getCategorySpending(categorizedItems: CategorizedItem[]) {
  const categoryTotals: { [key in Category]?: number } = {};
  
  categorizedItems.forEach(item => {
    const currentTotal = categoryTotals[item.category] || 0;
    categoryTotals[item.category] = currentTotal + (item.price * item.quantity);
  });
  
  // Convert to array and sort by amount (descending)
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category as Category,
      amount: amount || 0
    }))
    .sort((a, b) => b.amount - a.amount);
}
