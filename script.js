// define variables
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
const geolocationApi = "https://geocoding-api.open-meteo.com/v1/search?&count=1&language=en&format=json";
const weatherDataApi = "https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,uv_index_max,weather_code&timezone=auto";
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
        temperature.innerHTML = `${weatherResults.current.temperature_2m} °C`;
        
        //get the description and icon using the weather code
        const weatherDetails = getWeatherCodeDescription(weatherResults.current.weather_code);
        //set the icon now at the top of the hero section wiht the nav bar
        weatherIcon.innerHTML = `${weatherDetails.icon}`;
        //set the weather description
        description.innerHTML = `${weatherDetails.description}`;

        humidityValue.innerHTML = `${weatherResults.current.relative_humidity_2m} %`;
        windSpeedValue.innerHTML = `${weatherResults.current.wind_speed_10m} Km/hr`;
        //get today's uv index
        const todayUv  = getUvIndexDescription(weatherResults.daily.uv_index_max[0]);
        //get text description
        uvIndexValue.innerHTML = `${todayUv}`;
        
    }
}

function getWeatherCodeDescription(weatherCode) {
    switch (weatherCode) {
        case 0:
            return { description: "Clear sky", icon: "☀️" };
        case 1:
        case 2:
        case 3:
            return { description: "Partly cloudy", icon: "⛅"};
        case 45:
        case 48:
            return { description: "Foggy", icon: "🌫"};
        case 51:
        case 53:
        case 55:
            return { description: "Drizzle", icon: "🌧️"};
        case 61:
        case 63:
        case 65:
            return {description: "Rain", icon: "🌧️"};
        case 71:
        case 73:
        case 75:
            return {description: "Snow", icon: "❄️"};
        case 80:
        case 81:
        case 82:
            return {description:"Rain showers", icon: "🌦"};
        case 95:
            return {description: "Thunderstorm", icon: "⛈️"};
        
        default:
            return { description: "Weather for not found skii", icon: "🫠"};
    }
    
}

searchBtn.addEventListener("click", async () => {
    const location = searchBox.value;
    const {latitude, longitude, countryName, cityName} = await getGeolocation(location);
    await getWeatherData(latitude, longitude);
    await displayWeatherData(cityName, countryName);
});
//test error message box

//uv index functipon
function getUvIndexDescription(uvIndexValue){
    if (uvIndexValue <= 2){
        return "Low";
    }else if (uvIndexValue <= 5){
        return "Moderate";
    }else if (uvIndexValue <= 7){
        return "High";
    }else if (uvIndexValue <= 10){
        return "Very High";
    } else {
        return "Extreme";
    }
}