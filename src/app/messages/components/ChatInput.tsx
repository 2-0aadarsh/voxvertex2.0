import { useState } from 'react';
import { DollarSign, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
        </div>
        
        <button
          type="button"
          className="p-3 bg-orange-50 text-[#FF6B35] rounded-lg hover:bg-orange-100 transition-colors"
        >
          <DollarSign className="w-5 h-5" />
        </button>
        
        <button
          type="submit"
          className="p-3 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
