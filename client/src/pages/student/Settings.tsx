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
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Shield, 
  Bell, 
  Eye, 
  Lock,
  Trash2,
  Upload,
  GraduationCap,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Loader2,
  MessageCircle,
  Briefcase
} from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  university: z.string().min(2, "University name is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  hourlyRate: z.number().min(5, "Minimum rate is $5/hour").max(200, "Maximum rate is $200/hour").optional(),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  projectUpdates: z.boolean(),
  newMessages: z.boolean(),
  applicationUpdates: z.boolean(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;
type SecurityFormData = z.infer<typeof securitySchema>;

const skillOptions = [
  "Web Development", "Mobile App Development", "UI/UX Design", "Graphic Design",
  "Data Analysis", "Machine Learning", "Content Writing", "Copywriting",
  "Digital Marketing", "SEO", "Social Media", "Video Editing",
  "Animation", "Photography", "Translation", "Tutoring",
  "Research", "Python", "JavaScript", "React", "Node.js"
];

export default function StudentSettings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      university: user?.student?.university || "",
      skills: user?.student?.skills || [],
      bio: "",
      phone: "",
      location: "",
      website: "",
      hourlyRate: 25,
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      projectUpdates: true,
      newMessages: true,
      applicationUpdates: true,
    },
  });

  const securityForm = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
  });

  useEffect(() => {
    if (user?.student?.skills) {
      setSelectedSkills(user.student.skills);
      profileForm.setValue("skills", user.student.skills);
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
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

      // Update student profile
      const { error: studentError } = await supabase
        .from('students')
        .update({
          university: data.university,
          skills: data.skills,
        })
        .eq('id', user?.id);

      if (studentError) throw studentError;

      // Update localStorage
      const updatedUser = {
        ...user,
        full_name: data.full_name,
        email: data.email,
        student: {
          ...user?.student,
          university: data.university,
          skills: data.skills,
        }
      };
      localStorage.setItem('collabotree_user', JSON.stringify(updatedUser));

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
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

  const onNotificationSubmit = async (data: NotificationFormData) => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const onSecuritySubmit = async (data: SecurityFormData) => {
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    securityForm.reset();
  };

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill) && selectedSkills.length < 10) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      profileForm.setValue("skills", newSkills);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    profileForm.setValue("skills", newSkills);
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only students can access this page.</p>
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
            onClick={() => navigate("/dashboard/student")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Student Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile, preferences, and account settings
            </p>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="profile" className="flex items-center gap-2 text-sm font-medium px-4 py-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2 text-sm font-medium px-4 py-2">
                <Shield className="h-4 w-4" />
                Account
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

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Profile Photo */}
                <Card className="glass-card bg-card/50 backdrop-blur-12">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Profile Photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-white" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG up to 2MB
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <Card className="glass-card bg-card/50 backdrop-blur-12">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Basic Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="full_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="john@university.edu" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={profileForm.control}
                            name="university"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>University</FormLabel>
                                <FormControl>
                                  <Input placeholder="Stanford University" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
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
                            
                            <FormField
                              control={profileForm.control}
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
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website/Portfolio</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://yourportfolio.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="hourlyRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hourly Rate (USD)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="25" 
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
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell potential clients about yourself, your experience, and what makes you unique..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A compelling bio helps clients understand your expertise and personality.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Skills Section */}
                      <Card className="glass-card bg-card/50 backdrop-blur-12">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Skills & Expertise
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Selected Skills ({selectedSkills.length}/10)
                            </Label>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {selectedSkills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Add Skills</Label>
                            <div className="flex flex-wrap gap-2">
                              {skillOptions
                                .filter(skill => !selectedSkills.includes(skill))
                                .map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-primary/10"
                                  onClick={() => addSkill(skill)}
                                >
                                  + {skill}
                                </Badge>
                              ))}
                            </div>
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
                            Save Profile
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="mt-6">
              <div className="space-y-6">
                <Card className="glass-card bg-card/50 backdrop-blur-12">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Verification Status</p>
                        <p className="text-sm text-muted-foreground">
                          {user.student?.verified ? "Your account is verified" : "Complete verification to access all features"}
                        </p>
                      </div>
                      <Badge variant={user.student?.verified ? "default" : "secondary"}>
                        {user.student?.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Type</p>
                        <p className="text-sm text-muted-foreground">Student account with service creation privileges</p>
                      </div>
                      <Badge variant="outline">Student</Badge>
                    </div>
                  </CardContent>
                </Card>
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
                    <CardContent className="space-y-6">
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
                          description: "Get notified about project status changes and milestones",
                          icon: Briefcase,
                          category: "Career"
                        },
                        { 
                          name: "newMessages", 
                          label: "New Messages", 
                          description: "Receive alerts for new messages from buyers",
                          icon: MessageCircle,
                          category: "Communication"
                        },
                        { 
                          name: "applicationUpdates", 
                          label: "Application Updates", 
                          description: "Updates on your job applications and project status",
                          icon: User,
                          category: "Career"
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
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <Card className="glass-card bg-card/50 backdrop-blur-12">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-primary" />
                          Change Password
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Button type="submit" className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </form>
                </Form>

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
                          Permanently delete your account and all associated data
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
