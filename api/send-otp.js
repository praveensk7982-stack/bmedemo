import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const { error: dbError } = await supabase
      .from('otp_store')
      .upsert({ email: normalizedEmail, otp, expires_at: expiresAt });

    if (dbError) {
      throw new Error('Database error: ' + dbError.message);
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `"CareMesh Health" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Your CareMesh Verification Code',
      text: `Your CareMesh verification code is: ${otp}\n\nThis code will expire in 5 minutes.`,
      html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: auto;">
        <h2>Your CareMesh Verification Code</h2>
        <p>Your 6-digit verification code is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}