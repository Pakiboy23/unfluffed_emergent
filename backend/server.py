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
from amazon.paapi import AmazonApi


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
        config = REGIONAL_CONFIG[country]
        self.client = AmazonApi(
            access_key=os.environ['PAAPI_ACCESS_KEY'],
            secret_key=os.environ['PAAPI_SECRET_KEY'],
            partner_tag=os.environ['PARTNER_TAG'],
            host=config["host"],
            region=config["region"],
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
