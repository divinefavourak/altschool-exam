// define variables
const searchBtn = document.getElementById('search-btn');
const searchBox = document.getElementById('search-box');
const cityDisplay = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feels-like');
const windSpeed = document.getElementById('wind-speed');
const humidityValue = document.getElementById('humidity-value');
const feelsLikeValue = document.getElementById('feels-like-value');
const windSpeedValue = document.getElementById('wind-speed-value');
const forecastDay = document.getElementById('forecast-day');
const geolocationApi = "https://geocoding-api.open-meteo.com/v1/search?&count=1&language=en&format=json";
const weatherDataApi = "https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto";
const errorMessage = document.getElementById('error-message');


let city = "Lagos";


//function to test geolocation
async function getGeolocation(location) {
    const response = await fetch(`${geolocationApi}&name=${location}`);
    const results = await response.json();
    const countryName = results.results[0].country;
    const cityName = results.results[0].name;
    const latitude = results.results[0].latitude;
    const longitude = results.results[0].longitude;
    console.log(`Valude for latitude is ${latitude}\nLongitude is ${longitude}`);
    return {latitude, longitude, countryName, cityName};
    
}
// testGeolocation(prompt("Enter City"));

//function to get and display weather data
async function getWeatherData(latitude, longitude){
    try{
        const weatherData = await fetch(`${weatherDataApi}&latitude=${latitude}&longitude=${longitude}`);
        const weatherResults = await weatherData.json();
        localStorage.setItem("weatherData", JSON.stringify(weatherResults));
        console.log(weatherResults);
    }
    catch(error){
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "&#9888; Unable to get weather"
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 5000);
        console.log(error)
    }  
}
//testWeatherData();

async function displayWeatherData(cityName, countryName) {
    const weatherData = localStorage.getItem("weatherData");
    if(weatherData){
        const weatherResults = JSON.parse(weatherData);
        cityDisplay.innerHTML = `${cityName}, ${countryName}`;
        temperature.innerHTML = `${weatherResults.current.temperature_2m}`;
        
        humidity.innerHTML = `${weatherResults.current_units.weather_code}`;
        feelsLike.innerHTML = `${weatherResults.current_units.relative_humidity_2m}`;
        windSpeed.innerHTML = `${weatherResults.current_units.wind_speed_10m}`;
        humidityValue.innerHTML = `${weatherResults.current.relative_humidity_2m}%`;
        //feelsLikeValue.innerHTML = weatherResults.current.relative_humidity_2m;
        windSpeedValue.innerHTML = `${weatherResults.current.wind_speed_10m} km/h`;
    }
}

async function getWeatherCodeDescription(description) {
    const weatherCode = localStorage.getItem("")
    const weatherDesc = getWeatherCodeDescription(weatherResults.current.weather_code);
description.innerHTML = weatherDesc;

    switch (weatherCode){
        case 0:
            return "Clear sky" || "☀";
        case 1 || 2 || 3:
            return "Partly cloudy" || "⛅";
        case 45 || 48 :
            return "Foggy" || "🌫";
        case 51 || 53 || 55:
            return "Drizzle" || "🌦";
        case 61 || 63 || 65:
            return "Rain" || "🌧";
        case 71 || 73 || 75:
            return "Snow fall" || "❄";
        case 80 || 81 || 82:
            return "Rain showers" || "🌦";
        case 95:
            return "Thunder Storm" || "⛈";
        
        default:
            return "Unknown Weather" || "🫠";
    }
    
}

searchBtn.addEventListener("click", async () => {
    const location = searchBox.value;
    const {latitude, longitude, countryName, cityName} = await getGeolocation(location);
    await getWeatherData(latitude, longitude);
    await displayWeatherData(cityName, countryName);
});
//test error message box
