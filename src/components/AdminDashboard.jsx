import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminDashboard Component
 *
 * Dashboard for institute admins to manage users and upload data.
 * Fetches institute data from localStorage and displays user management interface.
 *
 * Features:
 * - Display institute information from localStorage
 * - Upload Excel files (.xlsx only)
 * - View users table with empty state
 * - Mock file upload functionality
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State management
  const [instituteData, setInstituteData] = useState(null);
  const [users, setUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  /**
   * Load institute data from localStorage on component mount
   */
  useEffect(() => {
    const storedData = localStorage.getItem('edginiInstituteData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setInstituteData(parsedData);
      } catch (error) {
        console.error('Error parsing institute data:', error);
      }
    } else {
      // If no institute data found, redirect to onboarding
      navigate('/institute-onboarding');
    }
  }, [navigate]);

  /**
   * Handles file selection and validates file type
   * @param {Event} e - File input change event
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (.xlsx only)
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    const isValidType = validTypes.includes(file.type) || file.name.endsWith('.xlsx');

    if (!isValidType) {
      setUploadMessage({
        type: 'error',
        text: 'Invalid file type. Please upload an Excel file (.xlsx)'
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setUploadMessage({ type: '', text: '' });
  };

  /**
   * Generates mock user data for demonstration
   * @returns {Array} - Array of mock user objects
   */
  const generateMockUsers = () => {
    const roles = ['Teacher', 'Student', 'Staff', 'Admin'];
    const statuses = ['Active', 'Pending', 'Inactive'];
    const mockNames = [
      'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis',
      'Michael Brown', 'Sarah Wilson', 'David Martinez', 'Lisa Anderson',
      'James Taylor', 'Maria Garcia'
    ];

    return mockNames.map((name, index) => ({
      id: Date.now() + index,
      name: name,
      email: `${name.toLowerCase().replace(' ', '.')}@${instituteData?.instituteName?.toLowerCase().replace(/\s+/g, '') || 'school'}.edu`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }));
  };

  /**
   * Handles file upload with mock API integration
   */
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadMessage({
        type: 'error',
        text: 'Please select a file to upload'
      });
      return;
    }

    setIsUploading(true);
    setUploadMessage({ type: '', text: '' });

    try {
      // Mock API call - simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate and add mock users
      const newUsers = generateMockUsers();
      setUsers(prevUsers => [...prevUsers, ...newUsers]);

      setUploadMessage({
        type: 'success',
        text: 'Upload successful! Users will appear in your dashboard shortly.'
      });

      // Clear selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show toast notification (optional - can be enhanced)
      setTimeout(() => {
        setUploadMessage({ type: '', text: '' });
      }, 5000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage({
        type: 'error',
        text: 'Upload failed. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Triggers file input click
   */
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!instituteData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and School Name */}
            <div className="flex items-center">
              <img src="/assets/EdGini_TM_Logo_Blue_BG_remove.png" alt="EdGini Logo" className="h-10 mr-4" />
              <span className="text-white font-semibold text-lg">
                {instituteData.instituteName}
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === 'dashboard'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === 'upload'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
              >
                Upload Data
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {instituteData.instituteName} Admin!
          </h1>
          <p className="text-gray-600">
            Manage your institute users and upload data from this dashboard.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Type:</span>{' '}
              <span className="text-gray-600">{instituteData.instituteType}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Email:</span>{' '}
              <span className="text-gray-600">{instituteData.email}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Contact:</span>{' '}
              <span className="text-gray-600">{instituteData.contactNumber}</span>
            </div>
          </div>
        </div>

        {/* Upload Users Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">📤 Upload Users via Excel</h2>
              <p className="text-gray-600 text-sm mt-1">
                Upload your users to onboard them into the system.
              </p>
            </div>
          </div>

          {/* Upload Message */}
          {uploadMessage.text && (
            <div className={`mb-4 p-3 rounded-lg ${
              uploadMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {uploadMessage.text}
            </div>
          )}

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {selectedFile ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Selected file:</p>
                <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Click browse to select an Excel file (.xlsx)
              </p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleBrowseClick}
                disabled={isUploading}
                className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Browse Files
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                  !selectedFile || isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload Excel File'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Users Overview Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">👥 Users Overview</h2>
            {users.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {users.length} Users
              </span>
            )}
          </div>

          {users.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found yet.</h3>
              <p className="text-gray-600 mb-4">
                Upload an Excel file to add users to your institute.
              </p>
            </div>
          ) : (
            // Users Table
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
