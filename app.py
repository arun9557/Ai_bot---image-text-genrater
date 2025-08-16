from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
from pathlib import Path
import uuid
from io import BytesIO
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Initialize Flask app
app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Load environment variables
load_dotenv()

# Get API keys from environment variables
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio client if credentials are available
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    except Exception as e:
        print(f"Warning: Failed to initialize Twilio client: {e}")

if not HUGGINGFACE_API_KEY:
    raise ValueError(
        "Error: HUGGINGFACE_API_KEY not found in environment variables. "
        "Please create a .env file with your API key."
    )

# Sample data for events
events = [
    {
        "id": 1,
        "title": "AI Conference",
        "location": "Bangalore",
        "date": "2025-09-15",
        "description": "Annual AI and Machine Learning conference featuring industry leaders and workshops."
    },
    {
        "id": 2,
        "title": "Tech Hackathon",
        "location": "Delhi",
        "date": "2025-10-20",
        "description": "48-hour coding competition for developers to build innovative solutions."
    },
    {
        "id": 3,
        "title": "Web3 Summit",
        "location": "Hyderabad",
        "date": "2025-11-05",
        "description": "Explore the future of decentralized technologies and blockchain."
    },
    {
        "id": 4,
        "title": "Startup Weekend",
        "location": "Mumbai",
        "date": "2025-12-10",
        "description": "A 54-hour event where participants build a complete business idea from scratch."
    }
]


def serve_frontend():
    """Serve the frontend application."""
    return send_from_directory(app.static_folder, 'index.html')


# Routes
@app.route('/')
def index():
    """Serve the main application page."""
    return serve_frontend()


@app.errorhandler(404)
def not_found(_):
    """Handle 404 errors by serving the frontend."""
    return serve_frontend()


@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat interactions."""
    try:
        data = request.get_json()
        user_message = data.get('message', '').lower().strip()
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Simple response logic based on keywords
        if any(word in user_message for word in ['hello', 'hi', 'hey', 'namaste']):
            response = "Hello! Welcome to Royal Studio. How can I assist you today? You can ask me questions, generate images, or send SMS messages."
        elif any(word in user_message for word in ['help', 'what can you do', 'features']):
            response = "I can help you with:\n• Chat conversations\n• Image generation\n• SMS messaging\n• Event information\n\nWhat would you like to try?"
        elif any(word in user_message for word in ['image', 'picture', 'generate', 'create']):
            response = "To generate images, please go to the 'Image Generator' tab above. You can describe what you want to create!"
        elif any(word in user_message for word in ['sms', 'message', 'text', 'phone']):
            response = "To send SMS messages, please go to the 'SMS' tab above. You'll need to configure Twilio credentials first."
        elif any(word in user_message for word in ['event', 'hackathon', 'conference']):
            response = "I can show you upcoming events and hackathons! Check out the events section for more details."
        elif any(word in user_message for word in ['thank', 'thanks']):
            response = "You're welcome! I'm here to help. Feel free to ask me anything else."
        elif any(word in user_message for word in ['bye', 'goodbye', 'exit']):
            response = "Goodbye! Have a wonderful day. Come back anytime for more royal experiences!"
        else:
            response = "That's an interesting question! I'm a simple AI assistant. You can ask me about features, generate images, or send SMS messages. What would you like to know more about?"
        
        return jsonify({"response": response})
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Failed to connect to AI service",
            "details": str(e)
        }), 500
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/events', methods=['GET'])
def get_events():
    """Get the list of events."""
    try:
        return jsonify(events)
    except Exception as e:
        print(f"Error getting events: {str(e)}")
        return jsonify({"error": "Failed to fetch events"}), 500


@app.route('/api/hackathons', methods=['GET'])
def get_hackathons():
    """
    API endpoint to get a list of hackathons.
    
    Returns:
        JSON: A list of hackathon objects with the following structure:
            [
                {
                    "id": int,
                    "title": str,
                    "location": str,
                    "date": str (YYYY-MM-DD),
                    "description": str
                },
                ...
            ]
    """
    try:
        # Example of how to fetch data from an external API if you had one.
        # This part is commented out as we don't have a specific API URL.
        # api_url = "https://example.com/api/hackathons-india"
        # response = requests.get(api_url)
        # response.raise_for_status() # Raise an exception for bad status codes
        # hackathons = response.json()

        # For now, we return the sample data.
        hackathons = events

        # Return the hackathon data as a JSON response with success status
        return jsonify({
            "status": "success",
            "count": len(hackathons),
            "data": hackathons,
            "message": "Hackathons retrieved successfully"
        })

    except requests.exceptions.RequestException as e:
        # Log the error for debugging
        print(f"API Request Error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": "Failed to fetch data from external API",
            "details": str(e)
        }), 500
        
    except Exception as e:
        # Log unexpected errors
        print(f"Unexpected Error: {str(e)}")
        return jsonify({ 
            "status": "error",
            "error": "An unexpected error occurred",
            "details": str(e)
        }), 500

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """
    API endpoint to generate an image using Pollinations API.
    
    Expected JSON payload:
    {
        "prompt": "A beautiful landscape",
        "width": 1024,
        "height": 1024,
        "seed": 42
    }
    """
    try:
        data = request.get_json()
        
        # Set default values if not provided
        prompt = data.get('prompt', 'A beautiful landscape')
        width = data.get('width', 1024)
        height = data.get('height', 1024)
        seed = data.get('seed', 42)
        model = 'flux'  # Default model
        
        # URL encode the prompt to handle special characters
        import urllib.parse
        encoded_prompt = urllib.parse.quote(prompt)
        
        # Generate image URL
        image_url = f"https://pollinations.ai/p/{encoded_prompt}?width={width}&height={height}&seed={seed}&model={model}"
        
        print(f"Generating image with URL: {image_url}")
        
        # Download the image with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(image_url, headers=headers, timeout=120)
        response.raise_for_status()
        
        print(f"Image response status: {response.status_code}")
        print(f"Content type: {response.headers.get('content-type')}")
        
        # Generate a unique filename
        filename = f"generated_{uuid.uuid4().hex}.jpg"
        
        # Save the image temporarily
        image_data = BytesIO(response.content)
        
        # Return the image directly
        return send_file(
            image_data,
            mimetype='image/jpeg',
            as_attachment=True,
            download_name=filename
        )
        
    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": "Failed to generate image",
            "details": str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({ 
            "status": "error",
            "error": "An unexpected error occurred",
            "details": str(e)
        }), 500


@app.route('/api/send-sms', methods=['POST'])
def send_sms():
    """
    API endpoint to send SMS messages using Twilio.
    
    Expected JSON payload:
    {
        "to": "+1234567890",
        "message": "Hello from your chatbot!"
    }
    """
    try:
        if not twilio_client:
            return jsonify({
                "status": "error",
                "error": "SMS service not configured. Please add Twilio credentials to .env file."
            }), 500
        
        data = request.get_json()
        to_number = data.get('to', '')
        message_text = data.get('message', '')
        
        if not to_number or not message_text:
            return jsonify({
                "status": "error",
                "error": "Both 'to' phone number and 'message' are required"
            }), 400
        
        # Validate phone number format (basic validation)
        if not to_number.startswith('+'):
            return jsonify({
                "status": "error",
                "error": "Phone number must be in international format (e.g., +1234567890)"
            }), 400
        
        # Send SMS using Twilio
        message = twilio_client.messages.create(
            body=message_text,
            from_=TWILIO_PHONE_NUMBER,
            to=to_number
        )
        
        return jsonify({
            "status": "success",
            "message": "SMS sent successfully",
            "sid": message.sid,
            "to": to_number
        })
        
    except TwilioRestException as e:
        return jsonify({
            "status": "error",
            "error": "Failed to send SMS",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": "An unexpected error occurred",
            "details": str(e)
        }), 500


@app.route('/api/sms-status', methods=['GET'])
def sms_status():
    """
    Check if SMS service is configured and available.
    """
    return jsonify({
        "status": "success",
        "sms_configured": twilio_client is not None,
        "message": "SMS service is configured" if twilio_client else "SMS service not configured"
    })


if __name__ == '__main__':
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    
    # Get the port from the environment, defaulting to 5000 for local development.
    port = int(os.environ.get("PORT", 5000))
    # Run the Flask app in debug mode.
    app.run(host='0.0.0.0', port=port, debug=True)