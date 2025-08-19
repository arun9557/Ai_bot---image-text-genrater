# Royal Studio - Premium AI Chatbot

A sophisticated AI-powered chatbot application with image generation and SMS capabilities, built with Flask backend and React frontend.

## ✨ Features

- **🤖 AI Chat**: Intelligent conversational AI with contextual responses
- **🎨 Image Generation**: Advanced AI image creation using Pollinations API
- **📱 SMS Integration**: Send SMS messages via Twilio integration
- **👑 Royal UI**: Premium, elegant user interface with royal theme
- **🌙 Dark/Light Mode**: Toggle between themes
- **📱 Responsive Design**: Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn



### Backend Development

The Flask backend provides REST APIs for:
- Chat conversations (`/api/chat`)
- Image generation (`/api/generate-image`)
- SMS messaging (`/api/send-sms`)
- Event data (`/api/events`, `/api/hackathons`)

### Frontend Development

Built with React, TypeScript, and Tailwind CSS:
- Modern component architecture
- Responsive design with royal theme
- Real-time progress tracking for image generation
- Advanced error handling and retry mechanisms

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run install` - Install all dependencies
- `npm start` - Start production server

## 🎨 Image Generation

The image generation feature includes:
- **Dynamic Timeouts**: 2-4 minutes based on prompt complexity
- **Progress Tracking**: Real-time generation stages
- **Retry Mechanism**: Automatic retry with exponential backoff
- **Error Handling**: Context-aware error messages
- **Complexity Detection**: Automatic prompt analysis

### Prompt Complexity Levels:
- **Low**: Simple prompts (2 minutes timeout)
- **Medium**: Detailed prompts (3 minutes timeout)
- **High**: Complex/photorealistic prompts (4 minutes timeout)

## 📱 SMS Integration

Configure Twilio credentials in `.env` to enable SMS functionality:
- Send messages to any phone number
- International format validation
- Error handling and status reporting

## 🚀 Deployment

### Vercel Deployment

The project is configured for Vercel deployment:

1. **Connect to Vercel**
   ```bash
   vercel
   ```

2. **Environment Variables**
   Add your environment variables in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the built files**
   - Backend: Deploy `app.py` with Python runtime
   - Frontend: Deploy `dist/` folder as static files

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWILIO_ACCOUNT_SID` | No | Twilio account SID for SMS |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token for SMS |
| `TWILIO_PHONE_NUMBER` | No | Twilio phone number for SMS |
| `HUGGINGFACE_API_KEY` | No | HuggingFace API key (future use) |
| `PORT` | No | Server port (default: 5000) |

## 🎯 API Endpoints

### Chat API
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

### Image Generation API
```http
POST /api/generate-image
Content-Type: application/json

{
  "prompt": "A beautiful landscape",
  "width": 1024,
  "height": 1024,
  "seed": 42
}
```

### SMS API
```http
POST /api/send-sms
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Hello from Royal Studio!"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure Node.js 18+ is installed
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

2. **Image Generation Timeouts**
   - Complex prompts may take up to 4 minutes
   - Try simplifying prompts for faster results
   - Check internet connection stability

3. **SMS Not Working**
   - Verify Twilio credentials in `.env`
   - Check phone number format (must include country code)
   - Ensure Twilio account has sufficient balance

## 👨‍💻 Author

**Arun Shekhar**
- Co-Founder & Developer
- Premium AI Solutions

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

*Crafted with premium elegance • Where technology meets royal sophistication*
