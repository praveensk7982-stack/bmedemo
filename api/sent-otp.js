import nodemailer from 'nodemailer';

const otpStore = global.otpStore || new Map();
global.otpStore = otpStore;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });

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
      to: email.trim(),
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