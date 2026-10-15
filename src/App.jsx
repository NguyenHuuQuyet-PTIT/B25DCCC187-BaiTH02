import { useEffect, useMemo, useState } from 'react';

const CITIES = [
  { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { name: 'Huế', lat: 16.4637, lon: 107.5909 },
  { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
  { name: 'Đà Lạt', lat: 11.9404, lon: 108.4583 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
];

const WEATHER = {
  0: ['Trời quang', '☀️'], 1: ['Ít mây', '🌤️'], 2: ['Có mây', '⛅'], 3: ['Nhiều mây', '☁️'],
  45: ['Sương mù', '🌫️'], 48: ['Sương mù đóng băng', '🌫️'], 51: ['Mưa phùn nhẹ', '🌦️'],
  53: ['Mưa phùn', '🌦️'], 55: ['Mưa phùn dày', '🌧️'], 56: ['Mưa phùn lạnh nhẹ', '🌧️'],
  57: ['Mưa phùn lạnh', '🌧️'], 61: ['Mưa nhẹ', '🌦️'], 63: ['Mưa vừa', '🌧️'], 65: ['Mưa to', '🌧️'],
  66: ['Mưa lạnh nhẹ', '🌧️'], 67: ['Mưa lạnh to', '🌧️'], 71: ['Tuyết nhẹ', '🌨️'], 73: ['Tuyết vừa', '🌨️'],
  75: ['Tuyết dày', '❄️'], 77: ['Mưa tuyết', '🌨️'], 80: ['Mưa rào nhẹ', '🌦️'], 81: ['Mưa rào', '🌧️'],
  82: ['Mưa rào lớn', '⛈️'], 85: ['Tuyết rào nhẹ', '🌨️'], 86: ['Tuyết rào dày', '❄️'],
  95: ['Dông', '⛈️'], 96: ['Dông, mưa đá nhẹ', '⛈️'], 99: ['Dông, mưa đá', '⛈️'],
};

function weatherFor(code) {
  return WEATHER[code] || ['Thời tiết thay đổi', '🌤️'];
}

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
}

function formatDate(date, options) {
  return new Intl.DateTimeFormat('vi-VN', options).format(new Date(`${date}T12:00:00`));
}

function App() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');
  const [unit, setUnit] = useState('C');
  const [query, setQuery] = useState('');
  const [retry, setRetry] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tro-viet-favorites') || '[]'); }
    catch { return []; }
  });

  const cities = useMemo(() => {
    const search = normalize(query.trim());
    return CITIES.filter((city) => !search || normalize(city.name).includes(search));
  }, [query]);

  useEffect(() => {
    try { localStorage.setItem('tro-viet-favorites', JSON.stringify(favorites)); }
    catch { /* Favorites still work until this page is closed. */ }
  }, [favorites]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadWeather() {
      setStatus('loading');
      setWeather(null);
      const params = new URLSearchParams({
        latitude: selectedCity.lat,
        longitude: selectedCity.lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'Asia/Ho_Chi_Minh',
        forecast_days: '7',
      });
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Không thể tải thời tiết.');
        const data = await response.json();
        if (!data.current || !data.daily) throw new Error('Dữ liệu thời tiết không đầy đủ.');
        setWeather(data);
        setStatus('success');
      } catch (error) {
        if (error.name !== 'AbortError') setStatus('error');
      }
    }
    loadWeather();
    return () => controller.abort();
  }, [selectedCity, retry]);

  const toDisplayTemp = (value) => Math.round(unit === 'C' ? value : (value * 9) / 5 + 32);
  const toggleFavorite = (name) => setFavorites((current) => (
    current.includes(name) ? current.filter((city) => city !== name) : [...current, name]
  ));
  const current = weather?.current;
  const [description, icon] = current ? weatherFor(current.weather_code) : ['', ''];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home"><span className="brand-icon">☀️</span>Weather</a>
        <h2 className="sidebar-title">Thành phố</h2>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm thành phố" aria-label="Tìm thành phố" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm">×</button>}
        </label>

        <div className="city-list" aria-label="Danh sách thành phố">
          {cities.map((city) => {
            const selected = city.name === selectedCity.name;
            const favorite = favorites.includes(city.name);
            return (
              <div className={`city-row ${selected ? 'selected' : ''}`} key={city.name}>
                <button className="city-select" type="button" onClick={() => setSelectedCity(city)} aria-pressed={selected}>
                  <span className="city-name">{city.name}</span>
                  {selected && <span className="selected-check" aria-label="Đang chọn">✓</span>}
                </button>
                <button className={`favorite-button ${favorite ? 'active' : ''}`} type="button" onClick={() => toggleFavorite(city.name)} aria-label={`${favorite ? 'Bỏ yêu thích' : 'Yêu thích'} ${city.name}`} aria-pressed={favorite}>
                  {favorite ? '★' : '☆'}
                </button>
              </div>
            );
          })}
          {cities.length === 0 && <p className="empty-search">Không tìm thấy thành phố.</p>}
        </div>
      </aside>

      <section className="main-content" id="home">
        <header className="topbar">
          <span className="topbar-title">Thời tiết</span>
          <div className="unit-toggle" role="group" aria-label="Đơn vị nhiệt độ">
            <button className={unit === 'C' ? 'active' : ''} type="button" onClick={() => setUnit('C')} aria-pressed={unit === 'C'}>°C</button>
            <button className={unit === 'F' ? 'active' : ''} type="button" onClick={() => setUnit('F')} aria-pressed={unit === 'F'}>°F</button>
          </div>
        </header>

        {status === 'loading' && <Loading city={selectedCity.name} />}
        {status === 'error' && (
          <div className="message-card" role="alert">
            <h1>Không tải được thời tiết</h1>
            <p>Kiểm tra kết nối mạng rồi thử lại.</p>
            <button className="retry-button" type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button>
          </div>
        )}

        {status === 'success' && weather && (
          <>
            <section className="weather-card" aria-label={`Thời tiết hiện tại tại ${selectedCity.name}`}>
              <div className="weather-heading">
                <div>
                  <h1>{selectedCity.name}</h1>
                  <p>{formatDate(current.time.slice(0, 10), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <span className="weather-icon" role="img" aria-label={description}>{icon}</span>
              </div>
              <div className="current-weather">
                <span className="current-temp">{toDisplayTemp(current.temperature_2m)}°{unit}</span>
                <span className="current-description">{description}</span>
              </div>
            </section>

            <section className="weather-details" aria-label="Thông tin thời tiết">
              <div className="detail-card"><span>Độ ẩm</span><strong>{current.relative_humidity_2m}%</strong></div>
              <div className="detail-card"><span>Tốc độ gió</span><strong>{Math.round(current.wind_speed_10m)} <small>km/h</small></strong></div>
              <div className="detail-card"><span>Cập nhật lúc</span><strong>{current.time.slice(11, 16)}</strong></div>
            </section>

            <section className="forecast-section">
              <h2>Dự báo 7 ngày</h2>
              <div className="forecast-grid">
                {weather.daily.time.map((date, index) => {
                  const [label, forecastIcon] = weatherFor(weather.daily.weather_code[index]);
                  const high = toDisplayTemp(weather.daily.temperature_2m_max[index]);
                  const low = toDisplayTemp(weather.daily.temperature_2m_min[index]);
                  return (
                    <article className="forecast-day" key={date} aria-label={`${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}: ${label}, cao nhất ${high} độ, thấp nhất ${low} độ`}>
                      <span className="forecast-weekday">{index === 0 ? 'Hôm nay' : formatDate(date, { weekday: 'short' })}</span>
                      <span className="forecast-date">{formatDate(date, { day: 'numeric', month: 'numeric' })}</span>
                      <span className="forecast-icon" role="img" aria-label={label}>{forecastIcon}</span>
                      <span className="forecast-condition">{label}</span>
                      <span className="forecast-temperatures"><strong>{high}°</strong><span>{low}°</span></span>
                    </article>
                  );
                })}
              </div>
            </section>

            <footer className="page-footer">Dữ liệu thời tiết: Open-Meteo</footer>
          </>
        )}
      </section>
    </main>
  );
}

function Loading({ city }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-box"><span className="spinner" />Đang tải thời tiết {city}...</div>
    </div>
  );
}

export default App;
