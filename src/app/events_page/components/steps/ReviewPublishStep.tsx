interface ReviewPublishStepProps {
  formData: {
    eventName: string
    startDate: string
    endDate: string
    eventMode: 'offline' | 'online' | 'hybrid'
    location: string
    description: string
    image: File | null
    tags: string[]
    ticketTypes: Array<{
      name: string
      price: string
      quantity: string
    }>
    speakers: Array<{
      name: string
      title: string
      bio: string
    }>
    addons: {
      featureOnHome: boolean
      includeInNewsletter: boolean
      socialMediaPromotion: boolean
    }
  }
  onStepChange: (step: number) => void
  onSubmit: () => void
  onSaveDraft: () => void
  isLoading: boolean
}

export default function ReviewPublishStep({ formData, onStepChange, onSubmit, onSaveDraft, isLoading }: ReviewPublishStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-6 pl-6 pr-6">

        {/* Core Details Section */}
        <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-[#FF6B35]">
              Core Details
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(1)}
              className="bg-[#FF6B35] text-white text-sm px-5 py-1 rounded-lg hover:bg-orange-600 flex items-center"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">Event Name*</span>
              <p className="text-gray-900 text-sm w-1/2">{formData.eventName || 'Not specified'}</p>
            </div>
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">Start Date*</span>
              <p className="text-gray-900 text-sm w-1/2">{formData.startDate || 'Not specified'}</p>
            </div>
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">End Date*</span>
              <p className="text-gray-900 text-sm w-1/2">{formData.endDate || 'Not specified'}</p>
            </div>
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">Event Mode*</span>
              <p className="text-gray-900 text-sm w-1/2 capitalize">{formData.eventMode}</p>
            </div>
            <div className="flex">
              <span className="text-gray-700 text-sm w-1/2">Location*</span>
              <p className="text-gray-900 text-sm w-1/2">{formData.location || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Branding & Content Section */}
        <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-[#FF6B35]">
              Branding & Content
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(2)}
              className="bg-[#FF6B35] text-white text-sm px-5 py-1 rounded-lg hover:bg-orange-600 flex items-center"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">Banner Image URL*</span>
              <p className="text-gray-900 text-sm w-1/2">{formData.image ? formData.image.name : 'No image uploaded'}</p>
            </div>
            <div className="flex">
              <span className="text-gray-700 text-sm w-1/2">Event Description*</span>
              <p className="text-gray-900 text-sm w-1/2">{formData.description || 'No description added'}</p>
            </div>
          </div>
        </div>

        {/* Ticketing Section */}
        <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-[#FF6B35]">
              Ticketing
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(3)}
              className="bg-[#FF6B35] text-white text-sm px-5 py-1 rounded-lg hover:bg-orange-600 flex items-center"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            {formData.ticketTypes?.length ? (
              formData.ticketTypes.map((ticket, index) => (
                <div key={index} className={`space-y-3 ${index < formData.ticketTypes.length - 1 ? 'border-b border-gray-300 pb-4' : ''}`}>
                  <div className="flex border-b border-gray-300 pb-3">
                    <span className="text-gray-700 text-sm w-1/2">Ticket Name*</span>
                    <p className="text-gray-900 text-sm w-1/2">{ticket.name}</p>
                  </div>
                  <div className="flex border-b border-gray-300 pb-3">
                    <span className="text-gray-700 text-sm w-1/2">Price($)*</span>
                    <p className="text-gray-900 text-sm w-1/2">{ticket.price || '0'}</p>
                  </div>
                  <div className="flex">
                    <span className="text-gray-700 text-sm w-1/2">Quantity*</span>
                    <p className="text-gray-900 text-sm w-1/2">{ticket.quantity || '0'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex">
                <span className="text-gray-700 text-sm w-1/2"></span>
                <p className="text-gray-500 text-sm w-1/2">No ticket tiers added</p>
              </div>
            )}
          </div>
        </div>

        {/* Speakers Section */}
        <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-[#FF6B35]">
              Speakers
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(4)}
              className="bg-[#FF6B35] text-white text-sm px-5 py-1 rounded-lg hover:bg-orange-600 flex items-center"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            {formData.speakers?.length ? (
              formData.speakers.map((speaker, index) => (
                <div key={index} className={`space-y-3 ${index < formData.speakers.length - 1 ? 'border-b border-gray-300 pb-4' : ''}`}>
                  <div className="flex border-b border-gray-300 pb-3">
                    <span className="text-gray-700 text-sm w-1/2">Name*</span>
                    <p className="text-gray-900 text-sm w-1/2">{speaker.name}</p>
                  </div>
                  <div className="flex border-b border-gray-300 pb-3">
                    <span className="text-gray-700 text-sm w-1/2">Title</span>
                    <p className="text-gray-900 text-sm w-1/2">{speaker.title}</p>
                  </div>
                  <div className="flex">
                    <span className="text-gray-700 text-sm w-1/2">Bio</span>
                    <p className="text-gray-900 text-sm w-1/2">{speaker.bio}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex">
                <span className="text-gray-700 text-sm w-1/2"></span>
                <p className="text-gray-500 text-sm w-1/2">No speakers added</p>
              </div>
            )}
          </div>
        </div>

        {/* Addons Section */}
        <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-[#FF6B35]">
              Add-ons
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(5)}
              className="bg-[#FF6B35] text-white text-sm px-5 py-1 rounded-lg hover:bg-orange-600 flex items-center"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">Feature on Home:</span>
              <span className={`text-sm w-1/2 ${formData.addons.featureOnHome ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.addons.featureOnHome ? '✓ Selected ($50)' : 'Not selected'}
              </span>
            </div>
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">Newsletter inclusion:</span>
              <span className={`text-sm w-1/2 ${formData.addons.includeInNewsletter ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.addons.includeInNewsletter ? '✓ Selected ($25)' : 'Not selected'}
              </span>
            </div>
            <div className="flex border-b border-gray-300 pb-3">
              <span className="text-gray-700 text-sm w-1/2">Social Media promotion:</span>
              <span className={`text-sm w-1/2 ${formData.addons.socialMediaPromotion ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.addons.socialMediaPromotion ? '✓ Selected ($30)' : 'Not selected'}
              </span>
            </div>
            <div className="flex pt-2">
              <span className="text-gray-900 font-bold text-sm w-1/2">Total Add-ons Cost:</span>
              <span className="font-bold text-orange-600 text-sm w-1/2">
                ${(formData.addons.featureOnHome ? 50 : 0) + 
                  (formData.addons.includeInNewsletter ? 25 : 0) + 
                  (formData.addons.socialMediaPromotion ? 30 : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center space-x-4 pt-6">
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-8 py-2 border-2 border-[#FF6B35] rounded-full text-[#FF6B35] hover:bg-gray-50 font-medium"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-[#FF6B35] hover:bg-orange-600 text-white px-8 py-2 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Publishing...' : 'Publish Event'}
        </button>
      </div>
    </div>
  )
}