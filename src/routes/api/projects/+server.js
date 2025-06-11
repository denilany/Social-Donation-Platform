import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Build where clause
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get projects with donations count
    const projects = await db.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        donations: {
          select: {
            id: true,
            amount: true,
            paymentStatus: true
          }
        },
        _count: {
          select: {
            donations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
    
    // Calculate current amounts from successful donations
    const projectsWithAmounts = projects.map(project => ({
      ...project,
      currentAmount: project.donations
        .filter(d => d.paymentStatus === 'COMPLETED')
        .reduce((sum, d) => sum + d.amount, 0),
      donorCount: project.donations
        .filter(d => d.paymentStatus === 'COMPLETED').length
    }));
    
    return json({
      projects: projectsWithAmounts,
      total: await db.project.count({ where }),
      hasMore: (offset + limit) < await db.project.count({ where })
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
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'shortDesc', 'category', 'goalAmount', 'creatorId'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create project
    const project = await db.project.create({
      data: {
        title: data.title,
        description: data.description,
        shortDesc: data.shortDesc,
        category: data.category,
        status: data.status || 'ACTIVE',
        goalAmount: parseFloat(data.goalAmount),
        featured: data.featured || false,
        imageUrl: data.imageUrl,
        location: data.location,
        endDate: data.endDate ? new Date(data.endDate) : null,
        creatorId: data.creatorId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return json(project, { status: 201 });
    
  } catch (error) {
    console.error('Error creating project:', error);
    return json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
