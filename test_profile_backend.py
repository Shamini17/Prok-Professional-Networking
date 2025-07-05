#!/usr/bin/env python3
"""
Test script for profile backend functionality
"""

import requests
import json
import os
from PIL import Image
import io

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER = {
    "username": "testuser_profile",
    "email": "testprofile@example.com",
    "password": "testpass123"
}

def create_test_image():
    """Create a test image for upload testing"""
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    return img_byte_arr

def test_auth():
    """Test authentication"""
    print("🔐 Testing Authentication...")
    
    # Register user
    register_response = requests.post(f"{BASE_URL}/api/auth/signup", json=TEST_USER)
    if register_response.status_code == 201:
        print("✅ User registered successfully")
    elif register_response.status_code == 400:
        print("ℹ️ User already exists")
    else:
        print(f"❌ Registration failed: {register_response.status_code}")
        return None
    
    # Login
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "username": TEST_USER["username"],
        "password": TEST_USER["password"]
    })
    
    if login_response.status_code == 200:
        token = login_response.json()["token"]
        print("✅ Login successful")
        return token
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        return None

def test_get_profile(token):
    """Test getting profile"""
    print("\n📋 Testing Get Profile...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/profile", headers=headers)
    
    if response.status_code == 200:
        profile = response.json()
        print("✅ Profile retrieved successfully")
        print(f"   Username: {profile.get('username')}")
        print(f"   Email: {profile.get('email')}")
        return profile
    else:
        print(f"❌ Get profile failed: {response.status_code}")
        return None

def test_update_profile(token):
    """Test updating profile"""
    print("\n✏️ Testing Update Profile...")
    
    update_data = {
        "first_name": "Test",
        "last_name": "User",
        "bio": "This is a test bio for profile testing",
        "location": "Test City, Test Country",
        "phone": "+1234567890",
        "website": "https://example.com",
        "company": "Test Company",
        "job_title": "Test Developer",
        "industry": "Technology",
        "experience_years": 5
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{BASE_URL}/api/profile", 
                          headers=headers, 
                          json=update_data)
    
    if response.status_code == 200:
        profile = response.json()
        print("✅ Profile updated successfully")
        print(f"   Name: {profile.get('first_name')} {profile.get('last_name')}")
        print(f"   Bio: {profile.get('bio')}")
        return profile
    else:
        print(f"❌ Update profile failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_upload_image(token):
    """Test image upload"""
    print("\n🖼️ Testing Image Upload...")
    
    # Create test image
    test_image = create_test_image()
    
    headers = {"Authorization": f"Bearer {token}"}
    files = {"image": ("test_image.jpg", test_image, "image/jpeg")}
    
    response = requests.post(f"{BASE_URL}/api/profile/image", 
                           headers=headers, 
                           files=files)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Image uploaded successfully")
        print(f"   Image URL: {result.get('image_url')}")
        return result.get('image_url')
    else:
        print(f"❌ Image upload failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_skills(token):
    """Test skills management"""
    print("\n🎯 Testing Skills Management...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Update skills
    skills_data = {
        "skills": ["Python", "JavaScript", "React", "Flask", "SQL"]
    }
    
    response = requests.put(f"{BASE_URL}/api/profile/skills", 
                          headers=headers, 
                          json=skills_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Skills updated successfully")
        print(f"   Skills: {', '.join(result.get('skills', []))}")
        return result
    else:
        print(f"❌ Skills update failed: {response.status_code}")
        return None

def test_image_serving(image_url):
    """Test image serving"""
    if not image_url:
        print("\n🖼️ Skipping image serving test (no image uploaded)")
        return
    
    print("\n🖼️ Testing Image Serving...")
    
    # Extract filename from URL
    filename = image_url.split('/')[-1]
    response = requests.get(f"{BASE_URL}/static/profile_images/{filename}")
    
    if response.status_code == 200:
        print("✅ Image serving successful")
        print(f"   Content-Type: {response.headers.get('content-type')}")
        print(f"   Content-Length: {response.headers.get('content-length')}")
    else:
        print(f"❌ Image serving failed: {response.status_code}")

def main():
    """Run all tests"""
    print("🚀 Starting Profile Backend Tests")
    print("=" * 50)
    
    # Test authentication
    token = test_auth()
    if not token:
        print("❌ Authentication failed, stopping tests")
        return
    
    # Test profile operations
    profile = test_get_profile(token)
    if not profile:
        print("❌ Get profile failed, stopping tests")
        return
    
    updated_profile = test_update_profile(token)
    if not updated_profile:
        print("❌ Update profile failed, stopping tests")
        return
    
    # Test image upload
    image_url = test_upload_image(token)
    
    # Test image serving
    test_image_serving(image_url)
    
    # Test skills
    skills_result = test_skills(token)
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    
    if updated_profile:
        print(f"\n📊 Final Profile Summary:")
        print(f"   Name: {updated_profile.get('first_name')} {updated_profile.get('last_name')}")
        print(f"   Company: {updated_profile.get('company')}")
        print(f"   Job Title: {updated_profile.get('job_title')}")
        print(f"   Experience: {updated_profile.get('experience_years')} years")
        print(f"   Image: {'✅' if image_url else '❌'}")
        print(f"   Skills: {'✅' if skills_result else '❌'}")

if __name__ == "__main__":
    main() 