# Tally Support Ticket System

A comprehensive ticket management system for Tally support with WhatsApp and email notifications.

## Features

- 🎫 Ticket creation and management
- 📧 Email notifications for closed tickets
- 💬 WhatsApp notifications for clients and support teams
- 📊 Dashboard with ticket analytics
- 📱 Responsive design for all devices
- ☁️ Supabase database integration
- 🚀 Vercel deployment ready

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Notifications**: WhatsApp Web API, Nodemailer
- **Deployment**: Vercel

## Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- WhatsApp Business API (for production) or WhatsApp Web (for development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ticket-system
```

2. Install dependencies:
```bash
npm install
cd server
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables:
- Supabase credentials
- Email SMTP settings
- WhatsApp configuration

## Development

1. Start the development server:
```bash
npm run dev
```

2. Start the backend server:
```bash
cd server
npm run dev
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel project settings
4. Deploy

For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

## WhatsApp Integration

The system includes WhatsApp notifications for:
- Client thank-you messages when tickets are closed
- Support team notifications with ticket details

For setup instructions, see [WHATSAPP_INTEGRATION.md](WHATSAPP_INTEGRATION.md).

## API Endpoints

- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/notify-ticket` - Send WhatsApp notifications

## Testing

Run the test scripts to verify functionality:
- `node test-comprehensive.js` - Test WhatsApp notifications
- `node test-email.js` - Test email configuration
- `node test-vercel-deployment.js` - Test Vercel deployment configuration

## Documentation

- [WHATSAPP_INTEGRATION.md](WHATSAPP_INTEGRATION.md) - WhatsApp setup and usage
- [WHATSAPP_GROUP_SETUP.md](WHATSAPP_GROUP_SETUP.md) - WhatsApp group configuration
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Vercel deployment guide
- [SYSTEM_STATUS.md](SYSTEM_STATUS.md) - Current system status

## Scripts

- `node list-whatsapp-groups.js` - List available WhatsApp groups
- `node clear-whatsapp-data.js` - Clear WhatsApp session data
- `node monitor-whatsapp.js` - Monitor WhatsApp client status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.