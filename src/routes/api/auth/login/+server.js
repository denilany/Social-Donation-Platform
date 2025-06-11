import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, we'll use a simple authentication
    // In production, you'd use proper password hashing
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    if (!user) {
      return json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // For demo, we'll accept any password for the admin user
    // In production, verify the hashed password
    if (email === 'admin@donateke.org' || password === 'demo123') {
      return json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }
    
    return json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
