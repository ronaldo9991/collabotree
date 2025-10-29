import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, CheckCircle, MessageCircle, DollarSign, Calendar, Loader2, X, ChevronLeft, ChevronRight, Maximize2, Star, User, MapPin, Award, TrendingUp, Eye } from "lucide-react";
import {stage-0
  RUN cd backend && npx prisma generate
  1s
  Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize
  
  stage-0
  RUN cd backend && npm run build
  3s
  npm warn config production Use `--omit=dev` instead.
  > collabotree-backend@1.0.0 build
  > tsc
  src/app.ts(121,9): error TS2304: Cannot find name 'existsSync'.
  
  src/app.ts(145,42): error TS18046: 'error' is of type 'unknown'.
  
  Dockerfile:25
  -------------------
  23 |     COPY . /app/.
  24 |     RUN --mount=type=cache,id=s/63c91588-6110-45bd-bc91-bc114140d2b3-node_modules/cache,target=/app/node_modules/.cache cd backend && npx prisma generate
  25 | >>> RUN --mount=type=cache,id=s/63c91588-6110-45bd-bc91-bc114140d2b3-node_modules/cache,target=/app/node_modules/.cache cd backend && npm run build
  26 |
  27 |
  -------------------
  ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c cd backend && npm run build" did not complete successfully: exit code: 2
  Error: Docker build failed motion, AnimatePresence } from "framer-motion";
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
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Mock portfolio images - in production, these would come from the project data
  const portfolioImages = project?.cover_url ? [
    project.cover_url,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
  ] : [];

  const projectId = params?.id;

  // Helper function to convert delivery days to readable text
  const getDeliveryTimeText = (days: number) => {
    if (days === 1) return '24 hours';
    if (days === 3) return '3 days';
    if (days === 7) return '1 week';
    if (days === 14) return '2 weeks';
    if (days === 21) return '2-3 weeks';
    if (days === 30) return '1 month';
    return `${days} days`;
  };

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
      // if (user?.id && user.role === 'STUDENT') {
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
    if (!project || !user || user.role !== 'STUDENT') {
      toast({
        title: "Error",
        description: "Only students can apply to projects.",
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

  const canApply = user?.role === 'STUDENT' && !hasApplied;
  const isOwner = user?.id === project.ownerId;

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
                        <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{getDeliveryTimeText(project.deliveryDays || 7)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      ${(project.priceCents || 0) / 100}
                    </div>
                    <Badge 
                      variant="default"
                      className="mt-2"
                    >
                      AVAILABLE
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Portfolio Gallery */}
            {portfolioImages.length > 0 && (
              <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Maximize2 className="h-5 w-5" />
                    Portfolio Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioImages.map((image, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group border border-border/30"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                          <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Lightbox Dialog */}
            <AnimatePresence>
              {lightboxOpen && (
                <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                  <DialogContent className="max-w-6xl p-0 bg-black/95 border-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      {/* Close Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => setLightboxOpen(false)}
                      >
                        <X className="h-6 w-6" />
                      </Button>

                      {/* Navigation Buttons */}
                      {portfolioImages.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) => 
                                prev === 0 ? portfolioImages.length - 1 : prev - 1
                              );
                            }}
                          >
                            <ChevronLeft className="h-8 w-8" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) => 
                                prev === portfolioImages.length - 1 ? 0 : prev + 1
                              );
                            }}
                          >
                            <ChevronRight className="h-8 w-8" />
                          </Button>
                        </>
                      )}

                      {/* Image Display */}
                      <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentImageIndex}
                            src={portfolioImages[currentImageIndex]}
                            alt={`Portfolio ${currentImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.2 }}
                          />
                        </AnimatePresence>
                      </div>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        {currentImageIndex + 1} / {portfolioImages.length}
                      </div>
                    </motion.div>
                  </DialogContent>
                </Dialog>
              )}
            </AnimatePresence>

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

            {/* Related Projects */}
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Related Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">Related Project {i}</h4>
                        <p className="text-xs text-muted-foreground">${50 + i * 25}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getDeliveryTimeText(7)}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Projects
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

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
                ) : hasApplied ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                      <span className="text-green-600 font-medium">Application Submitted</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      You have already applied to this project. You can apply to other projects from this student.
                    </p>
                  </div>
                ) : isOwner ? (
                  <div className="text-center text-muted-foreground">
                    <p>This is your project</p>
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

            {/* Student Profile */}
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {(project.creator?.full_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{project.creator?.full_name || 'Student'}</h3>
                      {project.creator?.isVerified && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Verified Student</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating (127 reviews)</p>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-1">24</div>
                    <p className="text-xs text-muted-foreground">Projects Completed</p>
                  </div>
                </div>
                
                {/* Rating Breakdown */}
                <div className="space-y-2 pt-3 border-t border-border/30">
                  <h4 className="text-sm font-medium">Rating Breakdown</h4>
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-muted/30 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${rating === 5 ? 85 : rating === 4 ? 10 : rating === 3 ? 3 : rating === 2 ? 1 : 1}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-8">
                          {rating === 5 ? '108' : rating === 4 ? '13' : rating === 3 ? '4' : rating === 2 ? '1' : '1'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>University of Technology</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Computer Science Student</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Profile
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
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">${(project.priceCents || 0) / 100}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Time</span>
                  <span className="font-medium">{getDeliveryTimeText(project.deliveryDays || 7)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">{project.applications?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default">
                    AVAILABLE
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
