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
  Search,
  Briefcase,
  Users,
  Heart,
  X,
  Play
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { applicationsApi, projectsApi, ordersApi, type ApplicationWithDetails } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function StudentDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    totalOrderValue: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchStudentData();
    }
  }, [user?.id]);

  const fetchStudentData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get the student's applications
      const studentApplications = await applicationsApi.getStudentApplications(user.id);
      setApplications(studentApplications);

      // Get orders where student is the seller (buyer requests)
      const sellerOrders = await ordersApi.getSellerOrders(user.id);
      setOrders(sellerOrders);

      // Get student's services (projects they created)
      const studentServices = await projectsApi.getUserProjects(user.id);
      setServices(studentServices);

      // Calculate stats from real data
      const totalApplications = studentApplications.length;
      const acceptedApplications = studentApplications.filter(app => app.status === 'accepted').length;
      const pendingApplications = studentApplications.filter(app => app.status === 'pending').length;
      const totalEarnings = studentApplications
        .filter(app => app.status === 'accepted')
        .reduce((sum, app) => sum + (app.bid_amount || 0), 0);

      // Calculate order stats
      const pendingOrders = sellerOrders.filter(order => order.status === 'pending').length;
      const totalOrderValue = sellerOrders
        .filter(order => order.status === 'paid' || order.status === 'accepted')
        .reduce((sum, order) => sum + (order.amount_cents || 0), 0) / 100; // Convert cents to dollars

      setStats({
        totalApplications,
        acceptedApplications,
        pendingApplications,
        totalEarnings,
        pendingOrders,
        totalOrderValue,
      });

      // If no real data, show helpful message instead of demo data
      if (studentApplications.length === 0 && sellerOrders.length === 0) {
        console.log('No applications or orders found for student');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      
      // Set empty stats instead of demo data
      setStats({
        totalApplications: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        totalOrderValue: 0,
      });
      setApplications([]);
      setOrders([]);
      setServices([]);
      
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
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
      // Update student verification status using user_id instead of id
      const { error } = await supabase
        .from('students')
        .update({ is_verified: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }

      // Update local user state
      const updatedUser = {
        ...user,
        student: {
          ...user.student,
          is_verified: true,
        }
      };
      
      // Update localStorage
      localStorage.setItem('collabotree_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Verification Complete!",
        description: "Your student account has been verified. You can now start creating services.",
      });

      // Refresh the page to update UI
      window.location.reload();
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
      await ordersApi.acceptOrder(orderId);
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
      await ordersApi.cancelOrder(orderId);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="student-badge">
            Student Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome back, {(() => {
              // Get first name from full_name or email
              const fullName = user?.full_name;
              const email = user?.email;
              
              if (fullName && fullName.trim()) {
                const firstName = fullName.split(' ')[0];
                return firstName && firstName.length > 0 ? firstName : 'Student';
              }
              
              if (email && email.includes('@')) {
                const emailName = email.split('@')[0];
                return emailName && emailName.length > 0 ? emailName : 'Student';
              }
              
              return 'Student';
            })()}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
            <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-card/50 backdrop-blur-12 border border-primary/20 rounded-xl">
              <TabsTrigger 
                value="overview" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-primary/30 transition-all duration-200 rounded-lg"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-primary/30 transition-all duration-200 rounded-lg"
              >
                Buyer Requests
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-primary/30 transition-all duration-200 rounded-lg"
              >
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-primary/30 transition-all duration-200 rounded-lg"
              >
                My Services
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Verification Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20" data-testid="verification-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.student?.verified ? (
                          <CheckCircle className="h-6 w-6 text-primary" />
                        ) : (
                          <Clock className="h-6 w-6 text-secondary" />
                        )}
                        <div>
                          <Badge 
                            variant={user.student?.verified ? "default" : "secondary"}
                            className={user.student?.verified ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
                            data-testid="verification-status"
                          >
                            {user.student?.verified ? "✓ Verified Student" : "⏳ Pending Verification"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.student?.verified ? "Your account is verified and ready for business" : "Complete verification to start selling"}
                          </p>
                        </div>
                      </div>
                      {!user.student?.verified && (
                        <Button 
                          variant="outline" 
                          data-testid="complete-verification-button"
                          onClick={handleCompleteVerification}
                        >
                          Complete Verification
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Key Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="applications-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                      <Package className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">{stats.totalApplications}</div>
                    <p className="text-sm text-muted-foreground">Total applications</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="accepted-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Accepted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary mb-2">{stats.acceptedApplications}</div>
                    <p className="text-sm text-muted-foreground">Accepted applications</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="earnings-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                      <DollarSign className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent mb-2">${stats.totalEarnings}</div>
                    <p className="text-sm text-muted-foreground">Total earnings</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="pending-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                      <Clock className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">{stats.pendingApplications}</div>
                    <p className="text-sm text-muted-foreground">Pending applications</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="pending-orders-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                      <MessageCircle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Buyer Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary mb-2">{stats.pendingOrders}</div>
                    <p className="text-sm text-muted-foreground">Pending orders</p>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center" data-testid="order-value-stat">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                      <Star className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent mb-2">${stats.totalOrderValue}</div>
                    <p className="text-sm text-muted-foreground">From orders</p>
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
                                Applied to "{application.project.title}"
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

                {orders.length > 0 ? (
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
                ) : (
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No buyer requests yet</h3>
                      <p className="text-muted-foreground mb-6">Buyer requests will appear here when someone wants to hire you for a project.</p>
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

                {orders.filter(order => order.status === 'paid' || order.status === 'accepted').length > 0 ? (
                  <div className="space-y-4">
                    {orders
                      .filter(order => order.status === 'paid' || order.status === 'accepted')
                      .map((order) => (
                        <Card key={order.id} className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback>
                                    {order.buyer?.full_name?.split(' ').map(n => n[0]).join('') || 'B'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{order.buyer?.full_name || 'Unknown Buyer'}</h3>
                                  <p className="text-sm text-muted-foreground">{order.project?.title || 'Untitled Project'}</p>
                                  <p className="text-xs text-muted-foreground">{formatAmount(order.amount_cents)} • {formatDate(order.created_at)}</p>
                                </div>
                              </div>
                              <Button
                                onClick={() => navigate(`/chat/${order.id}`)}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            {service.cover_url ? (
                              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                <img
                                  src={service.cover_url}
                                  alt={service.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
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
                                  ${service.budget || 'Price TBD'}
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
                                  className="flex-1 gap-2"
                                  onClick={() => navigate(`/dashboard/student/services/${service.id}/edit`)}
                                >
                                  <Settings className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 gap-2"
                                  onClick={() => navigate(`/services/${service.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                  View
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
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}