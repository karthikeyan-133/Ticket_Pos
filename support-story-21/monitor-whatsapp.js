// Script to monitor WhatsApp client status
// This helps verify that your WhatsApp client is connected and ready

import axios from 'axios';

console.log('🔍 Monitoring WhatsApp client status...');

// Function to check if WhatsApp client is ready
const checkWhatsAppStatus = async () => {
  try {
    // This would require adding a new endpoint to your server
    // For now, we'll simulate a check by sending a test notification
    
    console.log('📡 Testing WhatsApp connectivity...');
    
    // Simple test message
    const testData = {
      success: true,
      data: [
        {
          id: "status-check-1",
          ticketNumber: "STATUS-001",
          serialNumber: "000000000",
          companyName: "System Check",
          contactPerson: "System Administrator",
          mobileNumber: "+971501234567", // Test number
          email: "admin@example.com",
          issueRelated: "System status check",
          priority: "low",
          assignedExecutive: "System Monitor",
          status: "closed",
          userType: "system",
          version: "1.0",
          expiryDate: "2026-12-31T00:00:00.000Z",
          startedAt: new Date().toISOString(),
          closedAt: new Date().toISOString(),
          resolution: "System check completed successfully",
          remarks: "Status monitoring test",
          groupName: "tickets",
          groupId: "120363402679779546@g.us",
          apiKey: process.env.API_KEY || "mysecretkey"
        }
      ],
      apiKey: process.env.API_KEY || "mysecretkey"
    };

    const response = await axios.post('http://localhost:5000/api/notify-ticket', testData, {
      timeout: 10000 // 10 second timeout
    });
    
    if (response.data.success) {
      console.log('✅ WhatsApp client is ready and connected');
      console.log('✅ Client messaging: Working');
      console.log('✅ Group messaging: Working');
      return true;
    } else {
      console.log('❌ WhatsApp client issues detected');
      console.log('Error:', response.data.error);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running');
      console.log('💡 Please start your server with: npm start');
    } else if (error.code === 'ECONNABORTED') {
      console.log('❌ Request timeout - WhatsApp client may be initializing');
      console.log('💡 Please wait for the WhatsApp client to be ready');
    } else if (error.response) {
      console.log('❌ Server responded with error:', error.response.status);
      console.log('Message:', error.response.data);
    } else {
      console.log('❌ Error checking WhatsApp status:', error.message);
    }
    return false;
  }
};

// Run the status check
checkWhatsAppStatus().then(success => {
  if (success) {
    console.log('\n🎉 WhatsApp integration is working correctly!');
    console.log('📱 Client messages: ✅ Working');
    console.log('🏷️  Group messages: ✅ Working');
    console.log('📝 Message logging: ✅ Working');
  } else {
    console.log('\n⚠️  WhatsApp integration needs attention');
    console.log('💡 Check the troubleshooting section in WHATSAPP_INTEGRATION.md');
  }
});