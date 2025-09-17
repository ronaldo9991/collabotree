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
import { projectsApi, ordersApi, type ProjectWithDetails } from "@/lib/api";

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

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        const filters = {
          search: search || undefined,
          category: category !== 'all' ? category : undefined,
          minBudget: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxBudget: priceRange[1] < 2500 ? priceRange[1] : undefined,
        };

        const data = await projectsApi.getOpenProjects(filters);
        
        // Use real data only - no mock data
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [search, category, priceRange, sortBy, toast]);

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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified student talent from top universities ready to bring your projects to life.
          </p>
        </div>

        {/* Filters Section - Top */}
        <div className="mb-8">
          <Card className="glass-card bg-card/50 backdrop-blur-12 p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Search */}
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search talent..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="category-select">
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
                <label className="block text-sm font-medium mb-2">Delivery Time</label>
                <Select value={deliveryDays} onValueChange={setDeliveryDays}>
                  <SelectTrigger data-testid="delivery-select">
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
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="sort-select">
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
            </div>

            {/* Price Range - Full Width Row */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="max-w-md">
                <div className="px-3 py-2 border border-border rounded-lg bg-background">
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
        <div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch auto-rows-fr"
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
                  <motion.div key={index} variants={itemVariants} className="h-full flex">
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
  const getIconForProject = (tags: string[] | null) => {
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

    if (user.role !== 'buyer') {
      toast({
        title: "Access Denied",
        description: "Only buyers can hire talent.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create order
      await ordersApi.createOrder({
        project_id: project.id,
        seller_id: project.created_by,
        type: 'hire',
        amount_cents: (project.budget || 0) * 100,
      });

      toast({
        title: "Hire Request Sent!",
        description: "Your hire request has been sent to the student. They will review and respond soon.",
      });
    } catch (error) {
      console.error('Error hiring:', error);
      toast({
        title: "Hire Failed",
        description: "Failed to send hire request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card bg-gradient-to-r from-[#00B2FF]/20 via-[#4AC8FF]/25 to-[#8FE5FF]/20 dark:bg-[#02122E] dark:bg-gradient-to-r dark:from-[#02122E] dark:via-[#02122E] dark:to-[#02122E] backdrop-blur-12 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group h-full flex flex-col border-[#00B2FF]/25 hover:border-[#4AC8FF]/35 dark:border-[#02122E]/60 dark:hover:border-[#02122E]/80" data-testid={`project-${project.id}`}>
      <Link href={`/service/${project.id}`}>
        {/* Project Image */}
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted/10 flex items-center justify-center">
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
      </Link>
      
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
              {project.creator?.role === 'student' ? 'Student' : 'Buyer'}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{project.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-xs text-muted-foreground">({project.totalReviews || 0})</span>
          </div>
        </div>

        {/* Category Badge */}
        <Badge variant="secondary" className="w-fit rounded-full text-xs mb-3 flex items-center gap-1">
          <IconComponent className="h-3 w-3" />
          {project.tags?.[0] || 'Project'}
        </Badge>

        {/* Project Info */}
        <Link href={`/service/${project.id}`}>
          <h4 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
            {project.title}
          </h4>
        </Link>
        
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
          {project.tags?.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          )) || []}
          {project.tags && project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="text-xl font-bold text-primary">
            ${(project.budget || 0).toFixed(0)}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild data-testid={`view-project-${project.id}`}>
              <Link href={`/service/${project.id}`}>
                View Details
              </Link>
            </Button>
            <Button 
              size="sm" 
              data-testid={`hire-now-${project.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleHireNow(project);
              }}
            >
              Hire Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}