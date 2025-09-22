'use client';

import { useState } from 'react';
import { X, Star, User, Building, Briefcase, Calendar } from 'lucide-react';

interface ReviewData {
  reviewerName: string;
  reviewerTitle: string;
  reviewerCompany: string;
  reviewerImage?: string;
  rating: number;
  reviewText: string;
  verified?: boolean;
}

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewData) => void;
}

const AddFeedbackModal: React.FC<AddFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ReviewData>({
    reviewerName: '',
    reviewerTitle: '',
    reviewerCompany: '',
    rating: 5,
    reviewText: '',
    verified: false
  });

  const [errors, setErrors] = useState<Partial<ReviewData>>({});

  const handleInputChange = (field: keyof ReviewData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ReviewData> = {};

    if (!formData.reviewerName.trim()) {
      newErrors.reviewerName = 'Name is required';
    }

    if (!formData.reviewerTitle.trim()) {
      newErrors.reviewerTitle = 'Title is required';
    }

    if (!formData.reviewerCompany.trim()) {
      newErrors.reviewerCompany = 'Company is required';
    }

    if (!formData.reviewText.trim()) {
      newErrors.reviewText = 'Review text is required';
    }

    if (formData.reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        reviewerName: '',
        reviewerTitle: '',
        reviewerCompany: '',
        rating: 5,
        reviewText: '',
        verified: false
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      reviewerName: '',
      reviewerTitle: '',
      reviewerCompany: '',
      rating: 5,
      reviewText: '',
      verified: false
    });
    setErrors({});
    onClose();
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && handleInputChange('rating', star)}
            disabled={!interactive}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'text-orange-500 fill-orange-500'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Feedback & Review
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating
            </label>
            <div className="flex items-center space-x-2">
              {renderStars(formData.rating, true)}
              <span className="text-sm text-gray-600 ml-2">
                {formData.rating} out of 5 stars
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Your Name *
              </label>
              <input
                type="text"
                value={formData.reviewerName}
                onChange={(e) => handleInputChange('reviewerName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.reviewerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.reviewerName && (
                <p className="text-red-500 text-sm mt-1">{errors.reviewerName}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Your Title *
              </label>
              <input
                type="text"
                value={formData.reviewerTitle}
                onChange={(e) => handleInputChange('reviewerTitle', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.reviewerTitle ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., CEO, Manager, Director"
              />
              {errors.reviewerTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.reviewerTitle}</p>
              )}
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Company/Organization *
            </label>
            <input
              type="text"
              value={formData.reviewerCompany}
              onChange={(e) => handleInputChange('reviewerCompany', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.reviewerCompany ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your company or organization name"
            />
            {errors.reviewerCompany && (
              <p className="text-red-500 text-sm mt-1">{errors.reviewerCompany}</p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={formData.reviewText}
              onChange={(e) => handleInputChange('reviewText', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                errors.reviewText ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Share your experience and feedback..."
            />
            {errors.reviewText && (
              <p className="text-red-500 text-sm mt-1">{errors.reviewText}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.reviewText.length}/500 characters
            </p>
          </div>

          {/* Verification Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified}
              onChange={(e) => handleInputChange('verified', e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="verified" className="text-sm text-gray-700">
              I verify that this review is based on my genuine experience
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFeedbackModal;






