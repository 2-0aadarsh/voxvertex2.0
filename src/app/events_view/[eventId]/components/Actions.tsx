import React, { useState } from 'react';
import { Clock, X, AlertTriangle, Calendar } from 'lucide-react';

const Actions: React.FC = () => {
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [checkboxes, setCheckboxes] = useState({
    newDates: false,
    offerRefund: false,
    sendNotification: false
  });
  const [newEventData, setNewEventData] = useState({
    startDate: '',
    endDate: '',
    location: '',
    eventUrl: ''
  });

  const handlePostponeClick = () => {
    setShowPostponeModal(true);
  };

  const handleModalClose = () => {
    setShowPostponeModal(false);
    setSelectedReason('');
    setCheckboxes({
      newDates: false,
      offerRefund: false,
      sendNotification: false
    });
    setNewEventData({
      startDate: '',
      endDate: '',
      location: '',
      eventUrl: ''
    });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReason(e.target.value);
  };

  const handleCheckboxChange = (checkbox: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [checkbox]: !prev[checkbox]
    }));
  };

  const handleNewEventDataChange = (field: keyof typeof newEventData, value: string) => {
    setNewEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostponeEvent = () => {
    // Handle postpone logic here
    console.log('Postponing event with reason:', selectedReason);
    console.log('Checkboxes:', checkboxes);
    console.log('New event data:', newEventData);
    setShowPostponeModal(false);
  };

  const getAffectedParticipants = () => {
    return checkboxes.newDates || checkboxes.offerRefund || checkboxes.sendNotification ? 
           Math.floor(Math.random() * 50) + 10 : 0; // Random number for demo
  };

  return (
    <>
      <div className="p-4">
        {/* Main orange border card - full width */}
        <div className="bg-white rounded-2xl border border-[#FF6B35] p-6 w-full">
          {/* Middle card with light border - not full width, aligned left */}
          <div className="bg-white rounded-xl border border-[#FF6B35]/30 p-6 max-w-xl">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-[#FF6B35]">Event Management</h3>
            </div>
            
            {/* Inner card with full orange border */}
            <div className="bg-white border border-[#FF6B35] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-gray-900 mb-1">Postpone Event</div>
                <div className="text-sm text-gray-600">Reschedule the event to a new date</div>
              </div>
              <button 
                onClick={handlePostponeClick}
                className="px-4 py-1 text-sm font-medium text-[#FF6B35] bg-[#FF6B35]/10 border border-[#FF6B35] rounded-md hover:bg-[#FF6B35] hover:text-white transition-colors flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                Postponed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Postpone Modal */}
      {showPostponeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B35]" />
                  <h2 className="text-lg font-semibold text-[#FF6B35]">Postpone Event</h2>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Postpone this event to a new date. Participants will be notified automatically.
              </p>

              <div className="space-y-4">
                {/* Reason Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Postponed *
                  </label>
                  <select
                    value={selectedReason}
                    onChange={handleReasonChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-[#FF6B35]/5"
                  >
                    <option value="">Select reason</option>
                    <option value="venue">Venue unavailable</option>
                    <option value="speaker">Speaker scheduling conflict</option>
                    <option value="low-registration">Low registration numbers</option>
                    <option value="technical">Technical issues</option>
                    <option value="weather">External factors (Weather, etc.)</option>
                    <option value="force-majeure">Force majeure</option>
                    <option value="organizational">Organizational changes</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkboxes.newDates}
                        onChange={() => handleCheckboxChange('newDates')}
                        className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] accent-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">I have new dates for this event</span>
                    </label>
                    
                    {/* New dates fields */}
                    {checkboxes.newDates && (
                      <div className="mt-4 bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="relative">
                            <input
                              type="datetime-local"
                              value={newEventData.startDate}
                              onChange={(e) => handleNewEventDataChange('startDate', e.target.value)}
                              placeholder="dd-mm-yyyy"
                              className="w-full px-3 py-3 pr-10 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              New Start Date & Time
                            </label>
                            <Calendar className="absolute right-3 top-3 w-4 h-4 text-[#FF6B35] pointer-events-none" />
                          </div>
                          <div className="relative">
                            <input
                              type="datetime-local"
                              value={newEventData.endDate}
                              onChange={(e) => handleNewEventDataChange('endDate', e.target.value)}
                              placeholder="dd-mm-yyyy"
                              className="w-full px-3 py-3 pr-10 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              New End Date & Time
                            </label>
                            <Calendar className="absolute right-3 top-3 w-4 h-4 text-[#FF6B35] pointer-events-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter"
                              value={newEventData.location}
                              onChange={(e) => handleNewEventDataChange('location', e.target.value)}
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              New Location
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter"
                              value={newEventData.eventUrl}
                              onChange={(e) => handleNewEventDataChange('eventUrl', e.target.value)}
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              New Event URL
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkboxes.offerRefund}
                        onChange={() => handleCheckboxChange('offerRefund')}
                        className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] accent-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">Offer refund to participants</span>
                    </label>
                    
                    {/* Refund policy field */}
                    {checkboxes.offerRefund && (
                      <div className="mt-4 bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Refund policy
                        </label>
                        <select className="w-full px-3 py-2 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white">
                          <option>Full Refund (100%)</option>
                          <option>Partial Refund (75%)</option>
                          <option>Partial Refund (50%)</option>
                          <option>No Refund</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkboxes.sendNotification}
                        onChange={() => handleCheckboxChange('sendNotification')}
                        className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] accent-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">Send notification to all participants</span>
                    </label>
                    
                    {/* Custom message field */}
                    {checkboxes.sendNotification && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-[#FF6B35] mb-2">
                          Custom Message (optional)
                        </label>
                        <textarea
                          placeholder="Add personal Message"
                          rows={4}
                          className="w-full px-3 py-2 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-[#FF6B35]/10 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-lg p-4 mt-6">
                  <h4 className="text-sm font-medium text-[#FF6B35] mb-2">Postponement Summary</h4>
                  <ul className="space-y-1 text-sm text-[#FF6B35]">
                    <li>• Event will be marked as "Postponed"</li>
                    <li>• {getAffectedParticipants()} participants will be affected</li>
                  </ul>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-[#FF6B35] text-[#FF6B35] rounded-md hover:bg-[#FF6B35]/5 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostponeEvent}
                  className="px-4 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#FF6B35]/90 transition-colors font-medium text-sm"
                >
                  Postpone Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Actions;