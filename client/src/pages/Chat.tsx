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
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface ChatThread {
  id: string;
  project_id: string;
  buyer_id: string;
  seller_id: string;
  last_msg_at: string | null;
  msg_count: number;
  created_at: string;
}

export default function Chat() {
  const { orderId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (orderId && user?.id) {
      fetchOrderAndInitializeChat();
    }
  }, [orderId, user?.id]);

  const fetchOrderAndInitializeChat = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching order with ID:', orderId);
      
      // Get order details
      const orderData = await api.getOrder(orderId!);
      console.log('Order data:', orderData);
      setOrder(orderData);

      // Check if user is part of this order
      if (user?.id !== orderData.buyer_id && user?.id !== orderData.seller_id) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this chat.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Get or create chat thread
      const chatThread = await api.getOrCreateThread(
        orderData.project_id,
        orderData.buyer_id,
        orderData.seller_id
      );
      console.log('Chat thread:', chatThread);
      setThread(chatThread);

      // Get existing messages
      const existingMessages = await api.getMessages(chatThread.id);
      console.log('Existing messages:', existingMessages);
      setMessages(existingMessages);

      // Subscribe to new messages (only from other users)
      const subscription = chatApi.subscribeToMessages(chatThread.id, (newMessage) => {
        // Only add messages from other users, not from the current user
        if (newMessage.sender_id !== user?.id) {
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing chat:', error);
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: `Failed to load chat: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !thread || sending) return;

    try {
      setSending(true);
      console.log('Attempting to send message:', {
        threadId: thread.id,
        message: newMessage.trim(),
        userId: user?.id,
        userRole: user?.role
      });
      
      const sentMessage = await api.sendMessage(thread.id, newMessage.trim());
      setNewMessage("");
      
      // Add the sent message to the current messages array (avoid duplicates)
      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some(msg => msg.id === sentMessage.id);
        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, sentMessage];
      });
      
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to send message. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Not authenticated')) {
          errorMessage = "Please sign in again to send messages.";
        } else if (error.message.includes('Permission denied') || error.message.includes('Row Level Security')) {
          errorMessage = "Permission denied. Please refresh and try again.";
        } else if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
    if (!order || !user) return null;
    return user.id === order.buyer_id ? order.seller : order.buyer;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!loading && (!order || !thread)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Chat Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {!order ? "Order not found or you don't have permission to view this chat." : "Chat thread could not be created."}
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="text-xs text-muted-foreground">
              Order ID: {orderId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Card className="glass-card bg-card/50 backdrop-blur-12">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {otherUser?.full_name || 'User'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {otherUser?.role === 'student' ? 'Student' : 'Buyer'}
                      </Badge>
                      <Badge 
                        variant={order.status === 'accepted' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${(order.amount_cents / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{order.project?.title}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Chat Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 min-h-[500px] max-h-[80vh] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto chat-messages-area">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`chat-message-container ${message.sender_id === user?.id ? 'user-message' : 'other-message'}`}
                    >
                      <div className="chat-message-bubble">
                        <p className="chat-message-text">{message.body}</p>
                      </div>
                      <div className={`chat-timestamp ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.created_at)}</span>
                        {message.sender_id === user?.id && (
                          <CheckCircle className="h-3 w-3 text-primary" />
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4">
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
                    size="sm"
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
