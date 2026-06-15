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
const tempSwitch = document.getElementById('temp-switch');
let isFahrenheit = false;
let city = "Lagos";
const spinner = document.querySelector('.spinner');
const loadingText = document.getElementById("loading-text");



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
        temperature.innerHTML =`Feels like  ${formatTemp(weatherResults.current.temperature_2m)}`;
        
        //get the description and icon using the weather code
        const weatherDetails = getWeatherCodeDescription(weatherResults.current.weather_code);
        //set the icon now at the top of the hero section wiht the nav bar
        weatherIcon.innerHTML = `<span class="${weatherDetails.animation}">${weatherDetails.icon}</span>`;
        //set the weather description
        description.innerHTML = `${weatherDetails.description}`;

        humidityValue.innerHTML = `${weatherResults.current.relative_humidity_2m} %`;
        windSpeedValue.innerHTML = `${weatherResults.current.wind_speed_10m} Km/hr`;
        //get today's uv index
        const todayUv  = getUvIndexDescription(weatherResults.daily.uv_index_max[0]);
        //get text description
        uvIndexValue.innerHTML = `${todayUv}`;
        
        //five day forecast logiic
        await getFiveDayForecast();    
        //spinner
        hideSpinner();   
    }
}
//function for weather code description
function getWeatherCodeDescription(weatherCode) {
    switch (weatherCode) {
        case 0:
            return { description: "Clear sky", icon: "☀️", animation: "weather-spin" };
        case 1:
        case 2:
        case 3:
            return { description: "Partly cloudy", icon: "⛅", animation: "weather-float"};
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
            return {description: "Rain", icon: "🌧️", animation: "weather-pulse" };
        case 71:
        case 73:
        case 75:
            return {description: "Snow", icon: "❄️", animation: "weather-pulse"};
        case 80:
        case 81:
        case 82:
            return {description:"Rain showers", icon: "🌦", animation: "weather-pulse" };
        case 95:
            return {description: "Thunderstorm", icon: "⛈️", animation: "weather-pulse"};
        
        default:
            return { description: "Weather not found skii", icon: "🫠", animation: "weather-pulse"};
    }
    
}
//event listener for search button
searchBtn.addEventListener("click", async () => {
    const location = searchBox.value;
    if (!location) return;
    showSpinner(); //show the spinner immediately clickked
   try{ 
    const {latitude, longitude, countryName, cityName} = await getGeolocation(location);
    searchHistory(cityName);
    await getWeatherData(latitude, longitude);
    await displayWeatherData(cityName, countryName);

} catch (error){
    console.error(error);
    hideSpinner();
}
});


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

//five day forecast function
async function getFiveDayForecast(latitude, longitude) {
    try{
        const response = localStorage.getItem("weatherData");
        const weatherResults = JSON.parse(response);
      const daily = weatherResults.daily;
        let forecastHtml = '';
        
        //loop for the next five day
        for (let i = 1; i<=5; i++){
            const date = daily.time[i];
            const maxTemperature = formatTemp(daily.temperature_2m_max[i]);
            const minTemperature = formatTemp(daily.temperature_2m_min[i]);
            const uvIndex = daily.uv_index_max[i];
            const weatherCode = daily.weather_code[i];

            //format the date to get the day of the week
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', {weekday:'long'});
            //get weather description again for the table
            const weatherCondition = getWeatherCodeDescription(weatherCode)
            forecastHtml += `
            <tr>
            <td>${dayOfWeek}</td>
            <td><span class="${weatherCondition.animation}">${weatherCondition.icon}</span></td>
            <td>${minTemperature} - ${maxTemperature}</td>
            
            </tr>
            `
            
        }
        //update and render the DOM table after loop is done
        forecastDay.innerHTML = forecastHtml;

        
    }
    //five day error
    catch(error){
    console.error("Error displaying five day forecast:", error);      
    }
}

//automatically get user's geolocation from browser via in-built geoloaction api
window.onload = () => {
    //1. check if browser supports geolocation
    if(navigator.geolocation){
        showSpinner(); //show spinner on page load
        navigator.geolocation.getCurrentPosition(
            //asks for user's permission to use geolocation
            async (position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                
                //get weather data  using user's real coordinates
                await getWeatherData(lat, long);

                //display the location of the user as current location
                displayWeatherData("Current location " + `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="venue-icon">
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
  <circle cx="12" cy="10" r="3"></circle>
</svg>
`, "");

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

async function loadDefaultCity() {
    showSpinner(); //show spinner when loading default city
    const {latitude, longitude, countryName, cityName} = await getGeolocation("Lagos");
    await getWeatherData(latitude, longitude);
     displayWeatherData(cityName, countryName);
}

// function toggleCelsiusFahrenheit(){
//     if(checkbox.checked){
//     const fahrenheit = temperature * 9/5 + 32;
//     temperature.innerHTML = `${fahrenheit} °F`;
//     }else{
//         const celsius = temperature - 32 * 5/9;
//         temperature.innerHTML = `${celsius} °C`;
//     }
// }

//helper function to convert celsius to fahrenheit and vice versa
function formatTemp(celsius){
    if(isFahrenheit){
        const fahrenheit = Math.round(celsius * 9/5 + 32);
        return `${fahrenheit} °F`;
    }
    return `${celsius} °C`;
}

tempSwitch.addEventListener("change", () =>{
    isFahrenheit = tempSwitch.checked;

    //re-render with new display unit
    const parts = cityDisplay.innerHTML.split(',');
    const cityName = parts[0].trim();
    const countryName = parts[1]? parts[1].trim() : "";
    displayWeatherData(cityName, countryName);
}
);

function searchHistory(cityName){
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    //remove if city already exists to prevent duplicate
    if (history.includes(cityName)){
        history = history.filter(item => item !== cityName);
    }
    // put the new city at the top of the list 
history.unshift(cityName);
//save to local storage and reload hsistory UI
localStorage.setItem("searchHistory", JSON.stringify(history));
loadSearchHistory();
}

function loadSearchHistory(){
  const listContainer = document.getElementById("search-history-list");
  if(!listContainer) return;

  //clear old options first so we don't duplicate the,
  listContainer.innerHTML = "";

  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history.forEach(city => {
    const option = document.createElement("option");
    option.value = city; 
    listContainer.appendChild(option);
    
    //handle option click
    option.addEventListener("click", async () => {
      searchBox.value = city;
      const {latitude, longitude, countryName, cityName} = await getGeolocation(city);
      await getWeatherData(latitude, longitude);
      await displayWeatherData(cityName, countryName);
      listContainer.style.display = "none";
    })
  })
}

function showSpinner() {
    spinner.style.display = "block";
    if (loadingText) loadingText.style.display = "block";
    // hide weather info so the card boldly shows the spinner
    cityDisplay.style.display = "none";
    temperature.style.display = "none";
    description.style.display = "none";
    weatherIcon.style.display = "none";
}

function hideSpinner() {
    //show the laoded weather info 
    spinner.style.display = "none";
    if (loadingText) loadingText.style.display = "none";
    cityDisplay.style.display = "block";
    temperature.style.display = "block";
    description.style.display = "block";
    weatherIcon.style.display = "block";
}