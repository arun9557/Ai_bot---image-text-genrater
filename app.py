from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
from pathlib import Path
import uuid
from io import BytesIO

# Initialize Flask app
app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Load environment variables
load_dotenv()

# Get API keys from environment variables
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

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
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        response = (
            "I'm a simple AI assistant. You can ask me general questions "
            "or generate images using the Image Generation tab above."
        )
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
        
        # Generate image URL
        image_url = f"https://pollinations.ai/p/{prompt}?width={width}&height={height}&seed={seed}&model={model}"
        
        # Download the image yaha se
        response = requests.get(image_url)
        response.raise_for_status()
        
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
        return jsonify({
            "status": "error",
            "error": "Failed to generate image",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({ 
            "status": "error",
            "error": "An unexpected error occurred",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    
    # Get the port from the environment, defaulting to 5000 for local development.
    port = int(os.environ.get("PORT", 5000))
    # Run the Flask app in debug mode.
    app.run(host='0.0.0.0', port=port, debug=True)