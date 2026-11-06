export const apiRequest = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  const request = { ...options, headers, credentials: 'same-origin' };

  if (
    request.body &&
    !(request.body instanceof FormData) &&
    typeof request.body !== 'string'
  ) {
    headers.set('Content-Type', 'application/json');
    request.body = JSON.stringify(request.body);
  }

  const response = await fetch(url, request);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }

  return data;
};
