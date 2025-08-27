export interface EmailVerificationTemplateData {
  userName: string;
  verificationUrl: string;
}

export const emailVerificationTemplate = {
  subject: 'Welcome! Please verify your email address',

  generateText: (data: EmailVerificationTemplateData): string => {
    return `Hello ${data.userName},

Welcome to Pet Social Media! 

To complete your registration, please verify your email address by clicking on the following link:
${data.verificationUrl}

This link will expire in 1 hour for security reasons.

If you did not create an account, please ignore this email.

Best regards,
Pet Social Media Team`;
  },

  generateHtml: (data: EmailVerificationTemplateData): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a90e2;">Pet Social Media</h1>
    </div>
    
    <h2 style="color: #333;">Welcome, ${data.userName}!</h2>
    
    <p>Thank you for joining Pet Social Media! To complete your registration and start connecting with fellow pet lovers, please verify your email address.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${data.verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify My Email Address
        </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
        <strong>Important:</strong> This verification link will expire in 1 hour for security reasons.
    </p>
    
    <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        <a href="${data.verificationUrl}" style="color: #4a90e2;">${data.verificationUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px;">
        If you did not create an account with Pet Social Media, please ignore this email.
        <br><br>
        Best regards,<br>
        The Pet Social Media Team
    </p>
</body>
</html>`;
  },
};
