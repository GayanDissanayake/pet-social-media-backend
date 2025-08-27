export interface PasswordResetTemplateData {
  userName: string;
  resetUrl: string;
}

export const passwordResetTemplate = {
  subject: 'Reset your Pet Social Media password',

  generateText: (data: PasswordResetTemplateData): string => {
    return `Hello ${data.userName},

You recently requested to reset your password for your Pet Social Media account.

To reset your password, please click on the following link:
${data.resetUrl}

This link will expire in 1 hour for security reasons.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
Pet Social Media Team`;
  },

  generateHtml: (data: PasswordResetTemplateData): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a90e2;">Pet Social Media</h1>
    </div>
    
    <h2 style="color: #333;">Password Reset Request</h2>
    
    <p>Hello ${data.userName},</p>
    
    <p>You recently requested to reset your password for your Pet Social Media account. To proceed with resetting your password, please click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset My Password
        </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
        <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
    </p>
    
    <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        <a href="${data.resetUrl}" style="color: #4a90e2;">${data.resetUrl}</a>
    </p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Security Note:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px;">
        This email was sent because a password reset was requested for your account.
        <br><br>
        Best regards,<br>
        The Pet Social Media Team
    </p>
</body>
</html>`;
  },
};
