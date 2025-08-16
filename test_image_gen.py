#!/usr/bin/env python3

import requests
import urllib.parse
from io import BytesIO

def test_image_generation():
    """Test the Pollinations API directly"""
    
    prompt = "a beautiful sunset over mountains"
    width = 512
    height = 512
    seed = 42
    model = 'flux'
    
    # URL encode the prompt
    encoded_prompt = urllib.parse.quote(prompt)
    
    # Generate image URL
    image_url = f"https://pollinations.ai/p/{encoded_prompt}?width={width}&height={height}&seed={seed}&model={model}"
    
    print(f"Testing image generation...")
    print(f"URL: {image_url}")
    
    try:
        # Download the image with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(image_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        print(f"✅ Success! Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        print(f"Content-Length: {len(response.content)} bytes")
        
        # Save the image to test
        with open('test_image.jpg', 'wb') as f:
            f.write(response.content)
        print("✅ Image saved as test_image.jpg")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    test_image_generation()
