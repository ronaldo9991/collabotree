import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, CheckCircle, DollarSign, Calendar, Loader2, Send, Tag, TrendingUp, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ProjectWithDetails } from "@/types/projects";

export default function ProjectDetail() {
  const [, params] = useRoute("/service/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    bid_amount: '',
  });

  const projectId = params?.id;

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, user?.id]);

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const response = await api.getProject(projectId);
      setProject(response.data as ProjectWithDetails);

      // Check if user has already applied to this project
      // Note: This functionality can be implemented later when the API is available
      // if (user?.id && user.role === 'BUYER') {
      //   const applied = await applicationsApi.hasUserAppliedToProject(projectId, user.id);
      //   setHasApplied(applied);
      // }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!project || !user || user.role !== 'BUYER') {
      toast({
        title: "Error",
        description: "Only buyers can apply to projects.",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplying(true);
      // await api.applyToProject(project.id, {
      //   cover_letter: applicationData.cover_letter,
      //   bid_amount: applicationData.bid_amount ? parseFloat(applicationData.bid_amount) : undefined,
      // });

      toast({
        title: "Success",
        description: "Your application has been submitted successfully!",
      });

      // Update application status
      setHasApplied(true);

      // Reset form
      setApplicationData({ cover_letter: '', bid_amount: '' });
    } catch (error) {
      console.error('Error applying to project:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project details...</p>
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const canApply = user?.role === 'BUYER' && !hasApplied;
  const isOwner = user?.id === project.ownerId;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container-unified py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 shadow-xl overflow-hidden">
                <CardHeader className="relative">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-3 flex-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <Badge variant="secondary" className="w-fit mb-2">
                          <Tag className="h-3 w-3 mr-1" />
                          {project.tags?.[0] || 'Project'}
                        </Badge>
                      </motion.div>
                      
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
                      >
                        {project.title}
                      </motion.h1>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap"
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>7 days delivery</span>
                        </div>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-right ml-4"
                    >
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        ${(project.priceCents || 0) / 100}
                      </div>
                      <Badge 
                        variant="default"
                        className="mt-2 text-sm px-3 py-1"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        AVAILABLE
                      </Badge>
                    </motion.div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Project Image */}
            {project.cover_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 overflow-hidden shadow-xl">
                  <motion.img 
                    src={project.cover_url} 
                    alt={project.title}
                    className="w-full h-64 md:h-96 object-cover"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </motion.div>
            )}

            {/* Project Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Project Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {project.description || 'No description available for this project.'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Skills Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                        >
                          <Badge variant="outline" className="text-sm px-3 py-1.5 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            {tag}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 shadow-xl sticky top-24">
                <CardContent className="p-6">
                  {canApply ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full" size="lg">
                            <Send className="h-4 w-4 mr-2" />
                            Apply to Project
                          </Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">Apply to Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cover_letter">Cover Letter *</Label>
                            <Textarea
                              id="cover_letter"
                              placeholder="Tell the client why you're the right fit for this project..."
                              value={applicationData.cover_letter}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, cover_letter: e.target.value }))}
                              rows={4}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bid_amount">Your Bid (Optional)</Label>
                            <div className="relative mt-2">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="bid_amount"
                                type="number"
                                placeholder="0"
                                value={applicationData.bid_amount}
                                onChange={(e) => setApplicationData(prev => ({ ...prev, bid_amount: e.target.value }))}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={handleApply} 
                              disabled={applying || !applicationData.cover_letter.trim()}
                              className="w-full"
                              size="lg"
                            >
                              {applying ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Submit Application
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : hasApplied ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-green-600 dark:text-green-400 font-medium mb-2">Application Submitted</p>
                      <p className="text-muted-foreground text-sm">
                        You have already applied to this project.
                      </p>
                    </motion.div>
                  ) : isOwner ? (
                    <div className="text-center text-muted-foreground py-4">
                      <p className="font-medium">This is your project</p>
                      <p className="text-sm mt-1">You cannot apply to your own project</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">Sign in to apply</p>
                      <Button asChild className="w-full" size="lg">
                        <Link href="/signin">
                          Sign In
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Project Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Price</span>
                    </div>
                    <span className="font-bold text-primary">${(project.priceCents || 0) / 100}</span>
                  </motion.div>
                  
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Delivery Time</span>
                    </div>
                    <span className="font-medium">7 days</span>
                  </motion.div>
                  
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Applications</span>
                    </div>
                    <span className="font-medium">{project.applications?.length || 0}</span>
                  </motion.div>
                  
                  <motion.div
                    className="flex justify-between items-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="default" className="px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      AVAILABLE
                    </Badge>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
