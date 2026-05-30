const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let animationType = "clear";

function getLocation(){

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(success, error);

    }else{
        alert("Geolocation not supported");
    }
}

function searchCity(){

    const city = document.getElementById("cityInput").value;

    fetch(`http://127.0.0.1:8000/city/${city}`)

    .then(response => response.json())

    .then(data => {

        document.getElementById("result").innerHTML = `
            <h2>${data.city}</h2>
            <p>${data.temperature}°C</p>
            <p>${data.condition}</p>
            <p>Humidity: ${data.humidity}%</p>
            <p>${data.prediction}</p>
        `;

        setTheme(
            data.season,
            data.is_day,
            data.condition
        );
    });
}

function success(position){

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetch("http://127.0.0.1:8000/predict",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            latitude:latitude,
            longitude:longitude
        })
    })

    .then(response => response.json())
    .then(data => {

        document.getElementById("result").innerHTML = `
            <h2>${data.city}</h2>
            <p>${data.temperature}°C</p>
            <p>${data.condition}</p>
            <p>Humidity: ${data.humidity}%</p>
            <p>${data.prediction}</p>
        `;

        setTheme(data.season, data.is_day, data.condition);
    });
}

function error(){
    alert("Location access denied or unavailable");
}

function setTheme(season, isDay, condition){

    particles = [];

    if(condition.toLowerCase() === "rain"){

        animationType = "rain";

        document.body.style.background = isDay
        ? "linear-gradient(to bottom, #4e54c8, #8f94fb)"
        : "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)";
    }

    else if(season === "winter"){

        animationType = "snow";

        document.body.style.background = isDay
        ? "linear-gradient(to bottom, #83a4d4, #b6fbff)"
        : "linear-gradient(to bottom, #141e30, #243b55)";
    }

    else if(season === "summer"){

        animationType = "sun";

        document.body.style.background = isDay
        ? "linear-gradient(to bottom, #f7971e, #ffd200)"
        : "linear-gradient(to bottom, #232526, #414345)";
    }

    else{

        animationType = "leaves";

        document.body.style.background = isDay
        ? "linear-gradient(to bottom, #d38312, #a83279)"
        : "linear-gradient(to bottom, #0f2027, #2c5364)";
    }

    createParticles();
}

function createParticles(){

    for(let i=0; i<200; i++){

        particles.push({
            x:Math.random() * canvas.width,
            y:Math.random() * canvas.height,
            radius:Math.random() * 4,
            speed:Math.random() * 5 + 1
        });
    }
}

function animate(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach((p) => {

        if(animationType === "rain"){

            ctx.fillStyle = "rgba(173,216,230,0.8)";
            ctx.fillRect(p.x,p.y,2,15);
            p.y += p.speed * 4;
        }

        else if(animationType === "snow"){

            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
            ctx.fill();
            p.y += p.speed;
        }

        else if(animationType === "sun"){

            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
            ctx.fill();
            p.y += 0.3;
        }

        else if(animationType === "leaves"){

            ctx.fillStyle = "orange";
            ctx.fillRect(p.x,p.y,8,8);
            p.y += p.speed;
            p.x += Math.sin(p.y/20);
        }

        if(p.y > canvas.height){
            p.y = 0;
            p.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(animate);
}

animate();