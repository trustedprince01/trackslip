
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

export const AddExpenseForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="merchant" className="text-gray-300">Merchant</Label>
        <Input 
          id="merchant" 
          placeholder="Enter merchant name" 
          className="bg-gray-800 border-gray-700 text-white" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-gray-300">Amount</Label>
        <Input 
          id="amount" 
          placeholder="₦0.00" 
          className="bg-gray-800 border-gray-700 text-white" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category" className="text-gray-300">Category</Label>
        <select 
          id="category"
          className="w-full rounded-md bg-gray-800 border border-gray-700 text-white p-2 focus:outline-none focus:ring-2 focus:ring-trackslip-blue"
        >
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="shopping">Shopping</option>
          <option value="bills">Bills</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date" className="text-gray-300">Date</Label>
        <Input 
          id="date" 
          type="date" 
          className="bg-gray-800 border-gray-700 text-white" 
        />
      </div>
      
      <div className="pt-2 space-y-2">
        <p className="text-xs text-gray-400">Upload Receipt (Optional)</p>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-dashed border-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800 h-20"
        >
          <div className="flex flex-col items-center justify-center">
            <Camera className="mb-2 h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400">Click to upload receipt</span>
          </div>
        </Button>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue hover:opacity-90"
        >
          Add Expense
        </Button>
      </div>
    </div>
  );
};
