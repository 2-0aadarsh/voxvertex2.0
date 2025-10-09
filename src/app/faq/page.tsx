"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Clock,
  Calendar,
  Users,
  Mic,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  Settings,
  CreditCard,
  DollarSign,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/store/hooks";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const faqCategories: FAQCategory[] = [
    {
      id: "general",
      title: "General Platform",
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          id: "general-1",
          question: "What is Voxvertex?",
          answer:
            "Voxvertex is a comprehensive event management platform that connects event organizers, speakers, and audiences. We provide complete tools for event planning, speaker management, attendee engagement, and post-event analytics.",
        },
        {
          id: "general-2",
          question: "Who can use Voxvertex?",
          answer:
            "Voxvertex is designed for event organizers planning conferences, workshops, seminars, and corporate events, as well as speakers looking for speaking opportunities and attendees seeking engaging events to participate in.",
        },
        {
          id: "general-3",
          question: "What types of events can I manage on Voxvertex?",
          answer:
            "You can manage virtually any type of event including conferences, workshops, webinars, seminars, corporate meetings, trade shows, networking events, and educational sessions.",
        },
        {
          id: "general-4",
          question:
            "Is Voxvertex suitable for both in-person and virtual events?",
          answer:
            "Yes! Voxvertex supports hybrid, in-person, and fully virtual events with integrated streaming capabilities, virtual networking tools, and digital engagement features.",
        },
      ],
    },
    {
      id: "organizers",
      title: "For Event Organizers",
      icon: <Calendar className="w-5 h-5" />,
      items: [
        {
          id: "organizers-1",
          question: "How do I create an event on Voxvertex?",
          answer:
            'Simply sign up as an organizer, click "Create Event" in your dashboard, fill in the event details, set up your agenda, invite speakers, and configure registration settings. Our step-by-step wizard guides you through the entire process.',
        },
        {
          id: "organizers-2",
          question: "Can I customize my event page and branding?",
          answer:
            "Absolutely! You can customize your event page with your brand colors, logos, images, and content. Upload custom banners, set brand guidelines, and create a cohesive experience that matches your organization's identity.",
        },
        {
          id: "organizers-3",
          question: "How does speaker management work?",
          answer:
            "Our platform allows you to search and invite speakers from our marketplace, manage speaker profiles, coordinate schedules, handle contracts, and facilitate communication between speakers and your team.",
        },
        {
          id: "organizers-4",
          question: "What payment and ticketing options are available?",
          answer:
            "Voxvertex supports multiple payment gateways, tiered pricing, early bird discounts, promo codes, group rates, and both free and paid events. Automatic invoicing and receipt generation are included.",
        },
        {
          id: "organizers-5",
          question: "Can I track event analytics and attendee engagement?",
          answer:
            "Yes! Our comprehensive analytics dashboard provides insights on registration rates, attendee engagement, session popularity, networking activity, feedback scores, and ROI metrics.",
        },
      ],
    },
    {
      id: "speakers",
      title: "For Speakers",
      icon: <Mic className="w-5 h-5" />,
      items: [
        {
          id: "speakers-1",
          question: "How do I join Voxvertex as a speaker?",
          answer:
            "Create a speaker profile highlighting your expertise, speaking topics, and experience. Upload your bio, photos, speaking samples, and set your availability. Event organizers can then discover and invite you to their events.",
        },
        {
          id: "speakers-2",
          question: "How do I get speaking opportunities?",
          answer:
            "Complete your profile with relevant keywords, showcase your expertise, and actively respond to speaking invitations. Our algorithm matches you with relevant events based on your topics and expertise.",
        },
        {
          id: "speakers-3",
          question: "Can I set my speaking fees and requirements?",
          answer:
            "Yes! You can set your speaking fees, travel requirements, technical needs, and availability directly in your profile. This helps organizers understand your requirements upfront.",
        },
        {
          id: "speakers-4",
          question: "How do I manage my speaking schedule?",
          answer:
            "Your speaker dashboard shows all confirmed speaking engagements, upcoming events, travel details, and communication with organizers. You can also sync with your external calendar.",
        },
      ],
    },
    {
      id: "attendees",
      title: "For Attendees",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          id: "attendees-1",
          question: "How do I register for an event?",
          answer:
            'Browse events in our marketplace, click on an event that interests you, review the agenda and speakers, then click "Register" and complete the payment process. You\'ll receive a confirmation email with your digital ticket.',
        },
        {
          id: "attendees-2",
          question: "What features are available in my attendee dashboard?",
          answer:
            "Your dashboard includes the event agenda, speaker profiles, networking tools, session notes, downloadable resources, live Q&A participation, and the ability to connect with other attendees.",
        },
        {
          id: "attendees-3",
          question: "Can I network with other attendees and speakers?",
          answer:
            "Yes! Our platform includes built-in networking features like attendee directories, direct messaging, meeting scheduling, virtual networking lounges, and post-event connection tools.",
        },
        {
          id: "attendees-4",
          question: "How do I access virtual or hybrid events?",
          answer:
            "For virtual events, you'll receive access links in your dashboard and via email. Our platform supports live streaming, interactive Q&A, breakout rooms, and virtual networking spaces.",
        },
        {
          id: "attendees-5",
          question: "Can I get certificates of attendance?",
          answer:
            "Many events offer digital certificates of attendance or completion. Check your event dashboard after the event concludes to download available certificates.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          id: "technical-1",
          question: "What are the system requirements for Voxvertex?",
          answer:
            "Voxvertex works on any modern web browser (Chrome, Firefox, Safari, Edge). For virtual events, we recommend a stable internet connection, webcam, and microphone. Our mobile app is available for iOS and Android.",
        },
        {
          id: "technical-2",
          question: "Is my data secure on Voxvertex?",
          answer:
            "Yes! We use enterprise-grade security with SSL encryption, secure payment processing, GDPR compliance, and regular security audits. Your data is stored securely and never shared without permission.",
        },
        {
          id: "technical-3",
          question: "Do you offer API integration?",
          answer:
            "Yes! We provide REST APIs for integration with CRM systems, marketing platforms, and other business tools. Contact our technical team for API documentation and setup assistance.",
        },
        {
          id: "technical-4",
          question: "What support do you offer during live events?",
          answer:
            "We provide 24/7 technical support during live events, including dedicated support channels, real-time troubleshooting, and backup systems to ensure smooth event execution.",
        },
      ],
    },
    {
      id: "pricing",
      title: "Pricing & Billing",
      icon: <MessageSquare className="w-5 h-5" />,
      items: [
        {
          id: "pricing-1",
          question: "How does Voxvertex pricing work?",
          answer:
            "We offer flexible pricing plans based on event size and features needed. This includes free events, percentage-based fees for paid events, and enterprise solutions for large organizations. Contact sales for custom pricing.",
        },
        {
          id: "pricing-2",
          question: "Are there any setup fees or hidden costs?",
          answer:
            "No hidden fees! Our pricing is transparent with clear fee structures. Payment processing fees are clearly stated, and there are no setup costs for standard plans.",
        },
        {
          id: "pricing-3",
          question: "Can I get a refund if I need to cancel my event?",
          answer:
            "Refund policies vary by plan and timing. Generally, we offer full refunds for cancellations made well in advance. Please review our terms of service or contact support for specific situations.",
        },
        {
          id: "pricing-4",
          question: "Do you offer discounts for non-profit organizations?",
          answer:
            "Yes! We provide special pricing for qualified non-profit organizations, educational institutions, and community events. Contact our sales team to learn about available discounts.",
        },
      ],
    },
  ];

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set<string>();
    if (!expandedItems.has(itemId)) {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredCategories =
    activeCategory === "all"
      ? faqCategories
      : faqCategories.filter((cat) => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar isAuthenticated={isAuthenticated} user={user} />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-orange-400 to-orange-500 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-orange-500 font-bold text-xl">V</span>
            </div>
            <h1 className="text-white text-3xl font-bold">Voxvertex</h1>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-white text-lg max-w-3xl mx-auto">
            Find answers to common questions about our complete event management
            platform
          </p>
        </div>
      </div>

      {/* Quick Search Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="bg-[#FFF8F5] border border-orange-200 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-2xl font-semibold text-gray-800">
                  Quick Search
                </h3>
              </div>

              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Looking for something specific? Browse our categories below or
                contact support for personalized help.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "General Platform",
                "For Event Organizers",
                "For Speakers",
                "For Attendees",
                "Technical Support",
                "Pricing & Billing",
              ].map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(
                      category.toLowerCase().replace(/\s+/g, "-")
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    activeCategory ===
                    category.toLowerCase().replace(/\s+/g, "-")
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-[#FFEDE5] text-orange-600 border-orange-200 hover:bg-orange-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="mb-8">
              {/* Category Box */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {/* Category Header */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center mr-4">
                    <div className="text-[#FF6B35]">{category.icon}</div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {category.title}
                  </h3>
                </div>

                {/* FAQ Items */}
                <div className="space-y-0">
                  {category.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4 text-lg">
                          {item.question}
                        </span>
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {expandedItems.has(item.id) && (
                        <div className="px-6 pb-4 bg-gray-50">
                          <p className="text-gray-700 leading-relaxed text-lg">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to
              help you make the most of Voxvertex's event management platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Email Support
              </h4>
              <p className="text-gray-600 mb-4">Get detailed help via email</p>
              <a
                href="mailto:support@voxvertex.com"
                className="inline-block px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
              >
                support@voxvertex.com
              </a>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
              <p className="text-gray-600 mb-4">Instant help from our team</p>
              <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Phone Support
              </h4>
              <p className="text-gray-600 mb-4">Speak directly with our team</p>
              <a
                href="tel:+15551234567"
                className="inline-block px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
              >
                +1 (555) 123-4567
              </a>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Support Hours: Monday - Friday, 9:00 AM - 6:00 PM PST</p>
            <p>Emergency Support: 24/7 support available during live events</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="bg-[#FFF8F5] border border-orange-200 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">
                    Voxvertex
                  </h4>
                  <p className="text-gray-600 text-sm max-w-md">
                    Complete event management platform connecting organizers,
                    speakers, and audience worldwide.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  API Reference
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  Status Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
