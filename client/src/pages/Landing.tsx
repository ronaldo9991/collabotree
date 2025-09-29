import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, MessageSquare, Zap, Palette, Lock, CheckCircle, GraduationCap, Clock, FolderSync, Users, TrendingUp, AlertCircle, Search, Bot, Sparkles, Award, Target, Globe, Code, Smartphone, PaintBucket, FileText, BarChart3, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewProjectSlide, setCurrentNewProjectSlide] = useState(0);
  const [topSelectionProjects, setTopSelectionProjects] = useState<any[]>([]);
  const [newProjects, setNewProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch top selection services (admin-curated) - public endpoint
        const topSelectionResponse = await api.getPublicTopSelectionServices();
        let topSelectionServices = [];
        
        if (topSelectionResponse.success && topSelectionResponse.data) {
          topSelectionServices = topSelectionResponse.data as any[];
        }
        
        // Map top selection services to project format
        const mappedTopSelectionProjects = topSelectionServices.map((service: any) => ({
          id: service.id,
          title: service.title,
          description: service.description,
          price: `$${service.priceCents / 100}`,
          deliveryTime: "7 days",
          student: {
            name: service.owner?.name || 'Student',
            university: service.owner?.university || 'University',
            major: 'Computer Science',
            avatar: '',
            verified: service.owner?.isVerified || false
          },
          category: 'Service',
          icon: Code,
          tags: service.owner?.skills && service.owner.skills !== "[]" ? JSON.parse(service.owner.skills) : [],
          image: service.coverImage || null
        }));

        setTopSelectionProjects(mappedTopSelectionProjects);

        // Fetch all recent services for "New Projects" section - public endpoint
        const allServicesResponse = await api.getPublicServices({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
        const allServicesData = (allServicesResponse as any)?.data?.data || (allServicesResponse as any)?.data || allServicesResponse || [];
        
        // Map all services to project format for new projects
        const mappedNewProjects = allServicesData.map((service: any) => ({
          id: service.id,
          title: service.title,
          description: service.description,
          price: `$${service.priceCents / 100}`,
          deliveryTime: "7 days",
          student: {
            name: service.owner?.name || 'Student',
            university: service.owner?.university || 'University',
            major: 'Computer Science',
            avatar: '',
            verified: service.owner?.isVerified || false
          },
          category: 'Service',
          icon: Code,
          tags: service.owner?.skills && service.owner.skills !== "[]" ? JSON.parse(service.owner.skills) : [],
          image: service.coverImage || null,
          createdAt: service.createdAt
        }));

        setNewProjects(mappedNewProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setTopSelectionProjects([]);
        setNewProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    
    // Set up auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchProjects();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const projectsPerSlide = 3;
  const totalSlides = Math.ceil(Math.max(topSelectionProjects.length, 1) / projectsPerSlide);
  const totalNewProjectSlides = Math.ceil(Math.max(newProjects.length, 1) / projectsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const nextNewProjectSlide = () => {
    setCurrentNewProjectSlide((prev) => (prev + 1) % totalNewProjectSlides);
  };

  const prevNewProjectSlide = () => {
    setCurrentNewProjectSlide((prev) => (prev - 1 + totalNewProjectSlides) % totalNewProjectSlides);
  };

  const getCurrentProjects = () => {
    const startIndex = currentSlide * projectsPerSlide;
    return topSelectionProjects.slice(startIndex, startIndex + projectsPerSlide);
  };

  const getCurrentNewProjects = () => {
    const startIndex = currentNewProjectSlide * projectsPerSlide;
    return newProjects.slice(startIndex, startIndex + projectsPerSlide);
  };

  // Auto-slide functionality removed - user wants manual control only

  const features = [
    {
      title: "Academic Excellence Network",
      description: "Connect with the world's brightest minds from Stanford, MIT, Harvard, and 500+ prestigious universities. Every student is rigorously verified through institutional credentials and academic achievements.",
      gradient: "from-primary to-secondary",
      highlight: "Elite Universities",
      stats: "500+ Institutions"
    },
    {
      title: "Intelligent Talent Matching",
      description: "Our advanced AI algorithms analyze your project requirements and match you with students who have the exact academic background, skills, and expertise needed for exceptional results.",
      gradient: "from-accent to-primary",
      highlight: "AI-Powered",
      stats: "95% Match Rate"
    },
    {
      title: "Lightning-Fast Delivery",
      description: "Experience rapid project completion with dedicated student professionals who understand the importance of deadlines and deliver high-quality work within your timeline requirements.",
      gradient: "from-secondary to-accent",
      highlight: "Rapid Results",
      stats: "3-5 Days Avg"
    },
    {
      title: "Global Academic Community",
      description: "Access a diverse talent pool spanning continents, bringing fresh perspectives, innovative approaches, and cultural diversity to your projects from the world's leading academic institutions.",
      gradient: "from-primary to-accent",
      highlight: "Worldwide",
      stats: "50+ Countries"
    },
    {
      title: "Enterprise-Grade Security",
      description: "Your projects and payments are protected with military-grade encryption, secure escrow systems, and comprehensive dispute resolution ensuring complete peace of mind.",
      gradient: "from-accent to-secondary",
      highlight: "Bank-Level",
      stats: "100% Secure"
    },
    {
      title: "Premium Quality Assurance",
      description: "Every project comes with unlimited revisions, comprehensive quality checks, and our satisfaction guarantee. We ensure exceptional results or provide a full refund.",
      gradient: "from-secondary to-primary",
      highlight: "Guaranteed",
      stats: "99.7% Success"
    },
  ];


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
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding-y bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container-unified">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 xl:gap-12 items-center">
            {/* Content - 7/12 (60%) */}
            <motion.div
              className="lg:col-span-7 space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="space-y-6" variants={itemVariants}>
                <Badge className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent-foreground border-accent/30">
                  <Star className="h-3 w-3" />
                  <span className="font-medium">Verified Students Only</span>
                </Badge>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Hire Talent from
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
                    Top Universities
                  </span>
                  Worldwide
                </h1>
                
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Access verified student talent for your projects. From web development to design, research to tutoring—connect with the brightest minds from leading universities.
                </p>
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center" variants={itemVariants}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-[var(--button-height)]"
                  asChild
                  data-testid="hire-talent-button"
                >
                  <Link href="/signin">
                    <Users className="mr-2 h-5 w-5" />
                    Hire Talent
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border bg-card hover:bg-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-[var(--button-height)]"
                  asChild
                  data-testid="join-student-button"
                >
                  <Link href="/signin">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Join as Student
                  </Link>
                </Button>
              </motion.div>

            </motion.div>

            {/* Visual - 5/12 (40%) */}
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="glass-card bg-card/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-12">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800" 
                    alt="Students collaborating" 
                    className="w-full h-auto"
                    data-testid="hero-image"
                  />
                </div>
                
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI-Powered Search Section */}
      <section className="section-padding-y bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-secondary" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              AI-Powered Project Matching
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your project in natural language and let our AI recommend the perfect student talent for your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Enhanced AI Search Bar */}
            <div className="relative bg-card/80 backdrop-blur-12 border border-border/50 rounded-2xl p-3 sm:p-4 shadow-2xl max-w-5xl mx-auto">
              
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                {/* Mobile Header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">AI-Powered Search</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
                
                {/* Mobile Input */}
                <div className="mb-4">
                  <Input 
                    placeholder="Describe your project... e.g., 'mobile app with payments'"
                    className="border-border/50 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/50 text-base h-12 placeholder:text-muted-foreground/70"
                    data-testid="ai-search-input"
                  />
                </div>
                
                {/* Mobile Button */}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium"
                  data-testid="ai-search-button"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Find Perfect Talent
                </Button>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-4 px-2 lg:px-6 py-4">
                  <div className="flex items-center gap-3 text-primary flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Input 
                      placeholder="Describe your project in detail... e.g., 'I need a mobile app for food delivery with payment integration'"
                      className="border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70 h-12"
                      data-testid="ai-search-input"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 px-6 lg:px-8 h-12 flex-shrink-0"
                    data-testid="ai-search-button"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Find Talent</span>
                    <span className="lg:hidden">Find</span>
                  </Button>
                </div>
                
                <div className="px-2 lg:px-6 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI-powered project assistance and talent matching
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>AI Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample suggestions - responsive */}
              <div className="px-3 sm:px-6 pb-4 border-t border-border/20 pt-4 mt-4 sm:mt-0 sm:border-t-0 sm:pt-0">
                <p className="text-xs text-muted-foreground mb-3">Popular project types:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Web Development",
                    "App Design", 
                    "Data Analysis",
                    "Logo Design",
                    "Business Plan",
                    "Research"
                  ].map((suggestion) => (
                    <Badge 
                      key={suggestion}
                      variant="outline" 
                      className="text-xs hover:bg-accent/20 hover:border-primary/30 cursor-pointer transition-colors px-2 py-1"
                      data-testid={`suggestion-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 grid-gap-unified mt-12 sm:mt-16">
              <motion.div
                className="text-center p-6 sm:p-4 rounded-xl bg-background/50 border border-border/30 sm:bg-transparent sm:border-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Smart Matching</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  AI analyzes your requirements and matches you with the most suitable students
                </p>
              </motion.div>

              <motion.div
                className="text-center p-6 sm:p-4 rounded-xl bg-background/50 border border-border/30 sm:bg-transparent sm:border-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-secondary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Instant Results</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Get personalized recommendations in seconds, not hours
                </p>
              </motion.div>

              <motion.div
                className="text-center p-6 sm:p-4 rounded-xl bg-background/50 border border-border/30 sm:bg-transparent sm:border-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Quality Assured</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Only verified students from top universities worldwide
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Selection Section */}
      <section className="section-padding-y bg-background">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Top Selection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hand-picked by our admin team. These featured projects showcase the highest quality and most exceptional work from our verified student talent.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              <span>Admin curated • {topSelectionProjects.length} featured projects</span>
            </div>
          </motion.div>

          {/* Carousel with External Navigation */}
          <div className="flex items-center gap-6">
            {/* Previous Arrow - Outside Left */}
            <Button
              onClick={prevSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="carousel-prev-button"
            >
              <ChevronLeft className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
            
            {/* Carousel Content */}
            <div className="flex-1">

              {/* Carousel Container */}
              <motion.div 
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-unified items-stretch">
                {topSelectionProjects.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Featured Projects Yet</h3>
                    <p className="text-muted-foreground">
                      Our admin team hasn't selected any projects for the top selection yet. Check back later!
                    </p>
                  </div>
                ) : (
                  getCurrentProjects().map((project, index) => (
                    <motion.div 
                      key={`${currentSlide}-${project.id}`}
                      className="w-full h-full flex"
                      data-testid={`top-project-${project.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                <Card 
                  className="rounded-2xl border h-full w-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-[#00B2FF]/20 via-[#4AC8FF]/25 to-[#8FE5FF]/20 dark:bg-[#02122E] dark:bg-gradient-to-r dark:from-[#02122E] dark:via-[#02122E] dark:to-[#02122E] overflow-hidden flex flex-col group border-[#00B2FF]/25 hover:border-[#4AC8FF]/35 dark:border-[#02122E]/60 dark:hover:border-[#02122E]/80"
                  aria-label={project.title}
                >
                  {/* Project Image with Gradient Overlay */}
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/25 via-[#4AC8FF]/20 to-[#8FE5FF]/25 group-hover:from-[#00B2FF]/35 group-hover:via-[#4AC8FF]/30 group-hover:to-[#8FE5FF]/35 dark:bg-[#02122E]/40 dark:group-hover:bg-[#02122E]/60 dark:bg-gradient-to-r dark:from-[#02122E]/40 dark:via-[#02122E]/40 dark:to-[#02122E]/40 dark:group-hover:from-[#02122E]/60 dark:group-hover:via-[#02122E]/60 dark:group-hover:to-[#02122E]/60 transition-all duration-200" />
                  </div>
                  
                  <CardContent className="p-4 md:p-5 xl:p-6 flex-1 flex flex-col">
                    {/* Category pill */}
                    <Badge variant="secondary" className="w-fit rounded-full text-xs mb-3">
                      {project.category}
                    </Badge>
                    
                    {/* Title */}
                    <h3 className="font-bold text-lg line-clamp-2 mb-3">{project.title}</h3>
                    
                    {/* Description - Fixed height for consistency */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3 flex-1">
                      {project.description}
                    </p>
                    
                    {/* Tags - Fixed spacing */}
                    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[2rem]">
                      {project.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="rounded-full text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="rounded-full text-xs px-2 py-1">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Author row - Consistent spacing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={project.student.avatar} alt={project.student.name} />
                          <AvatarFallback className="text-xs">
                            {project.student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-sm truncate">{project.student.name}</p>
                            {project.student.verified && (
                              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {project.student.university}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom price bar - Always at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-lg font-semibold">{project.price}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        asChild
                        data-testid={`view-project-${project.id}`}
                      >
                        <Link href={`/service/${project.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>
                  ))
                )}
              </div>
            </motion.div>
            </div>
            
            {/* Next Arrow - Outside Right */}
            <Button
              onClick={nextSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="carousel-next-button"
            >
              <ChevronRight className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center items-center gap-3 mt-12">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative h-3 rounded-full transition-all duration-500 hover:scale-125 ${
                  index === currentSlide 
                    ? 'w-10 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30' 
                    : 'w-3 bg-muted-foreground/30 hover:bg-primary/40 hover:shadow-md'
                }`}
                data-testid={`carousel-indicator-${index}`}
              >
                {index === currentSlide && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* View All Projects Button */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
              data-testid="view-all-projects-button"
            >
              <Link href="/marketplace">
                <FolderSync className="mr-2 h-5 w-5" />
                Explore All Projects
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* New Projects Section */}
      <section className="section-padding-y bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/5">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">New Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fresh opportunities from our talented student community. Discover the latest projects and innovations from verified students worldwide.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates • {newProjects.length} new projects</span>
            </div>
          </motion.div>

          {/* Carousel with External Navigation */}
          <div className="flex items-center gap-6">
            {/* Previous Arrow - Outside Left */}
            <Button
              onClick={prevNewProjectSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="new-projects-prev-button"
            >
              <ChevronLeft className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
            
            {/* Carousel Content */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-unified items-stretch">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="w-full h-full flex">
                      <Card className="rounded-2xl border h-full w-full bg-gradient-to-r from-[#00B2FF]/20 via-[#4AC8FF]/25 to-[#8FE5FF]/20 dark:bg-[#02122E] overflow-hidden flex flex-col">
                        <div className="w-full h-48 bg-muted/20 animate-pulse rounded-t-2xl" />
                        <CardContent className="p-6 flex-1 flex flex-col space-y-3">
                          <div className="h-4 bg-muted/20 animate-pulse rounded" />
                          <div className="h-3 bg-muted/20 animate-pulse rounded w-3/4" />
                          <div className="flex-1" />
                          <div className="h-4 bg-muted/20 animate-pulse rounded w-1/2" />
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : newProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No New Projects Yet</h3>
                  <p className="text-muted-foreground">
                    No new projects have been created yet. Students are working on creating their first services!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-unified items-stretch">
                  {getCurrentNewProjects().map((project, index) => (
              <motion.div 
                key={project.id} 
                variants={itemVariants}
                className="w-full h-full flex"
                data-testid={`new-project-${project.id}`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card 
                  className="rounded-2xl border h-full w-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-[#00B2FF]/20 via-[#4AC8FF]/25 to-[#8FE5FF]/20 dark:bg-[#02122E] dark:bg-gradient-to-r dark:from-[#02122E] dark:via-[#02122E] dark:to-[#02122E] overflow-hidden flex flex-col group border-[#00B2FF]/25 hover:border-[#4AC8FF]/35 dark:border-[#02122E]/60 dark:hover:border-[#02122E]/80"
                  aria-label={project.title}
                >
                  {/* Project Image with Gradient Overlay */}
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/25 via-[#4AC8FF]/20 to-[#8FE5FF]/25 group-hover:from-[#00B2FF]/35 group-hover:via-[#4AC8FF]/30 group-hover:to-[#8FE5FF]/35 dark:bg-[#02122E]/40 dark:group-hover:bg-[#02122E]/60 dark:bg-gradient-to-r dark:from-[#02122E]/40 dark:via-[#02122E]/40 dark:to-[#02122E]/40 dark:group-hover:from-[#02122E]/60 dark:group-hover:via-[#02122E]/60 dark:group-hover:to-[#02122E]/60 transition-all duration-200" />
                  </div>
                  
                  <CardContent className="p-4 md:p-5 xl:p-6 flex-1 flex flex-col">
                    {/* Category pill */}
                    <Badge variant="secondary" className="w-fit rounded-full text-xs mb-3">
                      {project.category}
                    </Badge>
                    
                    {/* Title */}
                    <h3 className="font-bold text-lg line-clamp-2 mb-3">{project.title}</h3>
                    
                    {/* Description - Fixed height for consistency */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3 flex-1">
                      {project.description}
                    </p>
                    
                    {/* Tags - Fixed spacing */}
                    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[2rem]">
                      {project.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="rounded-full text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="rounded-full text-xs px-2 py-1">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Author row - Consistent spacing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={project.student.avatar} alt={project.student.name} />
                          <AvatarFallback className="text-xs">
                            {project.student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-sm truncate">{project.student.name}</p>
                            {project.student.verified && (
                              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {project.student.university}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom price bar - Always at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-lg font-semibold">{project.price}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        asChild
                        data-testid={`view-new-project-${project.id}`}
                      >
                        <Link href={`/service/${project.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
                ))}
                </div>
              )}
            </div>

            {/* Next Arrow - Outside Right */}
            <Button
              onClick={nextNewProjectSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="new-projects-next-button"
            >
              <ChevronRight className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalNewProjectSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentNewProjectSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentNewProjectSlide
                    ? 'bg-primary w-8'
                    : 'bg-border/50 hover:bg-border'
                }`}
                data-testid={`new-projects-indicator-${index}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding-y bg-muted/5 overflow-hidden">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              The Future of Academic Talent
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of talent collaboration with our revolutionary platform that connects you with the world's most brilliant academic minds.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="group"
              >
                <Card className="glass-card bg-card/50 border-border/50 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-12 relative overflow-hidden" data-testid={`feature-${index}`}>
                  {/* Floating gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-lg">
                    <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 transform group-hover:scale-110`}></div>
                  </div>
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Highlight badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-6">
                      <span className="text-xs font-medium text-primary">{feature.highlight}</span>
                    </div>
                    
                    {/* Content with enhanced typography */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground/80 transition-colors duration-300">
                        {feature.description}
                      </p>
                      
                      {/* Stats badge */}
                      <div className="pt-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                          <span className="text-xs font-semibold text-primary">{feature.stats}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-y bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container-unified text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Begin?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of professionals and students who are already creating exceptional projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
                data-testid="cta-hire-talent-button"
              >
                <Link href="/signin">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Hire Talent Now
                </Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-border bg-background hover:bg-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
                data-testid="cta-student-button"
              >
                <Link href="/signin">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Become a Student Seller
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
