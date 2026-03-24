from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Initialize Flask app
# Static folder is where Vite builds the frontend
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)  # Enable CORS for local development

# Load environment variables
load_dotenv()

# Personal Data for Arun Shekhar
ARUN_DATA = {
    "about": "Arun Shekhar is a Cybersecurity Engineer and AI Researcher based in India. He specializes in building intelligent systems that bridge the gap between security and machine learning.",
    "projects": [
        {"name": "Royal Studio", "description": "A premium AI platform for content generation.", "link": "https://arunshekhar.me/#projects"},
        {"name": "Security Automation", "description": "Tools for automated penetration testing and vulnerability assessment.", "link": "https://arunshekhar.me/cybersecurity"},
        {"name": "AI Assistant", "description": "A personal AI agent that knows everything about its creator.", "link": "https://arunshekhar.me/ai"}
    ],
    "skills": {
        "cybersecurity": ["Penetration Testing", "Ethical Hacking", "Metasploit", "Burp Suite"],
        "ai": ["LLM Integration", "Natural Language Processing", "AI Agents"],
        "development": ["React", "Python", "Vite", "Flask"]
    },
    "links": {
        "portfolio": "https://arunshekhar.me",
        "projects": "https://arunshekhar.me/#projects",
        "cybersecurity": "https://arunshekhar.me/cybersecurity",
        "ai": "https://arunshekhar.me/ai"
    }
}

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').lower()
    
    response = "I'm Arun's AI assistant. You can ask me about his **projects**, **cybersecurity skills**, or **how to contact him**. Check out his [Portfolio](https://arunshekhar.me) for more!"
    
    if any(word in message for word in ['who', 'about', 'arun']):
        response = ARUN_DATA['about']
    elif any(word in message for word in ['project', 'work']):
        response = "Arun has worked on some cool projects:\n" + "\n".join([f"- **{p['name']}**: {p['description']} [Link]({p['link']})" for p in ARUN_DATA['projects']])
    elif any(word in message for word in ['security', 'cyber', 'hack']):
        response = f"Arun is an expert in: {', '.join(ARUN_DATA['skills']['cybersecurity'])}. He loves ethical hacking!"
    elif any(word in message for word in ['ai', 'research', 'machine']):
        response = f"Arun's AI work focuses on: {', '.join(ARUN_DATA['skills']['ai'])}. He builds intelligent agents like me!"
        
    return jsonify({"response": response})

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)