import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    // TODO: Add authentication check for admin role
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category && category !== 'ALL') {
      where.category = category;
    }
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    // Get projects with creator information
    const projects = await db.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            donations: {
              where: {
                paymentStatus: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset
    });
    
    // Get total count for pagination
    const total = await db.project.count({ where });
    
    return json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    // TODO: Add authentication check for admin role
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.description || !data.goalAmount) {
      return json(
        { error: 'Title, description, and goal amount are required' },
        { status: 400 }
      );
    }
    
    // Validate goal amount
    const goalAmount = parseFloat(data.goalAmount);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      return json(
        { error: 'Goal amount must be a positive number' },
        { status: 400 }
      );
    }
    
    // For demo purposes, we'll use the admin user ID
    // In production, get this from the authenticated user session
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      return json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }
    
    // Generate short description if not provided
    const shortDesc = data.shortDesc || data.description.substring(0, 100) + '...';
    
    // Create project
    const project = await db.project.create({
      data: {
        title: data.title,
        description: data.description,
        shortDesc: shortDesc,
        category: data.category || 'COMMUNITY_DEVELOPMENT',
        status: data.status || 'ACTIVE',
        goalAmount: goalAmount,
        currentAmount: 0,
        featured: data.featured || false,
        imageUrl: data.imageUrl || null,
        location: data.location || null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        creatorId: adminUser.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return json({
      success: true,
      project
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating project:', error);
    return json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
