import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandPalette } from "./CommandPalette";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { Network, Search, Moon, Sun, Home, ShoppingCart, FileText, Users, Menu, LogOut, Settings, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home, show: true },
    { name: "About", href: "/about", icon: Users, show: true },
    { name: "Explore Talent", href: "/marketplace", icon: ShoppingCart, show: true },
    { name: "How it Works", href: "/how-it-works", icon: FileText, show: true },
  ];

  const dashboardNavigation = [
    { name: "Student Dashboard", href: "/dashboard/student", icon: Home, show: true },
    { name: "Buyer Dashboard", href: "/dashboard/buyer", icon: ShoppingCart, show: true },
    { name: "Admin Dashboard", href: "/dashboard/admin", icon: Users, show: true },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card bg-card/80 border-b border-border backdrop-blur-12">
        <div className="container-unified">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" data-testid="logo">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Network className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold">CollaboTree</span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              {navigation.map((item) => (
                item.show && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted/20"
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.name}
                  </Link>
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
                <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-card/95 backdrop-blur-12 border-l border-border/50 mobile-sheet-content">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/30">
                      <h2 className="text-xl font-bold text-foreground">Menu</h2>
                      {/* Theme Toggle for Mobile */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors border border-border/20 mobile-theme-toggle"
                        data-testid="mobile-theme-toggle"
                      >
                        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        <span className="text-sm font-medium">{theme === "light" ? "Dark" : "Light"}</span>
                      </Button>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 flex-1">
                      {navigation.map((item) => (
                        item.show && (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-colors p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 mobile-nav-item"
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {item.name}
                          </Link>
                        )
                      ))}
                      
                      {/* Separator */}
                      <div className="border-t border-border/30 my-6" />
                      
                      {/* Demo Dashboards Section */}
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-muted-foreground px-4 py-2 uppercase tracking-wide">Demo Dashboards</div>
                        {dashboardNavigation.map((item) => (
                          item.show && (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center gap-4 text-base font-medium text-foreground hover:text-primary transition-colors p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 mobile-nav-item"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              {item.name}
                            </Link>
                          )
                        ))}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
                data-testid="theme-toggle"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* Command Palette */}
              <Button
                variant="ghost"
                onClick={() => setCommandOpen(true)}
                className="hidden xl:flex items-center gap-2 px-3 py-2 bg-muted/20 rounded-lg text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
                data-testid="command-palette-trigger"
              >
                <Search className="h-4 w-4" />
                <span className="hidden 2xl:inline">Search</span>
                <Badge variant="outline" className="px-1.5 py-0.5 text-xs hidden 2xl:inline-block">
                  ⌘K
                </Badge>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCommandOpen(true)}
                className="xl:hidden p-2"
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
                  variant="default" 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  asChild
                  data-testid="sign-in-button"
                >
                  <Link href="/signin">
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}