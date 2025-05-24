import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import AppScreenshots from "@/components/AppScreenshots";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize component and handle scroll animations
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => {
        const element = el as HTMLElement;
        const position = element.getBoundingClientRect();
        
        // If element is in viewport
        if (position.top < window.innerHeight * 0.85 && position.bottom >= 0) {
          element.classList.add('animate-scroll-reveal');
          element.style.opacity = '1';
        }
      });
    };
    
    // Set up scroll event listener
    window.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 300);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Show loading state while checking auth
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trackslip-blue"></div>
      </div>
    );
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-trackslip-dark text-white font-radio">
      <Header />
      <HeroSection />
      <div className="bg-trackslip-dark">
        <HowItWorks />
        <FeaturesSection />
        <AppScreenshots />
        <Testimonials />
        <PricingSection />
        <FaqSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
