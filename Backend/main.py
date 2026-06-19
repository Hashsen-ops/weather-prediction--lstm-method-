from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from weather_api import get_weather, get_weather_by_city, get_forecast, get_forecast_by_city
from datetime import datetime

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

def parse_weather(weather_data, forecast_data):
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

    # hourly forecast (next 8 = 24 hours)
    hourly = []
    for item in forecast_data["list"][:8]:
        hourly.append({
            "time": datetime.fromtimestamp(item["dt"]).strftime("%I%p"),
            "temp": round(item["main"]["temp"], 1)
        })

    # daily forecast (next 5 days)
    daily = {}
    for item in forecast_data["list"]:
        day = datetime.fromtimestamp(item["dt"]).strftime("%a")
        if day not in daily:
            daily[day] = {
                "day": day,
                "icon": item["weather"][0]["icon"],
                "max": item["main"]["temp_max"],
                "min": item["main"]["temp_min"]
            }
        else:
            daily[day]["max"] = max(daily[day]["max"], item["main"]["temp_max"])
            daily[day]["min"] = min(daily[day]["min"], item["main"]["temp_min"])

    return {
        "city": city,
        "temperature": temperature,
        "humidity": humidity,
        "condition": condition,
        "season": season,
        "is_day": is_day,
        "prediction": "Rain Possible Tomorrow",
        "pressure": weather_data["main"]["pressure"],
        "wind_speed": weather_data["wind"]["speed"],
        "wind_direction": weather_data["wind"]["deg"],
        "visibility": weather_data.get("visibility", 0),
        "latitude": weather_data["coord"]["lat"],
        "longitude": weather_data["coord"]["lon"],
        "description": weather_data["weather"][0]["description"],
        "icon_code": icon,
        "hourly": hourly,
        "daily": list(daily.values())[:5]
    }

@app.get("/")
def home():
    return {"message": "Weather Prediction API Running"}

@app.post("/predict")
def predict(location: Location):
    weather_data = get_weather(location.latitude, location.longitude)
    forecast_data = get_forecast(location.latitude, location.longitude)
    return parse_weather(weather_data, forecast_data)

@app.get("/city/{city_name}")
def get_city_weather(city_name: str):
    weather_data = get_weather_by_city(city_name)
    if "main" not in weather_data:
        return {"error": "City not found"}
    forecast_data = get_forecast_by_city(city_name)
    return parse_weather(weather_data, forecast_data)