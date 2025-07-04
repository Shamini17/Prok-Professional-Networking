import os
from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # Allow CORS for frontend dev server with credentials and all methods/headers
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize JWT
    jwt = JWTManager(app)

    # Initialize rate limiter
    limiter = Limiter(app=app, key_func=get_remote_address)

    # Import models inside app context to avoid circular imports
    with app.app_context():
        from models.user import User
        # from models.profile import Profile, Skill, Experience, Education

    # Register blueprints
    from api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')

    return app

# For CLI/legacy/manual running
_app = None
def get_app():
    global _app
    if _app is None:
        _app = create_app()
    return _app 