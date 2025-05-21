
import React from "react";
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
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <AppScreenshots />
      <Testimonials />
      <PricingSection />
      <FaqSection />
      <Footer />
    </div>
  );
};

export default Index;
