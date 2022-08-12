let searchWrapper = document.getElementById("searchWrapper");
let city = document.getElementById("searchBox");
let searchHistory = document.getElementById("searchHistory");
const apiKey = "c4b1b5394c37c48849aed979e85f5ff2";

const renderCurrentDayWeather = (currentDayWeather, cityName) => {
    const { dt, temp, humidity, wind_speed, uvi } = currentDayWeather;

    const formattedCurrentDayForecast = `
            <div class="city-and-date-heading">${cityName} (${new Date(dt * 1000).toLocaleDateString()})</div>
            <div>Temp: ${temp}</div>
            <div>Wind: ${wind_speed}</div>
            <div>Humidity: ${humidity}</div>
            <div>UV Index: ${uvi}</div>
    `;

    document.getElementById('currentDayWeather').innerHTML = formattedCurrentDayForecast;
}

const renderFiveDayForecast = (daily) => {
    let formattedFiveDayForecast = '';

    for (let i = 0; i < 5; i++) {
        const { dt, weather, temp, wind_speed, humidity } = daily[i];
        formattedFiveDayForecast += `<div>
                                        <div>${new Date(dt * 1000).toLocaleDateString()}</div>
                                        <div>${weather[0].icon}</div>
                                        <div>Temp: ${temp.day} ° F</div>
                                        <div>Wind: ${wind_speed} MPH</div>
                                        <div>Humidity: ${humidity}</div>
                                    </div>
        `;
    }

    document.getElementById('fiveDayForecast').innerHTML = `
                                                                        <div>Five Day Forecast:</div>
                                                                        <div id="fiveDayForecastContent">
                                                                            ${formattedFiveDayForecast}
                                                                        </div>
                                                                    `;
}

//obtains weather data, then passes that into renderCurrentDayWeather and renderFiveDayForecast
const oneCall = function (lat, lon, cityName) {
    let requestURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,minutely,alerts&appid=" + apiKey + "&units=imperial";
    fetch(requestURL)
        .then(function (response) {
            console.log(response);
            return response.json();
        }).then(function (data) {
            renderCurrentDayWeather(data.current, cityName);
            renderFiveDayForecast(data.daily);

        })
}

//obtains latitude, logitude, and city name, then passes that into oneCall function
const latLon = function (city) {
    let requestURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + apiKey;
    fetch(requestURL)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
            const cityName = data[0].name;
            const latitude = data[0].lat;
            const longitude = data[0].lon;
            oneCall(latitude, longitude, cityName);
        })
}

//adds event listener to searchBox and searchBtn, passes search info into latLon function, and clears searchBox
searchWrapper.addEventListener("submit", function () {
    event.preventDefault();
    let searchInput = city.value;
    console.log(searchInput);
    latLon(searchInput);
    city.value = "";
})
