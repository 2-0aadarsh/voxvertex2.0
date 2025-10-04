import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Check if email credentials are available
const hasEmailCredentials = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

console.log("📧 SMTP Host:", process.env.SMTP_HOST ? "✅ Present" : "❌ Missing");
console.log("📧 SMTP User:", process.env.SMTP_USER ? "✅ Present" : "❌ Missing");
console.log("📧 SMTP Pass:", process.env.SMTP_PASS ? "✅ Present" : "❌ Missing");

let transporter = null;

if (hasEmailCredentials) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log("✅ Email transporter initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize email transporter:", error);
  }
} else {
  console.warn("⚠️ Email credentials missing. Using mock email service.");
}

export async function sendConfirmationEmail(registration, event) {
  const { registrant } = registration;

  // If email service is not available, use mock
  if (!transporter) {
    console.log("🎭 Mock email sent to:", registrant.email);
    console.log("📧 Subject: Registration confirmed for", event.eventName);
    console.log("📧 Amount: ₹", registration.totalAmount);
    return Promise.resolve({ messageId: `mock_${Date.now()}` });
  }

  try {
    const html = `
      <h2>Registration Confirmed</h2>
      <p>Hello ${registrant.name},</p>
      <p>You are registered for <strong>${event.eventName}</strong> happening on ${new Date(event.startDate).toLocaleDateString()}.</p>
      ${event.eventMode === "online" ? `<p>Join link: ${event.eventUrl}</p>` : ""}
      ${event.eventMode === "offline" ? `<p>Venue: ${event.location}</p>` : ""}
      <p>Amount Paid: ₹${registration.totalAmount}</p>
      <p>Registration ID: ${registration._id}</p>
    `;

    console.log("📧 Sending confirmation email to:", registrant.email);
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@voxvertex.com",
      to: registrant.email,
      subject: `Registration confirmed for ${event.eventName}`,
      html
    });
    
    console.log("✅ Confirmation email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
    // Don't throw error - registration should still succeed even if email fails
    return Promise.resolve({ messageId: `failed_${Date.now()}` });
  }
}
