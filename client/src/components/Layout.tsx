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
      <nav className={`fixed top-2 left-2 right-2 z-50 transition-all duration-300 rounded-full ${
        scrolled 
          ? 'bg-background/90 dark:bg-background/90 backdrop-blur-xl shadow-lg border border-border/30' 
          : 'bg-background/80 dark:bg-background/80 backdrop-blur-lg shadow-md border border-border/20'
      }`}>
        <div className="container-unified px-3">
          <div className="flex items-center justify-between h-9">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" data-testid="logo">
              <img 
                src="/logoa.png" 
                alt="CollaboTree Logo" 
                className="w-7 h-7 object-contain rounded-xl"
              />
              <span className="text-sm font-semibold">CollaboTree</span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              {navigation.map((item) => (
                item.show && (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`text-xs font-medium transition-colors px-1.5 py-0.5 rounded-md hover:bg-muted/20 ${
                      location === item.href ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'
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
                  <Button variant="ghost" size="sm" className="p-2 mobile-menu-button">
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
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-1 rounded-lg hover:bg-muted/20 transition-colors ml-2"
                data-testid="theme-toggle"
              >
                {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </Button>

              {/* Command Palette */}
              <Button
                variant="ghost"
                onClick={() => setCommandOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-2 py-1.5 bg-muted/20 rounded-lg text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
                data-testid="command-palette-trigger"
              >
                <Search className="h-4 w-4" />
                <span className="hidden 2xl:inline">Search</span>
                <Badge variant="outline" className="px-1 py-0.5 text-xs hidden 2xl:inline-block">
                  ⌘K
                </Badge>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCommandOpen(true)}
                className="xl:hidden p-1.5"
                data-testid="command-palette-trigger-mobile"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Auth Actions */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-1 py-0.5 text-xs h-5 rounded-full ml-auto"
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
      <main className="pt-13">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}