export const mailOptions = (email, firstName, username, activationLink) => {
    return {
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Invitation to Activate Your Account',
        html: `
           <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Activation</title>
            <style>
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #1F2937;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 0;
                    background-color: #F3F4F6;
                }
                
                .email-wrapper {
                    padding: 20px;
                }
                
                .email-container {
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }
                
                .email-header {
                    background: linear-gradient(90deg, #94152b 0%, #94152b 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .email-header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.025em;
                }
                
                .email-body {
                    padding: 40px 30px;
                }
                
                .greeting {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 16px;
                }
                
                .message {
                    font-size: 16px;
                    color: #4B5563;
                    margin-bottom: 24px;
                }
                
                .button-container {
                    text-align: center;
                    margin: 36px 0;
                }
                
                .button {
                    display: inline-block;
                    background: linear-gradient(90deg, #94152b 0%, #94152b 100%);
                    color: #fff !important;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }
            
                .expiry-note {
                    background-color: #F9FAFB;
                    border-left: 4px solid #9CA3AF;
                    padding: 12px 16px;
                    margin: 24px 0;
                    font-size: 14px;
                    color: #6B7280;
                    border-radius: 4px;
                }
                
                .link-fallback {
                    background-color: #F9FAFB;
                    border-radius: 6px;
                    padding: 12px;
                    margin-top: 16px;
                    word-break: break-all;
                    font-size: 13px;
                    color: #6B7280;
                    border: 1px solid #E5E7EB;
                }
                
                .signature {
                    margin-top: 32px;
                    font-weight: 500;
                }
                
                .email-footer {
                    text-align: center;
                    font-size: 13px;
                    color: #9CA3AF;
                    padding: 20px 30px 30px;
                    border-top: 1px solid #E5E7EB;
                }
                
                @media only screen and (max-width: 480px) {
                    .email-body {
                        padding: 30px 20px;
                    }
                    
                    .button {
                        display: block;
                        text-align: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="email-container">
                    <div class="email-header">
                        <h1>Activate Your Account</h1>
                    </div>
                    <div class="email-body">
                        <p class="greeting">Hello ${firstName || 'there'},</p>
                        <p class="message">You've been chosen to be a part of the Learning Resources Center. We're excited to have you on our community! To get started, please activate your account by clicking the button below. Your username for this account is <strong>${username}</strong>.</p>
                        
                        <div class="button-container">
                            <a href="${activationLink}" class="button">Activate Your Account</a>
                        </div>
                        
                        <div class="expiry-note">
                            <strong>Note:</strong> This invitation link will expire in 24 hours for security reasons. Please do not share this link to anyone.
                        </div>
                        
                        <p class="message">If the button above doesn't work, you can copy and paste this link into your browser:</p>
                        <div class="link-fallback">
                            ${activationLink}
                        </div>
                        
                        <p class="signature">Welcome to CLA's Learning Resources Center!<br>CLA LRC Staff</p>
                    </div>
                    <div class="email-footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} College of Liberal Arts - Learning Resources Center. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `,
    };
};