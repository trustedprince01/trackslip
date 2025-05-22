
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const InsightCard = () => {
  return (
    <Card className="bg-gradient-to-br from-trackslip-blue/20 to-trackslip-lightBlue/10 border-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
      <CardContent className="p-4 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-trackslip-blue/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <h3 className="text-sm font-medium text-gray-300 mb-2">Insights</h3>
        
        <div className="space-y-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-300">
              <span className="text-trackslip-lightBlue">25% increase</span> in food spending compared to last month
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-300">
              Your highest expense this month was <span className="text-trackslip-lightBlue">₦20.01</span> at Nofrills
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-300">
              You saved <span className="text-green-500">₦3,890</span> this month from discounts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
