import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  User,
  Clock,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessage {
  id: number;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
}

export default function Chat() {
  const { hireId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hireRequest, setHireRequest] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (hireId && user?.id) {
      fetchHireRequestAndInitializeChat();
    }
  }, [hireId, user?.id]);

  const fetchHireRequestAndInitializeChat = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching hire request with ID:', hireId);
      
      // Get hire request details
      const hireRequestData = await api.getHireRequest(hireId!);
      console.log('Hire request data:', hireRequestData);
      setHireRequest(hireRequestData);

      // Check if user is part of this hire request
      if (user?.id !== hireRequestData.buyerId && user?.id !== hireRequestData.studentId) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this chat.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Check if hire request is accepted
      if (hireRequestData.status !== 'ACCEPTED') {
        toast({
          title: "Chat Not Available",
          description: "Chat is only available for accepted hire requests.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Fetch chat messages
      await fetchMessages();
      
    } catch (error) {
      console.error('Error fetching hire request:', error);
      toast({
        title: "Error",
        description: "Failed to load chat. Please try again.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const messagesData = await api.getChatMessages(hireId!);
      console.log('Messages data:', messagesData);
      
      if (messagesData.success && messagesData.data && messagesData.data.data) {
        setMessages(messagesData.data.data);
      } else if (Array.isArray(messagesData)) {
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      const result = await api.sendMessage(hireId!, newMessage.trim());
      console.log('Message sent:', result);
      
      if (result.success) {
        setNewMessage("");
        // Add the new message to the list
        setMessages(prev => [...prev, result.data]);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = () => {
    if (!hireRequest || !user) return null;
    
    if (user.id === hireRequest.buyerId) {
      return hireRequest.student;
    } else {
      return hireRequest.buyer;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B69] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!hireRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B69] flex items-center justify-center">
        <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chat Not Found</h2>
            <p className="text-muted-foreground mb-6">
              Hire request not found or you don't have permission to view this chat.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            {hireId && (
              <p className="text-sm text-muted-foreground mt-4">
                Hire Request ID: {hireId}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B69]">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 h-[calc(100vh-3rem)] flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {otherUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {otherUser?.name || 'Unknown User'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {hireRequest.service?.title || 'Service Chat'}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Accepted
                </Badge>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[70%] ${message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {message.sender?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.senderId === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.body}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-primary/20 p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="gap-2"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
