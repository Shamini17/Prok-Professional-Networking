import os
from datetime import timedelta

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    
    # Database - Using SQLite for development (easier setup)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///prok_app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-this-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_CSRF_IN_COOKIES = False
    JWT_CSRF_CHECK_FORM = False
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # CORS - Allow frontend origin
    CORS_HEADERS = 'Content-Type'

    # File upload settings
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'profile_images')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # Image processing settings
    MAX_IMAGE_SIZE = (800, 800)  # Maximum dimensions
    THUMBNAIL_SIZE = (150, 150)  # Thumbnail dimensions
    IMAGE_QUALITY = 85  # JPEG quality
    
    # Security settings
    SECURE_FILENAME = True
    RATE_LIMIT_ENABLED = True
    
    # Rate limiting
    RATELIMIT_DEFAULT = "200 per day;50 per hour;10 per minute"
    RATELIMIT_STORAGE_URL = "memory://" 