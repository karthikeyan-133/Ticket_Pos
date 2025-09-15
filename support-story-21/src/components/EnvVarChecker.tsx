import { useEffect, useState } from 'react';

const EnvVarChecker = () => {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Note: We can only access VITE_ prefixed environment variables in the frontend
      const frontendEnvVars = {
        'VITE_API_URL': import.meta.env.VITE_API_URL || 'Not set',
        'NODE_ENV': import.meta.env.NODE_ENV || 'Not set',
        'PROD': import.meta.env.PROD ? 'true' : 'false',
        'DEV': import.meta.env.DEV ? 'true' : 'false'
      };
      
      setEnvVars(frontendEnvVars);
    }
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Frontend Environment Variables</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="border p-2 rounded">
            <span className="font-mono text-sm">{key}:</span>
            <span className="font-mono text-sm ml-2 text-blue-600">{value}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Note: Only VITE_ prefixed variables are available to the frontend for security reasons.
      </p>
    </div>
  );
};

export default EnvVarChecker;