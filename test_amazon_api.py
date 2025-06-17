#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from amazon_paapi import AmazonApi

# Load environment variables
load_dotenv('/app/backend/.env')

def test_amazon_api():
    try:
        access_key = os.environ.get('PAAPI_ACCESS_KEY')
        secret_key = os.environ.get('PAAPI_SECRET_KEY')
        partner_tag = os.environ.get('PARTNER_TAG')
        
        print(f"Access Key: {access_key[:10]}...")
        print(f"Secret Key: {secret_key[:10]}...")
        print(f"Partner Tag: {partner_tag}")
        
        # Initialize Amazon API
        amazon = AmazonApi(
            access_key=access_key,
            secret_key=secret_key,
            partner_tag=partner_tag,
            country="US",
            throttling=1.5
        )
        
        print("Amazon API initialized successfully!")
        
        # Test a simple search
        print("Testing search...")
        response = amazon.search_items(
            keywords="laptop",
            search_index="Electronics",
            item_count=3,
            resources=[
                "Images.Primary.Large",
                "ItemInfo.Title",
                "Offers.Listings.Price"
            ]
        )
        
        print(f"Search response type: {type(response)}")
        
        if hasattr(response, 'items') and response.items:
            print(f"Found {len(response.items)} items")
            for i, item in enumerate(response.items[:2]):
                print(f"Item {i+1}: {item.asin}")
                if hasattr(item, 'item_info') and item.item_info and item.item_info.title:
                    print(f"  Title: {item.item_info.title.display_value}")
        else:
            print("No items found or response format unexpected")
            print(f"Response content: {response}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_amazon_api()