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

    document.getElementById("descText").textContent = "Loading... please wait ⏳";

    fetch(`${API_URL}/city/${city}`)
        .then(r => r.json())
        .then(data => updateUI(data))
        .catch(() => {
            document.getElementById("descText").textContent = "Server waking up... try again in 10 seconds ⏳";
        });
}

function success(position) {
    document.getElementById("descText").textContent = "Loading... please wait ⏳";

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
        .catch(() => {
            document.getElementById("descText").textContent = "Server waking up... try again in 10 seconds ⏳";
        });
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

function setTheme(isDay, condition) {
    let bg = "";

    if (!isDay) {
        bg = "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
    } else if (condition.toLowerCase().includes("rain")) {
        bg = "linear-gradient(180deg, #4a6fa5 0%, #6b8cba 50%, #9db4d4 100%)";
    } else if (condition.toLowerCase().includes("cloud")) {
        bg = "linear-gradient(180deg, #8fa8c8 0%, #b4c8e0 50%, #d4e4f4 100%)";
    } else if (condition.toLowerCase().includes("clear")) {
        bg = "linear-gradient(180deg, #1a90d9 0%, #56aee2 40%, #87CEEB 100%)";
    } else if (condition.toLowerCase().includes("haze") || condition.toLowerCase().includes("mist")) {
        bg = "linear-gradient(180deg, #b8c6db 0%, #d4dde8 100%)";
    } else {
        bg = "linear-gradient(180deg, #1a90d9 0%, #56aee2 40%, #87CEEB 100%)";
    }

    document.body.style.background = bg;
    document.body.style.transition = "background 1.5s ease";
}