"use client";
import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <div>
      {/* Footer Section */}
      <footer className="bg-[#FF6B35] text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-12">
            {/* Logo and Description Column */}
            <div className="col-span-1 max-w-sm">
              {/* Logo */}
              <div className="w-40 h-16 mb-6">
                <a
                  href="/home"
                  className="block hover:opacity-80 transition-opacity duration-300"
                >
                  <img
                    src="/Voxvertex.png"
                    alt="Voxvertex"
                    className="w-full h-full object-contain"
                  />
                </a>
              </div>

              <p className="text-white text-sm leading-relaxed mb-8">
                Empowering connections between guest lecturers and event
                organizers to create transformative events.
              </p>

              {/* Newsletter Subscription */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Subscribe Our Newsletter
                </h3>
                <div className="relative max-w-md ">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-6 py-3 pr-32 text-gray-900 text-base bg-white rounded-full  border border-gray-300 outline-none placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                  />
                  <button className="absolute right-2 top-2 bottom-2 px-6 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-full  shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                    Submit <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-6 text-white border-b border-white pb-2">
                NAVIGATION
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/home", label: "Home" },
                  { href: "/events_dashboard", label: "Events" },
                  { href: "#", label: "Blogs" },
                  { href: "/about", label: "About" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "#", label: "Contact" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-white hover:text-gray-200 text-sm transition-colors duration-300 hover:translate-x-1 transform block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-6 text-white border-b border-white pb-2">
                SUPPORT
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/faq", label: "FAQs" },
                  { href: "#", label: "Help Center" },
                  { href: "/terms", label: "Terms & Conditions" },
                  { href: "/privacy_policy", label: "Privacy Policy" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-white hover:text-gray-200 text-sm transition-colors duration-300 hover:translate-x-1 transform block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get in Touch Column */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-6 text-white border-b border-white pb-2">
                GET IN TOUCH
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <Mail className="w-5 h-5 text-white flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-white text-sm group-hover:text-white transition-colors duration-300">
                    info@voxvertex.com
                  </span>
                </div>
                <div className="flex items-start gap-3 group">
                  <MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-white text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                    C-182, IInd Floor,
                    <br />
                    Swarn Jayanti Puram,
                    <br />
                    Ghaziabad (201013)
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Us Column */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-6 text-white border-b border-white pb-2">
                FOLLOW US
              </h3>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, href: "https://www.instagram.com/vox_vertex/" },
                  { icon: Linkedin, href: "https://www.linkedin.com/company/voxvertex/" },
                  { icon: Twitter, href: "https://x.com/voxvertex" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="group w-12 h-12 bg-white/20 hover:bg-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  >
                    <social.icon className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Top Row - 2 boxes side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Left Box - Logo and Description */}
              <div className="space-y-6">
                {/* Logo */}
                <div className="w-32 h-12">
                  <a
                    href="/home"
                    className="block hover:opacity-80 transition-opacity duration-300"
                  >
                    <img
                      src="/Voxvertex.png"
                      alt="Voxvertex"
                      className="w-full h-full object-contain"
                    />
                  </a>
                </div>

                <p className="text-white text-sm leading-relaxed">
                  Empowering connections between guest lecturers and event
                  organizers to create transformative events.
                </p>

                {/* Newsletter Subscription */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white">
                    Subscribe Our Newsletter
                  </h3>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 pr-28 text-gray-900 text-sm bg-white rounded-lg border border-gray-300 outline-none placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                    />
                    <button className="absolute right-1 top-1 bottom-1 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-md shadow-lg hover:shadow-xl transition-all duration-300">
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Box - Navigation, Support, Get in Touch */}
              <div className="grid grid-cols-3 gap-4">
                {/* Navigation Column */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white border-b border-white pb-2">
                    NAVIGATION
                  </h3>
                  <ul className="space-y-2">
                    {[
                      { href: "/home", label: "Home" },
                      { href: "/events_dashboard", label: "Events" },
                      { href: "#", label: "Blogs" },
                      { href: "/about", label: "About" },
                      { href: "/pricing", label: "Pricing" },
                      { href: "#", label: "Contact" },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-white hover:text-gray-200 text-xs transition-colors duration-300 block truncate"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support Column */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white border-b border-white pb-2">
                    SUPPORT
                  </h3>
                  <ul className="space-y-2">
                    {[
                      { href: "/faq", label: "FAQs" },
                      { href: "#", label: "Help Center" },
                      { href: "/terms", label: "Terms & Conditions" },
                      { href: "/privacy_policy", label: "Privacy Policy" },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-white hover:text-gray-200 text-xs transition-colors duration-300 block truncate"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Get in Touch Column */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white border-b border-white pb-2">
                    GET IN TOUCH
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Mail className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-white text-xs break-words">
                        info@voxvertex.com
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-white text-xs leading-tight">
                        C-182, IInd Floor, Swarn Jayanti Puram, Ghaziabad
                        (201013)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow Us Section */}
            <div className="pt-6">
              <h3 className="text-sm font-semibold mb-4 text-white">
                FOLLOW US
              </h3>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, href: "https://www.instagram.com/vox_vertex/" },
                  { icon: Linkedin, href: "https://www.linkedin.com/company/voxvertex/" },
                  { icon: Twitter, href: "https://x.com/voxvertex" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="group w-10 h-10 bg-white/20 hover:bg-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <social.icon className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-white py-6 bg-[#FF6B35]">
          <div className="container mx-auto px-4">
            <p className="text-center text-white text-sm">
              Copyright © 2024 Voxvertex Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
