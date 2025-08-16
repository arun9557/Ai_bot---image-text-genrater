# Chatbot Application

A full-stack chatbot application with a React frontend and Flask backend.

## Project Structure

```
Chatbot-main/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── frontend/             # React frontend application
│   ├── src/
│   ├── package.json
│   └── ...
└── static/               # Static files served by Flask
```

## Setup Instructions

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
- **Image Generation**: Generate images using AI
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

- `GET /api/events` - Get list of events
- `GET /api/hackathons` - Get list of hackathons
- `POST /api/chat` - Send chat messages
- `POST /api/generate-image` - Generate images

## Development

The application uses:
- **Backend**: Flask with CORS support
- **Frontend**: React with TypeScript, Vite, and Tailwind CSS
- **UI Components**: Shadcn/ui components
- **Styling**: Tailwind CSS with custom design system

## Running the Application

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
