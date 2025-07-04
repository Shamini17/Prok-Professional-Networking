#!/usr/bin/env python3
"""
Simple API test script to verify endpoints work before Postman testing
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_signup():
    """Test user signup endpoint"""
    print("Testing signup endpoint...")
    
    signup_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "TestPassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 201
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the Flask server is running!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_login():
    """Test user login endpoint"""
    print("\nTesting login endpoint...")
    
    login_data = {
        "username": "testuser",
        "password": "TestPassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            if token:
                print(f"✅ Login successful! Token received: {token[:20]}...")
                return True
            else:
                print("❌ No token in response")
                return False
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the Flask server is running!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🚀 API Testing Script")
    print("=" * 50)
    
    # Test signup
    signup_success = test_signup()
    
    # Test login
    login_success = test_login()
    
    print("\n" + "=" * 50)
    if signup_success and login_success:
        print("✅ All tests passed! Your API is ready for Postman testing.")
    else:
        print("❌ Some tests failed. Check the server logs for details.")
    
    print("\n📝 Next steps:")
    print("1. Install Postman using the commands provided")
    print("2. Create requests for /api/signup and /api/login")
    print("3. Test with the same JSON data used in this script")

if __name__ == "__main__":
    main() 