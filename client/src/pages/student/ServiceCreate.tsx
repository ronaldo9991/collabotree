import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save, Rocket, Package, DollarSign, Clock, Tag, FileText, Upload, Image, X } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  pricingCents: z.number().min(100, "Minimum price is $1").max(10000000, "Maximum price is $100,000"),
  deliveryDays: z.number().min(1, "Minimum delivery time is 1 day").max(30, "Maximum delivery time is 30 days"),
  tags: z.array(z.string()).min(0, "Tags are optional").max(5, "Maximum 5 tags allowed").optional(),
  coverImage: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const predefinedTags = [
  "Web Development", "Mobile App", "UI/UX Design", "Graphic Design",
  "Logo Design", "Content Writing", "Copywriting", "SEO",
  "Data Analysis", "Machine Learning", "Tutoring", "Translation",
  "Video Editing", "Animation", "Social Media", "Marketing",
  "WordPress", "React", "Python", "JavaScript", "Research"
];

export default function ServiceCreate() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      pricingCents: 5000, // $50
      deliveryDays: 7,
      tags: [],
      coverImage: "",
    },
  });

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // For now, we'll use a simple base64 conversion
      // In production, you'd upload to a cloud storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        form.setValue("coverImage", result);
        toast({
          title: "Image Uploaded",
          description: "Your service image has been uploaded successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    form.setValue("coverImage", "");
  };

  const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Limit to 5 portfolio images
    if (portfolioImages.length + files.length > 5) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 5 portfolio images",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: `File ${file.name} is not an image. Please upload image files only.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `File ${file.name} is too large. Please upload images smaller than 5MB.`,
            variant: "destructive",
          });
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newImages.push(result);
          
          if (newImages.length === files.length) {
            setPortfolioImages(prev => [...prev, ...newImages]);
            toast({
              title: "Portfolio Images Uploaded",
              description: `${newImages.length} portfolio image(s) uploaded successfully.`,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading portfolio images:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload portfolio images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ServiceFormData) => {
    console.log('Service creation form submitted:', data);
    console.log('Current user:', user);

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a service.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'STUDENT') {
      console.error('User role is not STUDENT:', user.role);
      toast({
        title: "Access Denied",
        description: "Only students can create services.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create service with the correct data structure
      const serviceData = {
        title: data.title,
        description: data.description,
        priceCents: data.pricingCents,
        coverImage: data.coverImage, // Include cover image
        isActive: true, // Explicitly set to active
      };

      console.log('Sending service data to API:', serviceData);

      const result = await api.createService(serviceData);

      console.log('Service created successfully:', result);

      toast({
        title: "Service Created Successfully!",
        description: "Your service is now live and available for buyers.",
      });

      // Redirect to student dashboard
      navigate("/dashboard/student");
    } catch (error) {
      console.error('Error creating service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error message:', errorMessage);
      toast({
        title: "Error",
        description: `Failed to create service: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

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
            <h1 className="text-3xl font-bold mb-2">Create New Service</h1>
            <p className="text-muted-foreground">
              Offer your skills and expertise to students and professionals
            </p>
          </div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="glass-card bg-card/50 backdrop-blur-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Professional React Website Development"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A clear, descriptive title that explains what you offer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your service in detail. What will the client receive? What makes you unique?"
                                rows={6}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Be specific about deliverables, process, and what clients can expect
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coverImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Image (Optional)</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                {uploadedImage ? (
                                  <div className="relative">
                                    <img
                                      src={uploadedImage}
                                      alt="Service preview"
                                      className="w-full h-48 object-cover rounded-lg border border-border/30"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={removeImage}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-border/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                    <div className="flex flex-col items-center gap-4">
                                      <div className="p-3 rounded-full bg-primary/10">
                                        <Image className="h-8 w-8 text-primary" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Upload a service image</p>
                                        <p className="text-xs text-muted-foreground">
                                          JPG, PNG, GIF up to 5MB
                                        </p>
                                      </div>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={isUploading}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        disabled={isUploading}
                                      >
                                        {isUploading ? (
                                          <>
                                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Choose Image
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Add a professional image to showcase your service (optional but recommended)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Portfolio Images */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="glass-card bg-card/50 backdrop-blur-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5 text-primary" />
                        Portfolio Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Showcase your previous work to build credibility. Upload up to 5 portfolio images.
                        </p>
                        
                        {/* Portfolio Images Grid */}
                        {portfolioImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {portfolioImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Portfolio ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-border/30"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removePortfolioImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Button */}
                        <div className="border-2 border-dashed border-border/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Image className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Add Portfolio Images</p>
                              <p className="text-xs text-muted-foreground">
                                {portfolioImages.length}/5 images uploaded
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePortfolioImageUpload}
                              className="hidden"
                              id="portfolio-upload"
                              disabled={isUploading || portfolioImages.length >= 5}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('portfolio-upload')?.click()}
                              disabled={isUploading || portfolioImages.length >= 5}
                            >
                              {isUploading ? (
                                <>
                                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  {portfolioImages.length === 0 ? 'Add Images' : 'Add More'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-card bg-card/50 backdrop-blur-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Skills & Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Add Tags</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a skill or tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagInputKeyPress}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addTag(tagInput.trim())}
                            disabled={!tagInput.trim() || selectedTags.length >= 5}
                          >
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedTags.length}/5 tags selected
                        </p>
                      </div>

                      {/* Selected Tags */}
                      {selectedTags.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Selected Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Predefined Tags */}
                      <div>
                        <p className="text-sm font-medium mb-2">Popular Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {predefinedTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary/10"
                              onClick={() => addTag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pricing & Delivery */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass-card bg-card/50 backdrop-blur-12 sticky top-8">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Pricing & Delivery
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="pricingCents"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (USD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) * 100)}
                                value={field.value / 100}
                              />
                            </FormControl>
                            <FormDescription>
                              Set a competitive price for your service
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Time</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select delivery time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">24 hours</SelectItem>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="7">1 week</SelectItem>
                                <SelectItem value="14">2 weeks</SelectItem>
                                <SelectItem value="21">2-3 weeks</SelectItem>
                                <SelectItem value="30">1 month</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How long will it take to complete?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium">Service Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price:</span>
                            <span>${(form.watch("pricingCents") / 100).toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery:</span>
                            <span>{form.watch("deliveryDays")} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tags:</span>
                            <span>{selectedTags.length}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Create Service
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}