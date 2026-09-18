import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const key = email.toLowerCase().trim();

    const { data: record, error: fetchError } = await supabase
      .from('otp_store')
      .select('*')
      .eq('email', key)
      .single();

    if (fetchError || !record) {
      return res.status(400).json({
        success: false,
        message: 'No OTP requested for this email address. Please click "Resend OTP".'
      });
    }

    if (Date.now() > record.expires_at) {
      await supabase.from('otp_store').delete().eq('email', key);
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

    await supabase.from('otp_store').delete().eq('email', key);
    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Verification failed.' });
  }
}