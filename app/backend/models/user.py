from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
import re
import json
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    
    # Basic Profile Information
    first_name = db.Column(db.String(50), default="")
    last_name = db.Column(db.String(50), default="")
    bio = db.Column(db.Text, default="")
    location = db.Column(db.String(120), default="")
    phone = db.Column(db.String(20), default="")
    website = db.Column(db.String(255), default="")
    
    # Professional Information
    company = db.Column(db.String(100), default="")
    job_title = db.Column(db.String(100), default="")
    industry = db.Column(db.String(100), default="")
    experience_years = db.Column(db.Integer, default=0)
    
    # Skills and Expertise
    skills = db.Column(db.Text, default="")  # Comma-separated skills
    
    # Education and Certifications
    education = db.Column(db.Text, default="")  # JSON string for education history
    certifications = db.Column(db.Text, default="")  # JSON string for certifications
    
    # Social Media and Links
    social_links = db.Column(db.Text, default="")  # JSON string for social media links
    
    # Profile Image
    image_url = db.Column(db.String(255), default="")
    thumbnail_url = db.Column(db.String(255), default="")
    banner_url = db.Column(db.String(255), nullable=True)
    
    # Profile Settings
    is_public = db.Column(db.Boolean, default=True)
    show_email = db.Column(db.Boolean, default=False)
    show_phone = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Validation Rules
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

    @validates('first_name')
    def validate_first_name(self, key, first_name):
        if first_name and len(first_name) > 50:
            raise ValueError('First name must be less than 50 characters')
        return first_name

    @validates('last_name')
    def validate_last_name(self, key, last_name):
        if last_name and len(last_name) > 50:
            raise ValueError('Last name must be less than 50 characters')
        return last_name

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
        if phone:
            # Remove all non-digit characters except + for international numbers
            clean_phone = re.sub(r'[^\d+]', '', phone)
            if not re.match(r"^[\+]?[1-9][\d]{0,15}$", clean_phone):
                raise ValueError('Invalid phone number format')
        return phone

    @validates('website')
    def validate_website(self, key, website):
        if website:
            if not re.match(r"^https?://.*", website):
                raise ValueError('Website must start with http:// or https://')
            if len(website) > 255:
                raise ValueError('Website URL too long')
        return website

    @validates('company')
    def validate_company(self, key, company):
        if company and len(company) > 100:
            raise ValueError('Company name must be less than 100 characters')
        return company

    @validates('job_title')
    def validate_job_title(self, key, job_title):
        if job_title and len(job_title) > 100:
            raise ValueError('Job title must be less than 100 characters')
        return job_title

    @validates('industry')
    def validate_industry(self, key, industry):
        if industry and len(industry) > 100:
            raise ValueError('Industry must be less than 100 characters')
        return industry

    @validates('experience_years')
    def validate_experience_years(self, key, experience_years):
        if experience_years is not None:
            # Convert string to int if needed
            try:
                if isinstance(experience_years, str):
                    experience_years = int(experience_years)
                elif not isinstance(experience_years, int):
                    raise ValueError('Experience years must be a valid number')
                
                if experience_years < 0 or experience_years > 50:
                    raise ValueError('Experience years must be between 0 and 50')
            except (ValueError, TypeError):
                raise ValueError('Experience years must be a valid number')
        return experience_years

    @validates('education')
    def validate_education(self, key, education):
        if education:
            try:
                if isinstance(education, str):
                    json.loads(education)
            except json.JSONDecodeError:
                raise ValueError('Education must be valid JSON format')
        return education

    @validates('certifications')
    def validate_certifications(self, key, certifications):
        if certifications:
            try:
                if isinstance(certifications, str):
                    json.loads(certifications)
            except json.JSONDecodeError:
                raise ValueError('Certifications must be valid JSON format')
        return certifications

    @validates('social_links')
    def validate_social_links(self, key, social_links):
        if social_links:
            try:
                if isinstance(social_links, str):
                    json.loads(social_links)
            except json.JSONDecodeError:
                raise ValueError('Social links must be valid JSON format')
        return social_links

    def to_dict(self, include_sensitive=False):
        """Convert user object to dictionary for API responses"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email if include_sensitive or self.show_email else None,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'bio': self.bio,
            'location': self.location,
            'phone': self.phone if include_sensitive or self.show_phone else None,
            'website': self.website,
            'company': self.company,
            'job_title': self.job_title,
            'industry': self.industry,
            'experience_years': self.experience_years,
            'skills': self.skills,
            'education': self.education,
            'certifications': self.certifications,
            'social_links': self.social_links,
            'image_url': self.image_url,
            'thumbnail_url': self.thumbnail_url,
            'banner_url': self.banner_url,
            'is_public': self.is_public,
            'show_email': self.show_email,
            'show_phone': self.show_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def to_public_dict(self):
        """Convert user object to public dictionary (for non-owners)"""
        return {
            'id': self.id,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'bio': self.bio,
            'location': self.location,
            'company': self.company,
            'job_title': self.job_title,
            'industry': self.industry,
            'experience_years': self.experience_years,
            'skills': self.skills,
            'image_url': self.image_url,
            'thumbnail_url': self.thumbnail_url,
            'banner_url': self.banner_url,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def update_profile(self, data):
        """Update profile fields with validation"""
        allowed_fields = [
            'first_name', 'last_name', 'bio', 'location', 'phone', 
            'website', 'company', 'job_title', 'industry', 
            'experience_years', 'skills', 'education', 'certifications', 
            'social_links', 'is_public', 'show_email', 'show_phone',
            'banner_url'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(self, field, data[field])
        
        # Update timestamp
        self.updated_at = datetime.utcnow()
        
        return self

    def get_skills_list(self):
        """Get skills as a list"""
        if not self.skills:
            return []
        return [skill.strip() for skill in self.skills.split(',') if skill.strip()]

    def set_skills_list(self, skills_list):
        """Set skills from a list"""
        if isinstance(skills_list, list):
            self.skills = ','.join([skill.strip() for skill in skills_list if skill.strip()])
        else:
            self.skills = str(skills_list) if skills_list else ""

    def get_education_list(self):
        """Get education as a list"""
        if not self.education:
            return []
        try:
            return json.loads(self.education) if isinstance(self.education, str) else self.education
        except json.JSONDecodeError:
            return []

    def set_education_list(self, education_list):
        """Set education from a list"""
        if isinstance(education_list, list):
            self.education = json.dumps(education_list)
        else:
            self.education = str(education_list) if education_list else ""

    def get_certifications_list(self):
        """Get certifications as a list"""
        if not self.certifications:
            return []
        try:
            return json.loads(self.certifications) if isinstance(self.certifications, str) else self.certifications
        except json.JSONDecodeError:
            return []

    def set_certifications_list(self, certifications_list):
        """Set certifications from a list"""
        if isinstance(certifications_list, list):
            self.certifications = json.dumps(certifications_list)
        else:
            self.certifications = str(certifications_list) if certifications_list else ""

    def get_social_links_dict(self):
        """Get social links as a dictionary"""
        if not self.social_links:
            return {}
        try:
            return json.loads(self.social_links) if isinstance(self.social_links, str) else self.social_links
        except json.JSONDecodeError:
            return {}

    def set_social_links_dict(self, social_links_dict):
        """Set social links from a dictionary"""
        if isinstance(social_links_dict, dict):
            self.social_links = json.dumps(social_links_dict)
        else:
            self.social_links = str(social_links_dict) if social_links_dict else ""

    def get_full_name(self):
        """Get full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            return self.username

    def is_profile_complete(self):
        """Check if profile is complete (has basic information)"""
        required_fields = ['first_name', 'last_name', 'bio', 'company', 'job_title']
        return all(getattr(self, field) for field in required_fields)

    def get_profile_completion_percentage(self):
        """Calculate profile completion percentage"""
        fields = [
            'first_name', 'last_name', 'bio', 'location', 'phone', 
            'website', 'company', 'job_title', 'industry', 
            'experience_years', 'skills', 'image_url'
        ]
        
        completed = sum(1 for field in fields if getattr(self, field))
        return int((completed / len(fields)) * 100)
