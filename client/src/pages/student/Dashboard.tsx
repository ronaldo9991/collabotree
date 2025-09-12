import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Plus, 
  Star,
  TrendingUp,
  Package,
  MessageCircle,
  Activity,
  Eye,
  GraduationCap,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { mockCurrentUser } from "@/data/mockData";

export default function StudentDashboard() {
  const { toast } = useToast();
  const [isVerified] = useState(true);
  
  const [stats] = useState({
    totalOrders: 12,
    completionRate: 96,
    availableEarnings: 650,
    avgRating: 4.8
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
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="student-badge">
            Student Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome back,<br />
            {user.firstName || user.email?.split('@')[0] || 'Student'}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Manage your services and track your freelance journey
          </p>
        </motion.div>

        {/* Verification Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30" data-testid="verification-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isVerified ? (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <Clock className="h-6 w-6 text-secondary" />
                  )}
                  <div>
                    <Badge 
                      variant={isVerified ? "default" : "secondary"}
                      className={isVerified ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}
                      data-testid="verification-status"
                    >
                      {isVerified ? "✓ Verified Student" : "⏳ Pending Verification"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isVerified ? "Your account is verified and ready for business" : "Complete verification to start selling"}
                    </p>
                  </div>
                </div>
                {!isVerified && (
                  <Button variant="outline" data-testid="complete-verification-button">
                    Complete Verification
                  </Button>
                )}
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
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="orders-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <Package className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalOrders}</div>
              <p className="text-sm text-muted-foreground">Completed projects</p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="success-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-2">{stats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">Project completion</p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="earnings-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">${stats.availableEarnings}</div>
              <p className="text-sm text-muted-foreground">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid="rating-stat">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <Star className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.avgRating}</div>
              <p className="text-sm text-muted-foreground">Average rating</p>
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
                <CardDescription>Your latest achievements and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Completed React Development project",
                    "Received 5-star review from client",
                    "Started new UI/UX Design project",
                    "Updated service pricing"
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
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline" 
                  data-testid="create-service-button"
                  onClick={() => window.location.href = "/dashboard/student/services/new"}
                >
                  <Plus className="h-4 w-4" />
                  Create New Service
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="message-clients-button">
                  <MessageCircle className="h-4 w-4" />
                  Message Clients
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="view-profile-button">
                  <Eye className="h-4 w-4" />
                  View Public Profile
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="portfolio-button">
                  <Award className="h-4 w-4" />
                  Manage Portfolio
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}