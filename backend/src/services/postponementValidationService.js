/**
 * Postponement Validation Service
 * Validates if an event can be postponed based on its policies
 */

class PostponementValidationService {
  constructor() {
    this.validationErrors = [];
    this.validationWarnings = [];
  }

  /**
   * Main validation method - checks if event can be postponed
   * @param {Object} event - The event document
   * @param {Object} postponementData - The postponement request data
   * @returns {Object} - Validation result with canPostpone, errors, warnings
   */
  validatePostponement(event, postponementData) {
    this.validationErrors = [];
    this.validationWarnings = [];

    // Basic event checks
    if (!this.validateBasicEventChecks(event)) {
      return this.getValidationResult();
    }

    // Check postponement policy
    if (!this.validatePostponementPolicy(event)) {
      return this.getValidationResult();
    }

    // Validate postponement data
    if (!this.validatePostponementData(event, postponementData)) {
      return this.getValidationResult();
    }

    // Check timing constraints
    if (!this.validateTimingConstraints(event, postponementData)) {
      return this.getValidationResult();
    }

    // Check refund constraints
    if (!this.validateRefundConstraints(event, postponementData)) {
      return this.getValidationResult();
    }

    // Check speaker constraints
    if (!this.validateSpeakerConstraints(event, postponementData)) {
      return this.getValidationResult();
    }

    return this.getValidationResult();
  }

  /**
   * Basic event validation checks
   */
  validateBasicEventChecks(event) {
    // Check if event exists
    if (!event) {
      this.validationErrors.push('Event not found');
      return false;
    }

    // Check if event is published
    if (event.status !== 'published') {
      this.validationErrors.push('Only published events can be postponed');
      return false;
    }

    // Check if event is already postponed
    if (event.status === 'postponed') {
      this.validationErrors.push('Event is already postponed');
      return false;
    }

    // Check if event is in the past
    if (event.endDate < new Date()) {
      this.validationErrors.push('Cannot postpone past events');
      return false;
    }

    // Check if event has already started
    if (event.startDate <= new Date()) {
      this.validationErrors.push('Cannot postpone events that have already started');
      return false;
    }

    return true;
  }

  /**
   * Validate postponement policy
   */
  validatePostponementPolicy(event) {
    const postponementPolicy = event.policies?.eventPostponement;

    if (!postponementPolicy) {
      this.validationErrors.push('Event postponement policy not found');
      return false;
    }

    // Check if postponement is allowed
    if (!postponementPolicy.allowPostponement) {
      this.validationErrors.push('Postponement is not allowed for this event');
      return false;
    }

    return true;
  }

  /**
   * Validate postponement request data
   */
  validatePostponementData(event, postponementData) {
    // Check if postponement data is provided
    if (!postponementData) {
      this.validationErrors.push('Postponement data is required');
      return false;
    }

    // Validate reason
    if (!postponementData.reason || postponementData.reason.trim().length === 0) {
      this.validationErrors.push('Postponement reason is required');
      return false;
    }

    // Validate new dates if provided
    if (postponementData.newDates) {
      if (!postponementData.newDates.startDate || !postponementData.newDates.endDate) {
        this.validationErrors.push('Both start and end dates are required for new dates');
        return false;
      }

      // Check if new dates are in the future
      const newStartDate = new Date(postponementData.newDates.startDate);
      const newEndDate = new Date(postponementData.newDates.endDate);

      if (newStartDate <= new Date()) {
        this.validationErrors.push('New start date must be in the future');
        return false;
      }

      if (newEndDate < newStartDate) {
        this.validationErrors.push('New end date must be on or after start date');
        return false;
      }
    }

    // Validate location based on event mode
    if (postponementData.newLocation) {
      if (event.eventMode === 'online') {
        this.validationWarnings.push('New location provided for online event - this will be ignored');
      }
    }

    // Validate meeting details for online/hybrid events
    if (postponementData.newMeetingDetails) {
      if (event.eventMode === 'online' || event.eventMode === 'hybrid') {
        if (!postponementData.newMeetingDetails.meetingPlatform) {
          this.validationErrors.push('Meeting platform is required for online/hybrid events');
          return false;
        }
        if (!postponementData.newMeetingDetails.meetingLink) {
          this.validationErrors.push('Meeting link is required for online/hybrid events');
          return false;
        }
      } else {
        this.validationWarnings.push('Meeting details provided for offline event - this will be ignored');
      }
    }

    return true;
  }

  /**
   * Validate timing constraints based on policy
   */
  validateTimingConstraints(event, postponementData) {
    const postponementPolicy = event.policies.eventPostponement;
    const currentDate = new Date();
    const eventStartDate = new Date(event.startDate);

    // Check notice required
    if (postponementPolicy.noticeRequired && postponementPolicy.noticeRequired > 0) {
      const daysUntilEvent = Math.ceil((eventStartDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysUntilEvent < postponementPolicy.noticeRequired) {
        this.validationErrors.push(
          `Minimum ${postponementPolicy.noticeRequired} days notice required. Event is in ${daysUntilEvent} days.`
        );
        return false;
      }
    }

    // Check max postponement duration if new dates provided
    if (postponementData.newDates && postponementPolicy.maxPostponementDuration) {
      const newStartDate = new Date(postponementData.newDates.startDate);
      const daysDifference = Math.ceil((newStartDate - currentDate) / (1000 * 60 * 60 * 24));

      if (daysDifference > postponementPolicy.maxPostponementDuration) {
        this.validationErrors.push(
          `Cannot postpone more than ${postponementPolicy.maxPostponementDuration} days. Requested postponement is ${daysDifference} days.`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Validate refund constraints based on policy
   */
  validateRefundConstraints(event, postponementData) {
    const postponementPolicy = event.policies.eventPostponement;

    // Check if refund is offered when not allowed
    if (postponementData.refundOffered && !postponementPolicy.offerRefundOnPostponement) {
      this.validationErrors.push('Refunds on postponement are not allowed for this event');
      return false;
    }

    // Check refund percentage constraints
    if (postponementData.refundOffered && postponementData.refundPercentage) {
      if (postponementData.refundPercentage > postponementPolicy.refundPercentageOnPostponement) {
        this.validationErrors.push(
          `Refund percentage cannot exceed ${postponementPolicy.refundPercentageOnPostponement}%`
        );
        return false;
      }

      if (postponementData.refundPercentage < 0 || postponementData.refundPercentage > 100) {
        this.validationErrors.push('Refund percentage must be between 0% and 100%');
        return false;
      }
    }

    return true;
  }

  /**
   * Validate speaker constraints based on policy
   */
  validateSpeakerConstraints(event, postponementData) {
    const postponementPolicy = event.policies.eventPostponement;

    // Check if speakers can cancel on postponement
    if (postponementData.allowSpeakersToCancel && !postponementPolicy.allowSpeakersToCancelOnPostponement) {
      this.validationWarnings.push('Speakers cannot cancel on postponement for this event');
      // This is a warning, not an error
    }

    return true;
  }

  /**
   * Get validation result
   */
  getValidationResult() {
    return {
      canPostpone: this.validationErrors.length === 0,
      errors: this.validationErrors,
      warnings: this.validationWarnings,
      timestamp: new Date()
    };
  }

  /**
   * Get available postponement options based on policies
   */
  getPostponementOptions(event) {
    const postponementPolicy = event.policies?.eventPostponement;
    
    if (!postponementPolicy || !postponementPolicy.allowPostponement) {
      return null;
    }

    const currentDate = new Date();
    const eventStartDate = new Date(event.startDate);
    const daysUntilEvent = Math.ceil((eventStartDate - currentDate) / (1000 * 60 * 60 * 24));

    return {
      canPostpone: daysUntilEvent >= (postponementPolicy.noticeRequired || 0),
      noticeRequired: postponementPolicy.noticeRequired || 0,
      maxPostponementDuration: postponementPolicy.maxPostponementDuration || 365,
      offerRefundOnPostponement: postponementPolicy.offerRefundOnPostponement || false,
      maxRefundPercentage: postponementPolicy.refundPercentageOnPostponement || 0,
      allowSpeakersToCancel: postponementPolicy.allowSpeakersToCancelOnPostponement || false,
      ticketsValidForNewDate: postponementPolicy.ticketsValidForNewDate || false,
      postponementConditions: postponementPolicy.postponementConditions || [],
      daysUntilEvent: daysUntilEvent
    };
  }
}

export default new PostponementValidationService();
