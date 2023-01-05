import dotenv from 'dotenv'
dotenv.config()


// Twilio
export const accountSid = process.env.Account_SID
export const authToken = process.env.Auth_Token
export const fromAdminPhone = process.env.My_Twilio_phone_number



// Nodemailer
export const GMAIL_USER = process.env.GMAIL_USER
export const GMAIL_PASS = process.env.GMAIL_PASS
export const FromAdminMail = process.env.FromAdminMail as string
export const UserSubject = process.env.UserSubject!


// JWT Token
export const APP_SECRET = process.env.APP_SECRET as string


