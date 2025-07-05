from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import models
from models.user import User, db as user_db
# from models.profile import Profile, Skill, Experience, Education, db as profile_db

# Import blueprints
from api.auth import auth_bp
from api.profile import profile_bp

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize CORS with explicit origins for development
CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize database
# Use the db from models.user
user_db.init_app(app)
db = user_db

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Create upload directory if it doesn't exist
def setup_upload_directory():
    """Setup upload directory"""
    upload_folder = app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    print(f"✅ Upload directory created: {upload_folder}")

# Static file serving for uploaded images
@app.route('/static/profile_images/<filename>')
def serve_profile_image(filename):
    """Serve uploaded profile images"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return {'error': 'Image not found'}, 404

# Error handlers
@app.errorhandler(413)
def too_large(e):
    return {'error': 'File too large'}, 413

@app.errorhandler(404)
def not_found(e):
    return {'error': 'Resource not found'}, 404

@app.errorhandler(500)
def internal_error(e):
    return {'error': 'Internal server error'}, 500

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Setup upload directory
    setup_upload_directory()
    
    # Run the app
    print("🚀 Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

# For Flask CLI discovery
# This allows 'flask run' to work by exposing 'app' at module level
# (Flask looks for 'app' or 'application' by default) 