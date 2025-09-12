import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Heart, 
  Star,
  MessageCircle,
  Package,
  DollarSign,
  CheckCircle,
  Activity,
  Users,
  ShoppingCart,
  Eye,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { mockCurrentUser } from "@/data/mockData";

export default function BuyerDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [stats] = useState({
    totalSpent: 645,
    activeOrders: 2,
    completedProjects: 8,
    savedServices: 3
  });

  const user = mockCurrentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="buyer-badge">
            Buyer Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome back,<br />
            {user.firstName || user.email?.split('@')[0] || 'Buyer'}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Find talented students for your projects
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30" data-testid="search-card">
            <CardContent className="p-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search services, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 text-lg py-6 bg-background/50 border-border/50 focus:border-primary/50"
                  data-testid="search-input"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border/30 justify-center">
                <span className="text-sm text-muted-foreground">Popular:</span>
                {["Web Development", "UI/UX Design", "Data Analysis", "Mobile Apps"].map((category) => (
                  <Badge key={category} variant="secondary" className="hover:bg-primary/20 cursor-pointer transition-colors">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="spent-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">${stats.totalSpent}</div>
              <p className="text-sm text-muted-foreground">On projects</p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="active-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                <Package className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-2">{stats.activeOrders}</div>
              <p className="text-sm text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="completed-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">{stats.completedProjects}</div>
              <p className="text-sm text-muted-foreground">Projects done</p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="saved-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.savedServices}</div>
              <p className="text-sm text-muted-foreground">Favorite services</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2">
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Ordered React Website Development from Alex Chen",
                    "Sarah Johnson delivered Mobile App Design",
                    "Saved UI/UX Design service to favorites",
                    "Left 5-star review for Data Dashboard project"
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                      data-testid={`activity-${index}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{activity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get things done faster</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline" 
                  data-testid="browse-services-button"
                  onClick={() => window.location.href = "/marketplace"}
                >
                  <Search className="h-4 w-4" />
                  Browse Services
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="check-messages-button">
                  <MessageCircle className="h-4 w-4" />
                  Check Messages
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="view-orders-button">
                  <ShoppingCart className="h-4 w-4" />
                  View Orders
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="find-specialists-button">
                  <Users className="h-4 w-4" />
                  Find Specialists
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}