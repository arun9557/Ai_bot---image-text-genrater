# Royal Studio - AI Chatbot with Image Generation & SMS

A premium AI-powered web application featuring elegant chat interactions, advanced image generation, and SMS messaging capabilities.

## ✨ Features

- **🤖 Intelligent Chat**: AI-powered conversations with contextual responses
- **🎨 Image Generation**: Advanced AI image creation with timeout handling and retry mechanisms
- **📱 SMS Integration**: Send messages via Twilio integration
- **🎭 Royal UI**: Elegant, responsive design with premium animations
- **⚡ Real-time**: Live progress tracking and status updates

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Chatbot-main
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```bash
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   # Optional: Add Twilio credentials for SMS features
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Build the frontend**
   ```bash
   npm run build
   cd ..
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

The application will be available at `http://localhost:5000`

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev  # Runs on http://localhost:8080
```

### Backend Development
```bash
python app.py  # Runs on http://localhost:5000
```

## 📋 API Endpoints

- `POST /api/chat` - Chat with AI
- `POST /api/generate-image` - Generate images
- `POST /api/send-sms` - Send SMS messages
- `GET /api/sms-status` - Check SMS service status
- `GET /api/events` - Get events list
- `GET /api/hackathons` - Get hackathons list

## 🎯 Image Generation Features

- **Dynamic Timeouts**: Automatically adjusts based on prompt complexity
  - Simple prompts: 2 minutes
  - Medium complexity: 3 minutes
  - High complexity: 4 minutes
- **Retry Mechanism**: Automatic retry with exponential backoff
- **Progress Tracking**: Real-time generation progress with time estimates
- **Error Handling**: Comprehensive error messages with recovery options

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HUGGINGFACE_API_KEY` | Yes | API key for AI features |
| `TWILIO_ACCOUNT_SID` | No | Twilio account SID for SMS |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token for SMS |
| `TWILIO_PHONE_NUMBER` | No | Twilio phone number for SMS |
| `PORT` | No | Server port (default: 5000) |

## 🐛 Troubleshooting

### Common Issues

1. **Image generation timeout**
   - Try simplifying your prompt
   - Complex prompts may take up to 4 minutes
   - Use the retry feature if generation fails

2. **SMS not working**
   - Ensure Twilio credentials are correctly set in `.env`
   - Check phone number format (must include country code)

3. **Frontend not loading**
   - Make sure to build the frontend: `cd frontend && npm run build`
   - Check if all dependencies are installed

4. **API errors**
   - Verify your Hugging Face API key is valid
   - Check network connectivity
   - Review server logs for detailed error messages

### Getting API Keys

1. **Hugging Face API Key** (Required)
   - Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create a new token with read permissions

2. **Twilio Credentials** (Optional)
   - Sign up at [Twilio Console](https://console.twilio.com/)
   - Get Account SID, Auth Token, and Phone Number from dashboard

## 📁 Project Structure

```
Chatbot-main/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── frontend/             # React frontend
│   ├── src/
│   │   ├── pages/        # Main application pages
│   │   ├── components/   # Reusable UI components
│   │   └── lib/          # Utility functions
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts    # Build configuration
└── static/               # Static assets
```

## 🎨 UI Components

The application uses a premium design system with:
- **Shadcn/ui**: Modern React components
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful icon library
- **Custom Animations**: Royal-themed animations and effects

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Create an issue in the repository
