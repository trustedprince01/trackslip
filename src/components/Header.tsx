
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
      scrolled ? "bg-trackslip-dark/95 backdrop-blur-md shadow-md" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="text-white font-bold text-xl">
            Track<span className="text-trackslip-teal">Slip</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white hover:text-trackslip-teal transition-colors">Home</a>
          <a href="#features" className="text-white hover:text-trackslip-teal transition-colors">Features</a>
          <a href="#pricing" className="text-white hover:text-trackslip-teal transition-colors">Pricing</a>
          <a href="#about" className="text-white hover:text-trackslip-teal transition-colors">About</a>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:text-trackslip-teal hover:bg-white/10">
            Login
          </Button>
          <Button className="bg-trackslip-teal text-trackslip-dark hover:bg-trackslip-teal/90">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden text-white p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-trackslip-darker absolute w-full py-4 shadow-md">
          <nav className="flex flex-col space-y-4 px-6">
            <a href="#" className="text-white hover:text-trackslip-teal transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#features" className="text-white hover:text-trackslip-teal transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="text-white hover:text-trackslip-teal transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#about" className="text-white hover:text-trackslip-teal transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            <div className="flex space-x-4 pt-2">
              <Button variant="ghost" className="text-white hover:text-trackslip-teal hover:bg-white/10">
                Login
              </Button>
              <Button className="bg-trackslip-teal text-trackslip-dark hover:bg-trackslip-teal/90">
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
