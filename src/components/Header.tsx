
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

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
      scrolled ? "bg-black/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="text-white font-radio text-xl">
            Track<span className="text-trackslip-teal">Slip</span>
          </a>
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
                    <ul className="space-y-2">
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
          <Button variant="ghost" className="font-radio text-white/90 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 text-sm">
            Log in
          </Button>
          <Button className="bg-trackslip-blue hover:bg-trackslip-blue/90 font-radio text-white border border-trackslip-blue/50 text-sm px-5">
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
            <a href="#" className="text-white/90 hover:text-white font-radio text-sm py-2" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#features" className="text-white/90 hover:text-white font-radio text-sm py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="text-white/90 hover:text-white font-radio text-sm py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <div className="border-t border-white/10 pt-4 flex flex-col space-y-3">
              <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/5 font-radio text-sm justify-start">
                Log in
              </Button>
              <Button className="bg-trackslip-blue hover:bg-trackslip-blue/90 font-radio text-sm text-white">
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
