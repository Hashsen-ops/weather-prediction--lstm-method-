import requests

API_KEY = "195d59f9eb85050dc9eba7caf6a86ebb"

def get_weather(lat, lon):

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    )

    response = requests.get(url)

    return response.json()


def get_weather_by_city(city):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city},IN&appid={API_KEY}&units=metric"

    response = requests.get(url)
    return response.json()
