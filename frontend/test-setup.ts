// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';

// Ignore warnings about act()
// See https://github.com/testing-library/react-testing-library/issues/281,
// https://github.com/facebook/react/issues/14769
import { jest } from '@jest/globals';
const originalError = console.error;
jest.spyOn(console, 'error').mockImplementation((...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
});

/**
 * Mock fetch objects Response, Request and Headers
 */
import { Response, Headers, Request } from 'whatwg-fetch';

global.Response = Response as any;
global.Headers = Headers as any;
global.Request = Request as any;

/** Mock scrollTo as it is not supported by JSDOM */
global.scrollTo = jest.fn();
