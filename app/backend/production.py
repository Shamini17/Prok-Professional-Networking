#!/usr/bin/env python3
"""
Production configuration for Prok Professional Networking API
This file contains production-specific settings and can be used
for deployment on platforms like Render, Heroku, or AWS.
"""

import os
from config import ProductionConfig
from flask_cors import CORS

class DeploymentConfig(ProductionConfig):
    """Production deployment configuration"""
    
    # Override database URL for deployment
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or ProductionConfig.SQLALCHEMY_DATABASE_URI
    
    # Security settings for production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '').split(',') if os.environ.get('ALLOWED_ORIGINS') else []
    
    # Logging
    LOG_LEVEL = 'INFO'
    
    # File upload settings
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 5 * 1024 * 1024))  # 5MB default
    
    @classmethod
    def init_app(cls, app):
        ProductionConfig.init_app(app)
        
        # Production-specific logging
        import logging
        from logging.handlers import RotatingFileHandler
        
        if not app.debug and not app.testing:
            # Log to stderr for cloud platforms
            import sys
            handler = logging.StreamHandler(sys.stderr)
            handler.setLevel(logging.INFO)
            formatter = logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            )
            handler.setFormatter(formatter)
            app.logger.addHandler(handler)
            app.logger.setLevel(logging.INFO)
            app.logger.info('Prok app startup')

# For WSGI applications
app = None

def create_app():
    """Create and configure the Flask application for production"""
    from main import create_app as create_app_main
    return create_app_main('production')

if __name__ == '__main__':
    app = create_app()
    app.run() 