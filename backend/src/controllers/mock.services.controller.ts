import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responses.js';

// Mock data for when database is not available
const mockServices = [
  {
    id: 'mock-1',
    title: 'Modern React Website Development',
    description: 'I will create a modern, responsive React website with TypeScript and Tailwind CSS. Perfect for startups and small businesses.',
    priceCents: 50000,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
    isActive: true,
    ownerId: 'mock-user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'mock-user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      bio: 'Computer Science student at MIT',
      university: 'MIT',
      skills: '["Web Development", "React", "Node.js"]',
      isVerified: true,
      idCardUrl: null,
      verifiedAt: new Date().toISOString(),
    },
    _count: {
      hireRequests: 5,
      orders: 3,
    },
  },
  {
    id: 'mock-2',
    title: 'UI/UX Design for Mobile App',
    description: 'Professional UI/UX design for your mobile application. I will create wireframes, mockups, and a complete design system.',
    priceCents: 75000,
    coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
    isActive: true,
    ownerId: 'mock-user-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'mock-user-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      bio: 'Design student at Stanford',
      university: 'Stanford',
      skills: '["UI/UX Design", "Figma", "Adobe Creative Suite"]',
      isVerified: true,
      idCardUrl: null,
      verifiedAt: new Date().toISOString(),
    },
    _count: {
      hireRequests: 8,
      orders: 5,
    },
  },
  {
    id: 'mock-3',
    title: 'Full-Stack Web Application',
    description: 'Complete full-stack web application with React frontend and Node.js backend. Includes database design and deployment.',
    priceCents: 100000,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
    isActive: true,
    ownerId: 'mock-user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'mock-user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      bio: 'Computer Science student at MIT',
      university: 'MIT',
      skills: '["Web Development", "React", "Node.js"]',
      isVerified: true,
      idCardUrl: null,
      verifiedAt: new Date().toISOString(),
    },
    _count: {
      hireRequests: 12,
      orders: 7,
    },
  },
  {
    id: 'mock-4',
    title: 'Brand Identity Design',
    description: 'Complete brand identity package including logo design, color palette, typography, and brand guidelines.',
    priceCents: 30000,
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
    isActive: true,
    ownerId: 'mock-user-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'mock-user-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      bio: 'Design student at Stanford',
      university: 'Stanford',
      skills: '["UI/UX Design", "Figma", "Adobe Creative Suite"]',
      isVerified: true,
      idCardUrl: null,
      verifiedAt: new Date().toISOString(),
    },
    _count: {
      hireRequests: 3,
      orders: 2,
    },
  },
  {
    id: 'mock-5',
    title: 'E-commerce Website Development',
    description: 'Modern e-commerce website with payment integration, inventory management, and admin dashboard.',
    priceCents: 150000,
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
    isActive: true,
    ownerId: 'mock-user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'mock-user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      bio: 'Computer Science student at MIT',
      university: 'MIT',
      skills: '["Web Development", "React", "Node.js"]',
      isVerified: true,
      idCardUrl: null,
      verifiedAt: new Date().toISOString(),
    },
    _count: {
      hireRequests: 15,
      orders: 9,
    },
  },
  {
    id: 'mock-6',
    title: 'Mobile App Prototype',
    description: 'Interactive mobile app prototype using Figma. Includes user flows, animations, and design specifications.',
    priceCents: 40000,
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
    isActive: true,
    ownerId: 'mock-user-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'mock-user-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      bio: 'Design student at Stanford',
      university: 'Stanford',
      skills: '["UI/UX Design", "Figma", "Adobe Creative Suite"]',
      isVerified: true,
      idCardUrl: null,
      verifiedAt: new Date().toISOString(),
    },
    _count: {
      hireRequests: 6,
      orders: 4,
    },
  },
];

export const getMockPublicServices = async (req: Request, res: Response) => {
  try {
    console.log('🎭 Returning mock services data');
    
    const result = {
      data: mockServices,
      pagination: {
        page: 1,
        limit: 50,
        total: mockServices.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    return sendSuccess(res, result);
  } catch (error) {
    console.error('❌ Error in getMockPublicServices:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch mock services',
    });
  }
};
