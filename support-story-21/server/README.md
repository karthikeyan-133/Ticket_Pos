# Ticket Support System Backend

This is the backend server for the Tally Support Ticket System.

## Features

- RESTful API for ticket management
- MySQL database integration (replaces MongoDB)
- Email notifications using Nodemailer
- WhatsApp notifications using Twilio
- Serial number validation
- Automatic ticket number generation
- Dubai timezone handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL database (local or cPanel instance)
- Gmail account for email notifications (or other email service)
- Twilio account for WhatsApp notifications (optional)

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values with your configuration

4. Initialize database tables:
   ```bash
   node init-db.js
   ```

5. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5002

# cPanel MySQL Configuration
DB_HOST=techzontech.com
DB_USER=techzontech_ticket_supporter
DB_PASSWORD=your_actual_password_here
DB_NAME=techzontech_ticket_support_system
DB_PORT=3306

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio Configuration (for WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## API Endpoints

### Tickets

- `GET /api/tickets` - Get all tickets (with optional filters)
- `GET /api/tickets/:id` - Get ticket by ID
- `GET /api/tickets/serial/:serialNumber` - Get tickets by serial number
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Executives

- `GET /api/executives` - Get all executives
- `POST /api/executives` - Create new executive
- `PUT /api/executives/:id` - Update executive
- `DELETE /api/executives/:id` - Delete executive

## Serial Number Validation

The system validates Tally serial numbers with the following rules:
- Must be exactly 9 digits
- The sum of all digits must reduce to 9

Example: 123456789
- Sum: 1+2+3+4+5+6+7+8+9 = 45
- Further reduction: 4+5 = 9 ✓

## Notifications

When a ticket is closed, the system automatically sends:
1. An email to the customer with the resolution details
2. Generates a WhatsApp message URL that can be used for client-side redirection

## Database Schema

### Ticket

```javascript
{
  ticketNumber: String,        // Auto-generated (TICKET/YYYY/XXXX)
  serialNumber: String,        // 9-digit validated serial number
  companyName: String,         // Company name
  contactPerson: String,       // Contact person name
  mobileNumber: String,        // Customer mobile number
  email: String,               // Customer email
  issueRelated: String,        // Data/Network/Licence/Entry
  priority: String,            // High/Medium/Low
  assignedExecutive: String,   // Assigned staff member
  status: String,              // Open/Closed/Processing/On Hold
  userType: String,            // Single User/Multiuser
  expiryDate: Date,            // Licence expiry date
  createdAt: Date,             // Ticket creation timestamp
  updatedAt: Date,             // Last update timestamp
  closedAt: Date,              // Closure timestamp (if closed)
  resolution: String,          // Resolution details
  remarks: String              // Additional remarks
}
```

### Executive

```javascript
{
  name: String,                // Executive name
  email: String,               // Executive email
  phone: String                // Executive phone (optional)
}
```

## Development

The backend is built with:
- Node.js
- Express.js
- MySQL with mysql2 package
- Nodemailer for emails
- WhatsApp URL generation for client-side redirection

## Testing

To test the API endpoints, you can use tools like:
- Postman
- curl
- Insomnia

Example curl request to create a ticket:
```bash
curl -X POST http://localhost:5002/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "123456789",
    "companyName": "Tech Solutions Inc.",
    "contactPerson": "John Doe",
    "mobileNumber": "+1234567890",
    "email": "john@example.com",
    "issueRelated": "data",
    "priority": "high",
    "assignedExecutive": "Support Agent",
    "userType": "multiuser",
    "expiryDate": "2025-12-31T00:00:00.000Z",
    "remarks": "Customer needs help with data import"
  }'
```

## Troubleshooting

If you encounter issues, please refer to the main [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) file for detailed solutions to common problems.