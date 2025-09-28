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
export default function PrivacyPolicy() {
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

      <div className="relative bg-gradient-to-r from-[#FF6B35] to-[#de3b00] h-76 flex items-center justify-center">
        <div className="relative z-10 text-center text-white">
          <div className="flex justify-center mb-6">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17 15.4,17.5 14.8,17.5H9.2C8.6,17.5 8,17 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg mb-4">Your privacy is a cornerstone of our "Engineered Trust" philosophy.</p>
          <p className="text-sm">Last Updated: September 25, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
          <p className="text-md text-gray-700 leading-relaxed">
            Welcome to Voxvertex. This Privacy Policy explains how Voxvertex Solutions Private Limited ("Voxvertex," "we," "us," or "our") collects, uses, shares, and protects information about you when you use our website, platform, and services (collectively, the "Platform"). By using our Platform, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-6">
            To operate our marketplace and provide a secure, seamless experience, we collect information in a few different ways.
          </p>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Information You Provide Directly</h3>
            <p className="text-sm text-gray-700 mb-3">This includes:</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Account information (name, email, password)</li>
              <li>• Profile information (company name, bio, expertise)</li>
              <li>• Verification information through our payment partners</li>
              <li>• Financial information through our payment partners</li>
              <li>• Communications sent through the Platform</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Information We Collect Automatically</h3>
            <p className="text-sm text-gray-700 mb-3">This includes:</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Usage data and platform interactions</li>
              <li>• Device and log data (IP address, browser type)</li>
              <li>• Cookies for personalization and functionality</li>
            </ul>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-4">We use your information to:</p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>Provide and operate the Platform:</strong> Create accounts, display profiles, facilitate bookings, and process transactions</li>
            <li>• <strong>Ensure trust and security:</strong> Verify identities, prevent fraud, monitor content, and mediate disputes</li>
            <li>• <strong>Communicate with you:</strong> Send transactional emails, respond to support requests, and provide updates</li>
            <li>• <strong>Improve our service:</strong> Analyze user behavior to enhance the user experience</li>
          </ul>
        </section>

        {/* How We Share Your Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. How We Share Your Information</h2>
          <p className="text-md font-semibold text-gray-900 mb-4">We do not sell your personal data.</p>
          <p className="text-md text-gray-700 leading-relaxed mb-4">We only share information in these limited circumstances:</p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>With other users:</strong> Speaker profiles are public, organizer company names are visible to those they interact with</li>
            <li>• <strong>With service providers:</strong> Payment processors (Razorpay), hosting providers (Firebase), and email services</li>
            <li>• <strong>For legal reasons:</strong> When required by law or to protect safety and rights</li>
          </ul>
        </section>

        {/* Your Rights and Choices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Your Rights and Choices</h2>
          <p className="text-md text-gray-700 leading-relaxed mb-4">You have control over your personal information:</p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>Access and update:</strong> Review and update your profile information through your dashboard</li>
            <li>• <strong>Opt-out:</strong> Unsubscribe from marketing emails via the links in those emails</li>
            <li>• <strong>Account deletion:</strong> Request account deletion by contacting us (some information may be retained for legal requirements)</li>
          </ul>
        </section>

        {/* Data Security & Retention */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Data Security & Retention</h2>
          <p className="text-md text-gray-700 leading-relaxed">
            We take the security of your data very seriously and implement a variety of security measures. We retain your information for as long as your account is active and as necessary to comply with our legal obligations, such as Indian tax laws which require us to keep financial records for a minimum of seven years.
          </p>
        </section>

        {/* Contact Us */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Contact Us</h2>
          <div className="text-center">
            <p className="text-md text-gray-700 leading-relaxed mb-6">
              If you have any questions or concerns about this Privacy Policy, please contact our Data Protection Officer:
            </p>
            <a 
              href="mailto:privacy@voxvertex.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#FF6B35] text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
              </svg>
              privacy@voxvertex.com
            </a>
          </div>
        </section>

      </div>

      {/* Footer Section */}
      <footer className="bg-[#FF6B35] text-white pl-3">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Logo and Description Column */}
            <div className="lg:col-span-2 min-w-[260px] max-w-sm">
              {/* Logo */}
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
              
              {/* Newsletter Subscription */}
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
                <li><a href="#" className="text-sm hover:underline transition-all">Terms & Conditions</a></li>
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

            {/* Follow Us - Desktop Only */}
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

        {/* Bottom Copyright Bar */}
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