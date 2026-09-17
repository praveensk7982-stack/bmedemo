const otpStore = global.otpStore || new Map();
global.otpStore = otpStore;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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

    otpStore.delete(key);
    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Verification failed.' });
  }
}