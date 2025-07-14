from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import config
import os
import logging

# Import models
from models.user import db

# Import blueprints
from api.auth import auth_bp
from api.profile import profile_bp
from api.posts import posts_bp
from api.feed import feed_bp
from api.jobs import jobs_bp
from api.messaging import messaging_bp

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS - allow production origins
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,https://your-frontend-url.onrender.com').split(',')
    
    CORS(app,
         origins=ALLOWED_ORIGINS,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         supports_credentials=True,
         max_age=3600)
    
    # Static file serving for uploaded images
    @app.route('/static/profile_images/<filename>')
    def serve_profile_image(filename):
        """Serve uploaded profile images"""
        try:
            response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
            
            # Add CORS headers for image serving
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            
            return response
        except FileNotFoundError:
            return jsonify({'error': 'Image not found'}), 404

    # Static file serving for banner images
    @app.route('/static/banner_images/<filename>')
    def serve_banner_image(filename):
        """Serve uploaded banner images"""
        try:
            banner_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'banner_images')
            response = send_from_directory(banner_folder, filename)
            
            # Add CORS headers for image serving
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            
            return response
        except FileNotFoundError:
            return jsonify({'error': 'Banner image not found'}), 404

    # Add static file serving for post media
    @app.route('/static/posts/<filename>')
    def serve_post_media(filename):
        """Serve uploaded post media files (images/videos)"""
        post_upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'posts')
        try:
            response = send_from_directory(post_upload_folder, filename)
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            return response
        except FileNotFoundError:
            return jsonify({'error': 'Media not found'}), 404

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(feed_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(messaging_bp)
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request', 'message': str(error)}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden', 'message': 'Access denied'}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found', 'message': 'Resource not found'}), 404
    
    @app.errorhandler(413)
    def file_too_large(error):
        return jsonify({'error': 'File too large', 'message': 'File size exceeds limit'}), 413
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Server Error: {error}')
        return jsonify({'error': 'Internal server error', 'message': 'Something went wrong'}), 500
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Prok Professional Networking API is running',
            'version': '1.0.0'
        })
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            'message': 'Welcome to Prok Professional Networking API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth/*',
                'profile': '/api/profile/*',
                'posts': '/api/posts/*',
                'feed': '/api/feed/*',
                'jobs': '/api/jobs/*',
                'messaging': '/api/messaging/*'
            }
        })
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
        except Exception as e:
            app.logger.error(f"Error creating database tables: {e}")
    
    return app

if __name__ == '__main__':
    # Set environment variables
    os.environ['FLASK_APP'] = 'main.py'
    
    # Create and run app
    app = create_app()
    
    # Log startup information
    app.logger.info("Starting Prok Professional Networking API...")
    app.logger.info(f"Environment: {os.environ.get('FLASK_CONFIG', 'development')}")
    app.logger.info(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    app.logger.info(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    
    # Get port from environment (for cloud platforms)
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=app.config.get('DEBUG', False)
    )

# For Flask CLI discovery
app = create_app() 