/**
 * SuccessModal Usage Examples
 * 
 * This file demonstrates how to use the SuccessModal component
 * throughout your application for different success scenarios.
 */

import React, { useState } from 'react';
import { CheckCircle, ExternalLink, Download, Share, ArrowRight } from 'lucide-react';
import SuccessModal from '../SuccessModal';

const SuccessModalExamples: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'basic' | 'detailed' | 'actions' | 'autoClose'>('basic');

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">SuccessModal Examples</h1>
      
      {/* Example Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => openModal('basic')}
          className="p-4 border rounded-lg hover:bg-gray-50"
        >
          <h3 className="font-semibold">Basic Success</h3>
          <p className="text-sm text-gray-600">Simple confirmation message</p>
        </button>

        <button 
          onClick={() => openModal('detailed')}
          className="p-4 border rounded-lg hover:bg-gray-50"
        >
          <h3 className="font-semibold">Detailed Success</h3>
          <p className="text-sm text-gray-600">With details and information</p>
        </button>

        <button 
          onClick={() => openModal('actions')}
          className="p-4 border rounded-lg hover:bg-gray-50"
        >
          <h3 className="font-semibold">With Actions</h3>
          <p className="text-sm text-gray-600">Primary and secondary buttons</p>
        </button>

        <button 
          onClick={() => openModal('autoClose')}
          className="p-4 border rounded-lg hover:bg-gray-50"
        >
          <h3 className="font-semibold">Auto Close</h3>
          <p className="text-sm text-gray-600">Closes automatically after 5 seconds</p>
        </button>
      </div>

      {/* Modals */}
      {modalType === 'basic' && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Profile Updated!"
          message="Your profile information has been successfully updated."
          primaryAction={{
            label: "Continue",
            onClick: () => setShowModal(false)
          }}
        />
      )}

      {modalType === 'detailed' && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Event Created Successfully! 🎉"
          message="Your event has been published and is now live for registrations."
          details={[
            { label: "Event Name", value: "Tech Conference 2024" },
            { label: "Start Date", value: "December 15, 2024" },
            { label: "Participants", value: "0 registered" },
            { label: "Status", value: "Published" }
          ]}
          primaryAction={{
            label: "View Event",
            onClick: () => setShowModal(false),
            icon: <ExternalLink className="w-4 h-4" />
          }}
        />
      )}

      {modalType === 'actions' && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Payment Successful! 💳"
          message="Your payment has been processed and you're now registered for the event."
          details={[
            { label: "Amount", value: "$299.00" },
            { label: "Payment Method", value: "Credit Card ending in 4242" },
            { label: "Transaction ID", value: "txn_123456789" }
          ]}
          primaryAction={{
            label: "Download Receipt",
            onClick: () => {
              console.log('Download receipt');
              setShowModal(false);
            },
            icon: <Download className="w-4 h-4" />
          }}
          secondaryAction={{
            label: "Share Event",
            onClick: () => {
              console.log('Share event');
              setShowModal(false);
            },
            variant: 'link'
          }}
        />
      )}

      {modalType === 'autoClose' && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Settings Saved! ⚙️"
          message="Your preferences have been saved successfully."
          autoCloseDelay={5000}
          showCloseButton={false}
          primaryAction={{
            label: "Done",
            onClick: () => setShowModal(false)
          }}
        />
      )}
    </div>
  );
};

export default SuccessModalExamples;
