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

interface SoilComponent {
  name: string;
  value: number;
  unit: string;
  isNatural: boolean;
}

interface Certification {
  _id: string;
  farmer: {
    fullName: string;
    email: string;
    phone?: string;
  };
  farmName: string;
  certificateFile: string;
  components: SoilComponent[];
  status: string;
  createdAt: string;
  rejectionReason?: string;
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
      setLoading(true);
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/soil/certifications/pending`;
      console.log('Fetching certifications from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()].reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {}));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Received certifications data:', data);

      if (!Array.isArray(data)) {
        console.error('Expected array of certifications but got:', typeof data);
        throw new Error('Invalid data format received from server');
      }

      setCertifications(data);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch pending certifications',
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
      console.log('Updating certification status:', {
        certificationId: selectedCert._id,
        status,
        rejectionReason
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/soil/certifications/${selectedCert._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            rejectionReason: status === 'rejected' ? rejectionReason : '',
          }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Status update error:', response.status, errorData);
        throw new Error(`Failed to update status: ${response.status}`);
      }

      toast({
        title: 'Success',
        description: `Certification ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      // Refresh the list
      fetchCertifications();
      setShowDialog(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update certification status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatComponentValue = (components: SoilComponent[], type: string) => {
    const component = components.find(c => c.name.toLowerCase().includes(type.toLowerCase()));
    if (!component) return 'N/A';
    return `${component.value} ${component.unit}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Certification Management</h1>

      {certifications && certifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <Card key={cert._id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-medium mb-1">
                    {cert.farmName}
                  </h3>
                  <p className="text-gray-500 mb-1">{cert.farmer?.email || 'No email'}</p>
                  <p className="text-gray-500 mb-4">
                    {cert.farmer?.phone ? `Phone: ${cert.farmer.phone}` : 'No phone provided'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm">
                        <span className="font-medium">Soil Type:</span><br/>
                        {formatComponentValue(cert.components, 'soil type')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">pH Level:</span><br/>
                        {formatComponentValue(cert.components, 'ph')}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <p className="text-sm">
                        <span className="font-medium">N:</span><br/>
                        {formatComponentValue(cert.components, 'nitrogen')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">P:</span><br/>
                        {formatComponentValue(cert.components, 'phosphorus')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">K:</span><br/>
                        {formatComponentValue(cert.components, 'potassium')}
                      </p>
                    </div>
                  </div>
                  
                  {cert.certificateFile && (
                    <div className="mb-4 border rounded overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/certificates/${cert.certificateFile}`}
                        alt="Soil Certificate"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(cert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="p-4 pt-0">
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl font-medium text-gray-600">No pending certifications found</p>
          <p className="text-gray-500 mt-2">All certifications have been reviewed</p>
        </div>
      )}

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