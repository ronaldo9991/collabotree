// Project and Service related types

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  bio?: string;
  skills?: string;
  full_name?: string;
}

export interface ProjectWithDetails {
  id: string;
  title: string;
  description: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  tags?: string[];
  cover_url?: string;
  creator?: User;
  rating?: number;
  totalReviews?: number;
  orders?: number;
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
