import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { options } from '../../auth/[...nextauth]/options';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const email = await gmail.users.messages.get({
      userId: 'me',
      id: params.id,
      format: 'full',
    });

    const headers = email.data.payload?.headers || [];
    const from = headers.find((h) => h.name === 'From')?.value || 'Unknown Sender';
    const to = headers.find((h) => h.name === 'To')?.value || 'Unknown Recipient';
    const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
    const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString();

    // Decode email body
    let body = '';
    const parts = email.data.payload?.parts || [];
    const plainTextPart = parts.find(part => part.mimeType === 'text/plain');
    const htmlPart = parts.find(part => part.mimeType === 'text/html');

    if (htmlPart?.body?.data) {
      body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
    } else if (plainTextPart?.body?.data) {
      const text = Buffer.from(plainTextPart.body.data, 'base64').toString('utf-8');
      body = text.replace(/\n/g, '<br>');
    } else if (email.data.payload?.body?.data) {
      const text = Buffer.from(email.data.payload.body.data, 'base64').toString('utf-8');
      body = text.replace(/\n/g, '<br>');
    }

    return NextResponse.json({
      id: email.data.id,
      from,
      to,
      subject,
      date,
      body,
    });
  } catch (error) {
    console.error('Error fetching email:', error);
    return NextResponse.json({ error: 'Failed to fetch email' }, { status: 500 });
  }
} 