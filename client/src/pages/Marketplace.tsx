import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Search, Filter, Star, Clock, FolderSync, Heart, MapPin, Sparkles, TrendingUp, Code, Smartphone, PaintBucket } from "lucide-react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { mockServicesWithOwners } from "@/data/mockData";

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

export default function ExploreTalent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const [deliveryDays, setDeliveryDays] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Use mock data instead of API calls
  const services = mockServicesWithOwners;

  // Categories (hardcoded for now - could be fetched from API later)
  const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web-development", label: "Web Development" },
    { value: "design", label: "Design" },
    { value: "graphic-design", label: "Graphic Design" },
    { value: "full-stack-development", label: "Full-Stack Development" },
    { value: "ai-and-machine-learning", label: "AI & Machine Learning" },
    { value: "mobile-development", label: "Mobile Development" }
  ];

  // Client-side filtering for category (since API doesn't support category filter yet)
  const filteredServices = services?.filter((service) => {
    // Filter by category - for now we'll do basic matching
    if (category !== "all" && service.tags) {
      const hasMatchingTag = service.tags.some(tag => 
        slugify(tag).includes(category) || category.includes(slugify(tag))
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });

  const sortedServices = filteredServices?.sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.pricingCents - b.pricingCents;
      case "price-high":
        return b.pricingCents - a.pricingCents;
      case "rating":
        return parseFloat(b.avgRating || '0') - parseFloat(a.avgRating || '0');
      case "delivery":
        return a.deliveryDays - b.deliveryDays;
      default:
        return 0; // newest - keep original order
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
              {sortedServices?.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No talent found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or browse all talent.
                  </p>
                </div>
              ) : (
                sortedServices?.map((project) => (
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

function ProjectCard({ project }: { project: any }) {
  const [isFavorite, setIsFavorite] = useState(false);
  // Get category icon based on tags or use default
  const getIconForService = (tags: string[] | null) => {
    if (!tags) return categoryIcons['default'];
    for (const tag of tags) {
      if (categoryIcons[tag]) return categoryIcons[tag];
    }
    return categoryIcons['default'];
  };
  const IconComponent = getIconForService(project.tags);

  return (
    <Card className="glass-card bg-card/50 backdrop-blur-12 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group h-full flex flex-col" data-testid={`project-${project.id}`}>
      <Link href={`/service/${project.id}`}>
        {/* Project Image */}
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted/10 flex items-center justify-center">
          {/* Placeholder for service image - could be added to Service interface later */}
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-t-lg">
            <IconComponent className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 group-hover:from-primary/30 group-hover:via-secondary/15 group-hover:to-accent/30 transition-all duration-200" />
          
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
        {/* Student Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.owner.avatarUrl || undefined} />
            <AvatarFallback>
              {(project.owner.fullName || '').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <div className="font-medium text-sm truncate">{project.owner.fullName}</div>
              {project.owner.isVerified && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  ✓
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {project.owner.university}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{parseFloat(project.avgRating || '0').toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({project.ratingCount})</span>
          </div>
        </div>

        {/* Category Badge */}
        <Badge variant="secondary" className="w-fit rounded-full text-xs mb-3 flex items-center gap-1">
          <IconComponent className="h-3 w-3" />
          {project.tags?.[0] || 'Service'}
        </Badge>

        {/* Project Info */}
        <Link href={`/service/${project.id}`}>
          <h4 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
            {project.title}
          </h4>
        </Link>
        
        <div className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3 min-h-[4.5rem]">
            {project.description}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{project.deliveryDays} days</span>
          </div>
          <div className="flex items-center gap-1">
            <FolderSync className="h-3 w-3" />
            <span>Revisions</span>
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
            ${(project.pricingCents / 100).toFixed(0)}
          </div>
          <Button size="sm" variant="outline" asChild data-testid={`view-project-${project.id}`}>
            <Link href={`/service/${project.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}