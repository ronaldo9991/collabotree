import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign,
  Package,
  MessageCircle,
  Eye,
  FileText,
  Shield,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface VerificationRequest {
  id: string;
  studentName: string;
  email: string;
  university: string;
  idCardUrl: string;
  ocrData: {
    name: string;
    studentId: string;
    confidence: number;
  };
  status: "pending" | "approved" | "rejected";
  submitDate: string;
}

interface Dispute {
  id: string;
  orderId: string;
  orderTitle: string;
  buyer: string;
  seller: string;
  amount: number;
  reason: string;
  evidence: string[];
  status: "open" | "investigating" | "resolved";
  reportDate: string;
}

interface MetricData {
  totalStudents: number;
  verifiedStudents: number;
  totalOrders: number;
  totalGMV: number;
  activeDisputes: number;
  monthlyGrowth: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  
  // Mock data - static for demo
  const [verificationRequests] = useState<VerificationRequest[]>([
    {
      id: "1",
      studentName: "Emma Wilson",
      email: "emma.wilson@stanford.edu",
      university: "Stanford University",
      idCardUrl: "https://example.com/id1.jpg",
      ocrData: {
        name: "Emma Wilson",
        studentId: "20230001",
        confidence: 0.95
      },
      status: "pending",
      submitDate: "2025-01-09"
    },
    {
      id: "2",
      studentName: "James Chen",
      email: "james.chen@mit.edu",
      university: "MIT",
      idCardUrl: "https://example.com/id2.jpg",
      ocrData: {
        name: "James Chen",
        studentId: "20230002",
        confidence: 0.88
      },
      status: "pending",
      submitDate: "2025-01-08"
    },
    {
      id: "3",
      studentName: "Lisa Garcia",
      email: "lisa.garcia@harvard.edu",
      university: "Harvard University",
      idCardUrl: "https://example.com/id3.jpg",
      ocrData: {
        name: "Lisa Garcia",
        studentId: "20230003",
        confidence: 0.92
      },
      status: "approved",
      submitDate: "2025-01-07"
    }
  ]);

  const [disputes] = useState<Dispute[]>([
    {
      id: "1",
      orderId: "ORD-001",
      orderTitle: "Website Development",
      buyer: "John Smith",
      seller: "Alex Chen",
      amount: 250,
      reason: "Deliverables not meeting requirements",
      evidence: ["screenshot1.png", "requirements.pdf"],
      status: "investigating",
      reportDate: "2025-01-09"
    },
    {
      id: "2",
      orderId: "ORD-002",
      orderTitle: "Logo Design",
      buyer: "Sarah Johnson",
      seller: "Mike Rodriguez",
      amount: 75,
      reason: "Late delivery and poor quality",
      evidence: ["original_design.png", "final_design.png"],
      status: "open",
      reportDate: "2025-01-08"
    }
  ]);

  const [metrics] = useState<MetricData>({
    totalStudents: 1247,
    verifiedStudents: 892,
    totalOrders: 3456,
    totalGMV: 125680,
    activeDisputes: 12,
    monthlyGrowth: 15.2
  });

  const handleVerificationAction = async (requestId: string, action: "approve" | "reject") => {
    toast({
      title: "Demo Mode",
      description: `This is a demo application. Verification ${action} is not processed.`,
    });
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDisputeStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-500";
      case "investigating": return "bg-yellow-500";
      case "resolved": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform management and oversight
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            Demo Mode
          </Badge>
        </motion.div>

        {/* Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <Card className="glass-card bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalStudents.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{metrics.verifiedStudents.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {((metrics.verifiedStudents / metrics.totalStudents) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">GMV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${metrics.totalGMV.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{metrics.activeDisputes}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">+{metrics.monthlyGrowth}%</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="verifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verifications" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Verifications
              </TabsTrigger>
              <TabsTrigger value="disputes" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Disputes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="verifications" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Student Verification Queue</h2>
                  <Badge variant="secondary">
                    {verificationRequests.filter(req => req.status === "pending").length} Pending
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {verificationRequests.map((request) => (
                    <Card key={request.id} className="glass-card bg-card/50 border-border/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{request.studentName}</CardTitle>
                            <CardDescription>{request.email}</CardDescription>
                            <p className="text-sm text-muted-foreground mt-1">{request.university}</p>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={`${getVerificationStatusColor(request.status)} text-white`}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* OCR Data */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Extracted Name</p>
                            <p className="text-sm text-muted-foreground">{request.ocrData.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Student ID</p>
                            <p className="text-sm text-muted-foreground">{request.ocrData.studentId}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Confidence</p>
                            <div className="flex items-center gap-2">
                              <Progress value={request.ocrData.confidence * 100} className="flex-1" />
                              <span className="text-sm text-muted-foreground">
                                {(request.ocrData.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {request.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              data-testid={`view-id-${request.id}`}
                              onClick={() => toast({
                                title: "Demo Mode",
                                description: "This is a demo application. ID card viewing is not available.",
                              })}
                            >
                              <Eye className="h-3 w-3" />
                              View ID Card
                            </Button>
                            <Button
                              size="sm"
                              className="flex items-center gap-1 bg-green-500 hover:bg-green-600"
                              onClick={() => handleVerificationAction(request.id, "approve")}
                              data-testid={`approve-${request.id}`}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleVerificationAction(request.id, "reject")}
                              data-testid={`reject-${request.id}`}
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {verificationRequests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No verification requests at this time.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="disputes" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Disputes Center</h2>
                  <Badge variant="secondary" className="bg-red-500 text-white">
                    {disputes.filter(dispute => dispute.status !== "resolved").length} Active
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <Card key={dispute.id} className="glass-card bg-card/50 border-border/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Order #{dispute.orderId} - {dispute.orderTitle}
                            </CardTitle>
                            <CardDescription>
                              {dispute.buyer} vs {dispute.seller}
                            </CardDescription>
                            <p className="text-sm text-muted-foreground mt-1">
                              Amount: ${dispute.amount} • Reported: {new Date(dispute.reportDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={`${getDisputeStatusColor(dispute.status)} text-white`}
                          >
                            {dispute.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Dispute Reason */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Reason</p>
                          <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                        </div>

                        {/* Evidence */}
                        <div>
                          <p className="text-sm font-medium mb-2">Evidence ({dispute.evidence.length} files)</p>
                          <div className="flex flex-wrap gap-2">
                            {dispute.evidence.map((file, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {file}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        {dispute.status !== "resolved" && (
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => toast({
                                title: "Demo Mode",
                                description: "This is a demo application. Contact functionality is not available.",
                              })}
                            >
                              <MessageCircle className="h-3 w-3" />
                              Contact Parties
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => toast({
                                title: "Demo Mode",
                                description: "This is a demo application. Investigation functionality is not available.",
                              })}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Investigate
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toast({
                                title: "Demo Mode",
                                description: "This is a demo application. Order details viewing is not available.",
                              })}
                            >
                              View Order Details
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {disputes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No active disputes. Great job maintaining platform quality!
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Platform Analytics</h2>
                
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="glass-card bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        User Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-2xl font-bold">+{metrics.monthlyGrowth}%</div>
                      <p className="text-sm text-muted-foreground">
                        Monthly user registration growth rate
                      </p>
                      <div className="bg-muted/50 h-32 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Chart placeholder</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Revenue Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-2xl font-bold">${metrics.totalGMV.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">
                        Total Gross Marketplace Value
                      </p>
                      <div className="bg-muted/50 h-32 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Chart placeholder</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-500" />
                        Order Volume
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">
                        Total orders processed
                      </p>
                      <div className="bg-muted/50 h-32 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Chart placeholder</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}