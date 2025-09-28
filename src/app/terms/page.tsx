'use client';
import React, { Suspense } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';
import dynamic from 'next/dynamic';

// Dynamic import for Navbar
const Navbar = dynamic(() => import('@/components/Navbar'), {
  loading: () => <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>,
  ssr: false
});

export default function TermsAndConditions() {
  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: any) => {
    if (!profileImage) return null;
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && profileImage.data && profileImage.contentType) {
      const dataUrl = `data:${profileImage.contentType};base64,${profileImage.data.toString('base64')}`;
      return dataUrl;
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && profileImage.url) {
      if (profileImage.url.startsWith('http')) return profileImage.url;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage.url}`;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
        <Navbar 
          user={user || undefined}
          currentUserData={currentUserData}
          isAuthenticated={isAuthenticated}
          forceHomepageStyle={true}
          getProfileImageUrl={getProfileImageUrl}
        />
      </Suspense>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#FF6B35] to-[#de3b00] h-76 flex items-center justify-center">
        <div className="relative z-10 text-center text-white">
          <div className="flex justify-center mb-6">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17 15.4,17.5 14.8,17.5H9.2C8.6,17.5 8,17 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-lg mb-4">Your trust and security are at the heart of everything we do.</p>
          <p className="text-sm">Last Updated: September 25, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction & Agreement to Terms</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-4">
            Welcome to Voxvertex. These Terms and Conditions ("Terms") govern your access to and use of the Voxvertex website, platform, and services (collectively, the "Platform"), owned and operated by Voxvertex Solutions Private limited ("Voxvertex," "we," "us," or "our").
          </p>
          <p className="text-md text-gray-700 leading-relaxed mb-4">
            By creating an account or by accessing or using the Platform in any manner, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Platform.
          </p>
          <p className="text-md font-semibold text-gray-900">
            This is a legally binding agreement. Please read it carefully.
          </p>
        </section>

        {/* The Voxvertex Platform */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. The Voxvertex Platform</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-6">
            Voxvertex is an all-in-one, trust-centric marketplace designed to connect Event Organizers with professional Speakers and manage the entire event lifecycle. The Platform provides tools for event creation, promotion, ticketing, speaker booking, secure payments, and team collaboration for our three types of users:
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Organizers ("Organizers")</h3>
              <p className="text-sm text-gray-700">Users who create, manage, and promote events.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Speakers</h3>
              <p className="text-sm text-gray-700">Professional users who offer their speaking and related services to Organizers.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Participants ("Attendees")</h3>
              <p className="text-sm text-gray-700">Users who purchase tickets to attend events created by Organizers.</p>
            </div>
          </div>
        </section>

        {/* User Accounts & Verification */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts & Verification</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Creation</h3>
              <p className="text-sm text-gray-700">
                To access most features, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Security</h3>
              <p className="text-sm text-gray-700">
                You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Identity Verification (KYC/KYB)</h3>
              <p className="text-sm text-gray-700">
                To uphold our "Engineered Trust" philosophy and comply with financial regulations, all Organizers and Speakers must complete a Know Your Customer (KYC) or Know Your Business (KYB) verification process through our designated payment partner. Failure to complete or pass this verification may result in account suspension or termination.
              </p>
            </div>
          </div>
        </section>

        {/* Financial Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Financial Terms</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-6">
            Voxvertex facilitates financial transactions between its users. You agree to the following terms regarding payments and fees.
          </p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">A. For Event Organizers</h3>
              <ul className="text-sm text-gray-700 space-y-3">
                <li>• <strong>Subscription Fees:</strong> Organizers access the Platform's core features by purchasing a subscription ("Pro Plan"). Fees are billed on a recurring basis (monthly or annually) as selected at the time of purchase. All subscription fees are subject to applicable taxes (e.g., GST).</li>
                <li>• <strong>Escrow Payments:</strong> When booking a Speaker, the Organizer agrees to fund a secure escrow account managed by our payment partner. The Organizer is responsible for paying the full agreed-upon fee plus any applicable payment processing or international transfer fees. These funds are held in escrow until after the successful completion of the event.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">B. For Speakers</h3>
              <ul className="text-sm text-gray-700 space-y-3">
                <li>• <strong>Platform Fee:</strong> Voxvertex charges Speakers a 10% Platform Fee on the gross fee for every successfully completed and paid booking. This fee is automatically deducted from the funds held in escrow before the final payout is made.</li>
                <li>• <strong>Payouts:</strong> Payouts are released to the Speaker's verified bank account after the event is completed and a 48-hour security clearance period has passed. Voxvertex is not responsible for delays caused by banking partners.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">C. For Participants</h3>
              <ul className="text-sm text-gray-700 space-y-3">
                <li>• <strong>Ticket Purchases:</strong> Participants agree to pay the full price of the ticket as listed on the event page.</li>
                <li>• <strong>Transaction Fee:</strong> A 2% Transaction Fee is added to the ticket price at checkout to cover the costs of secure payment processing. This will be clearly itemized before you complete your purchase.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Engineered Trust Escrow System */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. The "Engineered Trust" Escrow System</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-4">
            The escrow system is a core feature designed to protect both Organizers and Speakers.
          </p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• By booking a Speaker, the Organizer authorizes Voxvertex to act as their agent to hold and release funds.</li>
            <li>• Funds will be released to the Speaker only after the event has been successfully completed and a 48-hour hold period has passed without a formal dispute being filed.</li>
            <li>• In the event of a cancellation or dispute, the funds will be held until the matter is resolved according to our Dispute Resolution Policy.</li>
          </ul>
        </section>

        {/* User Conduct & Content */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. User Conduct & Content</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Ownership</h3>
              <p className="text-sm text-gray-700">
                You retain ownership of all content you upload to the Platform (e.g., event descriptions, posts, etc.). However, you grant Voxvertex a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content as necessary to operate and promote the Platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Acceptable Use</h3>
              <p className="text-sm text-gray-700">
                You agree not to post any content or engage in any activity that is fraudulent, illegal, defamatory, or infringes on the intellectual property rights of others. You may not create spam profiles or events.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Monitoring</h3>
              <p className="text-sm text-gray-700">
                We reserve the right, but not the obligation, to monitor all activity on the Platform and to remove any user or content that violates these Terms, in our sole discretion.
              </p>
            </div>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Dispute Resolution</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-6">
            In the event of a disagreement between an Organizer and a Speaker, we provide a structured, three-stage resolution process:
          </p>
          
          <div className="space-y-4">
            <div className="bg-[#FF6B35]/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#FF6B35] mb-2">Stage 1: Peer-to-Peer Resolution</h3>
              <p className="text-sm text-[#FF6B35]">The parties are encouraged to communicate directly through our secure messaging system to reach an amicable solution.</p>
            </div>
            <div className="bg-[#FF6B35]/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#FF6B35] mb-2">Stage 2: Platform Mediation</h3>
              <p className="text-sm text-[#FF6B35]">If the parties cannot resolve the issue, either party may request mediation. A trained Voxvertex administrator will review the case, including all communications and documents, and propose a non-binding resolution.</p>
            </div>
            <div className="bg-[#FF6B35]/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#FF6B35] mb-2">Stage 3: Formal Escalation</h3>
              <p className="text-sm text-[#FF6B35]">If mediation fails, the funds will remain held in escrow, and we will provide both parties with a complete record of the transaction and communication to assist them in pursuing any legal remedies they may choose.</p>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation of Liability & Disclaimer</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-4">
            The Platform is provided "as is" and "as available," without warranty of any kind. Voxvertex does not guarantee the quality, safety, or legality of the events or services offered by its users.
          </p>
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
            To the fullest extent permitted by law, Voxvertex shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the platform; (b) any conduct or content of any third party on the platform.
          </p>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Termination</h2>
          <p className="text-md text-gray-700 leading-relaxed">
            We may suspend or terminate your account and your access to the Platform at our sole discretion, without prior notice or liability, for any reason, including if you breach these Terms. You may cancel your account at any time.
          </p>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Governing Law & Jurisdiction</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
          <p className="text-md text-gray-700 leading-relaxed">
            You agree to submit to the exclusive jurisdiction of the courts located in Gautam Buddh Nagar, Uttar Pradesh, India to resolve any legal matter arising from these Terms.
          </p>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Changes to Terms</h2>
          <p className="text-md text-gray-700 leading-relaxed">
            We reserve the right to modify these Terms at any time. If we make changes, we will provide you with notice, such as by sending an email, providing a notice through the Platform, or updating the "Last Updated" date at the top of these Terms. Your continued use of the Platform will confirm your acceptance of the revised Terms.
          </p>
        </section>

        {/* Contact Us */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Contact Information</h2>
          <div className="text-center">
            <p className="text-md text-gray-700 leading-relaxed mb-6">
              If you have any questions about these Terms, please contact us:
            </p>
            <a 
              href="mailto:tnc@voxvertex.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#FF6B35] text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
              </svg>
              tnc@voxvertex.com
            </a>
          </div>
        </section>

      </div>

      {/* Footer Section */}
      <footer className="bg-[#FF6B35] text-white pl-3">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

            <div className="lg:col-span-2 min-w-[260px] max-w-sm">
              <div className="w-32 h-20 mb-4">
                <img 
                  src="/Voxvertex.png" 
                  alt="Voxvertex" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <p className="text-sm leading-relaxed mb-6">
                Empowering connections between guest lecturers and event organizers to create transformative events.
              </p>
              

              <div className="newsletter mt-6">
                <h3 className="text-base font-medium mb-3">Subscribe Our Newsletter</h3>
                <div className="relative">
                  <input
                    type="email"
                    placeholder=""
                    className="w-full px-4 py-2 pr-20 text-black text-sm bg-white rounded-full border-0 outline-none placeholder-gray-500"
                  />
                  <button className="absolute right-1 top-1 bottom-1 px-3 sm:px-4 bg-white text-[#FF6B35] border border-[#FF6B35] text-xs sm:text-sm font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all">
                    Submit
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="col-span-1">
              <h3 className="text-base font-semibold mb-4">NAVIGATION</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:underline transition-all">Home</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">Events</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">Blogs</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">Podcast</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">Courses</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">About</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">Contact</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="col-span-1">
              <h3 className="text-base font-semibold mb-4">SUPPORT</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:underline transition-all">FAQs</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">Help Center</a></li>
                <li><a href="/terms" className="text-sm hover:underline transition-all">Terms & Conditions</a></li>
                <li><a href="#" className="text-sm hover:underline transition-all">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Get in Touch and Follow Us Combined for Mobile */}
            <div className="col-span-1 lg:col-span-1 space-y-8 lg:space-y-0">
              {/* Get in Touch */}
              <div>
                <h3 className="text-base font-semibold mb-4">GET IN TOUCH</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">info@voxvertex.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">+91 7356459540</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">
                      C-162, IInd Floor, Swarn Jayanti Puram, Ghaziabad (201013)
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow Us */}
              <div className="lg:hidden">
                <h3 className="text-base font-semibold mb-4">FOLLOW US</h3>
                <div className="flex gap-3">
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="hidden lg:block col-span-1">
              <h3 className="text-base font-semibold mb-4">FOLLOW US</h3>
              <div className="flex gap-3">
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#FF6B35] py-3 border-t border-white">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-white">
              Copyright © 2024 Voxvertex Solutions All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}