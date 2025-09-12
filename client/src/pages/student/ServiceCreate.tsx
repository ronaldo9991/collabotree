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
import { ArrowLeft, Save, Rocket, Package, DollarSign, Clock, Tag, FileText } from "lucide-react";
import { motion } from "framer-motion";

const serviceSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(50, "Description must be at least 50 characters").max(2000, "Description must be less than 2000 characters"),
  pricingCents: z.number().min(500, "Minimum price is $5").max(500000, "Maximum price is $5000"),
  deliveryDays: z.number().min(1, "Minimum delivery time is 1 day").max(30, "Maximum delivery time is 30 days"),
  tags: z.array(z.string()).min(1, "At least one tag is required").max(5, "Maximum 5 tags allowed"),
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
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      pricingCents: 5000, // $50
      deliveryDays: 7,
      tags: [],
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

  const onSubmit = async (data: ServiceFormData) => {
    try {
      // In a real app, this would make an API call
      toast({
        title: "Demo Mode",
        description: "This is a demo application. Service creation is not processed.",
      });
      
      // Simulate success and redirect
      setTimeout(() => {
        navigate("/dashboard/student");
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
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
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="7">1 week</SelectItem>
                                <SelectItem value="14">2 weeks</SelectItem>
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