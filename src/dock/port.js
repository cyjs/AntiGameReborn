// src/dock/port.js

import Guard from '../helpers/guard';

export default class Port {
  constructor() {
    this.status = 0;
  }

  inaugrate() {
    try {
      let guard = new Guard(document.location);

      this.log('docked', guard.createProfile());
      
    } catch (e) {
      this.log(e);
    }
  }

  log(...items) {
    window.console.log(...items);
  }
}