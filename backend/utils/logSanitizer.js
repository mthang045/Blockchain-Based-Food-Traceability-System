const PRIVATE_KEY_PATTERN = /0x[a-fA-F0-9]{64}/g;

const maskPrivateKey = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(PRIVATE_KEY_PATTERN, (matched) => {
    if (matched.length <= 14) {
      return '[REDACTED_PRIVATE_KEY]';
    }

    return `${matched.slice(0, 6)}...${matched.slice(-4)}`;
  });
};

const sanitizeForLog = (input) => {
  if (input == null) {
    return input;
  }

  if (typeof input === 'string') {
    return maskPrivateKey(input);
  }

  if (input instanceof Error) {
    return {
      name: input.name,
      message: maskPrivateKey(input.message || ''),
      stack: maskPrivateKey(input.stack || '')
    };
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeForLog(item));
  }

  if (typeof input === 'object') {
    const result = {};

    Object.entries(input).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();

      if (lowerKey.includes('privatekey') || lowerKey.includes('private_key') || lowerKey.includes('x-user-private-key')) {
        result[key] = '[REDACTED_PRIVATE_KEY]';
      } else {
        result[key] = sanitizeForLog(value);
      }
    });

    return result;
  }

  return input;
};

module.exports = {
  sanitizeForLog,
  maskPrivateKey
};
