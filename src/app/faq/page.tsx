'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, Mail, MessageCircle, Phone, HelpCircle, Calendar, Users, User, Wrench, CreditCard, ArrowLeft, Menu, X } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  questions: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: 'general',
    title: 'General Platform',
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        question: 'What is VoxVertex?',
        answer: 'VoxVertex is a comprehensive event management platform that connects event organizers, speakers, and audiences. We provide complete tools for event planning, speaker management, attendee engagement, and post-event analytics.'
      },
      {
        question: 'Who can use VoxVertex?',
        answer: 'VoxVertex is designed for event organizers planning conferences, workshops, seminars, and corporate events, as well as speakers looking for speaking opportunities and attendees seeking engaging events to participate in.'
      },
      {
        question: 'What types of events can I manage on VoxVertex?',
        answer: 'You can manage virtually any type of event including conferences, workshops, webinars, seminars, corporate meetings, trade shows, networking events, and educational sessions.'
      },
      {
        question: 'Is VoxVertex suitable for both in-person and virtual events?',
        answer: 'Yes! VoxVertex supports hybrid, in-person, and fully virtual events with integrated streaming capabilities, virtual networking tools, and digital engagement features.'
      }
    ]
  },
  {
    id: 'organizers',
    title: 'For Event Organizers',
    icon: <Calendar className="w-5 h-5" />,
    questions: [
      {
        question: 'How do I create an event on VoxVertex?',
        answer: 'Simply sign up as an organizer, click "Create Event" in your dashboard, fill in the event details, set up your agenda, invite speakers, and configure registration settings. Our step-by-step wizard guides you through the entire process.'
      },
      {
        question: 'Can I customize my event page and branding?',
        answer: 'Absolutely! You can customize your event page with your brand colors, logos, images, and content. Upload custom banners, set brand guidelines, and create a cohesive experience that matches your organization\'s identity.'
      },
      {
        question: 'How does speaker management work?',
        answer: 'Our platform allows you to search and invite speakers from our marketplace, manage speaker profiles, coordinate schedules, handle contracts, and facilitate communication between speakers and your team.'
      },
      {
        question: 'What payment and ticketing options are available?',
        answer: 'VoxVertex supports multiple payment gateways, tiered pricing, early bird discounts, promo codes, group rates, and both free and paid events. Automatic invoicing and receipt generation are included.'
      },
      {
        question: 'Can I track event analytics and attendee engagement?',
        answer: 'Yes! Our comprehensive analytics dashboard provides insights on registration rates, attendee engagement, session popularity, networking activity, feedback scores, and ROI metrics.'
      }
    ]
  },
  {
    id: 'speakers',
    title: 'For Speakers',
    icon: <User className="w-5 h-5" />,
    questions: [
      {
        question: 'How do I join as a speaker on VoxVertex?',
        answer: 'Create a speaker profile, showcase your expertise, upload your bio and credentials, and start receiving speaking opportunities from event organizers worldwide.'
      },
      {
        question: 'How do I get discovered by event organizers?',
        answer: 'Optimize your profile with keywords, showcase your speaking experience, upload videos of past presentations, and maintain an active presence on the platform.'
      },
      {
        question: 'What types of speaking opportunities are available?',
        answer: 'You can find opportunities for keynote speeches, panel discussions, workshops, webinars, training sessions, and specialized industry presentations across various sectors.'
      },
      {
        question: 'How does the booking and payment process work?',
        answer: 'Once selected by an organizer, you\'ll receive a booking request with event details and compensation. You can accept, negotiate, or decline. Payments are processed securely through our platform.'
      }
    ]
  },
  {
    id: 'attendees',
    title: 'For Attendees',
    icon: <Users className="w-5 h-5" />,
    questions: [
      {
        question: 'How do I find and register for events?',
        answer: 'Browse our event marketplace by category, location, date, or topic. Use filters to find events that match your interests and register with just a few clicks.'
      },
      {
        question: 'Can I network with other attendees?',
        answer: 'Yes! Our platform includes networking features like attendee directories, chat rooms, virtual meetups, and AI-powered matchmaking to connect you with like-minded professionals.'
      },
      {
        question: 'What if I can\'t attend a live event?',
        answer: 'Many events offer recorded sessions and on-demand content. You can access these materials after the event and still benefit from the learning experience.'
      },
      {
        question: 'How do I provide feedback on events?',
        answer: 'After each event, you\'ll receive a feedback form to rate speakers, content quality, and overall experience. Your feedback helps improve future events.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Support',
    icon: <Wrench className="w-5 h-5" />,
    questions: [
      {
        question: 'What are the system requirements for using VoxVertex?',
        answer: 'VoxVertex works on all modern browsers and devices. For the best experience, we recommend Chrome, Firefox, Safari, or Edge with a stable internet connection.'
      },
      {
        question: 'Is my data secure on VoxVertex?',
        answer: 'Yes, we use enterprise-grade security including SSL encryption, secure data centers, regular security audits, and compliance with GDPR and other privacy regulations.'
      },
      {
        question: 'Can I integrate VoxVertex with other tools?',
        answer: 'Absolutely! We offer APIs and integrations with popular tools like Zoom, Slack, Salesforce, Mailchimp, and many others to streamline your workflow.'
      },
      {
        question: 'What if I experience technical issues during an event?',
        answer: 'Our 24/7 technical support team is available during live events. We also provide backup streaming options and technical assistance to ensure smooth event execution.'
      }
    ]
  },
  {
    id: 'pricing',
    title: 'Pricing & Billing',
    icon: <CreditCard className="w-5 h-5" />,
    questions: [
      {
        question: 'What are the pricing plans for VoxVertex?',
        answer: 'We offer flexible pricing plans including a free tier for small events, professional plans for growing organizations, and enterprise solutions for large-scale events.'
      },
      {
        question: 'How does billing work for event organizers?',
        answer: 'We charge a small transaction fee on paid tickets and offer transparent pricing with no hidden costs. You can choose between monthly subscriptions or pay-per-event options.'
      },
      {
        question: 'Are there any setup fees or hidden costs?',
        answer: 'No setup fees or hidden costs. Our pricing is transparent with clear breakdowns of all charges. You only pay for what you use.'
      },
      {
        question: 'Can I get a refund if I\'m not satisfied?',
        answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied with our service, we\'ll provide a full refund.'
      }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleExpanded = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = faqData.filter(category => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.questions.some(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentCategory = faqData.find(cat => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/home" className="flex items-center text-[#FF6B35] hover:text-[#E55A2B] transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VoxVertex</span>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#FF6B35] via-[#FFB194] to-[#FFCBB8] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
              <span className="text-[#FF6B35] text-2xl font-bold">V</span>
            </div>
            <h1 className="text-4xl font-bold text-white">VoxVertex</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-white text-base md:text-lg max-w-2xl mx-auto">
            Find answers to common questions about our complete event management platform
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-[#FF6B35] mr-2" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Quick Search</h3>
            </div>
            <p className="text-gray-600 text-sm md:text-base mb-6">
              Looking for something specific? Browse our categories below or contact support for personalized help.
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-md mx-auto mb-6 md:mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none text-sm"
              />
            </div>
          </div>

          {/* Category Buttons - Mobile Responsive */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {faqData.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-orange-50 text-[#FF6B35] hover:bg-orange-100'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Category Header */}
          <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center mr-3 md:mr-4">
                {currentCategory?.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                {currentCategory?.title}
              </h3>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="divide-y divide-gray-200">
            {currentCategory?.questions.map((item, index) => {
              const key = `${activeCategory}-${index}`;
              const isExpanded = expandedItems[key];
              
              return (
                <div key={index} className="p-4 md:p-6">
                  <button
                    onClick={() => toggleExpanded(activeCategory, index)}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 -m-4 md:-m-6 p-4 md:p-6 rounded-lg transition-colors"
                  >
                    <h4 className="text-base md:text-lg font-medium text-gray-900 pr-4">
                      {item.question}
                    </h4>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-4 pl-0">
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-8 md:mt-12 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
          <p className="text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
            Can't find what you're looking for? Our support team is here to help you make the most of VoxVertex's event management platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Email Support */}
            <div className="text-center p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-[#FF6B35]" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Email Support</h4>
              <p className="text-gray-600 mb-3 md:mb-4 text-sm">Get detailed help via email</p>
              <a
                href="mailto:support@voxvertex.com"
                className="inline-block bg-orange-50 text-[#FF6B35] px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors text-sm"
              >
                support@voxvertex.com
              </a>
            </div>

            {/* Live Chat */}
            <div className="text-center p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-[#FF6B35]" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Live Chat</h4>
              <p className="text-gray-600 mb-3 md:mb-4 text-sm">Instant help from our team</p>
              <button className="bg-[#FF6B35] text-white px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-[#E55A2B] transition-colors text-sm">
                Start Chat
              </button>
            </div>

            {/* Phone Support */}
            <div className="text-center p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Phone className="w-6 h-6 md:w-8 md:h-8 text-[#FF6B35]" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Phone Support</h4>
              <p className="text-gray-600 mb-3 md:mb-4 text-sm">Speak directly with our team</p>
              <a
                href="tel:+15551234567"
                className="inline-block bg-orange-50 text-[#FF6B35] px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors text-sm"
              >
                +1 (555) 123-4567
              </a>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-orange-50 rounded-lg p-4 md:p-6">
            <div className="text-center">
              <p className="text-gray-900 font-medium mb-2 text-sm md:text-base">
                Support Hours: Monday - Friday, 9:00 AM - 6:00 PM PST
              </p>
              <p className="text-gray-600 text-sm md:text-base">
                Emergency Support: 24/7 support available during live events
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-[#FF6B35] text-lg md:text-xl font-bold">V</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-base md:text-lg">VoxVertex</h4>
                <p className="text-orange-100 text-xs md:text-sm">
                  Complete event management platform connecting organizers, speakers, and audience worldwide.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6 text-white text-sm">
              <a href="#" className="hover:text-orange-200 transition-colors">Help Center</a>
              <a href="#" className="hover:text-orange-200 transition-colors">Documentation</a>
              <a href="#" className="hover:text-orange-200 transition-colors">API Reference</a>
              <a href="#" className="hover:text-orange-200 transition-colors">Status Page</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
