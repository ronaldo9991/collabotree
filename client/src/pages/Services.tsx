import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Star,
  DollarSign,
  Clock,
  User,
  Filter,
  Grid,
  List
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ProjectWithDetails, Service } from "@/types/projects";


export default function Services() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handle hiring a service
  const handleHireService = async (service: Service) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to hire talent.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'buyer') {
      toast({
        title: "Access Denied",
        description: "Only buyers can hire talent. Students can only offer services.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the original project to get the creator ID
      const projects = await api.getProjects({});
      const project = projects.find(p => p.id === service.id);
      
      if (!project) {
        toast({
          title: "Service Not Found",
          description: "This service is no longer available.",
          variant: "destructive",
        });
        return;
      }

      // Create order
      await api.createOrder({
        project_id: service.id,
        seller_id: project.created_by,
        type: 'hire',
        amount_cents: service.price * 100,
      });

      toast({
        title: "Hire Request Sent!",
        description: "Your hire request has been sent to the student. They will review and respond soon.",
      });
    } catch (error) {
      console.error('Error hiring service:', error);
      toast({
        title: "Hire Failed",
        description: "Failed to send hire request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch real services from database
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch open projects from the database
      const projects = await api.getPublicServices({});
      
      // Extract services data from API response
      const servicesData = (projects as any)?.data?.data || (projects as any)?.data || projects || [];
      
      // Convert services to display format
      const servicesFormatted: Service[] = servicesData.map((service: any) => ({
        id: service.id,
        title: service.title,
        description: service.description || 'No description available',
        price: service.priceCents ? service.priceCents / 100 : 0,
        rating: service.averageRating || 0,
        reviews: service.totalReviews || 0,
        deliveryTime: `${Math.max(1, Math.floor((service.priceCents || 0) / 20000))} days`,
        seller: {
          name: service.owner?.name || 'Student',
          rating: service.averageRating || 0
        },
        tags: service.owner?.skills ? JSON.parse(service.owner.skills) : ['General']
      }));
      
      setServices(servicesFormatted);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Listen for review submission events to refresh services
  useEffect(() => {
    const handleReviewSubmitted = () => {
      console.log('🔄 Review submitted, refreshing services...');
      fetchServices(); // Refresh services
    };

    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    return () => window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
  }, [fetchServices]);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-24">
      <div className="container-unified">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Services Marketplace
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Find the Perfect Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Browse and hire talented students for your projects
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search services, skills, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 text-lg py-6 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}
        >
          {loading ? (
            // Loading skeleton
            [...Array(6)].map((_, index) => (
              <Card key={index} className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 hover:border-primary/30 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                          {service.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {service.description}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${service.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          starting from
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Seller Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{service.seller.name}</div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">
                              {service.rating} ({service.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Delivery Time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Delivery in {service.deliveryTime}</span>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleHireService(service)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Hire Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse all services.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
