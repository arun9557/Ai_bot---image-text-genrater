import os
import subprocess
import sys

def run_project():
    # 1. Install Dependencies if needed (optional, just run for now)
    print("🚀 Starting Arun Shekhar Personal AI Assistant...")
    print("💡 Running Frontend (Vite) and Backend (Flask) concurrently...")

    # Start Backend
    backend_p = subprocess.Popen([sys.executable, "backend/app.py"])

    # Start Frontend (in development mode)
    # This assumes node_modules are already installed
    try:
        frontend_p = subprocess.Popen(["npm", "run", "dev"], cwd="frontend", shell=True)
    except Exception as e:
        print(f"❌ Error starting frontend: {e}. Make sure npm is installed.")
        backend_p.terminate()
        return

    try:
        backend_p.wait()
        frontend_p.wait()
    except KeyboardInterrupt:
        print("\n👋 Stopping project...")
        backend_p.terminate()
        frontend_p.terminate()

if __name__ == "__main__":
    run_project()
