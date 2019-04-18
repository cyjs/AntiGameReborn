// src/helpers/profile.js
import App from './app';

export const createProfileFromGuard = (guard) => {
  const { page, component = '', cp = null } = guard.url.query;

  let seed = {
    universe: createUniverseFromUrl(guard.url),
    app: {
      page: (page === 'standalone' ? component : page).toLowerCase(),
    }
  };

  // if planet is changed while on fleet2 or fleet3, user lands on fleet1 page even though url shows page=fleet2/3
  if (seed.app.page.indexOf('fleet') > -1 && cp) {
    seed.app.page = 'fleet1';
  }

  return new Profile(seed);
};

const createUniverseFromUrl = ({ protocol, hostname, pathname }) => {
  let domainParts = hostname.split(".");
  let serverParts = (domainParts[0] || "").split("-");

  return {
    lang: (serverParts[1] || "EN").toUpperCase(),
    number: parseInt(serverParts[0].replace('s', '')),
    domain: hostname,
    url: protocol + '//' + hostname,
    path: protocol + '//' + hostname + pathname + '?page=',
  };
};

export default class Profile {
  constructor({ universe, app } = {}) {
    this.universe = universe;
    this.app = new App(app, this.universe);
  }

}
