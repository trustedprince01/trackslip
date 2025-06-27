import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
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
      scrolled ? "bg-black/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 text-white font-radio text-xl">
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
              <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#667eea'}}/>
                  <stop offset="100%" style={{stopColor: '#764ba2'}}/>
                </linearGradient>
                <linearGradient id="receiptGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#667eea'}}/>
                  <stop offset="100%" style={{stopColor: '#764ba2'}}/>
                </linearGradient>
              </defs>
              
              {/* Background rounded rectangle */}
              <rect width="32" height="32" rx="7" fill="url(#bg)"/>
              
              {/* Receipt */}
              <rect x="8" y="6" width="12" height="16" rx="2" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
              
              {/* Receipt lines */}
              <rect x="10" y="9" width="8" height="1" rx="0.5" fill="url(#receiptGrad)"/>
              <rect x="10" y="11" width="6" height="0.8" rx="0.4" fill="#e0e0e0"/>
              <rect x="10" y="13" width="7" height="0.8" rx="0.4" fill="#e0e0e0"/>
              <rect x="10" y="15" width="5" height="0.8" rx="0.4" fill="#e0e0e0"/>
              <rect x="10" y="17" width="8" height="1" rx="0.5" fill="url(#receiptGrad)"/>
              
              {/* Tracking pin icon */}
              <circle cx="24" cy="10" r="4" fill="rgba(102,126,234,0.2)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
              <circle cx="24" cy="10" r="1.5" fill="#667eea"/>
              
              {/* Scan line */}
              <rect x="6" y="15" width="16" height="1" rx="0.5" fill="#005fff" opacity="0.8"/>
            </svg>
            <span>Track<span className="text-trackslip-teal">Slip</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="#" className="text-sm font-radio text-white/90 hover:text-white transition-colors">
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#features" className="text-sm font-radio text-white/90 hover:text-white transition-colors">
                  Features
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-radio text-white/90 hover:text-white bg-transparent hover:bg-white/10">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[260px] bg-black/90 backdrop-blur-xl p-4 rounded-md border border-white/10">
                    <ul className="space-y-4">
                      <li>
                        <NavigationMenuLink href="#" className="block text-sm text-white/80 hover:text-trackslip-teal p-2 rounded-md hover:bg-white/5">
                          For Individuals
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="#" className="block text-sm text-white/80 hover:text-trackslip-teal p-2 rounded-md hover:bg-white/5">
                          For Small Businesses
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="#" className="block text-sm text-white/80 hover:text-trackslip-teal p-2 rounded-md hover:bg-white/5">
                          For Accountants
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#pricing" className="text-sm font-radio text-white/90 hover:text-white transition-colors">
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="ghost" 
            className="font-radio text-white/90 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 text-sm"
            onClick={() => navigate('/login')}
          >
            Log in
          </Button>
          <Button 
            className="bg-trackslip-blue hover:bg-trackslip-blue/90 font-radio text-white border border-trackslip-blue/50 text-sm px-5"
            onClick={() => navigate('/signup')}
          >
            Sign up free
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
        <div className="md:hidden bg-black/95 backdrop-blur-xl absolute w-full py-4 shadow-lg border-t border-white/5">
          <nav className="flex flex-col space-y-4 px-6">
            <Link 
              to="/" 
              className="text-white/90 hover:text-white font-radio text-sm py-2 block" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="#features" 
              className="text-white/90 hover:text-white font-radio text-sm py-2 block" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            {/* <Link 
              to="#pricing" 
              className="text-white/90 hover:text-white font-radio text-sm py-2 block" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link> */}
            <div className="border-t border-white/10 pt-4 flex flex-col space-y-3">
              <Button 
                variant="ghost" 
                className="text-white/90 hover:text-white hover:bg-white/5 font-radio text-sm justify-start"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Log in
              </Button>
              <Button 
                className="bg-trackslip-blue hover:bg-trackslip-blue/90 font-radio text-sm text-white"
                onClick={() => {
                  navigate('/signup');
                  setMobileMenuOpen(false);
                }}
              >
                Sign up free
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
