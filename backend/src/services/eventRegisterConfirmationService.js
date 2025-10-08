import dotenv from "dotenv";
import { sendEventRegistrationConfirmation } from "./email.service.js";
import transporter from "../configs/nodemailer.config.js";
dotenv.config();

// Check if email credentials are available using the same config as main email service
const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

console.log("📧 Email Service:", process.env.EMAIL_SERVICE ? "✅ Present" : "❌ Missing");
console.log("📧 Email User:", process.env.EMAIL_USER ? "✅ Present" : "❌ Missing");
console.log("📧 Email Pass:", process.env.EMAIL_PASSWORD ? "✅ Present" : "❌ Missing");

export async function sendConfirmationEmail(registration, event) {
  const { registrant } = registration;

  // If email service is not available, use mock
  if (!hasEmailCredentials) {
    console.log("🎭 Mock email sent to:", registrant.email);
    console.log("📧 Subject: Registration confirmed for", event.eventName);
    console.log("📧 Amount: ₹", registration.totalAmount);
    return Promise.resolve({ messageId: `mock_${Date.now()}` });
  }

  try {
    // Debug: Log the event object structure
    console.log("🔍 Event object received:", JSON.stringify(event, null, 2));
    
    // Format event data for email template
    const eventData = {
      eventName: event.eventName || 'Event Name Not Available',
      eventId: event._id ? event._id.toString() : 'unknown',
      format: event.format || 'Event',
      eventDate: event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : 'Date Not Available',
      eventTime: event.startDate ? new Date(event.startDate).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }) : 'Time Not Available',
      eventLocation: event.eventMode === 'online' ? 'Online' :
                     event.eventMode === 'hybrid' ? `Hybrid - ${event.location || 'Location Not Available'}` :
                     event.location || 'Location Not Available',
      organizerName: event.organizer ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim() || 'Organizer Not Available' : 'Organizer Not Available'
    };

    // Debug: Log the registration object structure
    console.log("🔍 Registration object received:", JSON.stringify(registration, null, 2));
    
    // Format ticket data for email template
    const ticketData = {
      name: registration.ticketTier?.tierName || 'Event Ticket',
      price: `₹${(registration.totalAmount || 0).toLocaleString()}`
    };

    // Format user data for email template
    const userData = {
      name: registrant.name || 'User Name Not Available'
    };

    console.log("📧 Sending confirmation email to:", registrant.email);
    console.log("📧 Event data:", JSON.stringify(eventData, null, 2));
    console.log("📧 Ticket data:", JSON.stringify(ticketData, null, 2));
    console.log("📧 User data:", JSON.stringify(userData, null, 2));
    
    // Use the new email template service
    const result = await sendEventRegistrationConfirmation(
      registrant.email,
      `Registration Confirmed - ${event.eventName}`,
      eventData,
      ticketData,
      userData
    );
    
    console.log("✅ Confirmation email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
    // Don't throw error - registration should still succeed even if email fails
    return Promise.resolve({ messageId: `failed_${Date.now()}` });
  }
}
