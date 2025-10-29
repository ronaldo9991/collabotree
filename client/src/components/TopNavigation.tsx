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
    { name: "Home", href: "/", icon: Home, show: true, hasDropdown: false },
    { name: "About", href: "/about", icon: Users, show: true, hasDropdown: false },
    { name: "Explore Talent", href: "/marketplace", icon: ShoppingCart, show: true, hasDropdown: false },
    { name: "How it Works", href: "/how-it-works", icon: FileText, show: true, hasDropdown: false },
    { name: "Contact", href: "/contact", icon: MessageSquare, show: true, hasDropdown: false },
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
      {/* Main Navigation - Curved Design */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className={`rounded-full transition-all duration-500 ${
          scrolled 
            ? 'bg-card/95 dark:bg-card/95 backdrop-blur-xl shadow-xl border border-primary/20' 
            : 'bg-card/80 dark:bg-card/80 backdrop-blur-lg shadow-lg border border-primary/10'
        }`}>
          <div className="flex items-center justify-between h-16 px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/logoa.png" 
                  alt="CollaboTree Logo" 
                  className="w-12 h-12 object-contain rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200"
                />
              </div>
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">CollaboTree</span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center space-x-1 mx-auto">
              {navigation.map((item) => (
                item.show && (
                  <div key={item.name} className="relative group">
                    {item.hasDropdown ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-base"
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
                        className={`text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-full hover:bg-primary/10 transition-all duration-200 text-sm ${
                          location === item.href ? 'text-primary bg-primary/10 font-semibold' : ''
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
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70 group-hover:text-primary transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search services..."
                  onClick={() => setCommandOpen(true)}
                  className="w-64 pl-12 pr-20 py-3 bg-background/95 border border-primary/30 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                  readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md border border-primary/20 hover:bg-primary/20 transition-colors duration-200">
                    ⌘K
                  </Badge>
                </div>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors h-10 w-10"
              >
                {theme === "light" ? <Moon className="h-4 w-4 text-foreground" /> : <Sun className="h-4 w-4 text-foreground" />}
              </Button>

              {/* Auth Actions */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 h-10"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                    <Menu className="h-5 w-5 text-foreground" />
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
      <main className="pt-20">
        {children}
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
