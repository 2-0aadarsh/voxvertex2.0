// ============================================================================
// EVENT FORM HOOK - Custom Hook for Event Form Management
// ============================================================================

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCurrentStep,
  nextStep,
  previousStep,
  updateFormData,
  updateCoreDetails,
  updateBrandingContent,
  updateTicketing,
  updateSpeakers,
  updateAddons,
  updatePolicies,
  updateStatus,
  setLoading,
  setError,
  clearError,
  saveDraft,
  clearDraft,
  resetForm,
  loadEventForEditing,
  selectEventForm,
  selectCurrentStep,
  selectFormData,
  selectEventLoading,
  selectEventError,
  selectIsDraft,
  selectLastSaved,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
  validateAllSteps,
  useCreateEventMutation,
  useUpdateEventMutation,
  useUploadBannerImageMutation
} from '@/store/slices/enhancedEventSlice';

import type {
  EventFormData,
  EventStep,
  EventValidation,
  EnhancedEvent,
  CreateEventRequest
} from '../types/eventTypes';

export const useEventForm = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const formState = useAppSelector(selectEventForm);
  const currentStep = useAppSelector(selectCurrentStep);
  const formData = useAppSelector(selectFormData);
  const isLoading = useAppSelector(selectEventLoading);
  const error = useAppSelector(selectEventError);
  const isDraft = useAppSelector(selectIsDraft);
  const lastSaved = useAppSelector(selectLastSaved);
  
  // API mutations
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [uploadBannerImage, { isLoading: isUploading }] = useUploadBannerImageMutation();
  
  // Step navigation
  const goToStep = useCallback((step: EventStep) => {
    dispatch(setCurrentStep(step));
  }, [dispatch]);
  
  const goToNextStep = useCallback(() => {
    dispatch(nextStep());
  }, [dispatch]);
  
  const goToPreviousStep = useCallback(() => {
    dispatch(previousStep());
  }, [dispatch]);
  
  // Form data updates
  const updateForm = useCallback((data: Partial<EventFormData>) => {
    dispatch(updateFormData(data));
  }, [dispatch]);
  
  const updateStep1 = useCallback((data: Parameters<typeof updateCoreDetails>[0]) => {
    dispatch(updateCoreDetails(data));
  }, [dispatch]);
  
  const updateStep2 = useCallback((data: Parameters<typeof updateBrandingContent>[0]) => {
    dispatch(updateBrandingContent(data));
  }, [dispatch]);
  
  const updateStep3 = useCallback((data: Parameters<typeof updateTicketing>[0]) => {
    dispatch(updateTicketing(data));
  }, [dispatch]);
  
  const updateStep4 = useCallback((data: Parameters<typeof updateSpeakers>[0]) => {
    dispatch(updateSpeakers(data));
  }, [dispatch]);
  
  const updateStep5 = useCallback((data: Parameters<typeof updateAddons>[0]) => {
    dispatch(updateAddons(data));
  }, [dispatch]);
  
  const updateStep6 = useCallback((data: Parameters<typeof updatePolicies>[0]) => {
    dispatch(updatePolicies(data));
  }, [dispatch]);
  
  const updateEventStatus = useCallback((status: 'draft' | 'published') => {
    dispatch(updateStatus(status));
  }, [dispatch]);
  
  // Validation
  const validateCurrentStep = useCallback((): EventValidation => {
    switch (currentStep) {
      case 1:
        return validateStep1(formData);
      case 2:
        return validateStep2(formData);
      case 3:
        return validateStep3(formData);
      case 4:
        return validateStep4(formData);
      case 5:
        return validateStep5(formData);
      case 6:
        return validateStep6(formData);
      case 7:
        return validateStep7(formData);
      default:
        return { isValid: false, errors: {} };
    }
  }, [currentStep, formData]);
  
  const validateAllStepsData = useCallback(() => {
    return validateAllSteps(formData);
  }, [formData]);
  
  // File upload
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('bannerImage', file);
      
      const result = await uploadBannerImage(formData).unwrap();
      
      if (result.success && result.data?.url) {
        return result.data.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Image upload failed'));
      return null;
    }
  }, [uploadBannerImage, dispatch]);
  
  // Transform form data to API format
  const transformToAPIFormat = useCallback((): CreateEventRequest => {
    // Debug: Log the original form data to see what we're working with
    console.log('🔍 Original form data before transformation:', {
      policies: formData.policies,
      participantRefund: formData.policies?.participantRefund,
      speakerCancellation: formData.policies?.speakerCancellation,
      eventCancellation: formData.policies?.eventCancellation
    });
    
    return {
      eventName: formData.eventName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      eventMode: formData.eventMode,
      format: formData.format,
      location: formData.location,
      
      // Online Event Platform fields
      meetingPlatform: formData.meetingPlatform,
      meetingLink: formData.meetingLink,
      meetingId: formData.meetingId,
      passcode: formData.passcode,
      dialInNumbers: formData.dialInNumbers,
      participantInstructions: formData.participantInstructions,
      
      description: formData.description,
      bannerImage: formData.bannerImageUrl,
      tags: formData.tags,
      ticketTypes: formData.ticketTypes.map(ticket => ({
        ...ticket,
        price: String(typeof ticket.price === 'string' ? ticket.price : ticket.price),
        quantity: String(typeof ticket.quantity === 'string' ? ticket.quantity : ticket.quantity),
        discount: ticket.discount ? {
          ...ticket.discount,
          value: String(typeof ticket.discount.value === 'string' ? ticket.discount.value : ticket.discount.value),
          maxUses: String(ticket.discount.maxUses || '0')
        } : undefined
      })),
      speakers: formData.speakers,
      addons: formData.addons,
      policies: formData.policies ? {
        // Participant Refund Policy - transform to new structure
        participantRefund: {
          allowRefunds: formData.policies.participantRefund?.allowRefunds || false,
          refundDeadline: formData.policies.participantRefund?.refundDeadline || '',
          refundPercentage: formData.policies.participantRefund?.refundPercentage || '',
          processingTime: "48 hours", // Fixed default value
          refundConditions: formData.policies.participantRefund?.refundConditions || []
        },
        // Speaker Cancellation Policy - transform to new structure
        speakerCancellation: {
          allowCancellation: formData.policies.speakerCancellation?.allowCancellation || false,
          cancellationDeadline: formData.policies.speakerCancellation?.cancellationDeadline || '',
          partialRefundPercentage: formData.policies.speakerCancellation?.partialRefundPercentage || '',
          requireReplacement: formData.policies.speakerCancellation?.requireReplacement || false,
          paymentTerms: formData.policies.speakerCancellation?.paymentTerms || '',
          speakerConditions: formData.policies.speakerCancellation?.speakerConditions || []
        },
        // Event Cancellation Policy - transform to new structure
        eventCancellation: {
          allowCancellation: formData.policies.eventCancellation?.allowCancellation || false,
          fullRefundDeadline: formData.policies.eventCancellation?.fullRefundDeadline || '',
          partialRefundPercentage: formData.policies.eventCancellation?.partialRefundPercentage || '',
          refundMethod: formData.policies.eventCancellation?.refundMethod || '',
          processingTime: "48 hours", // Fixed default value
          cancellationConditions: formData.policies.eventCancellation?.cancellationConditions || ''
        },
        // Event Postponement Policy - transform to new structure
        eventPostponement: {
          allowPostponement: formData.policies.eventPostponement?.allowPostponement || false,
          noticeRequired: formData.policies.eventPostponement?.noticeRequired || '',
          maxPostponementDuration: formData.policies.eventPostponement?.maxPostponementDuration || '',
          partialRefundRequestDeadline: formData.policies.eventPostponement?.partialRefundRequestDeadline || '',
          ticketsValidForNewDate: formData.policies.eventPostponement?.ticketsValidForNewDate || false,
          offerRefundOnPostponement: formData.policies.eventPostponement?.offerRefundOnPostponement || false,
          allowSpeakersToCancelOnPostponement: formData.policies.eventPostponement?.allowSpeakersToCancelOnPostponement || false,
          refundPercentageOnPostponement: formData.policies.eventPostponement?.refundPercentageOnPostponement || '',
          postponementConditions: formData.policies.eventPostponement?.postponementConditions || []
        },
        // General Terms & Conditions
        generalTerms: formData.policies.generalTerms || ''
      } : {
        // Default policies if none provided
        participantRefund: {
          allowRefunds: false,
          refundDeadline: '',
          refundPercentage: '',
          processingTime: "48 hours",
          refundConditions: []
        },
        speakerCancellation: {
          allowCancellation: false,
          cancellationDeadline: '',
          partialRefundPercentage: '',
          requireReplacement: false,
          paymentTerms: '',
          speakerConditions: []
        },
        eventCancellation: {
          allowCancellation: false,
          fullRefundDeadline: '',
          partialRefundPercentage: '',
          refundMethod: '',
          processingTime: "48 hours",
          cancellationConditions: ''
        },
        eventPostponement: {
          allowPostponement: false,
          noticeRequired: '',
          maxPostponementDuration: '',
          partialRefundRequestDeadline: '',
          ticketsValidForNewDate: false,
          offerRefundOnPostponement: false,
          allowSpeakersToCancelOnPostponement: false,
          refundPercentageOnPostponement: '',
          postponementConditions: []
        },
        generalTerms: ''
      },
      status: formData.status
    };
  }, [formData]);
  
  // Create event
  const createNewEvent = useCallback(async (overrideBannerImage?: string, statusOverride?: string): Promise<EnhancedEvent | null> => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // Validate all steps before creating
      const validation = validateAllStepsData();
      const hasErrors = Object.values(validation).some(step => !step.isValid);
      
      if (hasErrors) {
        const errorMessages = Object.values(validation)
          .flatMap(step => Object.values(step.errors))
          .join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      
      // Transform data to API format
      const eventData = transformToAPIFormat();
      
      // Debug: Log the transformed data to see what we're sending
      console.log('🔍 Transformed event data being sent to backend:', {
        policies: eventData.policies,
        participantRefund: eventData.policies?.participantRefund,
        speakerCancellation: eventData.policies?.speakerCancellation,
        eventCancellation: eventData.policies?.eventCancellation
      });
      
      // Override banner image if provided
      if (overrideBannerImage) {
        eventData.bannerImage = overrideBannerImage;
      }
      
      // Override status if provided
      if (statusOverride) {
        eventData.status = statusOverride as 'draft' | 'published';
      }
      
      // Create event
      const result = await createEvent(eventData).unwrap();
      
      if (result.success && result.data) {
        dispatch(clearDraft());
        dispatch(resetForm());
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Create event error:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to create event'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, validateAllStepsData, transformToAPIFormat, createEvent]);
  
  // Update existing event
  const updateExistingEvent = useCallback(async (eventId: string): Promise<EnhancedEvent | null> => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // Validate all steps before updating
      const validation = validateAllStepsData();
      const hasErrors = Object.values(validation).some(step => !step.isValid);
      
      if (hasErrors) {
        const errorMessages = Object.values(validation)
          .flatMap(step => Object.values(step.errors))
          .join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      
      // Transform data to API format
      const eventData = transformToAPIFormat();
      
      // Update event
      const result = await updateEvent({ _id: eventId, ...eventData }).unwrap();
      
      if (result.success && result.data) {
        dispatch(clearDraft());
        return result.data;
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('Update event error:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to update event'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, validateAllStepsData, transformToAPIFormat, updateEvent]);
  
  // Load event for editing
  const loadEvent = useCallback((event: EnhancedEvent) => {
    dispatch(loadEventForEditing(event));
  }, [dispatch]);
  
  // Save draft
  const saveAsDraft = useCallback(() => {
    dispatch(saveDraft());
  }, [dispatch]);
  
  // Reset form
  const resetEventForm = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);
  
  // Clear error
  const clearFormError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  // Computed values
  const isStepValid = useMemo(() => {
    const validation = validateCurrentStep();
    return validation.isValid;
  }, [validateCurrentStep]);
  
  const canProceedToNext = useMemo(() => {
    return isStepValid && currentStep < 7;
  }, [isStepValid, currentStep]);
  
  const canGoToPrevious = useMemo(() => {
    return currentStep > 1;
  }, [currentStep]);
  
  const isFormComplete = useMemo(() => {
    const validation = validateAllStepsData();
    return Object.values(validation).every(step => step.isValid);
  }, [validateAllStepsData]);
  
  const totalLoading = useMemo(() => {
    return isLoading || isCreating || isUpdating || isUploading;
  }, [isLoading, isCreating, isUpdating, isUploading]);
  
  return {
    // State
    formState,
    currentStep,
    formData,
    isLoading: totalLoading,
    error,
    isDraft,
    lastSaved,
    
    // Step navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    
    // Form updates
    updateForm,
    updateStep1,
    updateStep2,
    updateStep3,
    updateStep4,
    updateStep5,
    updateStep6,
    updateEventStatus,
    
    // Validation
    validateCurrentStep,
    validateAllStepsData,
    isStepValid,
    canProceedToNext,
    canGoToPrevious,
    isFormComplete,
    
    // File upload
    uploadImage,
    isUploading,
    
    // Event operations
    createNewEvent,
    updateExistingEvent,
    loadEvent,
    
    // Draft management
    saveAsDraft,
    
    // Utilities
    resetEventForm,
    clearFormError,
    
    // API states
    isCreating,
    isUpdating,
  };
};

export default useEventForm;

