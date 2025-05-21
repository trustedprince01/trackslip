
import React from 'react';
import { cn } from '@/lib/utils';

const steps = [
  {
    title: "Snap a photo",
    description: "Take a quick picture of any receipt with your phone camera.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: "AI instantly extracts all details",
    description: "Our advanced AI recognizes and extracts store name, items, prices, and dates automatically.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  },
  {
    title: "View organized spending data",
    description: "Access insights about your spending patterns and identify saving opportunities.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

interface StepCardProps {
  step: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  index: number;
}

const StepCard = ({ step, index }: StepCardProps) => (
  <div className={cn(
    "bg-trackslip-darker p-8 rounded-xl border border-gray-800",
    "transform transition-all duration-300 hover:-translate-y-2",
    "flex flex-col items-center text-center"
  )}>
    <div className="w-16 h-16 mb-6 rounded-full gradient-blue bg-opacity-20 flex items-center justify-center text-white">
      {step.icon}
    </div>
    <div className="mb-2 gradient-blue-text font-bold">Step {index + 1}</div>
    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
    <p className="text-gray-400">{step.description}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-trackslip-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <div className="w-20 h-1 gradient-blue mx-auto"></div>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            TrackSlip simplifies expense tracking in three easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
