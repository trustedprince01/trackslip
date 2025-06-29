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
    <section ref={sectionRef} className="py-20 bg-trackslip-dark relative overflow-hidden" id="app-screenshots">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/0 via-trackslip-blue/5 to-black/0 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-radio font-normal mb-4 opacity-0 animate-on-scroll">App Screenshots</h2>
          <div className="w-20 h-0.5 gradient-blue mx-auto"></div>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto font-radio opacity-0 animate-on-scroll">
            See TrackSlip in action on your mobile device
          </p>
        </div>

        {/* Responsive screenshot row: 3 columns on all screens, smaller on mobile */}
        <div className="grid grid-cols-3 gap-2 md:gap-8">
          <Card className="bg-black border border-white/10 overflow-hidden rounded-lg shadow-lg opacity-0 animate-on-scroll flex flex-col p-1 md:p-0">
            <CardContent className="p-0 flex-1">
              <div className="aspect-[9/16] overflow-hidden rounded-md">
                <img 
                  src="/images/2.png" 
                  alt="Receipt Scanning Process" 
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
            <div className="p-2 md:p-4 text-center">
              <p className="text-gray-400 font-radio text-xs md:text-base">Scan Receipt</p>
            </div>
          </Card>
          <Card className="bg-black border border-white/10 overflow-hidden rounded-lg shadow-lg opacity-0 animate-on-scroll flex flex-col p-1 md:p-0">
            <CardContent className="p-0 flex-1">
              <div className="aspect-[9/16] overflow-hidden rounded-md">
                <img 
                  src="/images/4.png" 
                  alt="Analysis Screen" 
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
            <div className="p-2 md:p-4 text-center">
              <p className="text-gray-400 font-radio text-xs md:text-base">Analysis Screen</p>
            </div>
          </Card>
          <Card className="bg-black border border-white/10 overflow-hidden rounded-lg shadow-lg opacity-0 animate-on-scroll flex flex-col p-1 md:p-0">
            <CardContent className="p-0 flex-1">
              <div className="aspect-[9/16] overflow-hidden rounded-md">
                <img 
                  src="/images/1.png" 
                  alt="Dashboard View" 
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
            <div className="p-2 md:p-4 text-center">
              <p className="text-gray-400 font-radio text-xs md:text-base">Dashboard View</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AppScreenshots;
