#!/usr/bin/env python3
import os
import json
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('/app/backend/.env')

def test_amazon_api():
    """Test the Amazon API directly"""
    print("\n🔍 Testing Amazon API directly...")
    
    # Print environment variables
    print(f"PAAPI_ACCESS_KEY: {os.environ.get('PAAPI_ACCESS_KEY')}")
    print(f"PARTNER_TAG: {os.environ.get('PARTNER_TAG')}")
    
    try:
        # Try to import the Amazon API library
        try:
            from amazon.paapi import AmazonAPI
            print("✅ Successfully imported amazon.paapi.AmazonAPI")
        except ImportError:
            print("❌ Failed to import amazon.paapi.AmazonAPI")
            try:
                from amazon_paapi import AmazonApi
                print("✅ Successfully imported amazon_paapi.AmazonApi")
            except ImportError:
                print("❌ Failed to import amazon_paapi.AmazonApi")
                return False
        
        # Try to initialize the Amazon API client
        try:
            # Try with amazon.paapi.AmazonAPI
            try:
                amazon = AmazonAPI(
                    os.environ.get('PAAPI_ACCESS_KEY'),
                    os.environ.get('PAAPI_SECRET_KEY'),
                    os.environ.get('PARTNER_TAG'),
                    'US'
                )
                print("✅ Successfully initialized AmazonAPI")
            except Exception as e:
                print(f"❌ Failed to initialize AmazonAPI: {str(e)}")
                # Try with amazon_paapi.AmazonApi
                try:
                    amazon = AmazonApi(
                        key=os.environ.get('PAAPI_ACCESS_KEY'),
                        secret=os.environ.get('PAAPI_SECRET_KEY'),
                        tag=os.environ.get('PARTNER_TAG'),
                        country='US'
                    )
                    print("✅ Successfully initialized AmazonApi")
                except Exception as e:
                    print(f"❌ Failed to initialize AmazonApi: {str(e)}")
                    return False
        
            # Try to search for products
            try:
                response = amazon.search_items(
                    keywords='bluetooth headphones',
                    search_index='All',
                    item_count=10
                )
                print("✅ Successfully searched for products")
                print(f"Found {len(response.items) if hasattr(response, 'items') else 0} products")
                return True
            except Exception as e:
                print(f"❌ Failed to search for products: {str(e)}")
                return False
        except Exception as e:
            print(f"❌ Failed to initialize Amazon API client: {str(e)}")
            return False
    except Exception as e:
        print(f"❌ Error testing Amazon API: {str(e)}")
        return False

if __name__ == "__main__":
    test_amazon_api()