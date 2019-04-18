// src/helpers/guard.js
import parse from 'url-parse';

import { createProfileFromGuard } from './profile';

const acceptance = (location) => (location &&
  location.href &&
  location.href.match(/https:\/\/.+\.ogame.gameforge.com\/game\/index\.php\?+.*page=*/i)
);

export default class Guard {
  constructor(rawUrl) {
    if (!acceptance(rawUrl)) {
      throw new Error('Not a valid url');
    }

    this.url = parse(rawUrl, true);
  }

  createProfile() {
    return createProfileFromGuard(this);
  }
}
