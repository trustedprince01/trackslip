
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  setMobileMenuOpen?: (open: boolean) => void;
}

const HeroSection = ({ setMobileMenuOpen }: HeroSectionProps) => {
  const navigate = useNavigate();
  return (
    <section 
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('/images/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-trackslip-deepdark"></div>
      <div className="container mx-auto px-4 md:px-6 z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-radio font-light text-white leading-tight animate-fade-in">
            Transform Receipts Into <span className="text-trackslip-blue">Financial Insights</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-200 fade-in-delay-1 font-radio font-light">
            Snap a photo. Let AI do the rest.
          </p>
          <div className="mt-10 flex flex-wrap gap-5 justify-center fade-in-delay-2">
            <Button 
            className="bg-trackslip-blue hover:bg-trackslip-blue/90 font-radio font-normal text-white border border-trackslip-blue/50 px-8 py-6 text-base rounded-md"
            onClick={() => {
              navigate('/login');
              setMobileMenuOpen(false);
            }}
            >
            Start Tracking Free
            </Button>
            
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/5 font-radio font-normal px-8 py-6 text-base rounded-md"
              onClick={() => {
                const appScreenshots = document.getElementById('app-screenshots');
                if (appScreenshots) {
                  appScreenshots.scrollIntoView({ behavior: 'smooth' });
                }
                setMobileMenuOpen?.(false);
              }}
            >
              Watch Demo
            </Button>

          </div>
          <div className="mt-12 text-gray-300 fade-in-delay-3">
            <p className="flex items-center justify-center font-radio text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-trackslip-blue" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No payment required completely Free
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-0 right-0 w-1/3 h-2/3">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/10 filter blur-3xl"></div>
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-trackslip-blue/10 filter blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
