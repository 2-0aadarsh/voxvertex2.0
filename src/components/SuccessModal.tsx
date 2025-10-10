import React from 'react';
import { CheckCircle, X, ExternalLink, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'link';
  };
  details?: {
    label: string;
    value: string;
  }[];
  showCloseButton?: boolean;
  autoCloseDelay?: number; // Auto close after X milliseconds (optional)
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  primaryAction,
  secondaryAction,
  details = [],
  showCloseButton = true,
  autoCloseDelay
}) => {
  // Auto close functionality
  React.useEffect(() => {
    if (isOpen && autoCloseDelay) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header with Success Icon */}
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-t-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
          
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Details Section */}
        {details.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Details</h3>
            <div className="space-y-2">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{detail.label}:</span>
                  <span className="font-medium text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-6 bg-white rounded-b-2xl">
          <div className="flex flex-col gap-3">
            {/* Primary Action */}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="w-full px-4 py-3 bg-[#FF6B35] text-white rounded-xl hover:bg-[#FF6B35]/90 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                {primaryAction.icon && primaryAction.icon}
                {primaryAction.label}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Secondary Action */}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className={`w-full px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                  secondaryAction.variant === 'link'
                    ? 'text-[#FF6B35] hover:text-[#FF6B35]/80 hover:bg-[#FF6B35]/5'
                    : 'border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/5'
                }`}
              >
                {secondaryAction.label}
              </button>
            )}

            {/* Default Close Button (if no actions provided) */}
            {!primaryAction && !secondaryAction && (
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-[#FF6B35] text-white rounded-xl hover:bg-[#FF6B35]/90 transition-colors font-medium text-sm"
              >
                Continue
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar for Auto Close */}
        {autoCloseDelay && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
            <div 
              className="h-full bg-[#FF6B35] transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${autoCloseDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      {/* Auto Close Animation */}
      {autoCloseDelay && (
        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      )}
    </div>
  );
};

export default SuccessModal;
