// src/helpers/delay.js

export const waitFor = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
