
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
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
    <section 
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center bg-trackslip-dark overflow-hidden"
      style={{
        backgroundImage: `url('/lovable-uploads/279a9431-8e34-49b7-96bc-1b658504fa6f.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50"></div>
      <div className="container mx-auto px-4 md:px-6 z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-radio font-normal text-white leading-tight animate-fade-in">
            Transform Receipts Into <span className="text-trackslip-teal">Financial Insights</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-200 fade-in-delay-1 font-radio font-normal">
            Snap a photo. Let AI do the rest.
          </p>
          <div className="mt-10 flex flex-wrap gap-5 justify-center fade-in-delay-2">
            <Button className="bg-trackslip-blue hover:bg-trackslip-blue/90 font-radio font-normal text-white border border-trackslip-blue/50 px-8 py-6 text-base rounded-md">
              Start Tracking Free
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/5 font-radio font-normal px-8 py-6 text-base rounded-md">
              Watch Demo
            </Button>
          </div>
          <div className="mt-12 text-gray-300 fade-in-delay-3">
            <p className="flex items-center justify-center font-radio text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-trackslip-teal" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required for free tier
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-0 right-0 w-1/3 h-2/3">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/10 filter blur-3xl"></div>
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-trackslip-teal/10 filter blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
