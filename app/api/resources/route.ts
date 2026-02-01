import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { Resource } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT r.*, u.username as author_username 
      FROM resources r 
      JOIN users u ON r.author_id = u.id 
      WHERE r.status = 'approved'
    `;
    const params: (string | number)[] = [];

    if (category && category !== 'all') {
      sql += ' AND r.category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const resources = await query<Resource[]>(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM resources WHERE status = ?';
    const countParams: (string | number)[] = ['approved'];

    if (category && category !== 'all') {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countSql += ' AND (title LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await query<[{ total: number }]>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({ resources, total });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, description, category, thumbnail_url, download_url, file_size, version } = await request.json();

    if (!title || !description || !category || !download_url) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO resources (title, description, category, thumbnail_url, download_url, file_size, version, author_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, thumbnail_url, download_url, file_size, version, user.id, 'pending']
    );

    const insertResult = result as unknown as { insertId: number };

    return NextResponse.json({
      success: true,
      resourceId: insertResult.insertId,
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
