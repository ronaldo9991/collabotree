import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import {
  UserCheck,
  Upload,
  Search,
  MessageCircle,
  CreditCard,
  Star,
  Shield,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Zap,
  Download,
  ThumbsUp,
  AlertCircle,
  Calendar,
  ArrowRight,
  GraduationCap
} from "lucide-react";

const timelineSteps = [
  {
    step: "01",
    icon: UserCheck,
    title: "Create Account",
    description: "Sign up with your university email and complete your profile with academic credentials.",
    category: "Getting Started",
    details: ["University email verification", "Academic profile setup", "Identity confirmation"]
  },
  {
    step: "02", 
    icon: Shield,
    title: "Academic Verification",
    description: "Upload your student ID for automated verification using our OCR technology.",
    category: "Getting Started",
    details: ["ID card scan", "OCR processing", "Instant verification"]
  },
  {
    step: "03",
    icon: Upload,
    title: "Create Services", 
    description: "List your skills and expertise with detailed portfolios and competitive pricing.",
    category: "For Students",
    details: ["Service portfolios", "Flexible pricing", "Skill showcasing"]
  },
  {
    step: "04",
    icon: MessageCircle,
    title: "Receive Orders", 
    description: "Get matched with buyers and communicate project requirements through our platform.",
    category: "For Students",
    details: ["Order notifications", "Real-time chat", "Requirement clarity"]
  },
  {
    step: "05",
    icon: CheckCircle,
    title: "Deliver Excellence",
    description: "Complete projects with our integrated tools and receive secure payments.",
    category: "For Students",
    details: ["File delivery system", "Milestone tracking", "Secure payments"]
  },
  {
    step: "06",
    icon: Search,
    title: "Browse Talent",
    description: "Discover verified student services with advanced filtering and detailed profiles.",
    category: "For Buyers",
    details: ["Advanced search", "Student profiles", "Portfolio reviews"]
  },
  {
    step: "07",
    icon: CreditCard,
    title: "Place Orders",
    description: "Select services, communicate requirements, and track progress in real-time.",
    category: "For Buyers",
    details: ["Easy ordering", "Progress tracking", "Direct communication"]
  },
  {
    step: "08",
    icon: Star,
    title: "Receive Results",
    description: "Get high-quality deliverables with revision options and feedback system.",
    category: "For Buyers",
    details: ["Quality assurance", "Revision system", "Rating feedback"]
  }
];


const platformFeatures = [
  {
    title: "Elite Academic Network",
    description: "Connect with the brightest minds from Stanford, MIT, Harvard, and 500+ top universities worldwide. Every student is rigorously verified through institutional credentials.",
    stats: "500+ Universities",
    highlight: "Academic Excellence"
  },
  {
    title: "Intelligent Project Matching",
    description: "Our advanced AI analyzes your requirements and matches you with students who have the exact skills and academic background for your project needs.",
    stats: "95% Match Rate",
    highlight: "AI-Powered"
  },
  {
    title: "Enterprise-Grade Security",
    description: "Bank-level encryption, secure escrow payments, and comprehensive dispute resolution ensure your projects and payments are always protected.",
    stats: "100% Secure",
    highlight: "Bank-Level"
  },
  {
    title: "Premium Quality Guarantee",
    description: "Every project comes with unlimited revisions, quality assurance, and our satisfaction guarantee. We ensure exceptional results or your money back.",
    stats: "99.7% Satisfaction",
    highlight: "Guaranteed"
  }
];


export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-padding-y">
        <div className="container-unified">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm" data-testid="how-it-works-badge">
              Platform Overview
            </Badge>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              How CollaboTree Works
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4 sm:px-0">
              A comprehensive platform connecting verified university students with global buyers 
              through secure, professional project collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Button size="lg" asChild className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base" data-testid="hire-talent-btn">
                <Link href="/api/login">Hire Talent</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base" data-testid="explore-talent-btn">
                <Link href="/marketplace">Explore Talent</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Process Flow */}
      <section className="section-padding-y">
        <div className="container-unified">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Simple Step-by-Step Process</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
              From account creation to project completion - your journey on CollaboTree
            </p>
          </div>
          
          {/* Timeline Container */}
          <div className="relative max-w-5xl mx-auto">
            {/* Timeline Line - Always visible */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary via-secondary to-accent"></div>
            
            {/* Timeline Steps */}
            <div className="space-y-8 sm:space-y-12 lg:space-y-16">
              {timelineSteps.map((timelineStep, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, y: 30 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-50px" }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-4 sm:gap-6 lg:gap-12`}
                  data-testid={`timeline-step-${index}`}
                >
                  {/* Content Card */}
                  <div className={`w-full sm:w-5/12 ${index % 2 === 0 ? 'text-right pr-2 sm:pr-4' : 'text-left pl-2 sm:pl-4'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="glass-card bg-accent/20 backdrop-blur-12 border-2 border-accent/50 hover:border-accent/70 hover:shadow-xl transition-all duration-300 shadow-lg">
                        <CardContent className="p-4 sm:p-5 lg:p-6">
                          <div className="mb-4">
                            <Badge variant="outline" className={`mb-3 text-xs sm:text-sm ${index % 2 === 0 ? 'float-right' : 'float-left'}`}>
                              {timelineStep.category}
                            </Badge>
                            <div className="clear-both"></div>
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 leading-tight">{timelineStep.title}</h3>
                            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                              {timelineStep.description}
                            </p>
                          </div>
                          <ul className={`space-y-2 text-xs sm:text-sm ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                            {timelineStep.details.map((detail, detailIndex) => (
                              <motion.li 
                                key={detailIndex} 
                                initial={{ opacity: 0, x: index % 2 === 0 ? 10 : -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: detailIndex * 0.1 }}
                                className={`flex items-center gap-2 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                              >
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                <span>{detail}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  
                  {/* Timeline Node - Always visible */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg border-3 sm:border-4 border-background relative"
                    >
                      <timelineStep.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}
                        className="absolute -top-6 sm:-top-7 lg:-top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-md"
                      >
                        {timelineStep.step}
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  {/* Spacer for alignment */}
                  <div className="w-full sm:w-5/12 flex-shrink-0"></div>
                  
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Platform Features */}
      <section className="section-padding-y bg-muted/20">
        <div className="container-unified">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Why Choose CollaboTree
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
                Experience the future of academic talent collaboration with our cutting-edge platform designed for excellence, innovation, and unmatched results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="glass-card bg-gradient-to-br from-card/50 to-card/30 text-center hover-lift border-border/30 hover:border-primary/30 group transition-all duration-300" data-testid={`platform-feature-${index}`}>
                  <CardContent className="p-6 sm:p-8 relative overflow-hidden">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      {/* Highlight badge */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
                        <span className="text-xs font-medium text-primary">{feature.highlight}</span>
                      </div>
                      
                      <h4 className="text-lg sm:text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {feature.title}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 text-primary">
                          {feature.stats}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding-y bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container-unified">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="glass-card bg-primary/25 backdrop-blur-12 border-primary/30 hover:border-primary/50 max-w-4xl mx-auto">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Ready to Start Collaborating?</h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                  Join thousands of verified students and global buyers creating successful 
                  project partnerships on CollaboTree.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                  <Button size="lg" asChild className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base bg-gradient-to-r from-primary to-secondary" data-testid="join-as-student">
                    <Link href="/api/login">Join as Student</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base" data-testid="hire-talent-cta">
                    <Link href="/marketplace">Hire Talent</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}