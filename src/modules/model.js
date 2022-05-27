import { curry, pipe, prop, reverseArgs } from "../helpers/fp-helpers";
import { format, addDays, addHours } from "date-fns";

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
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=${unit}&appid=${API_KEY}`
  );
  const data = await response.json();
  return { city, unit, ...data };
}

function processData(data) {
  const { city, unit } = data;
  return [
    processBasicForecast,
    processDailyForecast,
    processHourlyForecast,
  ].reduce((obj, fc) => ({ ...obj, ...fc(data) }), { unit, city });
}

function processBasicForecast(data) {
  const {
    timezone,
    unit,
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
    temp: pipe(Math.round, formatTemp(unit))(temp),
    feels: pipe(Math.round, formatTemp(unit))(feels_like),
    pressure: formatPressure(pressure),
    humidity: formatHumidity(humidity),
    wind: formatSpeed(wind_speed),
    day: formatDate(timezone),
    time: formatTime(timezone),
  };
}

function processDailyForecast(data) {
  const { daily, unit } = data;
  const filteredData = daily.map((e, i) => {
    const {
      temp: { min, max },
      weather: [{ icon }],
    } = e;

    return {
      icon,
      day: getDayOfTheWeek(i),
      min: pipe(Math.round, formatTemp(unit))(min),
      max: pipe(Math.round, formatTemp(unit))(max),
    };
  });
  return { daily: filteredData };
}

function processHourlyForecast(data) {
  const { hourly, unit, timezone } = data;
  const filteredData = hourly.map((e, i) => {
    const {
      temp,
      weather: [{ icon }],
    } = e;

    return {
      icon,
      hour: getHour(timezone, i),
      temp: pipe(Math.round, formatTemp(unit))(temp),
    };
  });
  return { hourly: filteredData };
}

function addUnit(unit, val) {
  return `${val} ${unit}`;
}

function getTimeByZone(timezone) {
  let options = {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return new Intl.DateTimeFormat([], options).format(new Date());
}

function formatDateTime(pattern, timezone) {
  const formatter = getTimeByZone(timezone);
  return format(new Date(formatter), pattern);
}

function getDayOfTheWeek(amount) {
  const date = addDays(new Date(), amount);
  return amount ? format(date, "eeee") : "Today";
}

function getHour(timezone, amount) {
  const formatter = getTimeByZone(timezone);
  const date = addHours(new Date(formatter), amount);
  return format(date, "h aaa");
}

export default function model(currentLocation, unit = "metric") {
  const setLocation = async (location) =>
    (currentLocation =
      typeof location === "object"
        ? await fetchCityByCoords(location)
        : location);

  const getForecast = () =>
    [fetchCoordsByCity, curry(fetchForecast)(unit), processData].reduce(
      async (cum, fc) => fc(await cum),
      Promise.resolve(currentLocation)
    );

  const getLocation = () => currentLocation;

  const getUnit = () => ({ unit, symbol: tempUnits[unit] });

  const changeUnit = () =>
    unit === "metric" ? (unit = "standard") : (unit = "metric");

  return { getForecast, getLocation, setLocation, getUnit, changeUnit };
}
