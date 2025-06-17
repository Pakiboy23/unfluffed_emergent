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
    "US": {"host": "webservices.amazon.com", "region": "us-east-1"},
    "UK": {"host": "webservices.amazon.co.uk", "region": "eu-west-1"},
    "CA": {"host": "webservices.amazon.ca", "region": "us-east-1"}
}

class PAAPIClient:
    def __init__(self, country: str):
        if not AmazonApi:
            raise HTTPException(status_code=503, detail="Amazon API not available")
        
        config = REGIONAL_CONFIG[country]
        self.client = AmazonApi(
            access_key=os.environ['PAAPI_ACCESS_KEY'],
            secret_key=os.environ['PAAPI_SECRET_KEY'],
            partner_tag=os.environ['PARTNER_TAG'],
            country=country.upper(),
            throttling=1.5
        )
        self.country = country
    
    def search_products(self, keywords: str, page: int = 1):
        try:
            return self.client.search_items(
                keywords=keywords,
                search_index="All",
                item_count=min(10, 10),  # Max 10 items per request
                resources=[
                    "Images.Primary.Large",
                    "ItemInfo.Title",
                    "Offers.Listings.Price", 
                    "CustomerReviews.StarRating",
                    "CustomerReviews.Count"
                ]
            )
        except Exception as e:
            logging.error(f"PAAPI search error: {str(e)}")
            return None
    
    def get_product_details(self, asin: str):
        try:
            return self.client.get_items(
                [asin],
                resources=[
                    "Images.Primary.Large",
                    "ItemInfo.Title",
                    "Offers.Listings.Price",
                    "Offers.Listings.Availability.Message",
                    "CustomerReviews.StarRating",
                    "CustomerReviews.Count"
                ]
            )
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
        for item in response.items:
            try:
                price_data = None
                if hasattr(item, 'offers') and item.offers and item.offers.listings:
                    price_info = item.offers.listings[0].price
                    if price_info:
                        price_data = {
                            "amount": float(price_info.amount) if price_info.amount else None,
                            "currency": price_info.currency if price_info.currency else None
                        }
                
                rating = None
                review_count = None
                if hasattr(item, 'customer_reviews') and item.customer_reviews:
                    if item.customer_reviews.star_rating:
                        rating = float(item.customer_reviews.star_rating.value)
                    if item.customer_reviews.count:
                        review_count = int(item.customer_reviews.count)
                
                product_data = {
                    "asin": item.asin,
                    "title": item.item_info.title.display_value if item.item_info and item.item_info.title else "Unknown",
                    "image_url": item.images.primary.large.url if item.images and item.images.primary and item.images.primary.large else None,
                    "price": price_data,
                    "rating": rating,
                    "review_count": review_count,
                    "affiliate_url": f"https://amazon.{request.country.lower()}/dp/{item.asin}?tag={os.environ['PARTNER_TAG']}",
                    "country": request.country,
                    "last_updated": datetime.utcnow().isoformat()
                }
                processed_products.append(product_data)
            except Exception as item_error:
                logging.error(f"Error processing item {item.asin}: {str(item_error)}")
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
        if hasattr(item, 'offers') and item.offers and item.offers.listings:
            price_info = item.offers.listings[0].price
            if price_info:
                price_data = {
                    "amount": float(price_info.amount) if price_info.amount else None,
                    "currency": price_info.currency if price_info.currency else None
                }
            if item.offers.listings[0].availability:
                availability = item.offers.listings[0].availability.message
        
        rating = None
        review_count = None
        if hasattr(item, 'customer_reviews') and item.customer_reviews:
            if item.customer_reviews.star_rating:
                rating = float(item.customer_reviews.star_rating.value)
            if item.customer_reviews.count:
                review_count = int(item.customer_reviews.count)
        
        product_data = {
            "asin": item.asin,
            "title": item.item_info.title.display_value if item.item_info and item.item_info.title else "Unknown",
            "image_url": item.images.primary.large.url if item.images and item.images.primary else None,
            "price": price_data,
            "availability": availability,
            "rating": rating,
            "review_count": review_count,
            "affiliate_url": f"https://amazon.{country.lower()}/dp/{item.asin}?tag={os.environ['PARTNER_TAG']}",
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
            "last_updated": datetime.utcnow().isoformat()
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
