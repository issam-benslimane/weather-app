export function uniqueId() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export function toUpper(str) {
  return str.toUpperCase();
}

export function toLower(str) {
  return str.toLowerCase();
}

export function listify(el) {
  return Array.isArray(el) ? el : [el];
}

export function stripPrefix(reg, el) {
  return el.replace(reg, "");
}

export function matchWord(reg, el) {
  const [word] = el.match(reg);
  return word;
}
