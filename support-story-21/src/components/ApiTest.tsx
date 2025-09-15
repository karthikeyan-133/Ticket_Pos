import { useEffect, useState } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        // Test the health endpoint
        const response = await axios.get('/api/health');
        
        setApiStatus('API is responding successfully!');
        setHealthData(response.data);
      } catch (error: any) {
        if (error.response) {
          // Server responded with error status
          setApiStatus(`API Error: ${error.response.status} - ${error.response.statusText}`);
          setHealthData(error.response.data);
        } else if (error.request) {
          // Request was made but no response received
          setApiStatus('Network Error: No response received from API');
        } else {
          // Something else happened
          setApiStatus(`Request Error: ${error.message}`);
        }
      }
    };

    testApiConnection();
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">API Connection Test</h3>
      <p className="mb-2">Status: {apiStatus}</p>
      
      {healthData && (
        <div className="mt-2 p-2 bg-muted rounded">
          <h4 className="font-medium">Response Data:</h4>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;