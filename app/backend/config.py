import os
from datetime import timedelta

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    
    # Database - Using SQLite for development (easier setup)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///prok_app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_CSRF_IN_COOKIES = False
    JWT_CSRF_CHECK_FORM = False
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # CORS - Allow frontend origin
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ]

    # File upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'profile_images')
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
    RATE_LIMIT_DEFAULT = "200 per day;50 per hour"
    RATELIMIT_STORAGE_URL = "memory://"
    
    # Profile Configuration
    MAX_SKILLS = 20
    MAX_SKILL_LENGTH = 50
    MAX_BIO_LENGTH = 1000
    MAX_NAME_LENGTH = 50
    MAX_COMPANY_LENGTH = 100
    MAX_JOB_TITLE_LENGTH = 100
    MAX_LOCATION_LENGTH = 120
    MAX_WEBSITE_LENGTH = 255
    
    # Database Configuration
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # Logging Configuration
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Development Configuration
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    TESTING = False
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Error Handling
    PROPAGATE_EXCEPTIONS = True
    
    @staticmethod
    def init_app(app):
        """Initialize application configuration"""
        # Create upload directory if it doesn't exist
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        
        # Set up logging
        import logging
        logging.basicConfig(
            level=getattr(logging, Config.LOG_LEVEL),
            format=Config.LOG_FORMAT
        )

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_SECURE = True
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Production-specific configurations
        import logging
        from logging.handlers import RotatingFileHandler
        
        if not app.debug and not app.testing:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler('logs/prok_app.log', maxBytes=10240, backupCount=10)
            file_handler.setFormatter(logging.Formatter(Config.LOG_FORMAT))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
            app.logger.setLevel(logging.INFO)
            app.logger.info('Prok app startup')

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}