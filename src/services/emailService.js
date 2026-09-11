import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendContactEmail = async ({ to, name, email, subject, message }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `,
  })
}