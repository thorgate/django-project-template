const ipAddressRegex = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;

export const isValidIpAddress = (value) => ipAddressRegex.test(value);
