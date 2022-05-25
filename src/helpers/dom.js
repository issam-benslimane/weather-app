import {
  curry,
  each,
  flatMap,
  partial,
  pipe,
  prop,
  spreadArgs,
} from "./fp-helpers";
import { listify } from "./utils";

export function createElement(type, { attr = [], children = [], content }) {
  const el = document.createElement(type);
  each(spreadArgs(partial(setAttr, el)))(attr);
  each((c) => appendDOMChild(el, c()))(children);
  content && setDOMElement(el, content);
  return el;
}

export function qs(selector, el = document) {
  return el.querySelector(selector);
}

export function qsa(selector, el = document) {
  return el.querySelectorAll(selector);
}

export function isTextNode(el) {
  return el.nodeType == 3;
}

export function getParent(el) {
  return el.parentElement;
}

export function getAttr(attr, el) {
  return el.getAttribute(attr);
}

export function setAttr(el, attr, val) {
  el.setAttribute(attr, val);
  return el;
}

export function addClass(el, name) {
  el.classList.add(name);
}

export function removeClass(el, name) {
  el.classList.remove(name);
}

export function deleteAttr(el, attr) {
  el.removeAttribute(attr);
}

export function setDOMElement(el, val) {
  el.innerHTML = val;
  return el;
}

export function removeDOMElement(parent, child) {
  parent.removeChild(child);
  return parent;
}

export function appendDOMChild(parent, child) {
  parent.appendChild(child);
  return parent;
}

export const getDOMChildren = pipe(
  listify,
  flatMap(pipe(curry(prop)("children"), Array.from))
);

export const removeChildren = (el) =>
  pipe(getDOMChildren, each(curry(removeDOMElement)(el)))(el);

export function on(target, type, callback) {
  target.addEventListener(type, callback);
}

export function delegate(target, selector, type, handler) {
  on(target, type, dispatchEvent);
  function dispatchEvent(ev) {
    const eventTarget = ev.target.closest(selector);
    if (!eventTarget) return;
    handler(eventTarget);
  }
}
