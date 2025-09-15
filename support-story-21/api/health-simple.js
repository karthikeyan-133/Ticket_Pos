// Simple health endpoint for Vercel
export default async function handler(req, res) {
  return res.status(200).json({ 
    message: 'Health check endpoint working!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
}