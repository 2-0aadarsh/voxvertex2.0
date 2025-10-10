'use client';
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Lock, 
  Scale, 
  Users, 
  Globe, 
  Lightbulb,
  ArrowRight,
  Star,
  Zap,
  Target,
  CircleCheckBig,
  Crown,
  BarChart3
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';

export default function AboutPage() {
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; whoAreYou?: string; profileImage?: any } | undefined>(undefined);
  const { isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Helper function to get profile image URL
  const getProfileImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://res.cloudinary.com/demo/image/fetch/${url}`;
  };

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Header */}
      <Navbar 
        user={user}
        currentUserData={currentUserData}
        isAuthenticated={isAuthenticated}
        forceHomepageStyle={true}
        getProfileImageUrl={getProfileImageUrl}
      />

      {/* Trust Banner */}
      <div className="bg-orange-50 border border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center space-x-2">
            <Crown className="w-4 h-4 text-orange-600" />
            <span className="text-orange-800 font-medium">Trusted by 10,000+ Event Organizers</span>
          </div>
        </div>
      </div>

      {/* About Voxvertex Section */}
      <section className="py-20 bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#1e293b]">
            About <span className="text-orange-500">Voxvertex</span>
          </h1>
          
          <p className="text-xl text-[#334155] max-w-3xl mx-auto mb-12">
            A professional marketplace that ensures security and trust in every aspect of event management. We provide enterprise-grade solutions for organizers and speakers worldwide.
          </p>
        </div>
      </section>

      {/* Advanced Features in Development Section */}
      <section className="py-20 bg-[#1e293b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#1e293b] rounded-xl p-8 max-w-4xl mx-auto">
            <div className="flex justify-center space-x-6 mb-8">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-gray-800" />
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Advanced Features in Development</h3>
            <p className="text-gray-300">
              Enhanced automation tools, intelligent matching systems, advanced analytics, and next-generation security features designed to streamline event management processes.
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-20 bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Our Mission Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Our Mission</h3>
              <p className="text-[#334155] text-center">
                To empower Speakers to build their careers and Event Organizers to create events with confidence through professional, secure platform solutions.
              </p>
            </div>

            {/* Our Vision Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-[#1e293b] rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Star className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Our Vision</h3>
              <p className="text-[#334155] text-center">
                To create a world where every successful event begins with a trusted, professional partnership backed by industry-leading technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise-Grade Security Section */}
      <section className="py-12 bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-full text-lg font-medium">
            <Shield className="w-5 h-5" />
            <span>Enterprise-Grade Security</span>
          </div>
        </div>
      </section>

      {/* Built on Trust Section */}
      <section className="py-16 bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#1e293b]">
            Built on <span className="text-orange-500">Trust</span>
          </h2>
          
          <p className="text-xl text-[#334155] max-w-3xl mx-auto mb-16">
            Trust forms the foundation of our platform. Every feature is designed with security, transparency, and professional reliability at its core.
          </p>

          {/* Four Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Identity Verification Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-[#1e293b] mb-3 text-center">Identity Verification</h3>
              <p className="text-[#334155] text-sm text-center">
                Comprehensive KYC/KYB verification ensures all users meet professional standards and accountability requirements.
              </p>
            </div>

            {/* Performance Tracking Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-[#1e293b] rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-[#1e293b] mb-3 text-center">Performance Tracking</h3>
              <p className="text-[#334155] text-sm text-center">
                Transparent performance metrics including payment history and reliability scores build trust through verified data.
              </p>
            </div>

            {/* Secure Transactions Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-[#1e293b] mb-3 text-center">Secure Transactions</h3>
              <p className="text-[#334155] text-sm text-center">
                Bank-grade escrow system with milestone-based payments protects all financial transactions and guarantees payment security.
              </p>
            </div>

            {/* Professional Mediation Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Scale className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-[#1e293b] mb-3 text-center">Professional Mediation</h3>
              <p className="text-[#334155] text-sm text-center">
                Structured dispute resolution process with professional mediators ensures fair outcomes for all parties involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards - Three Columns */}
      <section className="py-20 bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Event Organizers Card */}
            <div className="bg-white rounded-xl p-8 border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Event Organizers</h3>
              <p className="text-[#64748b] mb-6">Complete Event Control</p>
              
              <ul className="space-y-3">
                {[
                  'Professional event creation tools',
                  'Integrated marketing platform',
                  'Verified speaker directory',
                  'Team collaboration workspace',
                  'Financial management dashboard'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CircleCheckBig className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-[#334155]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Professional Speakers Card */}
            <div className="bg-white rounded-xl p-8 border-l-4 border-[#1e293b] shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-[#1e293b] rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Professional Speakers</h3>
              <p className="text-[#64748b] mb-6">Career Growth Platform</p>
              
              <ul className="space-y-3">
                {[
                  'Professional profile showcase',
                  'Calendar and availability management',
                  'Booking and opportunity tracking',
                  'Secure payment processing',
                  'Performance analytics'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CircleCheckBig className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-[#334155]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Event Attendees Card */}
            <div className="bg-white rounded-xl p-8 border-l-4 border-green-600 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Event Attendees</h3>
              <p className="text-[#64748b] mb-6">Seamless Experience</p>
              
              <ul className="space-y-3">
                {[
                  'Easy event discovery',
                  'Secure registration process',
                  'Digital ticket management',
                  'Event recommendations',
                  'Professional networking tools'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CircleCheckBig className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-[#334155]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Feature Cards - Two Columns */}
      <section className="py-20 bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Canvas Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Event Canvas</h3>
              <p className="text-[#64748b] mb-6">Professional event website builder</p>
              
              <p className="text-[#334155] mb-6">
                Create professional event websites with our intuitive builder. Features pre-designed templates that automatically integrate with your event management system.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {['Speaker Profiles', 'Event Agenda', 'Registration', 'Analytics'].map((feature, index) => (
                  <button key={index} className="px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors text-sm">
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Professional Dashboard Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-[#1e293b] rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Professional Dashboard</h3>
              <p className="text-[#64748b] mb-6">Comprehensive management center</p>
              
              <p className="text-[#334155] mb-6">
                Centralized dashboard for managing bookings, communications, and payments. Track all opportunities and engagements with detailed analytics and reporting.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {['Booking Management', 'Secure Payments', 'Analytics', 'Communication'].map((feature, index) => (
                  <button key={index} className="px-4 py-2 border border-[#1e293b] text-[#1e293b] rounded-lg hover:bg-[#1e293b] hover:text-white transition-colors text-sm">
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Infrastructure Section */}
      <section className="py-20 bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm mb-8">
            <Lock className="w-4 h-4" />
            <span>Bank-Grade Security</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Financial <span className="text-orange-500">Infrastructure</span>
          </h2>
          
          <p className="text-xl text-[#334155] max-w-3xl mx-auto mb-16">
            Enterprise-grade financial systems with complete transparency, security, and regulatory compliance for professional transactions.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Secure Escrow System */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-[#1e293b] mb-4">Secure Escrow System</h3>
              <p className="text-[#334155]">
                Professional-grade escrow with milestone-based payments, ensuring complete transaction security and payment guarantees for all parties.
              </p>
            </div>

            {/* Transparent Pricing */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Scale className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-[#1e293b] mb-4">Transparent Pricing</h3>
              <p className="text-[#334155]">
                Clear, professional pricing structure with no hidden fees. Comprehensive fee transparency and detailed transaction reporting.
              </p>
            </div>

            {/* Regulatory Compliance */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-[#1e293b] rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-[#1e293b] mb-4">Regulatory Compliance</h3>
              <p className="text-[#334155]">
                Full compliance with international financial regulations, KYC/AML requirements, and jurisdiction-specific legal frameworks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Continuous Innovation Section */}
      <section className="py-20 bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm mb-8">
            <Lightbulb className="w-4 h-4" />
            <span>Innovation & Development</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Continuous <span className="text-orange-500">Innovation</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            We are continuously developing advanced features and technologies to enhance the event management experience. Our innovation roadmap includes AI-powered tools, enhanced automation, and next-generation security protocols.
          </p>
        </div>
      </section>

      {/* Join Our Professional Network Section */}
      <section className="py-20 bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Professional Network</h2>
          
          <p className="text-xl max-w-3xl mx-auto mb-12">
            Become part of Voxvertex to access these innovative features as they become available and help shape the future of professional event management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup/login" className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center space-x-2">
              <span>Request Demo</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/home" className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center space-x-2">
              <span>Learn More</span>
              <Star className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Elevate Your Events?</h2>
          
          <p className="text-xl max-w-3xl mx-auto mb-12">
            Join thousands of professionals who trust Voxvertex for their event management needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup/login" className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center space-x-2">
              <span>Start as Organizer</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/signup/login" className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center space-x-2">
              <span>Start as Speaker</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}