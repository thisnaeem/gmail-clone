import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { options } from '../../auth/[...nextauth]/options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No email IDs provided' }, { status: 400 });
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

    // Delete emails in parallel
    await Promise.all(
      ids.map(async (id) => {
        try {
          await gmail.users.messages.trash({
            userId: 'me',
            id,
          });
        } catch (error) {
          console.error(`Error deleting email ${id}:`, error);
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting emails:', error);
    return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 });
  }
} 