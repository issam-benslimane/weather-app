import { curry, pipe, prop, reverseArgs } from "../helpers/fp-helpers";
import { format } from "date-fns";

const API_KEY = "ad1e458b65a19d068c1fe95fd0b5b9c5";
const tempUnits = {
  metric: "°C",
  standard: "°K",
};
const formatTemp = pipe(curry(reverseArgs(prop), 2)(tempUnits), curry(addUnit));
const formatPressure = curry(addUnit)("hPa");
const formatSpeed = curry(addUnit)("Km/h");
const formatHumidity = curry(addUnit)("%");
const formatDate = curry(formatDateTime)("eeee, do MMM yy");
const formatTime = curry(formatDateTime)("p");

async function fetchCoordsByCity(location) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`
  );
  const {
    name: city,
    coord: { lat, lon },
  } = await response.json();
  return { city, lat, lon };
}

async function fetchCityByCoords({ lat, lon }) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  const { name: city } = await response.json();
  return city;
}

async function fetchForecast(unit, { city, lat, lon }) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=${unit}&appid=${API_KEY}`
  );
  const data = await response.json();
  return { city, ...data };
}

async function processData(unit, data) {
  const {
    timezone,
    city,
    current: {
      temp,
      feels_like,
      pressure,
      humidity,
      wind_speed,
      weather: [{ description, icon }],
    },
  } = data;

  return {
    timezone,
    description,
    icon,
    city,
    temp: pipe(Math.round, formatTemp(unit))(temp),
    feels: pipe(Math.round, formatTemp(unit))(feels_like),
    pressure: formatPressure(pressure),
    humidity: formatHumidity(humidity),
    wind: formatSpeed(wind_speed),
    day: formatDate(timezone),
    time: formatTime(timezone),
  };
}

function addUnit(unit, val) {
  return `${val} ${unit}`;
}

function formatDateTime(pattern, timezone) {
  let options = {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const formatter = new Intl.DateTimeFormat([], options).format(new Date());
  return format(new Date(formatter), pattern);
}

export default function model(currentLocation, unit = "metric") {
  const setLocation = async (location) =>
    (currentLocation =
      typeof location === "object"
        ? await fetchCityByCoords(location)
        : location);

  const getForecast = () =>
    [
      fetchCoordsByCity,
      curry(fetchForecast)(unit),
      curry(processData)(unit),
    ].reduce(
      async (cum, fc) => fc(await cum),
      Promise.resolve(currentLocation)
    );

  const getLocation = () => currentLocation;

  const getUnit = () => ({ unit, symbol: tempUnits[unit] });

  const changeUnit = () => {
    unit === "metric" ? (unit = "standard") : (unit = "metric");
    return tempUnits[unit];
  };

  return { getForecast, getLocation, setLocation, getUnit, changeUnit };
}
