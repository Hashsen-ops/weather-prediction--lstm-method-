const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let animationType = "clear";
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

function error() { alert("Location access denied"); }

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

    // 5 day forecast
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

    // hourly chart
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

    setTheme(data.season, data.is_day, data.condition);
}

function setTheme(season, isDay, condition) {
    particles = [];
    if (condition.toLowerCase() === "rain") {
        animationType = "rain";
        document.body.style.background = isDay
            ? "linear-gradient(to bottom, #4e54c8, #8f94fb)"
            : "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)";
    } else if (season === "winter") {
        animationType = "snow";
        document.body.style.background = isDay
            ? "linear-gradient(to bottom, #83a4d4, #b6fbff)"
            : "linear-gradient(to bottom, #141e30, #243b55)";
    } else if (season === "summer") {
        animationType = "sun";
        document.body.style.background = isDay
            ? "linear-gradient(to bottom, #f7971e, #ffd200)"
            : "linear-gradient(to bottom, #232526, #414345)";
    } else {
        animationType = "leaves";
        document.body.style.background = isDay
            ? "linear-gradient(to bottom, #d38312, #a83279)"
            : "linear-gradient(to bottom, #0f2027, #2c5364)";
    }
    createParticles();
}

function createParticles() {
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4,
            speed: Math.random() * 5 + 1
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        if (animationType === "rain") {
            ctx.fillStyle = "rgba(173,216,230,0.8)";
            ctx.fillRect(p.x, p.y, 2, 15);
            p.y += p.speed * 4;
        } else if (animationType === "snow") {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed;
        } else if (animationType === "sun") {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.y += 0.3;
        } else if (animationType === "leaves") {
            ctx.fillStyle = "orange";
            ctx.fillRect(p.x, p.y, 8, 8);
            p.y += p.speed;
            p.x += Math.sin(p.y / 20);
        }
        if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
        }
    });
    requestAnimationFrame(animate);
}

animate();



// git add frontend/script.js
// git commit -m "fix: correct render URL"
// git push origin master
