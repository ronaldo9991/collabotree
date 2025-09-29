import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  Settings, 
  Database,
  Users,
  Bell,
  Lock,
  Trash2,
  Globe,
  Mail,
  Server,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  FileText
} from "lucide-react";

const platformSchema = z.object({
  platformName: z.string().min(2, "Platform name is required"),
  supportEmail: z.string().email("Invalid email address"),
  maxFileSize: z.number().min(1, "File size must be at least 1MB").max(100, "File size cannot exceed 100MB"),
  maintenanceMode: z.boolean(),
  registrationEnabled: z.boolean(),
  emailVerificationRequired: z.boolean(),
  automaticVerification: z.boolean(),
  maxProjectsPerUser: z.number().min(1, "Must allow at least 1 project").max(100, "Cannot exceed 100 projects"),
  commissionRate: z.number().min(0, "Commission cannot be negative").max(30, "Commission cannot exceed 30%"),
});

const securitySchema = z.object({
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.number().min(15, "Minimum 15 minutes").max(1440, "Maximum 24 hours"),
  passwordMinLength: z.number().min(6, "Minimum 6 characters").max(50, "Maximum 50 characters"),
  allowedDomains: z.string().optional(),
  ipWhitelist: z.string().optional(),
  bruteForceProtection: z.boolean(),
  logRetentionDays: z.number().min(30, "Minimum 30 days").max(365, "Maximum 365 days"),
});

const notificationSchema = z.object({
  systemAlerts: z.boolean(),
  userRegistrations: z.boolean(),
  paymentNotifications: z.boolean(),
  disputeAlerts: z.boolean(),
  performanceReports: z.boolean(),
  securityAlerts: z.boolean(),
  dailyReports: z.boolean(),
  weeklyReports: z.boolean(),
});

type PlatformFormData = z.infer<typeof platformSchema>;
type SecurityFormData = z.infer<typeof securitySchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export default function AdminSettings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const platformForm = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      platformName: "CollaboTree",
      supportEmail: "support@collabotree.com",
      maxFileSize: 10,
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: false,
      automaticVerification: false,
      maxProjectsPerUser: 20,
      commissionRate: 5,
    },
  });

  const securityForm = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      twoFactorAuth: false,
      sessionTimeout: 480,
      passwordMinLength: 8,
      allowedDomains: "",
      ipWhitelist: "",
      bruteForceProtection: true,
      logRetentionDays: 90,
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      systemAlerts: true,
      userRegistrations: true,
      paymentNotifications: true,
      disputeAlerts: true,
      performanceReports: false,
      securityAlerts: true,
      dailyReports: false,
      weeklyReports: true,
    },
  });

  const onPlatformSubmit = async (data: PlatformFormData) => {
    setLoading(true);
    try {
      // In a real app, this would update platform settings in the database
      toast({
        title: "Platform Settings Updated",
        description: "Platform configuration has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating platform settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update platform settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSecuritySubmit = async (data: SecurityFormData) => {
    toast({
      title: "Security Settings Updated",
      description: "Security configuration has been saved successfully.",
    });
  };

  const onNotificationSubmit = async (data: NotificationFormData) => {
    toast({
      title: "Notification Settings Updated",
      description: "Admin notification preferences have been saved.",
    });
  };

  const handleSystemAction = (action: string) => {
    toast({
      title: "System Action",
      description: `${action} initiated. Please check system logs for details.`,
    });
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">System Settings</h1>
            <p className="text-muted-foreground">
              Configure platform settings, security, and system preferences
            </p>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="platform" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="platform" className="flex items-center gap-2 text-sm font-medium px-3 py-2">
                <Settings className="h-4 w-4" />
                Platform
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 text-sm font-medium px-3 py-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-sm font-medium px-3 py-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2 text-sm font-medium px-3 py-2">
                <Server className="h-4 w-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2 text-sm font-medium px-3 py-2">
                <FileText className="h-4 w-4" />
                Logs
              </TabsTrigger>
            </TabsList>

            {/* Platform Tab */}
            <TabsContent value="platform" className="mt-6">
              <Form {...platformForm}>
                <form onSubmit={platformForm.handleSubmit(onPlatformSubmit)} className="space-y-6">
                  <Card className="glass-card bg-card/50 backdrop-blur-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={platformForm.control}
                          name="platformName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform Name</FormLabel>
                              <FormControl>
                                <Input placeholder="CollaboTree" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={platformForm.control}
                          name="supportEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Support Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="support@collabotree.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={platformForm.control}
                          name="maxFileSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max File Size (MB)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={platformForm.control}
                          name="maxProjectsPerUser"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Projects per User</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={platformForm.control}
                          name="commissionRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Commission Rate (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Platform Controls</h4>
                        {[
                          { name: "maintenanceMode", label: "Maintenance Mode", description: "Put the platform in maintenance mode" },
                          { name: "registrationEnabled", label: "User Registration", description: "Allow new user registrations" },
                          { name: "emailVerificationRequired", label: "Email Verification", description: "Require email verification for new accounts" },
                          { name: "automaticVerification", label: "Auto-verify Students", description: "Automatically verify student accounts" },
                        ].map((item) => (
                          <FormField
                            key={item.name}
                            control={platformForm.control}
                            name={item.name as keyof PlatformFormData}
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">{item.label}</Label>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Platform Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <Card className="glass-card bg-card/50 backdrop-blur-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Security Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={securityForm.control}
                          name="sessionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Timeout (minutes)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="passwordMinLength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Password Length</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="logRetentionDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Log Retention (days)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={securityForm.control}
                        name="allowedDomains"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed Email Domains (comma-separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="example.com, university.edu" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave empty to allow all domains
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="ipWhitelist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IP Whitelist (comma-separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="192.168.1.1, 10.0.0.0/8" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave empty to allow all IPs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Security Features</h4>
                        {[
                          { name: "twoFactorAuth", label: "Two-Factor Authentication", description: "Require 2FA for admin accounts" },
                          { name: "bruteForceProtection", label: "Brute Force Protection", description: "Protect against brute force attacks" },
                        ].map((item) => (
                          <FormField
                            key={item.name}
                            control={securityForm.control}
                            name={item.name as keyof SecurityFormData}
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">{item.label}</Label>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <Card className="glass-card bg-card/50 backdrop-blur-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Admin Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        { name: "systemAlerts", label: "System Alerts", description: "Critical system notifications" },
                        { name: "userRegistrations", label: "User Registrations", description: "New user signup notifications" },
                        { name: "paymentNotifications", label: "Payment Notifications", description: "Payment and transaction alerts" },
                        { name: "disputeAlerts", label: "Dispute Alerts", description: "User dispute notifications" },
                        { name: "securityAlerts", label: "Security Alerts", description: "Security-related notifications" },
                        { name: "performanceReports", label: "Performance Reports", description: "System performance notifications" },
                        { name: "dailyReports", label: "Daily Reports", description: "Daily platform summary" },
                        { name: "weeklyReports", label: "Weekly Reports", description: "Weekly platform analytics" },
                      ].map((item) => (
                        <FormField
                          key={item.name}
                          control={notificationForm.control}
                          name={item.name as keyof NotificationFormData}
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label className="text-base">{item.label}</Label>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="mt-6">
              <div className="space-y-6">
                <Card className="glass-card bg-card/50 backdrop-blur-12">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-primary" />
                      System Operations
                    </CardTitle>
                    <CardDescription>
                      Perform system maintenance and administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => handleSystemAction("Cache Clear")}
                        className="justify-start"
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Clear Cache
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handleSystemAction("Database Backup")}
                        className="justify-start"
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Backup Database
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handleSystemAction("Log Export")}
                        className="justify-start"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export Logs
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handleSystemAction("System Health Check")}
                        className="justify-start"
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        Health Check
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Reset All User Data</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete all user accounts and associated data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Reset Platform
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="mt-6">
              <Card className="glass-card bg-card/50 backdrop-blur-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    System Logs
                  </CardTitle>
                  <CardDescription>
                    View recent system activity and events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm">
                        <Activity className="mr-2 h-4 w-4" />
                        Refresh Logs
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Download Logs
                      </Button>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">2024-01-15 10:30:45</span>
                          <span>User registration: student@test.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">2024-01-15 10:25:12</span>
                          <span>Service created: Web Development Service</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-muted-foreground">2024-01-15 10:20:33</span>
                          <span>Failed login attempt: admin@collabotree.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">2024-01-15 10:15:22</span>
                          <span>Database backup completed successfully</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">2024-01-15 10:10:11</span>
                          <span>Admin login: admin@collabotree.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
