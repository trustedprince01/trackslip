import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-trackslip-dark text-white font-radio flex flex-col">
    <Header />
    <main className="flex-1 flex justify-center items-start pt-28 pb-16 px-4">
      <section className="w-full max-w-3xl bg-black/80 rounded-2xl shadow-xl border border-white/10 p-8 md:p-12 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-trackslip-teal">Privacy Policy</h1>
        <p className="mb-4 text-gray-300">Effective Date: June 29, 2025</p>
        <p className="mb-4 text-gray-300">TrackSlip is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our app and services.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">1. Information We Collect</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li><b>Account Data:</b> We collect your email, username, and password when you register.</li>
          <li><b>Receipts & Images:</b> We store your uploaded receipts, images, and extracted data for your use only.</li>
          <li><b>Usage Data:</b> We collect analytics on app usage to improve our services.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">2. How We Use Your Information</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>To provide and maintain our services.</li>
          <li>To personalize your experience and offer insights.</li>
          <li>To improve app features and security.</li>
          <li>To communicate with you about updates or support.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">3. Data Sharing & Security</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>Your data is never sold or shared with third parties for marketing.</li>
          <li>Access to your receipts, recommendations, and images is protected by strict row-level security policies. Only you can access your data.</li>
          <li>We use encryption and secure storage for all sensitive information.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">4. Cookies & Tracking</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>We use cookies only for authentication and session management.</li>
          <li>No third-party advertising or tracking cookies are used.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">5. Your Rights</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>You can access, update, or delete your account and data at any time.</li>
          <li>Contact us for any privacy-related requests or questions.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">6. Changes to This Policy</h2>
        <p className="mb-4 text-gray-300">We may update this Privacy Policy. We will notify you of any significant changes via the app or email.</p>
        <p className="mt-8 text-gray-400">If you have questions, contact us at <a href="mailto:support@trackslip.com" className="text-trackslip-teal underline">support@trackslip.com</a>.</p>
      </section>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
