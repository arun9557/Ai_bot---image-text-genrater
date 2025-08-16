from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
import requests
import os
import uuid
import jsonj
from dotenv import load_dotenv
from io import BytesIO

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

if not HUGGINGFACE_API_KEY:
    raise ValueError("Error: HUGGINGFACE_API_KEY not found in environment variables. Please create a .env file with your API key.")
    # You can get an API key from: https://huggingface.co/settings/tokens

# Initialize Flask app
app = Flask(__name__)
app.config['DEBUG'] = True
app.config['PROPAGATE_EXCEPTIONS'] = True
CORS(app)
print("Flask app initialized with Hugging Face integration")

# This is a sample dataset of hackathons.
# In a real-world application, this would be replaced with a call to an
# external API or a database query.
SAMPLE_HACKATHONS = [
    {
        "id": 1,
        "title": "Innovate India Hackathon",
        "location": "Bengaluru",
        "date": "2025-10-20",
        "description": "A national-level hackathon focused on solving social challenges in India using technology. Topics include sustainable energy and smart cities."
    },
    {
        "id": 2,
        "title": "Code for a Cause",
        "location": "Online",
        "date": "2025-11-15",
        "description": "A virtual hackathon dedicated to building solutions for non-profit organizations. Open to all skill levels."
    },
    {
        "id": 3,
        "title": "Tech Titans India",
        "location": "Hyderabad",
        "date": "2025-12-05",
        "description": "An in-person event for seasoned developers to tackle advanced problems in AI and blockchain. Huge prizes await the top teams."
    },
    {
        "id": 4,
        "title": "Startup Weekend",
        "location": "Mumbai",
        "date": "2025-12-10",
        "description": "A 54-hour event where participants build a complete business idea from scratch. Focus is on business and product development."
    }
]

@app.route('/')
def home():
    """Serve the main chat interface."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files."""
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    API endpoint for chat interactions using OpenAI API.
    """
    try:
        print("Received chat request")
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Simple rule-based responses
        user_message = user_message.lower()
        
        if any(word in user_message for word in ['hello', 'hi', 'hey']):
            response = "Hello! How can I assist you today?"
        elif any(word in user_message for word in ['how are you', 'how are you doing']):
            response = "I'm just a computer program, but I'm functioning well! How can I help you?"
        elif any(word in user_message for word in ['thank', 'thanks']):
            response = "You're welcome! Is there anything else I can help you with?"
        elif any(word in user_message for word in ['bye', 'goodbye']):
            response = "Goodbye! Have a great day!"
        elif any(word in user_message for word in ['help', 'what can you do']):
            response = "I can help you with general questions and generate AI images. Try asking me something or switch to the Image Generation tab to create images!"
        elif 'image' in user_message and 'generate' in user_message:
            response = "To generate an image, please switch to the 'Image Generation' tab above and enter your image description."
        else:
            response = "I'm a simple AI assistant. You can ask me general questions or generate images using the Image Generation tab above."
        
        return jsonify({"response": response})
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Failed to connect to AI service",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "error": "An unexpected error occurred",
            "details": str(e)
        }), 500

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
        hackathons = SAMPLE_HACKATHONS

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
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

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