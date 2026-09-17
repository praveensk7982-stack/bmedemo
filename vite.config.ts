import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

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
                const otp = Math.floor(100000 + Math.random() * 900000).toString()
                const expiresAt = Date.now() + 5 * 60 * 1000
                otpStore.set(email.toLowerCase().trim(), { otp, expiresAt })

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
                  to: email.trim(),
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
                return res.end(JSON.stringify({ success: true, message: `Verification code sent to ${email}. Code expires in 5 minutes.` }))
              } catch (err: any) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: false, message: err.message || 'Failed to send OTP email.' }))
              }
            })
            return
          }

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
                  return res.end(JSON.stringify({ success: false, message: 'No OTP requested for this email. Please click Resend OTP.' }))
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

          next()
        })
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
