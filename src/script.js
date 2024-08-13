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
      return this.weatherData && this.weatherData.main.feels_like
        ? Math.floor(this.weatherData.main.feels_like)
        : null;
    },
    realFeelShade() {
      if (
        this.weatherData &&
        this.weatherData.main &&
        this.weatherData.main.feels_like_shade
      ) {
        const value = Math.floor(this.weatherData.main.feels_like_shade);
        return isNaN(value) ? "Unknown" : `${value}°C`;
      }
      return "Unknown";
    },
    iconUrl() {
      return this.weatherData
        ? `http://openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
        : null;
    },
  },
  methods: {
    async searchByCity() {
      if (!this.cityQuery.trim()) {
        return;
      }
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
