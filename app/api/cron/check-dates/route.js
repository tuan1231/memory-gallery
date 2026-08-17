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

    const dateIn7Days = new Date(today);
    dateIn7Days.setDate(today.getDate() + 7);
    const targetMonth7 = dateIn7Days.getMonth() + 1;
    const targetDay7 = dateIn7Days.getDate();
    const targetYear7 = dateIn7Days.getFullYear();

    // Filter dates that match today, or 7 days in advance for special reminders
    const matchingDates = dates.filter(item => {
      const itemDate = new Date(item.date);
      const itemMonth = itemDate.getMonth() + 1;
      const itemDay = itemDate.getDate();
      const itemYear = itemDate.getFullYear();
      
      const titleLower = item.title.toLowerCase();
      const isAdvanceReminder = titleLower.includes('nhắc nhở') || titleLower.includes('chuyến đi') || titleLower.includes('du lịch');

      if (isAdvanceReminder) {
        // Send 7 days in advance
        if (item.is_recurring) {
          return itemMonth === targetMonth7 && itemDay === targetDay7;
        } else {
          return itemMonth === targetMonth7 && itemDay === targetDay7 && itemYear === targetYear7;
        }
      } else {
        // Send on the exact day
        if (item.is_recurring) {
          return itemMonth === currentMonth && itemDay === currentDay;
        } else {
          return itemMonth === currentMonth && itemDay === currentDay && itemYear === currentYear;
        }
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #FFF5F2; font-family: 'Inter', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFF5F2; padding: 60px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container: Sharp corners, solid thin border -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #F4978E; margin: 0 auto;">
                  
                  <!-- Header Area -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 0 40px;">
                      <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #F4978E; font-family: 'Inter', Arial, sans-serif;">Memory Gallery</p>
                    </td>
                  </tr>
                  
                  <!-- Content Area -->
                  <tr>
                    <td style="padding: 40px;">
                      
                      <h1 style="margin: 0 0 20px 0; font-size: 28px; color: #2D1B19; font-weight: normal; line-height: 1.4; font-family: 'Lora', 'Times New Roman', serif;">
                        ${dateItem.title}
                      </h1>
                      
                      <div style="margin-bottom: 30px;">
                        <span style="display: inline-block; border: 1px solid #FCD5CE; padding: 6px 12px; font-size: 13px; font-family: 'Courier New', monospace; color: #2D1B19; background-color: #FFF5F2;">
                          ${dateItem.date}
                        </span>
                      </div>
                      
                      <!-- Divider -->
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr><td style="border-top: 1px solid #FCD5CE;"></td></tr>
                      </table>
                      
                      <!-- Message -->
                      <div style="font-size: 15px; color: #2D1B19; line-height: 1.8; text-align: left; white-space: pre-wrap; font-family: 'Inter', Arial, sans-serif;">${dateItem.email_content}</div>
                      
                      <!-- Button -->
                      <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 40px;">
                        <tr>
                          <td align="center" style="background-color: #F4978E;">
                            <a href="https://memory-gallery-nine.vercel.app/" target="_blank" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'Inter', Arial, sans-serif;">View Gallery</a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #FFF5F2; border-top: 1px solid #FCD5CE;">
                      <p style="margin: 0; font-size: 13px; color: #2D1B19; opacity: 0.7; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
                        Nhắc nhở tự động từ <strong>Memory Gallery</strong>.<br>
                        Lưu giữ mọi khoảnh khắc.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
