import HttpError from './HttpError';
import { stringify } from 'query-string';

export interface Options extends RequestInit {
  user?: {
    authenticated?: boolean;
    token?: string;
  };
}

export const createHeadersFromOptions = (options: Options): Headers => {
  const requestHeaders = (options.headers ||
    new Headers({
      Accept: 'application/json',
    })) as Headers;
  const hasBody = options && options.body;
  const isContentTypeSet = requestHeaders.has('Content-Type');
  const isGetMethod = !options?.method || options?.method === 'GET';
  const isFormData = options?.body instanceof FormData;

  const shouldSetContentType =
    hasBody && !isContentTypeSet && !isGetMethod && !isFormData;
  if (shouldSetContentType) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (options.user && options.user.authenticated && options.user.token) {
    requestHeaders.set('Authorization', options.user.token);
  }

  return requestHeaders;
};

export const fetchJson = (
  url: string | URL | Request,
  options: Options = {}
) => {
  const requestHeaders = createHeadersFromOptions(options);

  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
      }
      if (status < 200 || status >= 300) {
        return Promise.reject(
          new HttpError((json && json.message) || statusText, status, json)
        );
      }
      return Promise.resolve({ status, headers, body, json });
    });
};

export const queryParameters = stringify;

const isValidObject = (value: any) => {
  if (!value) {
    return false;
  }

  const isArray = Array.isArray(value);
  const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(value);
  const isObject = Object.prototype.toString.call(value) === '[object Object]';
  const hasKeys = !!Object.keys(value).length;

  return !isArray && !isBuffer && isObject && hasKeys;
};

export const flattenObject = (value: any, path: string[] = []): any => {
  if (isValidObject(value)) {
    return Object.assign(
      {},
      ...Object.keys(value).map(key =>
        flattenObject(value[key], path.concat([key]))
      )
    );
  } else {
    return path.length ? { [path.join('.')]: value } : value;
  }
};
