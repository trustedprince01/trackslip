export type Category = 
  | 'Food'           // General food, meals, snacks, etc.
  | 'Groceries'      // Food items from supermarkets/grocery stores
  | 'Dining'         // Restaurant meals, takeout, coffee shops
  | 'Transportation' // Gas, public transit, parking, ride-sharing
  | 'Shopping'       // Retail purchases, clothing, electronics
  | 'Bills'          // Utilities, phone, internet, subscriptions
  | 'Health'         // Pharmacy, medical expenses, fitness
  | 'Entertainment'  // Movies, games, events, hobbies
  | 'Travel'         // Flights, hotels, car rentals
  | 'Education'      // Books, courses, school supplies
  | 'Home'           // Furniture, appliances, home improvement
  | 'Personal Care'  // Beauty, hygiene, salon services
  | 'Gifts'          // Presents, donations, charity
  | 'Others';        // Anything that doesn't fit above

export interface CategorizedItem {
  name: string;
  price: number;
  quantity: number;
  category: Category;
}

// Updated keyword mapping for more accurate categorization
const categoryMappings: { keywords: string[]; category: Category }[] = [
  // Food (general)
  {
    keywords: [
      'food', 'meal', 'snack', 'lunch', 'dinner', 'breakfast', 'brunch', 'supper', 'refreshment', 'cuisine', 'dish', 'plate', 'entree', 'main course', 'side dish', 'dessert', 'appetizer', 'beverage', 'drink', 'juice', 'soda', 'water', 'coffee', 'tea',
    ],
    category: 'Food',
  },
  // Groceries
  {
    keywords: [
      'grocery', 'supermarket', 'market', 'food mart', 'convenience store',
      'deli', 'butcher', 'bakery', 'produce', 'banana', 'apple', 'milk', 'bread', 'eggs', 'meat', 'chicken', 'fish', 'rice', 'pasta', 'vegetables', 'fruits', 'snacks', 'beverages', 'coffee', 'tea',
    ],
    category: 'Groceries',
  },
  // Dining
  {
    keywords: [
      'restaurant', 'cafe', 'bistro', 'eatery', 'grill', 'pizzeria', 'sushi',
      'bar & grill', 'diner', 'steakhouse', 'tavern', 'pub', 'bar',
      'coffee shop', 'breakfast', 'brunch', 'lunch', 'dinner', 'food court',
      'fast food', 'takeout', 'delivery',
      // Common restaurant menu items
      'spicy chicken wings', 'burger', 'fries', 'pizza', 'chapman', 'catfish', 'pepper soup', 'jollof', 'plantain', 'egg sauce', 'bolognese', 'nkwobi',
    ],
    category: 'Dining',
  },
  // Transportation
  {
    keywords: [
      'gasoline', 'fuel', 'public transport', 'taxi', 'uber', 'lyft', 'parking', 'maintenance', 'car wash', 'bus', 'train', 'subway', 'metro', 'toll', 'charging', 'petrol', 'diesel',
    ],
    category: 'Transportation',
  },
  // Shopping
  {
    keywords: [
      'clothing', 'shoes', 'electronics', 'appliances', 'furniture', 'home', 'decor', 'beauty', 'cosmetics', 'accessories', 'store', 'shop', 'boutique', 'outlet', 'mall', 'department', 'apparel', 'footwear', 'gadget', 'home goods', 'hardware', 'diy',
    ],
    category: 'Shopping',
  },
  // Bills
  {
    keywords: [
      'electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'cable', 'tv', 'streaming', 'bill', 'payment', 'utility', 'gas bill', 'subscription', 'membership', 'insurance', 'mortgage', 'rent', 'loan',
    ],
    category: 'Bills',
  },
  // Health
  {
    keywords: [
      'pharmacy', 'medicine', 'doctor', 'hospital', 'dental', 'vision', 'insurance', 'drugstore', 'medical', 'clinic', 'healthcare', 'wellness', 'fitness', 'gym', 'vitamin', 'supplement', 'optical', 'hearing', 'prescription',
    ],
    category: 'Health',
  },
  // Entertainment
  {
    keywords: [
      'movie', 'cinema', 'game', 'concert', 'event', 'hobby', 'sports', 'gym', 'subscription', 'theater', 'ticket', 'music', 'book', 'magazine', 'newspaper', 'streaming', 'gaming', 'arcade', 'amusement', 'park', 'museum',
    ],
    category: 'Entertainment',
  },
  // Travel
  {
    keywords: [
      'flight', 'hotel', 'car rental', 'travel', 'trip', 'airbnb', 'booking', 'lodge', 'resort',
    ],
    category: 'Travel',
  },
  // Education
  {
    keywords: [
      'school', 'university', 'college', 'course', 'class', 'training', 'workshop', 'seminar', 'bookstore', 'stationery', 'supplies', 'tuition', 'textbook', 'education',
    ],
    category: 'Education',
  },
  // Home
  {
    keywords: [
      'home', 'garden', 'furniture', 'appliance', 'renovation', 'repair', 'maintenance', 'cleaning', 'lawn', 'landscaping', 'pest control', 'security', 'houseware', 'kitchen', 'bath', 'bedding',
    ],
    category: 'Home',
  },
  // Personal Care
  {
    keywords: [
      'salon', 'barber', 'spa', 'massage', 'beauty', 'hair', 'nails', 'skincare', 'cosmetic', 'grooming', 'wellness', 'tattoo', 'piercing', 'toiletries', 'hygiene',
    ],
    category: 'Personal Care',
  },
  // Gifts
  {
    keywords: [
      'gift', 'present', 'donation', 'charity', 'fundraiser', 'nonprofit', 'ngo', 'church', 'temple', 'mosque', 'synagogue', 'place of worship',
    ],
    category: 'Gifts',
  },
];

export function categorizeItem(itemName: string): Category {
  const lowerName = itemName.toLowerCase();
  for (const { keywords, category } of categoryMappings) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
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
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category as Category,
      amount: amount || 0
    }))
    .sort((a, b) => b.amount - a.amount);
}
