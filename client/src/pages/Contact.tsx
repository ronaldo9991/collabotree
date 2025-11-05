import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Users, 
  Globe,
  CheckCircle,
  AlertCircle,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Youtube,
  ChevronRight,
  Sparkles,
  Heart,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Floating Particle Component
const FloatingParticle = ({ delay = 0, duration = 20, size = 60, x = 0, y = 0 }: { delay?: number; duration?: number; size?: number; x?: number; y?: number }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated Input Field Component
const AnimatedInput = ({ 
  id, 
  name, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required,
  label 
}: {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  required?: boolean;
  label: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <motion.label
        htmlFor={id}
        className="block text-sm font-medium mb-2"
        animate={{
          color: isFocused || hasValue ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
        }}
        transition={{ duration: 0.2 }}
      >
        {label} {required && <span className="text-destructive">*</span>}
      </motion.label>
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className="w-full transition-all duration-300"
          placeholder={placeholder}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
};

// Animated Textarea Component
const AnimatedTextarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  required,
  label,
  rows = 6
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  required?: boolean;
  label: string;
  rows?: number;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const maxLength = 1000;
  const remaining = maxLength - value.length;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <motion.label
          htmlFor={id}
          className="block text-sm font-medium"
          animate={{
            color: isFocused || hasValue ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          }}
          transition={{ duration: 0.2 }}
        >
          {label} {required && <span className="text-destructive">*</span>}
        </motion.label>
        <motion.span
          className="text-xs text-muted-foreground"
          animate={{
            color: remaining < 100 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))",
          }}
        >
          {remaining} characters left
        </motion.span>
      </div>
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className="w-full resize-none transition-all duration-300"
          placeholder={placeholder}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
};

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      value: "hello@collabotree.com",
      href: "mailto:hello@collabotree.com",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon-Fri from 9am to 6pm",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come say hello at our office",
      value: "San Francisco, CA",
      href: "#",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "We typically respond within",
      value: "24 hours",
      href: "#",
      color: "from-orange-500 to-red-500"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "partnership", label: "Partnership" },
    { value: "media", label: "Media & Press" }
  ];

  const faqItems = [
    {
      question: "How quickly will I receive a response?",
      answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly."
    },
    {
      question: "Can I request a demo or consultation?",
      answer: "Absolutely! We offer free consultations for universities and organizations interested in partnering with CollaboTree. Contact us to schedule a demo."
    },
    {
      question: "What types of inquiries can I send?",
      answer: "You can reach out for general questions, technical support, partnership opportunities, media inquiries, or any other questions about our platform."
    },
    {
      question: "Do you offer support for universities?",
      answer: "Yes! We have dedicated support for educational institutions. Contact us to learn about our university partnership programs and how we can help your students succeed."
    },
    {
      question: "How can I report a technical issue?",
      answer: "For technical issues, please select 'Technical Support' as your inquiry type and provide detailed information about the problem you're experiencing."
    }
  ];

  const socialLinks = [
    { icon: Twitter, name: "Twitter", href: "#", color: "hover:text-blue-400" },
    { icon: Linkedin, name: "LinkedIn", href: "#", color: "hover:text-blue-600" },
    { icon: Github, name: "GitHub", href: "#", color: "hover:text-gray-800 dark:hover:text-gray-200" },
    { icon: Facebook, name: "Facebook", href: "#", color: "hover:text-blue-600" },
    { icon: Instagram, name: "Instagram", href: "#", color: "hover:text-pink-500" },
    { icon: Youtube, name: "YouTube", href: "#", color: "hover:text-red-600" }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "10K+", color: "from-blue-500 to-cyan-500" },
    { icon: MessageSquare, label: "Messages Sent", value: "50K+", color: "from-green-500 to-emerald-500" },
    { icon: Heart, label: "Satisfaction Rate", value: "98%", color: "from-pink-500 to-rose-500" },
    { icon: Zap, label: "Response Time", value: "<24h", color: "from-yellow-500 to-orange-500" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setShowSuccess(true);
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: "general"
    });
    setIsSubmitting(false);

    setTimeout(() => setShowSuccess(false), 3000);
  };

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
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section with Floating Particles */}
      <section className="relative section-padding-y bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 2.5}
              duration={15 + Math.random() * 10}
              size={40 + Math.random() * 60}
              x={Math.random() * 100}
              y={Math.random() * 100}
            />
          ))}
        </div>

        <div className="container-unified relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <MessageSquare className="h-4 w-4 mr-2" />
                Get in Touch
              </Badge>
            </motion.div>
            
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Contact Us
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Have questions about CollaboTree? We're here to help. Reach out to us and we'll get back to you as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section className="section-padding-y bg-muted/10">
        <div className="container-unified">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  whileHover={{
                    scale: 1.15,
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <motion.h3
                  className="text-2xl md:text-3xl font-bold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards with 3D Tilt */}
      <section className="section-padding-y">
        <div className="container-unified">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <TiltCard className="h-full">
                  <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${info.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                        whileHover={{
                          scale: 1.2,
                          rotate: 360,
                          transition: { duration: 0.5 }
                        }}
                        animate={{
                          boxShadow: [
                            "0 0 0px rgba(0, 178, 255, 0.4)",
                            "0 0 20px rgba(0, 178, 255, 0.6)",
                            "0 0 0px rgba(0, 178, 255, 0.4)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      >
                        <info.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                      <motion.a
                        href={info.href}
                        className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1 group/link"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {info.value}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </motion.a>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section-padding-y bg-muted/20">
        <div className="container-unified">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 shadow-xl">
                <CardHeader>
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Send className="h-6 w-6 text-primary" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
                  </motion.div>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  {showSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">We'll get back to you soon.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatedInput
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                          label="Full Name"
                        />
                        <AnimatedInput
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          required
                          label="Email Address"
                        />
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-2">
                          Inquiry Type <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        >
                          {inquiryTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <AnimatedInput
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="How can we help?"
                        required
                        label="Subject"
                      />

                      <AnimatedTextarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your inquiry..."
                        required
                        label="Message"
                        rows={6}
                      />

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full"
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Why Contact Us */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Why Contact Us?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        "Quick response time - usually within 24 hours",
                        "Dedicated support team ready to assist you",
                        "Expert guidance on platform features and best practices",
                        "Partnership opportunities for universities and organizations"
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                          >
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <span className="text-muted-foreground">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        { href: "/marketplace", label: "Browse Services" },
                        { href: "/how-it-works", label: "How It Works" },
                        { href: "/about", label: "About Us" },
                        { href: "/dashboard/student", label: "Student Dashboard" }
                      ].map((link, index) => (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <a
                            href={link.href}
                            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 group"
                          >
                            <span>{link.label}</span>
                            <motion.div
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Connect With Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {socialLinks.map((social, index) => (
                        <motion.a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.1, y: -5 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          viewport={{ once: true }}
                        >
                          <social.icon className={`w-6 h-6 text-muted-foreground ${social.color} transition-colors`} />
                          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                            {social.name}
                          </span>
                        </motion.a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding-y bg-background">
        <div className="container-unified">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about contacting us
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-4">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="border border-primary/20 rounded-xl px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
