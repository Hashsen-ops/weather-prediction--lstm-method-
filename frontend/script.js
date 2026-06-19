let hourlyChartInstance = null;

const API_URL = "https://weather-prediction-lstm-method.onrender.com";

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation not supported");
    }
}

function searchCity() {
    const city = document.getElementById("cityInput").value;
    if (!city) return;
    fetch(`${API_URL}/city/${city}`)
        .then(r => r.json())
        .then(data => updateUI(data))
        .catch(() => alert("Error fetching weather!"));
}

function success(position) {
    fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    })
        .then(r => r.json())
        .then(data => updateUI(data))
        .catch(() => alert("Error fetching weather!"));
}

function error() {
    alert("Location access denied");
}

function updateUI(data) {
    const date = new Date();
    document.getElementById("dateStr").textContent = date.toLocaleDateString('en-US', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    });

    document.getElementById("cityName").textContent = data.city + ", India";
    document.getElementById("tempVal").textContent = Math.round(data.temperature);
    document.getElementById("descText").textContent = data.description || "";
    document.getElementById("humVal").textContent = data.humidity + " %";
    document.getElementById("pressVal").textContent = (data.pressure || "--") + " hPa";
    document.getElementById("windVal").textContent = (data.wind_speed || "--") + " m/s";
    document.getElementById("dirVal").textContent = (data.wind_direction || "--") + "°";
    document.getElementById("visVal").textContent = (data.visibility || "--") + " m";
    document.getElementById("latVal").textContent = data.latitude || "--";
    document.getElementById("lonVal").textContent = data.longitude || "--";

    if (data.icon_code) {
        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${data.icon_code}@2x.png`;
    }

    if (data.daily) {
        const grid = document.getElementById("dailyGrid");
        grid.innerHTML = "";
        data.daily.forEach((day, i) => {
            grid.innerHTML += `
                <div class="day-card ${i === 0 ? 'active' : ''}">
                    <div class="day-name">${day.day}</div>
                    <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="">
                    <div class="max-temp">${Math.round(day.max)}°</div>
                    <div class="min-temp">${Math.round(day.min)}°</div>
                </div>`;
        });
    }

    if (data.hourly) {
        const labels = data.hourly.map(h => h.time);
        const temps = data.hourly.map(h => h.temp);

        if (hourlyChartInstance) hourlyChartInstance.destroy();

        hourlyChartInstance = new Chart(
            document.getElementById("hourlyChart"), {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    data: temps,
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "white",
                    pointRadius: 5,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ctx.parsed.y + "°C"
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "white", font: { size: 11 } },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    },
                    y: {
                        ticks: {
                            color: "white",
                            font: { size: 11 },
                            callback: val => val + "°"
                        },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    }
                }
            }
        });
    }

    setTheme(data.is_day);
}

function setTheme(isDay) {
    if (isDay) {
        document.body.style.background = "url('https://images.unsplash.com/photo-1601297183305-073045b8d9f5?w=1600&q=80') center/cover no-repeat";
    } else {
        document.body.style.background = "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
    }
    
}