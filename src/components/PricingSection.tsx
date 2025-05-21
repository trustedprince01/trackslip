
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { cn } from '@/lib/utils';

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for occasional receipt tracking",
    features: [
      "Scan up to 30 receipts per month",
      "Basic data extraction",
      "7-day history",
      "Export data as CSV",
      "Email support"
    ],
    highlighted: false,
    cta: "Get Started"
  },
  {
    name: "Premium",
    price: "9.99",
    period: "monthly",
    description: "Complete toolkit for regular expense tracking",
    features: [
      "Unlimited receipt scanning",
      "Advanced data extraction & categorization",
      "Unlimited history",
      "Custom spending categories",
      "Advanced analytics dashboard",
      "Export in multiple formats",
      "Priority support",
      "Expense reports generation"
    ],
    highlighted: true,
    cta: "Start Free Trial"
  }
];

const PricingSection = () => {
  return (
    <section 
      id="pricing" 
      className="py-20"
      style={{ backgroundColor: 'rgb(2,2,7)' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Transparent Pricing</h2>
          <div className="w-20 h-1 bg-trackslip-teal mx-auto"></div>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "bg-trackslip-darker border-gray-800",
                plan.highlighted && "border-trackslip-teal ring-1 ring-trackslip-teal"
              )}
            >
              <CardHeader className="pb-0">
                {plan.highlighted && (
                  <div className="py-1 px-3 bg-trackslip-teal text-black text-xs font-bold uppercase tracking-wider rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-2">/{plan.period}</span>}
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-6 w-6 mr-2 text-trackslip-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={cn(
                    "w-full",
                    plan.highlighted 
                      ? "bg-trackslip-teal hover:bg-trackslip-teal/90 text-trackslip-dark" 
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
