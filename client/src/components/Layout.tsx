import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandPalette } from "./CommandPalette";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { Network, Search, Moon, Sun, Home, ShoppingCart, FileText, Users, Menu, LogOut, Settings, User, MessageSquare, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isLandingPage = location === "/";

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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Hidden on landing page since it's in hero */}
      {!isLandingPage && (
        <nav className={`fixed top-0 left-0 right-0 z-50 pt-4`}>
        {/* Navbar wrapper - padding matches container-unified minus pill padding */}
        <div className="max-w-[95%] xl:max-w-[1600px] mx-auto px-6 md:px-8 xl:px-10">
          {/* Pill-shaped Navigation Container */}
          <div className="flex items-center justify-between h-14 px-6 rounded-full border-2 border-primary/40 dark:border-primary/60 bg-card/95 dark:bg-card/90 backdrop-blur-md shadow-lg shadow-primary/5 dark:shadow-primary/10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="logo">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Network className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">CollaboTree</span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              {navigation.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/" && location.startsWith(item.href));
                
                return item.show && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-all px-4 py-1.5 rounded-full whitespace-nowrap ${
                      isActive
                        ? "text-foreground border-2 border-primary/50 dark:border-primary/70 bg-card dark:bg-card/80"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted/30"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden ml-auto">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 rounded-full mobile-menu-button h-8 w-8">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-gradient-to-b from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 backdrop-blur-12 border-l border-primary/20 mobile-sheet-content p-0" hideCloseButton={true}>
                  <div className="flex flex-col h-full">
                    {/* Header with Prominent Close Button */}
                    <div className="flex items-center justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-primary/20">
                      <h2 className="text-xl font-bold text-foreground">Menu</h2>
                      {/* Close Button - Large, prominent, and easy to tap */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileMenuOpen(false)}
                        className="h-11 w-11 rounded-full bg-primary/15 hover:bg-primary/25 dark:bg-primary/25 dark:hover:bg-primary/35 border-2 border-primary/30 p-0 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md hover:shadow-lg mobile-close-button min-w-[44px] min-h-[44px]"
                        data-testid="mobile-menu-close"
                      >
                        <X className="h-6 w-6 text-primary font-bold" strokeWidth={2.5} />
                        <span className="sr-only">Close</span>
                      </Button>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                      {navigation.map((item) => (
                        item.show && (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item min-h-[44px]"
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                            {item.name}
                          </Link>
                        )
                      ))}
                      
                      {/* User Section - Only show when logged in */}
                      {user && (
                        <div className="pt-4 border-t border-primary/20 space-y-3">
                          {/* User Profile Card */}
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                            <Avatar className="h-12 w-12 border-2 border-primary/30 flex-shrink-0">
                              <AvatarImage src="" alt={user.name} />
                              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                {user.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold text-foreground truncate">{user.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          
                          {/* Dashboard Link */}
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item min-h-[44px]"
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid="mobile-nav-dashboard"
                          >
                            <User className="h-5 w-5 flex-shrink-0 text-primary" />
                            <span>Dashboard</span>
                          </Link>
                          
                          {/* Settings Link */}
                          <Link
                            href={
                              user.role === 'STUDENT' ? '/dashboard/student/settings' :
                              user.role === 'BUYER' ? '/dashboard/buyer/settings' :
                              user.role === 'ADMIN' ? '/dashboard/admin/settings' :
                              '/profile'
                            }
                            className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-all p-4 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/15 border border-transparent hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 mobile-nav-item min-h-[44px]"
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid="mobile-nav-settings"
                          >
                            <Settings className="h-5 w-5 flex-shrink-0 text-primary" />
                            <span>Settings</span>
                          </Link>
                          
                          {/* Sign Out Button */}
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              logout();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 transition-all border-destructive/20 shadow-sm hover:shadow-md mobile-sign-out-button min-h-[52px]"
                            data-testid="mobile-sign-out-button"
                          >
                            <LogOut className="h-5 w-5 text-destructive" />
                            <span className="text-base font-medium text-destructive">Sign Out</span>
                          </Button>
                        </div>
                      )}
                      
                      {/* Sign In Button - Only show when NOT logged in */}
                      {!user && (
                        <div className="pt-4 border-t border-primary/20">
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-all border-primary/20 shadow-sm hover:shadow-md mobile-sign-in-button min-h-[52px]"
                            asChild
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid="mobile-sign-in-button"
                          >
                            <Link href="/signin">
                              <User className="h-5 w-5 text-primary" />
                              <span className="text-base font-medium">Sign In</span>
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {/* Theme Toggle - Moved to bottom, separate from close button */}
                      <div className="mt-auto pt-6 border-t border-primary/20">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={toggleTheme}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-all border-primary/20 shadow-sm hover:shadow-md mobile-theme-toggle min-h-[52px]"
                          data-testid="mobile-theme-toggle"
                        >
                          {theme === "light" ? (
                            <>
                              <Moon className="h-5 w-5 text-primary" />
                              <span className="text-base font-medium">Switch to Dark Mode</span>
                            </>
                          ) : (
                            <>
                              <Sun className="h-5 w-5 text-primary" />
                              <span className="text-base font-medium">Switch to Light Mode</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted/30 transition-colors h-8 w-8"
                data-testid="theme-toggle"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* Command Palette */}
              <Button
                variant="ghost"
                onClick={() => setCommandOpen(true)}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 text-sm text-muted-foreground hover:bg-muted/30 transition-colors h-8"
                data-testid="command-palette-trigger"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden 2xl:inline text-xs">Search</span>
                <Badge variant="outline" className="px-1.5 py-0.5 text-xs hidden 2xl:inline-block border-primary/30">
                  ⌘K
                </Badge>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCommandOpen(true)}
                className="xl:hidden p-2 rounded-full h-8 w-8"
                data-testid="command-palette-trigger-mobile"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Auth Actions */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border-2 border-primary/30">
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
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={
                        user.role === 'STUDENT' ? '/dashboard/student/settings' :
                        user.role === 'BUYER' ? '/dashboard/buyer/settings' :
                        user.role === 'ADMIN' ? '/dashboard/admin/settings' :
                        '/profile'
                      } className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
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
                  variant="outline" 
                  size="sm"
                  className="border-2 border-primary/50 dark:border-primary/70 bg-transparent hover:bg-muted/30 text-foreground rounded-full px-4 py-1.5 h-8 flex items-center gap-1.5"
                  asChild
                  data-testid="sign-in-button"
                >
                  <Link href="/signin">
                    Get Started
                    <span className="text-xs">→</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Main Content */}
      <main className={isLandingPage ? "" : "pt-24"}>
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}