<template>
  <div class="container">
    <div class="header">
      <h1>Japan Travel Weather App</h1>
      <div class="search-bar">
        <input
          v-model="cityQuery"
          placeholder="Enter city name"
          class="search-input"
          @keyup.enter="searchByCity"
        />
        <button @click="searchByCity" class="search-button">Search</button>
      </div>
    </div>

    <main class="main-section">
      <div v-if="showWelcomeMessage" class="welcome-message">
        <p>Welcome to the Japan Travel Weather App! <br>Enter a city to get the latest weather information and travel suggestions.</p>
      </div>

      <!-- Weather Data -->
      <div v-if="weatherData" class="weather">
        <h2>{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>

        <div class="info">
          <div class="temp-box">
            <img :src="iconUrl" alt="Weather Icon" class="weather-icon" />
            <p class="temperature">{{ temperature }} °C</p>
            <div class="real-feel-data">
              <p class="description">{{ weatherDescription }}</p>
              <p class="real-feel">RealFeel® {{ realFeel }} °C</p>
            </div>
          </div>
          <div class="flexbox">
            <div class="description-1">
              <p class="wind">Wind: {{ windSpeed }} km/h</p>
              <p class="humidity">Humidity: {{ humidity }}%</p>
            </div>
            <div class="description-2">
              <p class="pressure">Pressure: {{ pressure }} mb</p>
              <p class="cloud-cover">Cloud Cover: {{ cloudCover }}%</p>
              <p class="visibility">Visibility: {{ visibility }} km</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Forecast -->
        <div v-if="hourlyForecast.length" class="forecast">
          <div class="cast-header">Upcoming Forecast</div>
          <div class="forecast-list">
            <div class="next" v-for="(forecast, index) in hourlyForecast" :key="index">
              <div>
                <p class="time">{{ forecast.time }}</p>
                <p class="temp-max">{{ forecast.temp_max }} °C</p>
                <p class="temp-min">{{ forecast.temp_min }} °C</p>
              </div>
              <p class="desc">{{ forecast.description }}</p>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 4-Day Forecast -->
        <div v-if="dailyForecast.length" class="forecast">
          <div class="cast-header">Next 4 Days Forecast</div>
          <div class="divider"></div>
          <div class="forecast-list">
            <div class="day" v-for="(forecast, index) in dailyForecast" :key="index">
              <p class="date">{{ forecast.date }}</p>
              <p class="temp-max">{{ forecast.temp_max }} °C</p>
              <p class="temp-min">{{ forecast.temp_min }} °C</p>
              <p class="desc">{{ forecast.description }}</p>
            </div>
          </div>
        </div>

        <!-- Places -->
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
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error">
        <p>No weather data found for the given city. Please try again.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">Loading...</div>
      
    </main>
    
  </div>
  
</template>

<script>
import axios from "axios";

const apikey = process.env.VUE_APP_OPENWEATHERMAP_API_KEY;
const geoapifyApiKey = process.env.VUE_APP_GEOAPIFY_API_KEY;

export default {
  name: "App",
  data() {
    return {
      cityQuery: "",
      weatherData: null,
      hourlyForecast: [],
      dailyForecast: [],
      places: [],
      loading: false,
      showWelcomeMessage: true,
      error: false,
      weatherDescriptions: {
        "clear sky": "clear sky: No clouds in the sky.",
        "few clouds": "A few clouds are present, but it's mostly clear.",
        "scattered clouds": "Clouds are scattered across the sky.",
        "broken clouds": "The sky is mostly covered by clouds, and it might rain.",
        "overcast clouds": "The sky is completely covered by clouds, and rain is likely.",
        "shower rain": "Expect short, intense rain showers.",
        "rain": "Continuous rain is expected.",
        "thunderstorm": "Thunderstorms are likely.",
        "snow": "Snowfall is expected.",
        "mist": "Visibility is reduced due to mist.",
      },
    };
  },
  computed: {
    temperature() {
      return this.weatherData ? Math.floor(this.weatherData.main.temp) : null;
    },
    realFeel() {
      return this.weatherData && this.weatherData.main.feels_like
        ? Math.floor(this.weatherData.main.feels_like)
        : null;
    },
    iconUrl() {
      return this.weatherData
        ? `http://openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
        : null;
    },
    windSpeed() {
      return this.weatherData && this.weatherData.wind.speed ? Math.floor(this.weatherData.wind.speed * 3.6) : null;
    },
    humidity() {
      return this.weatherData ? this.weatherData.main.humidity : null;
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
    weatherDescription() {
      const description = this.weatherData?.weather[0]?.description.toLowerCase();
      return this.weatherDescriptions[description] || `No description available for: ${description}`;
    },
  },
  methods: {
    async searchByCity() {
      if (!this.cityQuery.trim()) return;

      this.loading = true;
      this.showWelcomeMessage = false;
      this.error = false;

      try {
        const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${this.cityQuery},JP&appid=${apikey}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);
        this.weatherData = weatherResponse.data;

        if (!this.weatherData || this.weatherData.cod === '404') {
          this.weatherData = null;
          this.error = true;
          this.dailyForecast = [];
          this.hourlyForecast = [];
          this.places = [];
        } else {
          await this.fetchForecast(this.cityQuery);
          await this.fetchPlaces(this.cityQuery);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        this.weatherData = null;
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchForecast(city) {
      const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city},JP&appid=${apikey}&units=metric`;
      try {
        const forecastResponse = await axios.get(forecastUrl);
        const forecast = forecastResponse.data;

        this.hourlyForecast = forecast.list.slice(0, 5).map(item => ({
          time: new Date(item.dt * 1000).toLocaleTimeString(),
          temp_max: Math.floor(item.main.temp_max),
          temp_min: Math.floor(item.main.temp_min),
          description: item.weather[0].description,
        }));

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
