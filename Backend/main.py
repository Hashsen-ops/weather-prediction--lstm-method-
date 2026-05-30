from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from weather_api import get_weather, get_weather_by_city

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Location(BaseModel):
    latitude: float
    longitude: float

@app.get("/")
def home():
    return {"message": "Weather Prediction API Running"}

@app.post("/predict")
def predict(location: Location):

    lat = location.latitude
    lon = location.longitude

    weather_data = get_weather(lat, lon)

    temperature = weather_data["main"]["temp"]
    humidity = weather_data["main"]["humidity"]
    condition = weather_data["weather"][0]["main"]
    icon = weather_data["weather"][0]["icon"]
    city = weather_data["name"]

    is_day = icon.endswith("d")

    if temperature >= 35:
        season = "summer"

    elif temperature <= 15:
        season = "winter"

    elif condition.lower() == "rain":
        season = "rain"

    else:
        season = "autumn"

    prediction = "Rain Possible Tomorrow"

    return {
        "city": city,
        "temperature": temperature,
        "humidity": humidity,
        "condition": condition,
        "season": season,
        "is_day": is_day,
        "prediction": prediction
    }

@app.get("/city/{city_name}")
def get_city_weather(city_name: str):

    weather_data = get_weather_by_city(city_name)

    if "main" not in weather_data:
        return {
            "error": "City not found",
            "details": weather_data
        }

    temperature = weather_data["main"]["temp"]
    humidity = weather_data["main"]["humidity"]
    condition = weather_data["weather"][0]["main"]
    icon = weather_data["weather"][0]["icon"]
    city = weather_data["name"]

    is_day = icon.endswith("d")

    if temperature >= 35:
        season = "summer"
    elif temperature <= 15:
        season = "winter"
    elif condition.lower() == "rain":
        season = "rain"
    else:
        season = "autumn"

    prediction = "Rain Possible Tomorrow"

    return {
        "city": city,
        "temperature": temperature,
        "humidity": humidity,
        "condition": condition,
        "season": season,
        "is_day": is_day,
        "prediction": prediction
    }