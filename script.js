const searchBtn = document.getElementById('search-btn');
const searchBox = document.getElementById('search-box');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feels-like');
const windSpeed = document.getElementById('wind-speed');
const humidityValue = document.getElementById('humidity-value');
const feelsLikeValue = document.getElementById('feels-like-value');
const windSpeedValue = document.getElementById('wind-speed-value');
const forecastDay = document.getElementById('forecast-day');
const geolocationApi = "https://geocoding-api.open-meteo.com/v1/search?name=Lagos&count=1&language=en&format=json";
const weatherDataApi = "https://api.open-meteo.com/v1/forecast?latitude=6.4541&longitude=3.3947&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto";
let city = "Lagos";
async function testWeatherData(){
    const response = await fetch(weatherDataApi);
    const data = await response.json();
    console.log(data);  
}
//testWeatherData();

async function testGeolocation(location) {
    const response = await fetch(`${geolocationApi}&name=${location}`);
    const data = await response.json();
    console.log(data);  
}
testGeolocation(prompt("Enter City"));