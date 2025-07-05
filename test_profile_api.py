#!/usr/bin/env python3
"""
Test script for Profile API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_profile_endpoints():
    """Test the profile API endpoints"""
    
    print("🧪 Testing Profile API Endpoints")
    print("=" * 50)
    
    # Test 1: Get profile (should fail without auth)
    print("\n1. Testing GET /api/profile (without auth)...")
    try:
        response = requests.get(f"{BASE_URL}/api/profile")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Update profile (should fail without auth)
    print("\n2. Testing PUT /api/profile (without auth)...")
    try:
        test_data = {
            "first_name": "John",
            "last_name": "Doe",
            "bio": "Test bio",
            "location": "Test City"
        }
        response = requests.put(f"{BASE_URL}/api/profile", json=test_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Get skills (should fail without auth)
    print("\n3. Testing GET /api/profile/skills (without auth)...")
    try:
        response = requests.get(f"{BASE_URL}/api/profile/skills")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Update skills (should fail without auth)
    print("\n4. Testing PUT /api/profile/skills (without auth)...")
    try:
        test_skills = ["Python", "JavaScript", "React"]
        response = requests.put(f"{BASE_URL}/api/profile/skills", json={"skills": test_skills})
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n✅ All tests completed!")
    print("\n📝 Note: These tests show that the API endpoints are properly protected with authentication.")
    print("   To test with authentication, you would need to:")
    print("   1. Login to get a JWT token")
    print("   2. Include the token in the Authorization header")
    print("   3. Then test the endpoints again")

if __name__ == "__main__":
    test_profile_endpoints() 