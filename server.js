import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory OTP Store: Map<email, { otp, expiresAt }>
const otpStore = new Map();

// Configure Nodemailer Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Endpoint 1: Send OTP Email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in memory
    otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });

    // Send Email via Gmail SMTP
    const mailOptions = {
      from: `"CareMesh Health" <${process.env.EMAIL_USER}>`,
      to: email.trim(),
      subject: 'Your CareMesh Verification Code',
      text: `Your CareMesh verification code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #cdeade; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(140deg, #16a3ae 0%, #0e7c86 100%); padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700;">CareMesh Verification Code</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Better Care, Connected.</p>
          </div>
          <div style="padding: 28px 24px; color: #1e293b;">
            <p style="margin-top: 0; font-size: 14px;">Hello,</p>
            <p style="font-size: 14px; color: #475569;">Your 6-digit verification code for logging into CareMesh is:</p>
            <div style="background: #f0f7f9; border: 2px dashed #16a3ae; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d6e7d;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #e11d48; font-weight: 600; margin-bottom: 20px;">
              ⏱️ Note: This verification code will expire in 5 minutes.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">If you did not request this verification code, please ignore this email.</p>
          </div>
          <div style="background: #f8fafc; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © CareMesh Health Systems. All rights reserved.
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP Sent] ${otp} -> ${email}`);

    return res.json({ 
      success: true, 
      message: `Verification code sent to ${email}. Code expires in 5 minutes.` 
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send OTP email via SMTP.' 
    });
  }
});

// Endpoint 2: Verify OTP
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const key = email.toLowerCase().trim();
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP requested for this email address. Please click "Resend OTP".' 
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP code has expired. OTP is valid for 5 minutes only. Please request a new code.' 
      });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect verification code. Please check your email and try again.' 
      });
    }

    // OTP verified successfully -> remove from store
    otpStore.delete(key);
    return res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

app.listen(PORT, () => {
  console.log(`CareMesh Email OTP Server running on http://localhost:${PORT}`);
});
