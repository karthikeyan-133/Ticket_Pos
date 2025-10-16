// Test script for Vercel WhatsApp API endpoint
// This script demonstrates how the WhatsApp API works on Vercel

console.log('🔍 Testing Vercel WhatsApp API endpoint...\n');

// Mock ticket data similar to what would be sent to the API
const mockTicketData = {
  success: true,
  data: [
    {
      id: "test-1",
      ticket_number: "TEST-001",
      serial_number: "123456789",
      company_name: "Test Company",
      contact_person: "Test Contact",
      mobile_number: "+971501234567",
      email: "test@example.com",
      issue_related: "Testing",
      priority: "medium",
      assigned_executive: "Test Executive",
      status: "closed",
      user_type: "single user",
      version: "1.0",
      expiry_date: "2026-12-31",
      started_at: "2025-10-16T10:00:00Z",
      closed_at: "2025-10-16T10:30:00Z",
      resolution: "Test resolution for Vercel deployment",
      remarks: "Testing Vercel WhatsApp API functionality",
      group_name: "tickets",
      group_id: "120363402679779546@g.us",
      api_key: process.env.API_KEY || "test-api-key"
    }
  ],
  api_key: process.env.API_KEY || "test-api-key"
};

console.log('📋 Mock ticket data for testing:');
console.log(JSON.stringify(mockTicketData, null, 2));

// Simulate the Vercel API processing
const simulateVercelApiProcessing = (ticketData) => {
  console.log('\n🔄 Simulating Vercel API processing...\n');
  
  const results = [];
  
  for (const ticketItem of ticketData.data) {
    // Format phone number
    const formatWhatsAppNumber = (number) => {
      let cleanNumber = number.replace(/\D/g, '');
      if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
        cleanNumber = `971${cleanNumber.substring(1)}`;
      } else if (cleanNumber.length === 9 && cleanNumber.startsWith('5')) {
        cleanNumber = `971${cleanNumber}`;
      } else if (cleanNumber.length === 10) {
        cleanNumber = `971${cleanNumber}`;
      }
      return cleanNumber;
    };
    
    const phoneNumber = formatWhatsAppNumber(ticketItem.mobile_number);
    const contactPerson = ticketItem.contact_person || 'Customer';
    const ticketNumber = ticketItem.ticket_number || 'N/A';
    const resolution = ticketItem.resolution || 'No resolution details provided.';
    
    // Generate client message
    const clientMessage = `Hello ${contactPerson}, Your support ticket ${ticketNumber} has been resolved. Resolution Details: ${resolution} Thank you for your patience! Techzon Support Team`;
    const encodedClientMessage = encodeURIComponent(clientMessage);
    const clientUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedClientMessage}`;
    
    // Generate group message
    const groupMessage = `
*Ticket Resolved Notification*
============================
Company name  : ${ticketItem.company_name || 'N/A'}
Serial No: ${ticketItem.serial_number || 'N/A'}
Version : ${ticketItem.version || 'N/A'}
Expiry: ${ticketItem.expiry_date ? new Date(ticketItem.expiry_date).toLocaleDateString('en-GB') : 'N/A'}
Contact Person: ${ticketItem.contact_person || 'N/A'}
Contact Number: ${ticketItem.mobile_number || 'N/A'}
Support: ${ticketItem.issue_related || 'N/A'}
Start: ${ticketItem.started_at ? new Date(ticketItem.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Completed: ${ticketItem.closed_at ? new Date(ticketItem.closed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Resolution: ${ticketItem.resolution || 'No resolution details provided.'}
Assigned Executive: ${ticketItem.assigned_executive || 'N/A'}
Priority: ${ticketItem.priority || 'N/A'}
User Type: ${ticketItem.user_type || 'N/A'}
Ticket Number: ${ticketItem.ticket_number || 'N/A'}
Email: ${ticketItem.email || 'N/A'}
Remarks: ${ticketItem.remarks || 'N/A'}
Completed At: ${ticketItem.closed_at ? new Date(ticketItem.closed_at).toLocaleString('en-GB') : 'N/A'}
    `.trim();
    
    results.push({
      ticketId: ticketItem.id,
      ticketNumber: ticketItem.ticket_number || 'N/A',
      clientMessage: {
        success: true,
        url: clientUrl,
        message: clientMessage,
        phoneNumber: phoneNumber
      },
      groupMessage: {
        success: true,
        message: groupMessage,
        note: 'For Vercel deployment, please manually send this message to your WhatsApp group',
        instructions: 'Copy the message above and send it to your WhatsApp group named "' + (ticketItem.group_name || ticketItem.group_id) + '"'
      }
    });
  }
  
  return {
    success: true,
    message: 'WhatsApp URLs generated successfully',
    results
  };
};

// Process the mock data
const apiResponse = simulateVercelApiProcessing(mockTicketData);

console.log('✅ Vercel API Response:');
console.log(JSON.stringify(apiResponse, null, 2));

// Show how to use the generated URLs
console.log('\n📱 How to use the generated URLs:');
console.log('================================');

apiResponse.results.forEach((result, index) => {
  console.log(`\n📝 Result ${index + 1}:`);
  console.log(`   Ticket: ${result.ticketNumber}`);
  console.log(`   Client URL: ${result.clientMessage.url}`);
  console.log(`   Client Message: ${result.clientMessage.message.substring(0, 50)}...`);
  console.log(`   Group Message: ${result.groupMessage.message.substring(0, 50)}...`);
  console.log(`   Group Instructions: ${result.groupMessage.instructions}`);
});

console.log('\n💡 Important Notes:');
console.log('===================');
console.log('1. This is the CORRECT behavior for Vercel deployment');
console.log('2. WhatsApp Web cannot run on Vercel due to serverless constraints');
console.log('3. The system generates URLs for manual sending instead');
console.log('4. For automated WhatsApp messaging on Vercel, use WhatsApp Business API');

console.log('\n🚀 To test with your actual Vercel deployment:');
console.log('   1. Make a POST request to your Vercel API endpoint');
console.log('   2. Use the same data structure as shown above');
console.log('   3. Include your API key in the request body or headers');
console.log('   4. The API will return URLs for manual sending');