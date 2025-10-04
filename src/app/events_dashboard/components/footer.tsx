import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FF6B35] text-white pl-3">

      <div className="px-8 py-12 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-16">



          <div className="max-w-sm">

            <div className="w-32 h-20 mb-4">
              <img src="/Voxvertex.png"
                alt="Voxvertex"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-sm leading-relaxed mb-6">
              Empowering connections between guest lecturers and event organizers to create transformative events.
            </p>

            {/* Newsletter Subscription */}
            <div className="newsletter mt-17">
  <h3 className="text-base font-medium mb-3 ml-2">Subscribe To Our Newsletter</h3>
  <div className="flex w-full">
    <input
      type="email"
      placeholder="Enter your email"
      className="flex-1 px-4 py-2 text-black text-sm bg-white rounded-l-full border-0 outline-none placeholder-gray-500"
    />
    <button className="px-4 bg-[#FF6B35] text-white border border-white text-sm font-medium rounded-r-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all">
      Submit
    </button>
  </div>
</div>

          </div>


          <div className="col-span-1">
            <h3 className="text-base font-semibold mb-4">NAVIGATION</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">Home</a></li>
              <li><a href="#" className="text-sm hover:underline">Events</a></li>
              <li><a href="#" className="text-sm hover:underline">Blogs</a></li>
              <li><a href="#" className="text-sm hover:underline">Podcast</a></li>
              <li><a href="#" className="text-sm hover:underline">Courses</a></li>
              <li><a href="#" className="text-sm hover:underline">About</a></li>
              <li><a href="#" className="text-sm hover:underline">Contact</a></li>
            </ul>
          </div>


          <div className="col-span-1">
            <h3 className="text-base font-semibold mb-4">SUPPORT</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">FAQs</a></li>
              <li><a href="#" className="text-sm hover:underline">Help Center</a></li>
              <li><a href="#" className="text-sm hover:underline">Terms & Conditions</a></li>
              <li><a href="#" className="text-sm hover:underline">Privacy Policy</a></li>
            </ul>
          </div>


          <div className="col-span-1">
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


          <div className="col-span-1">
            <h3 className="text-base font-semibold mb-4 ml-2">FOLLOW US</h3>
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
  );
};

export default Footer;