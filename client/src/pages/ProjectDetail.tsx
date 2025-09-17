import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Clock, MapPin, CheckCircle, MessageCircle, DollarSign, Calendar, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { projectsApi, applicationsApi, type ProjectWithDetails } from "@/lib/api";

export default function ProjectDetail() {
  const [, params] = useRoute("/service/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    bid_amount: '',
  });

  const projectId = params?.id;

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await projectsApi.getProjectById(projectId);
      setProject(data);
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
    if (!project || !user || user.role !== 'student') {
      toast({
        title: "Error",
        description: "Only students can apply to projects.",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplying(true);
      await applicationsApi.applyToProject(project.id, {
        cover_letter: applicationData.cover_letter,
        bid_amount: applicationData.bid_amount ? parseFloat(applicationData.bid_amount) : undefined,
      });

      toast({
        title: "Success",
        description: "Your application has been submitted successfully!",
      });

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const canApply = user?.role === 'student' && project.status === 'open';
  const isOwner = user?.id === project.created_by;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container-unified py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      {project.tags?.[0] || 'Project'}
                    </Badge>
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.max(1, Math.floor((project.budget || 0) / 200))} days delivery</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      ${(project.budget || 0).toFixed(0)}
                    </div>
                    <Badge 
                      variant={project.status === 'open' ? 'default' : 'secondary'}
                      className="mt-2"
                    >
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Project Image */}
            {project.cover_url && (
              <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30 overflow-hidden">
                <img 
                  src={project.cover_url} 
                  alt={project.title}
                  className="w-full h-64 object-cover"
                />
              </Card>
            )}

            {/* Project Description */}
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description || 'No description available for this project.'}
                </p>
              </CardContent>
            </Card>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Project Creator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {(project.creator?.full_name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{project.creator?.full_name || 'Creator'}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.creator?.role === 'student' ? 'Student' : 'Buyer'}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-sm">4.8 (24 reviews)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardContent className="p-6">
                {canApply ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Apply to Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Apply to Project</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cover_letter">Cover Letter</Label>
                          <Textarea
                            id="cover_letter"
                            placeholder="Tell the client why you're the right fit for this project..."
                            value={applicationData.cover_letter}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, cover_letter: e.target.value }))}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bid_amount">Your Bid (Optional)</Label>
                          <div className="relative">
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
                        <Button 
                          onClick={handleApply} 
                          disabled={applying || !applicationData.cover_letter.trim()}
                          className="w-full"
                        >
                          {applying ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Application'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : isOwner ? (
                  <div className="text-center text-muted-foreground">
                    <p>This is your project</p>
                  </div>
                ) : project.status !== 'open' ? (
                  <div className="text-center text-muted-foreground">
                    <p>This project is no longer accepting applications</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Please sign in as a student to apply</p>
                  </div>
                )}

                <Button variant="outline" className="w-full mt-3">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Creator
                </Button>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">${(project.budget || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Time</span>
                  <span className="font-medium">{Math.max(1, Math.floor((project.budget || 0) / 200))} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">{project.applications?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
