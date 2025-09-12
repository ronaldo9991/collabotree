import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CommandPalette } from "./CommandPalette";
import { useTheme } from "./ThemeProvider";
import { Network, Search, Moon, Sun, Home, ShoppingCart, FileText, Users, Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
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
    { name: "Admin Dashboard", href: "/admin", icon: Users, show: true },
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
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    {/* Theme Toggle for Mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
                      data-testid="mobile-theme-toggle"
                    >
                      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span className="ml-2 text-sm">{theme === "light" ? "Dark" : "Light"}</span>
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      item.show && (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-3 rounded-lg hover:bg-muted/20"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      )
                    ))}
                    
                    <div className="border-t border-border my-4" />
                    <div className="text-sm font-medium text-muted-foreground px-3">Demo Dashboards</div>
                    {dashboardNavigation.map((item) => (
                      item.show && (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors p-3 rounded-lg hover:bg-muted/20"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      )
                    ))}
                  </nav>
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

              {/* Demo Mode Badge */}
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                Demo Mode
              </Badge>
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