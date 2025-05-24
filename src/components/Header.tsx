import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Sign out and navigate to home page
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-trackslip-blue' : 'text-gray-700 dark:text-gray-300';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link 
          to={user ? '/dashboard' : '/'} 
          onClick={handleLogoClick}
          className="flex items-center space-x-2"
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue bg-clip-text text-transparent">
            TrackSlip
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="#" className={`text-sm font-radio text-white/90 hover:text-white transition-colors ${isActive('/')}`}>
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
