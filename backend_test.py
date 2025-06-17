#!/usr/bin/env python3
import requests
import json
import sys
import time

# Configuration
BASE_URL = "http://localhost:8001"
API_BASE_URL = f"{BASE_URL}/api"

def test_api_health():
    """Test the basic API health endpoint"""
    print("\n🔍 Testing API Health...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ API Health Check: SUCCESS")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ API Health Check: FAILED with status code {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ API Health Check: ERROR - {str(e)}")
        return False

def test_amazon_product_search():
    """Test the Amazon product search endpoint"""
    print("\n🔍 Testing Amazon Product Search...")
    try:
        payload = {
            "query": "bluetooth headphones",
            "country": "US",
            "page": 1
        }
        print(f"   Request: POST {API_BASE_URL}/products/search")
        print(f"   Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{API_BASE_URL}/products/search", json=payload)
        
        print(f"   Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            cached = data.get("cached", False)
            
            print(f"   Response Data: {json.dumps(data, indent=2)[:500]}...")
            print(f"   Cached: {cached}")
            
            if products:
                print(f"✅ Amazon Product Search: SUCCESS - Found {len(products)} products")
                # Print details of the first product
                first_product = products[0]
                print(f"   First Product:")
                print(f"   - ASIN: {first_product.get('asin')}")
                print(f"   - Title: {first_product.get('title')}")
                print(f"   - Price: {first_product.get('price')}")
                print(f"   - Rating: {first_product.get('rating')}")
                print(f"   - Affiliate URL: {first_product.get('affiliate_url')}")
                
                # Save the first ASIN for product details test
                return True, first_product.get('asin')
            else:
                print("⚠️ Amazon Product Search: SUCCESS but no products found")
                # Check logs for more information
                print("   Checking backend logs for more information...")
                try:
                    import subprocess
                    logs = subprocess.check_output("tail -n 20 /var/log/supervisor/backend.*.log", shell=True).decode('utf-8')
                    print(f"   Recent logs:\n{logs}")
                except Exception as log_e:
                    print(f"   Could not retrieve logs: {str(log_e)}")
                return True, None
        else:
            print(f"❌ Amazon Product Search: FAILED with status code {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Amazon Product Search: ERROR - {str(e)}")
        return False, None

def test_product_details(asin):
    """Test the product details endpoint with a valid ASIN"""
    if not asin:
        print("\n⚠️ Skipping Product Details Test: No ASIN available")
        # Use a hardcoded ASIN for testing
        asin = "B07PXGQC1Q"  # Common ASIN for a popular product
        print(f"   Using hardcoded ASIN for testing: {asin}")
    
    print(f"\n🔍 Testing Product Details for ASIN: {asin}...")
    try:
        url = f"{API_BASE_URL}/products/{asin}?country=US"
        print(f"   Request: GET {url}")
        
        response = requests.get(url)
        print(f"   Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            product = data.get("product", {})
            cached = data.get("cached", False)
            
            print(f"   Response Data: {json.dumps(data, indent=2)[:500]}...")
            print(f"   Cached: {cached}")
            
            if product:
                print("✅ Product Details: SUCCESS")
                print(f"   - Title: {product.get('title')}")
                print(f"   - Price: {product.get('price')}")
                print(f"   - Availability: {product.get('availability')}")
                print(f"   - Rating: {product.get('rating')}")
                print(f"   - Image URL: {product.get('image_url')}")
                return True
            else:
                print("⚠️ Product Details: SUCCESS but no product data found")
                # Check logs for more information
                print("   Checking backend logs for more information...")
                try:
                    import subprocess
                    logs = subprocess.check_output("tail -n 20 /var/log/supervisor/backend.*.log", shell=True).decode('utf-8')
                    print(f"   Recent logs:\n{logs}")
                except Exception as log_e:
                    print(f"   Could not retrieve logs: {str(log_e)}")
                return False
        else:
            print(f"❌ Product Details: FAILED with status code {response.status_code}")
            print(f"   Response: {response.text}")
            # Check logs for more information
            print("   Checking backend logs for more information...")
            try:
                import subprocess
                logs = subprocess.check_output("tail -n 20 /var/log/supervisor/backend.*.log", shell=True).decode('utf-8')
                print(f"   Recent logs:\n{logs}")
            except Exception as log_e:
                print(f"   Could not retrieve logs: {str(log_e)}")
            return False
    except Exception as e:
        print(f"❌ Product Details: ERROR - {str(e)}")
        return False

def test_database_connection():
    """Test the database connection via the status endpoint"""
    print("\n🔍 Testing Database Connection...")
    try:
        payload = {
            "client_name": "backend_test_script"
        }
        response = requests.post(f"{API_BASE_URL}/status", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Database Connection: SUCCESS")
            print(f"   - ID: {data.get('id')}")
            print(f"   - Client Name: {data.get('client_name')}")
            print(f"   - Timestamp: {data.get('timestamp')}")
            
            # Verify the data was stored by retrieving it
            get_response = requests.get(f"{API_BASE_URL}/status")
            if get_response.status_code == 200:
                status_checks = get_response.json()
                if status_checks and len(status_checks) > 0:
                    print("✅ Database Read: SUCCESS")
                    return True
                else:
                    print("⚠️ Database Read: SUCCESS but no records found")
                    return False
            else:
                print(f"❌ Database Read: FAILED with status code {get_response.status_code}")
                return False
        else:
            print(f"❌ Database Connection: FAILED with status code {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Database Connection: ERROR - {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall status"""
    print("\n=====================================================")
    print("🧪 STARTING UNFLUFFED.CO BACKEND API TESTS")
    print("=====================================================")
    
    # Test 1: API Health
    api_health_success = test_api_health()
    
    # Test 2: Amazon Product Search
    product_search_success, asin = test_amazon_product_search()
    
    # Test 3: Product Details (if we have an ASIN)
    if asin:
        product_details_success = test_product_details(asin)
    else:
        print("\n⚠️ Skipping Product Details Test: No ASIN available from search")
        product_details_success = False
    
    # Test 4: Database Connection
    db_connection_success = test_database_connection()
    
    # Summary
    print("\n=====================================================")
    print("📊 TEST RESULTS SUMMARY")
    print("=====================================================")
    print(f"API Health Check:       {'✅ PASSED' if api_health_success else '❌ FAILED'}")
    print(f"Amazon Product Search:  {'✅ PASSED' if product_search_success else '❌ FAILED'}")
    print(f"Product Details:        {'✅ PASSED' if product_details_success else '❌ FAILED' if asin else '⚠️ SKIPPED'}")
    print(f"Database Connection:    {'✅ PASSED' if db_connection_success else '❌ FAILED'}")
    
    overall_success = api_health_success and product_search_success and (product_details_success if asin else True) and db_connection_success
    print("\n=====================================================")
    print(f"🏁 OVERALL TEST RESULT: {'✅ PASSED' if overall_success else '❌ FAILED'}")
    print("=====================================================")
    
    return overall_success

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)