<template>
  <div class="container">
    <div class="header">
      <h1>Japan Travel Weather App</h1>
      <div class="search-bar">
        <input v-model="cityQuery" placeholder="Enter city name" class="search-input" @keyup.enter="searchByCity" />
        <button @click="searchByCity" class="search-button">Search</button>
      </div>
    </div>

    <main class="main-section">
      <div v-if="weatherData" class="weather">
        <h2>{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>

        <div class="info">
          <div class="temp-box">
          <img :src="iconUrl" alt="Weather Icon" class="weather-icon" />
          <p class="temperature">{{ temperature }} °C</p>
        <div class="real-feel-data">
        <p class="description">{{ weatherData.weather[0].description }}</p>
        <p class="real-feel">RealFeel® {{ realFeel }} °C</p>
        <p class="real-feel-shade">RealFeel Shade™ {{ realFeelShade }}</p>
        </div>
        </div>
        <div class="flexbox">
        <div class="description-1">
        <p class="uv-index">Max UV Index: {{ uvIndex }}</p>
        <p class="wind">Wind: {{ windSpeed }} km/h</p>
        <p class="wind-gusts">Wind Gusts: {{ windGusts }} km/h</p>
        <p class="humidity">Humidity: {{ humidity }}%</p>
        <p class="indoor-humidity">Indoor Humidity: {{ indoorHumidity }}</p>
        </div>
        <div class="description-2">
        <p class="dew-point">Dew Point: {{ dewPoint }} °C</p>
        <p class="pressure">Pressure: {{ pressure }} mb</p>
        <p class="cloud-cover">Cloud Cover: {{ cloudCover }}%</p>
        <p class="visibility">Visibility: {{ visibility }} km</p>
        <p class="cloud-ceiling">Cloud Ceiling: {{ cloudCeiling }} m</p>
        </div>
        </div>
        
        </div>
      </div>
      <div v-else-if="loading" class="loading">Loading...</div>
      <div v-else class="error">No weather data found for the given city.</div>
      <div class="divider"></div>

      <div v-if="dailyForecast.length" class="forecast">
        <div class="cast-header">Next 4 days forecast</div>
        <div class="forecast-list">
          <div class="day" v-for="(forecast, index) in dailyForecast" :key="index">
            <p class="date">{{ forecast.date }}</p>
            <p class="temp-max">{{ forecast.temp_max }} °C</p>
            <p class="temp-min">{{ forecast.temp_min }} °C</p>
            <p class="desc">{{ forecast.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="divider"></div>

      <div v-if="places.length" class="places">
        <h3>Places to Visit in {{ cityQuery }}</h3>
        <ul>
          <li v-for="(place, index) in places" :key="index">
            <strong>{{ place.name }}</strong><br />
            <em>{{ place.category }}</em><br />
            <span>{{ place.address }}</span>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

const apikey = "feff206daa60b539abe8fae8f2ab7f29";
const geoapifyApiKey = "13e0991b3cf04fda98e7ea20bd8a1b9b";

export default {
  name: "App",
  data() {
    return {
      cityQuery: "",
      weatherData: null,
      dailyForecast: [],
      places: [],
      loading: false,
    };
  },
  computed: {
    temperature() {
      return this.weatherData ? Math.floor(this.weatherData.main.temp) : null;
    },
    realFeel() {
      return this.weatherData && this.weatherData.main.feels_like ? Math.floor(this.weatherData.main.feels_like) : null;
    },
    realFeelShade() {
    if (this.weatherData && this.weatherData.main && this.weatherData.main.feels_like_shade) {

      const value = Math.floor(this.weatherData.main.feels_like_shade);
      return isNaN(value) ? 'Unknown' : `${value}°C`;
    }
    return 'Unknown';
  },
    uvIndex() {
    
      return this.weatherData && this.weatherData.main.uv_index ? this.weatherData.main.uv_index : null;
    },
    windSpeed() {
      return this.weatherData && this.weatherData.wind.speed ? Math.floor(this.weatherData.wind.speed * 3.6) : null;
    },
    windGusts() {
      return this.weatherData && this.weatherData.wind.gust ? Math.floor(this.weatherData.wind.gust * 3.6) : null; 
    },
    humidity() {
      return this.weatherData ? this.weatherData.main.humidity : null;
    },
    indoorHumidity() {
      return this.weatherData && this.weatherData.main.indoor_humidity ? this.weatherData.main.indoor_humidity : "Unknown"; 
    },
    dewPoint() {
      return this.weatherData && this.weatherData.main.dew_point ? Math.floor(this.weatherData.main.dew_point) : null;
    },
    pressure() {
      return this.weatherData ? this.weatherData.main.pressure : null;
    },
    cloudCover() {
      return this.weatherData && this.weatherData.clouds ? this.weatherData.clouds.all : null;
    },
    visibility() {
      return this.weatherData && this.weatherData.visibility ? this.weatherData.visibility / 1000 : null; 
    },
    cloudCeiling() {
      return this.weatherData && this.weatherData.clouds ? this.weatherData.clouds.ceiling : "Unknown"; 
    },
    iconUrl() {
      return this.weatherData
        ? `http://openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
        : null;
    },
  },
  methods: {
    async searchByCity() {
      if (!this.cityQuery.trim()) return;
      this.loading = true;

      try {
        const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${this.cityQuery},JP&appid=${apikey}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);
        this.weatherData = weatherResponse.data;

        await this.fetchForecast(this.cityQuery);
        await this.fetchPlaces(this.cityQuery);
      } catch (error) {
        console.error("Error fetching data:", error);
        this.weatherData = null;
      } finally {
        this.loading = false;
      }
    },
    async fetchForecast(city) {
      const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city},JP&appid=${apikey}&units=metric`;
      try {
        const forecastResponse = await axios.get(forecastUrl);
        const forecast = forecastResponse.data;
        this.dailyForecast = forecast.list
          .filter((item, index) => index % 8 === 0)
          .map((item) => ({
            date: new Date(item.dt * 1000).toLocaleDateString(),
            temp_max: item.main.temp_max,
            temp_min: item.main.temp_min,
            description: item.weather[0].description,
          }));
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    },
    async fetchPlaces(city) {
      const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=geoname:city&text=${city}&apiKey=${geoapifyApiKey}`;
      try {
        const placesResponse = await axios.get(geoapifyUrl);
        this.places = placesResponse.data.features.map((feature) => ({
          name: feature.properties.name,
          address: feature.properties.formatted,
          category: feature.properties.category || "Unknown",
        }));
      } catch (error) {
        console.error("Error fetching places data:", error);
      }
    },
  },
};
</script>

<style src="./style.css" scoped></style>
