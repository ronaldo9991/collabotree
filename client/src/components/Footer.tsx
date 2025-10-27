import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, ArrowRight, Network } from "lucide-react";

export function Footer() {
  const navigation = {
    platform: [
      { name: "Home", href: "/" },
      { name: "Marketplace", href: "/marketplace" },
      { name: "How it Works", href: "/how-it-works" },
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    forStudents: [
      { name: "Student Dashboard", href: "/dashboard/student" },
      { name: "Create Service", href: "/dashboard/student/services/new" },
      { name: "Student Settings", href: "/dashboard/student/settings" },
    ],
    forBuyers: [
      { name: "Buyer Dashboard", href: "/dashboard/buyer" },
      { name: "My Orders", href: "/dashboard/buyer/orders" },
      { name: "Buyer Settings", href: "/dashboard/buyer/settings" },
    ],
  };

  const social = [
    { name: "Facebook", href: "https://facebook.com/collabotree", icon: Facebook },
    { name: "Twitter", href: "https://twitter.com/collabotree", icon: Twitter },
    { name: "Instagram", href: "https://instagram.com/collabotree", icon: Instagram },
    { name: "LinkedIn", href: "https://linkedin.com/company/collabotree", icon: Linkedin },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-sky-400 via-sky-500/90 to-blue-500/80 dark:bg-[#0A1A3A] dark:bg-gradient-to-br dark:from-[#0A1A3A] dark:via-[#0A1A3A] dark:to-[#0A1A3A] border-t border-border/50 text-white dark:text-foreground">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-small-white/[0.02] dark:bg-grid-small-white/[0.02]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link 
                href="/" 
                className="flex items-center gap-3 mb-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/90 dark:from-foreground dark:to-foreground/80 bg-clip-text">
                  CollaboTree
                </span>
              </Link>
              
              <p className="text-white dark:text-muted-foreground mb-8 leading-relaxed text-base max-w-sm">
                Connect with verified university students for exceptional project work. 
                Building the future of student entrepreneurship.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/20 dark:bg-muted/50 hover:bg-white/30 dark:hover:bg-primary/10 border border-white/30 dark:border-border/50 hover:border-white/50 dark:hover:border-primary/20 flex items-center justify-center text-white dark:text-muted-foreground hover:text-white dark:hover:text-primary transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                    aria-label={item.name}
                  >
                    <item.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">Platform</h3>
              <ul className="space-y-3">
                {navigation.platform.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-white dark:text-muted-foreground hover:text-white/80 dark:hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-200" />
                      <span className="group-hover:translate-x-1 transform duration-200 inline-block">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Students */}
            <div>
              <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">For Students</h3>
              <ul className="space-y-3">
                {navigation.forStudents.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-white dark:text-muted-foreground hover:text-white/80 dark:hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-200" />
                      <span className="group-hover:translate-x-1 transform duration-200 inline-block">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Buyers */}
            <div>
              <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">For Buyers</h3>
              <ul className="space-y-3">
                {navigation.forBuyers.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-white dark:text-muted-foreground hover:text-white/80 dark:hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-200" />
                      <span className="group-hover:translate-x-1 transform duration-200 inline-block">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-6 text-base text-white dark:text-foreground">Contact Us</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:hello@collabotree.com"
                  className="flex items-center gap-2 text-white dark:text-muted-foreground hover:text-white/80 dark:hover:text-primary transition-colors text-sm group"
                >
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>hello@collabotree.com</span>
                </a>
                <a 
                  href="tel:+15551234567"
                  className="flex items-center gap-2 text-white dark:text-muted-foreground hover:text-white/80 dark:hover:text-primary transition-colors text-sm group"
                >
                  <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>+1 (555) 123-4567</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 dark:border-border/50 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-white dark:text-muted-foreground">
              &copy; {new Date().getFullYear()} CollaboTree. All rights reserved.
            </p>
            
            {/* Tagline */}
            <p className="text-sm text-white/80 dark:text-muted-foreground">
              Building tomorrow's student success today.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}