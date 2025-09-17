import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi, projectsApi } from "@/lib/api";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";

export default function TestChat() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  const createTestOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create test orders.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      // First, get or create a test project
      const projects = await projectsApi.getOpenProjects({});
      let testProject;

      if (projects.length > 0) {
        testProject = projects[0];
      } else {
        // Create a test project if none exist
        testProject = await projectsApi.createProject({
          title: "Test Chat Project",
          description: "This is a test project for chat functionality",
          budget: 100,
          tags: ["Test", "Chat"],
          owner_role: 'student' as const,
          cover_url: null,
        });
      }

      // Create a test order
      const testOrder = await ordersApi.createOrder({
        project_id: testProject.id,
        seller_id: testProject.created_by,
        type: 'hire',
        amount_cents: 10000, // $100
      });

      toast({
        title: "Test Order Created!",
        description: `Order ID: ${testOrder.id}`,
      });

      // Navigate to chat
      navigate(`/chat/${testOrder.id}`);
    } catch (error) {
      console.error('Error creating test order:', error);
      toast({
        title: "Error",
        description: `Failed to create test order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="glass-card bg-card/50 backdrop-blur-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Test Chat System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This page helps you test the chat system by creating a test order and opening the chat.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Current User:</p>
              <p className="text-sm text-muted-foreground">
                {user ? `${user.full_name} (${user.role})` : 'Not signed in'}
              </p>
            </div>

            <Button
              onClick={createTestOrder}
              disabled={creating || !user}
              className="w-full"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Test Order...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Order & Open Chat
                </>
              )}
            </Button>

            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                Please sign in to test the chat system.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
