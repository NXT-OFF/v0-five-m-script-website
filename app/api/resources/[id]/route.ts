import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Resource } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get resource with author info
    const resources = await query<Resource[]>(
      `SELECT r.*, u.username as author_username, u.avatar_url as author_avatar
       FROM resources r 
       JOIN users u ON r.author_id = u.id 
       WHERE r.id = ?`,
      [id]
    );

    if (resources.length === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await query('UPDATE resources SET views = views + 1 WHERE id = ?', [id]);

    // Get average rating
    const ratingResult = await query<[{ avg_rating: number; total_reviews: number }]>(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE resource_id = ?',
      [id]
    );

    const resource = {
      ...resources[0],
      avg_rating: ratingResult[0]?.avg_rating || 0,
      total_reviews: ratingResult[0]?.total_reviews || 0,
    };

    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}
