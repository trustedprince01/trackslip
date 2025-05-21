
import React from 'react';
import { cn } from '@/lib/utils';

const steps = [
  {
    title: "Upload a photo",
    description: "Upload any receipt from your device.",
    icon: (
      <img 
        src="/camera.svg" 
        alt="Upload photo" 
        className="h-8 w-8" 
        style={{ width: '2rem', height: '2rem' }}
      />
    )
  },
  {
    title: "AI instantly extracts all details",
    description: "Our advanced AI recognizes and extracts store name, items, prices, and dates automatically.",
    icon: (
      <img 
        src="/chip.svg" 
        alt="AI chip" 
        className="h-8 w-8" 
        style={{ width: '2rem', height: '2rem' }}
      />
    )
  },
  {
    title: "View organized spending data",
    description: "Access insights about your spending patterns and identify saving opportunities.",
    icon: (
      <img 
        src="/chart.svg" 
        alt="Chart" 
        className="h-8 w-8" 
        style={{ width: '2rem', height: '2rem' }}
      />
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
    <div className="w-16 h-16 mb-6 rounded-full bg-trackslip-teal/20 flex items-center justify-center text-trackslip-teal">
      {step.icon}
    </div>
    <div className="mb-2 text-trackslip-teal font-bold">Step {index + 1}</div>
    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
    <p className="text-gray-400">{step.description}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section 
      id="how-it-works" 
      className="py-20"
      style={{ backgroundColor: 'rgb(2,2,7)' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <div className="w-20 h-1 bg-trackslip-teal mx-auto"></div>
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
