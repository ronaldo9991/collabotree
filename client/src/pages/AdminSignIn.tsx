import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Lock, User, Loader2, ArrowLeft } from "lucide-react";

// Admin credentials (in production, this would be properly secured)
const ADMIN_CREDENTIALS = {
  email: "admin@collabotree.com",
  password: "admin123"
};

export default function AdminSignIn() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check admin credentials
      if (formData.email === ADMIN_CREDENTIALS.email && 
          formData.password === ADMIN_CREDENTIALS.password) {
        
        // Create admin user in the system
        try {
          await login(formData.email, formData.password);
          
          toast({
            title: "Admin Access Granted",
            description: "Welcome to the admin dashboard!",
          });
          
          navigate("/dashboard/admin");
        } catch (error) {
          // If admin doesn't exist, we need to create them
          toast({
            title: "Admin Login Successful", 
            description: "Access granted to admin dashboard.",
          });
          
          // For now, just navigate (in production, create admin user properly)
          navigate("/dashboard/admin");
        }
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: "Unable to process admin login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Admin Access
          </h1>
          <p className="mt-2 text-muted-foreground">
            Secure login for platform administrators
          </p>
        </motion.div>

        {/* Admin Credentials Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 mb-6">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Demo Credentials
              </CardTitle>
              <CardDescription>
                Use these credentials for admin access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">Email:</p>
                <p className="text-sm text-muted-foreground font-mono">admin@collabotree.com</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">Password:</p>
                <p className="text-sm text-muted-foreground font-mono">admin123</p>
              </div>
              <Badge variant="outline" className="w-full justify-center">
                Copy and paste these credentials
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
            <CardHeader>
              <CardTitle className="text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your admin credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@collabotree.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter admin password"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Sign In as Admin
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-xs text-muted-foreground"
        >
          <p>🔒 This is a secure admin area. All actions are logged and monitored.</p>
        </motion.div>
      </div>
    </div>
  );
}
