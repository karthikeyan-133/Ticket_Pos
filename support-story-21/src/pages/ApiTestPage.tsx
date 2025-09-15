import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../services/api';

const ApiTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test getting all tickets
      const tickets = await ticketAPI.getAll();
      setTestResult({
        success: true,
        data: tickets,
        message: 'Successfully connected to API'
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect to API');
      setTestResult({
        success: false,
        error: err.message,
        message: 'Failed to connect to API'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={testApiConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {testResult && (
        <div className={`border px-4 py-3 rounded mb-4 ${testResult.success ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
          <strong>{testResult.message}</strong>
          <pre className="mt-2 text-xs overflow-auto max-h-60">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestPage;