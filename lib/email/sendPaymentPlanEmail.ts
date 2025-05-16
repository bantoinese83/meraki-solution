import nodemailer from 'nodemailer';

function getBrandedHtml({
  subject,
  text,
  details,
  eventType,
  locale = 'en',
}: {
  subject: string;
  text?: string;
  details?: {
    invoiceNumber?: string | number;
    dueDate?: string | Date;
    paymentLink?: string;
    clientName?: string;
    amount?: number;
  };
  eventType?: 'overdue' | 'new' | 'updated';
  locale?: string;
}) {
  // Simple localization (English only for now)
  const t = (en: string) => en;
  const { invoiceNumber, dueDate, paymentLink, clientName, amount } = details || {};
  let eventMsg = '';
  if (eventType === 'overdue') {
    eventMsg = t('This installment is now <b>overdue</b>. Please pay as soon as possible.');
  } else if (eventType === 'new') {
    eventMsg = t('A new payment plan installment has been scheduled.');
  } else if (eventType === 'updated') {
    eventMsg = t('A payment plan installment has been updated.');
  }
  return `
    <div style="font-family: Arial, sans-serif; background: #f0f4f8; padding: 32px;">
      <div style="max-width: 540px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; overflow: hidden;">
        <div style="background: #3b82f6; padding: 28px 0; text-align: center;">
          <img src='https://yourdomain.com/logo.png' alt='Meraki Invoicing' style='height: 44px; margin-bottom: 10px;' />
          <h1 style='color: #fff; font-size: 1.7rem; margin: 0; letter-spacing: 1px;'>Meraki Invoicing</h1>
        </div>
        <div style="padding: 36px 28px 24px 28px; color: #222;">
          <h2 style="color: #3b82f6; font-size: 1.25rem; margin-bottom: 18px;">${subject}</h2>
          <p style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 18px;">${eventMsg}</p>
          <table style="width: 100%; font-size: 1rem; margin-bottom: 18px;">
            <tr><td style="color: #888; padding: 4px 0;">${t('Client')}</td><td style="font-weight: 500;">${clientName || ''}</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">${t('Invoice #')}</td><td>${invoiceNumber || ''}</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">${t('Due Date')}</td><td>${dueDate ? (typeof dueDate === 'string' ? new Date(dueDate).toLocaleDateString(locale) : dueDate.toLocaleDateString(locale)) : ''}</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">${t('Amount')}</td><td>${typeof amount === 'number' ? `$${(amount / 100).toFixed(2)}` : ''}</td></tr>
          </table>
          ${paymentLink ? `<a href="${paymentLink}" style="display: inline-block; background: #3b82f6; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin-bottom: 18px;">${t('Pay Now')}</a>` : ''}
          <p style="margin-top: 18px; font-size: 0.98rem; color: #444;">${text ? text.replace(/\n/g, '<br>') : ''}</p>
        </div>
        <div style="background: #f1f5f9; color: #888; font-size: 0.93rem; text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Meraki Invoicing. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendPaymentPlanEmail({
  to,
  subject,
  text,
  html,
  details,
  eventType,
  locale,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  details?: {
    invoiceNumber?: string | number;
    dueDate?: string | Date;
    paymentLink?: string;
    clientName?: string;
    amount?: number;
  };
  eventType?: 'overdue' | 'new' | 'updated';
  locale?: string;
}) {
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
    html: html || getBrandedHtml({ subject, text, details, eventType, locale }),
  });
} 