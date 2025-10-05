'use client';

import { DisputeFormData } from '../../types/disputeTypes';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateDisputeMutation } from '../../../../store/api/disputApi';

interface ReviewStepProps {
  formData: DisputeFormData;
  onStepChange: (step: number) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ReviewStep({  
  formData,
  onStepChange,
  onClose,
}: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [createDispute] = useCreateDisputeMutation();

  const safeText = (value?: string | number) =>
    typeof value === 'string' ? value.trim() || '-' : value ?? '-';
  
console.log('ReviewStep formData1:', formData);
console.log('ReviewStep formData1 respondent:', formData.respondentId);


  const handleSubmit = async (e: React.FormEvent) => {
  console.log("Submitting parties:", formData.partiesInvolved);

    e.preventDefault();
    setIsLoading(true);
    console.log('ReviewStep formData2:', formData);
      // ✅ Inspect JWT payload
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload:', payload); // Check id, exp, role, etc.
    } catch (err) {
      console.error('Invalid token:', err);
    }
  } else {
    console.warn('No access token found in localStorage');
  }

    try {
      const respondentIds = formData.partiesInvolved
  ?.map((p) => p.userId?.toString())
  .filter(Boolean) as string[] || [];


      if (respondentIds.length === 0) {
        alert('Please select at least one respondent.');
        setIsLoading(false);
        return;
      }
      console.log('RespondentId:', respondentIds[0]);


      const payload = {
  title: formData.disputeTitle?.trim() || '',
  description: formData.description?.trim() || '',
  category: formData.disputeReason?.trim() || '',
  priority: 'medium',
  respondentIds: respondentIds, // string now
  eventId: formData.eventId, // ✅ ADDED: Event ID for speaker lookup
  disputeAmount: formData.amount || 0, // ✅ ADDED: Dispute amount
  disputeCurrency: 'INR' // ✅ ADDED: Currency
};
console.log('Selected parties before submit:', formData.partiesInvolved);
console.log('Respondent IDs:', respondentIds);
console.log('Event ID:', formData.eventId);
console.log('Full payload being sent:', payload);



      if (!payload.title || !payload.description) {
        alert('Please provide title and description.');
        setIsLoading(false);
        return;
      }

      const result = await createDispute(payload).unwrap();
      alert(result?.message ?? 'Dispute created successfully');
      console.log('Dispute created:', result);

      onClose();
      router.push('/dispute');
    } catch (err: any) {
      console.error('Submit dispute error:', err);
      alert(err?.data?.message ?? 'Failed to submit dispute.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-orange-500 mb-4">
        Review & Submit
      </h3>

      <SectionCard
        title="Event Information"
        step={1}
        onStepChange={onStepChange}
        content={
          <>
            <h5 className="font-medium text-gray-900">
              {safeText(formData.eventName)}
            </h5>
            {formData.eventDate && (
              <p className="text-sm text-gray-600">
                Date: {new Date(formData.eventDate).toLocaleDateString()}
              </p>
            )}
          </>
        }
      />

      <SectionCard
        title="Parties Involved"
        step={2}
        onStepChange={onStepChange}
        content={
          <p className="text-gray-900">
            {formData.partiesInvolved?.length
              ? formData.partiesInvolved
                  .map((p) => `${p.name} (${p.role})`)
                  .join(', ')
              : '-'}
          </p>
        }
      />

      <SectionCard
        title="Dispute Details"
        step={3}
        onStepChange={onStepChange}
        content={
          <div className="space-y-1">
            <InfoRow label="Title" value={formData.disputeTitle} />
            <InfoRow label="Reason" value={formData.disputeReason} />
            <InfoRow label="Amount" value={formData.amount ?? 0} />
          </div>
        }
      />

      <SectionCard
        title="Description & Evidence"
        step={4}
        onStepChange={onStepChange}
        content={
          <div className="space-y-2">
            <p className="text-sm text-gray-900">
              {safeText(formData.detailedDescription)}
            </p>
            <div>
              <h5 className="font-medium text-gray-700 mb-1">
                Requested Resolution
              </h5>
              <p className="text-sm text-gray-900">
                {safeText(formData.preferredResolution)}
              </p>
            </div>
            {formData.supportingDocument && (
              <div className="mt-2">
                <h5 className="font-medium text-gray-700 mb-1">
                  Supporting Document
                </h5>
                <p className="text-sm text-gray-900">
                  {formData.supportingDocument.name}
                </p>
              </div>
            )}
            {formData.preferredContact && (
              <div>
                <span className="text-sm text-gray-600">Preferred Contact</span>{' '}
                <span className="text-sm text-gray-900">
                  {formData.preferredContact}
                </span>
              </div>
            )}
          </div>
        }
      />

      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          type="button"
          onClick={() => onStepChange(4)}
          className="px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-50 transition"
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={isLoading}
        
          className="px-8 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </div>
    </form>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">
        {typeof value === 'string' ? value || '-' : value ?? '-'}
      </span>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  content: React.ReactNode;
  step: number;
  onStepChange: (step: number) => void;
}

function SectionCard({ title, content, step, onStepChange }: SectionCardProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-orange-500">{title}</h4>
        <button
          onClick={() => onStepChange(step)}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-orange-600 flex items-center gap-1"
        >
          <Edit size={16} /> Edit
        </button>
      </div>
      {content}
    </div>
  );
}