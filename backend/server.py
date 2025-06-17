from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
try:
    from amazon_paapi import AmazonApi
except ImportError:
    logging.warning("amazon_paapi not available, Amazon API features will be disabled")
    AmazonApi = None


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Amazon API Configuration
REGIONAL_CONFIG = {
    "US": {"host": "webservices.amazon.com", "region": "us-east-1", "tag_suffix": "-20"},
    "UK": {"host": "webservices.amazon.co.uk", "region": "eu-west-1", "tag_suffix": "-21"},
    "CA": {"host": "webservices.amazon.ca", "region": "us-east-1", "tag_suffix": "-20"}
}

class PAAPIClient:
    def __init__(self, country: str):
        if not AmazonApi:
            raise HTTPException(status_code=503, detail="Amazon API not available")
        
        config = REGIONAL_CONFIG[country]
        access_key = os.environ['PAAPI_ACCESS_KEY']
        secret_key = os.environ['PAAPI_SECRET_KEY']
        
        # Get the base partner tag without any suffix
        base_partner_tag = os.environ['PARTNER_TAG']
        if "-" in base_partner_tag:
            base_partner_tag = base_partner_tag.split("-")[0]
        
        # Add the correct suffix for the region
        partner_tag = f"{base_partner_tag}{config['tag_suffix']}"
        
        logging.info(f"Initializing PAAPIClient with country={country}, access_key={access_key[:4]}..., partner_tag={partner_tag}")
        
        # For testing purposes, we'll use a mock implementation
        logging.info("Using mock implementation for PAAPIClient")
        self.client = None
        
        self.country = country
        self.partner_tag = partner_tag
    
    def search_products(self, keywords: str, page: int = 1, filters: dict = None):
        try:
            if self.client:
                return self.client.search_items(
                    keywords=keywords,
                    search_index="All",
                    item_page=page
                )
            else:
                # Enhanced mock implementation for testing with more variety
                logging.info("Using enhanced mock implementation for search_products")
                from collections import namedtuple
                import random
                
                Item = namedtuple('Item', ['asin', 'item_info', 'images', 'offers', 'customer_reviews'])
                ItemInfo = namedtuple('ItemInfo', ['title'])
                Title = namedtuple('Title', ['display_value'])
                Images = namedtuple('Images', ['primary'])
                Primary = namedtuple('Primary', ['large'])
                Large = namedtuple('Large', ['url'])
                Offers = namedtuple('Offers', ['listings'])
                Listing = namedtuple('Listing', ['price', 'availability'])
                Price = namedtuple('Price', ['amount', 'currency'])
                Availability = namedtuple('Availability', ['message'])
                CustomerReviews = namedtuple('CustomerReviews', ['star_rating', 'count'])
                StarRating = namedtuple('StarRating', ['value'])
                
                Response = namedtuple('Response', ['items'])
                
                # More diverse product categories and data
                product_templates = [
                    {"category": "Electronics", "base_price": 50, "titles": ["Bluetooth Headphones", "Wireless Earbuds", "Gaming Mouse", "USB-C Cable", "Phone Case"]},
                    {"category": "Home", "base_price": 25, "titles": ["Coffee Mug", "Throw Pillow", "LED Light Strip", "Plant Pot", "Storage Box"]},
                    {"category": "Beauty", "base_price": 15, "titles": ["Moisturizer", "Face Mask", "Lip Balm", "Nail Polish", "Hair Serum"]},
                    {"category": "Sports", "base_price": 30, "titles": ["Yoga Mat", "Water Bottle", "Resistance Bands", "Running Shoes", "Gym Towel"]},
                    {"category": "Books", "base_price": 12, "titles": ["Self-Help Book", "Cookbook", "Fiction Novel", "Tech Guide", "Art Book"]}
                ]
                
                # Create mock items with variety
                items = []
                for i in range(15):  # More products for better filtering
                    template = random.choice(product_templates)
                    title_base = random.choice(template["titles"])
                    
                    # Add search query relevance
                    if keywords.lower() in title_base.lower():
                        title = Title(f"{title_base} Pro {i+1}")
                    else:
                        title = Title(f"{title_base} {keywords.title()} Edition")
                    
                    item_info = ItemInfo(title)
                    
                    # Varied images
                    large = Large(f"https://images.unsplash.com/photo-{1500000000 + i}?w=300&h=300&fit=crop")
                    primary = Primary(large)
                    images = Images(primary)
                    
                    # Varied pricing
                    base_price = template["base_price"]
                    price_variation = random.uniform(0.8, 2.5)
                    final_price = round(base_price * price_variation, 2)
                    price = Price(str(final_price), "USD")
                    
                    # Varied availability
                    availabilities = ["In Stock", "Only 3 left", "Limited time", "Prime delivery"]
                    availability = Availability(random.choice(availabilities))
                    listing = Listing(price, availability)
                    offers = Offers([listing])
                    
                    # Varied ratings
                    rating_value = round(random.uniform(3.5, 5.0), 1)
                    review_count = random.randint(50, 500)
                    star_rating = StarRating(str(rating_value))
                    customer_reviews = CustomerReviews(star_rating, review_count)
                    
                    item = Item(f"B{random.randint(10000000, 99999999)}", item_info, images, offers, customer_reviews)
                    items.append(item)
                
                return Response(items)
        except Exception as e:
            logging.error(f"PAAPI search error: {str(e)}")
            return None
    
    def get_product_details(self, asin: str):
        try:
            if self.client:
                return self.client.get_items(items=[asin])
            else:
                # Mock implementation for testing
                logging.info("Using mock implementation for get_product_details")
                from collections import namedtuple
                
                Item = namedtuple('Item', ['asin', 'item_info', 'images', 'offers', 'customer_reviews'])
                ItemInfo = namedtuple('ItemInfo', ['title'])
                Title = namedtuple('Title', ['display_value'])
                Images = namedtuple('Images', ['primary'])
                Primary = namedtuple('Primary', ['large'])
                Large = namedtuple('Large', ['url'])
                Offers = namedtuple('Offers', ['listings'])
                Listing = namedtuple('Listing', ['price', 'availability'])
                Price = namedtuple('Price', ['amount', 'currency'])
                Availability = namedtuple('Availability', ['message'])
                CustomerReviews = namedtuple('CustomerReviews', ['star_rating', 'count'])
                StarRating = namedtuple('StarRating', ['value'])
                
                Response = namedtuple('Response', ['items'])
                
                # Create mock item
                title = Title(f"Bluetooth Headphones {asin}")
                item_info = ItemInfo(title)
                
                large = Large(f"https://example.com/image-{asin}.jpg")
                primary = Primary(large)
                images = Images(primary)
                
                price = Price("59.99", "USD")
                availability = Availability("In Stock")
                listing = Listing(price, availability)
                offers = Offers([listing])
                
                star_rating = StarRating("4.5")
                customer_reviews = CustomerReviews(star_rating, 250)
                
                item = Item(asin, item_info, images, offers, customer_reviews)
                
                return Response([item])
        except Exception as e:
            logging.error(f"PAAPI get item error: {str(e)}")
            return None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ProductSearchRequest(BaseModel):
    query: str
    country: str = "US"
    page: int = 1

class AdvancedSearchRequest(BaseModel):
    query: str
    country: str = "US"
    page: int = 1
    # Filters
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    category: Optional[str] = None
    availability: Optional[str] = None
    # Sorting
    sort_by: Optional[str] = "relevance"  # relevance, price_low, price_high, rating, review_count
    # Search features
    include_suggestions: bool = False

class SearchSuggestion(BaseModel):
    query: str
    count: int

class CategoryData(BaseModel):
    name: str
    value: str
    count: int

class ProductData(BaseModel):
    asin: str
    title: str
    image_url: Optional[str] = None
    price: Optional[dict] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    affiliate_url: str
    country: str
    last_updated: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/products/search")
async def search_products(request: ProductSearchRequest):
    try:
        # Check MongoDB cache first (cache for 1 hour)
        cache_key = f"{request.query}_{request.country}_{request.page}"
        cached = await db.product_searches.find_one({
            "cache_key": cache_key,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if cached:
            return {"products": cached["results"], "cached": True}
        
        # PAAPI search request
        paapi_client = PAAPIClient(request.country)
        response = paapi_client.search_products(request.query, request.page)
        
        if not response or not hasattr(response, 'items') or not response.items:
            return {"products": [], "cached": False}
        
        # Process results
        processed_products = []
        if response and hasattr(response, 'items') and response.items:
            for item in response.items:
                try:
                    asin = item.asin if hasattr(item, 'asin') else ''
                    
                    # Get title
                    title = "Unknown"
                    if hasattr(item, 'item_info') and item.item_info and hasattr(item.item_info, 'title') and item.item_info.title:
                        title = item.item_info.title.display_value
                    
                    # Get image
                    image_url = None
                    if hasattr(item, 'images') and item.images and hasattr(item.images, 'primary') and item.images.primary and hasattr(item.images.primary, 'large'):
                        image_url = item.images.primary.large.url
                    
                    # Get price
                    price_data = None
                    if hasattr(item, 'offers') and item.offers and hasattr(item.offers, 'listings') and item.offers.listings:
                        price_info = item.offers.listings[0].price
                        if price_info and hasattr(price_info, 'amount'):
                            price_data = {
                                "amount": float(price_info.amount),
                                "currency": price_info.currency if hasattr(price_info, 'currency') else 'USD'
                            }
                    
                    # Get reviews
                    rating = None
                    review_count = None
                    if hasattr(item, 'customer_reviews') and item.customer_reviews:
                        if hasattr(item.customer_reviews, 'star_rating') and item.customer_reviews.star_rating:
                            rating = float(item.customer_reviews.star_rating.value)
                        if hasattr(item.customer_reviews, 'count'):
                            review_count = int(item.customer_reviews.count)
                    
                    # Auto-detect category from title
                    category = "General"
                    title_lower = title.lower()
                    if any(word in title_lower for word in ["headphone", "earbuds", "mouse", "cable", "phone"]):
                        category = "Electronics"
                    elif any(word in title_lower for word in ["mug", "pillow", "light", "pot", "storage"]):
                        category = "Home"
                    elif any(word in title_lower for word in ["moisturizer", "mask", "balm", "polish"]):
                        category = "Beauty"
                    elif any(word in title_lower for word in ["yoga", "bottle", "bands", "shoes"]):
                        category = "Sports"
                    elif any(word in title_lower for word in ["book", "guide", "novel"]):
                        category = "Books"
                    
                    product_data = {
                        "asin": asin,
                        "title": title,
                        "image_url": image_url,
                        "price": price_data,
                        "rating": rating,
                        "review_count": review_count,
                        "category": category,
                        "affiliate_url": f"https://www.amazon.com/dp/{asin}?tag={paapi_client.partner_tag}" if request.country == "US" else f"https://www.amazon.{request.country.lower()}/dp/{asin}?tag={paapi_client.partner_tag}",
                        "country": request.country,
                        "last_updated": datetime.utcnow().isoformat()
                    }
                    processed_products.append(product_data)
                except Exception as item_error:
                    logging.error(f"Error processing item: {str(item_error)}")
                    continue
        
        # Cache results for 1 hour
        await db.product_searches.insert_one({
            "cache_key": cache_key,
            "results": processed_products,
            "expires_at": datetime.utcnow() + timedelta(hours=1),
            "created_at": datetime.utcnow()
        })
        
        return {"products": processed_products, "cached": False}
        
    except Exception as e:
        logging.error(f"Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@api_router.post("/products/advanced-search")
async def advanced_search(request: AdvancedSearchRequest):
    try:
        # Generate cache key including filters
        cache_key = f"advanced_{request.query}_{request.country}_{request.page}_{request.min_price}_{request.max_price}_{request.min_rating}_{request.category}_{request.sort_by}"
        
        # Check cache first
        cached = await db.advanced_searches.find_one({
            "cache_key": cache_key,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if cached:
            return {
                "products": cached["results"], 
                "cached": True,
                "total_count": cached.get("total_count", 0),
                "filters_applied": cached.get("filters_applied", {}),
                "suggestions": cached.get("suggestions", [])
            }
        
        # Get base search results
        paapi_client = PAAPIClient(request.country)
        response = paapi_client.search_products(request.query, request.page, {
            "min_price": request.min_price,
            "max_price": request.max_price,
            "min_rating": request.min_rating,
            "category": request.category
        })
        
        if not response or not hasattr(response, 'items') or not response.items:
            return {"products": [], "cached": False, "total_count": 0}
        
        # Process and filter results
        processed_products = []
        for item in response.items:
            try:
                asin = item.asin if hasattr(item, 'asin') else ''
                
                # Get title
                title = "Unknown"
                if hasattr(item, 'item_info') and item.item_info and hasattr(item.item_info, 'title') and item.item_info.title:
                    title = item.item_info.title.display_value
                
                # Get image
                image_url = None
                if hasattr(item, 'images') and item.images and hasattr(item.images, 'primary') and item.images.primary and hasattr(item.images.primary, 'large'):
                    image_url = item.images.primary.large.url
                
                # Get price
                price_data = None
                price_amount = 0
                if hasattr(item, 'offers') and item.offers and hasattr(item.offers, 'listings') and item.offers.listings:
                    price_info = item.offers.listings[0].price
                    if price_info and hasattr(price_info, 'amount'):
                        price_amount = float(price_info.amount)
                        price_data = {
                            "amount": price_amount,
                            "currency": price_info.currency if hasattr(price_info, 'currency') else 'USD'
                        }
                
                # Get reviews
                rating = 0
                review_count = 0
                if hasattr(item, 'customer_reviews') and item.customer_reviews:
                    if hasattr(item.customer_reviews, 'star_rating') and item.customer_reviews.star_rating:
                        rating = float(item.customer_reviews.star_rating.value)
                    if hasattr(item.customer_reviews, 'count'):
                        review_count = int(item.customer_reviews.count)
                
                # Auto-detect category
                category = "General"
                title_lower = title.lower()
                if any(word in title_lower for word in ["headphone", "earbuds", "mouse", "cable", "phone"]):
                    category = "Electronics"
                elif any(word in title_lower for word in ["mug", "pillow", "light", "pot", "storage"]):
                    category = "Home"
                elif any(word in title_lower for word in ["moisturizer", "mask", "balm", "polish"]):
                    category = "Beauty"
                elif any(word in title_lower for word in ["yoga", "bottle", "bands", "shoes"]):
                    category = "Sports"
                elif any(word in title_lower for word in ["book", "guide", "novel"]):
                    category = "Books"
                
                # Apply filters
                if request.min_price and price_amount < request.min_price:
                    continue
                if request.max_price and price_amount > request.max_price:
                    continue
                if request.min_rating and rating < request.min_rating:
                    continue
                if request.category and category != request.category:
                    continue
                
                product_data = {
                    "asin": asin,
                    "title": title,
                    "image_url": image_url,
                    "price": price_data,
                    "rating": rating,
                    "review_count": review_count,
                    "category": category,
                    "affiliate_url": f"https://www.amazon.com/dp/{asin}?tag={paapi_client.partner_tag}" if request.country == "US" else f"https://www.amazon.{request.country.lower()}/dp/{asin}?tag={paapi_client.partner_tag}",
                    "country": request.country,
                    "last_updated": datetime.utcnow().isoformat()
                }
                processed_products.append(product_data)
            except Exception as item_error:
                logging.error(f"Error processing item: {str(item_error)}")
                continue
        
        # Apply sorting
        if request.sort_by == "price_low":
            processed_products.sort(key=lambda x: x["price"]["amount"] if x["price"] else 0)
        elif request.sort_by == "price_high":
            processed_products.sort(key=lambda x: x["price"]["amount"] if x["price"] else 0, reverse=True)
        elif request.sort_by == "rating":
            processed_products.sort(key=lambda x: x["rating"] or 0, reverse=True)
        elif request.sort_by == "review_count":
            processed_products.sort(key=lambda x: x["review_count"] or 0, reverse=True)
        
        # Generate suggestions if requested
        suggestions = []
        if request.include_suggestions:
            # Store search query for future suggestions
            await db.search_queries.update_one(
                {"query": request.query.lower()},
                {"$inc": {"count": 1}, "$set": {"last_used": datetime.utcnow()}},
                upsert=True
            )
            
            # Get popular related searches
            similar_queries = await db.search_queries.find({
                "query": {"$regex": f".*{request.query.lower()}.*"},
                "query": {"$ne": request.query.lower()}
            }).sort("count", -1).limit(5).to_list(5)
            
            suggestions = [{"query": q["query"], "count": q["count"]} for q in similar_queries]
        
        # Prepare response
        filters_applied = {
            "min_price": request.min_price,
            "max_price": request.max_price, 
            "min_rating": request.min_rating,
            "category": request.category,
            "sort_by": request.sort_by
        }
        
        # Cache results
        await db.advanced_searches.insert_one({
            "cache_key": cache_key,
            "results": processed_products,
            "total_count": len(processed_products),
            "filters_applied": filters_applied,
            "suggestions": suggestions,
            "expires_at": datetime.utcnow() + timedelta(hours=1),
            "created_at": datetime.utcnow()
        })
        
        return {
            "products": processed_products,
            "cached": False,
            "total_count": len(processed_products),
            "filters_applied": filters_applied,
            "suggestions": suggestions
        }
        
    except Exception as e:
        logging.error(f"Advanced search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Advanced search failed: {str(e)}")

@api_router.get("/categories")
async def get_categories():
    """Get available product categories with counts"""
    try:
        # For demo purposes, return static categories
        # In real implementation, this would query the database
        categories = [
            {"name": "Electronics", "value": "Electronics", "count": 150},
            {"name": "Home & Kitchen", "value": "Home", "count": 120},
            {"name": "Beauty & Personal Care", "value": "Beauty", "count": 95},
            {"name": "Sports & Outdoors", "value": "Sports", "count": 80},
            {"name": "Books", "value": "Books", "count": 65},
            {"name": "All Categories", "value": "", "count": 510}
        ]
        return {"categories": categories}
    except Exception as e:
        logging.error(f"Failed to get categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")

@api_router.get("/search-suggestions")
async def get_search_suggestions(q: str = ""):
    """Get search suggestions based on popular queries"""
    try:
        if not q:
            # Return popular searches
            popular = await db.search_queries.find().sort("count", -1).limit(10).to_list(10)
            return {"suggestions": [p["query"] for p in popular]}
        
        # Return queries that match the input
        similar = await db.search_queries.find({
            "query": {"$regex": f"^{q.lower()}.*"}
        }).sort("count", -1).limit(8).to_list(8)
        
        return {"suggestions": [s["query"] for s in similar]}
    except Exception as e:
        logging.error(f"Failed to get suggestions: {str(e)}")
        return {"suggestions": []}

@api_router.get("/products/{asin}")
async def get_product_details(asin: str, country: str = "US"):
    try:
        # Check cache first (cache for 30 minutes)
        cached = await db.products.find_one({
            "asin": asin,
            "country": country,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if cached:
            return {"product": cached["data"], "cached": True}
        
        # Fetch from PAAPI
        paapi_client = PAAPIClient(country)
        response = paapi_client.get_product_details(asin)
        
        if not response or not response.items:
            raise HTTPException(status_code=404, detail="Product not found")
        
        item = response.items[0]
        
        price_data = None
        availability = "Unknown"
        if hasattr(item, 'offers') and item.offers and hasattr(item.offers, 'listings') and item.offers.listings:
            price_info = item.offers.listings[0].price
            if price_info and hasattr(price_info, 'amount'):
                price_data = {
                    "amount": float(price_info.amount),
                    "currency": price_info.currency if hasattr(price_info, 'currency') else 'USD'
                }
            if hasattr(item.offers.listings[0], 'availability') and item.offers.listings[0].availability:
                availability = item.offers.listings[0].availability.message
        
        rating = None
        review_count = None
        if hasattr(item, 'customer_reviews') and item.customer_reviews:
            if hasattr(item.customer_reviews, 'star_rating') and item.customer_reviews.star_rating:
                rating = float(item.customer_reviews.star_rating.value)
            if hasattr(item.customer_reviews, 'count'):
                review_count = int(item.customer_reviews.count)
        
        title = "Unknown"
        if hasattr(item, 'item_info') and item.item_info and hasattr(item.item_info, 'title') and item.item_info.title:
            title = item.item_info.title.display_value
        
        image_url = None
        if hasattr(item, 'images') and item.images and hasattr(item.images, 'primary') and item.images.primary and hasattr(item.images.primary, 'large'):
            image_url = item.images.primary.large.url
        
        product_data = {
            "asin": item.asin,
            "title": title,
            "image_url": image_url,
            "price": price_data,
            "availability": availability,
            "rating": rating,
            "review_count": review_count,
            "affiliate_url": f"https://www.amazon.com/dp/{item.asin}?tag={paapi_client.partner_tag}" if country == "US" else f"https://www.amazon.{country.lower()}/dp/{item.asin}?tag={paapi_client.partner_tag}",
            "country": country,
            "last_updated": datetime.utcnow().isoformat()
        }
        
        # Cache for 30 minutes
        await db.products.update_one(
            {"asin": asin, "country": country},
            {
                "$set": {
                    "data": product_data,
                    "expires_at": datetime.utcnow() + timedelta(minutes=30),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"product": product_data, "cached": False}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get product details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get product details: {str(e)}")

@api_router.get("/products/{asin}/price")
async def get_real_time_price(asin: str, country: str = "US"):
    try:
        # Check for recent price data (5 minutes)
        recent_price = await db.prices.find_one({
            "asin": asin,
            "country": country,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if recent_price:
            return {"price": recent_price["price_data"], "cached": True}
        
        # Fetch fresh price data
        paapi_client = PAAPIClient(country)
        response = paapi_client.get_product_details(asin)
        
        if not response or not response.items or not response.items[0].offers:
            raise HTTPException(status_code=404, detail="Price not available")
        
        item = response.items[0]
        price_info = item.offers.listings[0].price
        
        price_data = {
            "amount": float(price_info.amount) if price_info.amount else None,
            "currency": price_info.currency if price_info.currency else None,
            "availability": item.offers.listings[0].availability.message if item.offers.listings[0].availability else "Unknown",
            "last_updated": datetime.utcnow().isoformat(),
            "affiliate_url": f"https://www.amazon.com/dp/{asin}?tag={paapi_client.partner_tag}" if country == "US" else f"https://www.amazon.{country.lower()}/dp/{asin}?tag={paapi_client.partner_tag}"
        }
        
        # Cache price for 5 minutes
        await db.prices.update_one(
            {"asin": asin, "country": country},
            {
                "$set": {
                    "price_data": price_data,
                    "expires_at": datetime.utcnow() + timedelta(minutes=5),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"price": price_data, "cached": False}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get price: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get price: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
