'use strict';

const SECRET_KEYS = ['password', 'apiKey', 'apikey', 'authorization', 'token', 'secret'];

function shouldMask(key) {
  return SECRET_KEYS.some((secretKey) => key.toLowerCase().includes(secretKey));
}

function maskObject(value) {
  if (Array.isArray(value)) {
    return value.map(maskObject);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      shouldMask(key) ? '***MASKED***' : maskObject(entryValue)
    ])
  );
}

module.exports = {
  maskObject
};
