'use client';
import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react';
import { useRegisterMutation } from '@/store/slices/authSlice';
import { FormData } from '@/app/signup/types';
import FormSelect from '@/app/signup/components/common/FormSelect';
import { getAvailableActivities } from '@/app/signup/components/utils/formHelpers';

interface OrganizerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: (userData: unknown) => void;
  onSwitchToLogin: () => void;
}

export default function OrganizerSignupModal({ 
  isOpen, 
  onClose, 
  onSignupSuccess,
  onSwitchToLogin 
}: OrganizerSignupModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2 fields
    companyTitle: '',
    activity: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Use Redux RTK Query mutation
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.companyTitle) {
      newErrors.companyTitle = 'Please select your industry';
    }

    if (!formData.activity || formData.activity.length === 0) {
      newErrors.activity = 'Please select at least one activity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    try {
      // Use Redux RTK Query mutation
      const result = await registerMutation({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'organizer', // Always organizer for this modal
        industry: formData.companyTitle,
        activities: formData.activity
      }).unwrap();

      console.log('🔐 Registration result:', result);

      if (result.success) {
        // Redux state is automatically updated by the mutation
        onSignupSuccess(result.user);
        onClose();
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : 'Registration failed. Please try again.';
      setErrors({ 
        general: errorMessage
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900">Join Voxvertex</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Step {currentStep} of 2</span>
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full ${currentStep === 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${currentStep === 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            {currentStep === 2 && (
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Back</span>
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Account Type Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Event Organizer Account</span>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 ? (
              // Step 1: Basic Information
              <>
                {/* Full Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Next'}
                </button>
              </>
            ) : (
              // Step 2: Additional Information (Organizer-specific)
              <>
                {/* Industry Selection */}
                <FormSelect
                  id="companyTitle"
                  label="Industry"
                  value={formData.companyTitle}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ companyTitle: e.target.value, activity: [] })}
                  options={[
                    { value: "", label: "Select your industry" },
                    { value: "technology", label: "Technology" },
                    { value: "healthcare", label: "Healthcare and Medicine" },
                    { value: "finance", label: "Finance and Banking" },
                    { value: "education", label: "Education" },
                    { value: "business", label: "Business and Management" },
                    { value: "engineering", label: "Engineering" },
                    { value: "art", label: "Art and Entertainment" },
                    { value: "law", label: "Law and Legal Studies" },
                    { value: "marketing", label: "Marketing and Communications" },
                    { value: "environmental", label: "Environmental and Sustainability" },
                    { value: "manufacturing", label: "Manufacturing and Industry" },
                    { value: "social", label: "Social Sciences and Humanities" },
                    { value: "retail", label: "Retail and E-Commerce" },
                    { value: "energy", label: "Energy and Utilities" },
                    { value: "realestate", label: "Real Estate and Property Development" },
                  ]}
                />

                {/* Primary Activities */}
                {formData.companyTitle && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Primary Activities</label>
                      <span className="text-sm text-gray-500">
                        {formData.activity?.length || 0}/3 selected
                      </span>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                      {getAvailableActivities(formData.companyTitle).map((activity) => {
                        const isSelected = formData.activity?.includes(activity) || false
                        const isDisabled = !isSelected && (formData.activity?.length || 0) >= 3
                        
                        return (
                          <label 
                            key={activity} 
                            className={`flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'bg-orange-50 border-l-4 border-l-orange-500' 
                                : isDisabled 
                                  ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                                  : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const current = formData.activity || []
                                  if (current.includes(activity)) {
                                    updateFormData({ activity: current.filter((a: string) => a !== activity) })
                                  } else if (current.length < 3) {
                                    updateFormData({ activity: [...current, activity] })
                                  }
                                }}
                                disabled={isDisabled}
                                className="w-4 h-4 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-2 disabled:opacity-50"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <span className={`text-sm flex-1 ${
                              isSelected ? 'text-orange-700 font-medium' : 'text-gray-700'
                            }`}>
                              {activity}
                            </span>
                            {isSelected && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            )}
                          </label>
                        )
                      })}
                    </div>
                    
                    {(formData.activity?.length || 0) > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Selected: <span className="font-medium text-orange-600">
                            {formData.activity?.join(', ')}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <div className="text-gray-400 text-sm mb-2">OR</div>
            <button
              onClick={onSwitchToLogin}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
