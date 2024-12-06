import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { options } from '../auth/[...nextauth]/options';

// Helper function to determine email category
function determineCategory(email: any) {
  const labels = email.labelIds || [];
  const headers = email.payload?.headers || [];
  const from = headers.find((h: any) => h.name === 'From')?.value || '';
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
  
  // First check Gmail's native categories
  if (labels.includes('CATEGORY_PERSONAL') || labels.includes('CATEGORY_INBOX')) {
    return 'primary';
  }
  if (labels.includes('CATEGORY_SOCIAL')) {
    return 'social';
  }
  if (labels.includes('CATEGORY_PROMOTIONS')) {
    return 'promotions';
  }
  if (labels.includes('CATEGORY_UPDATES') || labels.includes('CATEGORY_FORUMS')) {
    return 'updates';
  }
  
  // If no Gmail category, use heuristics
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  // Social patterns
  if (
    fromLower.includes('linkedin') ||
    fromLower.includes('facebook') ||
    fromLower.includes('twitter') ||
    fromLower.includes('instagram') ||
    fromLower.includes('social') ||
    subjectLower.includes('connection request') ||
    subjectLower.includes('followed you') ||
    subjectLower.includes('network')
  ) {
    return 'social';
  }
  
  // Promotional patterns
  if (
    fromLower.includes('marketing') ||
    fromLower.includes('newsletter') ||
    fromLower.includes('promotions') ||
    fromLower.includes('sale') ||
    subjectLower.includes('offer') ||
    subjectLower.includes('discount') ||
    subjectLower.includes('deal') ||
    subjectLower.includes('% off') ||
    subjectLower.includes('sale') ||
    subjectLower.includes('limited time')
  ) {
    return 'promotions';
  }
  
  // Updates patterns
  if (
    fromLower.includes('no-reply') ||
    fromLower.includes('noreply') ||
    fromLower.includes('notification') ||
    fromLower.includes('updates') ||
    fromLower.includes('alert') ||
    fromLower.includes('info@') ||
    subjectLower.includes('update') ||
    subjectLower.includes('alert') ||
    subjectLower.includes('notification') ||
    subjectLower.includes('confirm') ||
    subjectLower.includes('receipt') ||
    subjectLower.includes('statement')
  ) {
    return 'updates';
  }
  
  // Default to primary for personal communication
  return 'primary';
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get page token and category from URL
    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken');
    const category = searchParams.get('category') || 'primary';

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

    // Get messages list with pagination
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
      pageToken: pageToken || undefined,
      q: 'in:inbox',
      labelIds: category === 'primary' ? ['INBOX', 'CATEGORY_PERSONAL'] : undefined
    });

    const messages = response.data.messages || [];
    const nextPageToken = response.data.nextPageToken;

    // Fetch email details in parallel
    const emails = await Promise.all(
      messages.map(async (message) => {
        try {
          const email = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
            metadataHeaders: ['From', 'Subject', 'Date']
          });

          const headers = email.data.payload?.headers || [];
          const from = headers.find((h) => h.name === 'From')?.value || 'Unknown Sender';
          const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
          const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString();

          // Determine email category
          const emailCategory = determineCategory(email.data);

          return {
            id: email.data.id || message.id,
            from,
            subject,
            date: new Date(date).toLocaleDateString(),
            snippet: email.data.snippet || '',
            category: emailCategory,
            labels: email.data.labelIds || []
          };
        } catch (error) {
          console.error('Error fetching email details:', error);
          return null;
        }
      })
    );

    // Filter out any null values and filter by category
    const validEmails = emails
      .filter((email): email is NonNullable<typeof email> => email !== null)
      .filter(email => category === 'all' || email.category === category);

    return NextResponse.json({
      emails: validEmails,
      nextPageToken,
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
} 