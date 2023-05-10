export const validateDomainName = (rawText: string) => {
  const REGEX = new RegExp(
    /([a-z0-9A-Z]\.)*[a-z0-9-]+\.([a-z0-9]{2,24})+(\.co\.([a-z0-9]{2,24})|\.([a-z0-9]{2,24}))*/g,
  );

  return REGEX.test(rawText);
};

export const validateURL = (rawText: string) => {
  const REGEX = new RegExp(
    /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
  );

  return REGEX.test(rawText);
};

export const isJSONString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
};
