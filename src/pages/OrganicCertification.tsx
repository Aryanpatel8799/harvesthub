import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base URL and default configs
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

interface SoilReport {
  _id: string;
  farmName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  certificateFile?: string;
  components: {
    name: string;
    value: number;
    unit: string;
    isNatural: boolean;
  }[];
}

interface FormData {
  farmName: string;
  components: {
    name: string;
    value: number;
    unit: string;
    isNatural: boolean;
  }[];
  certificateFile: File | null;
}

const OrganicCertification = () => {
  const [reports, setReports] = useState<SoilReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    farmName: '',
    components: [
      { name: 'Organic Matter', value: 0, unit: '%', isNatural: true },
      { name: 'Nitrogen', value: 0, unit: '%', isNatural: true },
      { name: 'Phosphorus', value: 0, unit: 'mg/kg', isNatural: true },
      { name: 'Potassium', value: 0, unit: 'mg/kg', isNatural: true },
      { name: 'pH', value: 0, unit: 'pH', isNatural: true }
    ],
    certificateFile: null
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/soil/certifications/farmer');
      setReports(response.data);
    } catch (error) {
      console.error('Fetch reports error:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    const updatedComponents = [...formData.components];
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: field === 'value' ? parseFloat(value) : value
    };
    
    setFormData({
      ...formData,
      components: updatedComponents
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        certificateFile: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.certificateFile) {
      toast.error('Please upload a certificate');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData object
      const data = new FormData();
      data.append('farmName', formData.farmName);
      
      // Convert components array to string and append
      const componentsData = formData.components.map(comp => ({
        ...comp,
        value: parseFloat(comp.value.toString()) // Ensure value is a number
      }));
      data.append('components', JSON.stringify(componentsData));
      
      // Append file with the correct field name
      if (formData.certificateFile) {
        data.append('certificateFile', formData.certificateFile);
      }

      // Log the request data for debugging
      console.log('Submitting certification with data:', {
        farmName: formData.farmName,
        components: componentsData,
        fileName: formData.certificateFile?.name
      });

      const response = await api.post('/api/soil/certifications/submit', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Submit response:', response.data);

      toast.success('Certification submitted successfully');
      setShowUploadModal(false);
      
      // Reset form
      setFormData({
        farmName: '',
        components: [
          { name: 'Organic Matter', value: 0, unit: '%', isNatural: true },
          { name: 'Nitrogen', value: 0, unit: '%', isNatural: true },
          { name: 'Phosphorus', value: 0, unit: 'mg/kg', isNatural: true },
          { name: 'Potassium', value: 0, unit: 'mg/kg', isNatural: true },
          { name: 'pH', value: 0, unit: 'pH', isNatural: true }
        ],
        certificateFile: null
      });
      
      // Refresh the reports list
      await fetchReports();
      
    } catch (error) {
      console.error('Submit error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to submit certification';
        console.error('Server response:', error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error('Failed to submit certification');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const checkNaturalComponents = (components: SoilReport['components']) => {
    return components.every(comp => comp.isNatural);
  };

  // Function to test connectivity to the soil-certifications endpoint
  const testCertificationsEndpoint = async () => {
    try {
      console.log('Testing soil certifications debug endpoint...');
      const response = await api.get('/api/farmer/soil-certifications/debug');
      console.log('Debug endpoint response:', response.data);
      toast.success('API debug endpoint is working!');
    } catch (error) {
      console.error('Debug endpoint error:', error);
      toast.error('Failed to connect to debug endpoint');
    }
  };

  // Test upload function to isolate and debug the upload process
  const testUpload = async () => {
    if (!formData.certificateFile) {
      toast.error('Please select a file to test upload');
      return;
    }

    try {
      console.log('Testing file upload with:', formData.certificateFile.name);
      
      const data = new FormData();
      data.append('farmName', 'Test Farm');
      data.append('components', JSON.stringify([{ name: 'Test', value: 1, unit: '%', isNatural: true }]));
      data.append('certificate', formData.certificateFile);
      
      console.log('FormData keys for test:');
      for (const pair of data.entries()) {
        console.log(`- ${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
      }
      
      const response = await api.post('/api/farmer/soil-certifications/test-upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Test upload response:', response.data);
      toast.success('Test upload successful! Check console for details');
      
    } catch (error) {
      console.error('Test upload error:', error);
      toast.error('Test upload failed. See console for details.');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Organic Certification</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and review soil reports for organic certification</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-full sm:w-auto bg-harvest-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-harvest-700 transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            Upload Soil Report
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8 sm:py-10">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-harvest-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading reports...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div className="text-center py-8 sm:py-10 bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
          <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Reports Yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">You haven't submitted any soil reports for certification</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-full sm:w-auto bg-harvest-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-harvest-700 transition-colors"
          >
            Submit Your First Report
          </button>
        </div>
      )}

      {/* Reports Grid */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {reports.map((report) => (
            <div key={report._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{report.farmName}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Report ID: {report._id}</p>
                </div>
                <span className={`w-fit px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 ${
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status === 'pending' ? <Clock className="h-3 w-3 sm:h-4 sm:w-4" /> :
                  report.status === 'approved' ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> :
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>

              {report.status === 'rejected' && report.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-md mb-4 border border-red-100">
                  <h4 className="font-medium text-red-800 flex items-center gap-1 text-sm">
                    <AlertCircle className="h-4 w-4" /> Rejection Reason:
                  </h4>
                  <p className="text-red-700 text-xs sm:text-sm mt-1">{report.rejectionReason}</p>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Date: {new Date(report.date).toLocaleDateString()}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 sm:pt-4">
                  <h4 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Soil Components</h4>
                  <div className="space-y-2">
                    {report.components.map((comp, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{comp.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800">{comp.value} {comp.unit}</span>
                          {comp.isNatural ? (
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 sm:pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-800">Natural Components:</span>
                    <span className={`${
                      checkNaturalComponents(report.components) 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {checkNaturalComponents(report.components) ? 'All Natural' : 'Contains Synthetic Components'}
                    </span>
                  </div>
                </div>

                {report.certificateFile && (
                  <div className="border-t border-gray-100 pt-3 sm:pt-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-harvest-600" />
                      <a 
                        href={`${api.defaults.baseURL}/uploads/certificates/${report.certificateFile}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-harvest-600 hover:text-harvest-700 underline"
                      >
                        View Certificate
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2">
                <button className="flex-1 bg-harvest-600 text-white px-4 py-2 rounded-lg hover:bg-harvest-700 transition-colors text-sm">
                  View Details
                </button>
                {report.certificateFile && (
                  <a 
                    href={`${api.defaults.baseURL}/uploads/certificates/${report.certificateFile}`}
                    download
                    className="flex-1 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Submit Soil Report</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Farm Name</label>
                <input
                  type="text"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvest-500 text-sm"
                  required
                />
              </div>
              
              <div>
                <h3 className="text-gray-700 text-sm font-medium mb-2">Soil Components</h3>
                {formData.components.map((component, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
                    <span className="w-full sm:w-1/3 text-sm text-gray-600">{component.name}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={component.value}
                      onChange={(e) => handleComponentChange(index, 'value', e.target.value)}
                      className="w-full sm:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvest-500 text-sm"
                      required
                    />
                    <span className="w-full sm:w-1/4 text-sm text-gray-600">{component.unit}</span>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Upload Certificate</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="certificate-file"
                    required
                  />
                  <label 
                    htmlFor="certificate-file" 
                    className="cursor-pointer block text-center"
                  >
                    {formData.certificateFile ? (
                      <div className="text-harvest-600">
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                        <p className="text-sm">{formData.certificateFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData.certificateFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload your certificate</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-harvest-600 text-white rounded-lg hover:bg-harvest-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Submit Report</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganicCertification;
