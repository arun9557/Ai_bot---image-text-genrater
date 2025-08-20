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

# Debug: Print API key status (without exposing the actual key)
if HUGGINGFACE_API_KEY:
    print(f"✅ HuggingFace API key loaded: {HUGGINGFACE_API_KEY[:8]}...")
else:
    print("❌ HuggingFace API key not found in environment variables")
    print("💡 Please set HUGGINGFACE_API_KEY in your .env file")

# Initialize Twilio client if credentials are available
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    except Exception as e:
        print(f"Warning: Failed to initialize Twilio client: {e}")

# Note: HUGGINGFACE_API_KEY is not required for current implementation
# Remove the strict requirement check

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
    """Handle chat interactions using HuggingFace API."""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Check if HuggingFace API key is available
        if not HUGGINGFACE_API_KEY or HUGGINGFACE_API_KEY == "your_huggingface_api_key_here":
            # Fallback to manual responses if no API key
            return get_manual_response(user_message)
        
        # Use HuggingFace API for intelligent responses
        try:
            headers = {
                "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
                "Content-Type": "application/json"
            }
            
            # Using a more reliable conversational model
            api_url = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
            
            payload = {
                "inputs": user_message,
                "parameters": {
                    "max_new_tokens": 100,
                    "temperature": 0.7,
                    "do_sample": True,
                    "return_full_text": False
                }
            }
            
            print(f"Calling HuggingFace API with message: {user_message}")
            response = requests.post(api_url, headers=headers, json=payload, timeout=15)
            print(f"HuggingFace API response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"HuggingFace API result: {result}")
                
                if isinstance(result, list) and len(result) > 0:
                    ai_response = result[0].get('generated_text', '').strip()
                elif isinstance(result, dict) and 'generated_text' in result:
                    ai_response = result['generated_text'].strip()
                else:
                    print("Unexpected API response format, falling back to manual responses")
                    return get_manual_response(user_message)
                
                if ai_response and ai_response != user_message:
                    # Add Royal Studio context to responses
                    if any(word in user_message.lower() for word in ['hello', 'hi', 'hey']):
                        ai_response = f"Hello! I'm your Royal Studio AI assistant. {ai_response}"
                    elif any(word in user_message.lower() for word in ['help', 'what can you do']):
                        ai_response = f"{ai_response}\n\nI can also help you with image generation and SMS messaging through Royal Studio!"
                    elif any(word in user_message.lower() for word in ['name', 'who are you']):
                        ai_response = f"I'm your Royal Studio AI assistant created by Arun Shekhar. {ai_response}"
                    
                    print(f"Returning AI response: {ai_response}")
                    return jsonify({"response": ai_response})
                
            elif response.status_code == 503:
                print("HuggingFace model is loading, falling back to manual responses")
                return get_manual_response(user_message)
            else:
                print(f"HuggingFace API error {response.status_code}: {response.text}")
                return get_manual_response(user_message)
            
            # If we reach here, fallback to manual responses
            print("No valid AI response generated, falling back to manual responses")
            return get_manual_response(user_message)
            
        except requests.exceptions.Timeout:
            print("HuggingFace API timeout, falling back to manual responses")
            return get_manual_response(user_message)
        except requests.exceptions.RequestException as e:
            print(f"HuggingFace API error: {str(e)}, falling back to manual responses")
            return get_manual_response(user_message)
        except Exception as e:
            print(f"Unexpected error in HuggingFace API call: {str(e)}, falling back to manual responses")
            return get_manual_response(user_message)
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


def get_manual_response(user_message):
    """Fallback manual responses when HuggingFace API is not available."""
    user_message_lower = user_message.lower().strip()
    
    # Enhanced response logic with more variety
    if any(word in user_message_lower for word in ['hello', 'hi', 'hey', 'namaste']):
        responses = [
            "Hello! Welcome to Royal Studio. How can I assist you today? You can ask me questions, generate images, or send SMS messages.",
            "Hi there! I'm your Royal Studio AI assistant. What would you like to explore today?",
            "Namaste! Welcome to the royal experience. How may I serve you today?",
            "Greetings! Ready to create something amazing together?"
        ]
        response = responses[hash(user_message) % len(responses)]
        
    elif any(word in user_message_lower for word in ['help', 'what can you do', 'features']):
        response = "I can help you with:\n• Chat conversations\n• Image generation\n• SMS messaging\n• Event information\n\nWhat would you like to try?"
        
    elif any(word in user_message_lower for word in ['name', 'who are you', 'what are you']):
        responses = [
            "I'm your Royal Studio AI assistant, created by Arun Shekhar. I'm here to help with chat, images, and SMS!",
            "I'm the Royal Studio AI - your premium digital companion for creative tasks and conversations.",
            "I'm an AI assistant built for Royal Studio. I can chat, generate images, and send SMS messages!"
        ]
        response = responses[hash(user_message) % len(responses)]
        
    elif any(word in user_message_lower for word in ['image', 'picture', 'generate', 'create', 'draw', 'art']):
        responses = [
            "To generate images, please go to the 'Image Generator' tab above. You can describe what you want to create!",
            "I can create amazing images for you! Switch to the Image Generator tab and describe your vision.",
            "Ready to create some art? Head to the Image Generator tab and let your imagination flow!"
        ]
        response = responses[hash(user_message) % len(responses)]
        
    elif any(word in user_message_lower for word in ['sms', 'message', 'text', 'phone']):
        response = "To send SMS messages, please go to the 'SMS' tab above. You'll need to configure Twilio credentials first."
        
    elif any(word in user_message_lower for word in ['event', 'hackathon', 'conference']):
        response = "I can show you upcoming events and hackathons! Check out the events section for more details."
        
    elif any(word in user_message_lower for word in ['thank', 'thanks', 'appreciate']):
        responses = [
            "You're welcome! I'm here to help. Feel free to ask me anything else.",
            "My pleasure! Happy to assist you anytime.",
            "Glad I could help! What else can I do for you?",
            "You're most welcome! I'm always here for your royal experience."
        ]
        response = responses[hash(user_message) % len(responses)]
        
    elif any(word in user_message_lower for word in ['bye', 'goodbye', 'exit', 'see you']):
        responses = [
            "Goodbye! Have a wonderful day. Come back anytime for more royal experiences!",
            "Farewell! It was great chatting with you. See you soon!",
            "Take care! Thanks for visiting Royal Studio. Until next time!",
            "Goodbye! May your day be filled with creativity and joy!"
        ]
        response = responses[hash(user_message) % len(responses)]
        
    elif any(word in user_message_lower for word in ['how', 'why', 'what', 'when', 'where']):
        responses = [
            "That's a great question! I'm here to help with Royal Studio features. Would you like to know about chat, image generation, or SMS?",
            "Interesting question! I can assist with various tasks. What specific feature would you like to explore?",
            "I'd love to help answer that! Tell me more about what you're looking for - images, messages, or just a chat?",
            "Good question! I'm designed to help with creative tasks and conversations. What can I help you with today?"
        ]
        response = responses[hash(user_message) % len(responses)]
        
    elif any(word in user_message_lower for word in ['arun', 'developer', 'creator', 'maker']):
        responses = [
            "Arun Shekhar is the brilliant mind behind Royal Studio! He's created this premium AI experience for you.",
            "Yes, Arun Shekhar is my creator and the co-founder of Royal Studio. He's built something amazing here!",
            "Arun Shekhar developed this entire Royal Studio platform. Pretty impressive, right?"
        ]
        response = responses[hash(user_message) % len(responses)]
        
    elif any(word in user_message_lower for word in ['good', 'nice', 'awesome', 'cool', 'amazing']):
        responses = [
            "Thank you! I'm glad you're enjoying Royal Studio. What would you like to try next?",
            "That's wonderful to hear! I'm here to make your experience even better.",
            "I'm so happy you like it! Royal Studio is designed to impress. What shall we do next?",
            "Fantastic! Your enthusiasm makes my day. How can I help you further?"
        ]
        response = responses[hash(user_message) % len(responses)]
        
    else:
        # More varied fallback responses
        fallback_responses = [
            "That's interesting! I'm your Royal Studio AI assistant. I can help with chat, image generation, or SMS. What would you like to explore?",
            "I'd love to help you with that! I specialize in conversations, creating images, and sending messages. Which interests you?",
            "Great question! As your Royal Studio assistant, I can chat, generate amazing images, or help with SMS. What sounds fun?",
            "I'm here to assist! Whether you want to chat, create art, or send messages - I've got you covered. What's your preference?",
            "Fascinating! I'm designed to help with various tasks at Royal Studio. Would you like to try image generation, SMS, or just continue chatting?"
        ]
        response = fallback_responses[hash(user_message) % len(fallback_responses)]
    
    return jsonify({"response": response})


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


@app.route('/api/send-sms-bulk', methods=['POST'])
def send_sms_bulk():
    """
    API endpoint to send SMS messages to multiple recipients using Twilio.

    Expected JSON payload:
    {
        "to": ["+1234567890", "+1987654321"],
        "message": "Hello from your chatbot!"
    }
    """
    try:
        if not twilio_client:
            return jsonify({
                "status": "error",
                "error": "SMS service not configured. Please add Twilio credentials to .env file."
            }), 500

        data = request.get_json() or {}
        to_numbers = data.get('to', [])
        message_text = data.get('message', '')

        # Allow single string as well
        if isinstance(to_numbers, str):
            to_numbers = [to_numbers]

        if not isinstance(to_numbers, list) or len(to_numbers) == 0 or not message_text:
            return jsonify({
                "status": "error",
                "error": "Provide a non-empty 'message' and at least one recipient in 'to'"
            }), 400

        def normalize_phone(number: str) -> str:
            # Remove spaces, dashes, parentheses
            cleaned = ''.join(ch for ch in number.strip() if ch.isdigit() or ch == '+')
            # Ensure leading '+' and at least country code + number length
            if not cleaned.startswith('+'):
                # If the number starts with country code digits (common in copies), reject to avoid wrong sends
                return ''
            return cleaned

        results = []
        success_count = 0

        for raw_number in to_numbers:
            normalized = normalize_phone(str(raw_number))
            if not normalized:
                results.append({
                    "to": raw_number,
                    "status": "error",
                    "error": "Invalid number format. Use international format like +1234567890"
                })
                continue

            try:
                message = twilio_client.messages.create(
                    body=message_text,
                    from_=TWILIO_PHONE_NUMBER,
                    to=normalized
                )
                results.append({
                    "to": normalized,
                    "status": "success",
                    "sid": message.sid
                })
                success_count += 1
            except TwilioRestException as e:
                results.append({
                    "to": normalized,
                    "status": "error",
                    "error": str(e)
                })
            except Exception as e:
                results.append({
                    "to": normalized,
                    "status": "error",
                    "error": str(e)
                })

        return jsonify({
            "status": "partial-success" if success_count != len(results) else "success",
            "sent": success_count,
            "total": len(results),
            "results": results
        })

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
    # Get the port from the environment, defaulting to 5000 for local development.
    port = int(os.environ.get("PORT", 5000))
    # Run the Flask app in debug mode.
    app.run(host='0.0.0.0', port=port, debug=True)