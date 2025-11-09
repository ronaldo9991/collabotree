import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { useRef } from "react";
import {
  Target,
  BookOpen,
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react";

const missionData = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To create the world's most trusted platform connecting university students with buyers, enabling students to earn income while building professional experience.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-500/20 to-cyan-500/20",
    position: "left",
    shape: "circle"
  },
  {
    icon: BookOpen,
    title: "Our Vision", 
    description: "A future where every student can seamlessly transition from academic learning to professional success through real-world project experience.",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-500/20 to-pink-500/20",
    position: "center",
    shape: "hexagon"
  },
  {
    icon: Lightbulb,
    title: "Our Values",
    description: "Innovation, trust, quality, and empowerment drive everything we do. We believe in creating opportunities that benefit both students and buyers.",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-500/20 to-emerald-500/20",
    position: "right",
    shape: "triangle"
  }
];

export default function About() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const missionRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const storyInView = useInView(storyRef, { once: true, margin: "-100px" });
  const missionInView = useInView(missionRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="section-padding-y bg-gradient-to-br from-background via-background to-muted/20 relative">
        <motion.div style={{ y, opacity }} className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="container-unified text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={heroInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium" data-testid="about-badge">
                <Sparkles className="w-4 h-4 mr-2" />
                About CollaboTree
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -100, scale: 0.8 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.05, x: 10 }}
              >
                Collaborate.
              </motion.span>
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 100, scale: 0.8 }}
                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                whileHover={{ scale: 1.05, x: -10 }}
              >
                Create.
              </motion.span>
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -100, scale: 0.8 }}
                transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                whileHover={{ scale: 1.05, x: 10 }}
              >
                Thrive.
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              CollaboTree is the premium platform connecting verified university students with buyers 
              seeking high-quality services. We're building the future of student entrepreneurship.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
              >
                <Link href="/signin" className="flex items-center justify-center gap-3">
                  <Users className="w-5 h-5" />
                  Join as Student
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 hover:bg-primary/10 transition-all duration-300 rounded-2xl"
              >
                <Link href="/marketplace" className="flex items-center justify-center gap-3">
                  <TrendingUp className="w-5 h-5" />
                  Hire Talent
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* Story Section */}
      <section ref={storyRef} className="section-padding-y bg-gradient-to-b from-muted/5 to-background overflow-hidden">
        <div className="container-unified">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={storyInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card bg-card/60 backdrop-blur-12 border-border/30 shadow-2xl">
                <CardContent className="p-6 sm:p-8 md:p-12 lg:p-16">
                  <div className="max-w-5xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-center mb-12"
                    >
                      <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Our Story
                      </Badge>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight pb-1" data-testid="section-story">
                        The CollaboTree Story
                      </h2>
                    </motion.div>
                    
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={storyInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="space-y-4 sm:space-y-6 text-muted-foreground leading-relaxed text-center md:text-left max-w-xl mx-auto md:mx-0"
                      >
                        <p className="text-sm sm:text-base md:text-lg">
                          CollaboTree was born from a simple observation: university students possess incredible 
                          skills and fresh perspectives, but traditional job markets often overlook them due to 
                          lack of experience.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg">
                          Meanwhile, buyers struggle to find affordable, high-quality services 
                          from motivated providers who bring fresh thinking and academic rigor.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg">
                          We created CollaboTree to bridge this gap, ensuring every service provider 
                          delivers exceptional results while students build their professional careers.
                        </p>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={storyInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="relative max-w-3xl mx-auto md:mx-0 w-full"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                            className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 sm:p-4 md:p-6 rounded-2xl flex flex-col items-center text-center sm:text-left sm:items-start"
                          >
                            <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mb-2 md:mb-3" />
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 md:mb-2 text-foreground">Verified Students</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left max-w-[220px]">University-verified talent</p>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                            className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 sm:p-4 md:p-6 rounded-2xl flex flex-col items-center text-center sm:text-left sm:items-start"
                          >
                            <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mb-2 md:mb-3" />
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 md:mb-2 text-foreground">Quality Assured</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left max-w-[220px]">Premium service standards</p>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 1.4 }}
                            className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 sm:p-4 md:p-6 rounded-2xl flex flex-col items-center text-center sm:text-left sm:items-start"
                          >
                            <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mb-2 md:mb-3" />
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 md:mb-2 text-foreground">Real-time Collaboration</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left max-w-[220px]">Seamless communication</p>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 1.6 }}
                            className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 sm:p-4 md:p-6 rounded-2xl flex flex-col items-center text-center sm:text-left sm:items-start"
                          >
                            <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mb-2 md:mb-3" />
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 md:mb-2 text-foreground">Career Launchpad</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left max-w-[220px]">Professional growth</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Background Elements */}
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-60 h-60 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* Mission, Vision, Values - Unique Interactive Section */}
      <section ref={missionRef} className="section-padding-y bg-gradient-to-b from-background to-muted/5 overflow-hidden">
        <div className="container-unified">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Target className="w-4 h-4 mr-2" />
                Our Foundation
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
                Mission, Vision & Values
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                The principles that guide everything we do at CollaboTree
              </p>
            </motion.div>
          </motion.div>

          {/* Unique Interactive Mission Cards */}
          <div className="relative">
            {/* Central Connecting Lines */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              initial={{ scaleX: 0 }}
              animate={missionInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            
            {/* Mission Cards with Unique Shapes */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-stretch max-w-7xl mx-auto">
              {missionData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ 
                    opacity: 0, 
                    y: 100, 
                    scale: 0.5,
                    rotateX: 90
                  }}
                  animate={missionInView ? { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    rotateX: 0
                  } : { 
                    opacity: 0, 
                    y: 100, 
                    scale: 0.5,
                    rotateX: 90
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: 0.3 + index * 0.3,
                    ease: "easeOut"
                  }}
                  className="group relative h-full"
                >
                  {/* Unique Shape Background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-20 blur-xl`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Morphing Shape Container */}
                  <motion.div
                    className={`relative p-6 md:p-8 rounded-3xl bg-card/80 backdrop-blur-12 border border-border/30 overflow-hidden h-full flex flex-col`}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      rotateX: 5
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      perspective: "1000px"
                    }}
                  >
                    {/* Animated Shape Overlay */}
                    <motion.div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10`}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        clipPath: item.shape === "circle" ? "circle(50%)" : 
                                  item.shape === "hexagon" ? "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)" :
                                  "polygon(50% 0%, 0% 100%, 100% 100%)"
                      }}
                    />
                    
                    {/* Icon with 3D Effect */}
                    <motion.div
                      className={`relative z-10 w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-2xl`}
                      whileHover={{ 
                        rotateY: 180,
                        scale: 1.1
                      }}
                      transition={{ duration: 0.6 }}
                      style={{
                        transformStyle: "preserve-3d"
                      }}
                    >
                      <motion.div
                        className="text-white"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <item.icon className="h-8 w-8 md:h-10 md:w-10" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center flex-1 flex flex-col">
                      <motion.h3 
                        className="text-xl md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                        whileHover={{ scale: 1.05 }}
                      >
                        {item.title}
                      </motion.h3>
                      <motion.p 
                        className="text-sm md:text-base text-muted-foreground leading-relaxed flex-1"
                        initial={{ opacity: 0 }}
                        animate={missionInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                      >
                        {item.description}
                      </motion.p>
                    </div>
                    
                    {/* Floating Particles */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={missionInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 1, delay: 1 + index * 0.2 }}
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-2 h-2 bg-gradient-to-r ${item.color} rounded-full`}
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + i * 10}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Unique Background Elements */}
        <motion.div
          className="absolute top-10 left-10 w-60 h-60 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            rotate: [360, 180, 0],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 360],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="section-padding-y bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 overflow-hidden">
        <div className="container-unified">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={ctaInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card bg-card/60 backdrop-blur-12 border-primary/30 shadow-2xl">
                <CardContent className="py-8 px-4 sm:py-12 sm:px-6 md:py-16 md:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ready to Start?
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight pb-1">
                      Join Our Community
                    </h2>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                      Whether you're a student looking to showcase your skills or a buyer seeking quality services, 
                      CollaboTree is your gateway to meaningful collaboration and professional growth.
                    </p>
                  </motion.div>
                  
                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Button
                      size="lg"
                      asChild
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group"
                      data-testid="join-as-student"
                    >
                      <Link href="/signin" className="flex items-center justify-center gap-3">
                        <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Join as Student
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="w-full sm:w-auto px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 hover:bg-primary/10 transition-all duration-300 rounded-2xl group"
                      data-testid="hire-talent"
                    >
                      <Link href="/marketplace" className="flex items-center justify-center gap-3">
                        <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Hire Talent
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Background Elements */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}