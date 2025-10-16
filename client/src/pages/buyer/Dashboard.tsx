import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { 
  LayoutDashboard,
  Briefcase,
  MessageCircle,
  Users,
  DollarSign,
  Activity,
  CheckCircle,
  Bookmark,
  ShoppingCart,
  User as UserIcon,
  Search,
  Calendar,
  Clock,
  XCircle,
  Package,
  Send,
  Eye,
  Star,
  ArrowLeft,
  Heart,
  Filter,
  MapPin,
  FileText
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ContractManager } from "@/components/ContractManager";

interface OrderStats {
  totalSpent: number;
  activeOrders: number;
  completedProjects: number;
  savedServices: number;
}

export default function BuyerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [stats, setStats] = useState<OrderStats>({
    totalSpent: 0,
    activeOrders: 0,
    completedProjects: 0,
    savedServices: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [hireRequests, setHireRequests] = useState<any[]>([]);
  const [browseServices, setBrowseServices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [hireRequestsRefresh, setHireRequestsRefresh] = useState(0);

  // If no user, redirect to sign in
  if (!user) {
    navigate('/signin');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Function to refresh hire requests
  const refreshHireRequests = async () => {
    try {
      const hireRequestsResponse = await api.getHireRequests();
      const hireRequestsData = (hireRequestsResponse as any)?.data?.data || (hireRequestsResponse as any)?.data || hireRequestsResponse || [];
      setHireRequests(hireRequestsData);
      setHireRequestsRefresh(prev => prev + 1);
    } catch (error) {
      console.log('Error refreshing hire requests:', error);
    }
  };

  // Fetch buyer dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch real user projects data using the orders API
        console.log('🚀 Fetching orders for user:', user?.id, 'role:', user?.role);
        const userProjectsResponse = await api.getOrders();
        console.log('🔍 Full Orders API response:', JSON.stringify(userProjectsResponse, null, 2));
        
        // Handle different possible response structures
        let userProjects = [];
        if (userProjectsResponse?.data?.data && Array.isArray(userProjectsResponse.data.data)) {
          // Paginated response structure
          userProjects = userProjectsResponse.data.data;
          console.log('📊 Using paginated data structure:', userProjects.length, 'projects');
        } else if (userProjectsResponse?.data && Array.isArray(userProjectsResponse.data)) {
          // Direct array response
          userProjects = userProjectsResponse.data;
          console.log('📊 Using direct array structure:', userProjects.length, 'projects');
        } else if (Array.isArray(userProjectsResponse)) {
          // Direct array response (no wrapper)
          userProjects = userProjectsResponse;
          console.log('📊 Using direct response array:', userProjects.length, 'projects');
        } else {
          console.log('❌ No valid data structure found in response');
        }
        
        console.log('✅ Final parsed user projects:', userProjects);
        
        // Debug: Let's also try a direct API call to see what we get
        try {
          console.log('🔍 Testing direct API call...');
          const testResponse = await fetch('/api/orders/mine', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_tokens')}`,
              'Content-Type': 'application/json'
            }
          });
          const testData = await testResponse.json();
          console.log('🔍 Direct API test response:', testData);
        } catch (testError) {
          console.log('❌ Direct API test failed:', testError);
        }
        
        // Always fetch hire requests to check for accepted ones (not just when no orders)
        console.log('🔄 Fetching hire requests to check for accepted ones...');
        try {
          const hireRequestsResponse = await api.getHireRequests();
          const hireRequestsData = (hireRequestsResponse as any)?.data?.data || (hireRequestsResponse as any)?.data || hireRequestsResponse || [];
          console.log('🔍 Hire requests data:', hireRequestsData);
          
          // Filter for accepted hire requests and convert to project format
          const acceptedHireRequests = hireRequestsData.filter((hire: any) => hire.status === 'ACCEPTED');
          console.log('✅ Accepted hire requests:', acceptedHireRequests);
          
          // Convert hire requests to project format
          const projectsFromHires = acceptedHireRequests.map((hire: any) => ({
            id: hire.id,
            status: 'ACCEPTED', // Use ACCEPTED status for accepted hire requests
            priceCents: hire.priceCents || hire.service?.priceCents || 0,
            createdAt: hire.createdAt,
            hireRequestId: hire.id,
            service: hire.service,
            student: hire.student,
            buyer: hire.buyer
          }));
          
          console.log('🔄 Converted hire requests to projects:', projectsFromHires);
          
          // Merge with existing user projects, avoiding duplicates
          const existingProjectIds = new Set(userProjects.map((p: any) => p.id));
          const newProjectsFromHires = projectsFromHires.filter((p: any) => !existingProjectIds.has(p.id));
          userProjects = [...userProjects, ...newProjectsFromHires];
        } catch (hireError) {
          console.log('❌ Error fetching hire requests:', hireError);
        }
        
        setUserProjects(userProjects);

        // Fetch hire requests sent by this buyer
        try {
          const hireRequestsResponse = await api.getHireRequests();
          const hireRequestsData = (hireRequestsResponse as any)?.data?.data || (hireRequestsResponse as any)?.data || hireRequestsResponse || [];
          setHireRequests(hireRequestsData);
        } catch (hireError) {
          console.log('Error fetching hire requests:', hireError);
          setHireRequests([]);
        }
        
        // Fetch available services for browsing
        try {
          console.log('🔍 Fetching services for buyer dashboard...');
          const servicesResponse = await api.getPublicServices();
          console.log('📊 Services API response:', servicesResponse);
          
          const servicesData = (servicesResponse as any)?.data?.data || (servicesResponse as any)?.data || servicesResponse || [];
          console.log('📋 Extracted services data:', servicesData);
          console.log('📊 Number of services found:', servicesData.length);
          
          // Map services to project format for display
          const mappedServices = servicesData.map((service: any) => ({
            id: service.id,
            title: service.title,
            description: service.description,
            budget: service.priceCents / 100,
            cover_url: service.coverImage, // Map coverImage to cover_url
            created_at: service.createdAt,
            created_by: service.ownerId,
            tags: service.owner?.skills && service.owner.skills !== "[]" ? JSON.parse(service.owner.skills) : ['General'],
            creator: {
              full_name: service.owner?.name || 'Student',
              role: 'student',
              isVerified: service.owner?.isVerified || false,
              idCardUrl: service.owner?.idCardUrl,
              verifiedAt: service.owner?.verifiedAt
            },
            rating: 4.5 + Math.random() * 0.5,
            totalReviews: Math.floor(Math.random() * 20) + 1,
            orders: Math.floor(Math.random() * 10) + 1
          }));

          console.log('🎯 Mapped services for display:', mappedServices);
          setBrowseServices(mappedServices);
        } catch (projectError) {
          console.error('❌ Error fetching services:', projectError);
          setBrowseServices([]);
        }

        // Calculate real stats from data
        const totalSpent = userProjects
          .filter((project: any) => project.status === 'PAID')
          .reduce((sum: number, project: any) => sum + (project.priceCents / 100), 0);

        const activeProjects = userProjects.filter((project: any) =>
          ['PENDING', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'ACCEPTED'].includes(project.status)
        ).length;

        const completedProjects = userProjects.filter((project: any) =>
          project.status === 'COMPLETED'
        ).length;

        setStats({
          totalSpent: Math.round(totalSpent),
          activeOrders: activeProjects,
          completedProjects,
          savedServices: 0
        });

      } catch (error) {
        console.error('Error fetching buyer data:', error);
        setStats({
          totalSpent: 0,
          activeOrders: 0,
          completedProjects: 0,
          savedServices: 0,
        });
        setUserProjects([]);
        setBrowseServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast, hireRequestsRefresh]);

  const formatAmount = (amountCents: number) => {
    return `$${(amountCents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PAID': return <DollarSign className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Activity className="h-4 w-4" />;
      case 'DELIVERED': return <Package className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 section-padding-y">
      <div className="container-unified">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="gap-2 bg-primary/10 text-primary border-primary/20">
              <UserIcon className="h-4 w-4" />
            Buyer Dashboard
          </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary dashboard-title">
            Welcome back, {user?.name?.split(' ')[0] || 'Buyer'}!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Manage your projects, chat with students, and track your progress
          </p>
        </div>

        {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 sm:mb-8 h-12 sm:h-14 bg-card/50 backdrop-blur-12 border-2 border-primary/30 rounded-xl shadow-lg p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Overview
              </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="h-4 w-4" />
              My Projects
              </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageCircle className="h-4 w-4" />
              Messages
              </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              Browse Talent
              </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              Contracts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Key Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                    <DollarSign className="h-6 w-6" />
                    </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">${stats.totalSpent}</div>
                  <p className="text-xs text-muted-foreground">on completed projects</p>
                  </CardContent>
                </Card>

              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                    <Activity className="h-6 w-6" />
                    </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary mb-2">{stats.activeOrders}</div>
                  <p className="text-xs text-muted-foreground">in progress</p>
                  </CardContent>
                </Card>

              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                    <CheckCircle className="h-6 w-6" />
                    </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent mb-2">{stats.completedProjects}</div>
                  <p className="text-xs text-muted-foreground">successfully delivered</p>
                  </CardContent>
                </Card>

              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                    <Bookmark className="h-6 w-6" />
                    </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saved Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">{stats.savedServices}</div>
                  <p className="text-xs text-muted-foreground">for later</p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">My Projects</h2>
                  <p className="text-muted-foreground">View and manage your accepted projects</p>
                  <p className="text-xs text-muted-foreground mt-1">Debug: {userProjects.length} projects found</p>
                </div>
              </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <Card key={index} className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-muted rounded w-1/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                          <div className="h-4 bg-muted rounded w-1/3" />
                        </div>
                      </Card>
                    ))}
                  </div>
              ) : (() => {
                console.log('🎯 Rendering My Projects tab - userProjects:', userProjects);
                console.log('🎯 userProjects.length:', userProjects.length);
                return userProjects.length > 0;
              })() ? (
                  <div className="space-y-4">
                  {userProjects.map((project) => (
                    <Card key={project.id} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold">{project.service?.title || 'Untitled Project'}</h3>
                              <Badge className={`${getStatusColor(project.status)} border`}>
                                  <span className="flex items-center gap-1">
                                  {getStatusIcon(project.status)}
                                  {project.status}
                                  </span>
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground mb-4 line-clamp-2">
                              {project.service?.description || 'No description available'}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                {project.student?.name || 'Unknown Student'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                {formatAmount(project.priceCents || 0)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                            {(project.status === 'PENDING' || project.status === 'PAID' || project.status === 'IN_PROGRESS' || project.status === 'DELIVERED' || project.status === 'ACCEPTED') ? (
                                <Button
                                  variant="default"
                                size="sm"
                                onClick={() => {
                                  const chatId = project.hireRequestId || project.id;
                                  console.log('🚀 Navigating to chat with ID:', chatId);
                                  console.log('🚀 Project data:', project);
                                  navigate(`/chat/${chatId}`);
                                }}
                                  className="gap-2 bg-primary hover:bg-primary/90"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  Chat
                                </Button>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Chat not available
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                    <CardContent className="p-12 text-center">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground mb-6">You haven't accepted any projects yet. Browse available services to get started!</p>
                      <Button onClick={() => navigate("/marketplace")} className="gap-2">
                      <Users className="h-4 w-4" />
                        Browse Services
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Messages</h2>
                  <p className="text-muted-foreground">Chat with students about your projects</p>
                  </div>
                </div>

              {loading ? (
                  <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Card key={index} className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-1/3" />
                                </div>
                        </Card>
                      ))}
                  </div>
              ) : userProjects.filter(project => ['PENDING', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'ACCEPTED'].includes(project.status)).length > 0 ? (
                  <div className="space-y-4">
                  {userProjects
                    .filter(project => ['PENDING', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'ACCEPTED'].includes(project.status))
                    .map((project) => (
                      <Card key={project.id} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 border border-border/30">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {project.student?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                <h3 className="font-semibold">{project.student?.name || 'Unknown Student'}</h3>
                                <p className="text-sm text-muted-foreground">{project.service?.title || 'Project'}</p>
                                </div>
                              </div>
                              <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                const chatId = project.hireRequestId || project.id;
                                console.log('🚀 Messages tab - Navigating to chat with ID:', chatId);
                                console.log('🚀 Messages tab - Project data:', project);
                                navigate(`/chat/${chatId}`);
                              }}
                                className="gap-2 bg-primary hover:bg-primary/90"
                              >
                                <MessageCircle className="h-4 w-4" />
                              Chat
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Chats</h3>
                    <p className="text-muted-foreground mb-4">You don't have any active chat conversations yet.</p>
                    <p className="text-sm text-muted-foreground mb-6">Chat becomes available once you have accepted projects or hire requests.</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate("/marketplace")} className="gap-2">
                        <Users className="h-4 w-4" />
                        Browse Services
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("overview")} className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        View Overview
                      </Button>
                    </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="browse" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Browse Talent</h2>
                    <p className="text-muted-foreground">Find talented students for your projects</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-secondary gap-2"
                    onClick={() => navigate("/marketplace")}
                  >
                    <Users className="h-5 w-5" />
                    View Full Marketplace
                  </Button>
                </div>

                {/* Search and Filter */}
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 mb-6">
                  <CardContent className="p-6">
                    <div className="relative max-w-2xl mx-auto mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder="Search services, skills, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 text-lg py-6 bg-background/50 border-border/50 focus:border-primary/50"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="text-sm text-muted-foreground">Popular:</span>
                      {["Web Development", "UI/UX Design", "Data Analysis", "Mobile Apps"].map((category) => (
                        <Badge key={category} variant="secondary" className="hover:bg-primary/20 cursor-pointer transition-colors">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              <BrowseTalentSection
                searchTerm={searchTerm}
                projects={browseServices}
                hireRequests={hireRequests}
                onHireSuccess={refreshHireRequests}
              />
              </motion.div>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <BuyerContractsSection />
              </motion.div>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}

// Browse Talent Section Component
function BrowseTalentSection({ searchTerm, projects, hireRequests, onHireSuccess }: {
  searchTerm: string;
  projects: any[];
  hireRequests: any[];
  onHireSuccess: () => Promise<void>;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Filter projects based on search term
  console.log('🔍 BrowseTalentSection - projects received:', projects);
  console.log('🔍 BrowseTalentSection - searchTerm:', searchTerm);
  
  const filteredProjects = projects.filter(project => 
    !searchTerm || 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  console.log('🎯 BrowseTalentSection - filteredProjects:', filteredProjects);
  console.log('📊 BrowseTalentSection - filteredProjects.length:', filteredProjects.length);
  
  // Check if buyer has already hired this specific project
  const hasHiredProject = (project: any) => {
    return hireRequests.some(hire => 
      hire.serviceId === project.id &&
      (hire.status === 'PENDING' || hire.status === 'ACCEPTED')
    );
  };

  const handleHireNow = async (project: any) => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);

    const authTokens = localStorage.getItem('auth_tokens');
    console.log('Auth tokens in localStorage:', authTokens ? 'Present' : 'Missing');

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to hire talent.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'BUYER') {
      console.log('User role check failed. Expected: BUYER, Got:', user.role);
      toast({
        title: "Access Denied",
        description: `Only buyers can hire talent. Your current role is: ${user.role}`,
        variant: "destructive",
      });
      return;
    }

    if (hasHiredProject(project)) {
      toast({
        title: "Already Hired",
        description: "You have already hired this specific project. Check your messages to chat with them.",
        variant: "destructive",
      });
      return;
    }

    try {
      const hireRequestData = {
        serviceId: project.id,
        message: `I'm interested in hiring you for this project: ${project.title}`,
        priceCents: Math.round((project.budget || 0) * 100),
      };
      
      console.log('Sending hire request to API...');
      try {
      const result = await api.createHireRequest(hireRequestData);
        console.log('Hire request result:', result);

        if (result.success) {
      toast({
        title: "Hire Request Sent!",
        description: "Your hire request has been sent to the student. They will review and respond soon.",
      });
      
          await onHireSuccess();
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        throw apiError;
      }

    } catch (error: any) {
      console.error('Error hiring:', error);

      let errorMessage = "Failed to send hire request. Please try again.";

      if (error.message?.includes('already have')) {
        errorMessage = "You already have a pending or accepted request with this student.";
      } else if (error.message?.includes('Authentication required')) {
        errorMessage = "Please log in again to continue.";
      } else if (error.message?.includes('Access denied') || error.message?.includes('Insufficient permissions')) {
        errorMessage = "You don't have permission to hire talent. Please check your account role.";
      } else if (error.message?.includes('Service not found')) {
        errorMessage = "This service is no longer available.";
      } else if (error.message?.includes('Invalid service ID')) {
        errorMessage = "Invalid service selected. Please refresh the page and try again.";
      } else if (error.status === 400) {
        errorMessage = "Invalid request data. Please check your input.";
      } else if (error.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.status === 403) {
        errorMessage = "Access denied. Please check your account permissions.";
      } else if (error.status === 404) {
        errorMessage = "Service not found. It may have been removed.";
      } else if (error.status === 409) {
        errorMessage = "You already have a pending request for this service.";
      }

      toast({
        title: "Hire Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your search terms or check back later for new services.</p>
          <Button onClick={() => navigate("/marketplace")} className="gap-2">
            <Users className="h-4 w-4" />
            View Full Marketplace
          </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
      {filteredProjects.map((project) => (
        <div key={project.id} className="h-full flex">
          <ProjectCard 
            project={project} 
            onHireNow={handleHireNow}
            hasHiredProject={hasHiredProject(project)}
          />
        </div>
      ))}
    </div>
  );
}

// Project Card Component (same as marketplace)
function ProjectCard({ project, onHireNow, hasHiredProject }: {
  project: any;
  onHireNow: (project: any) => void;
  hasHiredProject: boolean;
}) {
  const [, navigate] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);

  // Icon component for placeholder
  const IconComponent = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );


  return (
    <Card className="glass-card bg-gradient-to-r from-[#00B2FF]/20 via-[#4AC8FF]/25 to-[#8FE5FF]/20 dark:bg-[#02122E] dark:bg-gradient-to-r dark:from-[#02122E] dark:via-[#02122E] dark:to-[#02122E] backdrop-blur-12 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full border-[#00B2FF]/25 hover:border-[#4AC8FF]/35 dark:border-[#02122E]/60 dark:hover:border-[#02122E]/80 overflow-hidden" data-testid={`project-${project.id}`}>
      {/* Project Image */}
      <div className="relative w-full h-56 overflow-hidden rounded-t-lg bg-muted/10 flex items-center justify-center">
        {project.cover_url ? (
          <img 
            src={project.cover_url} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#00B2FF]/30 via-[#4AC8FF]/35 to-[#8FE5FF]/30 dark:bg-[#02122E] dark:bg-gradient-to-r dark:from-[#02122E] dark:via-[#02122E] dark:to-[#02122E] flex items-center justify-center rounded-t-lg">
            <IconComponent className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/25 via-[#4AC8FF]/20 to-[#8FE5FF]/25 group-hover:from-[#00B2FF]/35 group-hover:via-[#4AC8FF]/30 group-hover:to-[#8FE5FF]/35 dark:bg-[#02122E]/40 dark:group-hover:bg-[#02122E]/60 dark:bg-gradient-to-r dark:from-[#02122E]/40 dark:via-[#02122E]/40 dark:to-[#02122E]/40 dark:group-hover:from-[#02122E]/60 dark:group-hover:via-[#02122E]/60 dark:group-hover:to-[#02122E]/60 transition-all duration-200" />
        
        {/* Favorite Button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </Button>
      </div>
      
      <CardContent className="p-4 flex flex-col h-full">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {(project.creator?.full_name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{project.creator?.full_name || 'Student'}</span>
              {project.creator?.isVerified && (
                <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#00B2FF]">${project.budget}</div>
          </div>
        </div>

        {/* Project Title */}
        <h3 
          className="font-semibold text-lg mb-2 line-clamp-2 hover:text-[#00B2FF] transition-colors cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/service/${project.id}`);
          }}
        >
          {project.title}
        </h3>

        {/* Project Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1 min-h-0">
          {project.description.length > 80 ? `${project.description.substring(0, 80)}...` : project.description}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 mt-auto">
          <div className="flex gap-2">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/service/${project.id}`);
              }}
              variant="outline" 
              size="sm"
              className="flex-1 text-xs px-3 py-1 h-8"
            >
              View Details
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onHireNow(project);
              }}
              disabled={hasHiredProject}
              className="flex-1 text-xs px-3 py-1 h-8"
              variant={hasHiredProject ? "secondary" : "default"}
            >
              {hasHiredProject ? "Message" : "Hire Now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Buyer Contracts Section Component
function BuyerContractsSection() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.getUserContracts();
      if (response.success) {
        setContracts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading contracts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Contracts</h2>
          <p className="text-muted-foreground">Review and sign contracts to start working with students</p>
        </div>
      </div>

      {contracts.length > 0 ? (
        <div className="grid gap-6">
          {contracts.map((contract) => (
            <ContractManager 
              key={contract.id} 
              contractId={contract.id}
              onContractUpdate={fetchContracts}
            />
          ))}
        </div>
      ) : (
        <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No contracts yet</h3>
            <p className="text-muted-foreground mb-6">
              Contracts will appear here when students accept your hire requests and create agreements.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
