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
            key=access_key,
            secret=secret_key,
            tag=partner_tag,
            country="US"
        )
        
        print("Amazon API initialized successfully!")
        
        # Test a simple search
        print("Testing search...")
        response = amazon.search_items(
            keywords="laptop",
            search_index="Electronics",
            item_count=3
        )
        
        print(f"Search response type: {type(response)}")
        print(f"Response data: {response}")
        
        if hasattr(response, 'items') and response.items:
            for item in response.items:
                asin = item.get('asin', '')
                print(f"Item: {asin}")
                item_info = item.get('item_info', {})
                if 'title' in item_info and 'display_value' in item_info['title']:
                    print(f"  Title: {item_info['title']['display_value']}")
                # Get price info
                offers = item.get('offers', {})
                if 'listings' in offers and offers['listings']:
                    price_info = offers['listings'][0].get('price', {})
                    if 'amount' in price_info:
                        print(f"  Price: ${price_info['amount']} {price_info.get('currency', 'USD')}")
        else:
            print("No items found or response format unexpected")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_amazon_api()