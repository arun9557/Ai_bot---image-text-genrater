import os
import requests
import uuid
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Initialize Flask app
# On local, it looks for ../frontend/dist. On Vercel, we serve API independently.
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/dist'))
app = Flask(__name__, static_folder=dist_path if os.path.exists(dist_path) else None, static_url_path='')
CORS(app)  # Enable CORS for development

# Load environment variables
load_dotenv()

# Landbot Credentials
LANDBOT_TOKEN = os.getenv("LANDBOT_API_TOKEN")
LANDBOT_BOT_ID = os.getenv("LANDBOT_BOT_ID")

# Session Store (to keep track of Landbot customer IDs)
sessions = {}

# Fallback Data in case Landbot is slow/errored
ARUN_DATA = {
    "about": "Arun Shekhar is a Cybersecurity Engineer and AI Researcher based in India. He specializes in building intelligent systems that bridge the gap between security and machine learning.",
    "links": {
        "portfolio": "https://arunshekhar.me",
        "projects": "https://arunshekhar.me/#projects"
    }
}

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').strip()
    user_id = data.get('user_id', 'default_user')  # Use a user id from frontend or generate one

    if not message:
        return jsonify({"response": "I didn't hear anything. How can I help you?"}), 400

    # 1. Manage Landbot Session (Customer ID)
    customer_id = sessions.get(user_id)
    headers = {
        "Authorization": f"Token {LANDBOT_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        # If no customer session, create one
        if not customer_id:
            # Create a unique customer ID in our system
            customer_id = str(uuid.uuid4())[:8]
            
            # Create customer in Landbot (Optional but good for tracking)
            create_url = f"https://api.landbot.io/v1/customers/"
            create_payload = {"id": customer_id, "name": f"User_{customer_id}"}
            requests.post(create_url, json=create_payload, headers=headers)
            
            # Assign Bot to Customer
            assign_url = f"https://api.landbot.io/v1/customers/{customer_id}/assign_bot/"
            assign_payload = {"bot_id": int(LANDBOT_BOT_ID)}
            requests.post(assign_url, json=assign_payload, headers=headers)
            
            sessions[user_id] = customer_id

        # 2. Send Message to Landbot
        send_url = f"https://api.landbot.io/v1/customers/{customer_id}/send_message/"
        send_payload = {"message": message}
        response = requests.post(send_url, json=send_payload, headers=headers)
        
        # 3. Fetch Response (Simple polling/get last message)
        # Note: Landbot is typically async. For a sync chat experience, we poll for a response.
        import time
        bot_response = ""
        for _ in range(3):  # Check 3 times with delays
            time.sleep(1.5)
            get_url = f"https://api.landbot.io/v1/customers/{customer_id}/messages/"
            get_response = requests.get(get_url, headers=headers)
            if get_response.status_code == 200:
                msgs = get_response.json().get('results', [])
                if msgs:
                    # Look for the latest message from the BOT
                    for m in msgs:
                        if m.get('sender_type') == 'bot':
                            bot_response = m.get('message', '')
                            break
                if bot_response:
                    break
        
        if bot_response:
            return jsonify({"response": bot_response})
        else:
            # Full Fallback if Landbot flow doesn't respond in time
            return get_manual_response(message)

    except Exception as e:
        print(f"❌ Landbot API Error: {e}")
        return get_manual_response(message)

def get_manual_response(message):
    message_lower = message.lower()
    response = f"I'm Arun's AI. My Landbot brain is loading, but you can learn everything about him here: {ARUN_DATA['links']['portfolio']}"
    
    if any(word in message_lower for word in ['who', 'about', 'arun']):
        response = ARUN_DATA['about']
    elif any(word in message_lower for word in ['project', 'work']):
        response = f"Arun has built many great projects. Check them out: {ARUN_DATA['links']['projects']}"
    
    return jsonify({"response": response})

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)