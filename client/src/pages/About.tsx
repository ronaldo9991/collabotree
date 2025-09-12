import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import {
  Target,
  BookOpen,
  Lightbulb
} from "lucide-react";

const mission = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To create the world's most trusted platform connecting university students with buyers, enabling students to earn income while building professional experience."
  },
  {
    icon: BookOpen,
    title: "Our Vision",
    description: "A future where every student can seamlessly transition from academic learning to professional success through real-world project experience."
  },
  {
    icon: Lightbulb,
    title: "Our Values",
    description: "Innovation, trust, quality, and empowerment drive everything we do. We believe in creating opportunities that benefit both students and buyers."
  }
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="about-badge">
              About CollaboTree
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Collaborate.<br />
              Create.<br />
              Thrive.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              CollaboTree is the premium platform connecting verified university students with buyers 
              seeking high-quality services. We're building the future of student entrepreneurship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card bg-card/50 backdrop-blur-12">
              <CardContent className="p-8 md:p-12">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl font-bold mb-6" data-testid="section-story">The CollaboTree Story</h2>
                  <div className="space-y-6 text-muted-foreground leading-relaxed">
                    <p>
                      CollaboTree was born from a simple observation: university students possess incredible 
                      skills and fresh perspectives, but traditional job markets often overlook them due to 
                      lack of experience. Meanwhile, buyers struggle to find affordable, high-quality services 
                      from motivated providers.
                    </p>
                    <p>
                      We created CollaboTree to bridge this gap. By focusing exclusively on verified university 
                      students, we ensure that every service provider brings academic rigor, fresh thinking, 
                      and genuine motivation to deliver exceptional results.
                    </p>
                    <p>
                      Our platform combines cutting-edge verification technology, premium design, and 
                      real-time collaboration tools to create an environment where students can thrive 
                      as entrepreneurs while buyers receive outstanding value.
                    </p>
                    <p>
                      Today, CollaboTree is more than a marketplace—it's a launchpad for student careers 
                      and a trusted source of innovation for buyers worldwide.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid md:grid-cols-3 gap-6">
              {mission.map((item, index) => (
                <Card key={index} className="glass-card bg-card/50 backdrop-blur-12 border-border/30 text-center" data-testid={`mission-${index}`}>
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                      <item.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Card className="glass-card bg-card/50 backdrop-blur-12 border-primary/30">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Whether you're a student looking to showcase your skills or a buyer seeking quality services, 
                  CollaboTree is your gateway to meaningful collaboration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary" data-testid="join-as-student">
                    <Link href="/api/login">Join as Student</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="hire-talent">
                    <Link href="/marketplace">Hire Talent</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}