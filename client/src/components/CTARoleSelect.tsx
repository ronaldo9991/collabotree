import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Briefcase, ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";

interface CTARoleSelectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleSelect?: (role: "student" | "buyer") => void;
}

export function CTARoleSelect({ open, onOpenChange, onRoleSelect }: CTARoleSelectProps) {
  const handleRoleSelect = (role: "student" | "buyer") => {
    // Store role preference
    localStorage.setItem("ct_role", role);
    
    if (onRoleSelect) {
      onRoleSelect(role);
    } else {
      // Navigate to sign-in with role prefill
      window.location.href = `/signin?role=${role}`;
    }
    
    onOpenChange(false);
  };

  const roles = [
    {
      id: "student" as const,
      title: "Join as Student",
      description: "Share your skills and earn income while gaining professional experience",
      icon: GraduationCap,
      features: ["Showcase your skills", "Work on real projects", "Build your portfolio", "Earn while you learn"],
      gradient: "from-primary/10 to-secondary/10",
      iconColor: "text-primary"
    },
    {
      id: "buyer" as const,
      title: "Hire Talent",
      description: "Access verified university students for high-quality, affordable services",
      icon: Briefcase,
      features: ["Browse verified talent", "Quality guaranteed", "Competitive pricing", "Direct communication"],
      gradient: "from-secondary/10 to-accent/10",
      iconColor: "text-secondary"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl glass-card bg-card/50 backdrop-blur-12 border-border/30"
        data-testid="modal-role"
      >
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 z-10 h-8 w-8 p-0 hover:bg-background/80"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-role-modal"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <DialogHeader className="text-center space-y-4 pb-6">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20 w-fit">
              Get Started
            </Badge>
            <DialogTitle className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Choose Your Path
              </span>
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
              Select how you'd like to use CollaboTree
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role, index) => {
              const IconComponent = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card 
                    className={`h-full bg-gradient-to-br ${role.gradient} border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer group`}
                    onClick={() => handleRoleSelect(role.id)}
                    data-testid={`card-role-${role.id}`}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-background/50 flex items-center justify-center ${role.iconColor}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {role.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {role.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {role.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleSelect(role.id);
                        }}
                        data-testid={`button-role-${role.id}`}
                      >
                        {role.title}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}