# Royal Studio - AI Chatbot Application

A full-stack chatbot application with a React frontend and Flask backend, featuring AI chat, image generation, and SMS capabilities.

## Project Structure

```
Chatbot-main/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel deployment configuration
├── runtime.txt           # Python runtime specification
├── frontend/             # React frontend application
│   ├── src/
│   ├── package.json
│   └── ...
└── static/               # Static files served by Flask
```

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project root:**
   ```bash
   vercel
   ```

### Option 2: Deploy via GitHub

1. **Push your code to GitHub**
2. **Go to [vercel.com](https://vercel.com)**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Vercel will automatically detect the configuration**

### Option 3: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Upload your project folder**
4. **Vercel will automatically build and deploy**

## Environment Variables Setup

After deployment, add these environment variables in your Vercel dashboard:

```
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Local Development Setup

### Backend Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv .venv
   ```

2. **Activate the virtual environment:**
   - Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a .env file:**
   Create a `.env` file in the root directory with:
   ```
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   PORT=5000
   FLASK_ENV=development
   
   # Twilio SMS Configuration (Optional)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

5. **Run the backend server:**
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Build the frontend:**
   ```bash
   npm run build
   ```

4. **For development (optional):**
   ```bash
   npm run dev
   ```

## Features

- **Chat Interface**: Interactive chat with AI assistant
- **Event Management**: View and manage events/hackathons
- **Image Generation**: Generate images using AI with enhanced timeout handling
- **SMS Messaging**: Send SMS messages using Twilio integration
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices
- **Enhanced UX**: Progress tracking, error handling, and retry mechanisms

## API Endpoints

- `GET /api/events` - Get list of events
- `GET /api/hackathons` - Get list of hackathons
- `POST /api/chat` - Send chat messages
- `POST /api/generate-image` - Generate images
- `POST /api/send-sms` - Send SMS messages
- `GET /api/sms-status` - Check SMS service status

## Development

The application uses:
- **Backend**: Flask with CORS support
- **Frontend**: React with TypeScript, Vite, and Tailwind CSS
- **UI Components**: Shadcn/ui components
- **Styling**: Tailwind CSS with custom design system

## Running the Application Locally

1. Start the backend server (from root directory):
   ```bash
   python app.py
   ```

2. Build the frontend (from frontend directory):
   ```bash
   cd frontend
   npm run build
   ```

3. Access the application at `http://localhost:5000`

The Flask server will serve the built frontend files automatically.

## Deployment Notes

- The application is configured for Vercel deployment
- Frontend builds automatically during deployment
- API routes are properly configured for serverless functions
- Environment variables can be set in Vercel dashboard
- Static files are served from the frontend/dist directory

## Credits

**Co-Founder: Arun Shekhar**

Crafted with premium elegance • Where technology meets royal sophistication
