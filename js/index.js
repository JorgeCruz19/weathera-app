window.addEventListener('load', () => {
  const closeSidebar = document.getElementById('close-sidebar');
  const openSidebar = document.querySelector('.sidebar-search');
  const sidebar = document.querySelector('.search-location');
  const buttonLocation = document.querySelector('.sidebar-location');
  const buttonSearch= document.querySelector('.search-location-button');
  const inputSearch = document.getElementById('inputSearch');
  const containerSidebar = document.querySelector('.sidebar-container-inner');
  const containerHightlights = document.querySelector('.hightlights-wrapper');
  const containerForecast = document.querySelector('.card-wrapper');
  const loader = document.querySelector('.loader');
  const API_KEY = 'ada678dc05dedfdd4d8108091714dd7f';
  /* Sidebar */
  openSidebar.addEventListener('click', () => {
    sidebar.classList.add('isOpen');
  });
  closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('isOpen');
  });
  /* Get geolocation of user */
  const getGeoLocationUser = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const {latitude, longitude} = position.coords;
      getForecastWeatherByLatLong(latitude, longitude);
      getGeoLocationByLatLong(latitude, longitude);
    });
    
  }
  const getGeoLocationByLatLong = async (lat, long) => {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${API_KEY}`)
    const data = await res.json();
    templateSidebar(data);
    templateHighlights(data);
  }
  const getForecastWeatherByLatLong = async (lat, long) => {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${API_KEY}`)
    const dataForecast = await res.json();
    templateForecast(dataForecast)
  }
  const getWeatherBySearch = async () => {
    let search = inputSearch.value;
    if (search == '') {
      return;
    }
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${search}&units=metric&appid=ada678dc05dedfdd4d8108091714dd7f`)
    const data = await res.json();
    const {coord: {lon, lat}} = data
    getGeoLocationByLatLong(lat, lon);
    getForecastWeatherByLatLong(lat, lon);
  }
  const templateSidebar = (data) => {
    const { main: {temp}, name: city, weather: [{main: weather}]} = data
    const date = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul',' Aug','Sep','Oct','Nov','Dec'];
    const days = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
    const template = `
              <img src="./img/${weather}.svg" class="sidebar-image" alt="" />
              <p class="sidebar-celsius">
                ${temp.toFixed(0)}
                <sub>°c</sub>
              </p>
              <h3 class="sidebar-season">${weather}</h3>
              <p class="sidebar-date">Today &centerdot; ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}</p>
              <p class="sidebar-place">
                <span class="material-icons"> place </span>
                ${city}
              </p>
    `
    containerSidebar.innerHTML = template;
  }
  const templateForecast = (dataForecast) => {
    const data = getForecastMinMaxTemp(dataForecast)
    console.log(data)
    containerForecast.innerHTML = '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul',' Aug','Sep','Oct','Nov','Dec'];
    const days = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
    data.map(({ main, dt, minMaxTemp:{max, min} }) => {
      const date = new Date(dt * 1000);
      let template = `
        <article class="card-weather">
              <h3 class="card-weather-title">${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}</h3>
              <img src="./img/${main ? main : 'cloudy'}.svg" class="card-weather-img" alt="Snow" />
              <p class="card-weather-celsius">
                <span class="card-weather-maxium">${max.toFixed(0)}°c</span>
                <span class="card-weather-minium">${min.toFixed(0)}°c</span>
              </p>
        </article>
      `
      containerForecast.innerHTML += template;
    })
  }
  const templateHighlights = (data) => {
    const {main: {humidity,pressure}, wind:{deg, speed}, visibility} = data;
    let speedToMiles = speed * 2.237;
    let visibilityToMiles = visibility * 0.00062137;
    const { direction, directionWind } = getDirectionWindDegrees(deg)
    const template = `
              <article class="card-hightlights">
                <h3 class="card-hightlights-title">Wind Status</h3>
                <p>${speedToMiles.toFixed(0)}<span>mph</span></p>
                <p>
                  <span class="icon-navigation ${direction}">
                    <svg
                      id="navigation"
                      data-name="navigation"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#e7e7eb"
                      viewBox="0 0 24 24"
                      height="20"
                      width="20"
                    >
                      <defs>
                        <style>
                          .cls-1 {
                            fill: none;
                          }
                        </style>
                      </defs>
                      <path class="cls-1" d="M0,0H24V24H0Z" />
                      <path d="M12,21,19.5,2.7,18.8,2,12,5,5.2,2l-.7.7Z" />
                    </svg>
                  </span>
                  ${directionWind}
                </p>
              </article>
              <article class="card-hightlights">
                <h3 class="card-hightlights-title">Humidity</h3>
                <p>${humidity}<span>%</span></p>
                <div class="meter">
                  <meter
                    min="0"
                    max="100"
                    low="40"
                    high="70"
                    optimum="100"
                    value="${humidity}"
                  ></meter>
                  <div>
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </article>
              <article class="card-hightlights">
                <h3 class="card-hightlights-title">Visibility</h3>
                <p>${visibilityToMiles.toFixed(1)}<span>miles</span></p>
              </article>
              <article class="card-hightlights">
                <h3 class="card-hightlights-title">Air Pressure</h3>
                <p>${pressure}<span>mb</span></p>
              </article>
    `
    containerHightlights.innerHTML = template;
  }
  /* Direction wind*/
  const getDirectionWindDegrees = (deg) => {
    let degrees = {};
    if(deg >= 337.5 && deg < 22.5){
      degrees= {directionWind: 'N'}
    }
    else if(deg >= 22.5 && deg < 67.5){
      degrees = {direction:'dir-ne', directionWind: 'NE'};
    }
    else if(deg >= 67.5 && deg < 112.5){
      degrees = {direction:'dir-e', directionWind: 'E'};;
    }
    else if(deg >= 112.5 && deg < 157.5){
      degrees = {direction:'dir-se', directionWind: 'SE'};
    }
    else if(deg >= 157.5 && deg < 202.5){
      degrees ={direction:'dir-s', directionWind: 'S'};
    }
    else if(deg >= 202.5 && deg < 247.5){
      degrees = {direction:'dir-sw', directionWind: 'SW'};
    }
    else if(deg >= 247.5 && deg < 292.5){
      degrees = {direction:'dir-w', directionWind: 'W'};
    }
    else if(deg >= 292.5 && deg < 337.5){
      degrees = {direction:'dir-nw', directionWind: 'NW'};
    }
    else{
      degrees = {directionWind: 'N'};
    }
    return degrees;
  }
  const getForecastMinMaxTemp = (dataForecast) => {
    let minMaxPerDay = {};
    dataForecast.list.forEach(weatherObject => {
      let date = new Date(weatherObject.dt * 1000);
      let hours = date.getHours();
      let month = date.getMonth();
      let day = date.getDate();
      let key = `${month}-${day}`;
      let tempPerDay = minMaxPerDay[key] || {
        minMaxTemp: {}
      }
      if(!tempPerDay.cod || hours == 16){
        let source = weatherObject.weather[0];
        tempPerDay = { ...tempPerDay, ...source };
        tempPerDay.dt = weatherObject.dt
      }
      if (!tempPerDay.minMaxTemp.min || (weatherObject.main.temp_min < tempPerDay.minMaxTemp.min)) {
        tempPerDay.minMaxTemp.min = weatherObject.main.temp_min;
      }
      if (!tempPerDay.minMaxTemp.max || (weatherObject.main.temp_max > tempPerDay.minMaxTemp.max )) {
        tempPerDay.minMaxTemp.max = weatherObject.main.temp_max;
      }
      minMaxPerDay[key] =  tempPerDay;
    });
    return Object.values(minMaxPerDay);
  }

  buttonLocation.addEventListener('click', getGeoLocationUser);
  buttonSearch.addEventListener('click', () => {
    getWeatherBySearch();
  sidebar.classList.remove('isOpen');
  inputSearch.value = '';
  });
  inputSearch.addEventListener('keypress', (e) => {
    if (e.key == 'Enter') {
      getWeatherBySearch();
      sidebar.classList.remove('isOpen');
      inputSearch.value = '';
    }
  })
  getGeoLocationUser();
  loader.classList.add('isHide');
})
