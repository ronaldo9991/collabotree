import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  User,
  CreditCard,
  Loader2,
  Star,
  Download
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Contract {
  id: string;
  title: string;
  description: string;
  timeline: number;
  priceCents: number;
  platformFeeCents: number;
  studentPayoutCents: number;
  status: string;
  isSignedByBuyer: boolean;
  isSignedByStudent: boolean;
  paymentStatus: string;
  progressStatus: string;
  deliverables: string[] | string; // Can be array or JSON string
  progressNotes?: string;
  completionNotes?: string;
  buyer: { id: string; name: string; email: string };
  student: { id: string; name: string; email: string };
  service: { id: string; title: string; description: string };
  hireRequest: { id: string };
  orderId?: string; // Added for review functionality
}

interface ContractManagerProps {
  contractId?: string;
  hireRequestId?: string;
  onContractUpdate?: () => void;
}

export function ContractManager({ contractId, hireRequestId, onContractUpdate }: ContractManagerProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [signature, setSignature] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [markAsCompleted, setMarkAsCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (contractId) {
      fetchContract();
    } else if (hireRequestId) {
      fetchContractByHireRequest();
    }
  }, [contractId, hireRequestId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await api.getContract(contractId!);
      if (response.success) {
        const contractData = response.data;
        
        // Extract orderId from various possible locations
        let orderId = contractData.orderId;
        
        // If not directly on contract, try from hireRequest.orders
        if (!orderId && contractData.hireRequest?.orders?.length > 0) {
          orderId = contractData.hireRequest.orders[0].id;
        }
        
        // If still not found, try fetching from hireRequest endpoint
        if (!orderId && contractData.hireRequest?.id) {
          try {
            const hireRequestResponse = await api.getHireRequest(contractData.hireRequest.id);
            if (hireRequestResponse.success && hireRequestResponse.data.orders?.length > 0) {
              orderId = hireRequestResponse.data.orders[0].id;
            }
          } catch (error) {
            console.error('Error fetching hireRequest for orderId:', error);
          }
        }
        
        // Set contract with orderId if found
        const contractWithOrderId = orderId ? { ...contractData, orderId } : contractData;
        setContract(contractWithOrderId);
        
        // For buyers, check if they need to review
        if (contractData.status === 'COMPLETED' && user?.id === contractData.buyer?.id && orderId) {
          checkReviewStatus(orderId);
        }
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast({
        title: "Error",
        description: "Failed to load contract.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkReviewStatus = async (orderId: string) => {
    try {
      if (!orderId || !user) return;
      
      // Check if user has already reviewed this order by fetching the order directly
      try {
        const orderResponse = await api.getOrder(orderId);
        if (orderResponse.success && orderResponse.data) {
          const order = orderResponse.data;
          // Check if current user has already reviewed this order
          const userReview = order.reviews?.find((review: any) => review.reviewer?.id === user.id);
          setHasReviewed(!!userReview);
        } else {
          setHasReviewed(false);
        }
      } catch (error) {
        console.error('Error fetching order for review check:', error);
        // Fallback: check user reviews
        const response = await api.getUserReviews(user.id);
        if (response.success) {
          const reviews = response.data?.data || response.data || [];
          const hasReviewedOrder = reviews.some((review: any) => review.order?.id === orderId);
          setHasReviewed(hasReviewedOrder);
        } else {
          setHasReviewed(false);
        }
      }
    } catch (error) {
      console.error('Error checking review status:', error);
      // Don't block UI if review check fails
      setHasReviewed(false);
    }
  };

  const fetchContractByHireRequest = async () => {
    try {
      setLoading(true);
      // Get user contracts and find the one for this hire request
      const response = await api.getUserContracts();
      if (response.success) {
        const userContract = response.data.find((c: Contract) => c.hireRequest.id === hireRequestId);
        if (userContract) {
          setContract(userContract);
          // Check if buyer has already reviewed
          if (userContract.orderId && user?.id === userContract.buyer?.id) {
            checkReviewStatus(userContract.orderId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    if (!contract || !signature.trim()) return;

    try {
      setProcessing(true);
      const response = await api.signContract(contract.id, { signature: signature.trim() });
      if (response.success) {
        setContract(response.data);
        setSignature('');
        toast({
          title: "Contract Signed",
          description: "Your signature has been recorded successfully.",
        });
        onContractUpdate?.();
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast({
        title: "Error",
        description: "Failed to sign contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!contract) return;

    try {
      setProcessing(true);
      const response = await api.processPayment(contract.id);
      if (response.success) {
        setContract(response.data);
        toast({
          title: "Payment Processed",
          description: "Payment has been processed and held in escrow.",
        });
        onContractUpdate?.();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!contract) return;
    
    // For regular progress update, we need progress notes
    if (!markAsCompleted && !progressNotes.trim()) {
      toast({
        title: "Error",
        description: "Please describe your progress.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await api.updateProgress(contract.id, {
        progressStatus: markAsCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        progressNotes: markAsCompleted ? (progressNotes.trim() || completionNotes.trim() || 'Project completed') : progressNotes.trim(),
        markAsCompleted: markAsCompleted,
        completionNotes: markAsCompleted ? completionNotes.trim() : undefined,
      });
      if (response.success) {
        const updatedContract = { ...response.data, orderId: response.data.orderId };
        setContract(updatedContract);
        setProgressNotes('');
        setCompletionNotes('');
        setMarkAsCompleted(false);
        
        // If completed and user is buyer, check review status
        if (markAsCompleted && updatedContract.orderId && user?.id === updatedContract.buyer?.id) {
          checkReviewStatus(updatedContract.orderId);
        }
        
        toast({
          title: markAsCompleted ? "Contract Completed" : "Progress Updated",
          description: markAsCompleted 
            ? "Contract marked as completed. Payment has been released to you."
            : "Your progress has been updated successfully.",
        });
        onContractUpdate?.();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contract) return;

    try {
      setProcessing(true);
      await api.downloadContractPDF(contract.id);
      toast({
        title: "PDF Downloaded",
        description: "Contract PDF has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!contract || rating === 0) return;

    try {
      setProcessing(true);
      
      // Find the orderId from the contract - check multiple locations
      let orderId = contract.orderId;
      
      // If not directly on contract, try from hireRequest.orders
      if (!orderId && (contract as any).hireRequest?.orders?.length > 0) {
        orderId = (contract as any).hireRequest.orders[0].id;
        // Update contract state with orderId
        setContract({ ...contract, orderId });
      }
      
      // If still not found, try fetching from hireRequest endpoint
      if (!orderId && contract.hireRequest?.id) {
        try {
          const hireRequestResponse = await api.getHireRequest(contract.hireRequest.id);
          if (hireRequestResponse.success && hireRequestResponse.data.orders?.length > 0) {
            orderId = hireRequestResponse.data.orders[0].id;
            // Update contract state with orderId
            setContract({ ...contract, orderId });
          }
        } catch (error) {
          console.error('Error fetching hireRequest for orderId:', error);
        }
      }
      
      // If still no orderId, try fetching contract again to get latest data
      if (!orderId && contract.id) {
        try {
          const contractResponse = await api.getContract(contract.id);
          if (contractResponse.success) {
            const contractData = contractResponse.data;
            // Try direct orderId first
            orderId = contractData.orderId;
            // If not, try from hireRequest.orders
            if (!orderId && contractData.hireRequest?.orders?.length > 0) {
              orderId = contractData.hireRequest.orders[0].id;
            }
            // Update contract state with orderId
            if (orderId) {
              setContract({ ...contractData, orderId });
            }
          }
        } catch (error) {
          console.error('Error fetching contract for orderId:', error);
        }
      }
      
      if (!orderId) {
        toast({
          title: "Error",
          description: "Order ID not found. Cannot submit review. Please refresh the page.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Verify order exists and is completed before submitting
      try {
        const orderResponse = await api.getOrder(orderId);
        if (!orderResponse.success || !orderResponse.data) {
          toast({
            title: "Error",
            description: "Order not found. Cannot submit review.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }
        
        const order = orderResponse.data;
        if (order.status !== 'COMPLETED') {
          toast({
            title: "Error",
            description: `Order status is ${order.status}. Reviews can only be submitted for completed orders.`,
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }
        
        // Check if already reviewed
        const existingReview = order.reviews?.find((review: any) => review.reviewer?.id === user?.id);
        if (existingReview) {
          setHasReviewed(true);
          toast({
            title: "Already Reviewed",
            description: "You have already submitted a review for this order.",
            variant: "default",
          });
          setProcessing(false);
          return;
        }
      } catch (orderError) {
        console.error('Error verifying order:', orderError);
        // Continue with review submission attempt
      }

      const response = await api.createReview({
        orderId: orderId,
        rating: rating,
        comment: reviewComment.trim() || undefined,
      });
      
      if (response.success) {
        setHasReviewed(true);
        setRating(0);
        setReviewComment('');
        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
        });
        onContractUpdate?.();
      } else {
        // Handle API error response
        const errorMessage = response.error || response.message || "Failed to submit review. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.error('Review submission failed:', response);
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error?.message || error?.error || "Failed to submit review. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading contract...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No contract found.</p>
        </CardContent>
      </Card>
    );
  }

  // Handle deliverables as array or JSON string
  const deliverables = Array.isArray(contract.deliverables) 
    ? contract.deliverables 
    : (typeof contract.deliverables === 'string' ? JSON.parse(contract.deliverables || '[]') : []);
  const userRole = user?.id === contract.buyer.id ? 'BUYER' : 'STUDENT';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {contract.title}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={contract.status === 'COMPLETED' ? 'default' : 'secondary'}>
              {contract.status}
            </Badge>
            {contract.status === 'COMPLETED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={processing}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold">Total Price:</span>
              <span>${(contract.priceCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-semibold">Timeline:</span>
              <span>{contract.timeline} days</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Platform Fee (10%):</span>
              <span>${(contract.platformFeeCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Student Payout:</span>
              <span>${(contract.studentPayoutCents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold">Buyer:</span>
            </div>
            <p className="text-sm">{contract.buyer.name}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold">Student:</span>
            </div>
            <p className="text-sm">{contract.student.name}</p>
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <h4 className="font-semibold mb-2">Deliverables</h4>
          <ul className="list-disc list-inside space-y-1">
            {deliverables.map((deliverable: string, index: number) => (
              <li key={index} className="text-sm">{deliverable}</li>
            ))}
          </ul>
        </div>

        {/* Signatures Status */}
        <div>
          <h4 className="font-semibold mb-2">Signatures</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={contract.isSignedByBuyer ? 'default' : 'secondary'}>
                {contract.isSignedByBuyer ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                Buyer {contract.isSignedByBuyer ? 'Signed' : 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={contract.isSignedByStudent ? 'default' : 'secondary'}>
                {contract.isSignedByStudent ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                Student {contract.isSignedByStudent ? 'Signed' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <h4 className="font-semibold mb-2">Payment Status</h4>
          <Badge variant={contract.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
            <CreditCard className="h-3 w-3 mr-1" />
            {contract.paymentStatus}
          </Badge>
        </div>

        {/* Progress */}
        {contract.progressNotes && (
          <div>
            <h4 className="font-semibold mb-2">Latest Progress</h4>
            <p className="text-sm bg-muted p-3 rounded">{contract.progressNotes}</p>
          </div>
        )}

        {/* Actions based on user role and contract status */}
        <div className="space-y-4 border-t pt-4">
          {userRole === 'STUDENT' && (
            <>
              {!contract.isSignedByStudent && (
                <div>
                  <h4 className="font-semibold mb-2">Sign Contract</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Type your full name to sign"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                    />
                    <Button 
                      onClick={handleSignContract} 
                      disabled={!signature.trim() || processing}
                      className="w-full"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Sign Contract
                    </Button>
                  </div>
                </div>
              )}

              {contract.status === 'ACTIVE' && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Update Progress</h4>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe your progress..."
                        value={progressNotes}
                        onChange={(e) => setProgressNotes(e.target.value)}
                      />
                      <Button 
                        onClick={handleUpdateProgress} 
                        disabled={!progressNotes.trim() || processing}
                        className="w-full"
                      >
                        {processing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Update Progress
                      </Button>
                    </div>
                  </div>
                  
                  {contract.paymentStatus === 'PAID' && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-2">Complete Project</h4>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add completion notes (optional)..."
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                        />
                        <Button 
                          onClick={async () => {
                            if (!contract || !progressNotes.trim()) {
                              // Use a default progress note if empty
                              setProgressNotes('Project completed');
                            }
                            setMarkAsCompleted(true);
                            await handleUpdateProgress();
                          }}
                          disabled={processing}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Project Completed
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {userRole === 'BUYER' && (
            <>
              {!contract.isSignedByBuyer && (
                <div>
                  <h4 className="font-semibold mb-2">Sign Contract</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Type your full name to sign"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                    />
                    <Button 
                      onClick={handleSignContract} 
                      disabled={!signature.trim() || processing}
                      className="w-full"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Sign Contract
                    </Button>
                  </div>
                </div>
              )}

              {contract.isSignedByBuyer && 
               contract.isSignedByStudent && 
               contract.paymentStatus === 'PENDING' && (
                <Button 
                  onClick={handleProcessPayment} 
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Pay ${(contract.priceCents / 100).toFixed(2)} (Escrow)
                </Button>
              )}

              {contract.status === 'COMPLETED' && 
               !hasReviewed && (
                <div>
                  <h4 className="font-semibold mb-3">Rate Your Experience</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="mb-2 block">Rating *</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review-comment">Comment (Optional)</Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Share your experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitReview} 
                      disabled={rating === 0 || processing}
                      className="w-full"
                      size="lg"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Star className="h-4 w-4 mr-2" />
                      )}
                      Submit Review
                    </Button>
                  </div>
                </div>
              )}

              {hasReviewed && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      Thank you for your review!
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


