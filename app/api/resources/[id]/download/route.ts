import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { headers } from 'next/headers';
import type { Resource } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    // Get resource
    const resources = await query<Resource[]>(
      'SELECT * FROM resources WHERE id = ? AND status = ?',
      [id, 'approved']
    );

    if (resources.length === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Log download
    await query(
      'INSERT INTO download_logs (resource_id, user_id, ip_address) VALUES (?, ?, ?)',
      [id, user?.id || null, ip]
    );

    // Increment download count
    await query('UPDATE resources SET downloads = downloads + 1 WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      download_url: resources[0].download_url,
    });
  } catch (error) {
    console.error('Error logging download:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}
