import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, Shield, MessageSquare, Zap, Palette, Lock, CheckCircle, 
  GraduationCap, Clock, FolderSync, Users, TrendingUp, AlertCircle, 
  Search, Bot, Sparkles, Award, Target, Globe, Code, Smartphone, 
  PaintBucket, FileText, BarChart3, ChevronLeft, ChevronRight, 
  Package, UserCheck, MessageCircle, CreditCard, CheckSquare,
  ArrowRight, Heart, Eye, ThumbsUp, Award as AwardIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      setLoading(true);
        
        // Fetch top selection services (admin-curated) - public endpoint
        const topSelectionResponse = await api.getPublicTopSelectionServices();
        let topSelectionServices = [];
        
      if (topSelectionResponse && typeof topSelectionResponse === 'object' && 'success' in topSelectionResponse && topSelectionResponse.success && topSelectionResponse.data) {
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
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = useCallback(() => {
    if (debouncedSearchQuery.trim()) {
      const url = `/marketplace?search=${encodeURIComponent(debouncedSearchQuery)}`;
      console.log('   Navigating to:', url);
      setLocation(url);
    }
  }, [debouncedSearchQuery, setLocation]);

  const handlePopularSearch = (term: string) => {
    const url = `/marketplace?search=${encodeURIComponent(term)}`;
    console.log('   Navigating to:', url);
    setLocation(url);
  };

  // Features data
  const features = [
    {
      title: "Verified Students",
      description: "All students are verified through their university credentials and academic records before joining our platform.",
      icon: UserCheck,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Quality Assurance",
      description: "Review and approve work before final payment. Request revisions until you're completely satisfied.",
      icon: CheckSquare,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Global Reach",
      description: "Access talented students from top universities worldwide. Connect with diverse perspectives and skills.",
      icon: Globe,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Safe Payments",
      description: "Your payments are protected with secure escrow system. Money is only released when you're satisfied.",
      icon: CreditCard,
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Dispute Resolution",
      description: "Fair and transparent dispute resolution process to ensure both parties are treated fairly.",
      icon: Shield,
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      title: "Communication",
      description: "Connect directly with students through our built-in messaging system. No middlemen, just clear communication.",
      icon: MessageCircle,
      gradient: "from-teal-500 to-green-500"
    }
  ];

  // Category pills data
  const categories = [
    { name: "Web Dev", icon: Code, color: "bg-blue-500" },
    { name: "Design", icon: Palette, color: "bg-purple-500" },
    { name: "Data", icon: BarChart3, color: "bg-green-500" },
    { name: "Content", icon: FileText, color: "bg-orange-500" },
    { name: "Research", icon: Search, color: "bg-indigo-500" },
    { name: "Tutoring", icon: GraduationCap, color: "bg-pink-500" }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "CollaboTree has been a game-changer for our content needs. The students deliver high-quality work on time and within budget.",
      rating: 5,
      avatar: ""
    },
    {
      name: "Michael Chen",
      role: "Student",
      university: "Stanford University",
      content: "I've earned over $5,000 through CollaboTree while studying. It's the perfect platform for students to showcase their skills.",
      rating: 5,
      avatar: ""
    },
    {
      name: "Emily Rodriguez",
      role: "Startup Founder",
      company: "InnovateLab",
      content: "The quality of work from verified students is outstanding. We've built our entire MVP with student talent from CollaboTree.",
      rating: 5,
      avatar: ""
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How do I verify that a student is legitimate?",
      answer: "All students must provide university credentials and academic records. We verify their identity and enrollment status before they can join our platform."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Payments are held in escrow until you approve the completed work."
    },
    {
      question: "Can I request revisions to completed work?",
      answer: "Yes! You can request unlimited revisions until you're completely satisfied with the work. The student must deliver according to your requirements."
    },
    {
      question: "How do I communicate with the student?",
      answer: "We provide a built-in messaging system where you can chat directly with the student, share files, and track project progress in real-time."
    },
    {
      question: "What if there's a dispute?",
      answer: "Our dispute resolution team will review the case fairly and help resolve any issues. We have a transparent process to ensure both parties are treated fairly."
    },
    {
      question: "How quickly can I get my project completed?",
      answer: "Most projects are completed within 3-7 days, depending on complexity. Students set their own delivery timelines, and you can filter by delivery time when searching."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section (restored to image-based version) */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/jhero.png"
            alt="CollaboTree Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        </div>
        <div className="relative z-10 container-unified px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
                Verified Students Only
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow">
                Connect with Top Student Talent
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl">
                Quality work at competitive rates with secure payments and verified profiles.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-primary text-white hover:bg-primary/90">
                  <Link href="/marketplace">
                    Explore Marketplace
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90">
                  <Link href="/how-it-works">
                    How It Works
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-12 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-y border-border/20">
        <div className="container-unified">
              <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
                initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
              >
                <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  2,500+
                </motion.span>
                  </div>
              <p className="text-sm text-muted-foreground font-medium">Verified Students</p>
                      </motion.div>
                    
                    <motion.div
              className="space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-secondary">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  98%
                </motion.span>
                  </div>
              <p className="text-sm text-muted-foreground font-medium">Success Rate</p>
            </motion.div>
            
                      <motion.div
              className="space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-accent">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  24h
                </motion.span>
                  </div>
              <p className="text-sm text-muted-foreground font-medium">Response Time</p>
                </motion.div>
              </motion.div>
        </div>
      </section>

      {/* Top 5 Student Projects */}
      <section className="section-padding-y bg-background">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Top Student Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the best work from our verified students. These projects showcase the quality and creativity you can expect.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
                  </div>
                ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topSelectionProjects.slice(0, 6).map((project, index) => (
                    <motion.div 
                  key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        {project.image ? (
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                        ) : (
                          <project.icon className="w-16 h-16 text-primary/50" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          <Star className="w-3 h-3 mr-1" />
                          {project.price}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {project.description}
                    </p>
                    
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={project.student.avatar} />
                            <AvatarFallback>{project.student.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{project.student.name}</p>
                            <p className="text-xs text-muted-foreground">{project.student.university}</p>
                    </div>
                    </div>
                            {project.student.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                    </div>
                    
                      <Button className="w-full" asChild>
                        <Link href={`/service/${project.id}`}>
                          View Project
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                  </CardContent>
                </Card>
                  </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding-y bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/5">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CollaboTree?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need for successful collaboration with verified student talent.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-6 text-center hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="section-padding-y bg-background">
        <div className="container-unified">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find exactly what you need with our organized categories
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
          <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Button 
                  variant="outline"
                  className="h-16 px-6 rounded-full hover:bg-primary/10 hover:border-primary transition-all duration-300 group"
                  onClick={() => handlePopularSearch(category.name)}
                >
                  <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{category.name}</span>
            </Button>
          </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding-y bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from both buyers and students about their CollaboTree experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
          <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
                        {testimonial.university && `at ${testimonial.university}`}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding-y bg-background">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about using CollaboTree
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
              >
                <Card className="border-border/50 hover:border-primary/20 transition-all duration-300">
                  <details className="group">
                    <summary className="p-6 cursor-pointer list-none flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <h3 className="font-semibold text-left pr-4">{faq.question}</h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                </Card>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-y bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container-unified text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of buyers and students already using CollaboTree
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90">
                <Link href="/marketplace">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Explore Marketplace
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                <Link href="/signin">
                  <Users className="w-5 h-5 mr-2" />
                  Join as Student
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}