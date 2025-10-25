import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Clock, 
  FolderSync, 
  Heart, 
  MapPin, 
  Shield, 
  MessageSquare, 
  Package,
  User,
  ArrowLeft,
  ShoppingCart
} from "lucide-react";
import { motion } from "framer-motion";
import { mockServicesWithOwners } from "@/data/mockData";

export default function ServiceDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [requirements, setRequirements] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Find service from mock data
  const service = mockServicesWithOwners.find(s => s.id === id);

  const handleOrder = () => {
    toast({
      title: "Demo Mode",
      description: "This is a demo application. Orders are not processed.",
    });
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: isFavorite ? "Service removed from your favorites." : "Service added to your favorites.",
    });
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <p className="text-muted-foreground mb-4">The service you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/marketplace")} data-testid="back-to-marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            className="mb-4"
            data-testid="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-2xl lg:text-3xl font-bold mb-4" data-testid="service-title">
                        {service.title}
                      </h1>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(service.tags ?? []).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Service Meta */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{service.deliveryDays} days delivery</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FolderSync className="h-4 w-4" />
                          <span>Revisions included</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{service.avgRating || '0'} ({service.ratingCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFavorite}
                      data-testid="favorite-button"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite ? 'Favorited' : 'Favorite'}
                    </Button>
                  </div>

                  {/* Service Image Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Package className="h-16 w-16 text-white/60 mx-auto mb-4" />
                      <p className="text-white/80 font-medium">Service Preview</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About This Service</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {service.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Seller Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    About the Seller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={service.owner.avatarUrl || undefined} />
                      <AvatarFallback className="text-lg">
                        {(service.owner.fullName ?? "").split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{service.owner.fullName || "Unknown User"}</h4>
                        {service.owner.isVerified === true && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Student
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{service.owner.university || "University not specified"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{service.avgRating || '0'}</span>
                          <span className="text-muted-foreground">({service.ratingCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${((service.pricingCents || 0) / 100).toFixed(0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.deliveryDays || 0} days delivery
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Describe your requirements
                      </label>
                      <Textarea
                        placeholder="Tell the seller what you need..."
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        rows={4}
                        data-testid="requirements-input"
                      />
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                      onClick={handleOrder}
                      disabled={!requirements.trim()}
                      data-testid="order-button"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order Now (Demo)
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      This is a demo application. Orders are not processed.
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Service price</span>
                      <span>${((service.pricingCents || 0) / 100).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Platform fee</span>
                      <span>$0</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>${((service.pricingCents || 0) / 100).toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Seller */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Have questions?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact the seller to discuss your project requirements.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    data-testid="contact-seller"
                    onClick={() => toast({
                      title: "Demo Mode",
                      description: "This is a demo application. Contact functionality is not available.",
                    })}
                  >
                    Contact Seller (Demo)
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}