
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const AppScreenshots = () => {
  return (
    <section className="py-20 bg-trackslip-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-trackslip-dark/0 via-trackslip-purple/5 to-trackslip-dark/0 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">App Screenshots</h2>
          <div className="w-20 h-1 bg-trackslip-teal mx-auto"></div>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            See TrackSlip in action on your mobile device
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-trackslip-darker border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <p className="text-gray-400 text-center px-6">Receipt Scanning Process</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-trackslip-darker border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <p className="text-gray-400 text-center px-6">Analysis Screen</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-trackslip-darker border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <p className="text-gray-400 text-center px-6">Dashboard View</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AppScreenshots;
