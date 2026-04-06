function buildValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function parseDate(value, fieldName) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw buildValidationError(`${fieldName} must be a valid date`);
  }
  return parsedDate;
}

function parsePositiveInteger(value, fieldName) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw buildValidationError(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

module.exports = {buildValidationError,parseDate,parsePositiveInteger};
