import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUsers = await query<User[]>(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const result = await query<{ insertId: number }>(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    // Get the inserted user ID
    const insertResult = result as unknown as { insertId: number };
    const userId = insertResult.insertId;

    // Create token and set cookie
    const token = await createToken(userId);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: userId, username, email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
