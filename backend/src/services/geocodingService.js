const https = require('https');

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_USER_AGENT = process.env.GEOCODING_USER_AGENT || 'HostelConnect/1.0';

const requestJson = (url, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => new Promise((resolve, reject) => {
  const req = https.get(url, { headers }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Geocoding request failed (${res.statusCode})`));
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });

  req.on('error', reject);
  req.setTimeout(timeoutMs, () => {
    req.destroy(new Error('Geocoding request timed out'));
  });
});

const buildQuery = ({ street, city, county, university, country = 'Kenya' }) => {
  const parts = [
    street,
    university,
    city,
    county,
    country
  ].filter(Boolean);

  return parts.join(', ');
};

const normalizeCoordinates = (latitude, longitude) => {
  const latValue = Number(latitude);
  const lngValue = Number(longitude);

  if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) return null;
  if (latValue < -90 || latValue > 90) return null;
  if (lngValue < -180 || lngValue > 180) return null;

  return { latitude: latValue, longitude: lngValue };
};

const geocodeWithNominatim = async (query, timeoutMs) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const data = await requestJson(url, { 'User-Agent': DEFAULT_USER_AGENT, 'Accept-Language': 'en' }, timeoutMs);

  if (!Array.isArray(data) || data.length === 0) return null;

  return normalizeCoordinates(data[0].lat, data[0].lon);
};

const geocodeWithMapbox = async (query, timeoutMs) => {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MAPBOX_ACCESS_TOKEN is required for Mapbox geocoding');
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${encodeURIComponent(token)}`;
  const data = await requestJson(url, { 'User-Agent': DEFAULT_USER_AGENT }, timeoutMs);

  const feature = data?.features?.[0];
  if (!feature?.center || feature.center.length < 2) return null;

  const [longitude, latitude] = feature.center;
  return normalizeCoordinates(latitude, longitude);
};

const geocodeWithGoogle = async (query, timeoutMs) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_MAPS_API_KEY is required for Google geocoding');
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`;
  const data = await requestJson(url, { 'User-Agent': DEFAULT_USER_AGENT }, timeoutMs);

  const location = data?.results?.[0]?.geometry?.location;
  if (!location) return null;

  return normalizeCoordinates(location.lat, location.lng);
};

const geocodeAddress = async ({ street, city, county, university, country } = {}) => {
  const query = buildQuery({ street, city, county, university, country });
  if (!query) return null;

  const provider = (process.env.GEOCODING_PROVIDER || 'nominatim').toLowerCase();
  const timeoutMs = Number(process.env.GEOCODING_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  if (provider === 'google') {
    return geocodeWithGoogle(query, timeoutMs);
  }

  if (provider === 'mapbox') {
    return geocodeWithMapbox(query, timeoutMs);
  }

  return geocodeWithNominatim(query, timeoutMs);
};

module.exports = {
  geocodeAddress
};
