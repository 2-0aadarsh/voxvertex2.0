const emailTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 20px;
    }
    .otp-box {
      display: block;
      width: 85%;
      text-align: center;
      background-color: #ff6b35;
      color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      font-size: 32px;
      font-weight: bold;
      margin: 20px auto;
      letter-spacing: 5px;
    }
    .security-tip {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #333;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      Voxvertex
    </div>
    <div class="content">
      <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
      <p>Hi [User],</p>
      <p>Thank you for signing up! Use the OTP below to verify your email address:</p>
      <div class="otp-box">
        ${otp}
      </div>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <div class="security-tip">
        <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Security Tip:</strong> Never share this OTP with anyone. VoxVertex will never ask for your OTP.</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">Copyright © 2024 Voxvertex Solutions. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const passwordResetEmailTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 10px 0;
    }
    .header h1 {
      color: #333333;
      font-size: 24px;
    }
    .content {
      margin: 20px 0;
      line-height: 1.6;
      color: #555555;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #777777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello [User],</p>
      <p>We received a request to reset your password for your [Your App Name] account. Click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>If you didn’t request this, you can safely ignore this email. Your password will not be changed.</p>
      <p>For your security, this link will expire in 1 hour from now.</p>
    </div>
    <div class="footer">
      <p>&copy; [Your App Name] | All rights reserved</p>
    </div>
  </div>
</body>
</html>
`;

const contactUsEmailTemplate = (userName, userEmail, message) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>New Contact Us Message</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 650px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
      }
      .header {
        background: #2563eb;
        color: #ffffff;
        text-align: center;
        padding: 20px 15px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 25px;
        color: #333333;
        line-height: 1.6;
      }
      .content p {
        margin: 8px 0;
      }
      .highlight {
        font-weight: bold;
        color: #111827;
      }
      .message-box {
        margin-top: 15px;
        padding: 15px;
        background: #f9fafb;
        border-left: 4px solid #2563eb;
        border-radius: 6px;
        font-style: italic;
        color: #444;
      }
      .footer {
        background: #f1f5f9;
        padding: 15px;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Contact Request</h1>
      </div>
      <div class="content">
        <p>Hello <span class="highlight">Admin</span>,</p>
        <p>You’ve received a new message from the Contact Us form.</p>
        
        <p><span class="highlight">Name:</span> ${userName}</p>
        <p><span class="highlight">Email:</span> ${userEmail}</p>
        
        <div class="message-box">
          ${message}
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Chittchat — Contact Us Notification
      </div>
    </div>
  </body>
  </html>
  `;
};

const passwordResetLinkTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Reset Link</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 20px;
    }
    .reset-button {
      display: inline-block;
      background-color: #ff6b35;
      color: #ffffff;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .reset-button:hover {
      background-color: #e55a2b;
    }
    .security-tip {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #333;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      Voxvertex
    </div>
    <div class="content">
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      <p>Hello [User],</p>
      <p>You requested to reset your password. Click the button below to reset your password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="reset-button">Reset Password</a>
      </div>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <div class="security-tip">
        <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Security Tip:</strong> Never share this link with anyone. Voxvertex will never ask for your password reset link.</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2024 Voxvertex. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const passwordResetOTPTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Reset OTP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 20px;
    }
    .otp-box {
      display: block;
      width: 85%;
      text-align: center;
      background-color: #ff6b35;
      color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      font-size: 32px;
      font-weight: bold;
      margin: 20px auto;
      letter-spacing: 5px;
    }
    .security-tip {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #333;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      Voxvertex
    </div>
    <div class="content">
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      <p>Hello [User],</p>
      <p>You requested to reset your password. Use the following OTP to verify your identity:</p>
      <div class="otp-box">
        ${otp}
      </div>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <div class="security-tip">
        <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Security Tip:</strong> Never share this OTP with anyone. Voxvertex will never ask for your OTP.</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2024 Voxvertex. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const passwordChangedTemplate = () => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Changed Successfully</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .security-notice {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #333;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      Voxvertex
    </div>
    <div class="content">
      <h2 style="color: #333; margin-bottom: 20px;">Password Changed Successfully</h2>
      <p>Hello [User],</p>
      <p>Your password has been successfully changed on [Date].</p>
      <div class="security-notice">
        <p style="color: #155724; margin: 0; font-size: 14px;"><strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately.</p>
      </div>
      <p>You can now log in with your new password.</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2024 Voxvertex. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const eventRegistrationConfirmationTemplate = (eventData, ticketData, userData) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Registration Confirmation</title>
  <style>
    /* Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      -webkit-text-size-adjust: 100%;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      overflow: hidden;
    }
    
    /* Header Section */
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 30px 20px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff6b35;
      font-weight: bold;
      font-size: 20px;
    }
    
    .brand-name {
      font-size: 24px;
      font-weight: bold;
    }
    
    .brand-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    
    /* Content Section */
    .content {
      padding: 30px;
    }
    
    .confirmation-icon {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .confirmation-icon .icon {
      width: 60px;
      height: 60px;
      background: #ff6b35;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 24px;
    }
    
    .success-title {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .success-message {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }
    
    /* TICKET SECTION - EXACT MATCH TO FIGMA DESIGN */
    .ticket-section {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      padding: 25px;
      margin-bottom: 30px;
    }
    
    .ticket-item {
      margin-bottom: 18px;
    }
    
    .ticket-item:last-child {
      margin-bottom: 0;
    }
    
    .ticket-label {
      font-weight: bold;
      color: #333;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .ticket-value {
      color: #666;
      font-size: 16px;
    }
    
    .ticket-event {
      margin-bottom: 12px;
    }
    
    .ticket-event .ticket-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    
    .ticket-organizer {
      margin-bottom: 20px;
    }
    
    .ticket-organizer .ticket-value {
      font-size: 14px;
      color: #666;
    }
    
    /* CTA Section */
    .cta-section {
      background: #ffffff;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin-bottom: 25px;
      border: 1px solid #e0e0e0;
    }
    
    .cta-title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .cta-description {
      color: #666;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .cta-button {
      display: inline-block;
      background: #ff6b35;
      color: #ffffff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      transition: background-color 0.3s;
      margin-top: 10px;
    }
    
    .cta-button:hover {
      background: #e55a2b;
    }
    
    /* Next Steps Section */
    .next-steps {
      background: #ffffff;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      border: 1px solid #e0e0e0;
    }
    
    .next-steps-title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
    }
    
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .step-item:last-child {
      margin-bottom: 0;
    }
    
    .step-number {
      width: 30px;
      height: 30px;
      background: #ff6b35;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .step-content {
      flex: 1;
    }
    
    .step-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    
    .step-description {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
    
    /* Help Section */
    .help-section {
      text-align: center;
      margin-bottom: 25px;
    }
    
    .help-text {
      color: #666;
      margin-bottom: 10px;
    }
    
    .contact-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    
    .contact-link {
      color: #ff6b35;
      text-decoration: none;
    }
    
    /* Footer - Exact match to Figma design */
    .footer {
      background: #f9f9f9;
      color: #666;
      text-align: center;
      padding: 30px 20px;
      border-top: 1px solid #e0e0e0;
    }
    
    .footer-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .footer-logo {
      width: 30px;
      height: 30px;
      background: #ff6b35;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: bold;
      font-size: 16px;
    }
    
    .footer-brand-name {
      font-weight: bold;
      color: #333;
      font-size: 18px;
    }
    
    .footer-description {
      font-size: 14px;
      margin-bottom: 20px;
      line-height: 1.5;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    
    .footer-link {
      color: #666;
      text-decoration: none;
      font-size: 14px;
    }
    
    .footer-link-separator {
      color: #ccc;
    }
    
    .copyright {
      font-size: 12px;
      color: #999;
    }
    
    /* Mobile Responsive Styles */
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px;
      }
      
      .header {
        padding: 25px 15px;
      }
      
      .success-title {
        font-size: 24px;
      }
      
      .ticket-section {
        padding: 20px;
      }
      
      .cta-section, .next-steps {
        padding: 20px;
      }
      
      .cta-button {
        display: block;
        width: 100%;
        text-align: center;
      }
      
      .step-item {
        flex-direction: column;
        gap: 10px;
      }
      
      .step-number {
        align-self: flex-start;
      }
      
      .contact-links {
        flex-direction: column;
        gap: 10px;
      }
      
      .footer {
        padding: 25px 15px;
      }
      
      .footer-links {
        flex-direction: column;
        gap: 8px;
      }
      
      .footer-link-separator {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <div class="logo-icon">V</div>
        <div class="brand-name">Voxvertex</div>
      </div>
      <div class="brand-subtitle">Complete Event Management Platform</div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Confirmation Icon -->
      <div class="confirmation-icon">
        <div class="icon">✓</div>
      </div>

      <!-- Success Message -->
      <div class="success-title">Payment Confirmed!</div>
      <div class="success-message">
        Your registration for <strong>${eventData.eventName}</strong> has been successfully processed.
      </div>

      <!-- TICKET SECTION - EXACT MATCH TO FIGMA DESIGN -->
      <div class="ticket-section">
        <div class="ticket-item ticket-event">
          <div class="ticket-label">Conference</div>
          <div class="ticket-value">${eventData.eventName}</div>
        </div>
        
        <div class="ticket-item ticket-organizer">
          <div class="ticket-label">Organized by</div>
          <div class="ticket-value">${eventData.organizerName}</div>
        </div>
        
        <div class="ticket-item">
          <div class="ticket-label">Date</div>
          <div class="ticket-value">${eventData.eventDate}</div>
        </div>
        
        <div class="ticket-item">
          <div class="ticket-label">Location</div>
          <div class="ticket-value">${eventData.eventLocation}</div>
        </div>
        
        <div class="ticket-item">
          <div class="ticket-label">Time</div>
          <div class="ticket-value">${eventData.eventTime}</div>
        </div>
        
        <div class="ticket-item">
          <div class="ticket-label">Attendee</div>
          <div class="ticket-value">${userData.name}</div>
        </div>
        
        <div class="ticket-item">
          <div class="ticket-label">Ticket ID</div>
          <div class="ticket-value">VV-2025-${eventData.eventId.slice(-6).toUpperCase()}</div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <div class="cta-title">Access Your Event Dashboard</div>
        <div class="cta-description">
          Use Voxvertex's complete event management platform to view the agenda, connect with speakers and other attendees, and manage your event experience.
        </div>
        <a href="https://voxvertex.com/dashboard" class="cta-button">
          Open Voxvertex Platform
        </a>
      </div>

      <!-- Next Steps -->
      <div class="next-steps">
        <div class="next-steps-title">What's Next?</div>
        
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Explore Event Content</div>
            <div class="step-description">Access the full event agenda, speaker profiles, and session details through your dashboard.</div>
          </div>
        </div>
        
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Network & Connect</div>
            <div class="step-description">Connect with speakers and other attendees using our integrated networking tools.</div>
          </div>
        </div>
        
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Manage Your Experience</div>
            <div class="step-description">Use our complete event management tools for scheduling, notifications, and personalized content.</div>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <div class="help-text">Need help? Contact us at</div>
        <div class="contact-links">
          <a href="mailto:support@voxvertex.com" class="contact-link">support@voxvertex.com</a>
          <a href="tel:+15551234567" class="contact-link">+1 (555) 123-4567</a>
        </div>
      </div>
    </div>

    <!-- Footer - Exact match to Figma design -->
    <div class="footer">
      <div class="footer-brand">
        <div class="footer-logo">V</div>
        <span class="footer-brand-name">Voxvertex</span>
      </div>
      <div class="footer-description">
        Complete event management platform connecting organizers, speakers, and audience worldwide.
      </div>
      <div class="footer-links">
        <a href="#" class="footer-link">Privacy Policy</a>
        <span class="footer-link-separator">•</span>
        <a href="#" class="footer-link">Terms of Service</a>
        <span class="footer-link-separator">•</span>
        <a href="#" class="footer-link">Unsubscribe</a>
      </div>
      <div class="copyright">
        © 2025 Voxvertex. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;

export { emailTemplate, passwordResetEmailTemplate, contactUsEmailTemplate, passwordResetLinkTemplate, passwordResetOTPTemplate, passwordChangedTemplate, eventRegistrationConfirmationTemplate };
