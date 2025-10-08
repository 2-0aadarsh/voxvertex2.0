import React, { useEffect, useState } from 'react';
import { Shield, Users, UserX, Calendar, CalendarX, FileText } from 'lucide-react';

interface Policy {
  // Participant Refund Policy
  participantRefund: {
    allowRefunds: boolean;
    refundDeadline: number | ''; // days before event
    refundPercentage: number | '';
    processingFee: number | '';
    processingTime: string;
    allowEmergencyRefunds: boolean;
    emergencyConditions: string;
    refundConditions: string[];
  };
  
  // Speaker Cancellation Policy
  speakerCancellation: {
    allowCancellation: boolean;
    cancellationDeadline: number | ''; // days before event
    penaltyPercentage: number | '';
    requireReplacement: boolean;
    forceMajeureClause: boolean;
    paymentTerms: string;
    speakerConditions: string[];
  };
  
  // Event Cancellation Policy
  eventCancellation: {
    allowCancellation: boolean;
    fullRefundDeadline: number | ''; // days before event
    partialRefundDeadline: number | ''; // days before event
    partialRefundPercentage: number | '';
    administrativeFee: number | '';
    refundMethod: string;
    processingTime: string;
  };
  
  // Event Postponement Policy
  eventPostponement: {
    allowPostponement: boolean;
    noticeRequired: number | ''; // days
    maxPostponementDuration: number | ''; // days
    ticketsValidForNewDate: boolean;
    offerRefundOnPostponement: boolean;
    refundPercentageOnPostponement: number | '';
    postponementConditions: string[];
  };
  
  // General Terms & Conditions
  generalTerms: string;
}

interface PoliciesStepProps {
  formData: {
    policies: Policy | null | undefined;
  };
  onFormDataUpdate: (data: { policies: Policy }) => void;
}

export default function PoliciesStep({ formData, onFormDataUpdate }: PoliciesStepProps) {
  const [activePolicy, setActivePolicy] = useState<'participant' | 'speaker' | 'event' | 'postponement' | 'general'>('participant');

  // Initialize default policies if not present - all fields start empty
  const defaultPolicies: Policy = {
    participantRefund: {
      allowRefunds: false,
      refundDeadline: '',
      refundPercentage: '',
      processingFee: '',
      processingTime: '',
      allowEmergencyRefunds: false,
      emergencyConditions: '',
      refundConditions: []
    },
    speakerCancellation: {
      allowCancellation: false,
      cancellationDeadline: '',
      penaltyPercentage: '',
      requireReplacement: false,
      forceMajeureClause: false,
      paymentTerms: '',
      speakerConditions: []
    },
    eventCancellation: {
      allowCancellation: false,
      fullRefundDeadline: '',
      partialRefundDeadline: '',
      partialRefundPercentage: '',
      administrativeFee: '',
      refundMethod: '',
      processingTime: ''
    },
    eventPostponement: {
      allowPostponement: false,
      noticeRequired: '',
      maxPostponementDuration: '',
      ticketsValidForNewDate: false,
      offerRefundOnPostponement: false,
      refundPercentageOnPostponement: '',
      postponementConditions: []
    },
    generalTerms: ''
  };


  // Keep a local copy for immediate UI responsiveness
  const [localPolicies, setLocalPolicies] = useState<Policy>(formData?.policies ?? defaultPolicies);

  // If parent didn't provide policies, seed it with defaults ONCE.
  useEffect(() => {
    if (!formData?.policies) {
      onFormDataUpdate({ policies: defaultPolicies });
      setLocalPolicies(defaultPolicies);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync local state when parent formData.policies changes (useful if parent updates externally)
  useEffect(() => {
    if (formData?.policies) {
      setLocalPolicies(formData.policies);
    }
  }, [formData?.policies]);

  // Helper to update both local state and parent's form state
  const updatePolicy = (policyType: keyof Policy, field: string, value: string | number | boolean | string[]) => {
    setLocalPolicies(prev => {
      const updatedPolicies = {
        ...prev,
        [policyType]: {
          // @ts-expect-error dynamic field assignment
          ...prev[policyType],
          [field]: value
        }
      } as Policy;
      onFormDataUpdate({ policies: updatedPolicies });
      return updatedPolicies;
    });
  };

  const updateCondition = (policyType: 'participantRefund' | 'speakerCancellation' | 'eventPostponement', conditionIndex: number, value: string) => {
    let conditions: string[] = [];
    let fieldName = '';
    
    if (policyType === 'participantRefund') {
      conditions = [...localPolicies.participantRefund.refundConditions];
      fieldName = 'refundConditions';
    } else if (policyType === 'speakerCancellation') {
      conditions = [...localPolicies.speakerCancellation.speakerConditions];
      fieldName = 'speakerConditions';
    } else if (policyType === 'eventPostponement') {
      conditions = [...localPolicies.eventPostponement.postponementConditions];
      fieldName = 'postponementConditions';
    }
    
    conditions[conditionIndex] = value;
    updatePolicy(policyType, fieldName, conditions);
  };

  const addCondition = (policyType: 'participantRefund' | 'speakerCancellation' | 'eventPostponement') => {
    let conditions: string[] = [];
    let fieldName = '';
    
    if (policyType === 'participantRefund') {
      conditions = [...localPolicies.participantRefund.refundConditions];
      fieldName = 'refundConditions';
    } else if (policyType === 'speakerCancellation') {
      conditions = [...localPolicies.speakerCancellation.speakerConditions];
      fieldName = 'speakerConditions';
    } else if (policyType === 'eventPostponement') {
      conditions = [...localPolicies.eventPostponement.postponementConditions];
      fieldName = 'postponementConditions';
    }
    
    conditions.push('');
    updatePolicy(policyType, fieldName, conditions);
  };

  const removeCondition = (policyType: 'participantRefund' | 'speakerCancellation' | 'eventPostponement', conditionIndex: number) => {
    let conditions: string[] = [];
    let fieldName = '';
    
    if (policyType === 'participantRefund') {
      conditions = [...localPolicies.participantRefund.refundConditions];
      fieldName = 'refundConditions';
    } else if (policyType === 'speakerCancellation') {
      conditions = [...localPolicies.speakerCancellation.speakerConditions];
      fieldName = 'speakerConditions';
    } else if (policyType === 'eventPostponement') {
      conditions = [...localPolicies.eventPostponement.postponementConditions];
      fieldName = 'postponementConditions';
    }
    
    conditions.splice(conditionIndex, 1);
    updatePolicy(policyType, fieldName, conditions);
  };

  const policyTabs = [
    { id: 'participant', label: 'Participant Refund Policy', icon: Users },
    { id: 'speaker', label: 'Speaker Cancellation Policy', icon: UserX },
    { id: 'event', label: 'Event Cancellation Policy', icon: CalendarX },
    { id: 'postponement', label: 'Event Postponement Policy', icon: Calendar },
    { id: 'general', label: 'General Terms & Conditions', icon: FileText }
  ];

  const policies = localPolicies; // alias used throughout JSX to keep rest of code consistent

  return (
    <div className="space-y-6 p-6">
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-[#FF6B35]" />
            <label className="block text-lg font-medium text-[#FF6B35]">
              Refund & Cancellation Policies
            </label>
          </div>
          <p className="text-sm text-gray-600">
            Configure policies for refunds, cancellations, and postponements
          </p>
        </div>

        <div className="p-6">
          {/* Policy Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {policyTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePolicy(tab.id as 'participant' | 'speaker' | 'event' | 'postponement' | 'general')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePolicy === tab.id
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Policy Content */}
          <div className="space-y-6">
            {/* Participant Refund Policy */}
            {activePolicy === 'participant' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <Users className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Participant Refund Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowParticipantRefunds"
                        checked={policies.participantRefund.allowRefunds}
                        onChange={(e) => updatePolicy('participantRefund', 'allowRefunds', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowParticipantRefunds" className="text-sm font-medium text-gray-900">
                        Allow participant refunds
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.participantRefund.refundDeadline === '' ? '' : policies.participantRefund.refundDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value) || '';
                          updatePolicy('participantRefund', 'refundDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter days before event"
                        disabled={!policies.participantRefund.allowRefunds}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund deadline (days before event)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.participantRefund.refundPercentage === '' ? '' : policies.participantRefund.refundPercentage}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('participantRefund', 'refundPercentage', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter refund percentage"
                        disabled={!policies.participantRefund.allowRefunds}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund percentage (%)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.participantRefund.processingFee === '' ? '' : policies.participantRefund.processingFee}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('participantRefund', 'processingFee', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter processing fee"
                        disabled={!policies.participantRefund.allowRefunds}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Processing fee (₹)
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#FF6B35]">Refund conditions (one per line)</label>
                      {policies.participantRefund.refundConditions.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-400 text-sm">No conditions added yet</p>
                          <p className="text-gray-400 text-xs">Click &quot;Add Condition&quot; to add refund conditions</p>
                        </div>
                      ) : (
                        policies.participantRefund.refundConditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={condition}
                              onChange={(e) => updateCondition('participantRefund', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                              placeholder="Enter condition"
                              disabled={!policies.participantRefund.allowRefunds}
                            />
                            <button
                              type="button"
                              onClick={() => removeCondition('participantRefund', index)}
                              className="px-2 py-1 text-red-500 hover:text-red-700"
                              disabled={!policies.participantRefund.allowRefunds}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => addCondition('participantRefund')}
                        className="px-3 py-1 border border-[#FF6B35] text-[#FF6B35] text-sm rounded hover:bg-orange-50"
                        disabled={!policies.participantRefund.allowRefunds}
                      >
                        + Add Condition
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={policies.participantRefund.processingTime}
                        onChange={(e) => updatePolicy('participantRefund', 'processingTime', e.target.value)}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="e.g., 3-5 business days"
                        disabled={!policies.participantRefund.allowRefunds}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Processing time
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowEmergencyRefunds"
                        checked={policies.participantRefund.allowEmergencyRefunds}
                        onChange={(e) => updatePolicy('participantRefund', 'allowEmergencyRefunds', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.participantRefund.allowRefunds}
                      />
                      <label htmlFor="allowEmergencyRefunds" className="text-sm font-medium text-gray-900">
                        Allow emergency refunds
                      </label>
                    </div>

                    <div className="relative">
                      <textarea
                        value={policies.participantRefund.emergencyConditions}
                        onChange={(e) => updatePolicy('participantRefund', 'emergencyConditions', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 resize-none"
                        placeholder="Describe conditions for emergency refunds..."
                        disabled={!policies.participantRefund.allowEmergencyRefunds}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Emergency conditions
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Speaker Cancellation Policy */}
            {activePolicy === 'speaker' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <UserX className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Speaker Cancellation Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowSpeakerCancellation"
                        checked={policies.speakerCancellation.allowCancellation}
                        onChange={(e) => updatePolicy('speakerCancellation', 'allowCancellation', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowSpeakerCancellation" className="text-sm font-medium text-gray-900">
                        Allow speaker cancellation
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.speakerCancellation.cancellationDeadline === '' ? '' : policies.speakerCancellation.cancellationDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('speakerCancellation', 'cancellationDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter days before event"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Cancellation deadline (days before event)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.speakerCancellation.penaltyPercentage === '' ? '' : policies.speakerCancellation.penaltyPercentage}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('speakerCancellation', 'penaltyPercentage', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter penalty percentage"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Penalty percentage (%)
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#FF6B35]">Speaker conditions (one per line)</label>
                      {policies.speakerCancellation.speakerConditions.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-400 text-sm">No conditions added yet</p>
                          <p className="text-gray-400 text-xs">Click &quot;Add Condition&quot; to add speaker conditions</p>
                        </div>
                      ) : (
                        policies.speakerCancellation.speakerConditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={condition}
                              onChange={(e) => updateCondition('speakerCancellation', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                              placeholder="Enter condition"
                              disabled={!policies.speakerCancellation.allowCancellation}
                            />
                            <button
                              type="button"
                              onClick={() => removeCondition('speakerCancellation', index)}
                              className="px-2 py-1 text-red-500 hover:text-red-700"
                              disabled={!policies.speakerCancellation.allowCancellation}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => addCondition('speakerCancellation')}
                        className="px-3 py-1 border border-[#FF6B35] text-[#FF6B35] text-sm rounded hover:bg-orange-50"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      >
                        + Add Condition
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireReplacementSpeaker"
                        checked={policies.speakerCancellation.requireReplacement}
                        onChange={(e) => updatePolicy('speakerCancellation', 'requireReplacement', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      />
                      <label htmlFor="requireReplacementSpeaker" className="text-sm font-medium text-gray-900">
                        Require replacement speaker
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="forceMajeureClause"
                        checked={policies.speakerCancellation.forceMajeureClause}
                        onChange={(e) => updatePolicy('speakerCancellation', 'forceMajeureClause', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      />
                      <label htmlFor="forceMajeureClause" className="text-sm font-medium text-gray-900">
                        Force majeure clause
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={policies.speakerCancellation.paymentTerms}
                        onChange={(e) => updatePolicy('speakerCancellation', 'paymentTerms', e.target.value)}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="e.g., Payment withheld until after event completion"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Payment terms
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Cancellation Policy */}
            {activePolicy === 'event' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <CalendarX className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Event Cancellation Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowEventCancellation"
                        checked={policies.eventCancellation.allowCancellation}
                        onChange={(e) => updatePolicy('eventCancellation', 'allowCancellation', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowEventCancellation" className="text-sm font-medium text-gray-900">
                        Allow event cancellation
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventCancellation.fullRefundDeadline === '' ? '' : policies.eventCancellation.fullRefundDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventCancellation', 'fullRefundDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter days before event"
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Full refund deadline (days before)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventCancellation.partialRefundDeadline === '' ? '' : policies.eventCancellation.partialRefundDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventCancellation', 'partialRefundDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter days before event"
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Partial refund deadline (days before)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventCancellation.partialRefundPercentage === '' ? '' : policies.eventCancellation.partialRefundPercentage}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventCancellation', 'partialRefundPercentage', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter partial refund percentage"
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Partial refund percentage (%)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventCancellation.administrativeFee === '' ? '' : policies.eventCancellation.administrativeFee}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventCancellation', 'administrativeFee', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter administrative fee"
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Administrative fee (₹)
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <select
                        value={policies.eventCancellation.refundMethod}
                        onChange={(e) => updatePolicy('eventCancellation', 'refundMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        disabled={!policies.eventCancellation.allowCancellation}
                      >
                        <option value="">Select refund method</option>
                        <option value="Original Payment Method">Original Payment Method</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Check">Check</option>
                        <option value="Store Credit">Store Credit</option>
                      </select>
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund method
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={policies.eventCancellation.processingTime}
                        onChange={(e) => updatePolicy('eventCancellation', 'processingTime', e.target.value)}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="e.g., 5-7 business days"
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Processing time
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Postponement Policy */}
            {activePolicy === 'postponement' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Event Postponement Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowEventPostponement"
                        checked={policies.eventPostponement.allowPostponement}
                        onChange={(e) => updatePolicy('eventPostponement', 'allowPostponement', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowEventPostponement" className="text-sm font-medium text-gray-900">
                        Allow event postponement
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventPostponement.noticeRequired === '' ? '' : policies.eventPostponement.noticeRequired}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventPostponement', 'noticeRequired', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter notice required in days"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Notice required (days)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventPostponement.maxPostponementDuration === '' ? '' : policies.eventPostponement.maxPostponementDuration}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventPostponement', 'maxPostponementDuration', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter max postponement duration"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Max postponement duration (days)
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#FF6B35]">Postponement conditions (one per line)</label>
                      {policies.eventPostponement.postponementConditions.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-400 text-sm">No conditions added yet</p>
                          <p className="text-gray-400 text-xs">Click &quot;Add Condition&quot; to add postponement conditions</p>
                        </div>
                      ) : (
                        policies.eventPostponement.postponementConditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={condition}
                              onChange={(e) => updateCondition('eventPostponement', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                              placeholder="Enter condition"
                              disabled={!policies.eventPostponement.allowPostponement}
                            />
                            <button
                              type="button"
                              onClick={() => removeCondition('eventPostponement', index)}
                              className="px-2 py-1 text-red-500 hover:text-red-700"
                              disabled={!policies.eventPostponement.allowPostponement}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => addCondition('eventPostponement')}
                        className="px-3 py-1 border border-[#FF6B35] text-[#FF6B35] text-sm rounded hover:bg-orange-50"
                        disabled={!policies.eventPostponement.allowPostponement}
                      >
                        + Add Condition
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ticketsValidForNewDate"
                        checked={policies.eventPostponement.ticketsValidForNewDate}
                        onChange={(e) => updatePolicy('eventPostponement', 'ticketsValidForNewDate', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label htmlFor="ticketsValidForNewDate" className="text-sm font-medium text-gray-900">
                        Tickets valid for new date
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="offerRefundOnPostponement"
                        checked={policies.eventPostponement.offerRefundOnPostponement}
                        onChange={(e) => updatePolicy('eventPostponement', 'offerRefundOnPostponement', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label htmlFor="offerRefundOnPostponement" className="text-sm font-medium text-gray-900">
                        Offer refund on postponement
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventPostponement.refundPercentageOnPostponement === '' ? '' : policies.eventPostponement.refundPercentageOnPostponement}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventPostponement', 'refundPercentageOnPostponement', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter refund percentage"
                        disabled={!policies.eventPostponement.offerRefundOnPostponement}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund percentage on postponement (%)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Terms & Conditions */}
            {activePolicy === 'general' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <FileText className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">General Terms & Conditions</h4>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={policies.generalTerms}
                      onChange={(e) => {
                        const updatedPolicies = {
                          ...localPolicies,
                          generalTerms: e.target.value
                        };
                        setLocalPolicies(updatedPolicies);
                        onFormDataUpdate({ policies: updatedPolicies });
                      }}
                      rows={6}
                      className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 resize-none"
                      placeholder="Enter additional terms and conditions..."
                    />
                    <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                      Additional terms and conditions
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
