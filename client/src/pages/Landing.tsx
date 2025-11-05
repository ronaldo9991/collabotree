import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, MessageSquare, Zap, Palette, Lock, CheckCircle, GraduationCap, Clock, FolderSync, Users, TrendingUp, AlertCircle, Search, Bot, Sparkles, Award, Target, Globe, Code, Smartphone, PaintBucket, FileText, BarChart3, ChevronLeft, ChevronRight, Package, UserCheck, MessageCircle, CreditCard, CheckSquare } from "lucide-react";
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
      {/* Asymmetric Grid Hero Section - Professional Design */}
      <section className="relative min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] flex items-center overflow-hidden pt-16 sm:pt-20 md:pt-24">
        {/* Minimal Gradient Background with Subtle Texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00B2FF] via-[#0077B6] to-[#023E8A]">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#4AC8FF]/20 via-transparent to-[#0096C7]/20"></div>
          
          {/* Minimal animated orbs */}
          <motion.div
            className="absolute top-20 right-10 w-64 h-64 bg-[#4AC8FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.25, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-80 h-80 bg-[#0096C7] rounded-full mix-blend-multiply filter blur-3xl opacity-15"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.2, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          
          {/* Subtle texture pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:80px_80px]"></div>
          
          {/* Light overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/15"></div>
        </div>

        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Asymmetric Grid Layout */}
        <div className="relative z-10 container-unified w-full py-8 sm:py-10 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-start lg:items-center">
            
            {/* Top-Left: Large Headline */}
              <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] text-white">
                    Hire{" "}
                    <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                        Elite Talent
                      </span>
                      <motion.span
                    className="absolute inset-0 bg-white/20 blur-2xl -z-10"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                      duration: 3,
                          repeat: Infinity,
                      ease: "easeInOut",
                        }}
                      />
                    </span>
                    <br />
                    From Top Universities
                  </h1>
                  
              {/* Bottom-Left: Description and CTAs */}
              <div className="space-y-6 sm:space-y-8 pt-4">
                <motion.p
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Connect directly with verified students offering professional services. Quality work, competitive rates, secure payments.
                </motion.p>
                
                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Button
                    size="lg"
                    className="bg-white text-[#00B2FF] hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl group"
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
                    className="border-2 border-white/40 bg-white/5 backdrop-blur-lg hover:bg-white/15 hover:border-white/60 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl group"
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
                  className="flex flex-wrap gap-6 sm:gap-8 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="flex items-center gap-2 text-white/80 text-sm sm:text-base">
                    <CheckCircle className="w-5 h-5 text-white" />
                    <span>Verified Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm sm:text-base">
                    <Lock className="w-5 h-5 text-white" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm sm:text-base">
                    <Star className="w-5 h-5 text-white" />
                    <span>Quality Guaranteed</span>
                  </div>
                </motion.div>
              </div>
              </motion.div>

            {/* Right Column: Top-Right Search + Bottom-Right Categories */}
            <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Top-Right: Prominent Search Card */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-2xl -z-10"></div>
                
                {/* Search Card */}
                <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/30 hover:shadow-[0_20px_40px_rgba(0,178,255,0.2)] transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B2FF] to-[#0096C7] flex items-center justify-center">
                        <Search className="w-5 h-5 text-white" />
                    </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">Find Your Perfect Service</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Search from verified student services</p>
                      </div>
                  </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Search services, skills, or categories..."
                        className="h-12 sm:h-14 pl-12 pr-4 rounded-xl border-2 border-[#00B2FF]/20 focus:border-[#00B2FF] bg-background/50 text-sm sm:text-base font-medium transition-all"
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
                      className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#00B2FF] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B2FF] text-white rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:shadow-[#00B2FF]/30 transition-all transform hover:scale-[1.02]"
                      onClick={handleSearch}
                    >
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Search Services
                    </Button>
                  </div>
                    </div>
              </motion.div>

              {/* Bottom-Right: Floating Category Chips Grid */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <p className="text-sm sm:text-base text-white/90 font-medium mb-3">Popular Categories</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { term: 'Web Development', icon: Code },
                      { term: 'UI/UX Design', icon: Palette },
                      { term: 'Data Analysis', icon: BarChart3 },
                    { term: 'Content Writing', icon: FileText },
                    { term: 'Mobile Apps', icon: Smartphone },
                    { term: 'Graphic Design', icon: PaintBucket }
                  ].map(({ term, icon: Icon }, index) => (
                    <motion.div
                        key={term}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.1 + (index * 0.1) }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto min-h-[60px] sm:min-h-[70px] flex flex-col items-center justify-center gap-2 p-3 sm:p-4 hover:bg-white/10 hover:border-white/50 text-white transition-all group bg-white/5 backdrop-blur-sm rounded-xl"
                        onClick={() => handlePopularSearch(term)}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform text-[#00B2FF]" />
                        <span className="text-xs sm:text-sm font-medium text-center leading-tight">{term}</span>
                      </Button>
                    </motion.div>
                    ))}
                  </div>
              </motion.div>
            </motion.div>
                </div>
        </div>
      </section>

      {/* About CollaboTree Section */}
      <section className="section-padding-y bg-gradient-to-b from-background via-muted/5 to-background relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container-unified relative z-10">
                <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
                <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <Badge className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 text-primary border-primary/20 px-5 py-2.5 text-sm font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                About CollaboTree
              </Badge>
              </motion.div>
            
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              The Platform That Connects<br className="hidden sm:block" /> Talent with Opportunity
            </motion.h2>
            
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              CollaboTree is the premier marketplace connecting verified university students with buyers seeking quality services. 
              We bridge the gap between academic excellence and real-world professional experience.
            </motion.p>
          </motion.div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-primary/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                      <UserCheck className="w-8 h-8 text-primary" />
            </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary/30 rounded-full blur-sm group-hover:bg-primary/50 transition-colors" />
          </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">University-Verified Students</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Every student on our platform is verified through their university credentials. We ensure authentic talent 
                    with verified academic backgrounds and skills.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-secondary/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-secondary/10">
                      <Shield className="w-8 h-8 text-secondary" />
        </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary/30 rounded-full blur-sm group-hover:bg-secondary/50 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">Secure & Protected Transactions</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Our escrow system protects both buyers and sellers. Payments are held securely until work is completed 
                    and approved, ensuring satisfaction for everyone.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

        <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-accent/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/10">
                      <MessageCircle className="w-8 h-8 text-accent" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent/30 rounded-full blur-sm group-hover:bg-accent/50 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">Real-Time Collaboration</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Communicate directly with students through our integrated messaging system. Track progress, share feedback, 
                    and collaborate seamlessly throughout the project.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-green-500/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/10">
                      <Star className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500/30 rounded-full blur-sm group-hover:bg-green-500/50 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-green-500 transition-colors">Quality Assurance</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Every project goes through our quality review process. Students provide detailed portfolios and work samples, 
                    ensuring you get professional-grade results.
                  </p>
                </CardContent>
              </Card>
          </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-blue-500/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/10">
                      <Zap className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500/30 rounded-full blur-sm group-hover:bg-blue-500/50 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-blue-500 transition-colors">Fast & Efficient Delivery</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Students work with clear deadlines and milestones. Get your projects delivered on time with regular updates 
                    and progress tracking throughout the process.
                  </p>
                </CardContent>
              </Card>
        </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full border-2 border-border/50 hover:border-purple-500/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/10">
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500/30 rounded-full blur-sm group-hover:bg-purple-500/50 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-purple-500 transition-colors">Competitive Pricing</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Get professional services at student-friendly rates. Access top university talent without the premium prices 
                    of traditional agencies.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* How It Works Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-primary/10 overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-grid-small-white/[0.02] dark:bg-grid-small-white/[0.02]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center mb-8 sm:mb-10 md:mb-12">
              <motion.h3 
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                How CollaboTree Works
              </motion.h3>
              <motion.p 
                className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Simple, secure, and efficient - get started in minutes
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300 border-2 border-primary/20">
                    <span className="text-3xl font-bold text-primary">1</span>
                  </div>
                  <div className="absolute -inset-2 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">Browse & Select</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-xs mx-auto break-words overflow-wrap-anywhere">
                  Explore verified student services, view portfolios, and read reviews to find the perfect match for your project.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mx-auto shadow-lg shadow-secondary/20 group-hover:scale-110 transition-transform duration-300 border-2 border-secondary/20">
                    <span className="text-3xl font-bold text-secondary">2</span>
                  </div>
                  <div className="absolute -inset-2 bg-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-foreground group-hover:text-secondary transition-colors">Connect & Collaborate</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-xs mx-auto break-words overflow-wrap-anywhere">
                  Message directly with the student, discuss requirements, set milestones, and track progress in real-time.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-300 border-2 border-accent/20">
                    <span className="text-3xl font-bold text-accent">3</span>
                  </div>
                  <div className="absolute -inset-2 bg-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-foreground group-hover:text-accent transition-colors">Review & Pay</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-xs mx-auto break-words overflow-wrap-anywhere">
                  Review completed work, request revisions if needed, and release payment only when you're completely satisfied.
                </p>
              </motion.div>
            </div>
            
            {/* Connecting Lines for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 -translate-y-1/2 z-0" />
          </motion.div>
        </div>
      </section>

      {/* Top Selection Section */}
      <section className="section-padding-y bg-background">
        <div className="container-unified">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Top Selection</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Hand-picked by our admin team. These featured projects showcase the highest quality and most exceptional work from our verified student talent.
            </p>
          </motion.div>

          {/* Carousel with Navigation */}
          <div className="flex items-center gap-6">
            {/* Previous Arrow */}
            <Button
              onClick={prevSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-lg rounded-full w-14 h-14 group"
              data-testid="carousel-prev-button"
            >
              <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </Button>
            
            {/* Carousel Content */}
              <motion.div 
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 50;
                const velocityThreshold = 500;
                if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                  prevSlide();
                } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
                  nextSlide();
                }
              }}
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
                  {/* Project Image with Gradient Overlay - 40-45% of card height */}
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-2xl">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/25 via-[#4AC8FF]/20 to-[#8FE5FF]/25 group-hover:from-[#00B2FF]/35 group-hover:via-[#4AC8FF]/30 group-hover:to-[#8FE5FF]/35 dark:bg-[#02122E]/40 dark:group-hover:bg-[#02122E]/60 dark:bg-gradient-to-r dark:from-[#02122E]/40 dark:via-[#02122E]/40 dark:to-[#02122E]/40 dark:group-hover:from-[#02122E]/60 dark:group-hover:via-[#02122E]/60 dark:group-hover:to-[#02122E]/60 transition-all duration-200" />
                  </div>
                  
                  <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-bold text-base sm:text-lg md:text-xl line-clamp-2 mb-2 sm:mb-3 break-words overflow-wrap-anywhere">{project.title}</h3>
                    
                    {/* Description - Fixed height for consistency */}
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed mb-3 sm:mb-4 flex-1 break-words overflow-wrap-anywhere">
                      {project.description}
                    </p>
                    
                    {/* Tags - Fixed spacing */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4 min-h-[2rem]">
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
                            <p className="font-medium text-xs sm:text-sm truncate break-words overflow-wrap-anywhere min-w-0">{project.student.name}</p>
                            {project.student.verified && (
                              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate break-words overflow-wrap-anywhere min-w-0">
                            {project.student.university}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom price bar - Always at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xl font-semibold">{project.price}</span>
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
            
            {/* Next Arrow */}
            <Button
              onClick={nextSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-lg rounded-full w-14 h-14 group"
              data-testid="carousel-next-button"
            >
              <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </Button>
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
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">New Projects</h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Fresh opportunities from our talented student community. Discover the latest projects and innovations from verified students worldwide.
            </p>
          </motion.div>

          {/* Carousel with Navigation */}
          <div className="flex items-center gap-6">
            {/* Previous Arrow */}
            <Button
              onClick={prevNewProjectSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-lg rounded-full w-14 h-14 group"
              data-testid="new-projects-prev-button"
            >
              <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </Button>
            
            {/* Projects Grid */}
            <motion.div
              className="w-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 50;
                const velocityThreshold = 500;
                if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                  prevNewProjectSlide();
                } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
                  nextNewProjectSlide();
                }
              }}
            >
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-unified items-stretch">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="w-full h-full flex">
                      <Card className="rounded-2xl border h-full w-full bg-gradient-to-r from-[#00B2FF]/20 via-[#4AC8FF]/25 to-[#8FE5FF]/20 dark:bg-[#02122E] overflow-hidden flex flex-col">
                        <div className="w-full h-48 bg-muted/20 animate-pulse rounded-t-2xl" />
                        <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col space-y-2 sm:space-y-3">
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
                  {/* Project Image with Gradient Overlay - 40-45% of card height */}
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-2xl">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/25 via-[#4AC8FF]/20 to-[#8FE5FF]/25 group-hover:from-[#00B2FF]/35 group-hover:via-[#4AC8FF]/30 group-hover:to-[#8FE5FF]/35 dark:bg-[#02122E]/40 dark:group-hover:bg-[#02122E]/60 dark:bg-gradient-to-r dark:from-[#02122E]/40 dark:via-[#02122E]/40 dark:to-[#02122E]/40 dark:group-hover:from-[#02122E]/60 dark:group-hover:via-[#02122E]/60 dark:group-hover:to-[#02122E]/60 transition-all duration-200" />
                  </div>
                  
                  <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-bold text-base sm:text-lg md:text-xl line-clamp-2 mb-2 sm:mb-3 break-words overflow-wrap-anywhere">{project.title}</h3>
                    
                    {/* Description - Fixed height for consistency */}
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed mb-3 sm:mb-4 flex-1 break-words overflow-wrap-anywhere">
                      {project.description}
                    </p>
                    
                    {/* Tags - Fixed spacing */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4 min-h-[2rem]">
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
                            <p className="font-medium text-xs sm:text-sm truncate break-words overflow-wrap-anywhere min-w-0">{project.student.name}</p>
                            {project.student.verified && (
                              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate break-words overflow-wrap-anywhere min-w-0">
                            {project.student.university}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom price bar - Always at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xl font-semibold">{project.price}</span>
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
            </motion.div>

            {/* Next Arrow */}
            <Button
              onClick={nextNewProjectSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-lg rounded-full w-14 h-14 group"
              data-testid="new-projects-next-button"
            >
              <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding-y bg-muted/5 overflow-hidden">
        <div className="container-unified">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Why Choose CollaboTree
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple platform where verified university students offer their skills and services to buyers who need quality work done.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto"
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Begin?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto">
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
