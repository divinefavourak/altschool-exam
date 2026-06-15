// Define DOM selectors
const searchBtn = document.getElementById('search-btn');
const searchBox = document.getElementById('search-box');
const cityDisplay = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const uvIndexValue = document.getElementById('uv-index-value');
const humidityValue = document.getElementById('humidity-value');
const windSpeedValue = document.getElementById('wind-speed-value');
const forecastDay = document.getElementById('forecast-day');
const errorMessage = document.getElementById('error-message');
const spinner = document.querySelector('.spinner');
const loadingText = document.getElementById('loading-text');
const weatherInfoRow = document.querySelector('.weather-info-row');
const tempSwitch = document.getElementById('temp-switch');

// API configurations
const geolocationApi = "https://geocoding-api.open-meteo.com/v1/search?&count=1&language=en&format=json";
const weatherDataApi = "https://api.open-meteo.com/v1/forecast?current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,uv_index_max,weather_code&timezone=auto";

// Global state variables
let isFahrenheit = false;
let city = "Lagos";

/**
 * Fetches the coordinates (latitude, longitude, name, country) for a given city name.
 * Uses the Open-Meteo Geocoding API.
 */
async function getGeolocation(location) {
    const response = await fetch(`${geolocationApi}&name=${encodeURIComponent(location)}`);
    const results = await response.json();
    if (!results.results || results.results.length === 0) {
        throw new Error("City not found");
    }
    const countryName = results.results[0].country;
    const cityName = results.results[0].name;
    const latitude = results.results[0].latitude;
    const longitude = results.results[0].longitude;
    console.log(`Value for latitude is ${latitude}\nLongitude is ${longitude}`);
    return { latitude, longitude, countryName, cityName };
}

/**
 * Fetches forecast and current weather data using coordinates.
 * Saves the response object directly into localStorage.
 */
async function getWeatherData(latitude, longitude) {
    try {
        const weatherData = await fetch(`${weatherDataApi}&latitude=${latitude}&longitude=${longitude}`);
        const weatherResults = await weatherData.json();
        localStorage.setItem("weatherData", JSON.stringify(weatherResults));
        console.log(weatherResults);
    } catch(error) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "&#9888; Unable to get weather";
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 5000);
        console.error("Failed to fetch weather details:", error);
    }  
}

/**
 * Updates the main card, text descriptions, and statistics container.
 * Also triggers the five-day forecast loader.
 */
async function displayWeatherData(cityName, countryName) {
    const weatherData = localStorage.getItem("weatherData");
    if (weatherData) {
        const weatherResults = JSON.parse(weatherData);
        cityDisplay.innerHTML = `${cityName}, ${countryName}`;
        
        // Render current temperature
        temperature.innerHTML = formatTemp(weatherResults.current.temperature_2m);
        
        // Get weather description and icon
        const weatherDetails = getWeatherCodeDescription(weatherResults.current.weather_code);
        weatherIcon.innerHTML = `<span class="${weatherDetails.animation}">${weatherDetails.icon}</span>`;
        
        // Format feels-like and description: "Sunny · Feels like 32 °C"
        const feelsLikeVal = formatTemp(weatherResults.current.temperature_2m);
        description.innerHTML = `${weatherDetails.description} &middot; Feels like ${feelsLikeVal}`;

        // Populate detail indicators
        humidityValue.innerHTML = `${weatherResults.current.relative_humidity_2m} %`;
        windSpeedValue.innerHTML = `${weatherResults.current.wind_speed_10m} km/h`;
        
        // Get UV index descriptor
        const todayUv = getUvIndexDescription(weatherResults.daily.uv_index_max[0]);
        uvIndexValue.innerHTML = `${todayUv}`;
        
        // Trigger rendering of the 5-day forecast
        await getFiveDayForecast();       
        
        // Hide the loading spinner once data is fully rendered
        hideSpinner();
    }
}

/**
 * Converts a WMO weather code to its human-readable text and emoji representation,
 * along with its custom CSS animation class.
 */
function getWeatherCodeDescription(weatherCode) {
    switch (weatherCode) {
        case 0:
            return { description: "Clear sky", icon: "☀️", animation: "weather-spin" };
        case 1:
        case 2:
        case 3:
            return { description: "Partly cloudy", icon: "⛅", animation: "weather-float" };
        case 45:
        case 48:
            return { description: "Foggy", icon: "🌫", animation: "weather-float" };
        case 51:
        case 53:
        case 55:
            return { description: "Drizzle", icon: "🌧️", animation: "weather-pulse" };
        case 61:
        case 63:
        case 65:
            return { description: "Rain", icon: "🌧️", animation: "weather-pulse" };
        case 71:
        case 73:
        case 75:
            return { description: "Snow", icon: "❄️", animation: "weather-pulse" };
        case 80:
        case 81:
        case 82:
            return { description: "Rain showers", icon: "🌦", animation: "weather-pulse" };
        case 95:
            return { description: "Thunderstorm", icon: "⛈️", animation: "weather-pulse" };
        default:
            return { description: "Weather not found", icon: "🫠", animation: "weather-float" };
    }
}

/**
 * Categorizes a numeric UV Index into a descriptive tag with visual indicator.
 */
function getUvIndexDescription(uvIndexValue) {
    if (uvIndexValue <= 2) {
        return "Low";
    } else if (uvIndexValue <= 5) {
        return "Moderate";
    } else if (uvIndexValue <= 7) {
        return "High";
    } else if (uvIndexValue <= 10) {
        return "Very High";
    } else {
        return "Extreme";
    }
}

/**
 * Loads the forecast data from localStorage and renders the card list row-by-row.
 * Starts from index 0 ("Today").
 */
async function getFiveDayForecast() {
    try {
        const response = localStorage.getItem("weatherData");
        const weatherResults = JSON.parse(response);
        const daily = weatherResults.daily;
        let forecastHtml = '';
        
        // Loop from index 0 (Today) through index 4 (5 days)
        for (let i = 0; i < 5; i++) {
            const date = daily.time[i];
            const maxTemperature = formatTemp(daily.temperature_2m_max[i]);
            const minTemperature = formatTemp(daily.temperature_2m_min[i]);
            const weatherCode = daily.weather_code[i];

            // Render "Today" for index 0, or the weekday name
            let dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            if (i === 0) {
                dayOfWeek = "Today";
            }
            
            const weatherCondition = getWeatherCodeDescription(weatherCode);
            
            // Build the row card HTML
            forecastHtml += `
            <div class="forecast-row-card">
                <span class="forecast-day-name">${dayOfWeek}</span>
                <span class="forecast-icon ${weatherCondition.animation}">${weatherCondition.icon}</span>
                <div class="forecast-temps">
                    <span class="forecast-temp-max">${maxTemperature}</span>
                    <span class="forecast-temp-min">${minTemperature}</span>
                </div>
            </div>
            `;
        }
        // Update DOM once
        if (forecastDay) {
            forecastDay.innerHTML = forecastHtml;
        }
    } catch(error) {
        console.error("Error displaying five day forecast:", error);      
    }
}

/**
 * Stores searched city into history, avoiding duplicates and maintaining size of 5.
 */
function searchHistory(cityName) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history = history.filter(item => item !== cityName);
    history.unshift(cityName);
    if (history.length > 5) {
        history.pop();
    }
    localStorage.setItem("searchHistory", JSON.stringify(history));
    loadSearchHistory();
}

/**
 * Appends history searches to autocomplete datalist.
 */
function loadSearchHistory() {
    const listContainer = document.getElementById("search-history-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history.forEach(city => {
        const option = document.createElement("option");
        option.value = city; 
        listContainer.appendChild(option);
    });
}

/**
 * Helper to convert celsius value into Fahrenheit dynamically if toggled.
 */
function formatTemp(celsius) {
    if (isFahrenheit) {
        const fahrenheit = Math.round(celsius * 9/5 + 32);
        return `${fahrenheit}°`;
    }
    return `${celsius}°`; // standard formatting without unit suffix inside forecast rows
}

// Event listener for search button
searchBtn.addEventListener("click", async () => {
    const location = searchBox.value;
    if (!location) return;
    showSpinner();
    try { 
        const { latitude, longitude, countryName, cityName } = await getGeolocation(location);
        searchHistory(cityName);
        await getWeatherData(latitude, longitude);
        await displayWeatherData(cityName, countryName);
    } catch (error) {
        console.error("Search failed:", error);
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "&#9888; City not found";
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 5000);
        hideSpinner();
    }
});

// Event listener for optional temp switch
if (tempSwitch) {
    tempSwitch.addEventListener("change", () => {
        isFahrenheit = tempSwitch.checked;
        const parts = cityDisplay.innerHTML.split(',');
        const cityName = parts[0].trim();
        const countryName = parts[1] ? parts[1].trim() : "";
        displayWeatherData(cityName, countryName);
    });
}

// Spinner toggling helpers
function showSpinner() {
    if (spinner) spinner.style.display = "block";
    if (loadingText) loadingText.style.display = "block";
    if (cityDisplay) cityDisplay.style.display = "none";
    if (weatherIcon) weatherIcon.style.display = "none";
    if (weatherInfoRow) weatherInfoRow.style.display = "none";
}

function hideSpinner() {
    if (spinner) spinner.style.display = "none";
    if (loadingText) loadingText.style.display = "none";
    if (cityDisplay) cityDisplay.style.display = "block";
    if (weatherIcon) weatherIcon.style.display = "block";
    if (weatherInfoRow) weatherInfoRow.style.display = "flex";
}

// On page load geolocation flow
window.onload = () => {
    loadSearchHistory();
    if (navigator.geolocation) {
        showSpinner();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                await getWeatherData(lat, long);
                displayWeatherData("Current location", "");
            },
            async (error) => {
                console.warn("Geolocation access was denied. Using default location....", error);
                loadDefaultCity();
            }
        );
    } else {
        console.warn("Geolocation not supported by browser. Using default location....");
        loadDefaultCity();
    }
};

// Fallback loader for default city (Lagos)
async function loadDefaultCity() {
    showSpinner();
    try {
        const { latitude, longitude, countryName, cityName } = await getGeolocation("Lagos");
        await getWeatherData(latitude, longitude);
        displayWeatherData(cityName, countryName);
    } catch(error) {
        console.error("Failed to load default location:", error);
        hideSpinner();
    }
}