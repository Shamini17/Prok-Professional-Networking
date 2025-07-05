from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
import re

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    
    # Profile fields
    bio = db.Column(db.Text, default="")
    location = db.Column(db.String(120), default="")
    image_url = db.Column(db.String(255), default="")
    first_name = db.Column(db.String(50), default="")
    last_name = db.Column(db.String(50), default="")
    phone = db.Column(db.String(20), default="")
    website = db.Column(db.String(255), default="")
    company = db.Column(db.String(100), default="")
    job_title = db.Column(db.String(100), default="")
    industry = db.Column(db.String(100), default="")
    experience_years = db.Column(db.Integer, default=0)
    skills = db.Column(db.Text, default="")  # Comma-separated skills
    education = db.Column(db.Text, default="")  # JSON string for education history
    certifications = db.Column(db.Text, default="")  # JSON string for certifications
    social_links = db.Column(db.Text, default="")  # JSON string for social media links
    
    # Timestamps
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    @validates('email')
    def validate_email(self, key, email):
        if not email:
            raise ValueError('Email is required')
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValueError('Invalid email format')
        return email

    @validates('username')
    def validate_username(self, key, username):
        if not username:
            raise ValueError('Username is required')
        if len(username) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(username) > 80:
            raise ValueError('Username must be less than 80 characters')
        if not re.match(r"^[a-zA-Z0-9_]+$", username):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return username

    @validates('bio')
    def validate_bio(self, key, bio):
        if bio and len(bio) > 1000:
            raise ValueError('Bio must be less than 1000 characters')
        return bio

    @validates('location')
    def validate_location(self, key, location):
        if location and len(location) > 120:
            raise ValueError('Location must be less than 120 characters')
        return location

    @validates('phone')
    def validate_phone(self, key, phone):
        if phone and not re.match(r"^[\+]?[1-9][\d]{0,15}$", phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')):
            raise ValueError('Invalid phone number format')
        return phone

    @validates('website')
    def validate_website(self, key, website):
        if website and not re.match(r"^https?://.*", website):
            raise ValueError('Website must start with http:// or https://')
        return website

    @validates('experience_years')
    def validate_experience_years(self, key, experience_years):
        if experience_years and (experience_years < 0 or experience_years > 50):
            raise ValueError('Experience years must be between 0 and 50')
        return experience_years

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'bio': self.bio,
            'location': self.location,
            'image_url': self.image_url,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'website': self.website,
            'company': self.company,
            'job_title': self.job_title,
            'industry': self.industry,
            'experience_years': self.experience_years,
            'skills': self.skills,
            'education': self.education,
            'certifications': self.certifications,
            'social_links': self.social_links,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def update_profile(self, data):
        """Update profile fields with validation"""
        allowed_fields = [
            'bio', 'location', 'first_name', 'last_name', 'phone', 
            'website', 'company', 'job_title', 'industry', 
            'experience_years', 'skills', 'education', 'certifications', 'social_links'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(self, field, data[field])
        
        return self
