import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { Review } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviews = await query<Review[]>(
      `SELECT r.*, u.username, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.resource_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { rating, content } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed
    const existingReview = await query<Review[]>(
      'SELECT id FROM reviews WHERE resource_id = ? AND user_id = ?',
      [id, user.id]
    );

    if (existingReview.length > 0) {
      // Update existing review
      await query(
        'UPDATE reviews SET rating = ?, content = ? WHERE resource_id = ? AND user_id = ?',
        [rating, content || '', id, user.id]
      );
    } else {
      // Create new review
      await query(
        'INSERT INTO reviews (resource_id, user_id, rating, content) VALUES (?, ?, ?, ?)',
        [id, user.id, rating, content || '']
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
