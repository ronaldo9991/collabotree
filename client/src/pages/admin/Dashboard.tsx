import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign,
  Package,
  MessageCircle,
  Eye,
  FileText,
  Shield,
  BarChart3,
  Loader2,
  Settings,
  UserCheck,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
// import { supabase } from "@/lib/supabase";

interface RealTimeStats {
  totalUsers: number;
  totalStudents: number;
  totalBuyers: number;
  verifiedStudents: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
}

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  verified?: boolean;
}

interface RecentProject {
  id: string;
  title: string;
  created_by: string;
  owner_role: string;
  status: string;
  budget?: number;
  created_at: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<RealTimeStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalBuyers: 0,
    verifiedStudents: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      return;
    }
    fetchAdminData();
  }, [user, toast]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all users and their counts
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, role, created_at');

      if (usersError) throw usersError;

      // Fetch students data
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('user_id, is_verified');

      if (studentsError) throw studentsError;

      // Fetch projects data
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, created_by, owner_role, status, budget, created_at');

      if (projectsError) throw projectsError;

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, amount_cents, status, created_at');

      if (ordersError) throw ordersError;

      // Calculate real-time stats
      const totalUsers = users?.length || 0;
      const totalStudents = users?.filter(u => u.role === 'student').length || 0;
      const totalBuyers = users?.filter(u => u.role === 'buyer').length || 0;
      const verifiedStudents = students?.filter(s => s.is_verified).length || 0;
      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'open' || p.status === 'in_progress').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount_cents / 100), 0) || 0;
      const pendingVerifications = students?.filter(s => !s.is_verified).length || 0;

      setStats({
        totalUsers,
        totalStudents,
        totalBuyers,
        verifiedStudents,
        totalProjects,
        activeProjects,
        completedProjects,
        totalOrders,
        totalRevenue,
        pendingVerifications,
      });

      // Set recent users (last 5)
      const sortedUsers = users?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5) || [];
      setRecentUsers(sortedUsers.map(u => ({
        ...u,
        verified: students?.find(s => s.user_id === u.id)?.is_verified
      })));

      // Set recent projects (last 5)
      const sortedProjects = projects?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5) || [];
      setRecentProjects(sortedProjects);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async (studentId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_verified: verified })
        .eq('user_id', studentId);

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Student ${verified ? 'verified' : 'unverified'} successfully.`,
      });

      // Refresh data
      fetchAdminData();
    } catch (error) {
      console.error('Error updating student verification:', error);
      toast({
        title: "Error",
        description: "Failed to update student verification.",
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Admin Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-gradient-fix" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Welcome back, {(() => {
              // Get first name from full_name or email
              const fullName = user?.full_name;
              const email = user?.email;
              
              if (fullName && fullName.trim()) {
                const firstName = fullName.split(' ')[0];
                return firstName && firstName.length > 0 ? firstName : 'Admin';
              }
              
              if (email && email.includes('@')) {
                const emailName = email.split('@')[0];
                return emailName && emailName.length > 0 ? emailName : 'Admin';
              }
              
              return 'Admin';
            })()}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Manage your platform and oversee all operations
          </p>
        </motion.div>

        {/* Real-time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <Users className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalUsers}</div>
              <p className="text-sm text-muted-foreground">
                {stats.totalStudents} Students • {stats.totalBuyers} Buyers
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-secondary/10 text-secondary w-fit mb-4">
                <UserCheck className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Verified Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-2">{stats.verifiedStudents}</div>
              <p className="text-sm text-muted-foreground">
                {stats.pendingVerifications} pending verification
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent w-fit mb-4">
                <Package className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">{stats.totalProjects}</div>
              <p className="text-sm text-muted-foreground">
                {stats.activeProjects} active • {stats.completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">${Math.round(stats.totalRevenue)}</div>
              <p className="text-sm text-muted-foreground">
                {stats.totalOrders} total orders
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Management Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Recent Users */}
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest user registrations on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={user.role === 'STUDENT' ? 'default' : 'secondary'} className="text-xs">
                            {user.role}
                          </Badge>
                          {user.role === 'STUDENT' && (
                            <Badge variant={user.verified ? 'default' : 'outline'} className="text-xs">
                              {user.verified ? 'Verified' : 'Pending'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {user.role === 'STUDENT' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={user.verified ? "outline" : "default"}
                            onClick={() => handleVerifyStudent(user.id, !user.verified)}
                          >
                            {user.verified ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Recent Projects
              </CardTitle>
              <CardDescription>Latest projects created on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{project.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {project.owner_role}
                          </Badge>
                          {project.budget && (
                            <span className="text-xs text-muted-foreground">
                              ${project.budget}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p>No projects found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Admin Quick Actions
              </CardTitle>
              <CardDescription>Platform management tools and utilities</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="justify-start gap-2" 
                variant="outline"
                onClick={() => fetchAdminData()}
              >
                <Activity className="h-4 w-4" />
                Refresh Data
              </Button>
              <Button 
                className="justify-start gap-2" 
                variant="outline"
                onClick={() => toast({
                  title: "Feature Coming Soon",
                  description: "User management panel will be available in the next update.",
                })}
              >
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
              <Button 
                className="justify-start gap-2" 
                variant="outline"
                onClick={() => toast({
                  title: "Feature Coming Soon",
                  description: "Analytics dashboard will be available in the next update.",
                })}
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
              <Button 
                className="justify-start gap-2" 
                variant="outline"
                onClick={() => navigate("/dashboard/admin/settings")}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}