
import React, { useEffect, useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import AppScreenshots from "@/components/AppScreenshots";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
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
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-trackslip-dark text-white font-radio">
      <Header />
      <HeroSection />
      <div className="bg-trackslip-deepdark">
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
