import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => (
  <div className="min-h-screen bg-trackslip-dark text-white font-radio flex flex-col">
    <Header />
    <main className="flex-1 flex justify-center items-start pt-28 pb-16 px-4">
      <section className="w-full max-w-3xl bg-black/80 rounded-2xl shadow-xl border border-white/10 p-8 md:p-12 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-trackslip-teal">Terms of Service</h1>
        <p className="mb-4 text-gray-300">Effective Date: June 29, 2025</p>
        <p className="mb-4 text-gray-300">Welcome to TrackSlip! By using our app and services, you agree to the following terms:</p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">1. Use of Service</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>You must be at least 13 years old to use TrackSlip.</li>
          <li>You are responsible for maintaining the confidentiality of your account.</li>
          <li>You agree not to misuse the app or attempt unauthorized access to other users' data.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">2. User Content</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>You retain ownership of your uploaded receipts and data.</li>
          <li>By uploading, you grant us permission to process your data for providing insights and recommendations.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">3. Account Termination</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>You may delete your account at any time.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms or abuse the service.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">4. Limitation of Liability</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-300">
          <li>TrackSlip is provided "as is" without warranties of any kind.</li>
          <li>We are not liable for any damages resulting from your use of the app.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-white">5. Changes to Terms</h2>
        <p className="mb-4 text-gray-300">We may update these Terms of Service. Continued use of the app means you accept any changes.</p>
        <p className="mt-8 text-gray-400">For questions, contact us at <a href="mailto:support@trackslip.com" className="text-trackslip-teal underline">support@trackslip.com</a>.</p>
      </section>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;
