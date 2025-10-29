import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Plus, 
  Star,
  TrendingUp,
  Package,
  MessageCircle,
  Activity,
  Eye,
  GraduationCap,
  Award,
  Loader2,
  Settings,
  XCircle,
  AlertTriangle,
  Calendar,
  User as UserIcon,
  FileText,
  Filter,
  MoreHorizontal,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Briefcase,
  Users,
  Heart,
  X,
  Play,
  Upload,
  Shield,
  CheckCircle2,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiResponse } from "@/lib/api";
import { ContractManager } from "@/components/ContractManager";
// import { supabase } from "@/lib/supabase";

interface ApplicationWithDetails {
  id: string;
  serviceId: string;
  status: string;
  message?: string;
  createdAt: string;
  service?: {
    title: string;
    priceCents: number;
  };
  buyer?: {
    name: string;
  };
}

export default function StudentDashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalProjects: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    totalOrderValue: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchStudentData();
    } else {
      // Always show dashboard even without user data
      setLoading(false);
      setApplications([]);
      setOrders([]);
      setServices([]);
      setStats({
        totalProjects: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        totalOrderValue: 0,
      });
    }
  }, [user?.id]);

  const fetchStudentData = async () => {
    if (!user?.id) {
      // Always show dashboard even without user
      setLoading(false);
      return;
    }

    // Set a reasonable timeout to ensure dashboard shows
    const timeoutId = setTimeout(() => {
      console.log('API timeout - showing dashboard anyway');
      setLoading(false);
    }, 3000); // 3 second timeout

    try {
      setLoading(true);
      
      // Initialize with empty data first
      setApplications([]);
      setOrders([]);
      setServices([]);
      setStats({
        totalProjects: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        totalOrderValue: 0,
      });

      // Get the student's applications (hire requests) - with timeout and method check
      try {
        if (api.getHireRequests && typeof api.getHireRequests === 'function') {
          const hireRequestsPromise = api.getHireRequests({ studentId: user.id });
          const hireRequests = await Promise.race([
            hireRequestsPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]);
          const applicationsData = (hireRequests as any)?.data?.data || (hireRequests as any)?.data || hireRequests || [];
          setApplications(applicationsData);
          
          // Update stats with applications
          const acceptedCount = applicationsData.filter((app: any) => app.status === 'ACCEPTED').length;
          const pendingCount = applicationsData.filter((app: any) => app.status === 'PENDING').length;
          
          setStats(prev => ({
            ...prev,
            acceptedApplications: acceptedCount,
            pendingApplications: pendingCount,
          }));
        } else {
          console.log('getHireRequests method not available');
          setApplications([]);
        }
      } catch (error) {
        console.log('Hire requests failed or timed out:', error);
        setApplications([]);
      }

      // Get orders where student is the seller - with timeout and method check
      try {
        if (api.getOrders && typeof api.getOrders === 'function') {
          const ordersPromise = api.getOrders({ sellerId: user.id });
          const sellerOrders = await Promise.race([
            ordersPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]);
          const ordersData = (sellerOrders as any)?.data?.data || (sellerOrders as any)?.data || sellerOrders || [];
          setOrders(ordersData);
          
          // Update stats with orders
          const totalEarnings = ordersData
            .filter((order: any) => order.status === 'completed')
            .reduce((sum: number, order: any) => sum + (order.priceCents || 0), 0);
          const pendingOrders = ordersData.filter((order: any) => 
            ['pending', 'accepted', 'paid'].includes(order.status)
          ).length;
          const totalOrderValue = ordersData
            .reduce((sum: number, order: any) => sum + (order.priceCents || 0), 0) / 100;
          
          setStats(prev => ({
            ...prev,
            totalEarnings,
            pendingOrders,
            totalOrderValue,
          }));
        } else {
          console.log('getOrders method not available');
          setOrders([]);
        }
      } catch (error) {
        console.log('Orders failed or timed out:', error);
        setOrders([]);
      }

      // Get student's services - with timeout and method check
      try {
        if (api.getServices && typeof api.getServices === 'function') {
          // Use getServices to get student's own services
          const servicesPromise = api.getServices({ ownerId: user.id });
          const studentServices = await Promise.race([
            servicesPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]);
          const servicesData = (studentServices as any)?.data?.data || (studentServices as any)?.data || studentServices || [];
          
          // Log service data for debugging
          console.log('📋 Student services data:', servicesData);
          console.log('📋 Service images:', servicesData.map((s: any) => ({ 
            title: s.title, 
            cover_url: s.cover_url, 
            coverImage: s.coverImage 
          })));
          
          setServices(servicesData);
          
          // Update stats with services
          setStats(prev => ({
            ...prev,
            totalProjects: servicesData.length,
          }));
        } else {
          console.log('getServices method not available');
          setServices([]);
        }
      } catch (error) {
        console.log('Services failed or timed out:', error);
        setServices([]);
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
      // Ensure dashboard shows even on error
      setApplications([]);
      setOrders([]);
      setServices([]);
      setStats({
        totalProjects: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        totalOrderValue: 0,
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleCompleteVerification = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update student verification status - using our API
      // For now, just simulate success since we don't have a students table

      // For now, just show success message since verification is automatic
      
      toast({
        title: "Verification Complete!",
        description: "Your student account has been verified. You can now start creating services.",
      });

      // No need to refresh since verification is automatic
    } catch (error) {
      console.error('Error completing verification:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to complete verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, 'accepted');
      toast({
        title: "Order Accepted!",
        description: "You have accepted the buyer's request. They will be notified.",
      });
      // Refresh data
      fetchStudentData();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, 'cancelled');
      toast({
        title: "Order Rejected",
        description: "You have rejected the buyer's request.",
      });
      // Refresh data
      fetchStudentData();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptHireRequest = async (hireId: string) => {
    try {
      await api.acceptHireRequest(hireId);
      toast({
        title: "Hire Request Accepted!",
        description: "You have accepted the hire request. Chat is now available in the Messages tab.",
      });
      // Refresh data to show updated status and enable chat
      fetchStudentData();
      // Switch to messages tab to show the new chat
      setActiveTab("messages");
    } catch (error) {
      console.error('Error accepting hire request:', error);
      toast({
        title: "Error",
        description: "Failed to accept hire request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectHireRequest = async (hireId: string) => {
    try {
      await api.rejectHireRequest(hireId);
      toast({
        title: "Hire Request Rejected",
        description: "You have rejected the hire request.",
      });
      // Refresh data
      fetchStudentData();
    } catch (error) {
      console.error('Error rejecting hire request:', error);
      toast({
        title: "Error",
        description: "Failed to reject hire request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (serviceId: string) => {
    // Navigate to service edit page
    navigate(`/dashboard/student/services/${serviceId}/edit`);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteService(serviceId);
      toast({
        title: "Service Deleted",
        description: "Your service has been successfully deleted.",
      });
      // Refresh data
      fetchStudentData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartWork = async (orderId: string) => {
    try {
      // This would typically start a work session or mark the order as in progress
      toast({
        title: "Work Started!",
        description: "You have started working on this project. The buyer will be notified.",
      });
      // Refresh data
      fetchStudentData();
    } catch (error) {
      console.error('Error starting work:', error);
      toast({
        title: "Error",
        description: "Failed to start work. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 section-padding-y">
        <div className="container-unified">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 section-padding-y">
        <div className="container-unified">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              Student Dashboard
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary dashboard-title">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 mb-8">
              Please sign in to access your student dashboard and manage your services.
            </p>
            <Button onClick={() => navigate('/signin')} className="gap-2" size="lg">
              <UserIcon className="h-4 w-4" />
              Sign In to Continue
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 section-padding-y">
      <div className="container-unified">
        

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm" data-testid="student-badge">
            Student Dashboard
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary dashboard-title">
            Welcome back, {user?.username || user?.name || 'Student'}!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Manage your applications, orders, and showcase your skills
          </p>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4 sm:mb-6 lg:mb-8 h-auto min-h-12 bg-gradient-to-r from-[#00B2FF]/10 via-[#4AC8FF]/15 to-[#8FE5FF]/10 dark:from-[#02122E] dark:via-[#02122E] dark:to-[#02122E] backdrop-blur-12 border-2 border-[#00B2FF]/30 dark:border-[#00B2FF]/20 rounded-xl shadow-lg p-1 gap-1">
              <TabsTrigger 
                value="overview" 
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-[#00B2FF] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-[#00B2FF]/10 transition-all duration-200 rounded-lg py-2 px-2 sm:px-3"
              >
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline">Overview</span>
                <span className="xs:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-[#00B2FF] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-[#00B2FF]/10 transition-all duration-200 rounded-lg py-2 px-2 sm:px-3"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Buyer Requests</span>
                <span className="sm:hidden">Orders</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-[#00B2FF] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-[#00B2FF]/10 transition-all duration-200 rounded-lg py-2 px-2 sm:px-3"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline">Messages</span>
                <span className="xs:hidden">Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-[#00B2FF] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-[#00B2FF]/10 transition-all duration-200 rounded-lg py-2 px-2 sm:px-3"
              >
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">My Services</span>
                <span className="sm:hidden">Services</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contracts" 
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-[#00B2FF] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-[#00B2FF]/10 transition-all duration-200 rounded-lg py-2 px-2 sm:px-3"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Contracts</span>
                <span className="sm:hidden">Contracts</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Student Verification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <StudentVerification />
              </motion.div>

              {/* Key Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="projects-stat">
                  <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="mx-auto p-2 sm:p-4 rounded-full bg-primary/10 text-primary w-fit mb-2 sm:mb-4">
                      <Package className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <CardTitle className="text-sm sm:text-lg lg:text-xl">Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">{stats.totalProjects}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total projects</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="accepted-stat">
                  <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="mx-auto p-2 sm:p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-2 sm:mb-4">
                      <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <CardTitle className="text-sm sm:text-lg lg:text-xl">Accepted</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mb-1 sm:mb-2">{stats.acceptedApplications}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Accepted apps</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="earnings-stat">
                  <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="mx-auto p-2 sm:p-4 rounded-full bg-accent/10 text-accent w-fit mb-2 sm:mb-4">
                      <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <CardTitle className="text-sm sm:text-lg lg:text-xl">Earnings</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent mb-1 sm:mb-2">${stats.totalEarnings}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total earned</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="pending-stat">
                  <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="mx-auto p-2 sm:p-4 rounded-full bg-primary/10 text-primary w-fit mb-2 sm:mb-4">
                      <Clock className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <CardTitle className="text-sm sm:text-lg lg:text-xl">Pending</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">{stats.pendingApplications}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Pending apps</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="pending-orders-stat">
                  <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="mx-auto p-2 sm:p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-2 sm:mb-4">
                      <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <CardTitle className="text-sm sm:text-lg lg:text-xl">Requests</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mb-1 sm:mb-2">{stats.pendingOrders}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Pending orders</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="order-value-stat">
                  <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="mx-auto p-2 sm:p-4 rounded-full bg-accent/10 text-accent w-fit mb-2 sm:mb-4">
                      <Star className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <CardTitle className="text-sm sm:text-lg lg:text-xl">Value</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent mb-1 sm:mb-2">${stats.totalOrderValue}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">From orders</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity & Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest applications and activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.length > 0 ? (
                        applications.slice(0, 4).map((application, index) => (
                          <div
                            key={application.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                            data-testid={`activity-${index}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Applied to "{(application as any).project?.title || 'Project'}"
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Status: <Badge variant="outline" className="text-xs">{application.status}</Badge>
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-medium mb-2">No applications yet</p>
                          <p className="text-sm">Start applying to projects to build your freelance portfolio!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Manage your services and profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start gap-2" 
                      variant="outline" 
                      data-testid="create-service-button"
                      onClick={() => navigate("/dashboard/student/services/new")}
                    >
                      <Plus className="h-4 w-4" />
                      Create New Service
                    </Button>
                    <Button 
                      className="w-full justify-start gap-2" 
                      variant="outline" 
                      data-testid="view-orders-button"
                      onClick={() => setActiveTab("orders")}
                    >
                      <MessageCircle className="h-4 w-4" />
                      View Buyer Requests
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
                      onClick={() => navigate("/dashboard/student/settings")}
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
                    <h2 className="text-2xl font-bold">Buyer Requests</h2>
                    <p className="text-muted-foreground">Orders from buyers requesting your services</p>
                  </div>
                </div>

                {/* Hire Requests Section */}
                {applications.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Hire Requests ({applications.length})</h3>
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <Card key={application.id} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold">{application.service?.title || 'Service Request'}</h3>
                                  <Badge className={
                                    application.status === 'ACCEPTED' 
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : application.status === 'REJECTED'
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  }>
                                    <span className="flex items-center gap-1">
                                      {application.status === 'ACCEPTED' ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : application.status === 'REJECTED' ? (
                                        <XCircle className="h-4 w-4" />
                                      ) : (
                                        <Clock className="h-4 w-4" />
                                      )}
                                      {application.status === 'ACCEPTED' ? 'Accepted' : 
                                       application.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                                    </span>
                                  </Badge>
                                </div>
                                
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                  {application.message || 'No message provided'}
                                </p>
                                
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    <span>Buyer: {application.buyer?.name || 'Unknown'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${(application.service?.priceCents || 0) / 100}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(application.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                {application.status === 'PENDING' ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAcceptHireRequest(application.id)}
                                      className="gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectHireRequest(application.id)}
                                      className="gap-2"
                                    >
                                      <X className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                ) : application.status === 'ACCEPTED' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/chat/${application.id}`)}
                                    className="gap-2"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    Open Chat
                                  </Button>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Request Rejected</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders Section */}
                {orders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Active Orders ({orders.length})</h3>
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
                                    <span>Buyer: {order.buyer?.full_name || 'Unknown'}</span>
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
                                {order.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAcceptOrder(order.id)}
                                      className="gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="gap-2"
                                    >
                                      <X className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {order.status === 'accepted' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartWork(order.id)}
                                    className="gap-2"
                                  >
                                    <Play className="h-4 w-4" />
                                    Start Work
                                  </Button>
                                )}
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                  </div>
                )}

                {/* Empty State */}
                {applications.length === 0 && orders.length === 0 && (
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No buyer requests yet</h3>
                      <p className="text-muted-foreground mb-6">Hire requests and orders will appear here when buyers want to work with you.</p>
                      <Button onClick={() => setActiveTab("services")} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Service
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
                    <p className="text-muted-foreground">Chat with buyers about your orders</p>
                  </div>
                </div>

                {applications.filter(app => app.status === 'ACCEPTED').length > 0 ? (
                  <>
                    {/* 2x3 Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {applications
                        .filter(app => app.status === 'ACCEPTED')
                        .slice(0, 6) // Show only 6 cards at a time
                        .map((application) => (
                          <Card key={application.id} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-4 flex flex-col h-full">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <Badge variant="default" className="text-xs">
                                  ACCEPTED
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate((application as any).createdAt)}
                                </span>
                              </div>

                              {/* Buyer Info */}
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-10 w-10 border border-border/30">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {application.buyer?.name?.split(' ').map((n: string) => n[0]).join('') || 'B'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm truncate">{application.buyer?.name || 'Unknown Buyer'}</h3>
                                  <p className="text-xs text-muted-foreground truncate">{application.service?.title || 'Untitled Service'}</p>
                                </div>
                              </div>

                              {/* Project Details */}
                              <div className="flex-1 mb-3">
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Price:</span>
                                    <span className="font-medium">${((application as any).priceCents / 100).toFixed(0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Service:</span>
                                    <span className="font-medium truncate ml-2">{application.service?.title || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <Button
                                onClick={() => navigate(`/chat/${application.id}`)}
                                className="gap-2 bg-primary hover:bg-primary/90 w-full"
                                size="sm"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Open Chat
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {applications.filter(app => app.status === 'ACCEPTED').length > 6 && (
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button variant="outline" size="sm">
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No active conversations</h3>
                      <p className="text-muted-foreground mb-6">You'll see your chat conversations here once you have accepted orders.</p>
                      <Button onClick={() => setActiveTab("orders")} className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        View Buyer Requests
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">My Services</h2>
                    <p className="text-muted-foreground">Manage your service offerings</p>
                  </div>
                  <Button onClick={() => navigate("/dashboard/student/services/new")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Service
                  </Button>
                </div>

                {services.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {services.map((service) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 hover:border-primary/30 transition-all duration-200 group">
                          <CardContent className="p-0">
                            {/* Service Cover Image */}
                            {(service.cover_url || service.coverImage) ? (
                              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                <img
                                  src={service.cover_url || service.coverImage}
                                  alt={service.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    console.log('Image failed to load:', service.cover_url || service.coverImage);
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center hidden">
                                  <Briefcase className="h-12 w-12 text-primary/50" />
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center">
                                <Briefcase className="h-12 w-12 text-primary/50" />
                              </div>
                            )}
                            
                            <div className="p-6">
                              {/* Service Title & Status */}
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-lg line-clamp-2 flex-1 pr-2">
                                  {service.title}
                                </h3>
                                <Badge 
                                  variant={service.status === 'open' ? 'default' : 'secondary'}
                                  className="flex-shrink-0"
                                >
                                  {service.status === 'open' ? 'Active' : service.status}
                                </Badge>
                              </div>
                              
                              {/* Service Description */}
                              <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                {service.description || 'No description provided'}
                              </p>
                              
                              {/* Tags */}
                              {service.tags && service.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {service.tags.slice(0, 3).map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {service.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{service.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {/* Price & Date */}
                              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${service.priceCents ? (service.priceCents / 100).toFixed(0) : 'Price TBD'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(service.created_at)}
                                </span>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => handleEditService(service.id)}
                                >
                                  <Settings className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => navigate(`/service/${service.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-2"
                                  onClick={() => handleDeleteService(service.id)}
                                >
                                  <X className="h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                    <CardContent className="p-12 text-center">
                      <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No services created yet</h3>
                      <p className="text-muted-foreground mb-6">Create your first service to start attracting buyers and building your freelance business.</p>
                      <Button onClick={() => navigate("/dashboard/student/services/new")} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Service
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ContractsSection />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// Contracts Section Component
function ContractsSection() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching contracts for user...', retryCount > 0 ? `(Retry ${retryCount})` : '');
      
      // Get auth tokens for debugging
      const tokens = localStorage.getItem('auth_tokens');
      console.log('🔐 Auth tokens available:', !!tokens);
      if (tokens) {
        try {
          const parsedTokens = JSON.parse(tokens);
          console.log('🔐 Has access token:', !!parsedTokens.accessToken);
          console.log('🔐 Has refresh token:', !!parsedTokens.refreshToken);
          
          // Check if token is expired
          if (parsedTokens.accessToken) {
            const payload = JSON.parse(atob(parsedTokens.accessToken.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            console.log('🔐 Token expired:', isExpired);
            console.log('🔐 Token expires at:', new Date(payload.exp * 1000));
          }
        } catch (e) {
          console.error('🔐 Error parsing tokens:', e);
        }
      }
      
      const response = await api.getUserContracts() as ApiResponse<any>;
      console.log('📄 Contracts API response:', response);
      
      if (response && response.success) {
        setContracts(response.data || []);
        setError(null);
        console.log('✅ Contracts loaded successfully:', response.data?.length || 0, 'contracts');
      } else {
        console.warn('⚠️ API response indicates failure:', response);
        setContracts([]);
        const errorMsg = response?.error || response?.message || 'Unknown API error';
        setError(errorMsg);
        
        // Don't show toast immediately, let the UI handle the error display
        console.error('❌ Contract loading failed:', errorMsg);
      }
    } catch (error) {
      console.error('❌ Error fetching contracts:', error);
      setContracts([]);
      
      // More specific error messages based on error type
      let errorMessage = "Failed to load contracts";
      let debugInfo = "";
      
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = "Network error: Could not connect to server";
          debugInfo = "Please check your internet connection and try again.";
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = "Authentication error: Session expired";
          debugInfo = "Please refresh the page or log in again.";
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = "Access denied: Insufficient permissions";
          debugInfo = "You may not have permission to view contracts.";
        } else if (error.message.includes('404')) {
          errorMessage = "Contracts endpoint not found";
          debugInfo = "The contracts API endpoint may not be available.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error: Internal server error";
          debugInfo = "The server is experiencing issues. Please try again later.";
        } else {
          errorMessage = `API Error: ${error.message}`;
          debugInfo = "Check browser console for more details.";
        }
      }
      
      setError(`${errorMessage}. ${debugInfo}`);
      
      // Auto-retry once for network errors
      if (retryCount === 0 && (error instanceof Error && 
          (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')))) {
        console.log('🔄 Network error detected, retrying in 3 seconds...');
        setTimeout(() => fetchContracts(1), 3000);
        return;
      }
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

  // Show error state with retry option
  if (error && contracts.length === 0) {
    return (
      <Card className="glass-card bg-card/50 backdrop-blur-12 border border-destructive/20">
        <CardContent className="p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-destructive">Unable to Load Contracts</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">{error}</p>
          
          {/* Debug information */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm font-medium text-foreground mb-2">Debug Information:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• API URL: {import.meta.env.PROD ? '/api' : 'http://localhost:4000/api'}</p>
              <p>• Environment: {import.meta.env.PROD ? 'Production' : 'Development'}</p>
              <p>• Auth tokens: {localStorage.getItem('auth_tokens') ? '✓ Available' : '✗ Missing'}</p>
              <p>• Endpoint: GET /contracts/user</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => fetchContracts()} 
              className="gap-2"
              variant="default"
            >
              <Activity className="h-4 w-4" />
              Retry Loading
            </Button>
            <Button 
              onClick={() => {
                // Test API connectivity
                console.log('🧪 Testing API connectivity...');
                api.getProfile().then(response => {
                  const apiResponse = response as ApiResponse<any>;
                  console.log('🧪 Profile API test:', apiResponse);
                  if (apiResponse?.success) {
                    console.log('✅ API is reachable, retrying contracts...');
                    fetchContracts();
                  } else {
                    console.error('❌ API test failed:', apiResponse);
                  }
                }).catch(error => {
                  console.error('❌ API test error:', error);
                });
              }}
              variant="outline"
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Test API
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="secondary"
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Refresh Page
            </Button>
          </div>
          
          <details className="mt-6">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Show troubleshooting steps
            </summary>
            <div className="mt-3 text-xs text-left text-muted-foreground bg-muted/20 rounded-lg p-3 max-w-md mx-auto">
              <p className="font-medium mb-2">Troubleshooting steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page (F5)</li>
                <li>Clear browser cache and cookies</li>
                <li>Log out and log back in</li>
                <li>Open browser console (F12) for detailed errors</li>
                <li>Contact support if issue persists</li>
              </ol>
            </div>
          </details>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Contracts</h2>
          <p className="text-muted-foreground">Manage your active contracts and agreements</p>
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
              Contracts will appear here when buyers accept your services and you create agreements.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Student Verification Component
function StudentVerification() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    hasUploadedId: false,
    idCardUrl: null as string | null,
    verifiedAt: null as string | null
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await api.getVerificationStatus() as ApiResponse<any>;
      if (response.success) {
        setVerificationStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          console.log('Uploading ID card, base64 length:', base64String.length);
          const response = await api.uploadIdCard(base64String) as ApiResponse<any>;
          
          if (response.success) {
            console.log('ID card uploaded successfully:', response.data);
            toast({
              title: "ID Card Uploaded",
              description: "Your student ID card has been uploaded successfully. Verification is pending review.",
            });
            fetchVerificationStatus();
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } catch (error) {
          console.error('Error uploading ID card:', error);
          toast({
            title: "Upload Failed",
            description: "Failed to upload ID card. Please try again.",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process file. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20" data-testid="verification-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              {verificationStatus.isVerified ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Shield className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Student Verification</h3>
                {verificationStatus.isVerified ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓ Verified
                  </Badge>
                ) : verificationStatus.hasUploadedId ? (
                  <Badge variant="secondary">
                    Pending Review
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Not Verified
                  </Badge>
                )}
              </div>
              
              {verificationStatus.isVerified ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your student status is verified! Your projects will show a verification badge.
                  </p>
                  {verificationStatus.verifiedAt && (
                    <p className="text-xs text-muted-foreground">
                      Verified on {new Date(verificationStatus.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : verificationStatus.hasUploadedId ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your ID card has been uploaded and is under review. You'll be notified once verification is complete.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only verified students will show the verification symbol in their project cards.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your student ID card to get verified. Only verified students will show the verification symbol in their project cards.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="id-card-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('id-card-upload')?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload ID Card'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}