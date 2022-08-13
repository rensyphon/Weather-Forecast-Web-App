let searchWrapper = document.getElementById("searchWrapper");
let city = document.getElementById("searchBox");
let searchHistory = document.getElementById("searchHistory");
const apiKey = "c4b1b5394c37c48849aed979e85f5ff2";

const renderCurrentDayWeather = (currentDayWeather, cityName) => {
    const {dt, temp, humidity, wind_speed, uvi} = currentDayWeather;

    let formattedCurrentDayForecast = `
            <div class="city-and-date-heading">${cityName} (${new Date(dt * 1000).toLocaleDateString()})</div>
            <div>Temp: ${temp} °F</div>
            <div>Wind: ${wind_speed} MPH</div>
            <div>Humidity: ${humidity} %</div>
            <div>UV Index: 
                <text id="uvi">${uvi}</text>
            </div>
    `;

    document.getElementById('currentDayWeather').innerHTML = formattedCurrentDayForecast;
    uviWarningColor(currentDayWeather);
}

//function to add warning color to UVI
const uviWarningColor = (currentDayWeather) => {
    const {dt, temp, humidity, wind_speed, uvi} = currentDayWeather;
    let uviBackground = document.getElementById("uvi");
    if (uvi > 5) {
        uviBackground.style.backgroundColor = 'red';
    }
    else if (uvi >= 3) {
        uviBackground.style.backgroundColor = 'orange';
    }
    else {
        uviBackground.style.backgroundColor = 'green';
    };
};

const renderFiveDayForecast = (daily) => {
    let formattedFiveDayForecast = '';

    for (let i = 0; i < 5; i++) {
        const {dt, weather, temp, wind_speed, humidity} = daily[i];
        formattedFiveDayForecast += `<div id="formattedFiveDayForecast">
                                        <div>${new Date(dt * 1000).toLocaleDateString()}</div>
                                        <div><img src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png" height="50" width="50"></div>
                                        <div>Temp: ${temp.day} ° F</div>
                                        <div>Wind: ${wind_speed} MPH</div>
                                        <div>Humidity: ${humidity}</div>
                                    </div>
        `;
    }

    document.getElementById('fiveDayForecast').innerHTML = `
                                                                        <div id="fiveDayForecastHeader">Five Day Forecast:</div>
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

function storeASearchInLocalHistory(searchInput) {
    const searchHistoryFromStorage = localStorage.getItem('searchHistory');

    let searchHistoryToSave;

    // saving first item
    if (searchHistoryFromStorage === null) {
        searchHistoryToSave = [searchInput];
    } else {
        // saving nth item
        searchHistoryToSave = JSON.parse(searchHistoryFromStorage);

        // have the list only keep the most recent 10 items
        if (searchHistoryToSave.length > 9) {
            searchHistoryToSave = searchHistoryToSave.slice(-9);
        }
        searchHistoryToSave.push(searchInput);
    }

    const searchHistoryToSaveAsString = JSON.stringify(searchHistoryToSave);

    localStorage.setItem('searchHistory', searchHistoryToSaveAsString);
}

function displaySearchHistory() {
    const searchHistoryFromStorage = localStorage.getItem('searchHistory');

    if (searchHistoryFromStorage === null) {
        return;
    }

    const searchHistoryFromStorageAsArray = JSON.parse(searchHistoryFromStorage);

    let searchHistoryMarkup = '';

    searchHistoryFromStorageAsArray.forEach(currentSearchItem => {
        searchHistoryMarkup += `<div>
                                 <button class="search-history-item" data-search-item="${currentSearchItem}">${currentSearchItem}</button>
                                </div>`;
    });

    searchHistory.innerHTML = searchHistoryMarkup;

    document.querySelectorAll('.search-history-item').forEach(searchHistoryButton => {
        searchHistoryButton.addEventListener('click', (buttonClickEvent) => {
            handleCitySearchAndWeatherDisplay(buttonClickEvent.target.getAttribute('data-search-item'));
        })
    })
}

//clears searchBox and calls latLon
function handleCitySearchAndWeatherDisplay(searchInput) {
    console.log(searchInput);
    city.value = "";
    latLon(searchInput);
}

//adds event listener to searchBox
searchWrapper.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchInput = city.value;
    handleCitySearchAndWeatherDisplay(searchInput);
    storeASearchInLocalHistory(searchInput);
    displaySearchHistory();
})

displaySearchHistory();
