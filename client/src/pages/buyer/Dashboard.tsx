import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Heart, 
  Star,
  MessageCircle,
  Package,
  DollarSign,
  CheckCircle,
  Activity,
  Users,
  ShoppingCart,
  Eye,
  Briefcase,
  Settings,
  Clock,
  XCircle,
  AlertTriangle,
  Calendar,
  User as UserIcon,
  FileText,
  Loader2,
  Filter,
  MoreHorizontal,
  ArrowRight,
  Plus,
  TrendingUp,
  Code,
  MapPin,
  FolderSync
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ProjectWithDetails } from "@/types/projects";
import { Link } from "wouter";

interface OrderStats {
  totalSpent: number;
  activeOrders: number;
  completedProjects: number;
  savedServices: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface OrderWithDetails {
  id: string;
  project_id: string;
  buyer_id: string;
  seller_id: string;
  type: 'purchase' | 'hire';
  status: 'pending' | 'paid' | 'accepted' | 'cancelled' | 'refunded';
  amount_cents: number;
  created_at: string;
  paid_at: string | null;
  project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    created_at: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function BuyerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [, navigate] = useLocation();
  
  // If no user, redirect to sign in
  if (!user) {
    navigate('/signin');
    return null;
  }
  
  // Temporary: Allow any authenticated user to access buyer dashboard for testing
  // if (user.role !== 'BUYER') {
  //   console.log('User is not a buyer, role:', user.role);
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
  //         <p className="text-muted-foreground mb-6">This dashboard is only available for buyers.</p>
  //         <p className="text-sm text-muted-foreground mb-4">Your role: {user.role}</p>
  //         <Button onClick={() => navigate('/')}>Go Home</Button>
  //       </div>
  //     </div>
  //   );
  // }
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<OrderStats>({
    totalSpent: 0,
    activeOrders: 0,
    completedProjects: 0,
    savedServices: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [hireRequests, setHireRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Using Supabase directly instead of backend API
  // const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch buyer dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch real orders data using the orders API
        const userOrdersResponse = await api.getOrders({ buyerId: user.id });
        const userOrders = Array.isArray(userOrdersResponse?.data) ? userOrdersResponse.data : [];
        setOrders(userOrders);

        // Fetch hire requests sent by this buyer
        try {
          const hireRequestsResponse = await api.getHireRequests();
          const hireRequestsData = (hireRequestsResponse as any)?.data?.data || (hireRequestsResponse as any)?.data || hireRequestsResponse || [];
          setHireRequests(hireRequestsData);
        } catch (hireError) {
          console.log('Error fetching hire requests:', hireError);
          setHireRequests([]);
        }
        
        // Fetch available services/projects for browsing
        try {
          const servicesResponse = await api.getServices();
          const servicesData = (servicesResponse as any)?.data?.data || (servicesResponse as any)?.data || servicesResponse || [];
          
          // Map services to project format for display
          const mappedProjects = servicesData.map((service: any) => ({
            id: service.id,
            title: service.title,
            description: service.description,
            budget: service.priceCents / 100, // Convert cents to dollars
            created_at: service.createdAt,
            created_by: service.ownerId,
            tags: service.owner?.skills && service.owner.skills !== "[]" ? JSON.parse(service.owner.skills) : ['General'],
            creator: {
              full_name: service.owner?.name || 'Student',
              role: 'student'
            },
            rating: 4.5 + Math.random() * 0.5, // Mock rating for now
            totalReviews: Math.floor(Math.random() * 20) + 1, // Mock reviews
            orders: Math.floor(Math.random() * 10) + 1 // Mock orders
          }));
          
          setProjects(mappedProjects);
        } catch (projectError) {
          console.log('Error fetching services:', projectError);
          setProjects([]);
        }

        // Calculate real stats from data
        const totalSpent = userOrders
          .filter((order: any) => order.status === 'paid')
          .reduce((sum: number, order: any) => sum + (order.amountCents / 100), 0);
        
        const activeOrders = userOrders.filter((order: any) => 
          ['pending', 'paid', 'accepted'].includes(order.status)
        ).length;
        
        const completedProjects = userOrders.filter((order: any) => 
          order.status === 'completed'
        ).length;

        setStats({
          totalSpent: Math.round(totalSpent),
          activeOrders,
          completedProjects,
          savedServices: 0, // We'll implement this later with a favorites system
        });

        // Create recent activity from real orders data
        const activities = userOrders.slice(0, 4).map((order: any) => ({
          id: order.id,
          type: order.status,
          description: `Order for ${order.project?.title || 'project'} (${order.status})`,
          timestamp: order.created_at,
        }));
        
        setRecentActivity(activities);

      } catch (error) {
        console.error('Error fetching buyer data:', error);
        
        // Set empty stats instead of demo data
        setStats({
          totalSpent: 0,
          activeOrders: 0,
          completedProjects: 0,
          savedServices: 0,
        });
        setRecentActivity([]);
        setOrders([]);
        
        // Silently handle dashboard data fetch errors
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      if (user) {
        fetchDashboardData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, toast]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <DollarSign className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amountCents: number) => {
    return `$${(amountCents / 100).toFixed(2)}`;
  };

  // Show loading state
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm" data-testid="buyer-badge">
            Buyer Dashboard
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary dashboard-title">
            Welcome back, {(() => {
              // Prioritize username, then first name, then email name
              if (user?.username) {
                return user.username;
              }
              
              const fullName = user?.name;
              if (fullName && fullName.trim()) {
                const firstName = fullName.split(' ')[0];
                return firstName && firstName.length > 0 ? firstName : 'Buyer';
              }
              
              const email = user?.email;
              if (email && email.includes('@')) {
                const emailName = email.split('@')[0];
                return emailName && emailName.length > 0 ? emailName : 'Buyer';
              }
              
              return 'Buyer';
            })()}!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Manage your orders, chat with students, and track your projects
          </p>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 h-12 sm:h-14 bg-card/50 backdrop-blur-12 border-2 border-primary/30 rounded-xl shadow-lg p-1">
              <TabsTrigger 
                value="overview" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg h-full flex items-center justify-center"
              >
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg h-full flex items-center justify-center"
              >
                <span className="hidden sm:inline">My Orders</span>
                <span className="sm:hidden">Orders</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg h-full flex items-center justify-center"
              >
                <span className="hidden sm:inline">Messages</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="browse" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg h-full flex items-center justify-center"
              >
                <span className="hidden sm:inline">Browse Talent</span>
                <span className="sm:hidden">Browse</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Key Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="spent-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                      <DollarSign className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">${stats.totalSpent}</div>
                    <p className="text-sm text-muted-foreground">On projects</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="active-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                      <Package className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Active Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary mb-2">{stats.activeOrders}</div>
                    <p className="text-sm text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="completed-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent mb-2">{stats.completedProjects}</div>
                    <p className="text-sm text-muted-foreground">Projects done</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="saved-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                      <Heart className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Saved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">{stats.savedServices}</div>
                    <p className="text-sm text-muted-foreground">Favorite services</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest actions on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        [...Array(4)].map((_, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="w-2 h-2 rounded-full bg-muted mt-2 flex-shrink-0 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                        ))
                      ) : recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                            data-testid={`activity-${index}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.timestamp)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-medium mb-2">No recent activity</p>
                          <p className="text-sm text-muted-foreground">Start by placing your first order!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Get things done faster</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start gap-2" 
                      variant="outline" 
                      data-testid="browse-services-button"
                      onClick={() => navigate("/marketplace")}
                    >
                      <Search className="h-4 w-4" />
                      Browse Services
                    </Button>
                    <Button 
                      className="w-full justify-start gap-2" 
                      variant="outline" 
                      data-testid="view-orders-button"
                      onClick={() => setActiveTab("orders")}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      View Orders
                    </Button>
                    <Button 
                      className="w-full justify-start gap-2" 
                      variant="outline" 
                      data-testid="check-messages-button"
                      onClick={() => setActiveTab("messages")}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Check Messages
                    </Button>
                    <Button 
                      className="w-full justify-start gap-2" 
                      variant="outline" 
                      data-testid="settings-button"
                      onClick={() => navigate("/dashboard/buyer/settings")}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">My Orders</h2>
                    <p className="text-muted-foreground">Manage your orders and track progress</p>
                  </div>
                  <Button onClick={() => navigate("/services")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Order
                  </Button>
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
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-semibold">{order.project?.title || 'Untitled Project'}</h3>
                                <Badge className={`${getStatusColor(order.status)} border`}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground mb-4 line-clamp-2">
                                {order.project?.description || 'No description available'}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  <span>Student: {order.seller?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{formatAmount(order.amount_cents)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(order.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {(order.status === 'paid' || order.status === 'accepted') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/chat/${order.id}`)}
                                  className="gap-2"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  Chat
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/dashboard/buyer/orders`)}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
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
                      <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">Start by browsing talented students and placing your first order!</p>
                      <Button onClick={() => navigate("/marketplace")} className="gap-2">
                        <Search className="h-4 w-4" />
                        Browse Services
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Messages</h2>
                    <p className="text-muted-foreground">Chat with students about your orders</p>
                  </div>
                </div>

                {hireRequests.filter(hire => hire.status === 'ACCEPTED').length > 0 ? (
                  <div className="space-y-4">
                    {hireRequests
                      .filter(hire => hire.status === 'ACCEPTED')
                      .map((hireRequest) => (
                        <Card key={hireRequest.id} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback>
                                    {hireRequest.student?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{hireRequest.student?.name || 'Unknown Student'}</h3>
                                  <p className="text-sm text-muted-foreground">{hireRequest.service?.title || 'Untitled Service'}</p>
                                  <p className="text-xs text-muted-foreground">${(hireRequest.priceCents / 100).toFixed(0)} • {formatDate(hireRequest.createdAt)}</p>
                                </div>
                              </div>
                              <Button
                                onClick={() => navigate(`/chat/${hireRequest.id}`)}
                                className="gap-2"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Open Chat
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
                      <h3 className="text-xl font-semibold mb-2">No active conversations</h3>
                      <p className="text-muted-foreground mb-6">You'll see your chat conversations here once you have paid or accepted orders.</p>
                      <Button onClick={() => setActiveTab("orders")} className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        View Orders
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* Browse Talent Tab */}
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

                {/* Projects Grid */}
                <BrowseTalentSection searchTerm={searchTerm} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// Browse Talent Section Component
function BrowseTalentSection({ searchTerm }: { searchTerm: string }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const servicesResponse = await api.getServices();
      const servicesData = (servicesResponse as any)?.data?.data || (servicesResponse as any)?.data || servicesResponse || [];
      
      // Map services to project format for display
      const mappedProjects = servicesData.map((service: any) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        budget: service.priceCents / 100, // Convert cents to dollars
        created_at: service.createdAt,
        created_by: service.ownerId,
        tags: service.owner?.skills && service.owner.skills !== "[]" ? JSON.parse(service.owner.skills) : ['General'],
        creator: {
          full_name: service.owner?.name || 'Student',
          role: 'student'
        },
        rating: 4.5 + Math.random() * 0.5, // Mock rating for now
        totalReviews: Math.floor(Math.random() * 20) + 1, // Mock reviews
        orders: Math.floor(Math.random() * 10) + 1 // Mock orders
      }));
      
      setProjects(mappedProjects);
    } catch (error) {
      console.log('Error fetching services:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    !searchTerm || 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  

  const handleHireNow = async (project: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to hire talent.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'BUYER') {
      toast({
        title: "Access Denied",
        description: "Only buyers can hire talent.",
        variant: "destructive",
      });
      return;
    }

    try {
      const hireRequestData = {
        serviceId: project.id,
        message: `I'm interested in hiring you for this project: ${project.title}`,
        priceCents: (project.budget || 0) * 100,
      };
      
      const result = await api.createHireRequest(hireRequestData);

      toast({
        title: "Hire Request Sent!",
        description: "Your hire request has been sent to the student. They will review and respond soon.",
      });
      
      // Refresh data to show the new hire request
      // Note: Data will refresh automatically via the useEffect interval
    } catch (error) {
      console.error('Error hiring:', error);
      toast({
        title: "Hire Failed",
        description: "Failed to send hire request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
            <div className="w-full h-48 bg-muted/20 animate-pulse rounded-t-lg" />
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-muted/20 animate-pulse rounded" />
              <div className="h-3 bg-muted/20 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted/20 animate-pulse rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
        <CardContent className="p-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No projects available at the moment.'}
          </p>
          <Button onClick={() => navigate("/marketplace")} className="gap-2">
            <Users className="h-4 w-4" />
            View Full Marketplace
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.slice(0, 6).map((project) => (
        <Card key={project.id} className="glass-card bg-gradient-to-r from-[#00B2FF]/20 via-[#4AC8FF]/25 to-[#8FE5FF]/20 dark:bg-[#02122E] backdrop-blur-12 hover:shadow-xl hover:scale-105 transition-all duration-300 group h-full flex flex-col border-[#00B2FF]/25 hover:border-[#4AC8FF]/35">
          {/* Project Image */}
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted/10 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-r from-[#00B2FF]/30 via-[#4AC8FF]/35 to-[#8FE5FF]/30 dark:bg-[#02122E] flex items-center justify-center rounded-t-lg">
              <Code className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/25 via-[#4AC8FF]/20 to-[#8FE5FF]/25 group-hover:from-[#00B2FF]/35 group-hover:via-[#4AC8FF]/30 group-hover:to-[#8FE5FF]/35 transition-all duration-200" />
          </div>
          
          <CardContent className="p-4 flex-1 flex flex-col">
            {/* Creator Info */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {(project.creator?.full_name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <div className="font-medium text-sm truncate">{project.creator?.full_name || 'Creator'}</div>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    ✓
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Student
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{project.rating?.toFixed(1) || '5.0'}</span>
                <span className="text-xs text-muted-foreground">({project.totalReviews || 0})</span>
              </div>
            </div>

            {/* Project Info */}
            <h4 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
              {project.title}
            </h4>
            
            <div className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3 min-h-[4.5rem]">
                {project.description || 'No description available'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.max(1, Math.floor((project.budget || 0) / 200))} days</span>
              </div>
              <div className="flex items-center gap-1">
                <FolderSync className="h-3 w-3" />
                <span>{project.orders || 0} orders</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tags?.slice(0, 2).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              )) || []}
              {project.tags && project.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 2}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="text-xl font-bold text-primary">
                ${(project.budget || 0).toFixed(0)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/service/${project.id}`}>
                    View
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleHireNow(project)}
                >
                  Hire Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}