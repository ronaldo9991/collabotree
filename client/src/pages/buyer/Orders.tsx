import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Search, 
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  MessageCircle,
  Download,
  Star,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Loader2,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

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
    full_name: string;
    email: string;
    role: string;
  };
  buyer: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export default function BuyerOrders() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userOrders = await api.getUserOrders(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, toast]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.seller.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, text: "Pending Payment" },
      paid: { variant: "default" as const, icon: CheckCircle, text: "Paid" },
      accepted: { variant: "default" as const, icon: CheckCircle, text: "Completed" },
      cancelled: { variant: "destructive" as const, icon: XCircle, text: "Cancelled" },
      refunded: { variant: "outline" as const, icon: AlertTriangle, text: "Refunded" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      switch (action) {
        case 'pay':
          await ordersApi.markOrderPaid(orderId);
          toast({
            title: "Payment Confirmed",
            description: "Order has been marked as paid.",
          });
          break;
        case 'accept':
          await ordersApi.acceptOrder(orderId);
          toast({
            title: "Order Accepted",
            description: "Work has been accepted and completed.",
          });
          break;
        case 'cancel':
          await api.cancelOrder(orderId);
          toast({
            title: "Order Cancelled",
            description: "Order has been cancelled.",
          });
          break;
        case 'refund':
          await ordersApi.requestRefund(orderId);
          toast({
            title: "Refund Requested",
            description: "Refund request has been submitted.",
          });
          break;
      }
      
      // Refresh orders
      const userOrders = await api.getUserOrders(user!.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getOrderActions = (order: OrderWithDetails) => {
    const actions = [];

    switch (order.status) {
      case 'pending':
        actions.push(
          <Button
            key="pay"
            size="sm"
            onClick={() => handleOrderAction(order.id, 'pay')}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Pay Now
          </Button>,
          <Button
            key="cancel"
            size="sm"
            variant="outline"
            onClick={() => handleOrderAction(order.id, 'cancel')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        );
        break;
      case 'paid':
        actions.push(
          <Button
            key="accept"
            size="sm"
            onClick={() => handleOrderAction(order.id, 'accept')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Accept Work
          </Button>,
          <Button
            key="chat"
            size="sm"
            variant="outline"
            onClick={() => navigate(`/chat/${order.id}`)}
            className="text-primary border-primary hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>,
          <Button
            key="refund"
            size="sm"
            variant="outline"
            onClick={() => handleOrderAction(order.id, 'refund')}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Request Refund
          </Button>
        );
        break;
      case 'accepted':
        actions.push(
          <Button
            key="chat"
            size="sm"
            variant="outline"
            onClick={() => navigate(`/chat/${order.id}`)}
            className="text-primary border-primary hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>,
          <Button
            key="rate"
            size="sm"
            variant="outline"
            onClick={() => toast({
              title: "Rating System",
              description: "Rating system coming soon!",
            })}
          >
            <Star className="h-4 w-4 mr-1" />
            Rate & Review
          </Button>
        );
        break;
    }

    return actions;
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only buyers can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/buyer")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-muted-foreground">
              Manage your orders, track progress, and handle payments
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search orders by project title or seller name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12"
                  />
                </div>
                <Button variant="outline" className="sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="accepted">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Card key={index} className="glass-card bg-card/50 backdrop-blur-12">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="glass-card bg-card/50 backdrop-blur-12 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          
                          {/* Order Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">{order.project.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {order.project.description}
                                </p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Seller:</span>
                                <span className="font-medium">{order.seller.full_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-medium">${(order.amount_cents / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Ordered:</span>
                                <span className="font-medium">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                            {getOrderActions(order)}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast({
                                title: "Chat Feature",
                                description: "Direct messaging coming soon!",
                              })}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/service/${order.project.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Project
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card bg-card/50 backdrop-blur-12">
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === "all" 
                        ? "You haven't placed any orders yet. Start by browsing services and hiring talented students!"
                        : `No orders with status "${activeTab}" found.`
                      }
                    </p>
                    {activeTab === "all" && (
                      <Button onClick={() => navigate("/services")}>
                        Browse Services
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
