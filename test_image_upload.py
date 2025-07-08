#!/usr/bin/env python3
"""
Test script to upload a profile image for user ID 4
"""

import requests
import os
from PIL import Image
import io

def create_test_image():
    """Create a simple test image"""
    # Create a 200x200 test image with a gradient
    img = Image.new('RGB', (200, 200), color=0x0000FF)
    
    # Add some text to make it identifiable
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font = ImageFont.load_default()
    except:
        font = None
    
    # Draw text
    text = "Test\nImage"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (200 - text_width) // 2
    y = (200 - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    return img

def upload_test_image():
    """Upload a test image to the profile"""
    
    # Create test image
    img = create_test_image()
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Prepare the upload
    url = "http://localhost:5000/api/profile/image"
    
    # You'll need to get a valid token for user ID 4
    # For now, let's use the testuser token to test the endpoint
    headers = {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NTE3MzE4MTIsImlhdCI6MTc1MTcyODIxMn0.VFOVWWHHM7NWVXYhmLcVwgK3aVANpGb-zGtyZYoK0LA'
    }
    
    files = {
        'image': ('test_image.png', img_bytes, 'image/png')
    }
    
    try:
        print("Uploading test image...")
        response = requests.post(url, headers=headers, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Upload successful!")
            print(f"Image URL: {result.get('image_url')}")
            print(f"Thumbnail URL: {result.get('thumbnail_url')}")
            return True
        else:
            print(f"❌ Upload failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error uploading image: {e}")
        return False

def test_image_access():
    """Test if we can access the uploaded image"""
    try:
        response = requests.get("http://localhost:5000/static/profile_images/profile_1_1751728960.png")
        if response.status_code == 200:
            print("✅ Image is accessible")
            return True
        else:
            print(f"❌ Image not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accessing image: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Image Upload System")
    print("=" * 40)
    
    # Test image access first
    print("\n1. Testing image access...")
    test_image_access()
    
    # Test upload
    print("\n2. Testing image upload...")
    upload_test_image()
    
    print("\n✅ Test completed!")
    print("\n📝 Next steps:")
    print("1. Go to http://localhost:5173")
    print("2. Login with your credentials")
    print("3. Go to profile page")
    print("4. Click 'Edit Profile'")
    print("5. Upload an image using the file input")
    print("6. Check console for upload logs") 