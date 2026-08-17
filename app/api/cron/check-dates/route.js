import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../../lib/supabase-admin';
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

    // Fetch all profiles to map emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    const emailPromises = [];

    // Send emails for each matching date
    for (const dateItem of matchingDates) {
      const emailBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF5F2; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #FCD5CE; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(244, 151, 142, 0.1);">
            
            <!-- Header -->
            <div style="background-color: #F4978E; padding: 30px 20px; text-align: center;">
              <h2 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Memory Gallery</h2>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2D1B19; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">${dateItem.title}</h1>
                <div style="display: inline-block; background-color: #FFF5F2; color: #F4978E; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; border: 1px solid #FCD5CE;">
                  ${dateItem.date}
                </div>
              </div>

              <div style="font-size: 16px; color: #2D1B19; line-height: 1.8; white-space: pre-wrap; background-color: #FFF5F2; padding: 25px; border-radius: 12px; border: 1px solid #FCD5CE;">
                ${dateItem.email_content}
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 20px 30px 30px; text-align: center;">
              <hr style="border: none; border-top: 1px dashed #FCD5CE; margin: 0 0 20px 0;" />
              <p style="font-size: 13px; color: #F4978E; margin: 0;">
                Gửi từ <strong>Memory Gallery</strong>
              </p>
              <p style="font-size: 12px; color: #2D1B19; opacity: 0.6; margin: 5px 0 0 0;">
                Nhắc nhở tự động từ Memory Gallary.
              </p>
            </div>
            
          </div>
        </div>
      `;

      // Determine recipient emails
      let toEmails = [];
      const creatorProfile = profiles.find(p => p.id === dateItem.user_id);
      const partnerProfile = profiles.find(p => p.id !== dateItem.user_id);
      
      const creatorEmail = creatorProfile?.email;
      const partnerEmail = partnerProfile?.email;

      if (dateItem.recipient === 'me' && creatorEmail) {
        toEmails = [creatorEmail];
      } else if (dateItem.recipient === 'partner' && partnerEmail) {
        toEmails = [partnerEmail];
      } else {
        // 'both' or fallback
        toEmails = [creatorEmail, partnerEmail].filter(Boolean);
      }

      // Fallback to env variables if DB profiles lack emails
      if (toEmails.length === 0) {
        const targetEmailsStr = process.env.TARGET_EMAILS;
        if (targetEmailsStr) {
          toEmails = targetEmailsStr.split(',').map(e => e.trim()).filter(e => e);
        }
      }

      if (toEmails.length === 0) {
        console.warn(`No valid emails found for date item: ${dateItem.id}`);
        continue;
      }

      // We send one email to the target users
      emailPromises.push(
        resend.emails.send({
          from: 'Memory Gallery <hello@memoryhtt.site>', // Changed to use your verified domain
          to: toEmails,
          subject: `Reminder: ${dateItem.title}`,
          html: emailBody,
        })
      );
    }

    const results = await Promise.all(emailPromises);

    // Resend SDK returns { data, error }. Let's check if any failed.
    const errors = results.filter(res => res.error).map(res => res.error);
    
    if (errors.length > 0) {
      console.error('Resend API Errors:', errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send some or all emails. See console for details.',
        details: errors
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${matchingDates.length} reminders.` 
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
