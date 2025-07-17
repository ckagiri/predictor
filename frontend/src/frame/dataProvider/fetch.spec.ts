import expect from 'expect';
import { queryParameters } from './fetch';

describe('queryParameters', () => {
  it('should generate a query parameter', () => {
    const data = { foo: 'bar' };
    expect(queryParameters(data)).toEqual('foo=bar');
  });
});
