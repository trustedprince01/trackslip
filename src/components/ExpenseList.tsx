
import React from "react";

const expenses = [
  {
    id: 1,
    merchant: "Popeyes Louisiana Kitchen",
    category: "Take Out",
    date: "Apr 21, 2025",
    amount: "₦2.19",
    items: 5,
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Popeyes_logo.svg/1200px-Popeyes_logo.svg.png"
  },
  {
    id: 2,
    merchant: "Tim Hortons",
    category: "Coffee",
    date: "Oct 26, 2023",
    amount: "₦6.10",
    items: 8,
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Tim_Hortons_Logo_2022.png/800px-Tim_Hortons_Logo_2022.png"
  },
  {
    id: 3,
    merchant: "Nofrills",
    category: "Grocery",
    date: "Apr 25, 2014",
    amount: "₦20.01",
    items: 5,
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/No_Frills_logo.svg/1200px-No_Frills_logo.svg.png"
  }
];

export const ExpenseList = () => {
  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div 
          key={expense.id} 
          className="p-3 bg-gray-800 rounded-xl flex items-center"
        >
          <div className="h-10 w-10 bg-white rounded-lg p-1 mr-3 flex items-center justify-center overflow-hidden">
            <div 
              className="h-full w-full bg-contain bg-center bg-no-repeat" 
              style={{backgroundImage: `url(${expense.logoUrl})`}}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm text-gray-100 truncate max-w-[120px]">{expense.merchant}</p>
              <p className="font-semibold text-sm">{expense.amount}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-400">{expense.category}</p>
              <p className="text-xs text-gray-400">{expense.items} items</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{expense.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
