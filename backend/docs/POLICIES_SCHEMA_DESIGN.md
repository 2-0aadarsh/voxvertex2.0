# Enhanced Event Policies Schema Design

## Overview

The Enhanced Event model now includes a comprehensive and scalable policies schema that handles all types of event-related policies and terms. This design ensures data integrity, compliance validation, and optimal query performance.

## Schema Structure

### 1. Participant Refund Policy (`participantRefund`)

**Purpose**: Manages participant refund policies and conditions.

**Fields**:
- `allowRefunds` (Boolean, required): Whether refunds are allowed
- `refundDeadline` (Number, 0-365 days): Days before event when refunds are allowed
- `refundPercentage` (Number, 0-100%): Percentage of refund offered
- `processingFee` (Number, min: 0): Administrative fee for refunds
- `processingTime` (String, max: 200 chars): Description of processing time
- `allowEmergencyRefunds` (Boolean): Special emergency refund provision
- `emergencyConditions` (String, max: 1000 chars): Conditions for emergency refunds
- `refundConditions` (Array of Strings): Specific refund conditions

**Validation**: Conditional validation based on `allowRefunds` flag.

### 2. Speaker Cancellation Policy (`speakerCancellation`)

**Purpose**: Handles speaker cancellation terms and penalties.

**Fields**:
- `allowCancellation` (Boolean, required): Whether speakers can cancel
- `cancellationDeadline` (Number, 0-365 days): Days before event for cancellation
- `penaltyPercentage` (Number, 0-100%): Penalty for cancellation
- `requireReplacement` (Boolean): Whether replacement speaker is required
- `forceMajeureClause` (Boolean): Force majeure exception clause
- `paymentTerms` (String, max: 1000 chars): Payment terms for cancellations
- `speakerConditions` (Array of Strings): Specific speaker conditions

**Validation**: Conditional validation based on `allowCancellation` flag.

### 3. Event Cancellation Policy (`eventCancellation`)

**Purpose**: Manages organizer-initiated event cancellations.

**Fields**:
- `allowCancellation` (Boolean, required): Whether event can be cancelled
- `fullRefundDeadline` (Number, 0-365 days): Days for full refund eligibility
- `partialRefundDeadline` (Number, 0-365 days): Days for partial refund eligibility
- `partialRefundPercentage` (Number, 0-100%): Percentage for partial refunds
- `administrativeFee` (Number, min: 0): Fee for administrative costs
- `refundMethod` (String, max: 200 chars): Method of refund processing
- `processingTime` (String, max: 200 chars): Time frame for processing

**Validation**: Conditional validation based on `allowCancellation` flag.

### 4. Event Postponement Policy (`eventPostponement`)

**Purpose**: Handles event postponement terms and conditions.

**Fields**:
- `allowPostponement` (Boolean, required): Whether events can be postponed
- `noticeRequired` (Number, 0-365 days): Required notice period
- `maxPostponementDuration` (Number, 0-365 days): Maximum postponement period
- `ticketsValidForNewDate` (Boolean): Whether tickets remain valid
- `offerRefundOnPostponement` (Boolean): Refund option on postponement
- `refundPercentageOnPostponement` (Number, 0-100%): Refund percentage offered
- `postponementConditions` (Array of Strings): Specific postponement conditions

**Validation**: Conditional validation based on `allowPostponement` flag.

### 5. General Terms & Conditions (`generalTerms`)

**Purpose**: Overall terms and conditions for the event.

**Fields**:
- `generalTerms` (String, required, max: 5000 chars): Complete terms and conditions

**Validation**: Required field with minimum content validation.

### 6. Policy Metadata (`metadata`)

**Purpose**: Audit trail and compliance tracking.

**Fields**:
- `version` (String, default: "1.0"): Policy version tracking
- `lastUpdated` (Date): Last modification timestamp
- `updatedBy` (ObjectId): User who last updated policies
- `isCompliant` (Boolean): Compliance status
- `complianceNotes` (String, max: 1000 chars): Compliance notes

## Key Features

### 1. Conditional Validation
- Fields are validated only when their parent policy is enabled
- Smart validation prevents incomplete policy configurations
- Clear error messages for missing required fields

### 2. Data Integrity
- Comprehensive field validation with min/max constraints
- String length limits to prevent data bloat
- Required field enforcement for critical policies

### 3. Performance Optimization
- Strategic indexing for common query patterns
- Efficient nested object structure
- Minimal data redundancy

### 4. Audit & Compliance
- Automatic metadata updates on policy changes
- Compliance validation on every save
- Version tracking for policy evolution

## Database Indexes

```javascript
// Policy-specific indexes for efficient querying
enhancedEventSchema.index({ 'policies.metadata.isCompliant': 1 });
enhancedEventSchema.index({ 'policies.participantRefund.allowRefunds': 1 });
enhancedEventSchema.index({ 'policies.speakerCancellation.allowCancellation': 1 });
enhancedEventSchema.index({ 'policies.eventCancellation.allowCancellation': 1 });
enhancedEventSchema.index({ 'policies.eventPostponement.allowPostponement': 1 });
enhancedEventSchema.index({ 'policies.metadata.lastUpdated': -1 });
```

## Instance Methods

### `validatePolicies()`
Comprehensive validation of all policy configurations.
```javascript
const validation = event.validatePolicies();
// Returns: { isCompliant: boolean, errors: string[], notes: string[] }
```

### `getPolicySummary()`
Returns a condensed summary of policy configurations for display purposes.
```javascript
const summary = event.getPolicySummary();
// Returns: Object with policy highlights and compliance status
```

### `updatePolicyMetadata(updatedBy)`
Updates policy metadata and re-validates compliance.
```javascript
const validation = event.updatePolicyMetadata(userId);
// Returns: Updated validation results
```

## Static Methods

### `findByPolicyType(policyType, enabled)`
Find events with specific policy configurations.
```javascript
const refundEvents = EnhancedEvent.findByPolicyType('participantRefund', true);
```

### `findNonCompliantPolicies()`
Find events requiring policy attention.
```javascript
const nonCompliant = EnhancedEvent.findNonCompliantPolicies();
```

## Pre-save Middleware

### Policy Metadata Updates
- Automatically updates `lastUpdated` timestamp
- Re-validates compliance status
- Updates compliance notes

### Integration with Event Publishing
- Policy validation integrated into `canBePublished()` method
- Events cannot be published with non-compliant policies

## Scalability Considerations

### 1. Future Extensibility
- Modular policy structure allows easy addition of new policy types
- Metadata system supports version tracking and migration
- Flexible validation system accommodates new requirements

### 2. Performance
- Strategic indexing minimizes query time
- Nested structure reduces document size
- Efficient validation prevents unnecessary processing

### 3. Compliance
- Audit trail maintains policy change history
- Compliance validation ensures data integrity
- Version control supports regulatory requirements

## Usage Examples

### Creating an Event with Policies
```javascript
const event = new EnhancedEvent({
  // ... other event fields
  policies: {
    participantRefund: {
      allowRefunds: true,
      refundDeadline: 7,
      refundPercentage: 90,
      processingFee: 50,
      processingTime: "5-7 business days",
      allowEmergencyRefunds: true,
      emergencyConditions: "Medical emergencies, natural disasters",
      refundConditions: ["Valid reason required", "Documentation needed"]
    },
    generalTerms: "By registering for this event, you agree to..."
  }
});
```

### Validating Policies
```javascript
const validation = event.validatePolicies();
if (!validation.isCompliant) {
  console.log("Policy errors:", validation.errors);
}
```

### Querying Events by Policy Type
```javascript
// Find events that allow refunds
const refundableEvents = await EnhancedEvent.findByPolicyType('participantRefund', true);

// Find events with non-compliant policies
const problemEvents = await EnhancedEvent.findNonCompliantPolicies();
```

## Best Practices

1. **Always validate policies** before publishing events
2. **Use the metadata system** for audit trails
3. **Leverage indexes** for efficient querying
4. **Keep policy conditions concise** for better performance
5. **Regular compliance checks** using static methods

This schema design provides a robust, scalable, and maintainable foundation for managing event policies and terms while ensuring optimal performance and compliance.

