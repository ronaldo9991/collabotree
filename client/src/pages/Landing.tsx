import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, MessageSquare, Zap, Palette, Lock, CheckCircle, GraduationCap, Clock, FolderSync, Users, TrendingUp, AlertCircle, Search, Bot, Sparkles, Award, Target, Globe, Code, Smartphone, PaintBucket, FileText, BarChart3, ChevronLeft, ChevronRight, Package, UserCheck, MessageCircle, CreditCard, CheckSquare, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewProjectSlide, setCurrentNewProjectSlide] = useState(0);
  const [topSelectionProjects, setTopSelectionProjects] = useState<any[]>([]);
  const [newProjects, setNewProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProjects();
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch projects from backend
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
        console.log('🔍 Fetching all services for New Projects section...');
        const allServicesResponse = await api.getPublicServices({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
        console.log('📦 All services API response:', allServicesResponse);
        
        const allServicesData = (allServicesResponse as any)?.data?.data || (allServicesResponse as any)?.data || allServicesResponse || [];
        console.log('📋 Extracted all services data:', allServicesData);
        console.log('📊 Number of all services found:', allServicesData.length);
        
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

        console.log('🎯 Mapped new projects:', mappedNewProjects);
        console.log('📊 Number of mapped new projects:', mappedNewProjects.length);
        setNewProjects(mappedNewProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setTopSelectionProjects([]);
        setNewProjects([]);
      } finally {
        setLoading(false);
      }
    };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
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

  // Handle search and navigate to marketplace
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    console.log('🚀 Hero search triggered. Query:', trimmedQuery);
    if (trimmedQuery) {
      const url = `/marketplace?search=${encodeURIComponent(trimmedQuery)}`;
      console.log('   Navigating to:', url);
      setLocation(url);
    } else {
      console.log('   Empty search, navigating to marketplace');
      setLocation('/marketplace');
    }
  };

  // Handle popular search terms
  const handlePopularSearch = (term: string) => {
    console.log('🏷️ Popular search clicked:', term);
    const url = `/marketplace?search=${encodeURIComponent(term)}`;
    console.log('   Navigating to:', url);
    setLocation(url);
  };

  // Auto-slide functionality removed - user wants manual control only

  const features = [
    {
      title: "Verified Student Sellers",
      description: "All students are verified through their university credentials and academic records before joining our platform.",
      gradient: "from-blue-500 to-cyan-500",
      highlight: "Authentic Talent",
      icon: UserCheck
    },
    {
      title: "Direct Communication",
      description: "Connect directly with students through our built-in messaging system. No middlemen, just clear communication.",
      gradient: "from-purple-500 to-pink-500",
      highlight: "Real Connection",
      icon: MessageCircle
    },
    {
      title: "Secure Payments",
      description: "Your payments are protected with secure escrow system. Money is only released when you're satisfied with the work.",
      gradient: "from-green-500 to-emerald-500",
      highlight: "Payment Protection",
      icon: CreditCard
    },
    {
      title: "Quality Control",
      description: "Review and approve work before final payment. Request revisions until you're completely satisfied.",
      gradient: "from-orange-500 to-red-500",
      highlight: "Your Approval",
      icon: CheckSquare
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
      {/* Modern Optimized Hero Section */}
      <section className="relative min-h-[calc(100vh-6rem)] flex items-center justify-center overflow-hidden pt-8 md:pt-12">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00B2FF] via-[#0077B6] to-[#023E8A]">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#4AC8FF] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#00B2FF] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#0096C7] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]"></div>
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40"></div>
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 container-unified w-full pb-16 md:pb-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Content - Hero Text */}
              <motion.div
                className="space-y-8 text-center lg:text-left"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Main Heading */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] text-white">
                    Hire{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                        Elite Talent
                      </span>
                      <motion.span
                        className="absolute inset-0 bg-white/20 blur-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </span>
                    <br />
                    From Top Universities
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Connect directly with verified students offering professional services. 
                    Quality work, competitive rates, secure payments.
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Button
                    size="lg"
                    className="bg-white text-[#00B2FF] hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 h-14 px-8 text-lg font-bold rounded-xl group"
                    asChild
                  >
                    <Link href="/signin">
                      <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Start Hiring Now
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/40 bg-white/5 backdrop-blur-lg hover:bg-white/15 hover:border-white/60 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-14 px-8 text-lg font-bold rounded-xl group"
                    asChild
                  >
                    <Link href="/signin">
                      <GraduationCap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Become a Seller
                    </Link>
                  </Button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Verified Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Lock className="w-4 h-4 text-white" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Star className="w-4 h-4 text-white" />
                    <span>Quality Guaranteed</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - Enhanced Search Card */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-3xl"></div>
                
                {/* Main Search Card */}
                <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00B2FF] to-[#0096C7] mb-4">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Find Your Perfect Match</h3>
                    <p className="text-sm text-muted-foreground">Search from hundreds of verified student services</p>
                  </div>

                  {/* Search Input */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Try: Web Design, Logo, Data Analysis..."
                        className="h-14 pl-12 pr-4 rounded-xl border-2 border-[#00B2FF]/20 focus:border-[#00B2FF] bg-background/50 text-base font-medium transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                      />
                    </div>
                    
                    <Button
                      size="lg"
                      className="w-full h-14 bg-gradient-to-r from-[#00B2FF] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B2FF] text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:shadow-[#00B2FF]/30 transition-all transform hover:scale-[1.02]"
                      onClick={handleSearch}
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Services
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-900 px-3 text-muted-foreground font-medium">
                        Popular Categories
                      </span>
                    </div>
                  </div>

                  {/* Popular Searches - Enhanced */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { term: 'Web Development', icon: Code },
                      { term: 'UI/UX Design', icon: Palette },
                      { term: 'Data Analysis', icon: BarChart3 },
                      { term: 'Content Writing', icon: FileText }
                    ].map(({ term, icon: Icon }) => (
                      <Button
                        key={term}
                        variant="outline"
                        className="h-12 justify-start gap-2 hover:bg-[#00B2FF]/10 hover:border-[#00B2FF] hover:text-[#00B2FF] transition-all group"
                        onClick={() => handlePopularSearch(term)}
                      >
                        <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{term}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#00B2FF]/30 to-[#4AC8FF]/30 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#4AC8FF]/30 to-[#00B2FF]/30 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 1,
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/60"
          >
            <span className="text-xs font-medium">Scroll to explore</span>
            <ChevronRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </motion.div>
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
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl lg:text-4xl font-bold">New Projects</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fresh opportunities from our talented student community. Discover the latest projects and innovations from verified students worldwide.
            </p>
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
              Why Choose CollaboTree
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple platform where verified university students offer their skills and services to buyers who need quality work done.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
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
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="glass-card bg-card/50 border-border/50 h-full hover:shadow-2xl transition-all duration-700 backdrop-blur-12 relative overflow-hidden cursor-pointer" data-testid={`feature-${index}`}>
                  {/* Animated gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-all duration-700`}></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-all duration-700 transform group-hover:scale-150 group-hover:rotate-45`}></div>
                    <div className={`absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-15 rounded-full blur-xl transition-all duration-700 transform group-hover:scale-125 group-hover:-rotate-45`}></div>
                  </div>
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Icon with animation */}
                    <motion.div 
                      className="mb-4"
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 10,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mx-auto`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                    
                    {/* Highlight badge with pulse animation */}
                    <motion.div 
                      className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-6"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-xs font-medium text-primary">{feature.highlight}</span>
                    </motion.div>
                    
                    {/* Content with enhanced typography */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-500">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground/80 transition-colors duration-500">
                        {feature.description}
                      </p>
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
