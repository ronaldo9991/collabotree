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
  Loader2
} from 'lucide-react';

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
  deliverables: string;
  progressNotes?: string;
  completionNotes?: string;
  buyer: { id: string; name: string; email: string };
  student: { id: string; name: string; email: string };
  service: { id: string; title: string; description: string };
  hireRequest: { id: string };
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
        setContract(response.data);
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

  const fetchContractByHireRequest = async () => {
    try {
      setLoading(true);
      // Get user contracts and find the one for this hire request
      const response = await api.getUserContracts();
      if (response.success) {
        const userContract = response.data.find((c: Contract) => c.hireRequest.id === hireRequestId);
        if (userContract) {
          setContract(userContract);
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

  // PDF download functionality temporarily disabled
  // const handleDownloadPDF = async () => { ... }

  const handleUpdateProgress = async () => {
    if (!contract || !progressNotes.trim()) return;

    try {
      setProcessing(true);
      const response = await api.updateProgress(contract.id, {
        status: 'IN_PROGRESS',
        notes: progressNotes.trim(),
      });
      if (response.success) {
        setContract(response.data);
        setProgressNotes('');
        toast({
          title: "Progress Updated",
          description: "Your progress has been updated successfully.",
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

  const handleMarkCompleted = async () => {
    if (!contract) return;

    try {
      setProcessing(true);
      const response = await api.markCompleted(contract.id, { 
        completionNotes: completionNotes.trim() 
      });
      if (response.success) {
        setContract(response.data);
        setCompletionNotes('');
        toast({
          title: "Contract Completed",
          description: "Payment has been released to the student.",
        });
        onContractUpdate?.();
      }
    } catch (error) {
      console.error('Error marking completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark as completed. Please try again.",
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

  const deliverables = JSON.parse(contract.deliverables || '[]');
  const userRole = user?.id === contract.buyerId ? 'BUYER' : 'STUDENT';
  
  // Determine available actions based on contract state
  const canSign = !contract.isSignedByBuyer || !contract.isSignedByStudent;
  const canPay = contract.isSignedByBuyer && contract.isSignedByStudent && contract.paymentStatus === 'PENDING';
  const canUpdateProgress = contract.status === 'ACTIVE' && contract.paymentStatus === 'PAID';
  const canComplete = contract.status === 'ACTIVE' && contract.progressStatus === 'IN_PROGRESS' && contract.paymentStatus === 'PAID';

  return (
    <Card className="w-full max-w-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-base sm:text-lg font-semibold truncate">{contract.title}</span>
          </div>
          <Badge variant={contract.status === 'COMPLETED' ? 'default' : 'secondary'} className="w-fit">
            {contract.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Contract Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Total Price:</span>
              </div>
              <span className="text-sm sm:text-base font-medium">${(contract.priceCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Timeline:</span>
              </div>
              <span className="text-sm sm:text-base">{contract.timeline} days</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-sm sm:text-base">Platform Fee (10%):</span>
              <span className="text-sm sm:text-base font-medium">${(contract.platformFeeCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-sm sm:text-base">Student Payout:</span>
              <span className="text-sm sm:text-base font-medium">${(contract.studentPayoutCents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">Buyer:</span>
            </div>
            <p className="text-sm sm:text-base pl-6 sm:pl-0">{contract.buyer.name}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">Student:</span>
            </div>
            <p className="text-sm sm:text-base pl-6 sm:pl-0">{contract.student.name}</p>
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <h4 className="font-semibold mb-3 text-sm sm:text-base">Deliverables</h4>
          <ul className="list-disc list-inside space-y-2 pl-2">
            {deliverables.map((deliverable: string, index: number) => (
              <li key={index} className="text-sm sm:text-base leading-relaxed">{deliverable}</li>
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

        {/* PDF Download - Temporarily Disabled */}
        {contract.isSignedByBuyer && contract.isSignedByStudent && (
          <div>
            <h4 className="font-semibold mb-2">Contract Document</h4>
            <Button 
              disabled={true}
              variant="outline"
              className="w-full opacity-50 cursor-not-allowed"
              title="PDF download feature is temporarily unavailable"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF Coming Soon
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              PDF download will be available in a future update
            </p>
          </div>
        )}

        {/* Progress */}
        {contract.progressNotes && (
          <div>
            <h4 className="font-semibold mb-2">Latest Progress</h4>
            <p className="text-sm bg-muted p-3 rounded">{contract.progressNotes}</p>
          </div>
        )}

        {/* Actions based on user role and contract status */}
        <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6">
          {userRole === 'STUDENT' && (
            <>
              {!contract.isSignedByStudent && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-3 text-sm sm:text-base text-blue-900 dark:text-blue-100">Sign Contract</h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Type your full name to sign"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                    <Button 
                      onClick={handleSignContract} 
                      disabled={!signature.trim() || processing}
                      className="w-full text-sm sm:text-base py-2 sm:py-3"
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

              {canUpdateProgress && (
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
              )}
            </>
          )}

          {userRole === 'BUYER' && (
            <>
              {!contract.isSignedByBuyer && (
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold mb-3 text-sm sm:text-base text-green-900 dark:text-green-100">Sign Contract</h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Type your full name to sign"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                    <Button 
                      onClick={handleSignContract} 
                      disabled={!signature.trim() || processing}
                      className="w-full text-sm sm:text-base py-2 sm:py-3"
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

              {canPay && (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold mb-3 text-sm sm:text-base text-yellow-900 dark:text-yellow-100">Escrow Payment</h4>
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mb-4 leading-relaxed">
                    Funds will be held in escrow until project completion
                  </p>
                  <Button 
                    onClick={handleProcessPayment} 
                    disabled={processing}
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
                    size="lg"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Pay ${(contract.priceCents / 100).toFixed(2)} (Escrow)
                  </Button>
                </div>
              )}

              {canComplete && (
                <div>
                  <h4 className="font-semibold mb-2">Mark as Completed</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Completing the contract will release payment to the student
                  </p>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add completion notes (optional)..."
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                    />
                    <Button 
                      onClick={handleMarkCompleted} 
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Mark Completed & Release Payment
                    </Button>
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


