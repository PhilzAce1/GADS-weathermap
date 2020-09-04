const searchForm = document.querySelector('#search_form');
const openModalButton = document.querySelector('#toggle');
const closeModalButton = document.querySelector('#close');

//Event Listeners
searchForm.addEventListener('submit', handleSearch);
openModalButton.addEventListener('click', handleOpenModal);
closeModalButton.addEventListener('click', handleCloseModal);

// window.onload = () => {
//   'use strict';
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./sw.js');
//   }
// };

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
  handleSearch();
}
async function handleSearch(location) {
  const searchParam = location || e.target.search.value || 'new york';
  const apiId = 'bc1301b0b23fe6ef52032a7e5bb70820';
  const url = `http://api.openweathermap.org/data/2.5/forecast/daily/?q=${searchParam}&appid=${apiId}`;
  try {
    let res = await fetch(url);
    res = await res.json();
    console.log(res);
    // modal.close('.search_container');
  } catch (e) {
    console.log(e);
  }
}
function handleCloseModal() {
  modal.close('.search_container');
}
function handleOpenModal() {
  modal.open('.search_container');
}
function makeApiCall() {}
function handleBackground() {}
function updateDom() {}
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
function forcast() {
  const dailyData = [];
  return {
    setForCast(listData) {
      if (!Array.isArray(listData) || listData < 2) return;
      listData.forEach((list) => {
        const obj = {};
        obj.name = list.name;
        dailyData.push(obj);
      });
    },
    displayForcast() {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      console.log(dailyData);
    },
  };
}
