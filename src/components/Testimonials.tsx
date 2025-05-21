
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "TrackSlip has transformed how I manage my business expenses. The AI extraction is uncannily accurate and has saved me hours of manual data entry every week.",
    author: "Sarah Johnson",
    position: "Small Business Owner",
    avatar: "https://i.pravatar.cc/150?img=32"
  },
  {
    quote: "As someone who dreaded keeping track of receipts, TrackSlip has been a game-changer. Now I just snap photos and the app does the rest. My accountant loves me now!",
    author: "Michael Chen",
    position: "Freelance Consultant",
    avatar: "https://i.pravatar.cc/150?img=68"
  },
  {
    quote: "The spending insights feature helped me realize where my money was going each month. I've saved over $300 monthly just by being more aware of my spending patterns.",
    author: "Priya Patel",
    position: "Financial Analyst",
    avatar: "https://i.pravatar.cc/150?img=47"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-trackslip-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <div className="w-20 h-1 bg-trackslip-teal mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-trackslip-darker border-gray-800">
              <CardContent className="p-8">
                <div className="mb-6">
                  <svg className="h-8 w-8 text-trackslip-teal opacity-50" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <p className="text-gray-300 mb-6">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="h-12 w-12 rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.author}</h4>
                    <p className="text-sm text-gray-400">{testimonial.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
