// Simple test endpoint for Vercel
export default async function handler(req, res) {
  // Simple test endpoint
  if (req.url === '/api/test' || req.url === '/test') {
    return res.status(200).json({ 
      message: 'Simple test endpoint working!',
      timestamp: new Date().toISOString(),
      url: req.url
    });
  }
  
  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    return res.status(200).json({ 
      message: 'Health check endpoint working!',
      timestamp: new Date().toISOString(),
      url: req.url
    });
  }
  
  // Default response
  return res.status(404).json({ 
    error: 'Endpoint not found',
    url: req.url 
  });
}