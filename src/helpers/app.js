// src/helpers/app.js

export default class App {
  constructor({ page }, universe) {
    this.page = page;
    this.universe = universe;

    this.mode = universe.number ? 3 : 2;
  }

  get keyCom() {
    return 'AGO_' + this.universe.lang; // AGO_DE
  }

  get keyUni() {
    return this.keyCom + "_" + this.universe.abbr;  // AGO_DE_UNI148
  }

  get title() {
    return this.universe.lang + ' ' + this.universe.number;
  }
}
