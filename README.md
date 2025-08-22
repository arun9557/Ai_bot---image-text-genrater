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

