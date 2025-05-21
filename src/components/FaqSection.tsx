
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We use bank-level security with 256-bit encryption to ensure all your data is protected. We don't store actual images of your receipts once processed, only the extracted data which is encrypted and stored securely."
  },
  {
    question: "How accurate is the AI in extracting information?",
    answer: "Our AI achieves over 98% accuracy in extracting data from standard receipts. It continuously improves through machine learning. In rare cases where extraction is unclear, the app will prompt you to verify the information."
  },
  {
    question: "Can I export my data for tax purposes?",
    answer: "Yes, TrackSlip allows you to export your receipt data in various formats (CSV, PDF, Excel) which can be used for tax purposes. Premium users also get access to pre-formatted tax reports."
  },
  {
    question: "Does TrackSlip work with receipts in different languages?",
    answer: "Currently, TrackSlip supports receipts in English, Spanish, French, German, and Italian. We're actively working on adding support for more languages."
  },
  {
    question: "What happens if I exceed my monthly scan limit on the free plan?",
    answer: "If you reach your 30 receipt limit on the free plan, you'll need to wait until the next billing cycle or upgrade to the Premium plan for unlimited scanning."
  },
  {
    question: "Can I use TrackSlip for business expenses?",
    answer: "Definitely! Many of our users are business owners, freelancers, and professionals who use TrackSlip to track business expenses. The Premium plan offers additional features like expense categorization and report generation that are particularly useful for business users."
  }
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-20 bg-trackslip-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="w-20 h-1 gradient-blue mx-auto"></div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-gray-800">
                <AccordionTrigger className="text-left hover:gradient-blue-text">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
