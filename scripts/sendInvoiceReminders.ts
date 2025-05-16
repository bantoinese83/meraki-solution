import { db } from '@/lib/db/drizzle';
import { invoices, clients } from '@/lib/db/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { sendReminderEmail } from '@/lib/email/sendReminderEmail';

async function sendReminders() {
  // Find overdue invoices (dueDate < now, not paid)
  const now = new Date();
  const overdueInvoices = await db.query.invoices.findMany({
    where: and(
      lt(invoices.dueDate, now),
      isNull(invoices.paidAt)
    ),
    with: { client: true },
  });

  for (const invoice of overdueInvoices) {
    if (!invoice.client?.email) continue;
    await sendReminderEmail({
      to: invoice.client.email,
      subject: `Payment Reminder: Invoice #${invoice.id} is overdue`,
      text: `Dear ${invoice.client.name},\n\nThis is a reminder that Invoice #${invoice.id} is overdue. Please make your payment as soon as possible.\n\nThank you!`,
    });
    console.log(`Sent reminder for invoice #${invoice.id} to ${invoice.client.email}`);
  }
}

sendReminders().then(() => {
  console.log('Done sending reminders.');
  process.exit(0);
}); 