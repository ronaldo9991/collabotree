import { useState, useEffect, useMemo, useRef } from "react";
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
  X,
  HandCoins
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
    profit: number;
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
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [messageSearch, setMessageSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [contractSearch, setContractSearch] = useState("");
  const [conversationModalOpen, setConversationModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractDetailsLoading, setContractDetailsLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [releasingContractId, setReleasingContractId] = useState<string | null>(null);
  const conversationThreadsRef = useRef<HTMLDivElement | null>(null);

  const [deactivatingServiceId, setDeactivatingServiceId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) {
      return "$0.00";
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value / 100);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const toTitleCase = (value?: string | null) => {
    if (!value) return '—';
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
      navigate('/admin/signin');
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
    
    // Auto-refresh removed - data will only refresh on manual actions or component remount
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

      // Fetch contracts for oversight
      try {
        setContractsLoading(true);
        console.log('Fetching contracts...');
        const contractsResponse = await api.getUserContracts();
        console.log('Contracts response:', contractsResponse);
        if (contractsResponse.success && Array.isArray(contractsResponse.data)) {
          setContracts(contractsResponse.data as any[]);
        } else if (contractsResponse.success && (contractsResponse.data as any)?.data) {
          setContracts((contractsResponse.data as any).data);
        }
      } catch (contractsError) {
        console.error('Error fetching contracts:', contractsError);
        toast({
          title: "Error",
          description: "Failed to load contracts for review.",
          variant: "destructive",
        });
      } finally {
        setContractsLoading(false);
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

  const handleDeactivateService = async (serviceId: string) => {
    try {
      setDeactivatingServiceId(serviceId);
      const response = await api.deactivateService(serviceId);
      if (response.success) {
        toast({
          title: "Service Deactivated",
          description: "The service is no longer visible to buyers.",
        });
        setServices(prev =>
          prev.map(service =>
            service.id === serviceId
              ? { ...service, isActive: false, isTopSelection: false }
              : service
          )
        );
        setTopSelectionServices(prev => prev.filter(service => service.id !== serviceId));
        setStats(prev =>
          prev
            ? {
                ...prev,
                services: {
                  ...prev.services,
                  active: Math.max(0, prev.services.active - 1),
                },
              }
            : prev
        );
      } else {
        throw new Error(response.error || 'Failed to deactivate service');
      }
    } catch (error) {
      console.error('Error deactivating service:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeactivatingServiceId(null);
    }
  };

  const handleViewContract = async (contractId: string) => {
    try {
      setContractDetailsLoading(true);
      const response = await api.getContract(contractId);
      if (response.success && response.data) {
        setSelectedContract(response.data);
        setContractModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
      toast({
        title: "Error",
        description: "Failed to load contract details.",
        variant: "destructive",
      });
    } finally {
      setContractDetailsLoading(false);
    }
  };

  const handleReleasePayout = async (contractId: string) => {
    try {
      setReleasingContractId(contractId);
      const response = await api.releaseContractPayout(contractId);
      if (response.success && response.data) {
        setContracts(prev =>
          prev.map(contract =>
            contract.id === contractId ? response.data : contract
          )
        );
        if (selectedContract?.id === contractId) {
          setSelectedContract(response.data);
        }
        toast({
          title: "Payout Released",
          description: "Funds have been released to the student successfully.",
        });
      } else {
        throw new Error(response.error || 'Failed to release payout');
      }
    } catch (error) {
      console.error('Error releasing payout:', error);
      toast({
        title: "Error",
        description: "Failed to release payout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReleasingContractId(null);
    }
  };

  const filteredMessages = messages.filter(message => 
    message.body.toLowerCase().includes(messageSearch.toLowerCase()) ||
    message.sender.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
    message.room.hireRequest.service.title.toLowerCase().includes(messageSearch.toLowerCase())
  );

  const conversationThreads = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        serviceId: string;
        serviceTitle: string;
        studentName: string;
        studentEmail: string;
        buyerName: string;
        buyerEmail: string;
        messages: Message[];
        latestMessage?: Message;
        lastMessageAt?: string;
      }
    >();

    messages.forEach((message) => {
      const hireRequest = message.room.hireRequest;
      if (!hireRequest?.service) return;

      const threadId = hireRequest.id;
      if (!map.has(threadId)) {
        map.set(threadId, {
          id: threadId,
          serviceId: hireRequest.service.id,
          serviceTitle: hireRequest.service.title,
          studentName: hireRequest.student.name,
          studentEmail: hireRequest.student.email,
          buyerName: hireRequest.buyer.name,
          buyerEmail: hireRequest.buyer.email,
          messages: [],
        });
      }

      const thread = map.get(threadId)!;
      thread.messages.push(message);

      if (
        !thread.latestMessage ||
        new Date(message.createdAt) > new Date(thread.lastMessageAt || 0)
      ) {
        thread.latestMessage = message;
        thread.lastMessageAt = message.createdAt;
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
    );
  }, [messages]);

  const filteredConversationThreads = useMemo(() => {
    const query = messageSearch.toLowerCase();
    if (!query) return conversationThreads;

    return conversationThreads.filter((thread) => {
      return (
        thread.serviceTitle.toLowerCase().includes(query) ||
        thread.studentName.toLowerCase().includes(query) ||
        thread.buyerName.toLowerCase().includes(query)
      );
    });
  }, [conversationThreads, messageSearch]);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.owner.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredContracts = contracts.filter(contract => {
    if (!contractSearch.trim()) return true;
    const query = contractSearch.toLowerCase();
    const serviceTitle = contract?.hireRequest?.service?.title?.toLowerCase() || '';
    const buyerName = contract?.buyer?.name?.toLowerCase() || '';
    const studentName = contract?.student?.name?.toLowerCase() || '';
    const orderNumber = contract?.order?.orderNumber?.toLowerCase() || '';
    const paymentStatus = contract?.paymentStatus?.toLowerCase() || '';
    const payoutStatus = contract?.payoutStatus?.toLowerCase() || '';

    return (
      serviceTitle.includes(query) ||
      buyerName.includes(query) ||
      studentName.includes(query) ||
      orderNumber.includes(query) ||
      paymentStatus.includes(query) ||
      payoutStatus.includes(query)
    );
  });

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
            <Button onClick={() => navigate('/admin/signin')} className="w-full">
              Go to Admin Login
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
          className="container-tight text-center mb-8 sm:mb-12"
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
            Manage the platform, monitor messages, control top selections, and oversee escrow payouts.
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile: Scrollable tabs, Desktop: Grid layout */}
            <div className="overflow-visible mb-6 md:mb-8">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 w-full h-auto bg-card/50 backdrop-blur-12 border-2 border-primary/30 rounded-xl shadow-lg p-2 sm:p-3 gap-2 md:gap-1">
                <TabsTrigger value="overview" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 min-h-[44px] md:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 min-h-[44px] md:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                  <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                  <span>Verification</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 min-h-[44px] md:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                  <span>Messages</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 min-h-[44px] md:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="contracts" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 min-h-[44px] md:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                  <HandCoins className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                  <span>Contracts</span>
                </TabsTrigger>
                <TabsTrigger value="top-selections" className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 min-h-[44px] md:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                  <span>Top Selections</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {stats && (
                <>
                  {/* Real-time Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-md:gap-4"
                  >
          <Card
            role="button"
            tabIndex={0}
            onClick={() => navigate('/dashboard/admin/users')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate('/dashboard/admin/users');
              }
            }}
            className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center cursor-pointer transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <CardHeader className="pb-4 max-md:pb-3 max-md:px-4 max-md:pt-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4 max-md:p-3 max-md:mb-3">
                <Users className="h-8 w-8 max-md:h-6 max-md:w-6" />
              </div>
              <CardTitle className="text-xl max-md:text-base">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="max-md:px-4 max-md:pb-4">
                        <div className="text-3xl font-bold text-primary mb-2 max-md:text-2xl">{stats.users.total}</div>
              <p className="text-sm text-muted-foreground max-md:text-xs">
                          {stats.users.students} Students • {stats.users.buyers} Buyers
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                View full user directory
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
            <CardHeader className="pb-4 max-md:pb-3 max-md:px-4 max-md:pt-4">
              <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4 max-md:p-3 max-md:mb-3">
                <UserCheck className="h-8 w-8 max-md:h-6 max-md:w-6" />
              </div>
              <CardTitle className="text-xl max-md:text-base">Verified Students</CardTitle>
            </CardHeader>
            <CardContent className="max-md:px-4 max-md:pb-4">
                        <div className="text-3xl font-bold text-secondary mb-2 max-md:text-2xl">{stats.users.verifiedStudents}</div>
              <p className="text-sm text-muted-foreground max-md:text-xs">
                          {stats.users.pendingVerifications} pending verification
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
            <CardHeader className="pb-4 max-md:pb-3 max-md:px-4 max-md:pt-4">
              <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4 max-md:p-3 max-md:mb-3">
                <Package className="h-8 w-8 max-md:h-6 max-md:w-6" />
              </div>
                        <CardTitle className="text-xl max-md:text-base">Services</CardTitle>
            </CardHeader>
            <CardContent className="max-md:px-4 max-md:pb-4">
                        <div className="text-3xl font-bold text-accent mb-2 max-md:text-2xl">{stats.services.total}</div>
              <p className="text-sm text-muted-foreground max-md:text-xs">
                          {stats.services.active} active • {stats.services.topSelections} top selections
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
            <CardHeader className="pb-4 max-md:pb-3 max-md:px-4 max-md:pt-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4 max-md:p-3 max-md:mb-3">
                <DollarSign className="h-8 w-8 max-md:h-6 max-md:w-6" />
              </div>
              <CardTitle className="text-xl max-md:text-base">Revenue</CardTitle>
            </CardHeader>
            <CardContent className="max-md:px-4 max-md:pb-4">
                        <div className="text-3xl font-bold text-primary mb-2 max-md:text-2xl">{formatCurrency(stats.revenue.total)}</div>
              <p className="text-sm text-muted-foreground max-md:text-xs">
                          {stats.orders.total} total orders
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Profit (platform fees): {formatCurrency(stats.revenue.profit)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

                  {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-md:gap-4"
                  >
                    <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                      <CardHeader className="pb-4 max-md:pb-3 max-md:px-4 max-md:pt-4">
                        <div className="mx-auto p-4 rounded-full bg-blue-500/10 text-blue-500 w-fit mb-4 max-md:p-3 max-md:mb-3">
                          <MessageCircle className="h-8 w-8 max-md:h-6 max-md:w-6" />
                        </div>
                        <CardTitle className="text-xl max-md:text-base">Messages</CardTitle>
                      </CardHeader>
                      <CardContent className="max-md:px-4 max-md:pb-4">
                        <div className="text-3xl font-bold text-blue-500 mb-2 max-md:text-2xl">{stats.messages.total}</div>
                        <p className="text-sm text-muted-foreground max-md:text-xs">
                          {stats.messages.recent} this {stats.period}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                      <CardHeader className="pb-4 max-md:pb-3 max-md:px-4 max-md:pt-4">
                        <div className="mx-auto p-4 rounded-full bg-green-500/10 text-green-500 w-fit mb-4 max-md:p-3 max-md:mb-3">
                          <CheckCircle className="h-8 w-8 max-md:h-6 max-md:w-6" />
                        </div>
                        <CardTitle className="text-xl max-md:text-base">Hire Requests</CardTitle>
                      </CardHeader>
                      <CardContent className="max-md:px-4 max-md:pb-4">
                        <div className="text-3xl font-bold text-green-500 mb-2 max-md:text-2xl">{stats.hireRequests.total}</div>
                        <p className="text-sm text-muted-foreground max-md:text-xs">
                          {stats.hireRequests.accepted} accepted
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 text-center">
                      <CardHeader className="pb-4 max-md:pb-3 max-md:px-4 max-md:pt-4">
                        <div className="mx-auto p-4 rounded-full bg-purple-500/10 text-purple-500 w-fit mb-4 max-md:p-3 max-md:mb-3">
                          <Star className="h-8 w-8 max-md:h-6 max-md:w-6" />
                        </div>
                        <CardTitle className="text-xl max-md:text-base">Top Selections</CardTitle>
                      </CardHeader>
                      <CardContent className="max-md:px-4 max-md:pb-4">
                        <div className="text-3xl font-bold text-purple-500 mb-2 max-md:text-2xl">{stats.services.topSelections}</div>
              <p className="text-sm text-muted-foreground max-md:text-xs">
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
                  <div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-4">
                    <div>
              <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        All Messages
              </CardTitle>
                      <CardDescription>Track all conversations between students and buyers</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 max-md:w-full">
                      <div className="relative w-64 md:w-80 lg:w-96 max-md:w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                          placeholder="Search messages..."
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          className="pl-10 w-full h-10 max-md:min-h-[44px] max-md:text-base"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="max-md:w-full max-md:min-h-[44px]"
                        onClick={() =>
                          conversationThreadsRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                        }
                      >
                        Conversation Threads
                      </Button>
                    </div>
                  </div>
            </CardHeader>
            <CardContent>
              {filteredMessages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-card border border-primary/10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              message.sender.role === "STUDENT"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px] uppercase tracking-wide w-fit"
                          >
                            {message.sender.role}
                          </Badge>
                          <span className="font-medium text-sm sm:text-base leading-tight">
                            {message.sender.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                        {message.body}
                      </p>

                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-xl p-3">
                        <p className="truncate">
                          <strong>Service:</strong>{" "}
                          {message.room.hireRequest.service.title}
                        </p>
                        <p className="truncate">
                          <strong>Buyer:</strong> {message.room.hireRequest.buyer.name}
                        </p>
                        <p className="truncate">
                          <strong>Student:</strong>{" "}
                          {message.room.hireRequest.student.name}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewConversation(message.room.hireRequest.service.id)}
                        disabled={loadingConversation}
                        className="text-xs max-md:min-h-[44px] max-md:w-full mt-auto"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {loadingConversation ? "Loading..." : "View Full Conversation"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p>No messages found</p>
                </div>
              )}
            </CardContent>
          </Card>
              </motion.div>

              <motion.div
                ref={conversationThreadsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Conversation Threads
                        </CardTitle>
                        <CardDescription>
                          Student–buyer threads grouped by service with latest updates
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="max-md:self-start">
                        {filteredConversationThreads.length} active thread
                        {filteredConversationThreads.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredConversationThreads.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filteredConversationThreads.map((thread) => (
                          <div
                            key={thread.id}
                            className="p-4 rounded-2xl bg-muted/30 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                          >
                            <div className="space-y-1">
                              <h3 className="text-sm sm:text-base font-semibold leading-tight line-clamp-2">
                                {thread.serviceTitle}
                              </h3>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p className="truncate">
                                  <strong>Student:</strong> {thread.studentName}
                                  {thread.studentEmail && (
                                    <span className="text-muted-foreground/70">
                                      {" "}
                                      ({thread.studentEmail})
                                    </span>
                                  )}
                                </p>
                                <p className="truncate">
                                  <strong>Buyer:</strong> {thread.buyerName}
                                  {thread.buyerEmail && (
                                    <span className="text-muted-foreground/70">
                                      {" "}
                                      ({thread.buyerEmail})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <Badge variant="secondary" className="shrink-0">
                                {thread.messages.length} message
                                {thread.messages.length === 1 ? "" : "s"}
                              </Badge>
                              <span>
                                {thread.lastMessageAt
                                  ? new Date(thread.lastMessageAt).toLocaleString()
                                  : "—"}
                              </span>
                            </div>

                            {thread.latestMessage && (
                              <div className="p-3 rounded-xl bg-card border border-border/40 space-y-2">
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                  <span className="font-medium truncate">
                                    {thread.latestMessage.sender.name}
                                  </span>
                                  <span className="whitespace-nowrap">
                                    {new Date(thread.latestMessage.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm line-clamp-3">
                                  {thread.latestMessage.body}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 justify-end mt-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                className="max-md:min-h-[44px] max-md:w-full"
                                onClick={() => handleViewConversation(thread.serviceId)}
                                disabled={loadingConversation}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                View Conversation
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p>No conversation threads found</p>
                        <p className="text-sm">
                          Threads appear once students and buyers exchange messages.
                        </p>
                      </div>
                    )}
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
                  <div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-4">
                    <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                        All Services
              </CardTitle>
                      <CardDescription>Manage all services on the platform</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 max-md:w-full">
                      <div className="relative w-64 md:w-80 lg:w-96 max-md:w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                          placeholder="Search services..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-10 w-full h-10 max-md:min-h-[44px] max-md:text-base"
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
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 max-md:flex-col max-md:items-start max-md:gap-3 max-md:p-3"
                    >
                      <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-medium text-sm sm:text-base break-words overflow-wrap-anywhere min-w-0">{service.title}</h3>
                              {service.isTopSelection && (
                                <Badge variant="default" className="text-xs whitespace-nowrap">
                                  <Star className="h-3 w-3 mr-1" />
                                  Top Selection
                                </Badge>
                              )}
                              <Badge variant={service.isActive ? 'default' : 'secondary'} className="text-xs whitespace-nowrap">
                                {service.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2 break-words overflow-wrap-anywhere">{service.description}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                              <span className="truncate"><strong>Owner:</strong> {service.owner.name}</span>
                              <span className="whitespace-nowrap"><strong>Price:</strong> {formatCurrency(service.priceCents)}</span>
                              <span className="truncate"><strong>University:</strong> {service.owner.university || 'N/A'}</span>
                              {service.owner.isVerified && (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                          </Badge>
                          )}
                        </div>
                          </div>
                          <div className="flex gap-2 max-md:flex-col max-md:w-full">
                            <Button
                              size="sm"
                              variant={service.isTopSelection ? "outline" : "default"}
                              className="max-md:min-h-[44px] max-md:w-full"
                              onClick={() => handleToggleTopSelection(service.id, !service.isTopSelection)}
                            >
                              {service.isTopSelection ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="max-md:min-h-[44px] max-md:w-full"
                              disabled={!service.isActive || deactivatingServiceId === service.id}
                              onClick={() => handleDeactivateService(service.id)}
                            >
                              {deactivatingServiceId === service.id ? (
                                <> <Loader2 className="h-3 w-3 animate-spin mr-2" /> Disabling... </>
                              ) : (
                                <> <XCircle className="h-3 w-3 mr-2" /> Deactivate </>
                              )}
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

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <HandCoins className="h-5 w-5 text-primary" />
                          Escrow & Payouts
                        </CardTitle>
                        <CardDescription>Track contracts, escrowed funds, and release payouts with a single click</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 max-md:w-full">
                        <div className="relative w-64 md:w-80 lg:w-96 max-md:w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                          <Input
                            placeholder="Search contracts, buyers, students..."
                            value={contractSearch}
                            onChange={(e) => setContractSearch(e.target.value)}
                            className="pl-10 w-full h-10 max-md:min-h-[44px] max-md:text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {contractsLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mb-3" />
                        <p>Loading contracts...</p>
                      </div>
                    ) : filteredContracts.length > 0 ? (
                      <div className="space-y-4">
                        {filteredContracts.map((contract: any) => {
                          const canRelease = contract.paymentStatus === 'PAID' && contract.payoutStatus === 'READY_FOR_RELEASE';
                          const isReleased = contract.payoutStatus === 'RELEASED';
                          const serviceTitle = contract?.hireRequest?.service?.title || contract?.title || 'Untitled Contract';
                          const orderNumber = contract?.order?.orderNumber || contract?.orderId || 'Pending';
                          return (
                            <div
                              key={contract.id}
                              className="p-4 rounded-lg bg-muted/30 border border-border/50"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-sm sm:text-base break-words overflow-wrap-anywhere">{serviceTitle}</h3>
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <Badge variant="outline">{toTitleCase(contract.status)}</Badge>
                                    <Badge variant={contract.paymentStatus === 'RELEASED' ? 'default' : 'secondary'}>
                                      Payment: {toTitleCase(contract.paymentStatus)}
                                    </Badge>
                                    <Badge variant={canRelease ? 'default' : isReleased ? 'default' : 'secondary'}>
                                      Payout: {toTitleCase(contract.payoutStatus)}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-right space-y-1 min-w-[160px]">
                                  <div><strong>Order:</strong> {orderNumber}</div>
                                  <div><strong>Created:</strong> {formatDateTime(contract.createdAt)}</div>
                                  {contract.releasedAt && (
                                    <div><strong>Released:</strong> {formatDateTime(contract.releasedAt)}</div>
                                  )}
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
                                <div><strong>Buyer:</strong> {contract.buyer?.name || 'N/A'}</div>
                                <div><strong>Student:</strong> {contract.student?.name || 'N/A'}</div>
                                <div><strong>Service Price:</strong> {formatCurrency(contract?.hireRequest?.service?.priceCents)}</div>
                                <div><strong>Student Payout:</strong> {formatCurrency(contract.studentPayoutCents)}</div>
                                <div><strong>Platform Fee:</strong> {formatCurrency(contract.platformFeeCents)}</div>
                                <div><strong>Escrow Holder:</strong> {contract.escrowHolder?.name || 'Unassigned'}</div>
                              </div>

                              <div className="flex flex-wrap gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="max-md:min-h-[44px]"
                                  onClick={() => handleViewContract(contract.id)}
                                  disabled={contractDetailsLoading && selectedContract?.id === contract.id}
                                >
                                  {contractDetailsLoading && selectedContract?.id === contract.id ? (
                                    <> <Loader2 className="h-3 w-3 animate-spin mr-2" /> Loading... </>
                                  ) : (
                                    <> <FileText className="h-3 w-3 mr-2" /> View Details </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={canRelease ? 'default' : 'outline'}
                                  className="max-md:min-h-[44px]"
                                  disabled={!canRelease || releasingContractId === contract.id}
                                  onClick={() => handleReleasePayout(contract.id)}
                                >
                                  {releasingContractId === contract.id ? (
                                    <> <Loader2 className="h-3 w-3 animate-spin mr-2" /> Releasing... </>
                                  ) : isReleased ? (
                                    <> <CheckCircle className="h-3 w-3 mr-2" /> Released </>
                                  ) : canRelease ? (
                                    <> Release Payout </>
                                  ) : (
                                    <> Awaiting Completion </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <HandCoins className="h-12 w-12 mx-auto mb-4" />
                        <p>No contracts found</p>
                        <p className="text-sm">Contracts will appear here once buyers engage students.</p>
                      </div>
                    )}
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
                <div className="flex items-center justify-between mb-6 max-md:flex-col max-md:items-stretch max-md:gap-4">
                  <div>
                    <h2 className="text-2xl font-bold max-md:text-xl">Top Selections Management</h2>
                    <p className="text-muted-foreground max-md:text-sm">Choose which services to feature on the homepage</p>
                  </div>
                  <div className="flex items-center gap-2 max-md:w-full">
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

      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-primary" />
              Contract Overview
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of the agreement, payment milestones, and payout readiness.
            </DialogDescription>
          </DialogHeader>

          {selectedContract ? (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="text-lg font-semibold mb-2">{selectedContract?.hireRequest?.service?.title || selectedContract.title || 'Untitled Contract'}</h3>
                <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                  {selectedContract?.hireRequest?.service?.description || selectedContract.description || 'No description provided.'}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div><strong>Status:</strong> {toTitleCase(selectedContract.status)}</div>
                  <div><strong>Payment:</strong> {toTitleCase(selectedContract.paymentStatus)}</div>
                  <div><strong>Payout:</strong> {toTitleCase(selectedContract.payoutStatus)}</div>
                  <div><strong>Order:</strong> {selectedContract.order?.orderNumber || selectedContract.orderId || 'Pending'}</div>
                  <div><strong>Escrowed:</strong> {formatDateTime(selectedContract.escrowedAt)}</div>
                  <div><strong>Paid:</strong> {formatDateTime(selectedContract.paidAt)}</div>
                  <div><strong>Released:</strong> {formatDateTime(selectedContract.releasedAt)}</div>
                  <div><strong>Escrow Holder:</strong> {selectedContract.escrowHolder?.name || 'Unassigned'}</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-card/60 border border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Buyer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div><strong>Name:</strong> {selectedContract.buyer?.name || 'Unknown'}</div>
                    <div><strong>Email:</strong> {selectedContract.buyer?.email || 'N/A'}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/60 border border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Student</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div><strong>Name:</strong> {selectedContract.student?.name || 'Unknown'}</div>
                    <div><strong>Email:</strong> {selectedContract.student?.email || 'N/A'}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/60 border border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Financial Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div><strong>Service Price:</strong> {formatCurrency(selectedContract?.hireRequest?.service?.priceCents)}</div>
                  <div><strong>Student Payout:</strong> {formatCurrency(selectedContract.studentPayoutCents)}</div>
                  <div><strong>Platform Commission:</strong> {formatCurrency(selectedContract.platformFeeCents)}</div>
                  <div><strong>Order Status:</strong> {toTitleCase(selectedContract.order?.status)}</div>
                </CardContent>
              </Card>

              {selectedContract?.deliverables && (
                <Card className="bg-card/60 border border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Deliverables</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    {Array.isArray(selectedContract.deliverables)
                      ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedContract.deliverables.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{selectedContract.deliverables}</p>
                      )}
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setContractModalOpen(false)}
                  className="max-md:min-h-[44px]"
                >
                  Close
                </Button>
                {selectedContract.paymentStatus === 'PAID' && selectedContract.payoutStatus === 'READY_FOR_RELEASE' && (
                  <Button
                    onClick={() => handleReleasePayout(selectedContract.id)}
                    disabled={releasingContractId === selectedContract.id}
                    className="max-md:min-h-[44px]"
                  >
                    {releasingContractId === selectedContract.id ? (
                      <> <Loader2 className="h-3 w-3 animate-spin mr-2" /> Releasing... </>
                    ) : (
                      <> Release Payout </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-3" />
              <p>Loading contract details...</p>
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