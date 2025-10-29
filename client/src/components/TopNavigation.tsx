import { useState, useEffect } from "react";
import { Link, useLocation, useRouter } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandPalette } from "./CommandPalette";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Network, 
  Search, 
  Moon, 
  Sun, 
  Home, 
  ShoppingCart, 
  FileText, 
  Users, 
  Menu, 
  LogOut, 
  Settings, 
  User, 
  MessageSquare,
  ChevronDown,
  ArrowUp
} from "lucide-react";

interface TopNavigationProps {
  children: React.ReactNode;
}

export function TopNavigation({ children }: TopNavigationProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const navigation = [
    { 
      name: "Platform", 
      href: "/platform", 
      icon: Network, 
      show: true,
      hasDropdown: true,
      dropdownItems: [
        { name: "Student Hub", href: "/platform/students", description: "Connect with verified students" },
        { name: "Buyer Portal", href: "/platform/buyers", description: "Find quality services" },
        { name: "Admin Panel", href: "/platform/admin", description: "Manage the platform" }
      ]
    },
    { 
      name: "Resources", 
      href: "/resources", 
      icon: FileText, 
      show: true,
      hasDropdown: true,
      dropdownItems: [
        { name: "How it Works", href: "/how-it-works", description: "Learn about our process" },
        { name: "Help Center", href: "/help", description: "Get support and answers" },
        { name: "Blog", href: "/blog", description: "Latest news and updates" },
        { name: "Guides", href: "/guides", description: "Step-by-step tutorials" }
      ]
    },
    { 
      name: "Integrations", 
      href: "/integrations", 
      icon: Network, 
      show: true,
      hasDropdown: true,
      dropdownItems: [
        { name: "API Documentation", href: "/api-docs", description: "Developer resources" },
        { name: "Webhooks", href: "/webhooks", description: "Real-time notifications" },
        { name: "Third-party Apps", href: "/apps", description: "Connect your tools" }
      ]
    },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart, show: true, hasDropdown: false },
    { name: "Pricing", href: "/pricing", icon: Users, show: true, hasDropdown: false },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Scroll detection for navbar styling and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  // Helper function for navigation with scroll to top
  const handleNavigation = (href: string) => {
    navigate(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-slate-800 text-white text-center py-1 text-xs">
        <span>Welcome to CollaboTree - Connect with Verified University Students</span>
      </div>

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-200/20' 
          : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">^</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">CollaboTree</span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                item.show && (
                  <div key={item.name} className="relative group">
                    {item.hasDropdown ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            {item.name}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="start">
                          <DropdownMenuLabel className="text-slate-900 dark:text-white font-semibold">
                            {item.name}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {item.dropdownItems?.map((dropdownItem) => (
                            <DropdownMenuItem
                              key={dropdownItem.name}
                              onClick={() => handleNavigation(dropdownItem.href)}
                              className="cursor-pointer p-3"
                            >
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {dropdownItem.name}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {dropdownItem.description}
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation(item.href)}
                        className={`text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                          location === item.href ? 'text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                      >
                        {item.name}
                      </Button>
                    )}
                  </div>
                )
              ))}
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* Command Palette */}
              <Button
                variant="ghost"
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
                <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                  ⌘K
                </Badge>
              </Button>

              {/* Auth Actions */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation("/dashboard")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation(
                      user.role === 'STUDENT' ? '/dashboard/student/settings' :
                      user.role === 'BUYER' ? '/dashboard/buyer/settings' :
                      user.role === 'ADMIN' ? '/dashboard/admin/settings' :
                      '/profile'
                    )} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
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
                  onClick={() => handleNavigation("/signin")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Get Started
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b">
                      <h2 className="text-xl font-bold">Menu</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="flex items-center gap-2"
                      >
                        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        <span className="text-sm font-medium">{theme === "light" ? "Dark" : "Light"}</span>
                      </Button>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 flex-1">
                      {navigation.map((item) => (
                        item.show && (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className="flex items-center gap-4 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {item.name}
                          </button>
                        )
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
