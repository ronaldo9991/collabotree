import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign,
  Package,
  MessageCircle,
  Eye,
  FileText,
  Shield,
  BarChart3,
  Loader2,
  Settings,
  UserCheck,
  Activity,
  Search,
  Star,
  StarOff,
  Filter,
  Calendar,
  Clock,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface AdminStats {
  users: {
    total: number;
    students: number;
    buyers: number;
  verifiedStudents: number;
  pendingVerifications: number;
  };
  services: {
    total: number;
    active: number;
    topSelections: number;
  };
  hireRequests: {
    total: number;
    accepted: number;
  };
  messages: {
    total: number;
    recent: number;
  };
  orders: {
    total: number;
    completed: number;
  };
  revenue: {
    total: number;
  };
  topSelectionServices: Service[];
  period: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  coverImage?: string;
  isActive: boolean;
  isTopSelection: boolean;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    university?: string;
    isVerified: boolean;
  };
  _count?: {
    hireRequests: number;
    orders: number;
  };
}

interface ConversationData {
  service: {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    owner: {
      id: string;
      name: string;
      university?: string;
      isVerified?: boolean;
    };
    hireRequests: Array<{
      buyer: {
        id: string;
        name: string;
        university?: string;
        isVerified?: boolean;
      };
    }>;
  };
  messages: Array<{
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      role: string;
      university?: string;
      isVerified?: boolean;
    };
  }>;
  participants: {
    student: {
      id: string;
      name: string;
      university?: string;
      isVerified?: boolean;
    };
    buyers: Array<{
      id: string;
      name: string;
      university?: string;
      isVerified?: boolean;
    }>;
  };
}

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  room: {
    hireRequest: {
      id: string;
      buyer: {
        id: string;
        name: string;
        email: string;
      };
      student: {
        id: string;
        name: string;
        email: string;
      };
      service: {
  id: string;
  title: string;
      };
    };
  };
  readBy: Array<{
    user: {
      id: string;
      name: string;
    };
    readAt: string;
  }>;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [topSelectionServices, setTopSelectionServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [messageSearch, setMessageSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [conversationModalOpen, setConversationModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);

  useEffect(() => {
    console.log('Admin dashboard - Current user:', user);
    console.log('User role:', user?.role);
    console.log('Is authenticated:', !!user);
    
    if (!user) {
      console.error('User not authenticated');
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'ADMIN') {
      console.error('Access denied - User role:', user?.role);
      toast({
        title: "Access Denied",
        description: `You don't have permission to access the admin dashboard. Your role: ${user?.role || 'None'}. Please log in as an admin.`,
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    console.log('User has admin access, fetching admin data...');
    fetchAdminData();
    
    // Set up auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(() => {
      if (user?.role === 'ADMIN') {
        fetchAdminData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, toast]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin data...');
      console.log('Current user:', user);
      console.log('Auth token:', localStorage.getItem('auth_tokens'));

      // Fetch admin stats
      console.log('Fetching admin stats...');
      const statsResponse = await api.getAdminStats({ period: 'week' });
      console.log('Stats response:', statsResponse);
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as AdminStats);
      }

      // Fetch recent messages
      console.log('Fetching messages...');
      const messagesResponse = await api.getAllMessages({ limit: 20 });
      console.log('Messages response:', messagesResponse);
      if (messagesResponse.success && messagesResponse.data) {
        const responseData = messagesResponse.data as any;
        setMessages(responseData.data || []);
      }

      // Fetch all services
      console.log('Fetching services...');
      const servicesResponse = await api.getAllServices({ limit: 50 });
      console.log('Services response:', servicesResponse);
      if (servicesResponse.success && servicesResponse.data) {
        const responseData = servicesResponse.data as any;
        setServices(responseData.services || []);
      }

      // Fetch top selection services
      console.log('Fetching top selections...');
      const topSelectionResponse = await api.getTopSelectionServices();
      console.log('Top selection response:', topSelectionResponse);
      if (topSelectionResponse.success && topSelectionResponse.data) {
        setTopSelectionServices(topSelectionResponse.data as Service[]);
      }

      // Fetch pending verifications
      console.log('Fetching pending verifications...');
      const verificationResponse = await api.getPendingVerifications();
      console.log('Verification response:', verificationResponse);
      if (verificationResponse.success && verificationResponse.data) {
        setPendingVerifications(verificationResponse.data as any[]);
      }

      console.log('Admin data fetch completed successfully');

    } catch (error) {
      console.error('Error fetching admin data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const handleToggleTopSelection = async (serviceId: string, isTopSelection: boolean) => {
    try {
      // Optimistically update the UI immediately
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === serviceId
            ? { ...service, isTopSelection }
            : service
        )
      );

      setTopSelectionServices(prevTopSelections => {
        if (isTopSelection) {
          // Add to top selections
          const serviceToAdd = services.find(s => s.id === serviceId);
          return serviceToAdd ? [...prevTopSelections, { ...serviceToAdd, isTopSelection: true }] : prevTopSelections;
        } else {
          // Remove from top selections
          return prevTopSelections.filter(service => service.id !== serviceId);
        }
      });

      const response = await api.updateTopSelection(serviceId, isTopSelection);
      if (response.success) {
        toast({
          title: "Success",
          description: `Service ${isTopSelection ? 'added to' : 'removed from'} top selections.`,
        });
        // Refresh data to ensure consistency
        fetchAdminData();
      } else {
        // Revert optimistic update on failure
        setServices(prevServices =>
          prevServices.map(service =>
            service.id === serviceId
              ? { ...service, isTopSelection: !isTopSelection }
              : service
          )
        );
        throw new Error(response.error || 'Failed to update top selection');
      }
    } catch (error) {
      console.error('Error updating top selection:', error);
      toast({
        title: "Error",
        description: "Failed to update top selection. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === serviceId
            ? { ...service, isTopSelection: !isTopSelection }
            : service
        )
      );
    }
  };

  const handleViewConversation = async (serviceId: string) => {
    try {
      setLoadingConversation(true);
      const response = await api.getServiceConversation(serviceId);
      
      console.log('Conversation response:', response);
      
      if (response.success && response.data) {
        console.log('Conversation data:', response.data);
        setSelectedConversation(response.data as ConversationData);
        setConversationModalOpen(true);
      } else {
        throw new Error(response.error || 'Failed to fetch conversation');
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingConversation(false);
    }
  };

  const filteredMessages = messages.filter(message => 
    message.body.toLowerCase().includes(messageSearch.toLowerCase()) ||
    message.sender.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
    message.room.hireRequest.service.title.toLowerCase().includes(messageSearch.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.owner.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if user is not admin
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your role: <strong>{user.role}</strong>
            </p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="gap-2 bg-primary/10 text-primary border-primary/20">
              <Shield className="h-4 w-4" />
            Admin Dashboard
          </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary dashboard-title">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Manage the platform, monitor messages, and control top selections
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 sm:mb-8 h-12 sm:h-14 bg-card/50 backdrop-blur-12 border-2 border-primary/30 rounded-xl shadow-lg p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="verification" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <UserCheck className="h-4 w-4" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageCircle className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="top-selections" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="h-4 w-4" />
                Top Selections
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {stats && (
                <>
                  {/* Real-time Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <Users className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
                        <div className="text-3xl font-bold text-primary mb-2">{stats.users.total}</div>
              <p className="text-sm text-muted-foreground">
                          {stats.users.students} Students • {stats.users.buyers} Buyers
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                <UserCheck className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Verified Students</CardTitle>
            </CardHeader>
            <CardContent>
                        <div className="text-3xl font-bold text-secondary mb-2">{stats.users.verifiedStudents}</div>
              <p className="text-sm text-muted-foreground">
                          {stats.users.pendingVerifications} pending verification
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                <Package className="h-8 w-8" />
              </div>
                        <CardTitle className="text-xl">Services</CardTitle>
            </CardHeader>
            <CardContent>
                        <div className="text-3xl font-bold text-accent mb-2">{stats.services.total}</div>
              <p className="text-sm text-muted-foreground">
                          {stats.services.active} active • {stats.services.topSelections} top selections
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
                        <div className="text-3xl font-bold text-primary mb-2">${Math.round(stats.revenue.total)}</div>
              <p className="text-sm text-muted-foreground">
                          {stats.orders.total} total orders
              </p>
            </CardContent>
          </Card>
        </motion.div>

                  {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                      <CardHeader className="pb-4">
                        <div className="mx-auto p-4 rounded-full bg-blue-500/10 text-blue-500 w-fit mb-4">
                          <MessageCircle className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl">Messages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-500 mb-2">{stats.messages.total}</div>
                        <p className="text-sm text-muted-foreground">
                          {stats.messages.recent} this {stats.period}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                      <CardHeader className="pb-4">
                        <div className="mx-auto p-4 rounded-full bg-green-500/10 text-green-500 w-fit mb-4">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl">Hire Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-500 mb-2">{stats.hireRequests.total}</div>
                        <p className="text-sm text-muted-foreground">
                          {stats.hireRequests.accepted} accepted
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                      <CardHeader className="pb-4">
                        <div className="mx-auto p-4 rounded-full bg-purple-500/10 text-purple-500 w-fit mb-4">
                          <Star className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl">Top Selections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-500 mb-2">{stats.services.topSelections}</div>
              <p className="text-sm text-muted-foreground">
                          Featured services
              </p>
            </CardContent>
          </Card>
                  </motion.div>
                </>
              )}
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              <StudentVerificationQueue />
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
              <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        All Messages
              </CardTitle>
                      <CardDescription>Track all conversations between students and buyers</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search messages..."
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((message) => (
                    <div
                          key={message.id}
                          className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={message.sender.role === 'STUDENT' ? 'default' : 'secondary'} className="text-xs">
                                {message.sender.role}
                          </Badge>
                              <span className="font-medium text-sm">{message.sender.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{message.body}</p>
                            <div className="text-xs text-muted-foreground mb-3">
                              <p><strong>Service:</strong> {message.room.hireRequest.service.title}</p>
                              <p><strong>Buyer:</strong> {message.room.hireRequest.buyer.name}</p>
                              <p><strong>Student:</strong> {message.room.hireRequest.student.name}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewConversation(message.room.hireRequest.service.id)}
                          disabled={loadingConversation}
                          className="text-xs"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {loadingConversation ? "Loading..." : "View Full Conversation"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p>No messages found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
              </motion.div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                        All Services
              </CardTitle>
                      <CardDescription>Manage all services on the platform</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search services..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                    <div
                          key={service.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{service.title}</h3>
                              {service.isTopSelection && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Top Selection
                                </Badge>
                              )}
                              <Badge variant={service.isActive ? 'default' : 'secondary'} className="text-xs">
                                {service.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span><strong>Owner:</strong> {service.owner.name}</span>
                              <span><strong>Price:</strong> ${service.priceCents / 100}</span>
                              <span><strong>University:</strong> {service.owner.university || 'N/A'}</span>
                              {service.owner.isVerified && (
                          <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                          </Badge>
                          )}
                        </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={service.isTopSelection ? "outline" : "default"}
                              onClick={() => handleToggleTopSelection(service.id, !service.isTopSelection)}
                            >
                              {service.isTopSelection ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                            </Button>
                      </div>
                    </div>
                  ))
                ) : (
                      <div className="text-center text-muted-foreground py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p>No services found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
            </TabsContent>

            {/* Top Selections Tab */}
            <TabsContent value="top-selections" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Top Selections Management</h2>
                    <p className="text-muted-foreground">Choose which services to feature on the homepage</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Top Selections */}
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Currently Featured ({topSelectionServices.length})
              </CardTitle>
                    <CardDescription>Services currently shown on the homepage</CardDescription>
            </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topSelectionServices.length > 0 ? (
                        topSelectionServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{service.title}</h3>
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span><strong>Owner:</strong> {service.owner.name}</span>
                                <span><strong>Price:</strong> ${service.priceCents / 100}</span>
                                <span><strong>University:</strong> {service.owner.university || 'N/A'}</span>
                                {service.owner.isVerified && (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
              <Button 
                                size="sm"
                variant="outline"
                                onClick={() => handleToggleTopSelection(service.id, false)}
              >
                                <StarOff className="h-3 w-3 mr-1" />
                                Remove
              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p>No services featured yet</p>
                          <p className="text-sm">Select services from the list below to feature them</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* All Services - Available to Feature */}
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      All Services ({filteredServices.length})
                    </CardTitle>
                    <CardDescription>Click the star to feature a service on the homepage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                          <div
                            key={service.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                              service.isTopSelection 
                                ? 'bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20' 
                                : 'bg-muted/30 border-border/50 hover:border-primary/30'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{service.title}</h3>
                                {service.isTopSelection && (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                <Badge variant={service.isActive ? 'default' : 'secondary'} className="text-xs">
                                  {service.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span><strong>Owner:</strong> {service.owner.name}</span>
                                <span><strong>Price:</strong> ${service.priceCents / 100}</span>
                                <span><strong>University:</strong> {service.owner.university || 'N/A'}</span>
                                {service.owner.isVerified && (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
              <Button 
                                size="sm"
                                variant={service.isTopSelection ? "outline" : "default"}
                                onClick={() => handleToggleTopSelection(service.id, !service.isTopSelection)}
                                className="gap-2"
                              >
                                {service.isTopSelection ? (
                                  <>
                                    <StarOff className="h-3 w-3" />
                                    Remove
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-3 w-3" />
                                    Feature
                                  </>
                                )}
              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p>No services found</p>
                          <p className="text-sm">Try adjusting your search terms</p>
                        </div>
                      )}
                    </div>
            </CardContent>
          </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Conversation Modal */}
      <Dialog open={conversationModalOpen} onOpenChange={setConversationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Full Conversation
            </DialogTitle>
            <DialogDescription>
              Complete conversation history between buyer and student
            </DialogDescription>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Service Info */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{selectedConversation.service.title}</CardTitle>
                  <CardDescription>{selectedConversation.service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span> ${selectedConversation.service.priceCents / 100}
                    </div>
                    <div>
                      <span className="font-medium">Student:</span> {selectedConversation.participants.student.name}
                      {selectedConversation.participants.student.university && (
                        <span className="text-muted-foreground"> ({selectedConversation.participants.student.university})</span>
                      )}
                      {selectedConversation.participants.student.isVerified && (
                        <Badge variant="default" className="ml-2 text-xs">Verified</Badge>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Buyers:</span> {selectedConversation.participants.buyers.map(b => b.name).join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <div className="space-y-3">
                {selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 p-3 rounded-lg ${
                        message.sender.role === 'STUDENT' 
                          ? 'bg-blue-500/10 border border-blue-500/20' 
                          : 'bg-green-500/10 border border-green-500/20'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          message.sender.role === 'STUDENT' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.sender.name}</span>
                          <Badge variant={message.sender.role === 'STUDENT' ? 'default' : 'secondary'} className="text-xs">
                            {message.sender.role}
                          </Badge>
                          {message.sender.university && (
                            <span className="text-xs text-muted-foreground">{message.sender.university}</span>
                          )}
                          {message.sender.isVerified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p>No messages found for this service</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Student Verification Queue Component
function StudentVerificationQueue() {
  const { toast } = useToast();
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending verifications...');
      console.log('API base URL:', 'http://localhost:4000/api');
      console.log('Auth token:', localStorage.getItem('auth_tokens'));
      
      // Test verification endpoint first
      try {
        const healthResponse = await api.testVerificationEndpoint();
        console.log('Verification endpoint health check:', healthResponse);
      } catch (healthError) {
        console.error('Verification endpoint health check failed:', healthError);
      }
      
      const response = await api.getPendingVerifications();
      console.log('Pending verifications response:', response);
      
      if (response.success) {
        console.log('Pending verifications data:', response.data);
        setPendingVerifications(response.data as any[]);
      } else {
        console.error('API returned error:', response.error);
        toast({
          title: "API Error",
          description: response.error || "Failed to load pending verifications.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      toast({
        title: "Network Error",
        description: `Failed to load pending verifications: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async (studentId: string) => {
    try {
      setProcessing(studentId);
      const response = await api.verifyStudent(studentId);
      if (response.success) {
        toast({
          title: "Student Verified",
          description: "Student verification approved successfully.",
        });
        fetchPendingVerifications();
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying student:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectStudent = async (studentId: string, reason?: string) => {
    try {
      setProcessing(studentId);
      const response = await api.rejectStudent(studentId, reason);
      if (response.success) {
        toast({
          title: "Verification Rejected",
          description: "Student verification rejected successfully.",
        });
        fetchPendingVerifications();
      } else {
        throw new Error(response.error || 'Rejection failed');
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Student Verification Queue
          </CardTitle>
          <CardDescription>
            Review and approve student ID card uploads for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingVerifications.length > 0 ? (
            <div className="space-y-4">
              {pendingVerifications.map((student) => (
                <Card key={student.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            {student.university && (
                              <p className="text-xs text-muted-foreground">{student.university}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Pending Review</Badge>
                          </div>
                        </div>
                        
                        {student.idCardUrl && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Student ID Card:</p>
                            <div className="border rounded-lg p-2 bg-muted/50">
                              <ImageDisplay 
                                src={student.idCardUrl}
                                alt="Student ID Card"
                                className="max-w-full h-auto max-h-64 object-contain rounded"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyStudent(student.id)}
                            disabled={processing === student.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectStudent(student.id, "ID card not clear or invalid")}
                            disabled={processing === student.id}
                          >
                            {processing === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p>No pending verifications</p>
              <p className="text-sm">All student verifications are up to date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Image Display Component with proper base64 handling
function ImageDisplay({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    // Handle different image source formats
    if (src.startsWith('data:')) {
      setImageSrc(src);
    } else if (src.startsWith('http')) {
      setImageSrc(src);
    } else {
      // Assume it's base64 data without the data URL prefix
      setImageSrc(`data:image/jpeg;base64,${src}`);
    }
    setImageError(false);
  }, [src]);

  if (imageError) {
    return (
      <div className="flex items-center justify-center h-32 bg-muted/30 rounded">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Image failed to load</p>
          <p className="text-xs">Please check the uploaded file</p>
          <p className="text-xs mt-1">Debug: {src.substring(0, 50)}...</p>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        console.error('Image load error for src:', src.substring(0, 100));
        setImageError(true);
      }}
      onLoad={() => {
        console.log('Image loaded successfully');
      }}
    />
  );
}