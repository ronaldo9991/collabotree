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
import { Network, Search, Moon, Sun, Home, ShoppingCart, FileText, Users, Menu, LogOut, Settings, User, MessageSquare } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home, show: true },
    { name: "About", href: "/about", icon: Users, show: true },
    { name: "Explore Talent", href: "/marketplace", icon: ShoppingCart, show: true },
    { name: "How it Works", href: "/how-it-works", icon: FileText, show: true },
    { name: "Contact", href: "/contact", icon: MessageSquare, show: true },
  ];

  const dashboardNavigation = [
    { name: "Student Dashboard", href: "/dashboard/student", icon: Home, show: true },
    { name: "Buyer Dashboard", href: "/dashboard/buyer", icon: ShoppingCart, show: true },
    { name: "Admin Dashboard", href: "/dashboard/admin", icon: Users, show: true },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 shadow-lg border-b border-blue-500/20">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        {/* Speckles overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-40"></div>
        
        <div className="container-unified px-4 sm:px-6 relative">
            <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group" data-testid="logo">
              <div className="group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/logoa.png" 
                  alt="CollaboTree Logo" 
                  className="w-20 h-20 object-contain rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-200"
                />
              </div>
              <span className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors duration-200">CollaboTree</span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {navigation.map((item) => (
                item.show && (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10 ${
                      location === item.href ? 'text-blue-200 font-semibold bg-white/10' : 'text-white hover:text-blue-200'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.name}
                  </button>
                )
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 mobile-menu-button text-white hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-gradient-to-b from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 backdrop-blur-12 border-l border-primary/20 mobile-sheet-content">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/20">
                      <h2 className="text-xl font-bold text-foreground">Menu</h2>
                      {/* Theme Toggle for Mobile */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-all border border-primary/20 mobile-theme-toggle"
                        data-testid="mobile-theme-toggle"
                      >
                        {theme === "light" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
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
                            className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item w-full text-left"
                            data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                            {item.name}
                          </button>
                        )
                      ))}
                      
                      {/* Separator */}
                      <div className="border-t border-primary/20 my-6" />
                      
                      {/* Demo Dashboards Section */}
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-primary/70 px-4 py-2 uppercase tracking-wide">Demo Dashboards</div>
                        {dashboardNavigation.map((item) => (
                          item.show && (
                            <button
                              key={item.name}
                              onClick={() => handleNavigation(item.href)}
                              className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item w-full text-left"
                            >
                              <item.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                              {item.name}
                            </button>
                          )
                        ))}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  onClick={() => setCommandOpen(true)}
                  className="w-48 px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  readOnly
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                data-testid="theme-toggle"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              {/* Auth Actions */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-blue-400 text-white font-semibold">
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
                  variant="default" 
                  size="sm"
                  className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 text-sm h-8 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => handleNavigation("/signin")}
                  data-testid="sign-in-button"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 sm:pt-18">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}