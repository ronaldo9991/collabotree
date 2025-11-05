import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  User,
  Clock,
  CheckCircle,
  FileText,
  DollarSign,
  PenTool
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);
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

    // Cleanup WebSocket connection on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [hireId, user?.id]);


  // Add a loading state while user is being loaded
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </div>
    );
  }

  // If no hireId, redirect to dashboard
  if (!hireId) {
    navigate("/dashboard");
    return null;
  }

  // If user is not authenticated properly, redirect to login
  if (!user.id) {
    navigate("/login");
    return null;
  }

  const fetchHireRequestAndInitializeChat = async () => {
    try {
      setLoading(true);
      
      // Check if user has valid authentication
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access chat.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      // Get hire request details - backend will handle access control
      let hireRequestData;
      try {
        const response = await api.getHireRequest(hireId!);
        hireRequestData = (response as any)?.data || response;
        setHireRequest(hireRequestData);
        
        // Fetch contract data for this hire request
        try {
          const contractsResponse = await api.getUserContracts();
          const contracts = (contractsResponse as any)?.data || contractsResponse || [];
          const hireContract = contracts.find((c: any) => c.hireRequestId === hireId);
          if (hireContract) {
            setContract(hireContract);
          }
        } catch (error) {
          console.log('No contract found for this hire request yet');
        }
      } catch (error: any) {
        console.error('Error fetching hire request:', error);
        if (error.message?.includes('Access denied') || error.message?.includes('permission')) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this chat.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Invalid or expired token')) {
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        } else {
          toast({
            title: "Error",
            description: "Failed to load chat. Please try again.",
            variant: "destructive",
          });
        }
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

      // Chat is available as soon as hire request is accepted - no contract requirement

      // Fetch chat messages
      await fetchMessages();
      
      // Initialize WebSocket connection for real-time chat
      initializeSocket();
      
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

  const initializeSocket = () => {
    if (!user || !hireId) return;

    // Get auth token from localStorage
    const tokens = localStorage.getItem('auth_tokens');
    const authToken = tokens ? JSON.parse(tokens).accessToken : null;

    if (!authToken) {
      console.error('No auth token found');
      return;
    }

    // Determine Socket.io server URL
    const getSocketUrl = () => {
      // Production: Use same domain when deployed together (Railway)
      if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
        return window.location.origin;  // Same as frontend URL
      }
      
      // Separate deployment: Use API URL without /api suffix
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '');
      }
      
      // Development: localhost
      return 'http://localhost:4000';
    };

    // Connect to WebSocket server with improved options
    const newSocket = io(getSocketUrl(), {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      setConnected(true);

      // Join the chat room for this hire request
      console.log(`🔗 Joining chat room for hireId: ${hireId}`);
      newSocket.emit('chat:join', { hireId });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server. Please check if the backend server is running.",
        variant: "destructive",
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('chat:joined', (data) => {
      console.log('✅ Successfully joined chat room:', data);
    });

    newSocket.on('chat:message:new', (message: ChatMessage) => {
      console.log('📨 New message received via socket:', message);
      setMessages(prev => {
        // Check if we have a temporary message for this content (receiver only)
        const tempMessage = prev.find(m =>
          m.id.startsWith('temp-') && m.body === message.body && m.senderId === message.senderId
        );

        if (tempMessage) {
          // Replace temporary message with real one
          console.log('✅ Replacing temporary message with real message (receiver)');
          const newMessages = prev.map(m =>
            m.id === tempMessage.id ? { ...message, sender: m.sender } : m
          );
          // Sort to maintain proper order
          return newMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        // Avoid duplicate messages (check by ID)
        if (prev.some(m => m.id === message.id)) {
          console.log('⚠️ Duplicate message detected, ignoring');
          return prev;
        }

        console.log('✅ Adding new message to state (receiver)');
        const newMessages = [...prev, message];
        // Sort to maintain proper order (oldest first)
        return newMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    });

    newSocket.on('chat:message:sent', (message: ChatMessage) => {
      console.log('✅ Message sent confirmation received:', message);
      setMessages(prev => {
        // Find and replace the temporary message with the real one
        const tempMessage = prev.find(m =>
          m.id.startsWith('temp-') && m.body === message.body && m.senderId === message.senderId
        );

        if (tempMessage) {
          console.log('✅ Replacing temporary message with real message (sender)');
          const newMessages = prev.map(m =>
            m.id === tempMessage.id ? { ...message, sender: m.sender } : m
          );
          // Sort to maintain proper order
          return newMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        // If no temporary message found, this is a duplicate or late confirmation
        console.log('⚠️ No temporary message found for confirmation');
        return prev;
      });
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to chat server",
        variant: "destructive",
      });
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      newSocket.disconnect();
    };
  };

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for hireId:', hireId);
      const messagesData = await api.getChatMessages(hireId!);
      console.log('Messages data received:', messagesData);

      let messages: ChatMessage[] = [];

      if (messagesData.success && messagesData.data && 'data' in messagesData.data && Array.isArray(messagesData.data.data)) {
        console.log('Setting messages from API response:', messagesData.data.data.length, 'messages');
        messages = messagesData.data.data;
      } else if (Array.isArray(messagesData)) {
        console.log('Setting messages from array:', messagesData.length, 'messages');
        messages = messagesData;
      } else if (messagesData.success && messagesData.data && Array.isArray(messagesData.data)) {
        console.log('Setting messages from data:', messagesData.data.length, 'messages');
        messages = messagesData.data;
      } else {
        console.log('No messages found, setting empty array');
        messages = [];
      }

      // Sort messages by createdAt (oldest first) to ensure proper ordering
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !socket || !user) return;

    const messageBody = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    try {
      setSending(true);

      // Create optimistic message for immediate UI update
      const optimisticMessage: ChatMessage = {
        id: tempId,
        roomId: `temp-${hireId}`,
        senderId: user.id,
        body: messageBody,
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name || 'Unknown'
        }
      };

      console.log('📝 Adding optimistic message:', optimisticMessage);
      setMessages(prev => [...prev, optimisticMessage]);

      // Send message via WebSocket for real-time delivery
      console.log('🚀 Sending message via socket:', { hireId, body: messageBody });
      socket.emit('chat:message:send', {
        hireId,
        body: messageBody
      });

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove optimistic message if it failed
      setMessages(prev => prev.filter(m => m.id !== tempId));
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

  const handleCreateContract = async () => {
    if (!hireRequest || !user || user.id !== hireRequest.studentId) {
      toast({
        title: "Access Denied",
        description: "Only the student can create contracts.",
        variant: "destructive",
      });
      return;
    }

    setCreatingContract(true);
    try {
      // Get form data from the modal
      const timelineInput = document.getElementById('timeline') as HTMLInputElement;
      const deliverablesInput = document.getElementById('deliverables') as HTMLTextAreaElement;
      const additionalTermsInput = document.getElementById('additionalTerms') as HTMLTextAreaElement;

      const timeline = parseInt(timelineInput?.value || '7');
      const deliverablesText = deliverablesInput?.value || 'Complete project as discussed, Provide regular updates, Deliver final work on time';
      const additionalTerms = additionalTermsInput?.value || 'Additional terms can be discussed in chat.';

      // Split deliverables by comma and clean up
      const deliverables = deliverablesText.split(',').map(d => d.trim()).filter(d => d.length > 0);

      const contractData = {
        hireRequestId: hireRequest.id,
        deliverables,
        timeline,
        additionalTerms
      };

      const response = await api.createContract(contractData);
      setContract(response.data);
      
      toast({
        title: "Contract Created",
        description: "Contract has been created and sent to the buyer for review.",
      });
      
      setShowContractModal(false);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingContract(false);
    }
  };

  const handleSignContract = async () => {
    if (!contract || !user) return;

    try {
      const signature = user.name || `User ${user.id}`;
      await api.signContract(contract.id, { signature });
      
      toast({
        title: "Contract Signed",
        description: "You have successfully signed the contract.",
      });
      
      // Refresh contract data
      const updatedContract = await api.getContract(contract.id);
      setContract(updatedContract.data);
    } catch (error) {
      console.error('Error signing contract:', error);
      toast({
        title: "Error",
        description: "Failed to sign contract. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProcessPayment = async () => {
    if (!contract || !user || user.id !== contract.buyerId) return;

    try {
      await api.processPayment(contract.id);
      
      toast({
        title: "Payment Processed",
        description: "Payment has been processed successfully.",
      });
      
      // Refresh contract data
      const updatedContract = await api.getContract(contract.id);
      setContract(updatedContract.data);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!hireRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20 h-[calc(100vh-3rem)] flex flex-col shadow-2xl">
            {/* Chat Header */}
            <CardHeader className="border-b border-primary/20 bg-card/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {otherUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {otherUser?.name || 'Unknown User'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {hireRequest.service?.title || 'Service Chat'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-muted-foreground">
                      {connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                    <CheckCircle className="h-3 w-3" />
                    Accepted
                  </Badge>
                  {contract ? (
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {contract.status === 'DRAFT' ? 'Draft' : 
                       contract.status === 'ACTIVE' ? 'Active' : 
                       contract.status === 'COMPLETED' ? 'Completed' : contract.status}
                    </Badge>
                  ) : (
                    user?.id === hireRequest?.studentId && (
                      <Button
                        size="sm"
                        onClick={() => setShowContractModal(true)}
                        className="gap-2"
                        disabled={creatingContract}
                      >
                        {creatingContract ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <PenTool className="h-4 w-4" />
                        )}
                        Create Contract
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Contract Actions */}
            {contract && (
              <div className="border-b border-primary/20 bg-card/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium">Contract Status</p>
                      <p className="text-xs text-muted-foreground">
                        Price: ${(contract.priceCents / 100).toFixed(2)} | 
                        Timeline: {contract.timeline} days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {contract.status === 'DRAFT' && (
                      <>
                        {!contract.isSignedByBuyer && user?.id === contract.buyerId && (
                          <Button size="sm" onClick={handleSignContract} className="gap-2">
                            <PenTool className="h-4 w-4" />
                            Sign Contract
                          </Button>
                        )}
                        {!contract.isSignedByStudent && user?.id === contract.studentId && (
                          <Button size="sm" onClick={handleSignContract} className="gap-2">
                            <PenTool className="h-4 w-4" />
                            Sign Contract
                          </Button>
                        )}
                      </>
                    )}
                    {contract.status === 'ACTIVE' && contract.paymentStatus === 'PENDING' && user?.id === contract.buyerId && (
                      <Button size="sm" onClick={handleProcessPayment} className="gap-2">
                        <DollarSign className="h-4 w-4" />
                        Process Payment
                      </Button>
                    )}
                    {contract.status === 'ACTIVE' && contract.paymentStatus === 'PAID' && (
                      <Badge variant="secondary" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-2 sm:space-y-3 md:space-y-4 bg-muted/10 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch', maxHeight: 'calc(100vh - 280px)' }}>
                {messages.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`flex gap-2 sm:gap-3 md:gap-4 max-w-[85%] sm:max-w-[70%] md:max-w-[65%] lg:max-w-[60%] ${message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0 border border-primary/20 shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                            {message.sender?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 shadow-sm max-w-full min-w-0 ${
                          message.senderId === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-card-foreground border border-border/50'
                        }`}>
                          <p className="text-sm sm:text-base break-words overflow-wrap-anywhere hyphens-auto leading-relaxed max-md:text-xs">{message.body}</p>
                          <p className={`text-xs sm:text-[11px] mt-1.5 sm:mt-2 whitespace-nowrap ${
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
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Message Input */}
              <div className="border-t border-border/50 p-3 sm:p-4 md:p-5 bg-card/30">
                <div className="flex gap-2 sm:gap-3 max-md:gap-1.5">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1 bg-background border-border/50 placeholder-muted-foreground focus:border-primary text-sm sm:text-base max-md:min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="gap-2 max-md:min-h-[44px] sm:min-h-[48px] md:min-h-[52px] max-md:px-3 sm:px-4 md:px-5"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary-foreground"></div>
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contract Creation Modal */}
      <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Contract</DialogTitle>
            <DialogDescription>
              Create a contract for this project. The buyer will need to review and sign it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Project Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price in cents"
                defaultValue={hireRequest?.priceCents || hireRequest?.service?.priceCents || 5000}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Price: ${((hireRequest?.priceCents || hireRequest?.service?.priceCents || 5000) / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <Label htmlFor="timeline">Timeline (days)</Label>
              <Input
                id="timeline"
                type="number"
                placeholder="Enter timeline in days"
                defaultValue="7"
                min="1"
                max="365"
              />
            </div>
            <div>
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                placeholder="Describe what will be delivered..."
                defaultValue="Complete project as discussed, Provide regular updates, Deliver final work on time"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="additionalTerms">Additional Terms</Label>
              <Textarea
                id="additionalTerms"
                placeholder="Any additional terms or conditions..."
                defaultValue="Additional terms can be discussed in chat."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateContract} disabled={creatingContract}>
              {creatingContract ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : null}
              Create Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
