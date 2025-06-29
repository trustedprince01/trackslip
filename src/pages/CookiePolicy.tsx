import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookiePolicy = () => (
  <div className="min-h-screen bg-trackslip-dark text-white font-radio flex flex-col">
    <Header />
    <main className="flex-1 flex justify-center items-start pt-28 pb-16 px-4">
      <section className="w-full max-w-3xl bg-black/80 rounded-2xl shadow-xl border border-white/10 p-8 md:p-12 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-trackslip-teal">Cookie Policy</h1>
        <p className="mb-4 text-gray-300">Effective Date: June 29, 2025</p>
        <p className="mb-4 text-gray-300">TrackSlip uses cookies to ensure the best experience for our users. This Cookie Policy explains what cookies are and how we use them.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">1. What Are Cookies?</h2>
        <p className="mb-4 text-gray-300">Cookies are small text files stored on your device by your browser. They help us remember your preferences and keep you logged in.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">2. How We Use Cookies</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>Authentication: To keep you signed in and secure.</li>
          <li>Session Management: To remember your settings and preferences.</li>
          <li>No third-party advertising or tracking cookies are used.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">3. Managing Cookies</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>You can control or delete cookies through your browser settings.</li>
          <li>Disabling cookies may affect your experience using TrackSlip.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">4. Changes to This Policy</h2>
        <p className="mb-4 text-gray-300">We may update this Cookie Policy. We will notify you of any significant changes via the app or email.</p>
        <p className="mt-8 text-gray-400">If you have questions, contact us at <a href="mailto:support@trackslip.com" className="text-trackslip-teal underline">support@trackslip.com</a>.</p>
      </section>
    </main>
    <Footer />
  </div>
);

export default CookiePolicy;
