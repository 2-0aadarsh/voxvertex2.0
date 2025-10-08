import { Conversation } from '../types';
interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation?: string;
  onSelectConversation: (conversationId: string) => void;
}
export function ConversationList({ 
  conversations, 
  selectedConversation,
  onSelectConversation 
}: ConversationListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'negotiating':
        return 'bg-[#FF6B35] text-white';
      case 'confirmed':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'negotiating':
        return 'Negotiating';
      case 'confirmed':
        return 'Confirmed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="w-80 h-full p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
        
        <div className="overflow-y-auto flex-1" style={{ height: 'calc(100% - 88px)' }}>
          {/* First conversation - selected/active */}
          <div
            onClick={() => onSelectConversation('1')}
            className="p-4 cursor-pointer bg-[#FF6B35] text-white rounded-lg m-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full flex-shrink-0 mr-3 overflow-hidden">
                  <img 
                    src="/api/placeholder/48/48" 
                    alt="Jane Doe"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium text-white">Jane Doe</h3>
                  <p className="text-xs text-white">Innovate 2025</p>
                  <p className="text-xs mt-1 text-white">The fee of ₹7000 has been confirmed.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-white">2m ago</span>
              </div>
            </div>
          </div>

          {/* Second conversation - unselected */}
          <div
            onClick={() => onSelectConversation('2')}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors m-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full flex-shrink-0 mr-3 overflow-hidden">
                  <img 
                    src="/api/placeholder/48/48" 
                    alt="Jane Doe"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium text-gray-900">Jane Doe</h3>
                  <p className="text-xs text-gray-600">Innovate 2025</p>
                  <p className="text-xs mt-1 text-gray-500">The fee of ₹7000 has been confirmed.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">2m ago</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
  );
}