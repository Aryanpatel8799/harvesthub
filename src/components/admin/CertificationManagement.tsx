import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Certification {
  _id: string;
  farmer: {
    name: string;
    email: string;
    phone: string;
  };
  certificateUrl: string;
  status: string;
  createdAt: string;
}

const CertificationManagement = () => {
  const { toast } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [status, setStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/certifications/pending`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certifications');
      }

      const data = await response.json();
      setCertifications(data);
    } catch (error) {
      console.error('Fetch certifications error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending certifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedCert) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/certifications/${selectedCert._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            status,
            ...(status === 'rejected' && { rejectionReason })
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update certification status');
      }

      toast({
        title: 'Success',
        description: 'Certification status updated successfully'
      });

      setShowDialog(false);
      fetchCertifications();
    } catch (error) {
      console.error('Update certification error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update certification status',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Certification Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map((cert) => (
          <Card key={cert._id} className="p-4 space-y-4">
            <div>
              <h3 className="font-medium">{cert.farmer.name}</h3>
              <p className="text-sm text-gray-500">{cert.farmer.email}</p>
              <p className="text-sm text-gray-500">{cert.farmer.phone}</p>
            </div>

            <div className="space-y-2">
              <img
                src={cert.certificateUrl}
                alt="Soil Certificate"
                className="w-full h-40 object-cover rounded"
              />
              <p className="text-sm text-gray-500">
                Submitted on: {new Date(cert.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setSelectedCert(cert);
                setShowDialog(true);
                setStatus('approved');
                setRejectionReason('');
              }}
            >
              Review Certificate
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Certification</DialogTitle>
            <DialogDescription>
              Update the status of this soil certification
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(value: 'approved' | 'rejected') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === 'rejected' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isSubmitting || (status === 'rejected' && !rejectionReason.trim())}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificationManagement; 