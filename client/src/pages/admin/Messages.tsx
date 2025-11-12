import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Search,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  room: {
    hireRequest: {
      id: string;
      buyer: {
        id: string;
        name: string;
        email: string;
      };
      student: {
        id: string;
        name: string;
        email: string;
      };
      service: {
        id: string;
        title: string;
      };
    };
  };
}

interface ConversationData {
  service: {
    id: string;
    title: string;
    description: string;
    priceCents: number;
  };
  messages: Array<{
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      role: string;
      university?: string;
      isVerified?: boolean;
    };
  }>;
  participants: {
    student: {
      id: string;
      name: string;
      university?: string;
      isVerified?: boolean;
    };
    buyers: Array<{
      id: string;
      name: string;
      university?: string;
      isVerified?: boolean;
    }>;
  };
}

const AdminMessages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageSearch, setMessageSearch] = useState("");
  const [conversationModalOpen, setConversationModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationData | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const conversationThreadsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in as an admin to view messages.",
        variant: "destructive",
      });
      navigate("/admin/signin");
      return;
    }

    if (user.role !== "ADMIN") {
      toast({
        title: "Access Denied",
        description:
          "You need admin privileges to access the admin messaging tools.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.getAllMessages({ limit: 200 });
        if (response.success && response.data) {
          const responseData = response.data as any;
          setMessages(responseData.data || []);
        } else {
          throw new Error(response.error || "Failed to load messages.");
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load messages.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, navigate, toast]);

  const filteredMessages = useMemo(() => {
    const query = messageSearch.toLowerCase();
    return messages.filter(
      (message) =>
        message.body.toLowerCase().includes(query) ||
        message.sender.name.toLowerCase().includes(query) ||
        message.room.hireRequest.service.title
          .toLowerCase()
          .includes(query) ||
        message.room.hireRequest.buyer.name.toLowerCase().includes(query) ||
        message.room.hireRequest.student.name.toLowerCase().includes(query)
    );
  }, [messages, messageSearch]);

  const conversationThreads = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        serviceId: string;
        serviceTitle: string;
        studentName: string;
        studentEmail: string;
        buyerName: string;
        buyerEmail: string;
        messages: Message[];
        latestMessage?: Message;
        lastMessageAt?: string;
      }
    >();

    messages.forEach((message) => {
      const hireRequest = message.room.hireRequest;
      if (!hireRequest?.service) return;

      const threadId = hireRequest.id;
      if (!map.has(threadId)) {
        map.set(threadId, {
          id: threadId,
          serviceId: hireRequest.service.id,
          serviceTitle: hireRequest.service.title,
          studentName: hireRequest.student.name,
          studentEmail: hireRequest.student.email,
          buyerName: hireRequest.buyer.name,
          buyerEmail: hireRequest.buyer.email,
          messages: [],
        });
      }

      const thread = map.get(threadId)!;
      thread.messages.push(message);

      if (
        !thread.latestMessage ||
        new Date(message.createdAt) > new Date(thread.lastMessageAt || 0)
      ) {
        thread.latestMessage = message;
        thread.lastMessageAt = message.createdAt;
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
    );
  }, [messages]);

  const filteredConversationThreads = useMemo(() => {
    const query = messageSearch.toLowerCase();
    if (!query) return conversationThreads;

    return conversationThreads.filter((thread) => {
      return (
        thread.serviceTitle.toLowerCase().includes(query) ||
        thread.studentName.toLowerCase().includes(query) ||
        thread.buyerName.toLowerCase().includes(query)
      );
    });
  }, [conversationThreads, messageSearch]);

  const handleViewConversation = async (serviceId: string) => {
    try {
      setLoadingConversation(true);
      const response = await api.getServiceConversation(serviceId);
      if (response.success && response.data) {
        setSelectedConversation(response.data as ConversationData);
        setConversationModalOpen(true);
      } else {
        throw new Error(response.error || "Failed to load conversation.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load conversation.",
        variant: "destructive",
      });
    } finally {
      setLoadingConversation(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 section-padding-y">
      <div className="container-unified space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="tight-container flex flex-col gap-6 sm:gap-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Badge variant="outline" className="gap-2 bg-primary/10 text-primary">
                <MessageCircle className="h-4 w-4" />
                Admin Messaging Center
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-2">
                Conversations Overview
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Monitor all platform conversations, review the latest exchanges,
                and jump directly into full message histories between students
                and buyers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard/admin")}>
                Back to Admin Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/admin/users")}>
                View Total Users
              </Button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading messages...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 max-md:flex-col">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        All Messages
                      </CardTitle>
                      <CardDescription>
                        Real-time feed of all messages exchanged on the platform
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 max-md:w-full">
                      <div className="relative w-64 md:w-80 lg:w-96 max-md:w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by keyword, sender, service..."
                          value={messageSearch}
                          onChange={(event) => setMessageSearch(event.target.value)}
                          className="pl-10 h-10 max-md:min-h-[44px]"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="max-md:w-full max-md:min-h-[44px]"
                        onClick={() =>
                          conversationThreadsRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                        }
                      >
                        Conversation Threads
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredMessages.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-card border border-primary/10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={
                                  message.sender.role === "STUDENT"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[10px] uppercase tracking-wide w-fit"
                              >
                                {message.sender.role}
                              </Badge>
                              <span className="font-medium text-sm sm:text-base leading-tight">
                                {message.sender.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                            {message.body}
                          </p>

                          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-xl p-3">
                            <p className="truncate">
                              <strong>Service:</strong>{" "}
                              {message.room.hireRequest.service.title}
                            </p>
                            <p className="truncate">
                              <strong>Buyer:</strong>{" "}
                              {message.room.hireRequest.buyer.name}
                            </p>
                            <p className="truncate">
                              <strong>Student:</strong>{" "}
                              {message.room.hireRequest.student.name}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleViewConversation(
                                message.room.hireRequest.service.id
                              )
                            }
                            disabled={loadingConversation}
                            className="text-xs max-md:min-h-[44px] max-md:w-full mt-auto"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {loadingConversation ? "Loading..." : "View Full Conversation"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>No messages found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              ref={conversationThreadsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="glass-card bg-card/50 backdrop-blur-12 border border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 max-md:flex-col">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Conversation Threads
                      </CardTitle>
                      <CardDescription>
                        Student–buyer threads grouped by service with the latest message
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="max-md:self-start">
                      {filteredConversationThreads.length} active thread
                      {filteredConversationThreads.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredConversationThreads.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {filteredConversationThreads.map((thread) => (
                        <div
                          key={thread.id}
                          className="p-4 rounded-2xl bg-muted/30 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                        >
                          <div className="space-y-1">
                            <h3 className="text-sm sm:text-base font-semibold leading-tight line-clamp-2">
                              {thread.serviceTitle}
                            </h3>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="truncate">
                                <strong>Student:</strong> {thread.studentName}
                                {thread.studentEmail && (
                                  <span className="text-muted-foreground/70">
                                    {" "}
                                    ({thread.studentEmail})
                                  </span>
                                )}
                              </p>
                              <p className="truncate">
                                <strong>Buyer:</strong> {thread.buyerName}
                                {thread.buyerEmail && (
                                  <span className="text-muted-foreground/70">
                                    {" "}
                                    ({thread.buyerEmail})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Badge variant="secondary" className="shrink-0">
                              {thread.messages.length} message
                              {thread.messages.length === 1 ? "" : "s"}
                            </Badge>
                            <span>
                              {thread.lastMessageAt
                                ? new Date(thread.lastMessageAt).toLocaleString()
                                : "—"}
                            </span>
                          </div>

                          {thread.latestMessage && (
                            <div className="p-3 rounded-xl bg-card border border-border/40 space-y-2">
                              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                <span className="font-medium truncate">
                                  {thread.latestMessage.sender.name}
                                </span>
                                <span className="whitespace-nowrap">
                                  {new Date(
                                    thread.latestMessage.createdAt
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm line-clamp-3">
                                {thread.latestMessage.body}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 justify-end mt-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="max-md:min-h-[44px] max-md:w-full"
                              onClick={() => handleViewConversation(thread.serviceId)}
                              disabled={loadingConversation}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              View Conversation
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p>No conversation threads found</p>
                      <p className="text-sm">
                        Threads appear once students and buyers exchange messages.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <Dialog open={conversationModalOpen} onOpenChange={setConversationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Full Conversation
            </DialogTitle>
            <DialogDescription>
              Complete conversation history between buyer and student
            </DialogDescription>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {selectedConversation.service.title}
                  </CardTitle>
                  <CardDescription>
                    {selectedConversation.service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span>{" "}
                      ${selectedConversation.service.priceCents / 100}
                    </div>
                    <div>
                      <span className="font-medium">Student:</span>{" "}
                      {selectedConversation.participants.student.name}
                    </div>
                    <div>
                      <span className="font-medium">Buyers:</span>{" "}
                      {selectedConversation.participants.buyers
                        .map((buyer) => buyer.name)
                        .join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 p-3 rounded-lg ${
                        message.sender.role === "STUDENT"
                          ? "bg-blue-500/10 border border-blue-500/20"
                          : "bg-green-500/10 border border-green-500/20"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            message.sender.role === "STUDENT"
                              ? "bg-blue-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.sender.name}
                          </span>
                          <Badge
                            variant={
                              message.sender.role === "STUDENT"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {message.sender.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p>No messages found for this service</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;

