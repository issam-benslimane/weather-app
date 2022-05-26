import { pipe, prop, curry } from "../helpers/fp-helpers";

function getCurrentLocationCoords() {
  return new Promise((res, rej) => {
    function success(pos) {
      const { latitude: lat, longitude: lon } = pos.coords;
      res({ lat, lon });
    }
    function error(err) {
      rej(err);
    }

    navigator.geolocation.getCurrentPosition(success, error);
  });
}

export default function controller(model, view) {
  async function init() {
    view.bind("search", showForecast);
    view.bind("units", changeUnit);

    const currentPosition = await getCurrentLocationCoords();
    view.setPageLoader();
    await fetchForecast(currentPosition);
    view.setPageLoader();
    view.setUnitBtn(model.getUnit().symbol);
  }

  const showForecast = async (val) => {
    view.setSearchLoader();
    await fetchForecast(val, view.displayError);
    view.setSearchLoader();
    view.resetSearch();
  };

  const changeUnit = async () => {
    const currentLocation = model.getLocation();
    model.changeUnit();
    await fetchForecast(currentLocation);
    pipe(model.getUnit, curry(prop)("symbol"), view.setUnitBtn)();
  };

  async function fetchForecast(location, error) {
    return model
      .setLocation(location)
      .then(model.getForecast)
      .then(view.updateView)
      .catch(error);
  }

  init();
}
