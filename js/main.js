const searchForm = document.querySelector('#search_form');
const openModalButton = document.querySelector('#toggle');
const closeModalButton = document.querySelector('#close');
const myLocationBtn = document.querySelector('#uml');
//Event Listeners
searchForm.addEventListener('submit', submit);
openModalButton.addEventListener('click', handleOpenModal);
closeModalButton.addEventListener('click', handleCloseModal);
myLocationBtn.addEventListener('click', getUserCoord);
window.addEventListener('offline', handleOffline);
window.addEventListener('online', handleOnline);

window.onload = async () => {
  'use strict';
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      console.log('Service worker registration sucessful');
      console.log(`Registered with scope: ${registration.scope}`);
    } catch (e) {
      debugger;
      console.log('Service worker registration failed');
      console.log(e);
    }
  }
};
const db = cacher();
function getUserCoord() {
  const clonePosition = (position) => {
    return {
      coords: {
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        latitude: position.coords.latitude.toFixed(3),
        longitude: position.coords.longitude.toFixed(3),
        speed: position.coords.speed,
      },
      timestamp: position.timestamp,
    };
  };
  function getPosition(position) {
    // The way the position object is implemented
    const {
      coords: { latitude: lat, longitude: lng },
    } = clonePosition(position);
    handleSearch(null, 'latlng', { lng, lat });
  }
  function handleGeoError(e) {
    const errorEl = document.querySelector('p.error');
    console.error(e);

    switch (e.code) {
      case 0: // unknown error
        errorEl.textContent =
          'The application has encountered an unknown error while trying to determine location.';

        break;

      case 1: // permission denied
        errorEl.textContent =
          'You chose not to allow this application access to your location.';
        break;

      case 2: // position unavailable
        errorEl.textContent =
          'The application was unable to determine your location.';
        break;

      case 3: // timeout
        errorEl.textContent =
          'The request to determine your location has timed out.';
        break;
    }
  }
  navigator.geolocation.getCurrentPosition(getPosition, handleGeoError);
}
function image(cond) {
  const imageSelected = imageSwitcher(cond);
  document.documentElement.style.setProperty('--bgi', imageSelected.img);
}
// basic animations
const animate = (function () {
  return {
    fadeIn(el) {
      el.style.display = 'flex';
      el.style.transition = '0.7s';
      el.style.opacity = 1;
    },
    fadeOut(el) {
      const fadeTarget = el;
      const fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
          fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
          fadeTarget.style.opacity -= 0.1;
        } else {
          fadeTarget.style.display = 'none';
          clearInterval(fadeEffect);
        }
      }, 50);
    },
    counter(id, start, end, duration) {
      let obj = document.getElementById(id),
        current = start,
        range = end - start,
        increment = end > start ? 1 : -1,
        step = Math.abs(Math.floor(duration / range)),
        timer = setInterval(() => {
          current += increment;
          obj.textContent = current;
          if (current == end) {
            clearInterval(timer);
          }
        }, step);
    },
  };
})();
// modal controller
const modal = (function () {
  return {
    open(el) {
      if (!el || el === null || el === undefined) return;
      const elem = document.querySelector(el);
      animate.fadeIn(elem);
    },
    close(el) {
      if (!el || el === null || el === undefined) return;
      const elem = document.querySelector(el);
      animate.fadeOut(elem);
    },
  };
})();

function submit(e) {
  e.preventDefault();
  handleSearch(e.target.search.value);
}
async function handleSearch(location, method, data) {
  const searchParam = location || 'new york';
  const apiId = 'bc1301b0b23fe6ef52032a7e5bb70820';
  let search, loc;
  // search could be based on coordinates or name
  if (method === 'latlng') {
    const { lat, lng } = data;
    search = `lat=${lat}&lon=${lng}`;
    loc = `${lat} ${lng}`;
  } else {
    search = `q=${searchParam}`;
    loc = `${location}`;
  }
  // check for checked cached version before making request
  const cachedData = db.get({
    location: loc,
  });
  // if cached request exist return cache, else make request
  if (cachedData.success) {
    mainForcast(cachedData.res.message, forcast);
    return modal.close('.search_container');
  }
  const url = `https://api.openweathermap.org/data/2.5/forecast/daily/?${search}&appid=${apiId}&units=metric`;
  try {
    let res = await fetch(url);
    res = await res.json();
    if (res.cod === '200') {
      mainForcast(res, forcast);
      // cache data
      db.post({
        location: loc,
        data: res,
      });
      modal.close('.search_container');
    } else {
      handleError(res);
    }
  } catch (e) {
    console.error(e);
  }
}
function handleCloseModal() {
  modal.close('.search_container');
}
function handleOpenModal() {
  modal.open('.search_container');
}

function weatherIcon(cond) {
  const weatherIconObj = {
    sunny: `<figure>
          <svg class="icon" viewbox="0 0 100 100">
            <use xlink:href="#sun" />
          </svg>
          <figcaption>Sunny</figcaption>
        </figure>
      `,
    rainy: `<figure>
      <svg class="icon" viewbox="0 0 100 100">
        <use xlink:href="#sun" x="-12" y="-18" />
        <use
          xlink:href="#grayCloud"
          class="small-cloud"
          fill="url(#gradGray)"
        />
        <use id="drop1" xlink:href="#rainDrop" x="25" y="65" />
        <use id="drop3" xlink:href="#rainDrop" x="45" y="65" />
        <use xlink:href="#whiteCloud" x="7" />
      </svg>
      <figcaption>Patchy Rain Day</figcaption>
      </figure>
      `,
    cloudy: ` <figure>
      <svg class="icon" viewbox="0 0 100 100">
        <use xlink:href="#sun" x="-12" y="-18" />
        <use
          xlink:href="#grayCloud"
          class="small-cloud"
          fill="url(#gradGray)"
        />
        <use xlink:href="#whiteCloud" x="7" />
      </svg>
      <figcaption>Partly Cloudy Day</figcaption>
      </figure>
      `,
    drizzle: `
      <figure>
      <svg class="icon" viewbox="0 0 100 100">
        <use xlink:href="#sun" x="-12" y="-18" />
        <use
          xlink:href="#grayCloud"
          class="small-cloud"
          fill="url(#gradGray)"
        />
        <use xlink:href="#rainDrizzle" x="25" y="65" />
        <use xlink:href="#rainDrizzle" x="40" y="65" />
        <use xlink:href="#whiteCloud" x="7" />
      </svg>
      <figcaption>Patchy Drizzle Day</figcaption>
      </figure>
      `,
    thunderstorm: `<figure>
      <svg class="icon" viewbox="0 0 100 100">
        <use
          xlink:href="#grayCloud"
          class="small-cloud"
          fill="url(#gradGray)"
        />
        <use
          xlink:href="#grayCloud"
          x="25"
          y="10"
          class="reverse-small-cloud"
          fill="url(#gradDarkGray)"
        />
        <use
          xlink:href="#thunderBolt"
          x="30"
          y="61"
          class="lighting animated infinite flash"
        />
        <use xlink:href="#whiteCloud" x="7" />
        <use
          xlink:href="#thunderBolt"
          x="45"
          y="56"
          class="lighting animated infinite flash delay-1s"
        />
      </svg>
      <figcaption>Thunderstorm</figcaption>
      </figure>
      
      `,
    fog: `
      <figure>
      <svg class="icon" viewbox="0 0 100 100">
        <use
          xlink:href="#grayCloud"
          class="small-cloud"
          fill="url(#gradDarkGray)"
          x="0"
          y="20"
        />
        <use
          xlink:href="#grayCloud"
          x="30"
          y="30"
          class="reverse-small-cloud"
          fill="url(#gradGray)"
        />
        <use id="mist" xlink:href="#mist" x="0" y="30" />
      </svg>
      <figcaption>Mist/Fog</figcaption>
      </figure>
      `,
    clear: `<figure>
      <svg class="icon" viewbox="0 0 100 100">
        <use xlink:href="#moon" x="-15" />
        <use
          xlink:href="#star"
          x="42"
          y="30"
          class="stars animated infinite flash"
        />
        <use
          xlink:href="#star"
          x="61"
          y="32"
          class="stars animated infinite flash delay-1s"
        />
        <use
          xlink:href="#star"
          x="55"
          y="50"
          class="stars animated infinite flash delay-2s"
        />
      </svg>
      <figcaption>Clear Night</figcaption>
    </figure>
`,
    snow: `
<figure>
        <svg class="icon" viewbox="0 0 100 100">
          <use id="snowFlake1" xlink:href="#snowFlake" x="20" y="55" />
          <use id="snowFlake2" xlink:href="#snowFlake" x="35" y="65" />
          <use id="snowFlake3" xlink:href="#snowFlake" x="45" y="60" />
          <use id="snowFlake4" xlink:href="#snowFlake" x="50" y="65" />
          <use id="snowFlake5" xlink:href="#snowFlake" x="63" y="65" />
          <use xlink:href="#whiteCloud" x="10" y="-15" />
        </svg>
        <figcaption>Snow</figcaption>
      </figure>
`,
  };
  const {
    sunny,
    rainy,
    cloudy,
    drizzle,
    thunderstorm,
    fog,
    clear,
    snow,
  } = weatherIconObj;
  let res;
  switch (cond) {
    case 'Clear':
      res = clear;
      break;
    case 'Sun':
      res = sunny;
      break;
    case 'Clouds':
      res = cloudy;
      break;
    case 'Rain':
      res = rainy;
      break;
    case 'Drizzle':
      res = drizzle;
      break;
    case 'Mist':
    case 'Fog':
      res = fog;
      break;
    case 'Thunderstorm':
      res = thunderstorm;
      break;
    case 'Snow':
      res = snow;
      break;
    default:
      res = clear;
      break;
  }
  return res;
}
function imageSwitcher(cond) {
  let res;
  switch (cond) {
    case 'Clouds':
      res = {
        img: "url('../images/cloud.jpg')",
      };
      break;
    case 'Clear':
      res = {
        img: "url('../images/clear.jpg')",
      };
      break;
    case 'Sun':
      res = {
        img: "url('../images/sunny.PNG')",
      };
      break;
    case 'Rain':
    case 'Drizzle':
      res = {
        img: "url('../images/rain.jpg')",
      };
      break;
    case 'Mist':
    case 'Fog':
      res = {
        img: "url('../images/fog.jpg')",
      };
      break;
    case 'Thunderstorm':
      res = {
        img: "url('../images/thunder.PNG')",
      };
      break;
    case 'Snow':
      res = {
        img: "url('../images/snow.jpg')",
      };
      break;
    default:
      res = {
        img: "url('../images/sunny.PNG')",
      };
      break;
  }
  return res;
}

function forcast(data) {
  const dailyData = [];
  function setForCast(listData) {
    if (!Array.isArray(listData) || listData < 2) return;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    listData.forEach((list) => {
      const obj = {};
      let maxTemp = Math.round(list.temp.max);
      let minTemp = Math.round(list.temp.min);
      let avg = (maxTemp + minTemp) / 2;
      let dayIndex = new Date(list.dt * 1000).getDay();
      obj.temp = avg;
      obj.day = days[dayIndex];
      obj.weather = list.weather[0].main;
      obj.weatherDesc = list.weather[0].description;
      dailyData.push(obj);
    });
  }
  function displayForcast() {
    const weatherCards = document.querySelectorAll('.card');
    setForCast(data);
    const cardData = dailyData.slice(1, 5);
    weatherCards.forEach((card, index) => {
      const dayWeather = cardData[index];
      let weatherIconRes = weatherIcon(dayWeather.weather);
      card.querySelector('.dayow').textContent = dayWeather.day;
      card.querySelector('.icon_div').innerHTML = weatherIconRes;
      card.querySelector('.mobile_temp').textContent = dayWeather.temp;
      card.querySelector('p.weather_condition').textContent =
        dayWeather.weatherDesc;
    });
    return dailyData;
  }
  return displayForcast();
}
function mainForcast(data, cb) {
  const weatherConds = document.querySelectorAll('.weather_content');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const obj = {};
  let maxTemp = Math.round(data.list[0].temp.max);
  let minTemp = Math.round(data.list[0].temp.min);
  let avg = (maxTemp + minTemp) / 2;
  let fullDate = new Date(data.list[0].dt * 1000);
  let dayIndex = fullDate.getDay();
  obj.cityName = data.city.name;
  obj.temp = avg;
  obj.day = days[dayIndex];
  obj.date = fullDate.toDateString().split(' ').slice(1, 3).join(' ');
  obj.weather = data.list[0].weather[0].main;
  obj.weatherDesc = data.list[0].weather[0].description;
  image(obj.weather);
  weatherConds.forEach((list) => {
    list.querySelector('.location').textContent = obj.cityName;
    list.querySelector('.temp').textContent = obj.temp;
    list.querySelector('.day').textContent = obj.day;
    list.querySelector('.date').textContent = obj.date;
    list.querySelector('.icon_div').innerHTML = weatherIcon(obj.weather);
    list.querySelector('.weather_condition_text').textContent = obj.weatherDesc;
  });
  return cb(data.list);
}

function handleError(e) {
  console.error(e);
  if (e.cod === '404') {
    document.querySelector('p.error').textContent = e.message;
  }
}
function cacher() {
  function getTodayDate() {
    return new Date(Date.now()).toDateString().split(' ').slice(1, 3).join(' ');
  }
  function get(data) {
    const result = {
      success: false,
      res: { status: 404, message: 'not Found' },
    };
    const date = getTodayDate();
    const cachedData = localStorage.getItem(date);
    if (!cachedData) {
      return result;
    }
    const cachedDataObj = JSON.parse(cachedData);
    if (cachedDataObj.location === data.location) {
      result.success = true;
      result.res = {
        status: 200,
        message: cachedDataObj.res,
      };
    }
    return result;
  }
  function post(res) {
    const date = getTodayDate();
    const obj = {
      location: res.location,
      res: res.data,
    };
    localStorage[date] = JSON.stringify(obj);
  }
  function getLast() {}
  return { get, post };
}
function handleOffline() {
  document.querySelector('.online_checker').textContent = 'you are offline';
}
function handleOnline() {
  document.querySelector('.online_checker').textContent = '';
}
