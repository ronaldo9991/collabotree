import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, UserCheck, Shield, Loader2, ArrowLeft } from "lucide-react";
import { quickLogin, createSampleProjects } from "@/lib/testData";

export default function TestLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (userType: 'student' | 'buyer' | 'admin') => {
    setLoading(true);
    try {
      const user = await quickLogin(userType);
      if (user) {
        toast({
          title: "Login Successful!",
          description: `Logged in as ${user.full_name} (${user.role})`,
        });
        
        // Navigate to appropriate dashboard
        switch (userType) {
          case 'student':
            navigate("/dashboard/student");
            break;
          case 'buyer':
            navigate("/dashboard/buyer");
            break;
          case 'admin':
            navigate("/dashboard/admin");
            break;
        }
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('Quick login error:', error);
      toast({
        title: "Login Failed",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleProjects = async () => {
    setLoading(true);
    try {
      await createSampleProjects();
      toast({
        title: "Sample Projects Created!",
        description: "Sample projects have been added to the marketplace.",
      });
    } catch (error) {
      console.error('Error creating sample projects:', error);
      toast({
        title: "Error",
        description: "Failed to create sample projects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Back to home */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Quick Test Login
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose a user type to test the platform
          </p>
        </motion.div>

        {/* Login Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Student Login */}
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Student Account
              </CardTitle>
              <CardDescription>
                Test student dashboard and service creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <p><strong>Name:</strong> Alex Johnson</p>
                <p><strong>Email:</strong> student@test.com</p>
                <p><strong>University:</strong> Stanford University</p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleQuickLogin('student')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Login as Student
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Buyer Login */}
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <User className="h-5 w-5 text-secondary" />
                Buyer Account
              </CardTitle>
              <CardDescription>
                Test buyer dashboard and project management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <p><strong>Name:</strong> Sarah Smith</p>
                <p><strong>Email:</strong> buyer@test.com</p>
                <p><strong>Company:</strong> Tech Corp</p>
              </div>
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => handleQuickLogin('buyer')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Login as Buyer
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Admin Login */}
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Admin Account
              </CardTitle>
              <CardDescription>
                Test admin dashboard and platform management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <p><strong>Name:</strong> Platform Administrator</p>
                <p><strong>Email:</strong> admin@collabotree.com</p>
                <p><strong>Role:</strong> System Admin</p>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Login as Admin
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sample Projects Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">Setup Sample Data</CardTitle>
              <CardDescription>
                Create sample projects for testing the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleCreateSampleProjects}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    📦 Create Sample Projects
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Badge variant="outline" className="text-xs">
            💡 These accounts are automatically created with test data
          </Badge>
        </motion.div>
      </div>
    </div>
  );
}
