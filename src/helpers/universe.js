// src/helpers/universe.js

export default class Universe {
  constructor({ lang, number = null }) {
    this.lang = lang;
    this.number = number;
  }

  get abbr() {
    return 'UNI' + this.number;
  }
}
