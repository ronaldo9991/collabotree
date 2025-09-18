import { useState, useEffect } from "react";
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
  User, 
  Shield, 
  Bell, 
  Lock,
  Trash2,
  Upload,
  Building,
  CreditCard,
  Globe,
  Mail,
  Phone,
  MapPin,
  Loader2,
  DollarSign,
  Briefcase
} from "lucide-react";

const companySchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company_name: z.string().min(2, "Company name is required"),
  industry: z.string().min(2, "Industry is required"),
  budget_range: z.string().min(1, "Budget range is required"),
  company_size: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
});

const billingSchema = z.object({
  billingEmail: z.string().email("Invalid email address"),
  companyAddress: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  taxId: z.string().optional(),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  projectUpdates: z.boolean(),
  newApplications: z.boolean(),
  paymentReminders: z.boolean(),
  weeklyReports: z.boolean(),
});

type CompanyFormData = z.infer<typeof companySchema>;
type BillingFormData = z.infer<typeof billingSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

const industryOptions = [
  "Technology", "Healthcare", "Finance", "Education", "E-commerce",
  "Manufacturing", "Consulting", "Marketing", "Real Estate", "Media",
  "Non-profit", "Government", "Startup", "Enterprise", "Other"
];

const budgetRanges = [
  "$500 - $1,000", "$1,000 - $5,000", "$5,000 - $10,000", 
  "$10,000 - $25,000", "$25,000 - $50,000", "$50,000+"
];

const companySizes = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-500 employees", "501-1000 employees", "1000+ employees"
];

export default function BuyerSettings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      company_name: user?.buyer?.company_name || "",
      industry: user?.buyer?.industry || "",
      budget_range: user?.buyer?.budget_range || "",
      company_size: "",
      website: "",
      phone: "",
      location: "",
      description: "",
    },
  });

  const billingForm = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      billingEmail: user?.email || "",
      companyAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      taxId: "",
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      projectUpdates: true,
      newApplications: true,
      paymentReminders: true,
      weeklyReports: false,
    },
  });

  const onCompanySubmit = async (data: CompanyFormData) => {
    setLoading(true);
    try {
      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: data.full_name,
          email: data.email,
        })
        .eq('id', user?.id);

      if (userError) throw userError;

      // Update buyer profile
      const { error: buyerError } = await supabase
        .from('buyers')
        .update({
          company_name: data.company_name,
          industry: data.industry,
          budget_range: data.budget_range,
        })
        .eq('id', user?.id);

      if (buyerError) throw buyerError;

      // Update localStorage
      const updatedUser = {
        ...user,
        full_name: data.full_name,
        email: data.email,
        buyer: {
          ...user?.buyer,
          company_name: data.company_name,
          industry: data.industry,
          budget_range: data.budget_range,
        }
      };
      localStorage.setItem('collabotree_user', JSON.stringify(updatedUser));

      toast({
        title: "Company Profile Updated",
        description: "Your company information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onBillingSubmit = async (data: BillingFormData) => {
    toast({
      title: "Billing Information Updated",
      description: "Your billing details have been saved successfully.",
    });
  };

  const onNotificationSubmit = async (data: NotificationFormData) => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only buyers can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/buyer")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Buyer Settings</h1>
            <p className="text-muted-foreground">
              Manage your company profile, billing, and account preferences
            </p>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="company" className="flex items-center gap-2 text-sm font-medium px-4 py-2">
                <Building className="h-4 w-4" />
                Company
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2 text-sm font-medium px-4 py-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-sm font-medium px-4 py-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 text-sm font-medium px-4 py-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Company Tab */}
            <TabsContent value="company" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Company Logo */}
                <Card className="glass-card bg-card/50 backdrop-blur-12">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Company Logo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-r from-secondary to-accent rounded-lg flex items-center justify-center">
                      {companyLogo ? (
                        <img src={companyLogo} alt="Company Logo" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <Building className="h-16 w-16 text-white" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG up to 2MB
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Form */}
                <div className="lg:col-span-2">
                  <Form {...companyForm}>
                    <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                      <Card className="glass-card bg-card/50 backdrop-blur-12">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Company Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={companyForm.control}
                              name="full_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Smith" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={companyForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="john@company.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={companyForm.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Corporation" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={companyForm.control}
                              name="industry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Industry</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select industry" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {industryOptions.map((industry) => (
                                        <SelectItem key={industry} value={industry}>
                                          {industry}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={companyForm.control}
                              name="company_size"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Size</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select company size" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {companySizes.map((size) => (
                                        <SelectItem key={size} value={size}>
                                          {size}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={companyForm.control}
                            name="budget_range"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monthly Budget Range</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select budget range" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {budgetRanges.map((range) => (
                                      <SelectItem key={range} value={range}>
                                        {range}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={companyForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Website</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://company.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={companyForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+1 (555) 123-4567" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={companyForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="San Francisco, CA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell students about your company, what you do, and what kind of talent you're looking for..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A compelling description helps attract the right talent to your projects.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                            Save Company Profile
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-6">
              <div className="space-y-6">
                <Form {...billingForm}>
                  <form onSubmit={billingForm.handleSubmit(onBillingSubmit)} className="space-y-6">
                    <Card className="glass-card bg-card/50 backdrop-blur-12">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          Billing Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={billingForm.control}
                          name="billingEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="billing@company.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={billingForm.control}
                          name="companyAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Business Street" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={billingForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="San Francisco" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={billingForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="CA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={billingForm.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="94105" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={billingForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="United States" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={billingForm.control}
                          name="taxId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax ID (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="XX-XXXXXXX" {...field} />
                              </FormControl>
                              <FormDescription>
                                For tax reporting purposes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Button type="submit" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Billing Information
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <Card className="glass-card bg-card/50 backdrop-blur-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { 
                          name: "emailNotifications", 
                          label: "Email Notifications", 
                          description: "Receive important updates and alerts via email",
                          icon: Mail,
                          category: "Essential"
                        },
                        { 
                          name: "pushNotifications", 
                          label: "Push Notifications", 
                          description: "Get real-time browser notifications for urgent updates",
                          icon: Bell,
                          category: "Essential"
                        },
                        { 
                          name: "projectUpdates", 
                          label: "Project Updates", 
                          description: "Stay informed about project progress and milestones",
                          icon: Briefcase,
                          category: "Project Management"
                        },
                        { 
                          name: "newApplications", 
                          label: "New Applications", 
                          description: "Get notified when students apply to your projects",
                          icon: User,
                          category: "Project Management"
                        },
                        { 
                          name: "paymentReminders", 
                          label: "Payment Reminders", 
                          description: "Receive reminders for pending payments and invoices",
                          icon: DollarSign,
                          category: "Financial"
                        },
                        { 
                          name: "weeklyReports", 
                          label: "Weekly Reports", 
                          description: "Get weekly summaries of your platform activity",
                          icon: Globe,
                          category: "Analytics"
                        },
                        { 
                          name: "marketingEmails", 
                          label: "Marketing Emails", 
                          description: "Receive promotional content and platform updates",
                          icon: Mail,
                          category: "Marketing"
                        },
                      ].map((item) => (
                        <FormField
                          key={item.name}
                          control={notificationForm.control}
                          name={item.name as keyof NotificationFormData}
                          render={({ field }) => (
                            <div className="flex items-center justify-between p-5 rounded-xl border border-border/20 bg-gradient-to-r from-card/40 to-card/20 hover:from-card/60 hover:to-card/40 transition-all duration-200 hover:shadow-md hover:border-primary/30">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 shadow-sm">
                                  <item.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-base font-medium">{item.label}</Label>
                                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                                      {item.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                              <div className="ml-4">
                                <button
                                  type="button"
                                  onClick={() => field.onChange(!field.value)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                    field.value 
                                      ? 'bg-gradient-to-r from-primary to-secondary' 
                                      : 'bg-muted/50 border border-border/50'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                                      field.value ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          )}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="px-8 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Preferences
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <div className="space-y-6">
                <Card className="glass-card bg-card/50 backdrop-blur-12">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Account Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Type</p>
                        <p className="text-sm text-muted-foreground">Business account with hiring privileges</p>
                      </div>
                      <Badge variant="outline">Buyer</Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Status</p>
                        <p className="text-sm text-muted-foreground">Active and ready to hire talent</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-card/50 backdrop-blur-12 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your company account and all associated data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
