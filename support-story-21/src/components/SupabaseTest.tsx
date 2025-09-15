import { useEffect, useState } from 'react';
import { ticketAPI } from '@/services/api';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        // Test connection by fetching tickets through the API
        const data = await ticketAPI.getAll();
        
        setConnectionStatus('Connected successfully to Supabase through API!');
        setTickets(Array.isArray(data) ? data : []);
      } catch (error: any) {
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    testSupabaseConnection();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      <p className="mb-2">Status: {connectionStatus}</p>
      {tickets.length > 0 && (
        <p className="mb-2">Successfully retrieved {tickets.length} ticket(s) from Supabase</p>
      )}
    </div>
  );
};

export default SupabaseTest;