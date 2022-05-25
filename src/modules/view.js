import {
  qsa,
  qs,
  getAttr,
  setDOMElement,
  on,
  addClass,
  removeClass,
  getParent,
  setAttr,
} from "../helpers/dom";
import {
  curry,
  filterOut,
  flatMap,
  pipe,
  reverseArgs,
  spreadArgs,
  zip,
} from "../helpers/fp-helpers";
import { stripPrefix } from "../helpers/utils";

const changeUnitsBtn = qs("[data-action]");
const searchInput = qs("input");
const errorText = qs(".error");
const loader = qs(".loader");
const forecast = [...qsa(".forecast")];
const getClass = curry(getAttr)("class");

function updateView(data) {
  console.log(data);
  removeClass(errorText, "show");
  const items = getChildrenToUpdate(data);
  const orderedData = items.map(
    pipe(getClass, curry(stripPrefix)(/\bforecast__/), (key) => data[key])
  );
  zip(items, orderedData).forEach(spreadArgs(setDOMElement));
}

function getChildrenToUpdate(data) {
  const items = flatMap((el) => [...qsa(`[class^="forecast__"]`, el)])(
    forecast
  );
  return filterOut(
    pipe(
      getClass,
      curry(stripPrefix)(/\bforecast__/),
      (key) => data[key] == null
    )
  )(items);
}

function displayError(err) {
  addClass(errorText, "show");
}

function setLoader(isLoading = false) {
  const parent = getParent(loader);
  isLoading
    ? addClass(parent, "loader-active")
    : removeClass(parent, "loader-active");
}

function resetSearch() {
  searchInput.value = null;
}

function handleSearch(action, ev) {
  if (ev.key !== "Enter" || !this.value) return;
  action(this.value);
}

function bind(type, handler) {
  if (type == "search") {
    on(searchInput, "keydown", handleSearch.bind(searchInput, handler));
  }
  if (type == "units") {
    on(changeUnitsBtn, "click", handler);
  }
}

export default function view() {
  return { updateView, bind, displayError, setLoader, resetSearch };
}
