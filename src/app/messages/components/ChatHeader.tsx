'use client';
import { MessageSquare } from 'lucide-react';
export function ChatHeader() {
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center">
        <MessageSquare className="w-5 h-5 text-[#FF6B35] mr-2" />
        <div>
          <span className="font-medium text-gray-900">Conversation & Booking Hub</span>
          <p className="text-xs text-gray-600 mt-1">Negotiating with Dr. Jane Doe for Annual Tech Summit 2025</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs px-2 py-1 rounded-full bg-[#FF6B35] text-white">
            Negotiating
          </span>
        </div>
      </div>
    </div>
  );
}
