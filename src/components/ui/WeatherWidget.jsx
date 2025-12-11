/* ========================================
   WeatherWidget.jsx - Weather Display Widget
   ======================================== */

import React, { useState, useEffect, useCallback } from 'react';
import './WeatherWidget.css';

// Weather condition icons
const WEATHER_ICONS = {
  'clear': '☀️',
  'sunny': '☀️',
  'partly-cloudy': '⛅',
  'cloudy': '☁️',
  'overcast': '☁️',
  'mist': '🌫️',
  'fog': '🌫️',
  'rain': '🌧️',
  'light-rain': '🌦️',
  'heavy-rain': '⛈️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'sleet': '🌨️',
  'hail': '🌨️',
  'wind': '💨',
  'night-clear': '🌙',
  'night-cloudy': '☁️',
  'default': '🌡️'
};

// Get weather icon based on condition
const getWeatherIcon = (condition, isNight = false) => {
  const lowerCondition = condition?.toLowerCase() || '';
  
  if (isNight && lowerCondition.includes('clear')) return WEATHER_ICONS['night-clear'];
  if (lowerCondition.includes('thunder')) return WEATHER_ICONS['thunderstorm'];
  if (lowerCondition.includes('heavy rain') || lowerCondition.includes('downpour')) return WEATHER_ICONS['heavy-rain'];
  if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return WEATHER_ICONS['rain'];
  if (lowerCondition.includes('drizzle')) return WEATHER_ICONS['drizzle'];
  if (lowerCondition.includes('snow')) return WEATHER_ICONS['snow'];
  if (lowerCondition.includes('sleet') || lowerCondition.includes('hail')) return WEATHER_ICONS['sleet'];
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return WEATHER_ICONS['mist'];
  if (lowerCondition.includes('overcast')) return WEATHER_ICONS['overcast'];
  if (lowerCondition.includes('cloud')) return WEATHER_ICONS['cloudy'];
  if (lowerCondition.includes('partly')) return WEATHER_ICONS['partly-cloudy'];
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return WEATHER_ICONS['clear'];
  if (lowerCondition.includes('wind')) return WEATHER_ICONS['wind'];
  
  return WEATHER_ICONS['default'];
};

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unit, setUnit] = useState('F'); // F or C
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch weather data using free API
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      
      // Using wttr.in - a free weather service that doesn't require API key
      const response = await fetch(
        `https://wttr.in/${lat},${lon}?format=j1`
      );
      
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      
      const currentCondition = data.current_condition?.[0];
      const nearestArea = data.nearest_area?.[0];
      
      if (currentCondition) {
        const isNight = parseInt(currentCondition.observation_time?.split(':')[0] || '12') >= 18 
                     || parseInt(currentCondition.observation_time?.split(':')[0] || '12') < 6;
        
        setWeather({
          temp_f: parseInt(currentCondition.temp_F),
          temp_c: parseInt(currentCondition.temp_C),
          feels_like_f: parseInt(currentCondition.FeelsLikeF),
          feels_like_c: parseInt(currentCondition.FeelsLikeC),
          condition: currentCondition.weatherDesc?.[0]?.value || 'Unknown',
          humidity: currentCondition.humidity,
          wind_mph: currentCondition.windspeedMiles,
          wind_kph: currentCondition.windspeedKmph,
          wind_dir: currentCondition.winddir16Point,
          uv: currentCondition.uvIndex,
          visibility: currentCondition.visibilityMiles,
          pressure: currentCondition.pressure,
          icon: getWeatherIcon(currentCondition.weatherDesc?.[0]?.value, isNight),
          isNight
        });
        
        setLocation({
          city: nearestArea?.areaName?.[0]?.value || 'Unknown',
          region: nearestArea?.region?.[0]?.value || '',
          country: nearestArea?.country?.[0]?.value || ''
        });
        
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Could not fetch weather');
      
      // Set fallback data
      setWeather({
        temp_f: '--',
        temp_c: '--',
        condition: 'Unable to load',
        icon: '❓'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user location and fetch weather
  useEffect(() => {
    // Try to get saved location
    const savedLocation = localStorage.getItem('movienights_weather_location');
    
    if (savedLocation) {
      const { lat, lon } = JSON.parse(savedLocation);
      fetchWeather(lat, lon);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('movienights_weather_location', 
            JSON.stringify({ lat: latitude, lon: longitude }));
          fetchWeather(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Default to New York if location denied
          fetchWeather(40.7128, -74.0060);
        },
        { timeout: 10000 }
      );
    } else {
      // Default location
      fetchWeather(40.7128, -74.0060);
    }
    
    // Load saved unit preference
    const savedUnit = localStorage.getItem('movienights_temp_unit');
    if (savedUnit) setUnit(savedUnit);
    
    // Refresh weather every 30 minutes
    const interval = setInterval(() => {
      const loc = localStorage.getItem('movienights_weather_location');
      if (loc) {
        const { lat, lon } = JSON.parse(loc);
        fetchWeather(lat, lon);
      }
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Toggle temperature unit
  const toggleUnit = () => {
    const newUnit = unit === 'F' ? 'C' : 'F';
    setUnit(newUnit);
    localStorage.setItem('movienights_temp_unit', newUnit);
  };

  // Refresh weather
  const refreshWeather = () => {
    const loc = localStorage.getItem('movienights_weather_location');
    if (loc) {
      const { lat, lon } = JSON.parse(loc);
      fetchWeather(lat, lon);
    }
  };

  // Request new location
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('movienights_weather_location', 
            JSON.stringify({ lat: latitude, lon: longitude }));
          fetchWeather(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
        }
      );
    }
  };

  if (loading && !weather) {
    return (
      <div className="weather-widget loading">
        <span className="weather-loading-icon">🌡️</span>
        <span>Loading...</span>
      </div>
    );
  }

  const temp = unit === 'F' ? weather?.temp_f : weather?.temp_c;
  const feelsLike = unit === 'F' ? weather?.feels_like_f : weather?.feels_like_c;

  return (
    <div className={`weather-widget ${isExpanded ? 'expanded' : ''} ${weather?.isNight ? 'night' : 'day'}`}>
      {/* Compact View */}
      <div className="weather-compact" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="weather-icon">{weather?.icon}</span>
        <span className="weather-temp">{temp}°{unit}</span>
        <span className="weather-condition">{weather?.condition}</span>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="weather-expanded">
          <div className="weather-header">
            <div className="weather-location">
              <span className="location-icon">📍</span>
              <span className="location-name">
                {location?.city}{location?.region ? `, ${location.region}` : ''}
              </span>
            </div>
            <div className="weather-actions">
              <button 
                className="weather-action-btn" 
                onClick={(e) => { e.stopPropagation(); toggleUnit(); }}
                title="Toggle °F/°C"
              >
                °{unit === 'F' ? 'C' : 'F'}
              </button>
              <button 
                className="weather-action-btn" 
                onClick={(e) => { e.stopPropagation(); refreshWeather(); }}
                title="Refresh"
              >
                🔄
              </button>
              <button 
                className="weather-action-btn" 
                onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                title="Update location"
              >
                📍
              </button>
            </div>
          </div>

          <div className="weather-main">
            <span className="weather-icon-large">{weather?.icon}</span>
            <div className="weather-temp-display">
              <span className="temp-value">{temp}°{unit}</span>
              <span className="feels-like">Feels like {feelsLike}°{unit}</span>
            </div>
          </div>

          <div className="weather-details">
            <div className="weather-detail">
              <span className="detail-icon">💧</span>
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{weather?.humidity}%</span>
            </div>
            <div className="weather-detail">
              <span className="detail-icon">💨</span>
              <span className="detail-label">Wind</span>
              <span className="detail-value">
                {unit === 'F' ? weather?.wind_mph : weather?.wind_kph} 
                {unit === 'F' ? 'mph' : 'km/h'} {weather?.wind_dir}
              </span>
            </div>
            <div className="weather-detail">
              <span className="detail-icon">☀️</span>
              <span className="detail-label">UV Index</span>
              <span className="detail-value">{weather?.uv}</span>
            </div>
            <div className="weather-detail">
              <span className="detail-icon">👁️</span>
              <span className="detail-label">Visibility</span>
              <span className="detail-value">{weather?.visibility} mi</span>
            </div>
          </div>

          {lastUpdated && (
            <div className="weather-footer">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;
