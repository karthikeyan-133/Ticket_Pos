# WhatsApp Web Automation Integration

This document explains how to set up and use the WhatsApp Web automation feature for the ticket system.

## Features

1. Automatically sends thank-you messages to clients when tickets are closed
2. Sends comprehensive ticket details to a WhatsApp group for team notifications
3. Uses persistent sessions to avoid repeated QR code scanning
4. Logs all messages sent to a JSON file
5. Supports both group names and group IDs for more reliable messaging

## Setup Instructions

### 1. Install Dependencies

Navigate to the server directory and install the required packages:

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
API_KEY=mysecretkey
```

### 3. First-Time Setup

1. Start the server:
   ```bash
   npm start
   ```

2. Scan the QR code displayed in the terminal with your WhatsApp mobile app

3. The session will be saved for future use

### 4. Create WhatsApp Group

Follow the instructions in [WHATSAPP_GROUP_SETUP.md](WHATSAPP_GROUP_SETUP.md) to create and configure your "tickets" group.

## API Endpoint

### `/api/notify-ticket` (POST)

Processes closed tickets and sends WhatsApp notifications.

#### Request Body

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "ticketNumber": "TICKET/2025/1001",
      "serialNumber": "719074656",
      "companyName": "Mezotic Garments",
      "contactPerson": "Accountant",
      "mobileNumber": "0565157841",
      "email": "accountant@mezotic.com",
      "issueRelated": "entry passed wrongly",
      "priority": "medium",
      "assignedExecutive": "John Smith",
      "status": "closed",
      "userType": "single user",
      "version": "5.1",
      "expiryDate": "2026-05-31T00:00:00.000Z",
      "startedAt": "2025-10-16T10:08:00.000Z",
      "closedAt": "2025-10-16T10:34:00.000Z",
      "resolution": "Corrected the entry and verified all related data",
      "remarks": "Client confirmed the issue is resolved",
      "groupName": "tickets",
      "groupId": "120363402679779546@g.us",
      "apiKey": "mysecretkey"
    }
  ],
  "apiKey": "mysecretkey"
}
```

#### Response

```json
{
  "success": true,
  "message": "Notifications processed",
  "results": [
    {
      "ticketId": "1",
      "ticketNumber": "TICKET/2025/1001",
      "clientMessage": {
        "success": true,
        "result": { /* WhatsApp message result */ }
      },
      "groupMessage": {
        "success": true,
        "result": { /* WhatsApp message result */ }
      }
    }
  ]
}
```

**Note**: If both `groupName` and `groupId` are provided, the system will use the `groupId` for more reliable messaging.

## Message Formats

### Client Thank-You Message

```
Hello [Contact Person], Your support ticket [Ticket Number] has been resolved. Resolution Details: [Resolution Details] Thank you for your patience! Techzon Support Team
```

### Support Group Notification (Enhanced Format)

```
*Ticket Resolved Notification*
============================
Company name  : [Company Name]
Serial No: [Serial Number]
Version : [Version]
Expiry: [Expiry Date]
Contact Person: [Contact Person]
Contact Number: [Contact Number]
Support: [Issue Type]
Start: [Start Time]
Completed: [Completed Time]
Resolution: [Resolution Details]
Assigned Executive: [Assigned Executive]
Priority: [Priority]
User Type: [User Type]
Ticket Number: [Ticket Number]
Email: [Email]
Remarks: [Remarks]
Completed At: [Completed Date and Time]
```

## Testing

Use the sample request file to test the endpoint:

```bash
node sample-request.js
```

Or test the enhanced group notification format:

```bash
node test-group-notification.js
```

To specifically test group messaging:

```bash
node test-group-messaging.js
```

To test with your specific group ID:

```bash
node test-specific-group.js
```

To test comprehensive notifications (both client and group):

```bash
node test-comprehensive.js
```

To list all available WhatsApp groups:

```bash
node list-whatsapp-groups.js
```

To clear WhatsApp session data (use when resetting connection):

```bash
node clear-whatsapp-data.js
```

To monitor WhatsApp client status:

```bash
node monitor-whatsapp.js
```

To test email configuration:

```bash
node test-email.js
```

## Logs

All messages are logged to `server/logs/messages.json` with the following format:

```json
[
  {
    "to": "[Recipient]",
    "message": "[Message Content]",
    "timestamp": "2025-10-07T10:30:00.000Z",
    "success": true,
    "messageId": "[WhatsApp Message ID]"
  }
]
```

## Troubleshooting

### Common Issues and Solutions

1. **QR Code Not Showing**: 
   - Ensure the server is running and you're viewing the terminal output
   - Check if the WhatsApp session was corrupted and needs to be reset

2. **Messages Not Sending**: 
   - Check that your WhatsApp is connected and the recipient numbers are correct
   - Verify the WhatsApp client is ready before sending messages
   - Restart the server if the session has been disconnected

3. **Group Not Found**: 
   - Verify the group name matches exactly (case-sensitive)
   - Ensure you are a member of the group
   - Check that the group exists and is visible to your WhatsApp client
   - Use `node list-whatsapp-groups.js` to see available groups
   - Make sure the group has recent activity (send a message in the group)

4. **Session Issues**: 
   - Delete the `.wwebjs_auth` folder to reset authentication
   - Run `node clear-whatsapp-data.js` to completely clear all WhatsApp data
   - Run `node restart-whatsapp.js` to clear the session and restart

5. **SSL/TLS Issues with Email**:
   - The system now includes fallback configurations for older SMTP servers
   - If email still fails, check your SMTP credentials and server settings

6. **WhatsApp Session Closed**:
   - The system now includes automatic reinitialization
   - If reinitialization fails, manually restart the server

7. **Execution Context Destroyed**:
   - This error occurs when there are network instabilities or version conflicts
   - Run `node clear-whatsapp-data.js` to clear cache and session data
   - Restart the server to use a fresh WhatsApp Web instance

8. **File Locking Issues (Windows)**:
   - Common on Windows due to file handle management
   - Run `node clear-whatsapp-data.js` to force cleanup
   - The system now includes retry logic for locked files
   - Chrome processes are automatically terminated during cleanup

### Group Messaging Specific Issues

1. **Group Not Found Error**:
   - The system now lists all available groups when the client is ready
   - Check the server console for "Available WhatsApp groups:" output
   - Make sure the `groupName` in your request matches exactly
   - Case sensitivity matters - "tickets" is different from "Tickets"
   - Spaces and special characters must match exactly

2. **Partial Group Name Matching**:
   - The system now supports partial matching for group names
   - If an exact match isn't found, it will look for partial matches
   - The system will log what groups are available for easier troubleshooting

3. **Group Visibility Issues**:
   - Make sure your WhatsApp account is still a member of the group
   - Groups may not appear if they have no recent activity
   - Try sending a manual message in the group to make it active
   - Restart the server to refresh the group list

4. **Using Group IDs for Reliability**:
   - Group IDs are more reliable than group names
   - Find your group ID in the server console output after connection
   - Include the `groupId` field in your API requests for better reliability
   - Your specific group ID is: `120363402679779546@g.us`

### Resetting WhatsApp Session

If you need to reset the WhatsApp session:

1. Stop the server
2. Run `node clear-whatsapp-data.js` to completely clear all WhatsApp data
3. Start the server again
4. Scan the new QR code with your WhatsApp mobile app

### Checking Logs

To troubleshoot notification issues, check the logs at `server/logs/messages.json` which will show:
- Success/failure status of each message
- Error messages if sending failed
- Message IDs for successfully sent messages

## Security

- Always use a strong API key
- Keep the `.env` file secure and out of version control
- Limit access to the `/api/notify-ticket` endpoint

## Fallback Mechanisms

The system includes several fallback mechanisms to ensure notifications are delivered:

1. **Email**: Even if SSL verification fails, it attempts to send the email
2. **WhatsApp**: 
   - If direct sending fails, it generates clickable URLs as fallback
   - If session is lost, it automatically attempts to reconnect
   - If reconnection fails, it provides URL generation as backup
3. **Retry Logic**: The system automatically retries failed operations multiple times before giving up
4. **File Locking Handling**: Enhanced error handling for Windows file locking issues
5. **Group Matching**: Partial name matching for group names to improve reliability
6. **Group ID Support**: Direct group ID usage for more reliable messaging

## Vercel Deployment

For deploying to Vercel, please refer to [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions on:

1. Setting up environment variables
2. Configuring the database
3. Deploying the application
4. Testing WhatsApp notifications
5. Monitoring and troubleshooting

On Vercel, due to serverless constraints:
- WhatsApp notifications generate URLs for manual sending
- Persistent WhatsApp Web sessions are not possible
- For production use, consider WhatsApp Business API
