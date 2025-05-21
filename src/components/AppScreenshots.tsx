
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";

const AppScreenshots = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => {
        const element = el as HTMLElement;
        const position = element.getBoundingClientRect();
        
        // If element is in viewport
        if(position.top < window.innerHeight && position.bottom >= 0) {
          element.classList.add('animate-reveal');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-trackslip-dark relative overflow-hidden" id="app">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/0 via-trackslip-blue/5 to-black/0 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-radio font-normal mb-4 opacity-0 animate-on-scroll">App Screenshots</h2>
          <div className="w-20 h-0.5 gradient-blue mx-auto"></div>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto font-radio opacity-0 animate-on-scroll">
            See TrackSlip in action on your mobile device
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-black border border-white/10 overflow-hidden rounded-lg shadow-lg opacity-0 animate-on-scroll">
            <CardContent className="p-1">
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center rounded-md">
                <p className="text-gray-400 text-center px-6 font-radio">Receipt Scanning Process</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border border-white/10 overflow-hidden rounded-lg shadow-lg opacity-0 animate-on-scroll">
            <CardContent className="p-1">
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center rounded-md">
                <p className="text-gray-400 text-center px-6 font-radio">Analysis Screen</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border border-white/10 overflow-hidden rounded-lg shadow-lg opacity-0 animate-on-scroll">
            <CardContent className="p-1">
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center rounded-md">
                <p className="text-gray-400 text-center px-6 font-radio">Dashboard View</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AppScreenshots;
