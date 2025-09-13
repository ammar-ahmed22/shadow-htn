#!/usr/bin/env python3
"""
Test script for Martian API connection
Run this to verify the API is working before deployment
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_flask_server():
    """Test if Flask server is running"""
    try:
        response = requests.get('http://127.0.0.1:5000/health', timeout=5)
        return response.status_code == 200
    except:
        return False

def test_martian_api():
    """Test Martian API ticket generation"""
    
    # Check if API key is set
    api_key = os.getenv("MARTIAN_API_KEY")
    if not api_key:
        print("❌ MARTIAN_API_KEY not found in environment variables")
        return False
    
    print(f"✅ MARTIAN_API_KEY found: {api_key[:8]}...")
    
    # Test data
    test_prompt = "Create a simple user authentication system with login and signup"
    
    try:
        # Test Flask API endpoint with simpler prompt
        response = requests.post(
            'http://127.0.0.1:5000/ticket-code',
            json={
                'prompt': 'Add a login button',
                'code_context': ''
            },
            timeout=180
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Parse the response if it's a string
            if isinstance(data, str):
                try:
                    parsed_data = json.loads(data)
                    tickets = parsed_data.get('tickets', [])
                except:
                    print("❌ Failed to parse JSON response")
                    return False
            else:
                tickets = data.get('tickets', [])
            
            print(f"✅ Martian API successful! Generated {len(tickets)} tickets")
            
            # Display first ticket as example
            if tickets:
                first_ticket = tickets[0]
                print(f"\n📋 Sample ticket:")
                print(f"   Title: {first_ticket.get('title', 'N/A')}")
                print(f"   Stage: {first_ticket.get('stage', 'N/A')}")
                print(f"   Priority: {first_ticket.get('priority', 'N/A')}")
                print(f"   Estimate: {first_ticket.get('estimate', 'N/A')}")
            
            return True
            
        else:
            print(f"❌ Flask API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout - Martian API took too long to respond")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Flask server not running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_nextjs_api():
    """Test Next.js API endpoint"""
    try:
        response = requests.post(
            'http://localhost:3001/api/martian-tickets',
            json={
                'prompt': 'Build a todo app',
                'codeContext': 'React with TypeScript'
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Next.js API successful! Response: {data.get('success', False)}")
            return True
        else:
            print(f"❌ Next.js API error: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Next.js server not running on port 3001")
        return False
    except Exception as e:
        print(f"❌ Next.js API error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Martian API Integration\n")
    
    # Test 1: Environment setup
    print("1. Checking environment setup...")
    api_key_ok = bool(os.getenv("MARTIAN_API_KEY"))
    print(f"   MARTIAN_API_KEY: {'✅' if api_key_ok else '❌'}")
    
    if not api_key_ok:
        print("\n❌ Setup incomplete. Please set MARTIAN_API_KEY in your .env file")
        exit(1)
    
    # Test 2: Flask server
    print("\n2. Testing Flask server connection...")
    flask_ok = test_martian_api()
    
    # Test 3: Next.js API (optional)
    print("\n3. Testing Next.js API integration...")
    nextjs_ok = test_nextjs_api()
    
    # Summary
    print(f"\n📊 Test Results:")
    print(f"   Environment: {'✅' if api_key_ok else '❌'}")
    print(f"   Flask API: {'✅' if flask_ok else '❌'}")
    print(f"   Next.js API: {'✅' if nextjs_ok else '❌'}")
    
    if flask_ok:
        print(f"\n🎉 Martian API is ready for production!")
        print(f"💡 To deploy:")
        print(f"   1. Start Flask server: python martian_api.py")
        print(f"   2. Start Next.js: pnpm dev")
        print(f"   3. Test in browser at http://localhost:3001/plan")
    else:
        print(f"\n⚠️  Issues found. Please fix before deploying to staging.")
