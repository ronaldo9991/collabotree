import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Search, Filter, Star, Clock, FolderSync, Heart, MapPin, Sparkles, TrendingUp, Code, Smartphone, PaintBucket, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ProjectWithDetails } from "@/types/projects";

// Category icon mapping
const categoryIcons: { [key: string]: any } = {
  'Web Development': Code,
  'Design': Smartphone,
  'Graphic Design': PaintBucket,
  'Full-Stack Development': Code,
  'AI & Machine Learning': Sparkles,
  'Mobile Development': Smartphone,
  'default': Code
};

// Updated interface to match our new data structure
interface ProjectCardData extends ProjectWithDetails {
  // Additional fields for display
  rating?: number;
  totalReviews?: number;
  orders?: number;
}

export default function ExploreTalent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const [deliveryDays, setDeliveryDays] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([
    { value: "all", label: "All Categories" }
  ]);

  // Fetch data function
  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true);
      }
      
      const filters = {
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        minBudget: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxBudget: priceRange[1] < 2500 ? priceRange[1] : undefined,
      };

      // Fetch projects (student services)
      const projectsResponse = await api.getProjects(filters);
      console.log('API Response:', projectsResponse);
      
      // Handle API response format: { success: true, data: { data: [...], pagination: {...} } }
      let projectsData: any[] = [];
      if (projectsResponse && typeof projectsResponse === 'object' && 'success' in projectsResponse && projectsResponse.success && 'data' in projectsResponse && projectsResponse.data && typeof projectsResponse.data === 'object' && 'data' in projectsResponse.data) {
        projectsData = projectsResponse.data.data as any[];
      } else if (Array.isArray(projectsResponse)) {
        projectsData = projectsResponse;
      }
      
      console.log('Extracted projects data:', projectsData);
      
      // Map API data to frontend format
      const mappedProjects: ProjectCardData[] = projectsData.map((service: any) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        budget: service.priceCents / 100, // Convert cents to dollars
        cover_url: service.coverImage, // Map coverImage to cover_url
        created_at: service.createdAt,
        updated_at: service.updatedAt || service.createdAt,
        created_by: service.ownerId,
        tags: service.owner?.skills && service.owner.skills !== "[]" ? JSON.parse(service.owner.skills) : ['General'],
        creator: {
          id: service.ownerId || '',
          name: service.owner?.name || 'Student',
          email: service.owner?.email || '',
          role: 'student',
          full_name: service.owner?.name || 'Student',
          isVerified: service.owner?.isVerified || false,
          idCardUrl: service.owner?.idCardUrl,
          verifiedAt: service.owner?.verifiedAt
        },
        rating: 4.5 + Math.random() * 0.5, // Mock rating for now
        totalReviews: Math.floor(Math.random() * 20) + 1, // Mock reviews
        orders: Math.floor(Math.random() * 10) + 1 // Mock orders
      }));
      
      // Set projects data (even if empty)
      setProjects(mappedProjects);
      console.log(`Loaded ${mappedProjects.length} projects from API`);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.log('API Error details:', error);
      
      // Set empty arrays for real data only
      setProjects([]);
      
      // Show error message to user
      toast({
        title: "Unable to Load Projects",
        description: "Please ensure the backend server is running and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and seamless auto-refresh
  useEffect(() => {
    fetchData();
    
    // Set up seamless auto-refresh every 15 seconds (more frequent but silent)
    const interval = setInterval(() => {
      const previousCount = projects.length;
      fetchData(true).then(() => {
        // Only show notification if new projects were added
        if (projects.length > previousCount) {
          toast({
            title: "New Projects Available!",
            description: `${projects.length - previousCount} new project(s) have been added.`,
            duration: 3000,
          });
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [search, category, priceRange, sortBy, toast, projects.length]);


  // Set up categories from project tags
  useEffect(() => {
    // Extract unique categories from project tags
    const uniqueCategories = new Set<string>();
    projects.forEach(project => {
      if (project.tags) {
        project.tags.forEach(tag => uniqueCategories.add(tag));
      }
    });

    const categoryOptions = Array.from(uniqueCategories).map(cat => ({
      value: cat.toLowerCase().replace(/\s+/g, '-'),
      label: cat,
    }));

    setCategories([
      { value: "all", label: "All Categories" },
      ...categoryOptions,
    ]);
  }, [projects]);

  // Helper function for slugify
  const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");

  // Client-side filtering and sorting
  const filteredProjects = projects?.filter((project) => {
    const price = project.budget || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  const sortedProjects = filteredProjects?.sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.budget || 0) - (b.budget || 0);
      case "price-high":
        return (b.budget || 0) - (a.budget || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "delivery":
        // Mock delivery time based on budget
        const aDelivery = Math.max(1, Math.floor((a.budget || 0) / 200));
        const bDelivery = Math.max(1, Math.floor((b.budget || 0) / 200));
        return aDelivery - bDelivery;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen">
      <section className="section-padding-y bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container-unified">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Explore Talent</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover verified student talent from top universities ready to bring your projects to life.
          </p>
          
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1">
            <Card className="glass-card bg-card/50 backdrop-blur-12 p-3 sticky top-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-xs">
                <Filter className="h-3 w-3" />
                Filter Results
              </h3>
              
              <div className="space-y-3">
                {/* Search */}
                <div>
                  <label className="block text-xs font-medium mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Search talent..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-7 h-7 text-xs"
                      data-testid="search-input"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="category-select" className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-xs font-medium mb-1">Delivery Time</label>
                  <Select value={deliveryDays} onValueChange={setDeliveryDays}>
                    <SelectTrigger data-testid="delivery-select" className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Delivery</SelectItem>
                      <SelectItem value="1">24 hours</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium mb-1">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-testid="sort-select" className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="delivery">Fastest Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-medium mb-1">Price Range</label>
                  <div className="px-1 py-1 border border-border rounded bg-background">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={2500}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div className="flex-1 min-w-0 order-1 lg:order-2">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {sortedProjects?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse all projects.
                </p>
              </div>
            ) : loading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 h-full flex flex-col">
                    <div className="w-full h-48 bg-muted/20 animate-pulse rounded-t-lg" />
                    <CardContent className="p-4 flex-1 flex flex-col space-y-3">
                      <div className="h-4 bg-muted/20 animate-pulse rounded" />
                      <div className="h-3 bg-muted/20 animate-pulse rounded w-3/4" />
                      <div className="flex-1" />
                      <div className="h-4 bg-muted/20 animate-pulse rounded w-1/2" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              sortedProjects?.map((project) => (
                <motion.div key={project.id} variants={itemVariants} className="h-full flex">
                  <ProjectCard project={project} />
                </motion.div>
              ))
            )}
          </motion.div>
          </div>
        </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectCardData }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get category icon based on tags or use default
  const getIconForProject = (tags: string[] | null | undefined) => {
    if (!tags) return categoryIcons['default'];
    for (const tag of tags) {
      if (categoryIcons[tag]) return categoryIcons[tag];
    }
    return categoryIcons['default'];
  };
  const IconComponent = getIconForProject(project.tags);

  const handleHireNow = async (project: ProjectCardData) => {
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
      // Create hire request
      const response = await api.createHireRequest({
        serviceId: project.id,
        message: `I'm interested in hiring you for this project: ${project.title}`,
        priceCents: (project.budget || 0) * 100,
      });

      if (response.success) {
        toast({
          title: "Hire Request Sent!",
          description: "Your hire request has been sent to the student. They will review and respond soon.",
        });
      } else {
        throw new Error(response.error || 'Failed to create hire request');
      }
    } catch (error) {
      console.error('Error hiring:', error);
      toast({
        title: "Hire Failed",
        description: "Failed to send hire request. Please ensure the backend server is running and try again.",
        variant: "destructive",
      });
    }
  };

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
              <span className="font-medium text-sm">{project.creator?.full_name || 'Creator'}</span>
              {project.creator?.isVerified && (
                <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓
                </Badge>
              )}
            </div>
          </div>
          <div className="text-xl font-bold text-primary">
            ${(project.budget || 0).toFixed(0)}
          </div>
        </div>

        {/* Project Title */}
        <Link href={`/service/${project.id}`}>
          <h3 className="font-semibold text-base mb-2 hover:text-primary transition-colors line-clamp-2 cursor-pointer">
            {project.title}
          </h3>
        </Link>

        {/* Simple Description */}
        <div className="flex-1 mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description?.length > 80 
              ? `${project.description.substring(0, 80)}...` 
              : project.description || 'No description available'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 min-w-[100px] text-center justify-center items-center px-1"
            asChild 
            data-testid={`view-project-${project.id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link href={`/service/${project.id}`} className="w-full text-center text-xs whitespace-nowrap">
              View Details
            </Link>
          </Button>
          <Button 
            size="sm"
            className="flex-1 min-w-[80px] text-center justify-center items-center px-1"
            data-testid={`hire-now-${project.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleHireNow(project);
            }}
          >
            <span className="text-xs whitespace-nowrap">Hire Now</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
