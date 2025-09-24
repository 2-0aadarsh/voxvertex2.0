import React from 'react';

interface AddonsStepProps {
  formData: {
    addons: {
      featureOnHome: boolean
      includeInNewsletter: boolean
      socialMediaPromotion: boolean
    }
  }
  onFormDataUpdate: (data: any) => void
}

function AddonsStep({ formData, onFormDataUpdate }: AddonsStepProps) {
  const updateAddon = (field: string, value: boolean) => {
    onFormDataUpdate({
      addons: {
        ...formData.addons,
        [field]: value
      }
    })
  }

  const totalCost = (formData.addons.featureOnHome ? 50 : 0) + 
                   (formData.addons.includeInNewsletter ? 25 : 0) + 
                   (formData.addons.socialMediaPromotion ? 30 : 0)

  return (
    <div className="space-y-6 p-6">

      <div className="border border-gray-300 rounded-lg p-6">
        <h4 className="text-base font-medium text-orange-500 mb-2">Promotional Add-ons</h4>
        <p className="text-sm text-gray-600 mb-6">
          Select additional promotional features for your event
        </p>

        <div className="space-y-3">
        
          <div 
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              formData.addons.featureOnHome 
                ? 'border-[#FF6B35]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateAddon('featureOnHome', !formData.addons.featureOnHome)}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="featureOnHome"
                checked={formData.addons.featureOnHome}
                onChange={() => {}}
                className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <div className="flex-1">
                <label htmlFor="featureOnHome" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Feature on Home
                </label>
              </div>
            </div>
          </div>
          <div 
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              formData.addons.includeInNewsletter 
                ? 'border-[#FF6B35]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateAddon('includeInNewsletter', !formData.addons.includeInNewsletter)}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="includeInNewsletter"
                checked={formData.addons.includeInNewsletter}
                onChange={() => {}}
                className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <div className="flex-1">
                <label htmlFor="includeInNewsletter" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Include in targeted newsletter
                </label>
              </div>
            </div>
          </div>

          <div 
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              formData.addons.socialMediaPromotion 
                ? 'border-[#FF6B35]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateAddon('socialMediaPromotion', !formData.addons.socialMediaPromotion)}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="socialMediaPromotion"
                checked={formData.addons.socialMediaPromotion}
                onChange={() => {}}
                className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <div className="flex-1">
                <label htmlFor="socialMediaPromotion" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Social Media promotion
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo component to show the functionality
function Demo() {
  const [formData, setFormData] = React.useState({
    addons: {
      featureOnHome: false,
      includeInNewsletter: false,
      socialMediaPromotion: true
    }
  })

  const handleFormDataUpdate = (data: { addons: { featureOnHome: boolean, includeInNewsletter: boolean, socialMediaPromotion: boolean } }) => {
    setFormData(prevData => ({
      ...prevData,
      ...data
    }))
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <AddonsStep 
        formData={formData}
        onFormDataUpdate={handleFormDataUpdate}
      />
    </div>
  )
}

export { AddonsStep as default }