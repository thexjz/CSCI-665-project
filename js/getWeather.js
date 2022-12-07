// Select elements in the weather portion of the page
const iconPlaceholder = document.querySelector(".weather-icon");
const temperaturePlaceholder = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationPlaceholder = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");

// App data
const weather = {};

weather.temperature = {
    unit: "celsius"
}

// APP CONSTS AND VARS
const KELVIN = 273;
// API KEY
const weatherAPIkey = "82005d27a116c2880c8f0fcb866998a0";
const geoAPIkey = "7a4da723085845f28398c60f0d120804"
// GeoLocation check
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(setGPSPosition, errorHandle);
} else {
    setIPPosition();
}


// If GPS location is available, set GPS location
function setGPSPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    getWeather(latitude, longitude);
}
function setIPPosition(position) {

    fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${geoAPIkey}`, {
        method: 'GET'
    })
        .then(function (response) { return response.json(); })
        .then(function (json) {
            let parsedIPData = json;
            console.log(parsedIPData);
            let latitude = parsedIPData.location.latitude;
            let longitude = parsedIPData.location.longitude;
            getWeather(latitude, longitude);
        });


}

// Error Handling for GEO location API. If user denies location, use IP address to get location
function errorHandle(error) {
    notificationElement.style.display = "block";
    if (error.message == `User denied Geolocation`) {
        notificationElement.innerHTML = `<p> ${error.message}<br>Using your IP address location to provide data</p>`;
        setIPPosition();
    }
    else {
        notificationElement.innerHTML = `<p> ${error.message}</p>`;
    }
}

    // Get weather from API provider Openweatehrmap.org
    function getWeather(latitude, longitude) {
        let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherAPIkey}`;

        fetch(api)
            .then(function (response) {
                let data = response.json();
                return data;
            })
            .then(function (data) {
                weather.temperature.value = Math.floor(data.main.temp - KELVIN);
                weather.description = data.weather[0].description;
                weather.iconId = data.weather[0].icon;
                weather.city = data.name;
                weather.country = data.sys.country;
            })
            .then(function () {
                displayWeather();
            });
    }

    // Load Weather to UI
    function displayWeather() {
        iconPlaceholder.innerHTML = `<img src="./assets/icons/${weather.iconId}.png"/>`;
        temperaturePlaceholder.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        descElement.innerHTML = weather.description;
        locationPlaceholder.innerHTML = `${weather.city}, ${weather.country}`;
    }

    // C to F conversion... Only for Americans... 
    function celsiusToFahrenheit(temperature) {
        return (temperature * 9 / 5) + 32;
    }

    // For rest of the world when they don't understand american LMAO
    temperaturePlaceholder.addEventListener("click", function () {
        if (weather.temperature.value === undefined) return;

        if (weather.temperature.unit == "celsius") {
            let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
            fahrenheit = Math.floor(fahrenheit);

            temperaturePlaceholder.innerHTML = `${fahrenheit}°<span>F</span>`;
            weather.temperature.unit = "fahrenheit";
        } else {
            temperaturePlaceholder.innerHTML = `${weather.temperature.value}°<span>C</span>`;
            weather.temperature.unit = "celsius";
        }
    })