import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, MessageSquare, Zap, Palette, Lock, CheckCircle, GraduationCap, Clock, FolderSync, Users, TrendingUp, AlertCircle, Search, Bot, Sparkles, Award, Target, Globe, Code, Smartphone, PaintBucket, FileText, BarChart3, ChevronLeft, ChevronRight, Package, UserCheck, MessageCircle, CreditCard, CheckSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import { Network, Moon, Sun, Menu, LogOut, Settings, User, X, Home, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { CommandPalette } from "@/components/CommandPalette";

export default function Landing() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewProjectSlide, setCurrentNewProjectSlide] = useState(0);
  const [topSelectionProjects, setTopSelectionProjects] = useState<any[]>([]);
  const [newProjects, setNewProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { name: "Home", href: "/", icon: Home, show: true },
    { name: "About", href: "/about", icon: Users, show: true },
    { name: "Explore Talent", href: "/marketplace", icon: ShoppingCart, show: true },
    { name: "How it Works", href: "/how-it-works", icon: FileText, show: true },
    { name: "Contact", href: "/contact", icon: MessageSquare, show: true },
  ];

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
          image: service.coverImage || null,
          averageRating: service.averageRating || 0,
          totalReviews: service.totalReviews || 0
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
          createdAt: service.createdAt,
          averageRating: service.averageRating || 0,
          totalReviews: service.totalReviews || 0
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

  // Listen for review submission events to refresh project data
  useEffect(() => {
    const handleReviewSubmitted = () => {
      console.log('🔄 Review submitted, refreshing landing page projects...');
      fetchProjects(); // Refresh projects to show updated ratings
    };

    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    return () => window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
  }, []);

  // Scroll detection for navbar hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at top of page
      if (currentScrollY < 10) {
        setIsNavbarVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down
          setIsNavbarVisible(false);
        } else {
          // Scrolling up
          setIsNavbarVisible(true);
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      {/* Enhanced Hero Section with Integrated Navbar */}
      <section className="relative min-h-[75vh] sm:min-h-[80vh] md:min-h-[85vh] flex flex-col overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/15 to-accent/10">
        {/* Enhanced Gradient Background with Dynamic Effects */}
        <div className="absolute inset-0">
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/15"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Enhanced animated orbs - using brand colors */}
          <motion.div
            className="absolute top-20 right-10 w-72 h-72 bg-primary/25 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -30, 0],
              y: [0, 30, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/15 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
          
          {/* Enhanced texture pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.01] bg-[size:60px_60px]"></div>
          
          {/* Light overlay - using brand colors */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/5 to-background/10"></div>
        </div>

        {/* Enhanced floating particles - more dynamic */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Integrated Navbar - Top Column Inside Hero (Fixed like other pages) */}
        <nav className="hidden">
          <div className="container-unified">
            {/* Original Pill-shaped Navigation Container */}
            <div className="flex items-center justify-between h-14 px-6 rounded-full border-2 border-primary/40 dark:border-primary/60 bg-card/95 dark:bg-card/90 backdrop-blur-md shadow-lg shadow-primary/5 dark:shadow-primary/10">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="logo">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Network className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground">CollaboTree</span>
              </Link>

              {/* Center Navigation - Desktop */}
              <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
                {navigation.map((item) => {
                  const isActive = location === item.href || 
                    (item.href !== "/" && location.startsWith(item.href));
                  
                  return item.show && (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm font-medium transition-all px-4 py-1.5 rounded-full whitespace-nowrap ${
                        isActive
                          ? "text-foreground border-2 border-primary/50 dark:border-primary/70 bg-card dark:bg-card/80"
                          : "text-foreground/70 hover:text-foreground hover:bg-muted/30"
                      }`}
                      data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden ml-auto">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2 rounded-full mobile-menu-button h-8 w-8">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-gradient-to-b from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 backdrop-blur-12 border-l border-primary/20 mobile-sheet-content p-0" hideCloseButton={true}>
                    <div className="flex flex-col h-full">
                      {/* Header with Prominent Close Button */}
                      <div className="flex items-center justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-primary/20">
                        <h2 className="text-xl font-bold text-foreground">Menu</h2>
                        {/* Close Button - Large, prominent, and easy to tap */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMobileMenuOpen(false)}
                          className="h-11 w-11 rounded-full bg-primary/15 hover:bg-primary/25 dark:bg-primary/25 dark:hover:bg-primary/35 border-2 border-primary/30 p-0 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md hover:shadow-lg mobile-close-button min-w-[44px] min-h-[44px]"
                          data-testid="mobile-menu-close"
                        >
                          <X className="h-6 w-6 text-primary font-bold" strokeWidth={2.5} />
                          <span className="sr-only">Close</span>
                        </Button>
                      </div>
                      
                      {/* Navigation */}
                      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                        {navigation.map((item) => (
                          item.show && (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item min-h-[44px]"
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <item.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                              {item.name}
                            </Link>
                          )
                        ))}
                        
                        {/* User Section - Only show when logged in */}
                        {user && (
                          <div className="pt-4 border-t border-primary/20 space-y-3">
                            {/* User Profile Card */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                              <Avatar className="h-12 w-12 border-2 border-primary/30 flex-shrink-0">
                                <AvatarImage src="" alt={user.name} />
                                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-semibold text-foreground truncate">{user.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </div>
                            
                            {/* Dashboard Link */}
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item min-h-[44px]"
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid="mobile-nav-dashboard"
                            >
                              <User className="h-5 w-5 flex-shrink-0 text-primary" />
                              <span>Dashboard</span>
                            </Link>
                            
                            {/* Settings Link */}
                            <Link
                              href={
                                user.role === 'STUDENT' ? '/dashboard/student/settings' :
                                user.role === 'BUYER' ? '/dashboard/buyer/settings' :
                                user.role === 'ADMIN' ? '/dashboard/admin/settings' :
                                '/profile'
                              }
                              className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item min-h-[44px]"
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid="mobile-nav-settings"
                            >
                              <Settings className="h-5 w-5 flex-shrink-0 text-primary" />
                              <span>Settings</span>
                            </Link>
                            
                            {/* Sign Out Button */}
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 transition-all border-destructive/20 shadow-sm hover:shadow-md mobile-sign-out-button min-h-[52px]"
                              data-testid="mobile-sign-out-button"
                            >
                              <LogOut className="h-5 w-5 text-destructive" />
                              <span className="text-base font-medium text-destructive">Sign Out</span>
                            </Button>
                          </div>
                        )}
                        
                        {/* Sign In Button - Only show when NOT logged in */}
                        {!user && (
                          <div className="pt-4 border-t border-primary/20">
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-all border-primary/20 shadow-sm hover:shadow-md mobile-sign-in-button min-h-[52px]"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid="mobile-sign-in-button"
                            >
                              <Link href="/signin">
                                <User className="h-5 w-5 text-primary" />
                                <span className="text-base font-medium">Sign In</span>
                              </Link>
                            </Button>
                          </div>
                        )}
                        
                        {/* Theme Toggle - Moved to bottom, separate from close button */}
                        <div className="mt-auto pt-6 border-t border-primary/20">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-all border-primary/20 shadow-sm hover:shadow-md mobile-theme-toggle min-h-[52px]"
                            data-testid="mobile-theme-toggle"
                          >
                            {theme === "light" ? (
                              <>
                                <Moon className="h-5 w-5 text-primary" />
                                <span className="text-base font-medium">Switch to Dark Mode</span>
                              </>
                            ) : (
                              <>
                                <Sun className="h-5 w-5 text-primary" />
                                <span className="text-base font-medium">Switch to Light Mode</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Right Actions - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-muted/30 transition-colors h-8 w-8"
                  data-testid="theme-toggle"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>

                {/* Command Palette */}
                <Button
                  variant="ghost"
                  onClick={() => setCommandOpen(true)}
                  className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 text-sm text-muted-foreground hover:bg-muted/30 transition-colors h-8"
                  data-testid="command-palette-trigger"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden 2xl:inline text-xs">Search</span>
                  <Badge variant="outline" className="px-1.5 py-0.5 text-xs hidden 2xl:inline-block border-primary/30">
                    ⌘K
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCommandOpen(true)}
                  className="xl:hidden p-2 rounded-full h-8 w-8"
                  data-testid="command-palette-trigger-mobile"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Auth Actions */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8 border-2 border-primary/30">
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={
                          user.role === 'STUDENT' ? '/dashboard/student/settings' :
                          user.role === 'BUYER' ? '/dashboard/buyer/settings' :
                          user.role === 'ADMIN' ? '/dashboard/admin/settings' :
                          '/profile'
                        } className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-primary/50 dark:border-primary/70 bg-transparent hover:bg-muted/30 text-foreground rounded-full px-4 py-1.5 h-8 flex items-center gap-1.5"
                    asChild
                    data-testid="sign-in-button"
                  >
                    <Link href="/signin">
                      Get Started
                      <span className="text-xs">→</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center container-unified w-full pt-24 pb-8 sm:pt-28 sm:pb-10 md:pt-32 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-start lg:items-center">
            
            {/* Top-Left: Large Headline */}
              <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] text-foreground">
                    Hire{" "}
                    <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Elite Talent
                      </span>
                      <motion.span
                    className="absolute inset-0 bg-primary/20 blur-3xl -z-10"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.4, 0.6, 0.4],
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
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl"
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
                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl group"
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
                    className="border-2 border-primary/40 bg-background/50 backdrop-blur-lg hover:bg-primary/10 hover:border-primary/60 text-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl group"
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
                  <div className="flex items-center gap-2 text-foreground/70 text-sm sm:text-base">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span>Verified Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/70 text-sm sm:text-base">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/70 text-sm sm:text-base">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
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
                <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-2xl -z-10"></div>
                
                {/* Search Card */}
                <Card className="relative border-2 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
                  <CardContent className="p-6 sm:p-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Search className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-foreground">Find Your Perfect Service</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">Search from verified student services</p>
                        </div>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
                        <Input
                          placeholder="Search services, skills, or categories..."
                          className="h-12 sm:h-14 pl-12 pr-4 rounded-xl border-2 border-primary/20 focus:border-primary/40 bg-background text-foreground text-sm sm:text-base font-medium transition-all"
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
                        className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:scale-[1.02]"
                        onClick={handleSearch}
                      >
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Search Services
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Bottom-Right: Floating Category Chips Grid */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <p className="text-sm sm:text-base text-foreground/80 font-medium mb-3">Popular Categories</p>
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
                        className="w-full h-auto min-h-[60px] sm:min-h-[70px] flex flex-col items-center justify-center gap-2 p-3 sm:p-4 hover:bg-primary/10 hover:border-primary/40 text-foreground transition-all group bg-card/50 backdrop-blur-sm rounded-xl border-primary/20"
                        onClick={() => handlePopularSearch(term)}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform text-primary" />
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
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight pb-1"
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

          {/* How It Works Summary - Redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-3xl sm:rounded-[2rem] p-8 sm:p-10 md:p-12 lg:p-14 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(199, 100%, 50%, 0.08) 0%, hsl(199, 76%, 76%, 0.06) 50%, hsl(195, 100%, 82%, 0.08) 100%)',
              border: '2px solid hsl(199, 100%, 50%, 0.15)',
            }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/8 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,169,255,0.05),_transparent_70%)]" />
            </div>
            
            {/* Header */}
            <div className="relative z-10 text-center mb-10 sm:mb-12 md:mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block mb-4"
              >
                <Badge className="bg-primary/15 text-primary border border-primary/30 px-4 py-2 uppercase font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Process
                </Badge>
              </motion.div>
              <motion.h3 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-5 text-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                How CollaboTree Works
              </motion.h3>
              <motion.p 
                className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Simple, secure, and efficient—get started in minutes
              </motion.p>
            </div>
            
            {/* Steps Grid */}
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 relative">
                {/* Step 1 */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-2 border-primary/20 bg-card/60 backdrop-blur-md hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                      {/* Icon Container */}
                      <div className="relative mb-6">
                        <motion.div
                          className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/40 transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <Search className="w-10 h-10 text-white" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg">
                            <span className="text-sm font-black text-primary">1</span>
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                      
                      <h4 className="font-bold text-xl sm:text-2xl mb-3 text-foreground group-hover:text-primary transition-colors">
                        Browse & Select
                      </h4>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Explore verified student services, view portfolios, and read reviews to find the perfect match for your project.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Step 2 */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-2 border-secondary/20 bg-card/60 backdrop-blur-md hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                      {/* Icon Container */}
                      <div className="relative mb-6">
                        <motion.div
                          className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-xl shadow-secondary/30 group-hover:shadow-2xl group-hover:shadow-secondary/40 transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                        >
                          <MessageCircle className="w-10 h-10 text-white" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-secondary flex items-center justify-center shadow-lg">
                            <span className="text-sm font-black text-secondary">2</span>
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute -inset-4 bg-secondary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        />
                      </div>
                      
                      <h4 className="font-bold text-xl sm:text-2xl mb-3 text-foreground group-hover:text-secondary transition-colors">
                        Connect & Collaborate
                      </h4>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Message directly with the student, discuss requirements, set milestones, and track progress in real-time.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Step 3 */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-2 border-accent/20 bg-card/60 backdrop-blur-md hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                      {/* Icon Container */}
                      <div className="relative mb-6">
                        <motion.div
                          className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-xl shadow-accent/30 group-hover:shadow-2xl group-hover:shadow-accent/40 transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <CheckCircle className="w-10 h-10 text-white" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-accent flex items-center justify-center shadow-lg">
                            <span className="text-sm font-black text-accent">3</span>
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                      </div>
                      
                      <h4 className="font-bold text-xl sm:text-2xl mb-3 text-foreground group-hover:text-accent transition-colors">
                        Review & Pay
                      </h4>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Review completed work, request revisions if needed, and release payment only when you're completely satisfied.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Animated Connecting Lines for Desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 1000 4" preserveAspectRatio="none">
                  <motion.path
                    d="M 50 2 L 350 2 L 650 2 L 950 2"
                    stroke="url(#gradient-line)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    viewport={{ once: true }}
                  />
                  <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(199, 100%, 50%)" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="hsl(199, 76%, 76%)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(195, 100%, 82%)" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Animated Dots */}
                <motion.div
                  className="absolute top-1/2 left-[35%] w-3 h-3 rounded-full bg-primary -translate-y-1/2"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute top-1/2 left-[65%] w-3 h-3 rounded-full bg-secondary -translate-y-1/2"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
              </div>
            </div>
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
                    
                    {/* Ratings and Reviews */}
                    {((project as any).averageRating > 0 || (project as any).totalReviews > 0) && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-foreground">
                            {((project as any).averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({(project as any).totalReviews || 0} {((project as any).totalReviews || 0) === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                    
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
          <div className="relative w-full">
            {/* Desktop arrows */}
            <Button
              onClick={prevNewProjectSlide}
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl transition-all duration-500 shadow-lg rounded-full w-12 h-12 sm:w-14 sm:h-14 group"
              data-testid="new-projects-prev-button-desktop"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </Button>

            <Button
              onClick={nextNewProjectSlide}
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl transition-all duration-500 shadow-lg rounded-full w-12 h-12 sm:w-14 sm:h-14 group"
              data-testid="new-projects-next-button-desktop"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </Button>

            {/* Projects Grid */}
            <motion.div
              className="w-full sm:px-16"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:grid-gap-unified items-stretch">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:grid-gap-unified items-stretch">
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
                        <div className="relative h-40 sm:h-48 md:h-64 lg:h-72 overflow-hidden rounded-t-2xl">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/25 via-[#4AC8FF]/20 to-[#8FE5FF]/25 group-hover:from-[#00B2FF]/35 group-hover:via-[#4AC8FF]/30 group-hover:to-[#8FE5FF]/35 dark:bg-[#02122E]/40 dark:group-hover:bg-[#02122E]/60 dark:bg-gradient-to-r dark:from-[#02122E]/40 dark:via-[#02122E]/40 dark:to-[#02122E]/40 dark:group-hover:from-[#02122E]/60 dark:group-hover:via-[#02122E]/60 dark:group-hover:to-[#02122E]/60 transition-all duration-200" />
                        </div>

                        <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                          <h3 className="font-bold text-base sm:text-lg md:text-xl line-clamp-2 mb-2 sm:mb-3 break-words overflow-wrap-anywhere">
                            {project.title}
                          </h3>

                          <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed mb-3 sm:mb-4 flex-1 break-words overflow-wrap-anywhere">
                            {project.description}
                          </p>

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
                                  <p className="font-medium text-xs sm:text-sm truncate break-words overflow-wrap-anywhere min-w-0">
                                    {project.student.name}
                                  </p>
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

                          {((project as any).averageRating > 0 || (project as any).totalReviews > 0) && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-foreground">
                                  {((project as any).averageRating || 0).toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ({(project as any).totalReviews || 0} {((project as any).totalReviews || 0) === 1 ? 'review' : 'reviews'})
                              </span>
                            </div>
                          )}

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

            {/* Mobile arrows */}
            <div className="flex sm:hidden justify-center gap-3 mt-5">
              <Button
                onClick={prevNewProjectSlide}
                variant="outline"
                size="icon"
                className="bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl transition-all duration-500 shadow-lg rounded-full w-12 h-12 group"
                data-testid="new-projects-prev-button"
              >
                <ChevronLeft className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
              </Button>
              <Button
                onClick={nextNewProjectSlide}
                variant="outline"
                size="icon"
                className="bg-primary/90 dark:bg-primary/80 border-2 border-primary/30 dark:border-primary/40 hover:bg-primary hover:border-primary/50 hover:shadow-xl transition-all duration-500 shadow-lg rounded-full w-12 h-12 group"
                data-testid="new-projects-next-button"
              >
                <ChevronRight className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </div>
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
      
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
