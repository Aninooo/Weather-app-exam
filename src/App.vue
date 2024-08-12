<template>
  <div class="container">
    <div class="header">
      <h1>Japan Travel Weather App</h1>
      <div class="search-bar">
        <input
          v-model="cityQuery"
          placeholder="Enter city name"
          class="search-input"
          @keydown.enter="searchByCity"
        />
        <button @click="searchByCity" class="search-button">Search</button>
      </div>
    </div>

    <main class="main-section">
      <div v-if="weatherData" class="weather">
        <h2>{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>
        <div class="temp-box">
          <img :src="iconUrl" alt="Weather Icon" class="weather-icon" />
          <p class="temperature">{{ temperature }} °C</p>
        </div>
        <span class="clouds">{{ weatherData.weather[0].description }}</span>
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

<script src="./script.js"></script>

<style src="./style.css" scoped></style>
