import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const project = await db.project.findUnique({
      where: { id },
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
      }
    });
    
    if (!project) {
      return json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return json({ project });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
  try {
    // TODO: Add authentication check for admin role
    
    const { id } = params;
    const data = await request.json();
    
    if (!id) {
      return json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id }
    });
    
    if (!existingProject) {
      return json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
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
    
    // Generate short description if not provided
    const shortDesc = data.shortDesc || data.description.substring(0, 100) + '...';
    
    // Update project
    const updatedProject = await db.project.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        shortDesc: shortDesc,
        category: data.category || existingProject.category,
        status: data.status || existingProject.status,
        goalAmount: goalAmount,
        featured: data.featured !== undefined ? data.featured : existingProject.featured,
        imageUrl: data.imageUrl || existingProject.imageUrl,
        location: data.location || existingProject.location,
        startDate: data.startDate ? new Date(data.startDate) : existingProject.startDate,
        endDate: data.endDate ? new Date(data.endDate) : existingProject.endDate,
        updatedAt: new Date()
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
      project: updatedProject
    });
    
  } catch (error) {
    console.error('Error updating project:', error);
    return json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
  try {
    // TODO: Add authentication check for admin role
    
    const { id } = params;
    
    if (!id) {
      return json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            donations: true
          }
        }
      }
    });
    
    if (!existingProject) {
      return json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if project has donations
    if (existingProject._count.donations > 0) {
      return json(
        { error: 'Cannot delete project with existing donations. Please contact support.' },
        { status: 400 }
      );
    }
    
    // Delete project
    await db.project.delete({
      where: { id }
    });
    
    return json({
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    return json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
