const testErrorMessage =
  "BOO! You triggered a testing error! If you're seeing this in production please report it.";
const longTestErrorMessage =
  `${testErrorMessage} This is going to be a really long one so buckle up! WOWWWWWWW`.repeat(30);

export function getTestingError() {
  return new Error(testErrorMessage);
}

export function getTestingErrorLong() {
  return new Error(longTestErrorMessage);
}
