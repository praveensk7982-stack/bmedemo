import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null

const otpStore = new Map()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    {
      name: 'api-otp-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Endpoint 1: Send OTP
          if (req.url === '/api/send-otp' && req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const { email } = JSON.parse(body || '{}')
                if (!email || !email.includes('@')) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'Invalid email address.' }))
                }
                const normalizedEmail = email.toLowerCase().trim()
                const otp = Math.floor(100000 + Math.random() * 900000).toString()
                const expiresAt = Date.now() + 5 * 60 * 1000
                otpStore.set(normalizedEmail, { otp, expiresAt })

                const transporter = nodemailer.createTransport({
                  host: 'smtp.gmail.com',
                  port: 465,
                  secure: true,
                  auth: {
                    user: process.env.EMAIL_USER || 'praveen.sk.7982@gmail.com',
                    pass: process.env.EMAIL_APP_PASSWORD || 'jidvgeqwskqosafa'
                  }
                })

                await transporter.sendMail({
                  from: `"Hospivio Health" <${process.env.EMAIL_USER || 'praveen.sk.7982@gmail.com'}>`,
                  to: normalizedEmail,
                  subject: 'Your Hospivio Verification Code',
                  text: `Your Hospivio verification code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please ignore this email.`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #cdeade; border-radius: 12px; background: #fff;">
                      <div style="background: #16a3ae; padding: 15px; text-align: center; color: white; border-radius: 8px;">
                        <h2 style="margin:0;">Hospivio Verification Code</h2>
                      </div>
                      <div style="padding: 20px; color: #333;">
                        <p>Hello,</p>
                        <p>Your 6-digit verification code is:</p>
                        <div style="background: #f0f7f9; border: 2px dashed #16a3ae; padding: 15px; text-align: center; border-radius: 8px; margin: 15px 0;">
                          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0d6e7d;">${otp}</span>
                        </div>
                        <p style="color: #e11d48; font-size: 13px; font-weight: bold;">⏱️ Note: This verification code will expire in 5 minutes.</p>
                        <p style="font-size: 12px; color: #666;">If you did not request this verification code, please ignore this email.</p>
                      </div>
                    </div>
                  `
                })

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: true, message: `Verification code sent to ${normalizedEmail}. Code expires in 5 minutes.` }))
              } catch (err: any) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: err.message || 'Failed to send OTP email.' }))
              }
            })
            return
          }

          // Endpoint 2: Verify OTP
          if (req.url === '/api/verify-otp' && req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                const { email, otp } = JSON.parse(body || '{}')
                if (!email || !otp) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'Email and OTP code are required.' }))
                }

                const key = email.toLowerCase().trim()
                const record = otpStore.get(key)

                if (!record) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'No OTP requested for this email. Please click Resend Code.' }))
                }

                if (Date.now() > record.expiresAt) {
                  otpStore.delete(key)
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'OTP code has expired (valid for 5 minutes). Please request a new code.' }))
                }

                if (record.otp !== otp.trim()) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'Incorrect 6-digit verification code. Please check your email and try again.' }))
                }

                otpStore.delete(key)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: true, message: 'OTP verified successfully.' }))
              } catch (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: 'Server verification error.' }))
              }
            })
            return
          }

          // Endpoint 3: Register Patient Row in Supabase
          if (req.url === '/api/register-patient' && req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const { fullName, mobileNumber, email, password } = JSON.parse(body || '{}')
                if (!email || !password || password.length < 6) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'Valid email and password (min 6 chars) required.' }))
                }

                const normalizedEmail = email.toLowerCase().trim()
                const cleanedMobile = mobileNumber ? mobileNumber.replace(/[^\d]/g, '') : ''
                const passwordHash = bcrypt.hashSync(password, 10)

                if (supabase) {
                  console.log(`[Supabase Dev Insert] Registering: ${normalizedEmail}`)
                  const { data, error } = await supabase
                    .from('patients')
                    .insert([
                      {
                        full_name: fullName ? fullName.trim() : normalizedEmail.split('@')[0],
                        mobile_number: cleanedMobile,
                        email: normalizedEmail,
                        password_hash: passwordHash,
                        email_verified: true
                      }
                    ])
                    .select()

                  if (error) {
                    console.error('[Supabase Dev Insert Error]:', JSON.stringify(error, null, 2))
                    res.statusCode = error.code === '23505' ? 400 : 500
                    res.setHeader('Content-Type', 'application/json')
                    return res.end(JSON.stringify({
                      success: false,
                      message: error.code === '23505'
                        ? 'An account with this email address already exists. Please login instead.'
                        : 'Database registration failed: ' + error.message,
                      supabaseError: error
                    }))
                  }

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: true, message: 'Patient registered in Supabase.', patient: data[0] }))
                } else {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: true, message: 'Patient registered locally.', patient: { full_name: fullName, email: normalizedEmail } }))
                }
              } catch (err: any) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: err.message || 'Registration failed.' }))
              }
            })
            return
          }

          // Endpoint 4: Patient Login
          if (req.url === '/api/patient-login' && req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const { email, mobileNumber, password, loginMethod } = JSON.parse(body || '{}')
                const cleanedMobile = mobileNumber ? mobileNumber.replace(/[^\d]/g, '') : ''
                const normalizedEmail = email ? email.toLowerCase().trim() : ''

                if (!password) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'Password is required.' }))
                }

                if (supabase) {
                  let query = supabase.from('patients').select('*')
                  if (loginMethod === 'mobile') {
                    if (!cleanedMobile) {
                      res.statusCode = 400
                      res.setHeader('Content-Type', 'application/json')
                      return res.end(JSON.stringify({ success: false, message: 'Mobile phone number is required.' }))
                    }
                    query = query.eq('mobile_number', cleanedMobile)
                  } else {
                    if (!normalizedEmail) {
                      res.statusCode = 400
                      res.setHeader('Content-Type', 'application/json')
                      return res.end(JSON.stringify({ success: false, message: 'Email address is required.' }))
                    }
                    query = query.eq('email', normalizedEmail)
                  }

                  const { data: patients, error } = await query

                  if (error) {
                    console.error('[Supabase Dev Select Error]:', JSON.stringify(error, null, 2))
                    res.statusCode = 500
                    res.setHeader('Content-Type', 'application/json')
                    return res.end(JSON.stringify({ success: false, message: 'Database query failed: ' + error.message, supabaseError: error }))
                  }

                  if (!patients || patients.length === 0) {
                    res.statusCode = 404
                    res.setHeader('Content-Type', 'application/json')
                    return res.end(JSON.stringify({
                      success: false,
                      message: loginMethod === 'mobile'
                        ? 'No account found with this mobile number. Please click "Create Account".'
                        : 'No account found with this email address. Please click "Create Account".'
                    }))
                  }

                  const patient = patients[0]
                  const isMatch = bcrypt.compareSync(password, patient.password_hash)

                  if (!isMatch) {
                    res.statusCode = 401
                    res.setHeader('Content-Type', 'application/json')
                    return res.end(JSON.stringify({ success: false, message: 'Incorrect password. Please check your password and try again.' }))
                  }

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({
                    success: true,
                    message: 'Login successful.',
                    patient: { id: patient.id, fullName: patient.full_name, email: patient.email, mobileNumber: patient.mobile_number }
                  }))
                } else {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: true, message: 'Fallback local auth active.' }))
                }
              } catch (err: any) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: err.message || 'Login failed.' }))
              }
            })
            return
          }

          // Endpoint 5: Reset Password
          if (req.url === '/api/reset-password' && req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const { email, newPassword } = JSON.parse(body || '{}')
                if (!email || !newPassword || newPassword.length < 6) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: false, message: 'Valid email and new password (minimum 6 characters) required.' }))
                }

                const normalizedEmail = email.toLowerCase().trim()
                const passwordHash = bcrypt.hashSync(newPassword, 10)

                if (supabase) {
                  console.log(`[Supabase Reset Password] Updating password hash for: ${normalizedEmail}`)
                  const { data, error } = await supabase
                    .from('patients')
                    .update({ password_hash: passwordHash })
                    .eq('email', normalizedEmail)
                    .select()

                  if (error) {
                    console.error('[Supabase Reset Password Error]:', JSON.stringify(error, null, 2))
                    res.statusCode = 500
                    res.setHeader('Content-Type', 'application/json')
                    return res.end(JSON.stringify({ success: false, message: 'Database password update failed: ' + error.message, supabaseError: error }))
                  }

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: true, message: 'Password reset successfully in Supabase.', patient: data ? data[0] : null }))
                } else {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: true, message: 'Password reset locally.' }))
                }
              } catch (err: any) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: err.message || 'Password reset failed.' }))
              }
            })
            return
          }

          next()
        })
      }
    }
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})