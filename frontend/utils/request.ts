export class ResponseError extends Error {
  public response: Response;

  constructor(response: Response) {
    super(response.statusText);
    this.response = response;
  }
}

function parseJSON(response) {
  return response.json();
}

function checkStatus(response): Response {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  throw new ResponseError(response);
}

export default function request(
  url: string,
  options?: RequestInit,
): Promise<{} | { err: ResponseError }> {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data)
    .catch(err => err);
}
