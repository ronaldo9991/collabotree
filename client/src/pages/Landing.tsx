import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, MessageSquare, Zap, Palette, Lock, CheckCircle, GraduationCap, Clock, FolderSync, Users, TrendingUp, AlertCircle, Search, Bot, Sparkles, Award, Target, Globe, Code, Smartphone, PaintBucket, FileText, BarChart3, ChevronLeft, ChevronRight, Package, UserCheck, MessageCircle, CreditCard, CheckSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import { CommandPalette } from "@/components/CommandPalette";

export default function Landing() {
  const [location, setLocation] = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewProjectSlide, setCurrentNewProjectSlide] = useState(0);
  const [topSelectionProjects, setTopSelectionProjects] = useState<any[]>([]);
  const [newProjects, setNewProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const aiPrompts = [
    "Redesign our SaaS dashboard",
    "Build an AI study assistant",
    "Audit onboarding UX",
    "Produce a pitch deck",
  ];

  const workflowSteps = [
    {
      id: "describe",
      title: "Describe Need",
      summary: "Outline your scope, goals, and non-negotiables with our AI brief assistant.",
      tip: "Typical response time: 3 minutes",
      icon: MessageSquare,
      accent: "from-primary/20 via-primary/10 to-primary/0",
    },
    {
      id: "ai-shortlist",
      title: "AI Shortlist",
      summary: "CollaboTree scans verified talent to assemble your top 5 matches automatically.",
      tip: "Matches ranked by skills, availability, and price fit",
      icon: Sparkles,
      accent: "from-secondary/20 via-secondary/10 to-secondary/0",
    },
    {
      id: "chat-align",
      title: "Chat & Align",
      summary: "Launch real-time threads, share briefs, and confirm milestones in one secure inbox.",
      tip: "Average first reply under 1 hour",
      icon: MessageCircle,
      accent: "from-accent/25 via-accent/10 to-accent/0",
    },
    {
      id: "secure-payment",
      title: "Secure Payment",
      summary: "Escrow protects both sides until milestones are approved and work is delivered.",
      tip: "Automated milestone release workflows",
      icon: CreditCard,
      accent: "from-primary/25 via-primary/10 to-primary/0",
    },
    {
      id: "review",
      title: "Deliverable Review",
      summary: "Track revisions, leave feedback, and publish testimonials to spotlight student success.",
      tip: "Post-project ratings keep the talent pool sharp",
      icon: CheckSquare,
      accent: "from-primary/20 via-secondary/10 to-accent/0",
    },
  ];

  const workflowMetrics = [
    { label: "Avg. Match Time", value: "<48 hrs" },
    { label: "Verified Universities", value: "190+" },
    { label: "Successful Deliverables", value: "9.8k+" },
  ];

  const defaultShortlistCategories = [
    "UI/UX Design",
    "Automation",
    "AI Assistants",
    "Pitch Decks",
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

  // Auto-slide functionality removed to keep manual control only

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

  const sampleProjects = topSelectionProjects.slice(0, 3);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchMatches = normalizedQuery
    ? sampleProjects.filter((project) => {
        const title = project.title?.toLowerCase() || "";
        const owner =
          project.student?.name?.toLowerCase() ||
          project.student?.full_name?.toLowerCase() ||
          "";
        const tags = Array.isArray(project.tags)
          ? project.tags.join(" ").toLowerCase()
          : "";
  return (
          title.includes(normalizedQuery) ||
          owner.includes(normalizedQuery) ||
          tags.includes(normalizedQuery)
        );
      })
    : [];

  const shortlistCategories = (() => {
    if (!normalizedQuery) {
      return defaultShortlistCategories;
    }

    const categories = new Set<string>(defaultShortlistCategories);
    if (/\b(ai|ml|machine learning|assistant)\b/.test(normalizedQuery)) {
      categories.add("AI & Machine Learning");
    }
    if (/\b(app|mobile|ios|android)\b/.test(normalizedQuery)) {
      categories.add("Mobile UX");
    }
    if (/\b(data|analytics|dashboard|viz)\b/.test(normalizedQuery)) {
      categories.add("Data Visualization");
    }
    if (/\bbrand|marketing|content\b/.test(normalizedQuery)) {
      categories.add("Brand Storytelling");
    }
    if (/\bweb|frontend|fullstack\b/.test(normalizedQuery)) {
      categories.add("Full-Stack Builds");
    }

    if (searchMatches.length > 0) {
      searchMatches[0].tags?.slice(0, 2).forEach((tag: string) => {
        if (tag) {
          categories.add(tag);
        }
      });
    }

    return Array.from(categories).slice(0, 5);
  })();


  return (
    <div className="min-h-screen">
      {/* Interactive Workflow Timeline Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/15 to-accent/10 text-foreground py-14 md:py-18">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-secondary/25 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.7),_transparent_65%)] opacity-60" />
          <div className="absolute inset-0 bg-grid-small-white/[0.08] mix-blend-overlay" />
        </div>

        <div className="relative z-10 container-unified">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-primary/15 bg-white/80 px-6 sm:px-8 py-8 md:py-10 shadow-[0px_40px_90px_-45px_rgba(0,169,255,0.6)] backdrop-blur-2xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
              <motion.div
                className="w-full lg:w-5/12 space-y-5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="rounded-3xl border border-primary/20 bg-white/90 p-4 sm:p-5 shadow-md backdrop-blur-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 uppercase tracking-wide">
                      Start with AI
                    </Badge>
                    <span className="text-xs font-medium text-foreground/50">
                      Timeline brief assistant
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-white px-4 py-3 shadow-inner">
                    <Search className="h-5 w-5 text-primary" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      placeholder='Describe your mission: "Design a mobile fintech dashboard under $2k"'
                      className="h-12 flex-1 border-0 bg-transparent px-0 text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSearch}
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-md"
                    >
                      Run AI
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setSearchQuery(prompt);
                          handlePopularSearch(prompt);
                        }}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary hover:bg-primary/20 transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      AI BRIEF SNAPSHOT
                    </p>
                    <p className="text-sm text-foreground/70 mt-1">
                      {normalizedQuery
                        ? `AI is prioritizing categories related to “${searchQuery.trim()}”.`
                        : "Add a brief to see how CollaboTree orchestrates your project end-to-end."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {workflowMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-primary/15 bg-white/85 px-4 py-3 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                        {metric.label}
                      </p>
                      <p className="text-xl font-bold text-primary mt-1">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="w-full lg:flex-1 space-y-5"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <Badge className="bg-white text-primary border border-primary/30 px-4 py-1.5 uppercase tracking-wide w-max">
                  Interactive Workflow Timeline
                </Badge>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight text-foreground">
                  Watch AI navigate from idea to delivery in minutes
                </h1>
                <p className="text-base sm:text-lg text-foreground/70 max-w-2xl">
                  CollaboTree’s mission control makes every step transparent—see exactly how briefs become curated shortlists,
                  aligned projects, and verified deliverables.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Bot className="h-3.5 w-3.5" />
                    AI plays your co-pilot
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Verified student network
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="mt-8 md:mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="overflow-x-auto pb-4">
                <div className="flex min-w-[720px] gap-6 pb-2">
                  {workflowSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const TipIcon = step.id === "ai-shortlist" ? Bot : Clock;
                    const isShortlist = step.id === "ai-shortlist";
                    const matchesToShow = isShortlist ? searchMatches.slice(0, 2) : [];

                    return (
                      <div key={step.id} className="relative min-w-[220px] sm:min-w-[240px]">
                        {index !== workflowSteps.length - 1 && (
                          <div className="absolute top-10 right-[-18px] hidden md:block h-px w-9 bg-gradient-to-r from-primary/25 via-primary/15 to-transparent" />
                        )}
                        <motion.div
                          className="relative flex h-full flex-col gap-4 rounded-2xl border border-primary/15 bg-white/85 px-5 py-5 shadow-lg backdrop-blur-lg"
                          whileHover={{ y: -6, scale: 1.02 }}
                          animate={{ scale: isShortlist && normalizedQuery ? 1.04 : 1 }}
                          transition={{ type: "spring", stiffness: 220, damping: 18 }}
                        >
                          <div className="absolute left-5 top-0 -translate-y-1/2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            Step {index + 1}
                          </div>
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center shadow-inner`}>
                            <StepIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                            <p className="text-sm text-foreground/65 leading-relaxed">
                              {step.summary}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                            <TipIcon className="h-3.5 w-3.5" />
                            {step.tip}
                          </div>

                          {isShortlist && (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {shortlistCategories.map((category) => (
                                  <span
                                    key={category}
                                    className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                              {normalizedQuery && (
                                <div className="space-y-2 rounded-xl border border-primary/10 bg-primary/5 p-3">
                                  {matchesToShow.length > 0 ? (
                                    matchesToShow.map((project) => (
                                      <div key={project.id} className="flex items-center justify-between gap-3 rounded-lg border border-primary/15 bg-white px-3 py-2 shadow-sm">
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                                            {project.title}
                                          </p>
                                          <p className="text-[11px] text-foreground/60 line-clamp-1">
                                            {project.student?.name || project.student?.full_name || "Verified student"}
                                          </p>
                                        </div>
                                        <span className="text-xs font-semibold text-primary whitespace-nowrap">
                                          {project.price ?? `$${Math.round(project.budget ?? 0)}`}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-primary/70">
                                      AI is exploring deeper matches for “{searchQuery.trim()}”.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <div className="mt-6 md:mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-foreground/65">
                Curious how it works in practice? Preview the buyer journey or bring your student team onboard today.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  asChild
                >
                  <Link href="/signin">
                    Launch AI Brief
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" asChild>
                  <Link href="/how-it-works">
                    Buyer Walkthrough
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-secondary/40 text-secondary-foreground hover:bg-secondary/10" asChild>
                  <Link href="/signin">
                    Student Onboarding
                  </Link>
                </Button>
              </div>
            </div>
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
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-20">
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
