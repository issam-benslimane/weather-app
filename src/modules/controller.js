import { pipe } from "../helpers/fp-helpers";

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
    const currentPosition = await getCurrentLocationCoords();
    view.bind("search", showForecast);
    pipe(model.getForecastByCoords, view.updateView)(currentPosition);
    model.getForecastByCoords(currentPosition).then(view.updateView);
  }

  const showForecast = async (val) => {
    view.setLoader(true);
    model
      .getForecastByCity(val)
      .then(view.updateView)
      .catch(view.displayError)
      .finally(() => {
        view.setLoader();
        view.resetSearch();
      });
  };

  init();
}
