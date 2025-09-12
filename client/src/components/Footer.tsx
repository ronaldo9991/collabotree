import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Shield, Users, Star, Globe } from "lucide-react";

export function Footer() {

  const navigation = {
    platform: [
      { name: "Explore Talent", href: "/marketplace" },
      { name: "How it Works", href: "/how-it-works" },
      { name: "About", href: "/about" },
      { name: "Success Stories", href: "/testimonials" },
    ],
    students: [
      { name: "Start Selling", href: "/signin" },
      { name: "Student Dashboard", href: "/dashboard/student" },
      { name: "Verification", href: "/verify" },
      { name: "Help Center", href: "/help" },
      { name: "Student Resources", href: "/resources" },
    ],
    buyers: [
      { name: "Hire Talent", href: "/signin" },
      { name: "Buyer Dashboard", href: "/dashboard/buyer" },
      { name: "Project Management", href: "/projects" },
      { name: "Support", href: "/support" },
      { name: "Quality Guarantee", href: "/guarantee" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Dispute Resolution", href: "/disputes" },
    ],
  };

  const social = [
    { name: "Facebook", href: "https://facebook.com/collabotree", icon: Facebook },
    { name: "Twitter", href: "https://twitter.com/collabotree", icon: Twitter },
    { name: "Instagram", href: "https://instagram.com/collabotree", icon: Instagram },
    { name: "LinkedIn", href: "https://linkedin.com/company/collabotree", icon: Linkedin },
  ];

  const features = [
    { icon: Shield, text: "Verified Students Only" },
    { icon: Users, text: "Global Community" },
    { icon: Star, text: "Quality Guaranteed" },
    { icon: Globe, text: "24/7 Support" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-sky-400 via-sky-500/90 to-blue-500/80 dark:from-background dark:via-muted/20 dark:to-muted/40 border-t border-border/50 text-white dark:text-foreground">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-small-white/[0.02] dark:bg-grid-small-white/[0.02]" />
      
      <div className="relative container-unified">
        {/* Main Footer Content */}
        <div className="section-padding-y">
          <div className="grid grid-cols-1 lg:grid-cols-12 grid-gap-unified">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <Link 
                href="/" 
                className="flex items-center gap-3 mb-6 group"
                data-testid="link-footer-logo"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-blue-600 dark:from-primary to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-base">CT</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/90 dark:from-foreground dark:to-foreground/80 bg-clip-text">
                  CollaboTree
                </span>
              </Link>
              
              <p className="text-white dark:text-muted-foreground mb-8 leading-relaxed text-base">
                The premium platform connecting verified university students with global buyers. 
                Building the future of student entrepreneurship through trust and innovation.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-sm text-white dark:text-muted-foreground">
                    <feature.icon className="h-4 w-4 text-white dark:text-primary" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 grid-gap-unified">
                {/* Platform Links */}
                <div>
                  <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">Platform</h3>
                  <ul className="space-y-4">
                    {navigation.platform.map((item) => (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className="text-white dark:text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 transform duration-200 block"
                          data-testid={`link-platform-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* For Students */}
                <div>
                  <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">For Students</h3>
                  <ul className="space-y-4">
                    {navigation.students.map((item) => (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className="text-white dark:text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 transform duration-200 block"
                          data-testid={`link-students-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* For Buyers */}
                <div>
                  <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">For Buyers</h3>
                  <ul className="space-y-4">
                    {navigation.buyers.map((item) => (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className="text-white dark:text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 transform duration-200 block"
                          data-testid={`link-buyers-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">Legal</h3>
                  <ul className="space-y-4">
                    {navigation.legal.map((item) => (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className="text-white dark:text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 transform duration-200 block"
                          data-testid={`link-legal-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-6 text-sm">
              <a 
                href="mailto:hello@collabotree.com"
                className="flex items-center gap-2 text-white dark:text-muted-foreground hover:text-primary transition-colors group"
                data-testid="link-contact-email"
              >
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>hello@collabotree.com</span>
              </a>
              <a 
                href="tel:+15551234567"
                className="flex items-center gap-2 text-white dark:text-muted-foreground hover:text-primary transition-colors group"
                data-testid="link-contact-phone"
              >
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>+1 (555) 123-4567</span>
              </a>
              <div className="flex items-center gap-2 text-white dark:text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="w-10 h-10 rounded-lg bg-white/20 dark:bg-muted/50 hover:bg-white/30 dark:hover:bg-primary/10 border border-white/30 dark:border-border/50 hover:border-white/50 dark:hover:border-primary/20 flex items-center justify-center text-white dark:text-muted-foreground hover:text-white dark:hover:text-primary transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                  aria-label={item.name}
                  data-testid={`link-social-${item.name.toLowerCase()}`}
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-white dark:text-muted-foreground">
            <p>&copy; 2025 CollaboTree. All rights reserved.</p>
            <p className="text-xs">Building tomorrow's student success today.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}