import nodemailer from 'nodemailer';

export async function sendInvoiceEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  // Configure your SMTP transport (use environment variables in production)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password',
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@yourdomain.com',
    to,
    subject,
    text,
    html,
    attachments,
  });
} 