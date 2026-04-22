/**
 * Response sukses dengan data dan pagination opsional
 * @param {string} message 
 * @param {any} data 
 * @param {object|null} pagination 
 */
const success = (message, data = null, pagination = null) => {
  const response = {
    status: 'success',
    message,
  };
  if (data !== null) response.data = data;
  if (pagination !== null) response.pagination = pagination;
  return response;
};

/**
 * Response error dengan detail errors opsional
 * @param {string} message 
 * @param {any} errors 
 */
const error = (message, errors = null) => {
  const response = {
    status: 'error',
    message,
  };
  if (errors !== null) response.errors = errors;
  return response;
};

module.exports = { success, error };