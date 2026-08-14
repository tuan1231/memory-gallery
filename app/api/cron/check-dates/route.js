import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request) {
  try {
    // Optional: Protect this route with a secret key
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    // Fetch all important dates
    const { data: dates, error: datesError } = await supabase
      .from('important_dates')
      .select('*');

    if (datesError) {
      console.error('Error fetching dates:', datesError);
      return NextResponse.json({ error: 'Failed to fetch dates' }, { status: 500 });
    }

    // Filter dates that match today
    const matchingDates = dates.filter(item => {
      const itemDate = new Date(item.date);
      const itemMonth = itemDate.getMonth() + 1;
      const itemDay = itemDate.getDate();
      const itemYear = itemDate.getFullYear();

      if (item.is_recurring) {
        return itemMonth === currentMonth && itemDay === currentDay;
      } else {
        return itemMonth === currentMonth && itemDay === currentDay && itemYear === currentYear;
      }
    });

    if (matchingDates.length === 0) {
      return NextResponse.json({ message: 'No important dates for today.' });
    }

    // Use environment variable for target emails
    const targetEmailsStr = process.env.TARGET_EMAILS;
    let validEmails = [];
    
    if (targetEmailsStr) {
      validEmails = targetEmailsStr.split(',').map(e => e.trim()).filter(e => e);
    }

    if (validEmails.length === 0) {
      return NextResponse.json({ message: 'No valid emails found to send to. Please set TARGET_EMAILS in .env.local' });
    }

    const emailPromises = [];

    // Send emails for each matching date
    for (const dateItem of matchingDates) {
      const emailBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Memory Gallery Reminder</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="color: #000; margin-bottom: 5px;">${dateItem.title}</h1>
            <p style="color: #666; margin-top: 0;">${dateItem.date}</p>
          </div>
          <div style="font-size: 16px; color: #444; line-height: 1.6; white-space: pre-wrap;">
            ${dateItem.email_content}
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated reminder from your Memory Gallery app.
          </p>
        </div>
      `;

      // We send one email to all valid emails (or loop through them)
      // Resend allows sending to an array of emails
      emailPromises.push(
        resend.emails.send({
          from: 'Memory Gallery <hello@memoryhlt.site>', // Changed to use your verified domain
          to: validEmails,
          subject: `Reminder: ${dateItem.title}`,
          html: emailBody,
        })
      );
    }

    await Promise.all(emailPromises);

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${matchingDates.length} reminders to ${validEmails.length} users.` 
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
