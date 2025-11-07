// Project and Service related types

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  bio?: string;
  university?: string;
  skills?: string;
  full_name?: string;
  isVerified?: boolean;
  idCardUrl?: string;
  verifiedAt?: string;
}

export interface ProjectWithDetails {
  id: string;
  title: string;
  description: string;
  priceCents?: number;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
  ownerId: string;
  created_by?: string;
  tags?: string[];
  cover_url?: string;
  coverImage?: string;
  creator?: User;
  owner?: User;
  averageRating?: number;
  rating?: number;
  totalReviews?: number;
  orders?: number;
  applications?: any[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  deliveryTime: string;
  seller: {
    name: string;
    rating: number;
  };
  tags: string[];
}

export interface StudentOverview {
  id: string;
  name: string;
  role: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  totalProjects: number;
  liveProjects: ProjectWithDetails[];
  completedProjects: number;
  joinedDate: string;
  avatar?: string;
}
