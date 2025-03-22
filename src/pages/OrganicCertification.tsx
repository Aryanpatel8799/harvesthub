import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Upload, AlertCircle } from 'lucide-react';

interface SoilReport {
  id: string;
  farmName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  components: {
    name: string;
    value: number;
    unit: string;
    isNatural: boolean;
  }[];
}

const OrganicCertification = () => {
  const [reports, setReports] = useState<SoilReport[]>([
    {
      id: 'SR001',
      farmName: 'Green Valley Farm',
      date: '2024-03-15',
      status: 'pending',
      components: [
        { name: 'Organic Matter', value: 3.5, unit: '%', isNatural: true },
        { name: 'Nitrogen', value: 0.25, unit: '%', isNatural: true },
        { name: 'Phosphorus', value: 15, unit: 'mg/kg', isNatural: true },
        { name: 'Potassium', value: 180, unit: 'mg/kg', isNatural: true },
        { name: 'pH', value: 6.5, unit: '', isNatural: true }
      ]
    },
    {
      id: 'SR002',
      farmName: 'Sunrise Farm',
      date: '2024-03-14',
      status: 'approved',
      components: [
        { name: 'Organic Matter', value: 4.2, unit: '%', isNatural: true },
        { name: 'Nitrogen', value: 0.28, unit: '%', isNatural: true },
        { name: 'Phosphorus', value: 18, unit: 'mg/kg', isNatural: true },
        { name: 'Potassium', value: 220, unit: 'mg/kg', isNatural: true },
        { name: 'pH', value: 6.8, unit: '', isNatural: true }
      ]
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);

  const checkNaturalComponents = (components: SoilReport['components']) => {
    return components.every(comp => comp.isNatural);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Organic Certification</h1>
          <p className="text-gray-600">Manage and review soil reports for organic certification</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-harvest-600 text-white px-6 py-2 rounded-lg hover:bg-harvest-700 transition-colors flex items-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Upload Soil Report
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{report.farmName}</h3>
                <p className="text-sm text-gray-500">Report ID: {report.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {report.status === 'pending' ? <Clock className="h-4 w-4" /> :
                 report.status === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                 <XCircle className="h-4 w-4" />}
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="h-5 w-5" />
                <span>Date: {report.date}</span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Soil Components</h4>
                <div className="space-y-2">
                  {report.components.map((comp, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{comp.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800">{comp.value} {comp.unit}</span>
                        {comp.isNatural ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
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
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 bg-harvest-600 text-white px-4 py-2 rounded-lg hover:bg-harvest-700 transition-colors">
                Review Report
              </button>
              <button className="flex-1 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Soil Report</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Drag and drop your soil report file here</p>
                <p className="text-sm text-gray-500 mt-2">or</p>
                <button className="mt-2 bg-harvest-600 text-white px-4 py-2 rounded-lg hover:bg-harvest-700 transition-colors">
                  Browse Files
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-harvest-600 text-white rounded-lg hover:bg-harvest-700 transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganicCertification;
